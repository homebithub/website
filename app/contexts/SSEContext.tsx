import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { API_BASE_URL } from '~/config/api';
import { useAuth } from '~/contexts/useAuth';
import { isLocalGatewayUrl } from '~/services/grpc/client';
import { getAccessTokenFromCookies } from '~/utils/cookie';

export type SSEEventHandler = (event: any) => void;

interface SSEContextValue {
  isConnected: boolean;
  subscribe: (eventType: string, handler: SSEEventHandler) => () => void;
  reconnect: () => void;
  connectionUptime: number;
  hasActiveConnection: () => boolean;
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
  const eventSourceRef = useRef<EventSource | null>(null);
  const listenersRef = useRef<Map<string, Set<SSEEventHandler>>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const connectionStartTimeRef = useRef<number>(0);
  const uptimeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasConnectedRef = useRef(false);
  const consecutiveErrorCountRef = useRef(0);
  const disabledDueToErrorsRef = useRef(false);
  
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000;

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
    if (disabledDueToErrorsRef.current) {
      return;
    }

    const currentUserId = (user as any)?.user?.id || (user as any)?.id;
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
    const url = token 
      ? `${API_BASE_URL}/api/v1/notifications/stream?token=${encodeURIComponent(token)}`
      : `${API_BASE_URL}/api/v1/notifications/stream`;

    const es = new EventSource(url, { withCredentials: true });
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      connectionStartTimeRef.current = Date.now();
      hasConnectedRef.current = true;
      consecutiveErrorCountRef.current = 0;
      
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

    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        const eventType = payload.event_type;
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
      consecutiveErrorCountRef.current += 1;

      // Clear uptime tracking
      if (uptimeIntervalRef.current) {
        clearInterval(uptimeIntervalRef.current);
        uptimeIntervalRef.current = null;
      }
      connectionStartTimeRef.current = 0;
      setConnectionUptime(0);

      if (!suppressLocalRetry && consecutiveErrorCountRef.current >= 3) {
        disabledDueToErrorsRef.current = true;
        if (!suppressLocalRetry) {
          console.warn('[SSE] Disabled SSE retries after repeated errors');
        }
        return;
      }

      // Attempt reconnection with exponential backoff
      if (!suppressLocalRetry && reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      } else if (!suppressLocalRetry) {
        console.error('[SSE] Max reconnection attempts reached');
      }
    };
	  }, [disconnect, user]);

  const reconnect = useCallback(() => {
    if (disabledDueToErrorsRef.current) {
      return;
    }
    reconnectAttemptsRef.current = 0;
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

  // Reconnect whenever auth state changes so login/logout updates the shared stream.
  useEffect(() => {
    const currentUserId = (user as any)?.user?.id || (user as any)?.id;
    reconnectAttemptsRef.current = 0;
    consecutiveErrorCountRef.current = 0;
    disabledDueToErrorsRef.current = false;

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
