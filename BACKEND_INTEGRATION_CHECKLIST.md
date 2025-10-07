# 🔌 Backend Integration Checklist - Household Signup Flow

## 📊 API Endpoints Required

### ✅ **Step 1: Signup** (`/signup`)

#### **Endpoint 1: User Registration**
```
POST ${API_BASE_URL}/api/v1/auth/register
```

**Request Body:**
```json
{
  "profile_type": "employer",
  "first_name": "John",
  "last_name": "Doe",
  "password": "SecurePass123!",
  "phone": "0712345678"
}
```

**Expected Response:**
```json
{
  "user": {
    "user_id": "uuid-here",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "0712345678",
    "profile_type": "employer",
    "email": null
  },
  "verification": {
    "id": "verification-id",
    "user_id": "uuid-here",
    "type": "phone",
    "status": "pending",
    "target": "0712345678",
    "expires_at": "2025-10-07T23:00:00Z",
    "next_resend_at": "2025-10-07T22:45:00Z",
    "attempts": 0,
    "max_attempts": 3,
    "resends": 0,
    "max_resends": 3,
    "created_at": "2025-10-07T22:40:00Z",
    "updated_at": "2025-10-07T22:40:00Z"
  }
}
```

**⚠️ ISSUE:** Frontend expects a token but currently stores `user_id` instead!

**Fix Needed in signup.tsx (Line 212):**
```typescript
// CURRENT (WRONG):
localStorage.setItem('token', data.user.user_id);

// SHOULD BE:
localStorage.setItem('token', data.token); // If backend returns token
// OR
localStorage.setItem('user_id', data.user.user_id);
localStorage.setItem('token', 'some-jwt-token');
```

---

#### **Endpoint 2: Google OAuth (Optional)**
```
GET ${API_BASE_URL}/google
```

**Flow:**
1. User clicks "Sign in with Google"
2. Redirects to Google OAuth
3. Google redirects back to: `${API_BASE_URL}/auth/google/callback`
4. Backend creates user and returns token
5. Frontend stores token and redirects to profile setup

**Backend Should Return:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "user_id": "uuid",
    "email": "user@gmail.com",
    "first_name": "John",
    "last_name": "Doe",
    "profile_picture": "https://lh3.googleusercontent.com/...",
    "profile_type": "employer",
    "auth_provider": "google"
  }
}
```

---

### ⚠️ **Step 2: Profile Setup** (`/profile-setup/household`)

**Current Status:** ❌ **NO API CALLS MADE**

The profile setup wizard is currently **UI-only** - it doesn't save data to the backend!

**What Needs to Happen:**
Each step component should save data as the user progresses, OR save all data at the end.

**Option A: Save on Each Step**
```typescript
// In each step component (Location, Children, etc.)
const handleSave = async (data) => {
  await fetch(`${API_BASE_URL}/api/v1/profile/employer/me`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
};
```

**Option B: Save All at End**
```typescript
// In household.tsx handleNext() when currentStep === STEPS.length - 1
const handleComplete = async () => {
  const allData = {
    location: stepData.location,
    children: stepData.children,
    // ... all other steps
  };
  
  await fetch(`${API_BASE_URL}/api/v1/profile/employer/me`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(allData)
  });
  
  navigate('/household/profile');
};
```

**Required Endpoint:**
```
PATCH ${API_BASE_URL}/api/v1/profile/employer/me
```

**Request Body (Example):**
```json
{
  "location": {
    "town": "Nairobi",
    "area": "Westlands"
  },
  "children": {
    "has_children": true,
    "number_of_kids": 2,
    "ages": [3, 5]
  },
  "service_type": "live-in",
  "chores": ["cooking", "cleaning", "laundry"],
  "pets": {
    "has_pets": true,
    "pet_types": ["dog"]
  },
  "budget": {
    "min": 20000,
    "max": 30000,
    "frequency": "monthly"
  },
  "religion": "Christian",
  "house_size": "3-bedroom",
  "bio": "We are a family of 4...",
  "photos": ["url1", "url2"]
}
```

---

### ✅ **Step 3: Dashboard** (`/household/profile`)

#### **Endpoint 1: Get Profile**
```
GET ${API_BASE_URL}/api/v1/profile/employer/me
```

**Headers:**
```
Authorization: Bearer {token}
```

**Expected Response:**
```json
{
  "id": "profile-id",
  "user_id": "user-id",
  "address": "Westlands, Nairobi",
  "bio": "We are a family of 4...",
  "house_size": "3-bedroom",
  "number_of_kids": 2,
  "new_borns_under_one": 0,
  "max_househelps": 1,
  "verified": false,
  "created_at": "2025-10-07T22:40:00Z",
  "updated_at": "2025-10-07T22:40:00Z"
}
```

**Status:** ✅ **Already Integrated** (Line 20 in household/profile.tsx)

---

#### **Endpoint 2: Update Profile**
```
PATCH ${API_BASE_URL}/api/v1/profile/employer/me
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "address": "Updated address",
  "bio": "Updated bio"
}
```

**Expected Response:**
```json
{
  "id": "profile-id",
  "user_id": "user-id",
  "address": "Updated address",
  "bio": "Updated bio",
  // ... rest of profile data
}
```

**Status:** ✅ **Already Integrated** (Line 62 in household/profile.tsx)

---

## 🔧 Issues to Fix

### 1. **Token Storage Issue** ⚠️ CRITICAL

**File:** `app/routes/_auth/signup.tsx` (Line 212)

**Current Code:**
```typescript
localStorage.setItem('token', data.user.user_id);
```

**Problem:** Storing `user_id` as token won't work for authentication!

**Solution:** Backend should return a JWT token in the response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

**Updated Code:**
```typescript
localStorage.setItem('token', data.token);
localStorage.setItem('user_id', data.user.user_id);
```

---

### 2. **Profile Setup Data Not Saved** ⚠️ CRITICAL

**File:** `app/routes/profile-setup/household.tsx`

**Problem:** The 10-step wizard doesn't save any data to the backend!

**Solution:** Implement data persistence. Two options:

**Option A: Context/State Management**
```typescript
// Create a context to store all step data
const ProfileSetupContext = createContext();

// In each step component, update context
const { updateStepData } = useProfileSetup();
updateStepData('location', { town: 'Nairobi' });

// On final step, save all data
const handleComplete = async () => {
  await saveProfileData(allStepData);
  navigate('/household/profile');
};
```

**Option B: Save Each Step**
```typescript
// In each step component
const handleNext = async (stepData) => {
  await fetch(`${API_BASE_URL}/api/v1/profile/employer/me`, {
    method: 'PATCH',
    body: JSON.stringify(stepData)
  });
  onNext();
};
```

---

### 3. **Missing Profile Setup Endpoint**

**Required:** Backend needs to accept profile setup data

**Endpoint:**
```
PATCH ${API_BASE_URL}/api/v1/profile/employer/me
```

**Should Accept:**
- Location data
- Children information
- Service preferences
- Chores list
- Pet information
- Budget range
- Religion preferences
- House size
- Bio text
- Photo URLs

---

## 🧪 Testing Checklist

### **Backend Requirements:**

- [ ] **Endpoint 1:** `POST /api/v1/auth/register` working
  - [ ] Accepts: profile_type, first_name, last_name, password, phone
  - [ ] Returns: token, user object
  - [ ] Creates user in database

- [ ] **Endpoint 2:** `GET /api/v1/profile/employer/me` working
  - [ ] Requires: Authorization header with Bearer token
  - [ ] Returns: employer profile data

- [ ] **Endpoint 3:** `PATCH /api/v1/profile/employer/me` working
  - [ ] Requires: Authorization header
  - [ ] Accepts: any profile fields
  - [ ] Updates profile in database
  - [ ] Returns: updated profile

- [ ] **Endpoint 4:** `GET /google` (optional)
  - [ ] Initiates Google OAuth flow
  - [ ] Creates user with Google data
  - [ ] Returns token

---

## 🚀 How to Test

### **1. Start Backend:**
```bash
# In your backend directory
# (Adjust command based on your setup)
npm run dev
# or
python manage.py runserver
# or
go run main.go
```

**Verify it's running:**
```bash
curl http://localhost:8000/health
# or whatever your backend URL is
```

---

### **2. Update Frontend API URL:**

**File:** `app/config/api.ts` (Line 23)

**Current:**
```typescript
return 'https://api.homexpert.co.ke';
```

**For Local Testing:**
```typescript
return 'http://localhost:8000'; // or your backend port
```

**OR set environment variable:**
```bash
# In .env file
API_BASE_URL=http://localhost:8000
```

---

### **3. Start Frontend:**
```bash
npm run dev
```

---

### **4. Test Signup Flow:**

1. Open `http://localhost:5173/signup`
2. Select "Household"
3. Fill form and submit
4. **Check browser console** for API call
5. **Check Network tab** for response
6. **Verify:** Token is stored in localStorage
7. **Verify:** Redirects to `/profile-setup/household`

---

### **5. Test Profile Setup:**

**Current Behavior:** Just UI navigation (no API calls)

**What You'll See:**
- Can navigate through all 10 steps
- Data is NOT saved
- Redirects to `/household/profile` at the end

**To Fix:** Implement data persistence (see Issue #2 above)

---

### **6. Test Dashboard:**

1. Should auto-fetch profile data
2. **Check Network tab** for `GET /api/v1/profile/employer/me`
3. If it fails, check:
   - Is token in localStorage?
   - Is backend running?
   - Is endpoint implemented?

---

## 📝 Summary

### **What's Working:**
✅ Signup form UI
✅ Profile setup wizard UI (10 steps)
✅ Dashboard profile fetch
✅ Dashboard profile update

### **What Needs Backend:**
⚠️ `POST /api/v1/auth/register` - Create user
⚠️ `PATCH /api/v1/profile/employer/me` - Save profile data
⚠️ `GET /api/v1/profile/employer/me` - Get profile data

### **What Needs Frontend Fix:**
🔧 Token storage in signup.tsx
🔧 Profile setup data persistence
🔧 API URL configuration for local testing

---

## 🎯 Quick Start for Testing

1. **Start backend** on `http://localhost:8000`
2. **Update** `app/config/api.ts` line 23 to use `http://localhost:8000`
3. **Implement** these 3 endpoints in backend:
   - POST `/api/v1/auth/register`
   - GET `/api/v1/profile/employer/me`
   - PATCH `/api/v1/profile/employer/me`
4. **Fix** token storage in signup.tsx
5. **Test** the flow!

---

**Ready to test once backend endpoints are implemented!** 🚀
