import { useEffect, useRef, useState, useCallback } from 'react';
import type { WSConnectionState, WSMessage, MessageEvent, WSHookReturn } from '~/types/websocket';

interface UseWebSocketOptions {
  url: string;
  token: string | null;
  onMessage?: (event: MessageEvent) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket(options: UseWebSocketOptions): WSHookReturn {
  const {
    url,
    token,
    onMessage,
    reconnectInterval = 3000,
    maxReconnectAttempts = 10,
  } = options;

  const [connectionState, setConnectionState] = useState<WSConnectionState>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const eventHandlersRef = useRef<Map<string, Set<(event: MessageEvent) => void>>>(new Map());
  const shouldReconnectRef = useRef(true);

  const connect = useCallback(() => {
    if (!token) {
      console.log('[WebSocket] No token available, skipping connection');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      console.log('[WebSocket] Already connected or connecting');
      return;
    }

    try {
      setConnectionState('connecting');
      const wsUrl = `${url}?token=${encodeURIComponent(token)}`;
      console.log('[WebSocket] Connecting to:', url);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WebSocket] Connected');
        setConnectionState('connected');
        reconnectAttemptsRef.current = 0;
        
        // Send ping to keep connection alive
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);

        ws.addEventListener('close', () => {
          clearInterval(pingInterval);
        });
      };

      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          console.log('[WebSocket] Received message:', message.type);

          if (message.type === 'pong') {
            return; // Ignore pong messages
          }

          if (message.data) {
            // Call global onMessage handler
            onMessage?.(message.data);

            // Call type-specific handlers
            const handlers = eventHandlersRef.current.get(message.type);
            if (handlers) {
              handlers.forEach(handler => handler(message.data!));
            }
          }
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        setConnectionState('error');
      };

      ws.onclose = (event) => {
        console.log('[WebSocket] Disconnected:', event.code, event.reason);
        setConnectionState('disconnected');
        wsRef.current = null;

        // Attempt to reconnect
        if (shouldReconnectRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(reconnectInterval * Math.pow(2, reconnectAttemptsRef.current - 1), 30000);
          console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.error('[WebSocket] Max reconnect attempts reached');
        }
      };
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      setConnectionState('error');
    }
  }, [url, token, onMessage, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] Cannot send message, not connected');
    }
  }, []);

  const addEventListener = useCallback((type: string, handler: (event: MessageEvent) => void) => {
    if (!eventHandlersRef.current.has(type)) {
      eventHandlersRef.current.set(type, new Set());
    }
    eventHandlersRef.current.get(type)!.add(handler);

    // Return cleanup function
    return () => {
      const handlers = eventHandlersRef.current.get(type);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          eventHandlersRef.current.delete(type);
        }
      }
    };
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    shouldReconnectRef.current = true;
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connectionState,
    sendMessage,
    addEventListener,
  };
}
