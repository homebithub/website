import { useMemo } from 'react';
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

  const subscriptions = useMemo(
    () =>
      [
        onMessageReceived && { eventType: 'messaging.message.received', handler: onMessageReceived as (event: any) => void },
        onMessageRead && { eventType: 'messaging.message.read', handler: onMessageRead as (event: any) => void },
        onMessageDeleted && { eventType: 'messaging.message.deleted', handler: onMessageDeleted as (event: any) => void },
        onConversationStarted && { eventType: 'messaging.conversation.started', handler: onConversationStarted as (event: any) => void },
        onConversationArchived && { eventType: 'messaging.conversation.archived', handler: onConversationArchived as (event: any) => void },
        onConversationMuted && { eventType: 'messaging.conversation.muted', handler: onConversationMuted as (event: any) => void },
        onConversationMuted && { eventType: 'messaging.conversation.unmuted', handler: onConversationMuted as (event: any) => void },
        onUnreadReminder && { eventType: 'messaging.unread.reminder', handler: onUnreadReminder as (event: any) => void },
      ].filter(Boolean) as Array<{ eventType: string; handler: (event: any) => void }>,
    [
      onConversationArchived,
      onConversationMuted,
      onConversationStarted,
      onMessageDeleted,
      onMessageRead,
      onMessageReceived,
      onUnreadReminder,
    ]
  );

  useSSESubscriptions(subscriptions, subscriptions.length > 0);

  return {
    isConnected,
    reconnect,
  };
}
