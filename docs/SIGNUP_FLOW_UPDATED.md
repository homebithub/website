# Updated Signup Flow - With OTP Verification

## 🔄 New User Journey for Household Users

### Previous Flow (Old)
```
Signup → /household/setup (directly)
```

### New Flow (Updated)
```
Signup → Verify Phone OTP → (Optional: Verify Email) → /household/setup
```

---

## 📋 Step-by-Step Flow

### Step 1: User Signs Up
**Page:** `/signup`

**Actions:**
1. User fills out signup form
2. Selects profile type: "Household"
3. Clicks "Sign Up" button

**Backend Response:**
```json
{
  "user": {
    "user_id": "...",
    "profile_type": "household",
    "phone": "+254712345678",
    ...
  },
  "verification": {
    "id": "...",
    "type": "phone",
    "target": "+254712345678",
    "max_attempts": 5,
    "next_resend_at": "..."
  }
}
```

**Frontend Action:**
- Stores `user_id` and `profile_type` in localStorage
- Redirects to `/_auth/verify-otp` with verification data in state

---

### Step 2: Verify Phone OTP
**Page:** `/_auth/verify-otp`

**UI Elements:**
- OTP input field (6 digits)
- "Verify OTP" button
- "Resend OTP" button (with cooldown timer)
- "Change phone number" link
- Attempts remaining counter

**User Actions:**
1. Receives OTP via SMS
2. Enters 6-digit OTP
3. Clicks "Verify OTP"

**Backend Call:**
```
POST /api/v1/verifications/verify-otp
{
  "user_id": "...",
  "verification_type": "phone",
  "otp": "123456"
}
```

**Backend Response:**
```json
{
  "token": "jwt_token_here",
  "user_id": "...",
  "profile_type": "household",
  "phone_verified": true,
  ...
}
```

**Frontend Action:**
- Stores `token` in localStorage
- Stores user object in `user_object`
- Checks profile_type
- Redirects to `/household/setup`

---

### Step 3: (Optional) Email Verification
**Note:** Currently not implemented in the flow, but can be added

**Potential Flow:**
1. After phone OTP verification
2. Show "Verify Email" prompt
3. Send email OTP
4. Verify email OTP
5. Then redirect to `/household/setup`

---

### Step 4: Household Setup
**Page:** `/household/setup`

**UI:**
- Join existing household (with invite code)
- OR
- Create new household

**See:** `HouseholdCodePrompt.tsx` component

---

## 🔧 Code Changes Made

### 1. Updated `signup.tsx`

**Before:**
```typescript
// Redirect based on profile type
if (form.profile_type === 'household' || form.profile_type === 'household') {
    navigate('/household/setup');
}
```

**After:**
```typescript
// Redirect to OTP verification with verification data
if (data.verification) {
    navigate('/_auth/verify-otp', { 
        state: { 
            verification: data.verification,
            profileType: form.profile_type 
        } 
    });
}
```

### 2. Updated `verify-otp.tsx`

**Before:**
```typescript
if (parsed.profile_type === 'household' || parsed.profile_type === 'household') {
    setShowProfileModal(true); // Old modal
    return;
}
```

**After:**
```typescript
if (parsed.profile_type === 'household' || parsed.profile_type === 'household') {
    path = '/household/setup'; // New household setup page
}
```

---

## 🎯 Benefits

### Security
✅ Phone number verified before account access  
✅ OTP prevents automated signups  
✅ Rate limiting on OTP attempts  

### User Experience
✅ Clear step-by-step process  
✅ Visual feedback at each step  
✅ Ability to change phone if wrong  
✅ Resend OTP if not received  

### Data Quality
✅ Verified phone numbers  
✅ Reduced fake accounts  
✅ Better user tracking  

---

## 🧪 Testing the Flow

### Test Case 1: Successful Signup
1. Go to `/signup`
2. Fill form with valid data
3. Click "Sign Up"
4. **Expect:** Redirected to `/_auth/verify-otp`
5. Enter OTP from SMS
6. Click "Verify OTP"
7. **Expect:** Redirected to `/household/setup`

### Test Case 2: Wrong OTP
1. Complete signup
2. Enter wrong OTP
3. **Expect:** Error message "Invalid OTP"
4. **Expect:** Attempts counter decrements
5. Try again with correct OTP
6. **Expect:** Success

### Test Case 3: Expired OTP
1. Complete signup
2. Wait for OTP to expire (usually 10 minutes)
3. Try to verify
4. **Expect:** Error "OTP has expired"
5. Click "Resend OTP"
6. **Expect:** New OTP sent

### Test Case 4: Wrong Phone Number
1. Complete signup with wrong phone
2. On OTP page, click "Used the wrong phone number?"
3. Enter correct phone
4. **Expect:** New OTP sent to new number
5. Verify with new OTP
6. **Expect:** Success

---

## 📱 Mobile Considerations

### SMS Delivery
- OTP sent via backend SMS service
- Usually arrives within 30 seconds
- Resend available after cooldown (60 seconds)

### Auto-fill Support
- OTP input supports `inputMode="numeric"`
- Pattern validation: `[0-9]*`
- Some browsers auto-fill from SMS

### Accessibility
- Large OTP input (text-2xl)
- Clear error messages
- Keyboard navigation support
- Screen reader friendly

---

## 🔄 Flow Diagram

```
┌─────────────┐
│   Signup    │
│   /signup   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Backend Creates    │
│  User + Sends OTP   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   Verify Phone OTP  │
│ /_auth/verify-otp   │
│                     │
│ ┌─────────────────┐ │
│ │ Enter 6-digit   │ │
│ │ OTP from SMS    │ │
│ └─────────────────┘ │
│                     │
│ [Verify OTP]        │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Phone Verified ✅  │
│  Token Stored       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Household Setup    │
│ /household/setup    │
│                     │
│ ┌─────────────────┐ │
│ │ Join Existing   │ │
│ │      OR         │ │
│ │ Create New      │ │
│ └─────────────────┘ │
└─────────────────────┘
```

---

## 🎊 Summary

**The signup flow now includes mandatory phone verification before users can access household setup.**

**Flow:**
1. ✅ Signup form
2. ✅ Verify phone OTP
3. ✅ (Optional: Verify email)
4. ✅ Household setup (join or create)

**Status:** ✅ Implemented and ready for testing

**Next Steps:**
1. Test the complete flow
2. Add email verification (optional)
3. Add analytics tracking
4. Monitor OTP delivery rates
