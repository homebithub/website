export interface ConversationBadgeRecord {
  id?: string | number | null;
  conversation_id?: string | number | null;
  conversationId?: string | number | null;
  unread_count?: string | number | null;
  unreadCount?: string | number | null;
}

/** Accept every envelope used by the notifications gRPC and compatibility APIs. */
export function extractConversationRows(raw: unknown): ConversationBadgeRecord[] {
  const root = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const data = root.data && typeof root.data === 'object' ? root.data as Record<string, unknown> : {};
  const nestedData = data.data && typeof data.data === 'object' ? data.data as Record<string, unknown> : {};
  const candidates = [
    root.conversations,
    data.conversations,
    nestedData.conversations,
    data.data,
    root.data,
    raw,
  ];
  const rows = candidates.find(Array.isArray);
  return Array.isArray(rows) ? rows : [];
}

export function conversationBadgeId(record: ConversationBadgeRecord): string {
  return String(record?.id ?? record?.conversation_id ?? record?.conversationId ?? '').trim();
}

export function isConversationUnread(record: ConversationBadgeRecord): boolean {
  const value = Number(record?.unread_count ?? record?.unreadCount ?? 0);
  return Number.isFinite(value) && value > 0;
}
