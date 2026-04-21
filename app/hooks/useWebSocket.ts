import { useEffect, useRef, useState, useCallback } from 'react';
import type { WSConnectionState, WSMessage, MessageEvent, WSHookReturn } from '~/types/websocket';
import { isLocalGatewayUrl } from '~/services/grpc/client';

interface UseWebSocketOptions {
  url: string;
  token: string | null;
  enabled?: boolean;
  onMessage?: (event: MessageEvent) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket(options: UseWebSocketOptions): WSHookReturn {
  const {
    url,
    token,
    enabled = true,
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
  const hasConnectedRef = useRef(false);

  const connect = useCallback(() => {
    if (!enabled) {
      setConnectionState('disconnected');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      setConnectionState('connecting');
      const wsUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionState('connected');
        reconnectAttemptsRef.current = 0;
        hasConnectedRef.current = true;
        
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
          const inboxEvent = JSON.parse(event.data);

          if (inboxEvent.type === 'pong') {
            return; // Ignore pong messages
          }

          // The backend sends InboxEvent with structure: { type, conversation_id, message, user_id, timestamp }
          // We need to pass the entire event to handlers so they can access the message field
          
          // Call global onMessage handler with the entire event
          onMessage?.(inboxEvent);

          // Call type-specific handlers with the entire event
          const handlers = eventHandlersRef.current.get(inboxEvent.type);
          if (handlers) {
            handlers.forEach(handler => {
              try {
                handler(inboxEvent);
              } catch (err) {
                console.error('[WebSocket] Handler error:', err);
              }
            });
          }
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      };

      ws.onerror = (error) => {
        if (!(isLocalGatewayUrl(url) && !hasConnectedRef.current)) {
          console.error('[WebSocket] Error:', error);
        }
        setConnectionState('error');
      };

      ws.onclose = (event) => {
        setConnectionState('disconnected');
        wsRef.current = null;
        const suppressLocalRetry = isLocalGatewayUrl(url) && !hasConnectedRef.current;

        // Attempt to reconnect
        if (!suppressLocalRetry && shouldReconnectRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(reconnectInterval * Math.pow(2, reconnectAttemptsRef.current - 1), 30000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (!suppressLocalRetry && reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.error('[WebSocket] Max reconnect attempts reached');
        }
      };
    } catch (error) {
      if (!(isLocalGatewayUrl(url) && !hasConnectedRef.current)) {
        console.error('[WebSocket] Connection error:', error);
      }
      setConnectionState('error');
    }
  }, [enabled, maxReconnectAttempts, onMessage, reconnectInterval, token, url]);

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
    hasConnectedRef.current = false;
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, enabled]);

  return {
    connectionState,
    sendMessage,
    addEventListener,
  };
}
