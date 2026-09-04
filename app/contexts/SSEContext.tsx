import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { API_BASE_URL } from '~/config/api';
import { useAuth } from '~/contexts/useAuth';
import { isLocalGatewayUrl } from '~/services/grpc/client';
import { getAccessTokenFromCookies } from '~/utils/cookie';
import { getStoredUserId } from '~/utils/authStorage';

export type SSEEventHandler = (event: any) => void;

/** Event type the gateway uses to say a reconnect could not be resumed cleanly. */
export const SSE_HISTORY_GAP_EVENT = 'stream.history_gap';

interface SSEContextValue {
  isConnected: boolean;
  subscribe: (eventType: string, handler: SSEEventHandler) => () => void;
  reconnect: () => void;
  connectionUptime: number;
  hasActiveConnection: () => boolean;
  /**
   * Increments whenever the server could not resume the stream from where this
   * client left off, so what it holds may be missing events.
   *
   * Watch it to refetch. Nothing else reveals the gap: the stream reconnects
   * and resumes normally, and the events that were missed simply never arrive.
   */
  historyGapCount: number;
}

const SSEContext = createContext<SSEContextValue | null>(null);

export function useSSEContext() {
  const context = useContext(SSEContext);
  if (!context) {
    throw new Error('useSSEContext must be used within SSEProvider');
  }
  return context;
}

export function useSSEContextSafe() {
  return useContext(SSEContext);
}

interface SSEProviderProps {
  children: React.ReactNode;
}

export function SSEProvider({ children }: SSEProviderProps) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionUptime, setConnectionUptime] = useState(0);
  const [historyGapCount, setHistoryGapCount] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const listenersRef = useRef<Map<string, Set<SSEEventHandler>>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const connectionStartTimeRef = useRef<number>(0);
  const uptimeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasConnectedRef = useRef(false);
  // Lets scheduleReconnect reach the latest connect without the two callbacks
  // depending on one another.
  const connectRef = useRef<() => void>(() => {});
  // So exhausting the budget is reported once, not on every subsequent error.
  const exhaustedLoggedRef = useRef(false);
  const lastEventIdRef = useRef('');

  const baseReconnectDelay = 1000;

  const isOffline = () => typeof navigator !== 'undefined' && navigator.onLine === false;

  const clearPendingReconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  /**
   * Schedule the next attempt.
   *
   * There is deliberately no terminal state. Previously three consecutive
   * errors set a flag that made connect() return early forever — even the
   * public reconnect() honoured it — so one bad tunnel left a signed-in user
   * silently receiving nothing until they reloaded the page.
   */
  const scheduleReconnect = useCallback((suppress: boolean) => {
    if (suppress) return;

    // A retry cannot succeed with no network, and spending the budget during
    // the outage leaves nothing for when connectivity returns. Stay dormant;
    // the online listener resumes us.
    if (isOffline()) return;

    reconnectAttemptsRef.current++;
    const backoff = Math.min(baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1), 30000);
    // Jitter so many tabs recovering from one outage do not retry in lockstep.
    const delay = Math.round(backoff * (0.5 + Math.random() * 0.5));

    clearPendingReconnect();
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectTimeoutRef.current = null;
      connectRef.current();
    }, delay);
  }, []);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (uptimeIntervalRef.current) {
      clearInterval(uptimeIntervalRef.current);
      uptimeIntervalRef.current = null;
    }
    connectionStartTimeRef.current = 0;
    setIsConnected(false);
    setConnectionUptime(0);
  }, []);

  const dispatchMessage = useCallback((eventType: string | undefined, payload: any) => {
    if (!eventType) return;
    const handlers = listenersRef.current.get(eventType);
    if (handlers && handlers.size > 0) {
      handlers.forEach(handler => {
        try {
          handler(payload);
        } catch (err) {
          console.error(`[SSE] Error in handler for ${eventType}:`, err);
        }
      });
    }
  }, []);

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;

    const authUser = (user as any)?.user ?? user;
    const currentUserId = authUser?.user_id || authUser?.id || getStoredUserId();
    if (!currentUserId) {
      disconnect();
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const token = getAccessTokenFromCookies() || localStorage.getItem('token') || null;
    const baseUrl = token
      ? `${API_BASE_URL}/api/v1/notifications/stream?token=${encodeURIComponent(token)}`
      : `${API_BASE_URL}/api/v1/notifications/stream`;
    const cursorSeparator = baseUrl.includes('?') ? '&' : '?';
    const url = lastEventIdRef.current
      ? `${baseUrl}${cursorSeparator}last_event_id=${encodeURIComponent(lastEventIdRef.current)}`
      : baseUrl;

    const es = new EventSource(url, { withCredentials: true });
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      connectionStartTimeRef.current = Date.now();
      hasConnectedRef.current = true;
      exhaustedLoggedRef.current = false;
      
      // Start uptime tracking
      if (uptimeIntervalRef.current) {
        clearInterval(uptimeIntervalRef.current);
      }
      uptimeIntervalRef.current = setInterval(() => {
        if (connectionStartTimeRef.current > 0) {
          const uptime = Math.floor((Date.now() - connectionStartTimeRef.current) / 1000);
          setConnectionUptime(uptime);
        }
      }, 1000);
    };

    // onmessage, not addEventListener per type. An EventSource only routes a
    // frame to a named listener when the frame carries an "event:" field, so
    // the gateway deliberately omits it and every event arrives here to be
    // dispatched on the event_type inside the payload.
    es.onmessage = (ev) => {
      try {
        if (ev.lastEventId) lastEventIdRef.current = ev.lastEventId;
        const payload = JSON.parse(ev.data);
        const eventType = payload.event_type;

        if (eventType === SSE_HISTORY_GAP_EVENT) {
          // The server could not resume from our cursor, so anything that
          // happened while we were away is lost to this connection. Surface it
          // rather than carrying on as if the state were complete.
          console.warn('[SSE] Reconnected with a gap in history:', payload.data);
          setHistoryGapCount((count) => count + 1);
          // A gap means deltas are no longer sufficient. Existing consumers
          // already use these events to force authoritative snapshots.
          window.dispatchEvent(new Event('inbox-updated'));
          window.dispatchEvent(new Event('hiring-updated'));
          window.dispatchEvent(new Event('notifications-updated'));
          window.dispatchEvent(new CustomEvent('homebit:subscription-changed'));
        }

        dispatchMessage(eventType, payload);
      } catch (err) {
        console.error('[SSE] Failed to parse event:', err);
      }
    };

    es.onerror = (err) => {
      const suppressLocalRetry = isLocalGatewayUrl(API_BASE_URL) && !hasConnectedRef.current;
      if (!suppressLocalRetry) {
        console.error('[SSE] Connection error:', err);
      }
      setIsConnected(false);
      es.close();
      eventSourceRef.current = null;

      // Clear uptime tracking
      if (uptimeIntervalRef.current) {
        clearInterval(uptimeIntervalRef.current);
        uptimeIntervalRef.current = null;
      }
      connectionStartTimeRef.current = 0;
      setConnectionUptime(0);

      scheduleReconnect(suppressLocalRetry);
    };
  }, [disconnect, scheduleReconnect, user]);

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    exhaustedLoggedRef.current = false;
    clearPendingReconnect();
    connect();
  }, [connect]);

  const subscribe = useCallback((eventType: string, handler: SSEEventHandler) => {
    if (!listenersRef.current.has(eventType)) {
      listenersRef.current.set(eventType, new Set());
    }
    
    listenersRef.current.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = listenersRef.current.get(eventType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          listenersRef.current.delete(eventType);
        }
      }
    };
  }, []);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  /**
   * Recover from an outage.
   *
   * Coming back online, or returning to a tab whose stream died while the
   * machine slept, is fresh evidence that a retry may now succeed. Reset the
   * budget and reconnect at once rather than waiting out a backoff — or, before
   * this, never retrying again.
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const resume = () => {
      if (eventSourceRef.current?.readyState === EventSource.OPEN) return;

      const authUser = (user as any)?.user ?? user;
      const currentUserId = authUser?.user_id || authUser?.id || getStoredUserId();
      if (!currentUserId) return;

      reconnectAttemptsRef.current = 0;
      exhaustedLoggedRef.current = false;
      clearPendingReconnect();
      connectRef.current();
    };

    const handleOnline = () => resume();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') resume();
    };

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user]);

  // Reconnect whenever auth state changes so login/logout updates the shared stream.
  useEffect(() => {
    const authUser = (user as any)?.user ?? user;
    const currentUserId = authUser?.user_id || authUser?.id || getStoredUserId();
    reconnectAttemptsRef.current = 0;
    exhaustedLoggedRef.current = false;

    if (currentUserId) {
      hasConnectedRef.current = false;
      connect();
    } else {
      hasConnectedRef.current = false;
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const debugInjector = (payload: any) => {
      if (!payload || typeof payload !== 'object') {
        console.warn('[SSE] Debug injector received invalid payload');
        return;
      }
      const eventType = payload.event_type ?? payload.eventType;
      if (!eventType) {
        console.warn('[SSE] Debug injector payload missing event_type');
        return;
      }
      dispatchMessage(eventType, payload);
    };

    (window as any).__HOME_BIT_SSE_DEBUG__ = debugInjector;

    return () => {
      if ((window as any).__HOME_BIT_SSE_DEBUG__ === debugInjector) {
        delete (window as any).__HOME_BIT_SSE_DEBUG__;
      }
    };
  }, [dispatchMessage]);

  const value: SSEContextValue = {
    isConnected,
    subscribe,
    reconnect,
    connectionUptime,
    hasActiveConnection: () => isConnected && !!eventSourceRef.current,
    historyGapCount,
  };

  return <SSEContext.Provider value={value}>{children}</SSEContext.Provider>;
}

export default SSEProvider;

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    __HOME_BIT_SSE_DEBUG__?: (payload: any) => void;
  }
}
