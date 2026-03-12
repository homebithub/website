import { useCallback } from 'react';
import { useSSEContext } from '~/contexts/SSEContext';
import { useSSESubscriptions } from '~/hooks/useSSESubscription';

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

/**
 * Refactored useInboxSSE hook using centralized SSE connection
 * This replaces the old hook that created its own EventSource
 */
export function useInboxSSE(
  onMessageReceived?: InboxSSEHandler,
  onMessageRead?: InboxSSEHandler,
  onMessageDeleted?: InboxSSEHandler,
  onConversationStarted?: InboxSSEHandler,
  onConversationArchived?: InboxSSEHandler,
  onConversationMuted?: InboxSSEHandler,
  onUnreadReminder?: InboxSSEHandler
) {
  const { isConnected, reconnect } = useSSEContext();

  // Subscribe to all inbox-related events using centralized connection
  useSSESubscriptions([
    {
      eventType: 'messaging.message.received',
      handler: useCallback((event: any) => onMessageReceived?.(event), [onMessageReceived])
    },
    {
      eventType: 'messaging.message.read',
      handler: useCallback((event: any) => onMessageRead?.(event), [onMessageRead])
    },
    {
      eventType: 'messaging.message.deleted',
      handler: useCallback((event: any) => onMessageDeleted?.(event), [onMessageDeleted])
    },
    {
      eventType: 'messaging.conversation.started',
      handler: useCallback((event: any) => onConversationStarted?.(event), [onConversationStarted])
    },
    {
      eventType: 'messaging.conversation.archived',
      handler: useCallback((event: any) => onConversationArchived?.(event), [onConversationArchived])
    },
    {
      eventType: 'messaging.conversation.muted',
      handler: useCallback((event: any) => onConversationMuted?.(event), [onConversationMuted])
    },
    {
      eventType: 'messaging.conversation.unmuted',
      handler: useCallback((event: any) => onConversationMuted?.(event), [onConversationMuted])
    },
    {
      eventType: 'messaging.unread.reminder',
      handler: useCallback((event: any) => onUnreadReminder?.(event), [onUnreadReminder])
    }
  ]);

  return {
    isConnected,
    reconnect
  };
}
