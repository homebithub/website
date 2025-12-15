// WebSocket message types
export const WSEventNewMessage = 'new_message';
export const WSEventMessageRead = 'message_read';
export const WSEventMessageEdited = 'message_edited';
export const WSEventMessageDeleted = 'message_deleted';
export const WSEventReactionAdded = 'reaction_added';
export const WSEventReactionRemoved = 'reaction_removed';
export const WSEventTyping = 'typing';
export const WSEventPing = 'ping';
export const WSEventPong = 'pong';

export interface EventMeta {
  reader_id?: string;
  emoji?: string;
  is_added?: boolean;
  edited_at?: string;
  deleted_at?: string;
}

export interface MessageEvent {
  type: string;
  conversation_id: string;
  message?: any;
  user_id: string;
  timestamp: string;
  metadata?: EventMeta;
}

export interface WSMessage {
  type: string;
  data?: MessageEvent;
}

export type WSConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface WSHookReturn {
  connectionState: WSConnectionState;
  sendMessage: (message: any) => void;
  addEventListener: (type: string, handler: (event: MessageEvent) => void) => () => void;
}
