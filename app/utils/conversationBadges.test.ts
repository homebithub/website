import { describe, expect, it } from 'vitest';
import { conversationBadgeId, extractConversationRows, isConversationUnread } from './conversationBadges';

describe('conversation badge helpers', () => {
  it('reads the notifications gRPC conversations envelope', () => {
    const rows = extractConversationRows({ conversations: [{ id: 'conversation-1', unread_count: 2 }] });
    expect(rows).toHaveLength(1);
    expect(conversationBadgeId(rows[0])).toBe('conversation-1');
    expect(isConversationUnread(rows[0])).toBe(true);
  });

  it('keeps compatibility with nested and camel-case responses', () => {
    const rows = extractConversationRows({ data: { conversations: [{ conversationId: 7, unreadCount: '1' }] } });
    expect(conversationBadgeId(rows[0])).toBe('7');
    expect(isConversationUnread(rows[0])).toBe(true);
  });

  it('does not badge conversations with no unread messages', () => {
    expect(isConversationUnread({ id: 'conversation-1', unread_count: 0 })).toBe(false);
  });
});
