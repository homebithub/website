# Signup Flow Debugging Guide

## 🐛 Issue: Redirecting Back to Signup

**Problem:** After clicking signup, users are being redirected back to the signup page instead of going to verify-otp.

---

## 🔍 What the Backend Returns

### Signup Endpoint Response
```json
{
  "token": "jwt_token_here",
  "user": {
    "user_id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+254712345678",
    "profile_type": "household",
    ...
  },
  "verification": {
    "id": "uuid",
    "user_id": "uuid",
    "type": "phone",
    "status": "pending",
    "target": "+254712345678",
    "expires_at": "2025-10-09T03:00:00Z",
    "next_resend_at": "2025-10-09T02:01:00Z",
    "attempts": 0,
    "max_attempts": 5,
    "resends": 0,
    "max_resends": 3,
    "created_at": "2025-10-09T02:00:00Z",
    "updated_at": "2025-10-09T02:00:00Z"
  }
}
```

---

## 🔧 Debugging Steps Added

### 1. Frontend Logging (signup.tsx)

**Added console logs to track:**
- Full signup response
- Verification data
- Navigation decision

```typescript
console.log('Signup response:', data);
console.log('Verification data:', data.verification);

if (data.verification) {
    console.log('Redirecting to verify-otp with verification:', data.verification);
    navigate('/verify-otp', { state: { ... } });
} else {
    console.error('No verification data in signup response!', data);
}
```

### 2. Verify-OTP Logging (verify-otp.tsx)

**Added console logs to track:**
- Location state received
- Verification object
- Why redirect happens

```typescript
console.log('verify-otp mounted');
console.log('Location state:', locationState);
console.log('Verification:', verification);

if (!verification) {
    console.warn('No verification data - redirecting to signup');
    console.warn('Location state was:', locationState);
}
```

---

## 🧪 How to Debug

### Step 1: Open Browser Console
1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Clear console

### Step 2: Attempt Signup
1. Fill out signup form
2. Click "Sign Up"
3. Watch console output

### Step 3: Check Console Logs

**Expected Output (Success):**
```
Signup response: {token: "...", user: {...}, verification: {...}}
Verification data: {id: "...", user_id: "...", type: "phone", ...}
Redirecting to verify-otp with verification: {...}
verify-otp mounted
Location state: {verification: {...}, profileType: "household"}
Verification: {id: "...", user_id: "...", ...}
```

**Problem Output (Failure):**
```
Signup response: {token: "...", user: {...}, verification: null}
Verification data: null
No verification data in signup response!
```

OR

```
Signup response: {token: "...", user: {...}, verification: {...}}
Verification data: {id: "...", ...}
Redirecting to verify-otp with verification: {...}
verify-otp mounted
Location state: {}
Verification: undefined
No verification data - redirecting to signup
```

---

## 🔍 Possible Issues

### Issue 1: Backend Not Returning Verification
**Symptom:** `data.verification` is `null` or `undefined`

**Cause:**
- Backend failed to create verification record
- Error in `GetByUserIDAndType` call
- OTP service failed

**Check:**
```bash
# Check auth service logs
tail -f auth.log | grep "verification"
```

**Backend Code:**
```go
// In user_handler.go line 190
verification, err := h.verificationService.GetByUserIDAndType(c.Request().Context(), resp.UserID, "phone")
var verificationInfo *types2.VerificationInfoResponse
if err == nil && verification != nil {
    verificationInfo = types2.NewVerificationInfoResponse(verification)
}
```

**Fix:** Check why verification creation is failing

---

### Issue 2: State Not Passed to verify-otp
**Symptom:** Signup logs show verification data, but verify-otp doesn't receive it

**Cause:**
- React Router navigation issue
- State not being passed correctly
- Page refresh between navigation

**Check:**
```typescript
// In signup.tsx
navigate('/verify-otp', { 
    state: { 
        verification: data.verification,  // Make sure this exists
        profileType: form.profile_type 
    } 
});
```

**Fix:** Ensure navigation happens without page reload

---

### Issue 3: Verification Object Structure Mismatch
**Symptom:** Verification exists but has wrong structure

**Expected Structure:**
```typescript
{
  id: string,
  user_id: string,
  type: "phone",
  status: "pending",
  target: "+254712345678",
  expires_at: string,
  next_resend_at: string,
  attempts: number,
  max_attempts: number,
  ...
}
```

**Check:** Compare actual vs expected structure in console

---

## 🛠️ Quick Fixes

### Fix 1: Ensure Backend Creates Verification

Check `auth/src/internal/domain/service/auth_service.go`:

```go
// After creating user, ensure verification is created
verification, err := s.verificationService.SendOTP(ctx, user.ID, user.Phone, "phone")
if err != nil {
    s.logger.Error("Failed to send OTP", zap.Error(err))
    // Don't fail signup, but log it
}
```

### Fix 2: Add Fallback in Frontend

```typescript
if (data.verification) {
    navigate('/verify-otp', { state: { verification: data.verification } });
} else {
    // Fallback: Try to request OTP manually
    console.warn('No verification in signup response, requesting OTP...');
    // Call /api/v1/verifications/send-otp
}
```

### Fix 3: Store Verification in localStorage (Backup)

```typescript
// In signup.tsx
if (data.verification) {
    // Store in localStorage as backup
    localStorage.setItem('pending_verification', JSON.stringify(data.verification));
    navigate('/verify-otp', { state: { verification: data.verification } });
}

// In verify-otp.tsx
const [verification, setVerification] = useState(() => {
    // Try location state first
    if (locationState.verification) return locationState.verification;
    
    // Fallback to localStorage
    const stored = localStorage.getItem('pending_verification');
    if (stored) {
        localStorage.removeItem('pending_verification');
        return JSON.parse(stored);
    }
    
    return null;
});
```

---

## ✅ Testing Checklist

After debugging:

- [ ] Console shows "Signup response" with verification object
- [ ] Console shows "Redirecting to verify-otp"
- [ ] Console shows "verify-otp mounted"
- [ ] Console shows "Verification: {id: ...}"
- [ ] No redirect back to signup
- [ ] OTP input field is visible
- [ ] Phone number is displayed correctly

---

## 📞 Next Steps

1. **Run the app** and attempt signup
2. **Check console logs** for the output
3. **Share the console output** to identify the exact issue
4. **Check backend logs** if verification is null
5. **Verify OTP was sent** to the phone number

The added logging will help us pinpoint exactly where the flow is breaking!
