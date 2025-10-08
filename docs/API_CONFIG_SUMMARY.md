# API Configuration Implementation Summary

## ✅ Completed

Your HomeXpert application now has a centralized API configuration system that makes it easy to switch between development (localhost) and production (api.homexpert.co.ke) environments!

## 🎯 What Was Created

### 1. Core Configuration File
**Location:** `app/config/api.ts`

**Features:**
- ✅ Centralized API endpoint definitions
- ✅ Environment-based URL switching
- ✅ Helper functions for common operations
- ✅ TypeScript type safety
- ✅ Automatic auth header management

### 2. Environment Configuration
**Files Created:**
- `.env.example` - Template for environment variables
- `API_CONFIGURATION_GUIDE.md` - Complete usage guide
- `MIGRATION_EXAMPLE.md` - Migration examples and patterns

### 3. Updated Root Configuration
**File:** `app/root.tsx`
- Added `API_BASE_URL` to environment variables
- Exposed to client-side via `window.ENV`

## 🚀 How to Use

### Quick Start

1. **Set your environment:**
```bash
# Create .env file (already gitignored)
echo "API_BASE_URL=http://localhost:8080" > .env

# For production, use:
# API_BASE_URL=https://api.homexpert.co.ke
```

2. **Import and use in your code:**
```tsx
import { API_ENDPOINTS, apiFetch } from '~/config/api';

// Simple GET request with auth
const response = await apiFetch(API_ENDPOINTS.auth.me);

// POST request with data
const response = await apiFetch(API_ENDPOINTS.profile.househelp.me, {
  method: 'PATCH',
  body: JSON.stringify(data)
});
```

## 📦 Available Endpoints

All endpoints are defined in `API_ENDPOINTS` object:

```tsx
import { API_ENDPOINTS } from '~/config/api';

// Auth
API_ENDPOINTS.auth.me
API_ENDPOINTS.auth.login
API_ENDPOINTS.auth.signup
// ... and more

// Profiles
API_ENDPOINTS.profile.househelp.me
API_ENDPOINTS.profile.househelp.byId(id)
API_ENDPOINTS.profile.employer.me

// Images
API_ENDPOINTS.images.upload
API_ENDPOINTS.images.user
API_ENDPOINTS.images.userById(userId)

// Shortlists
API_ENDPOINTS.shortlists.base
API_ENDPOINTS.shortlists.exists(profileId)
API_ENDPOINTS.shortlists.byId(profileId)

// And more...
```

## 🔧 Helper Functions

### 1. apiFetch
Simplified fetch with automatic auth:
```tsx
import { apiFetch, API_ENDPOINTS } from '~/config/api';

const response = await apiFetch(API_ENDPOINTS.auth.me, {
  token: myToken  // Optional, uses localStorage if not provided
});
```

### 2. getAuthHeaders
Get headers with authentication:
```tsx
import { getAuthHeaders } from '~/config/api';

const headers = getAuthHeaders(token);
// Returns: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ...' }
```

### 3. buildApiUrl
Build URLs with query parameters:
```tsx
import { buildApiUrl, API_BASE_URL } from '~/config/api';

const url = buildApiUrl(`${API_BASE_URL}/api/v1/househelps`, {
  page: 1,
  limit: 10,
  location: 'Nairobi'
});
```

## 📝 Migration Guide

### Before (Hardcoded)
```tsx
const response = await fetch('http://localhost:8080/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### After (Using Config)
```tsx
import { apiFetch, API_ENDPOINTS } from '~/config/api';

const response = await apiFetch(API_ENDPOINTS.auth.me, { token });
```

## 🔄 Switching Environments

### Method 1: Environment Variable
Update `.env` file:
```bash
# Development
API_BASE_URL=http://localhost:8080

# Production
API_BASE_URL=https://api.homexpert.co.ke
```

### Method 2: Runtime
```bash
# Development
npm run dev

# Production
API_BASE_URL=https://api.homexpert.co.ke npm run dev
```

### Method 3: Build-time
```bash
# Production build
API_BASE_URL=https://api.homexpert.co.ke npm run build
npm start
```

## 📚 Documentation Files

1. **API_CONFIGURATION_GUIDE.md**
   - Complete API reference
   - All endpoints documented
   - Usage examples
   - Best practices

2. **MIGRATION_EXAMPLE.md**
   - Before/after examples
   - Search and replace patterns
   - Files to update
   - Testing checklist

3. **API_CONFIG_SUMMARY.md** (this file)
   - Quick reference
   - Implementation summary

## 🎯 Next Steps

### Option 1: Use As-Is
Start using the config in new code:
```tsx
import { API_ENDPOINTS, apiFetch } from '~/config/api';
```

### Option 2: Migrate Existing Code
Update existing files to use the centralized config. See `MIGRATION_EXAMPLE.md` for patterns.

**Files with hardcoded URLs:**
- `app/routes/profile.tsx`
- `app/routes/household/profile.tsx`
- `app/routes/household/househelp/profile.tsx`
- `app/routes/household/househelp/contact.tsx`
- `app/routes/househelp/profile.tsx`
- `app/routes/househelp/find-households.tsx`
- `app/routes/household/employment.tsx`
- `app/routes/public/contact.tsx`
- `app/routes/settings.tsx`
- `app/routes/_auth/*` (all auth routes)

## ✨ Benefits

### Before
❌ Hardcoded URLs scattered across files
❌ Difficult to switch environments
❌ Inconsistent auth header handling
❌ No type safety
❌ Repetitive code

### After
✅ Single source of truth for all endpoints
✅ Easy environment switching
✅ Consistent auth handling
✅ Full TypeScript support
✅ DRY (Don't Repeat Yourself)
✅ Helper functions reduce boilerplate

## 🔍 Example Usage in Real Code

### Login Component
```tsx
import { API_ENDPOINTS } from '~/config/api';

const handleLogin = async (phone: string, password: string) => {
  const response = await fetch(API_ENDPOINTS.auth.login, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password })
  });
  
  if (!response.ok) throw new Error('Login failed');
  const data = await response.json();
  localStorage.setItem('token', data.token);
};
```

### Profile Component
```tsx
import { apiFetch, API_ENDPOINTS } from '~/config/api';

const fetchProfile = async () => {
  const response = await apiFetch(API_ENDPOINTS.profile.househelp.me);
  if (!response.ok) throw new Error('Failed to fetch profile');
  return response.json();
};
```

### Image Upload
```tsx
import { API_ENDPOINTS } from '~/config/api';

const uploadImages = async (files: File[]) => {
  const formData = new FormData();
  files.forEach(f => formData.append('images', f));
  
  const token = localStorage.getItem('token');
  const response = await fetch(API_ENDPOINTS.images.upload, {
    method: 'POST',
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  
  if (!response.ok) throw new Error('Upload failed');
  return response.json();
};
```

## 🧪 Testing

### Test Environment Switching
```bash
# Test with localhost
API_BASE_URL=http://localhost:8080 npm run dev

# Test with production
API_BASE_URL=https://api.homexpert.co.ke npm run dev
```

### Verify Endpoints
```tsx
import { API_ENDPOINTS } from '~/config/api';

console.log('Auth endpoint:', API_ENDPOINTS.auth.me);
console.log('Profile endpoint:', API_ENDPOINTS.profile.househelp.me);
```

## 🏗️ Build Status

✅ **Production build successful!**
```
✓ 1250 modules transformed
✓ built in 7.31s
```

All configuration files compile successfully and are ready for use!

## 💡 Pro Tips

1. **Always use the config** - Never hardcode URLs
2. **Use helper functions** - They handle auth and headers
3. **Type your responses** - Add TypeScript interfaces
4. **Handle errors consistently** - Use try/catch blocks
5. **Test both environments** - Verify localhost and production

## 📞 Quick Reference

```tsx
// Import
import { API_ENDPOINTS, apiFetch, getAuthHeaders, buildApiUrl, API_BASE_URL } from '~/config/api';

// Simple GET with auth
await apiFetch(API_ENDPOINTS.auth.me);

// POST with data
await apiFetch(API_ENDPOINTS.profile.househelp.me, {
  method: 'PATCH',
  body: JSON.stringify(data)
});

// Dynamic endpoint
await apiFetch(API_ENDPOINTS.profile.househelp.byId(profileId));

// Custom endpoint
await fetch(`${API_BASE_URL}/api/v1/custom`);

// With query params
const url = buildApiUrl(`${API_BASE_URL}/api/v1/search`, { q: 'test' });
```

## 🎉 Summary

You now have:
- ✅ Centralized API configuration
- ✅ Easy environment switching
- ✅ Helper functions for common operations
- ✅ TypeScript type safety
- ✅ Comprehensive documentation
- ✅ Migration examples
- ✅ Production-ready build

**No more hardcoded URLs! Switch between localhost and production with a single environment variable! 🚀**

---

**Need help? Check:**
- `API_CONFIGURATION_GUIDE.md` - Complete guide
- `MIGRATION_EXAMPLE.md` - Migration patterns
- `app/config/api.ts` - Source code
