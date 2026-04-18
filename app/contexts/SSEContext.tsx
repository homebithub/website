import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { API_BASE_URL } from '~/config/api';
import { useAuth } from '~/contexts/useAuth';

export type SSEEventHandler = (event: any) => void;

interface SSEContextValue {
  isConnected: boolean;
  subscribe: (eventType: string, handler: SSEEventHandler) => () => void;
  reconnect: () => void;
  connectionUptime: number;
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

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;

    const currentUserId = (user as any)?.user?.id || (user as any)?.id;
    if (!currentUserId) {
      console.log('[SSE] No authenticated user, skipping connection');
      disconnect();
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    console.log('[SSE] Establishing single EventSource connection...');
    const es = new EventSource(`${API_BASE_URL}/api/v1/notifications/stream`, { withCredentials: true });
    eventSourceRef.current = es;

    es.onopen = () => {
      console.log('[SSE] Connected successfully');
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
      connectionStartTimeRef.current = Date.now();
      
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
        
        console.log('[SSE] Received event:', eventType);

        // Route event to all registered handlers for this event type
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
      } catch (err) {
        console.error('[SSE] Failed to parse event:', err);
      }
    };

    es.onerror = (err) => {
      console.error('[SSE] Connection error:', err);
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

	      // Attempt reconnection with exponential backoff
	      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
        console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      } else {
        console.error('[SSE] Max reconnection attempts reached');
      }
    };
	  }, [disconnect, user]);

  const reconnect = useCallback(() => {
    console.log('[SSE] Manual reconnect triggered');
    reconnectAttemptsRef.current = 0;
    connect();
  }, [connect]);

  const subscribe = useCallback((eventType: string, handler: SSEEventHandler) => {
    console.log(`[SSE] Subscribing to event type: ${eventType}`);
    
    if (!listenersRef.current.has(eventType)) {
      listenersRef.current.set(eventType, new Set());
    }
    
    listenersRef.current.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      console.log(`[SSE] Unsubscribing from event type: ${eventType}`);
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

    if (currentUserId) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      console.log('[SSE] Cleaning up SSE connection');
      disconnect();
    };
  }, [connect, disconnect, user]);

  const value: SSEContextValue = {
    isConnected,
    subscribe,
    reconnect,
    connectionUptime,
  };

  return <SSEContext.Provider value={value}>{children}</SSEContext.Provider>;
}

export default SSEProvider;
