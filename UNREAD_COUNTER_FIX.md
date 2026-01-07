# Unread Message Counter Fix

## Problem

The unread message counter in the conversation list was not updating after reading and replying to messages. The counter would show "2 unread messages" even after opening the conversation and viewing all messages.

## Root Cause

The frontend was not calling the backend's "mark as read" API when opening a conversation. Additionally, when new messages arrived via WebSocket, the unread count wasn't being properly managed based on whether the conversation was active or not.

## Solution

### 1. Mark Conversation as Read When Opening

When a user opens a conversation and loads messages, the frontend now:
1. Loads the messages
2. Calls the mark-as-read API: `POST /api/v1/inbox/conversations/:id/read`
3. Updates the conversation's `unread_count` to `0` in the local state

**Implementation** (`inbox.tsx` lines 374-392):
```typescript
// Mark conversation as read
try {
  const markReadRes = await apiClient.auth(
    `${NOTIFICATIONS_BASE}/notifications/api/v1/inbox/conversations/${encodeURIComponent(conversationId)}/read`,
    {
      method: 'POST',
    }
  );
  if (markReadRes.ok) {
    console.log('[Inbox] Conversation marked as read');
    // Update unread count in conversation list
    setItems((prev) => prev.map((conv) => 
      conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
    ));
  }
} catch (err) {
  console.error('[Inbox] Failed to mark conversation as read:', err);
  // Don't fail the whole operation if marking as read fails
}
```

### 2. Smart Unread Count Updates for WebSocket Messages

When a new message arrives via WebSocket, the unread count is now handled intelligently:
- **If the conversation is active** (user is viewing it): Keep `unread_count` at `0`
- **If the conversation is inactive**: Increment `unread_count` by 1

**Implementation** (`inbox.tsx` lines 754-765):
```typescript
// Update conversation list to show new last message
setItems((prev) => {
  return prev.map((conv) => {
    if (conv.id === msg.conversation_id) {
      // If this is the active conversation, keep unread at 0 (we're viewing it)
      // Otherwise, increment unread count
      const isActive = conv.id === activeConversationId;
      return {
        ...conv,
        last_message_at: msg.created_at,
        unread_count: isActive ? 0 : (conv.unread_count || 0) + 1,
      };
    }
    return conv;
  });
});
```

## How It Works

### Scenario 1: Opening a Conversation
1. User clicks on a conversation with "2 unread messages"
2. Messages load
3. Mark-as-read API is called
4. Backend marks all messages in that conversation as read for the user
5. Frontend updates the conversation's `unread_count` to `0`
6. UI shows "No new messages"

### Scenario 2: Receiving New Messages (Active Conversation)
1. User is viewing Conversation A
2. New message arrives for Conversation A via WebSocket
3. Message is added to the chat
4. `unread_count` stays at `0` (user is viewing it)
5. UI continues to show "No new messages"

### Scenario 3: Receiving New Messages (Inactive Conversation)
1. User is viewing Conversation A
2. New message arrives for Conversation B via WebSocket
3. Conversation B's `unread_count` increments from 0 to 1
4. UI shows "1 unread message" for Conversation B

### Scenario 4: Switching Between Conversations
1. User switches from Conversation A to Conversation B
2. Conversation B had "3 unread messages"
3. Messages load and mark-as-read is called
4. `unread_count` becomes `0`
5. UI updates to show "No new messages"

## Backend API

The backend endpoint `POST /api/v1/inbox/conversations/:id/read` marks all messages in a conversation as read for the authenticated user by setting the `read_at` timestamp.

**Request**:
```
POST /api/v1/inbox/conversations/{conversation_id}/read
Authorization: Bearer {token}
```

**Response**:
```json
{
  "message": "Conversation marked as read"
}
```

## Files Modified

1. `/Users/seannjenga/Projects/microservices/Homebit/website/app/routes/inbox.tsx`
   - Added mark-as-read API call when loading messages
   - Updated unread count to 0 after marking as read
   - Smart unread count management for WebSocket messages

## Testing

### Test 1: Opening Unread Conversation
1. Have someone send you messages
2. See "2 unread messages" in conversation list
3. Click to open the conversation
4. Verify counter changes to "No new messages"

### Test 2: Receiving Messages While Viewing
1. Open a conversation
2. Have someone send you a message
3. Message appears in real-time
4. Verify counter stays at "No new messages"

### Test 3: Receiving Messages in Background
1. Open Conversation A
2. Have someone send you a message in Conversation B
3. Verify Conversation B shows "1 unread message"
4. Click Conversation B
5. Verify counter changes to "No new messages"

### Test 4: Multiple Unread Messages
1. Close the app or switch conversations
2. Have someone send multiple messages
3. Open the app/conversation
4. Verify counter shows correct number
5. Open the conversation
6. Verify counter resets to "No new messages"

## Technical Details

### Unread Count Calculation
- Backend: Counts messages where `read_at IS NULL` for the current user
- Frontend: Displays the count from the conversation object
- Updated when:
  - Loading conversations (from backend)
  - Opening a conversation (set to 0)
  - Receiving new messages (increment if inactive)

### Race Conditions
The implementation handles potential race conditions:
- Mark-as-read is called after messages load (not before)
- If mark-as-read fails, it doesn't break the UI
- WebSocket updates check if conversation is active before updating count

### Performance
- Mark-as-read is only called once per conversation open
- No polling - uses WebSocket for real-time updates
- Unread count updates are optimistic (immediate UI feedback)

## Related Features

This fix works with:
- Real-time messaging via WebSocket
- Message delivery status (sent, delivered, read)
- Conversation list sorting by last message time
- Mobile and desktop views
