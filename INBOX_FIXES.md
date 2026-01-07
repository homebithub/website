# Inbox Fixes - Profile Lookup and Status Ticks

## Issues Fixed

### 1. Profile Lookup Error
**Problem**: Error message "No househelp profile found for that profile_id"
**Root Cause**: Frontend was using `househelp_profile_id` (profile ID) instead of `househelp_id` (user ID) to fetch househelp profiles.

### 2. Missing Status Ticks
**Problem**: Single and double check marks (status ticks) disappeared from sent messages
**Investigation**: Added debug logging to diagnose the issue

## Changes Made

### Profile Lookup Fix

**Before**:
```typescript
const profileId = (conv as any).househelp_profile_id || conv.househelp_id;
const res = await apiClient.auth(`${API_BASE}/api/v1/househelps/${encodeURIComponent(profileId)}/profile_with_user`);
```

**After**:
```typescript
const househelpUserId = conv.househelp_id;
const res = await apiClient.auth(`${API_BASE}/api/v1/househelps/${encodeURIComponent(househelpUserId)}`);
```

**Explanation**:
- The conversation object stores `househelp_id` which is the **user ID**, not the profile ID
- The backend endpoint `/api/v1/househelps/:user_id` expects a user ID, not a profile ID
- The endpoint `GetByUserID` in `househelp_handler.go` fetches the househelp profile by user ID

### Status Ticks Debug

Added logging to diagnose why status ticks aren't showing:

```typescript
if (mine) {
  console.log('[Inbox] Message status:', { 
    id: m.id, 
    mine, 
    status, 
    read_at: m.read_at, 
    _status: m._status, 
    deleted_at: m.deleted_at 
  });
}
```

This will help identify:
- If `mine` is correctly calculated (should be `true` for sent messages)
- If `status` is being determined correctly
- If `deleted_at` is interfering with tick display

## Backend API Endpoints

### Househelp Profile Lookup

**Correct Endpoint**: `GET /api/v1/househelps/:user_id`
- **Parameter**: `user_id` (UUID) - The user's ID, not the profile ID
- **Handler**: `GetByUserID` in `househelp_handler.go`
- **Returns**: Househelp profile with user data

**Response Structure**:
```json
{
  "id": "profile-uuid",
  "user_id": "user-uuid",
  "first_name": "John",
  "last_name": "Smith",
  "avatar_url": "https://...",
  "user": {
    "id": "user-uuid",
    "first_name": "John",
    "last_name": "Smith"
  }
}
```

### Household Profile Lookup

**Endpoint**: `GET /api/v1/profile/household/:user_id`
- **Parameter**: `user_id` (UUID)
- **Returns**: Household profile with owner data

## Status Ticks Implementation

### Tick Types

1. **Sending** (Single grey tick):
   - Status: `_status === 'sending'`
   - Shown while message is being sent to backend

2. **Delivered** (Double grey ticks):
   - Status: `_status === 'sent'` or `_status === 'delivered'`
   - Shown when message is saved in database

3. **Read** (Double gradient ticks):
   - Status: `read_at` is not null
   - Purple-pink gradient (WhatsApp-style)

### Conditions for Display

Ticks are shown when:
```typescript
mine && !m.deleted_at
```

- `mine`: Message was sent by current user
- `!m.deleted_at`: Message is not deleted

### Potential Issues

If ticks aren't showing, check:

1. **`currentUserId` is null**:
   - Check `localStorage.getItem("user_object")`
   - Verify user is logged in
   - Check browser console for errors

2. **`m.sender_id` doesn't match `currentUserId`**:
   - Messages might have wrong sender ID
   - Check backend message creation logic

3. **`m.deleted_at` is set**:
   - Deleted messages don't show ticks
   - Check if messages are being marked as deleted

4. **Status not calculated correctly**:
   - Check if `m._status` or `m.read_at` are undefined
   - Verify backend returns these fields

## Testing

### Profile Lookup Test

1. **Household user viewing househelp**:
   ```
   Open conversation → Check console for API call
   Should see: GET /api/v1/househelps/{user_id}
   Should NOT see: "No househelp profile found for that profile_id"
   ```

2. **Househelp user viewing household**:
   ```
   Open conversation → Check console for API call
   Should see: GET /api/v1/profile/household/{user_id}
   Should display household owner's name
   ```

### Status Ticks Test

1. **Send a message**:
   - Should show single grey tick immediately
   - Should change to double grey ticks when saved
   - Should change to gradient ticks when read

2. **Check console logs**:
   ```
   Look for: [Inbox] Message status: { mine: true, status: 'delivered', ... }
   Verify: mine is true for your messages
   Verify: status is one of: 'sending', 'sent', 'delivered', 'read'
   ```

3. **Inspect DOM**:
   - Open browser DevTools
   - Find your message bubble
   - Check if SVG tick elements exist
   - Verify they're not hidden by CSS

## Files Modified

1. `/Users/seannjenga/Projects/microservices/Homebit/website/app/routes/inbox.tsx`
   - Fixed profile lookup to use `househelp_id` (user ID)
   - Changed API endpoint from `/profile_with_user` to direct user lookup
   - Added debug logging for status ticks

## Next Steps

1. **Test profile lookup**:
   - Open inbox as household user
   - Verify househelp names appear
   - Check console for errors

2. **Debug status ticks**:
   - Send a message
   - Check console logs
   - Verify tick SVGs are in DOM
   - Check if CSS is hiding them

3. **Remove debug logging** (after fix):
   - Once issue is identified and fixed
   - Remove console.log statements
   - Clean up code

## Common Issues

### Profile Not Found
- **Symptom**: "No househelp profile found"
- **Cause**: Using profile_id instead of user_id
- **Fix**: Use `househelp_id` from conversation object

### Ticks Not Visible
- **Symptom**: No check marks on sent messages
- **Cause**: Could be:
  - `mine` is false (currentUserId mismatch)
  - `deleted_at` is set
  - CSS hiding the ticks
  - SVG not rendering
- **Fix**: Check debug logs and DOM inspection

### Wrong Names
- **Symptom**: Shows "Househelp" or "Household" instead of names
- **Cause**: API response structure mismatch
- **Fix**: Check response parsing logic

## Related Documentation

- `INBOX_PARTICIPANT_NAMES.md` - Participant name display
- `READ_STATUS_GRADIENT.md` - Gradient tick implementation
- `UNREAD_COUNTER_FIX.md` - Unread message counter
