# Inbox Improvements - Reply Feature & Mobile Actions

## Issues Fixed

### 1. Reply Feature Not Working
**Problem**: When replying to a message, the reply would send but:
- The replied-to message wasn't shown in the UI
- The `reply_to_id` wasn't being sent to the backend

**Solution**: Updated `handleSend` function to:
- Include `reply_to_id` in the message payload when replying
- Add `reply_to_id` to the optimistic message for immediate UI feedback
- Clear the reply state after sending

**Changes in** `/Users/seannjenga/Projects/microservices/Homebit/website/app/routes/inbox.tsx`:
```typescript
// Before: reply_to_id was not included
body: JSON.stringify({ body })

// After: reply_to_id is included when replying
const payload: { body: string; reply_to_id?: string } = { body };
if (replyToId) {
  payload.reply_to_id = replyToId;
}
body: JSON.stringify(payload)
```

### 2. Message Action Menu Not Accessible on Mobile
**Problem**: The message action menu (3-dot button with reply, react, edit, delete options) was only visible on desktop hover. Mobile users couldn't access these features.

**Solution**: Implemented two mobile-friendly approaches:

#### A. Always-Visible 3-Dot Button on Mobile
- On desktop: Button appears on hover (existing behavior)
- On mobile: Button is always visible

**CSS Change**:
```typescript
// Before: hidden on mobile, visible on desktop hover
className="hidden lg:inline-flex ... opacity-0 group-hover:opacity-100"

// After: always visible on mobile, hover on desktop
className="inline-flex ... lg:opacity-0 lg:group-hover:opacity-100"
```

#### B. Long-Press Support
- Long-press a message on mobile (400ms) → Opens action menu
- On desktop, long-press still selects messages for bulk actions

**Logic**:
```typescript
const startLongPress = useCallback((id: string) => {
  longPressTimerRef.current = window.setTimeout(() => {
    // On mobile: open action menu
    if (window.innerWidth < 1024) {
      setOpenMsgMenuId(id);
    } else {
      // On desktop: select for bulk actions
      setSelectedIds((prev) => new Set(prev).add(id));
    }
  }, 400);
}, []);
```

## User Experience

### Reply Feature
1. Click "Reply" on any message
2. Reply banner appears at bottom showing the original message
3. Type your reply
4. Send → The reply appears with a visual reference to the original message
5. Click the reference to jump to the original message

### Mobile Action Menu
**Option 1: Tap the 3-dot button**
- 3-dot button is always visible on mobile
- Tap to open action menu
- Choose: Reply, React, Edit, Delete

**Option 2: Long-press the message**
- Press and hold a message for ~400ms
- Action menu opens automatically
- Choose your action

### Desktop Action Menu (unchanged)
- Hover over a message
- 3-dot button and quick reactions appear
- Click 3-dot for full menu or click a reaction emoji

## Testing

### Reply Feature
1. Open any conversation
2. Click "Reply" on a message
3. Type a reply and send
4. Verify:
   - Reply shows the original message reference
   - Clicking the reference scrolls to original
   - Reply is properly linked in database

### Mobile Actions
**On Mobile Device or Browser Dev Tools (< 1024px width)**:
1. **Test 3-dot button**:
   - Verify button is always visible
   - Tap to open menu
   - Verify all actions work (Reply, React, Edit, Delete)

2. **Test long-press**:
   - Press and hold a message for ~400ms
   - Verify action menu opens
   - Verify all actions work

**On Desktop (≥ 1024px width)**:
1. Verify 3-dot button appears on hover
2. Verify quick reactions appear on hover
3. Verify long-press selects messages for bulk actions

## Technical Details

### Reply Implementation
- `reply_to_id` is stored in the message record
- Frontend displays a preview of the replied-to message
- Clicking the preview scrolls to and highlights the original message
- Backend validates the `reply_to_id` exists in the same conversation

### Mobile Detection
- Uses `window.innerWidth < 1024` to detect mobile
- Tailwind's `lg:` breakpoint (1024px) for responsive styling
- Long-press timer set to 400ms (WhatsApp-like behavior)

### Accessibility
- All buttons have proper `aria-label` attributes
- Keyboard navigation still works
- Touch events don't interfere with scrolling
- Long-press is cancellable (lift finger before 400ms)

## Files Modified

1. `/Users/seannjenga/Projects/microservices/Homebit/website/app/routes/inbox.tsx`
   - Updated `handleSend` to include `reply_to_id`
   - Modified `startLongPress` to open menu on mobile
   - Changed 3-dot button CSS for mobile visibility
   - Added mobile-specific touch event handling

## Future Enhancements

- Add haptic feedback on long-press (if supported)
- Add visual indicator during long-press countdown
- Consider swipe gestures for quick actions
- Add "Reply" swipe gesture like WhatsApp
