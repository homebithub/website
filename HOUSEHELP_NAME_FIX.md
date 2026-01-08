# Househelp Name Display Fix

## Issue

Household users could see the household owner names correctly (e.g., "Nahashon Njoroge"), but househelp names were still showing as the generic "Househelp" label.

## Root Cause

The frontend code was looking for user data in the wrong structure:

**Incorrect**:
```typescript
const user = profileData?.data?.User || profileData?.user;
const firstName = (user?.first_name || househelp?.first_name || "").trim();
```

The backend response structure after adding `.Preload("User")` is:
```json
{
  "id": "profile-uuid",
  "user_id": "user-uuid",
  "user": {
    "first_name": "John",
    "last_name": "Smith"
  },
  "avatar_url": "...",
  "bio": "..."
}
```

The code was checking for `profileData?.data?.User` (nested in a `data` wrapper) when the actual structure is `profileData?.user` (direct property).

## Solution

Updated the extraction logic to match the actual backend response structure:

**File**: `/Users/seannjenga/Projects/microservices/Homebit/website/app/routes/inbox.tsx`

**Before**:
```typescript
const househelp = profileData?.data?.Househelp || profileData;
const user = profileData?.data?.User || profileData?.user;
const firstName = (user?.first_name || househelp?.first_name || "").trim();
const lastName = (user?.last_name || househelp?.last_name || "").trim();
const fullName = `${firstName} ${lastName}`.trim() || "Househelp";
```

**After**:
```typescript
// Extract househelp name from the preloaded user object
const user = profileData?.user;
const firstName = (user?.first_name || user?.FirstName || "").trim();
const lastName = (user?.last_name || user?.LastName || "").trim();
const fullName = firstName ? `${firstName} ${lastName}`.trim() : "Househelp";
```

## Changes Made

1. **Removed incorrect nested data structure check** - No more `profileData?.data?.User`
2. **Direct access to user object** - Now uses `profileData?.user`
3. **Consistent with household implementation** - Same pattern as household owner name extraction
4. **Proper fallback** - Only shows "Househelp" if first name is missing

## Result

### Before
```
Conversations (Household View)
├─ Househelp (12 hours ago)
├─ Househelp (2 days ago)
└─ Househelp (1 week ago)
```

### After
```
Conversations (Household View)
├─ John Smith (12 hours ago)
├─ Mary Wanjiku (2 days ago)
└─ Peter Kamau (1 week ago)
```

## Backend Response Structure

### Househelp Profile API Response

**Endpoint**: `GET /api/v1/househelps/:user_id`

**Response**:
```json
{
  "id": "82bad545-247f-4cf3-bd72-1f29610eb528",
  "user_id": "714891da-2e43-4a2f-a6bd-bae187b1ec56",
  "user": {
    "id": "714891da-2e43-4a2f-a6bd-bae187b1ec56",
    "first_name": "John",
    "last_name": "Smith",
    "email": "john@example.com",
    "phone": "+254712345678",
    "profile_type": "househelp"
  },
  "gender": "male",
  "years_of_experience": 5,
  "skills": ["Cooking", "Cleaning", "Childcare"],
  "avatar_url": "https://...",
  "bio": "Experienced househelp...",
  "status": "active"
}
```

**Key Field**: `user` object contains `first_name` and `last_name`

## Testing

1. **Login as household user**
2. **Open inbox**
3. **Verify conversation list** shows actual househelp names
4. **Check chat header** displays correct name when conversation is open
5. **Test with multiple househelp conversations** to ensure all names display correctly

## Related Files

- **Backend**: `househelp_repository.go` - Added `.Preload("User")`
- **Frontend**: `inbox.tsx` - Fixed name extraction logic
- **Documentation**: `INBOX_ENDPOINTS_REFERENCE.md` - Complete endpoint reference

## Consistency

Both household and househelp name extraction now use the same pattern:

**Household (for househelp users)**:
```typescript
const owner = profileData?.owner;
const firstName = (owner?.first_name || owner?.FirstName || "").trim();
const lastName = (owner?.last_name || owner?.LastName || "").trim();
const name = firstName ? `${firstName} ${lastName}`.trim() : "Household";
```

**Househelp (for household users)**:
```typescript
const user = profileData?.user;
const firstName = (user?.first_name || user?.FirstName || "").trim();
const lastName = (user?.last_name || user?.LastName || "").trim();
const fullName = firstName ? `${firstName} ${lastName}`.trim() : "Househelp";
```

## Summary

✅ Household names display correctly (e.g., "Nahashon Njoroge")  
✅ Househelp names now display correctly (e.g., "John Smith")  
✅ Consistent implementation for both profile types  
✅ Single API call per conversation  
✅ Efficient database queries with preloaded data  

**No backend restart needed** - This was a frontend-only fix. Just refresh the inbox to see househelp names!
