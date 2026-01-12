# Inbox Participant Names Update

## Change

Updated the inbox to display actual participant names instead of generic "Househelp" or "Household" labels.

## Implementation

### Before
- **Conversation list**: "Househelp" or "Household"
- **Chat header**: "Househelp" or "Household"
- **Generic labels**: Not personalized

### After
- **Conversation list**: "John Smith" or "Mary Johnson"
- **Chat header**: "John Smith" or "Mary Johnson"
- **Personalized**: Shows actual names of people you're chatting with

## How It Works

### For Household Users (viewing Househelp)
Already working correctly:
- Fetches househelp profile
- Extracts `first_name` and `last_name` from user data
- Displays full name: "John Smith"

### For Househelp Users (viewing Household)
**Updated logic**:
- Fetches household profile via `/api/v1/profile/household/:user_id`
- Extracts owner's name from `owner.first_name` and `owner.last_name`
- Displays owner's name: "Mary Johnson"
- Falls back to "Household" if owner name is not available

## Code Changes

### Profile Loading Logic

```typescript
} else if (role === "househelp") {
  // Househelp user: other participant is a household
  const householdUserId = conv.household_id;
  if (!householdUserId) continue;
  const res = await apiClient.auth(`${API_BASE}/api/v1/profile/household/${encodeURIComponent(householdUserId)}`);
  if (!res.ok) continue;
  const profileData: any = await apiClient.json(res);
  
  // Extract household owner's name
  const ownerFirstName = profileData?.owner?.first_name || profileData?.owner?.FirstName || "";
  const ownerLastName = profileData?.owner?.last_name || profileData?.owner?.LastName || "";
  const name = ownerFirstName.trim() ? `${ownerFirstName.trim()} ${ownerLastName.trim()}`.trim() : "Household";
  
  const avatar = Array.isArray(profileData?.photos) && profileData.photos.length > 0 ? profileData.photos[0] : undefined;
  updates.push({ id: conv.id, participant_name: name, participant_avatar: avatar });
}
```

## Backend Data Structure

The household profile API returns:
```json
{
  "id": "profile-uuid",
  "user_id": "user-uuid",
  "owner": {
    "id": "user-uuid",
    "first_name": "Mary",
    "last_name": "Johnson",
    "email": "mary@example.com"
  },
  "photos": ["photo1.jpg"],
  "town": "Nairobi",
  ...
}
```

## Display Locations

The participant name is displayed in:

1. **Conversation List**:
   ```
   [M] Mary Johnson         2h
       You: Yes, I'll be there!
   ```

2. **Chat Header**:
   ```
   [Avatar] Mary Johnson
            View profile
   ```

3. **Reply Context**:
   ```
   Replying to Mary Johnson
   "Are you available tomorrow?"
   ```

4. **Message Info**:
   - Shows sender name in message details

## Fallback Behavior

If the owner's name is not available:
- **Household users**: Shows "Househelp" (rare, as househelp profiles require names)
- **Househelp users**: Shows "Household" (fallback if owner data is missing)

## Case Handling

The implementation handles various data formats:
- `owner.first_name` (lowercase)
- `owner.FirstName` (uppercase)
- Trims whitespace
- Handles missing fields gracefully

## Benefits

1. **Personalization**: Users see who they're chatting with
2. **Clarity**: No confusion about which conversation is which
3. **Professional**: More polished and user-friendly
4. **Consistency**: Matches other messaging apps (WhatsApp, Telegram, etc.)

## Testing

### Test Cases

1. **Household viewing Househelp**:
   - ✓ Shows househelp's full name
   - ✓ Avatar displays correctly
   - ✓ Name appears in header and list

2. **Househelp viewing Household**:
   - ✓ Shows household owner's full name
   - ✓ Avatar displays correctly
   - ✓ Name appears in header and list

3. **Missing Data**:
   - ✓ Falls back to "Household" if owner name missing
   - ✓ Falls back to "Househelp" if user name missing

4. **Multiple Conversations**:
   - ✓ Each conversation shows correct participant name
   - ✓ No name conflicts or duplicates

## Files Modified

1. `/Users/seannjenga/Projects/microservices/Homebit/website/app/routes/inbox.tsx`
   - Updated profile loading logic for household participants
   - Extracts owner's name from household profile data
   - Maintains fallback to "Household" if name unavailable

## Related Features

This works with:
- Conversation list display
- Chat header display
- Reply feature (shows participant name)
- Message info modal
- Profile viewing (click on name/avatar)

## Future Enhancements

Potential improvements:
- Cache participant names to reduce API calls
- Show household name if different from owner name
- Display "Owner" or "Member" badge
- Show online/offline status next to name
- Add typing indicator with name
