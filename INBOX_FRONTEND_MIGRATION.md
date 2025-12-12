# Inbox Frontend Migration Guide

## Overview

This guide explains how to migrate the frontend inbox functionality from the auth service to the notifications service.

## Changes Required

### 1. Update API Configuration

The inbox now uses the notifications service instead of auth. Update your environment variables:

**Before:**
```
AUTH_API_BASE_URL=http://localhost:8080
```

**After:**
```
AUTH_API_BASE_URL=http://localhost:8080
NOTIFICATIONS_API_BASE_URL=http://localhost:8081/notifications
```

### 2. Update API Endpoints

**File: `app/config/api.ts`**

Add notifications service configuration:

```typescript
// Get notifications base URL from environment
const getNotificationsBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const envUrl = (window as any).ENV?.NOTIFICATIONS_API_BASE_URL;
    if (envUrl) return envUrl;
  }
  
  if (typeof process !== 'undefined' && process.env.NOTIFICATIONS_API_BASE_URL) {
    return process.env.NOTIFICATIONS_API_BASE_URL;
  }
  
  // Default to production
  return 'https://api.homexpert.co.ke/notifications';
};

export const NOTIFICATIONS_API_BASE_URL = getNotificationsBaseUrl();

// Add to API_ENDPOINTS
export const API_ENDPOINTS = {
  // ... existing endpoints ...
  
  // Inbox endpoints (now using notifications service)
  inbox: {
    conversations: `${NOTIFICATIONS_API_BASE_URL}/api/v1/inbox/conversations`,
    conversationById: (id: string) => `${NOTIFICATIONS_API_BASE_URL}/api/v1/inbox/conversations/${id}`,
    messages: (conversationId: string) => `${NOTIFICATIONS_API_BASE_URL}/api/v1/inbox/conversations/${conversationId}/messages`,
    sendMessage: (conversationId: string) => `${NOTIFICATIONS_API_BASE_URL}/api/v1/inbox/conversations/${conversationId}/messages`,
    editMessage: (messageId: string) => `${NOTIFICATIONS_API_BASE_URL}/api/v1/inbox/messages/${messageId}`,
    deleteMessage: (messageId: string) => `${NOTIFICATIONS_API_BASE_URL}/api/v1/inbox/messages/${messageId}`,
    markAsRead: (conversationId: string) => `${NOTIFICATIONS_API_BASE_URL}/api/v1/inbox/conversations/${conversationId}/read`,
    reactions: (messageId: string) => `${NOTIFICATIONS_API_BASE_URL}/api/v1/inbox/messages/${messageId}/reactions`,
    ws: `${NOTIFICATIONS_API_BASE_URL.replace(/^http/, 'ws')}/api/v1/inbox/ws`,
  },
};
```

### 3. Update Inbox Page

**File: `app/routes/inbox.tsx`**

Update the API_BASE to use notifications service for inbox endpoints:

```typescript
// Change from:
const API_BASE = React.useMemo(() => (typeof window !== 'undefined' && (window as any).ENV?.AUTH_API_BASE_URL) || API_BASE_URL, []);

// To:
const NOTIFICATIONS_BASE = React.useMemo(() => 
  (typeof window !== 'undefined' && (window as any).ENV?.NOTIFICATIONS_API_BASE_URL) || 
  NOTIFICATIONS_API_BASE_URL, 
[]);
```

Update all inbox API calls:

```typescript
// Conversations
const res = await apiClient.auth(`${NOTIFICATIONS_BASE}/api/v1/inbox/conversations?offset=${offset}&limit=${limit}`);

// Messages
const res = await apiClient.auth(`${NOTIFICATIONS_BASE}/api/v1/inbox/conversations/${activeConversationId}/messages?offset=${messagesOffset}&limit=${messagesLimit}`);

// Send message
const res = await apiClient.auth(`${NOTIFICATIONS_BASE}/api/v1/inbox/conversations/${activeConversationId}/messages`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ body, reply_to_id: replyTo?.id }),
});

// Edit message
const res = await apiClient.auth(`${NOTIFICATIONS_BASE}/api/v1/inbox/messages/${editingMessageId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ body: newBody }),
});

// Delete message
const res = await apiClient.auth(`${NOTIFICATIONS_BASE}/api/v1/inbox/messages/${msg.id}`, { 
  method: 'DELETE' 
});

// Mark as read
await apiClient.auth(`${NOTIFICATIONS_BASE}/api/v1/inbox/conversations/${activeConversationId}/read`, {
  method: "POST",
});

// Toggle reaction
const res = await apiClient.auth(`${NOTIFICATIONS_BASE}/api/v1/inbox/messages/${msg.id}/reactions`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ emoji }),
});
```

Update WebSocket URL:

```typescript
const wsUrl = useMemo(() => {
  if (typeof window === 'undefined') return '';
  const base = NOTIFICATIONS_BASE.replace(/^http/, 'ws');
  return `${base}/api/v1/inbox/ws`;
}, [NOTIFICATIONS_BASE]);
```

### 4. Update Environment Files

**Development (`.env.development`):**
```bash
AUTH_API_BASE_URL=http://localhost:8080
NOTIFICATIONS_API_BASE_URL=http://localhost:8081/notifications
```

**Production (`.env.production`):**
```bash
AUTH_API_BASE_URL=https://api.homexpert.co.ke
NOTIFICATIONS_API_BASE_URL=https://api.homexpert.co.ke/notifications
```

### 5. Update Root Configuration

**File: `app/root.tsx`**

Add NOTIFICATIONS_API_BASE_URL to the ENV object:

```typescript
<script
  dangerouslySetInnerHTML={{
    __html: `window.ENV = ${JSON.stringify({
      AUTH_API_BASE_URL: process.env.AUTH_API_BASE_URL,
      NOTIFICATIONS_API_BASE_URL: process.env.NOTIFICATIONS_API_BASE_URL,
    })}`,
  }}
/>
```

### 6. API Response Format Changes

The notifications service returns slightly different response formats:

**Conversations List:**
```json
{
  "conversations": [...],
  "offset": 0,
  "limit": 20
}
```

Update the frontend to handle the wrapper:

```typescript
const payload = await apiClient.json<{ conversations: Conversation[], offset: number, limit: number }>(res);
const data = payload.conversations || [];
```

**Messages List:**
```json
{
  "messages": [...],
  "offset": 0,
  "limit": 50
}
```

Update similarly:

```typescript
const payload = await apiClient.json<{ messages: Message[], offset: number, limit: number }>(res);
const data = payload.messages || [];
```

### 7. Field Name Changes

The notifications service uses slightly different field names:

| Auth Service | Notifications Service |
|--------------|----------------------|
| `household_id` | `household_user_id` |
| `househelp_id` | `househelp_user_id` |

Update type definitions:

```typescript
type Conversation = {
  id: string;
  household_user_id: string;  // Changed from household_id
  househelp_user_id: string;  // Changed from househelp_id
  last_message_at: string;
  unread_count?: number;
  participant_name?: string;
  participant_avatar?: string;
};
```

### 8. WebSocket Event Types

The event types remain the same, but ensure they're properly typed:

```typescript
// Event types (no changes needed)
- new_message
- message_edited
- message_deleted
- message_read
- reaction_added
- reaction_removed
```

## Testing Checklist

- [ ] Conversations list loads correctly
- [ ] Messages load for selected conversation
- [ ] Can send new messages
- [ ] Can edit messages (within 15 minutes)
- [ ] Can delete messages (within 15 minutes)
- [ ] Can add/remove reactions
- [ ] Mark as read works
- [ ] WebSocket connection establishes
- [ ] Real-time updates appear
- [ ] Polling fallback works when WebSocket disconnected
- [ ] Draft persistence works
- [ ] Reply functionality works
- [ ] Scroll to replied message works
- [ ] Unread counts update correctly

## Rollback Plan

If issues arise, you can quickly rollback by:

1. Revert environment variables to use auth service
2. Change `NOTIFICATIONS_BASE` back to `API_BASE`
3. Revert API endpoint URLs

## Migration Steps

1. **Deploy notifications service** with inbox functionality
2. **Update frontend environment variables** (staging first)
3. **Deploy frontend** with updated API calls
4. **Test thoroughly** on staging
5. **Monitor for errors** in production
6. **Keep auth service inbox endpoints** for 1-2 weeks as fallback
7. **Remove auth service inbox code** after successful migration

## Support

For issues or questions:
- Check `INBOX_TESTING_GUIDE.md` for API testing
- Check notifications service logs
- Verify WebSocket connection in browser DevTools
- Check NATS is running and processing events

---

**Status**: Ready for implementation  
**Last Updated**: December 11, 2025
