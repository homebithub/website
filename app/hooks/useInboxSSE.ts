import { useEffect, useRef, useCallback } from 'react';
import { API_BASE_URL } from '~/config/api';
import { getAccessTokenFromCookies } from '~/utils/cookie';

export type InboxSSEEvent = {
  event_type: string;
  data: {
    message_id?: string;
    conversation_id?: string;
    recipient_id?: string;
    sender_id?: string;
    sender_name?: string;
    message_preview?: string;
    body?: string;
    reader_id?: string;
    user_id?: string;
    unread_count?: number;
    sender_names?: string;
    created_at?: string;
    read_at?: string;
    deleted_at?: string;
  };
};

export type InboxSSEHandler = (event: InboxSSEEvent) => void;

export function useInboxSSE(
  onMessageReceived?: InboxSSEHandler,
  onMessageRead?: InboxSSEHandler,
  onMessageDeleted?: InboxSSEHandler,
  onConversationStarted?: InboxSSEHandler,
  onConversationArchived?: InboxSSEHandler,
  onConversationMuted?: InboxSSEHandler,
  onUnreadReminder?: InboxSSEHandler
) {
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // 1 second

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const token = getAccessTokenFromCookies();
    if (!token) {
      console.log('[InboxSSE] No auth token, skipping SSE connection');
      return;
    }

    // Close existing connection
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    console.log('[InboxSSE] Connecting to SSE stream...');
    const es = new EventSource(`${API_BASE_URL}/api/v1/notifications/stream`);
    esRef.current = es;

    es.onopen = () => {
      console.log('[InboxSSE] Connected successfully');
      reconnectAttemptsRef.current = 0;
    };

    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        const eventType = payload.event_type;
        
        console.log('[InboxSSE] Received event:', eventType);

        // Route to appropriate handler based on event type
        switch (eventType) {
          case 'messaging.message.received':
            onMessageReceived?.(payload);
            break;
          case 'messaging.message.read':
            onMessageRead?.(payload);
            break;
          case 'messaging.message.deleted':
            onMessageDeleted?.(payload);
            break;
          case 'messaging.conversation.started':
            onConversationStarted?.(payload);
            break;
          case 'messaging.conversation.archived':
            onConversationArchived?.(payload);
            break;
          case 'messaging.conversation.muted':
          case 'messaging.conversation.unmuted':
            onConversationMuted?.(payload);
            break;
          case 'messaging.unread.reminder':
            onUnreadReminder?.(payload);
            break;
          default:
            // Ignore other event types
            break;
        }
      } catch (err) {
        console.error('[InboxSSE] Failed to parse event:', err);
      }
    };

    es.onerror = (err) => {
      console.error('[InboxSSE] Connection error:', err);
      es.close();
      esRef.current = null;

      // Exponential backoff reconnection
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
        console.log(`[InboxSSE] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      } else {
        console.error('[InboxSSE] Max reconnection attempts reached, giving up');
      }
    };
  }, [
    onMessageReceived,
    onMessageRead,
    onMessageDeleted,
    onConversationStarted,
    onConversationArchived,
    onConversationMuted,
    onUnreadReminder
  ]);

  useEffect(() => {
    connect();

    return () => {
      console.log('[InboxSSE] Cleaning up SSE connection');
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [connect]);

  return {
    isConnected: esRef.current?.readyState === EventSource.OPEN,
    reconnect: connect
  };
}
