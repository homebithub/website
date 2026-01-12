# Household Profile ID Fix

## Problem

The `household_profile_id` column in the `conversations` table was showing `<null>` values, while `househelp_profile_id` had proper values. This meant conversations were missing the household's profile ID, which could cause issues with:
- Displaying household information in the chat
- Properly identifying conversation participants
- Future features that rely on profile IDs

## Root Cause

When household users initiated conversations with househelps, the frontend was only sending `househelp_profile_id` but not `household_profile_id` in the conversation creation payload.

## Solution

Updated all conversation creation points in the frontend to:
1. Fetch the current user's household profile ID when they're a household user
2. Include `household_profile_id` in the conversation creation payload

## Files Modified

### Frontend Changes

1. **`/Users/seannjenga/Projects/microservices/Homebit/website/app/routes/househelp.public-profile.tsx`**
   - Added state to store `currentHouseholdProfileId`
   - Added `useEffect` to fetch household profile ID when user is a household
   - Updated conversation creation payload to include `household_profile_id`

2. **`/Users/seannjenga/Projects/microservices/Homebit/website/app/routes/shortlist.tsx`**
   - Added state to store `currentHouseholdProfileId`
   - Added `useEffect` to fetch household profile ID when user is a household
   - Updated `handleChatWithHousehold` to include `household_profile_id`

3. **`/Users/seannjenga/Projects/microservices/Homebit/website/app/routes/household.shortlist.tsx`**
   - Added state to store `currentHouseholdProfileId`
   - Added `useEffect` to fetch household profile ID
   - Updated `handleChatWithHousehelp` to include `household_profile_id`

4. **`/Users/seannjenga/Projects/microservices/Homebit/website/app/components/AuthenticatedHome.tsx`**
   - Added state to store `currentHouseholdProfileId`
   - Added `useEffect` to fetch household profile ID when user is a household
   - Updated `handleStartChat` to include `household_profile_id`

5. **`/Users/seannjenga/Projects/microservices/Homebit/website/app/components/HousehelpHome.tsx`**
   - Added state to store `currentHouseholdProfileId`
   - Added `useEffect` to fetch household profile ID when user is a household
   - Updated `handleStartChat` to include `household_profile_id`

## Implementation Details

### Fetching Household Profile ID

Each component now includes this pattern:

```typescript
const [currentHouseholdProfileId, setCurrentHouseholdProfileId] = useState<string | null>(null);

useEffect(() => {
  let cancelled = false;

  const fetchHouseholdProfileId = async () => {
    if (currentProfileType?.toLowerCase() === 'household' && currentUserId) {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        
        const res = await fetch(`${API_BASE}/api/v1/profile/household/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setCurrentHouseholdProfileId(data?.id || data?.profile_id || null);
          }
        }
      } catch (err) {
        console.error('Failed to fetch household profile ID:', err);
      }
    }
  };

  fetchHouseholdProfileId();

  return () => {
    cancelled = true;
  };
}, [currentProfileType, currentUserId]);
```

### Including in Conversation Payload

When creating conversations, the payload now includes:

```typescript
const payload: Record<string, any> = {
  household_user_id: householdId,
  househelp_user_id: househelpId,
  househelp_profile_id: targetProfileId,
};

// Include household_profile_id if current user is household
if (profileType === 'household' && currentHouseholdProfileId) {
  payload.household_profile_id = currentHouseholdProfileId;
}
```

## Testing

After deploying these changes:

1. **As a household user**:
   - Start a new conversation with a househelp from any entry point (search, shortlist, profile view, etc.)
   - Check the database: `household_profile_id` should now have a value

2. **Verify existing conversations**:
   - Existing conversations with `null` household_profile_id will remain as-is
   - New conversations will have the proper value

3. **Check all conversation creation points**:
   - From househelp public profile page
   - From shortlist page (both household and househelp views)
   - From household shortlist page
   - From home page cards
   - From search results

## Database Query to Verify

```sql
-- Check recent conversations to see if household_profile_id is being saved
SELECT 
  id,
  household_user_id,
  househelp_user_id,
  household_profile_id,
  househelp_profile_id,
  created_at
FROM conversations
ORDER BY created_at DESC
LIMIT 10;
```

## Notes

- This fix only affects **new conversations** created after the deployment
- Existing conversations with `null` household_profile_id will remain unchanged
- If you need to backfill existing conversations, you'll need to create a migration script
- The backend already supports receiving and storing `household_profile_id`, so no backend changes were needed

## Related Fix

This fix complements the duplicate conversations fix documented in `DUPLICATE_CONVERSATIONS_FIX.md`. Together, they ensure:
1. No duplicate conversations are created (unique constraint + backend handling)
2. All conversation participants are properly identified with their profile IDs
