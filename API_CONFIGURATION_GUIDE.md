# API Configuration Guide

## Overview

All API endpoints are now centralized in `app/config/api.ts`. This makes it easy to switch between development (localhost) and production (api.homexpert.co.ke) environments.

## Quick Start

### 1. Set Environment Variable

Create a `.env` file in the project root (copy from `.env.example`):

```bash
# For local development
API_BASE_URL=http://localhost:8080

# For production
# API_BASE_URL=https://api.homexpert.co.ke
```

### 2. Import and Use

```tsx
import { API_ENDPOINTS, apiFetch } from '~/config/api';

// Simple fetch
const response = await fetch(API_ENDPOINTS.auth.me, {
  headers: { Authorization: `Bearer ${token}` }
});

// Or use the helper
const response = await apiFetch(API_ENDPOINTS.auth.me, {
  token: myToken
});
```

## Configuration File

### Location
`app/config/api.ts`

### Features
- ✅ Centralized API endpoints
- ✅ Environment-based URL switching
- ✅ Helper functions for common operations
- ✅ TypeScript type safety
- ✅ Consistent auth header management

## Available Endpoints

### Auth Endpoints
```tsx
import { API_ENDPOINTS } from '~/config/api';

API_ENDPOINTS.auth.me                    // GET user info
API_ENDPOINTS.auth.login                 // POST login
API_ENDPOINTS.auth.signup                // POST signup
API_ENDPOINTS.auth.forgotPassword        // POST forgot password
API_ENDPOINTS.auth.resetPassword         // POST reset password
API_ENDPOINTS.auth.verifyEmail           // POST verify email
API_ENDPOINTS.auth.verifyOtp             // POST verify OTP
API_ENDPOINTS.auth.updateEmail           // POST update email
API_ENDPOINTS.auth.changePassword        // POST change password
API_ENDPOINTS.auth.googleCallback        // GET Google OAuth callback
```

### Profile Endpoints
```tsx
API_ENDPOINTS.profile.househelp.me                    // GET/PATCH househelp profile
API_ENDPOINTS.profile.househelp.byId(profileId)       // GET househelp by ID
API_ENDPOINTS.profile.employer.me                     // GET/PATCH employer profile
```

### Image Endpoints
```tsx
API_ENDPOINTS.images.upload                    // POST upload images
API_ENDPOINTS.images.user                      // GET user images
API_ENDPOINTS.images.userById(userId)          // GET images by user ID
API_ENDPOINTS.images.delete(imageId)           // DELETE image
```

### Shortlist Endpoints
```tsx
API_ENDPOINTS.shortlists.base                  // GET/POST shortlists
API_ENDPOINTS.shortlists.exists(profileId)     // GET check if shortlisted
API_ENDPOINTS.shortlists.byId(profileId)       // DELETE shortlist
```

### Other Endpoints
```tsx
API_ENDPOINTS.profileView.record               // POST record profile view
API_ENDPOINTS.users.settings                   // GET/PUT user settings
API_ENDPOINTS.contact                          // POST contact form
API_ENDPOINTS.waitlist.join                    // POST join waitlist
API_ENDPOINTS.waitlist.google                  // GET Google waitlist
```

## Helper Functions

### 1. buildApiUrl
Build URLs with query parameters:

```tsx
import { buildApiUrl } from '~/config/api';

const url = buildApiUrl('/api/v1/househelps', {
  page: 1,
  limit: 10,
  location: 'Nairobi'
});
// Result: /api/v1/househelps?page=1&limit=10&location=Nairobi
```

### 2. getAuthHeaders
Get headers with authentication:

```tsx
import { getAuthHeaders } from '~/config/api';

const headers = getAuthHeaders(token);
// Result: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ...' }
```

### 3. apiFetch
Fetch with automatic auth headers:

```tsx
import { apiFetch, API_ENDPOINTS } from '~/config/api';

// With token from localStorage
const response = await apiFetch(API_ENDPOINTS.auth.me);

// With custom token
const response = await apiFetch(API_ENDPOINTS.auth.me, {
  token: customToken
});

// With additional options
const response = await apiFetch(API_ENDPOINTS.profile.househelp.me, {
  method: 'PATCH',
  body: JSON.stringify(data),
  token: myToken
});
```

## Usage Examples

### Example 1: Login
```tsx
import { API_ENDPOINTS } from '~/config/api';

const login = async (phone: string, password: string) => {
  const response = await fetch(API_ENDPOINTS.auth.login, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password })
  });
  
  if (!response.ok) throw new Error('Login failed');
  return response.json();
};
```

### Example 2: Fetch Profile
```tsx
import { apiFetch, API_ENDPOINTS } from '~/config/api';

const fetchProfile = async () => {
  const response = await apiFetch(API_ENDPOINTS.profile.househelp.me);
  
  if (!response.ok) throw new Error('Failed to fetch profile');
  return response.json();
};
```

### Example 3: Upload Images
```tsx
import { API_ENDPOINTS, getAuthHeaders } from '~/config/api';

const uploadImages = async (files: File[]) => {
  const formData = new FormData();
  files.forEach(file => formData.append('images', file));
  
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

### Example 4: Dynamic Endpoint
```tsx
import { API_ENDPOINTS } from '~/config/api';

const fetchHousehelpProfile = async (profileId: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    API_ENDPOINTS.profile.househelp.byId(profileId),
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  
  if (!response.ok) throw new Error('Failed to fetch profile');
  return response.json();
};
```

### Example 5: With Query Parameters
```tsx
import { buildApiUrl, API_BASE_URL } from '~/config/api';

const searchHousehelps = async (filters: {
  location?: string;
  experience?: number;
  page?: number;
}) => {
  const url = buildApiUrl(`${API_BASE_URL}/api/v1/househelps/search`, filters);
  const response = await fetch(url);
  
  if (!response.ok) throw new Error('Search failed');
  return response.json();
};
```

## Environment Configuration

### Development (.env)
```bash
API_BASE_URL=http://localhost:8080
GOOGLE_CLIENT_ID=your-google-client-id
NODE_ENV=development
```

### Production (.env.production)
```bash
API_BASE_URL=https://api.homexpert.co.ke
GOOGLE_CLIENT_ID=your-google-client-id
NODE_ENV=production
```

### Access in Code
```tsx
// Server-side (loaders/actions)
const apiUrl = process.env.API_BASE_URL;

// Client-side (components)
const apiUrl = (window as any).ENV?.API_BASE_URL;

// Or use the config (works everywhere)
import { API_BASE_URL } from '~/config/api';
```

## Migration Guide

### Before (Hardcoded URLs)
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

const response = await apiFetch(API_ENDPOINTS.auth.me, {
  token: token
});
```

### Or Without Helper
```tsx
import { API_ENDPOINTS, getAuthHeaders } from '~/config/api';

const response = await fetch(API_ENDPOINTS.auth.me, {
  headers: getAuthHeaders(token)
});
```

## Best Practices

### 1. Always Use Config
❌ **Don't:**
```tsx
fetch('http://localhost:8080/api/v1/auth/me')
```

✅ **Do:**
```tsx
import { API_ENDPOINTS } from '~/config/api';
fetch(API_ENDPOINTS.auth.me)
```

### 2. Use Helper Functions
❌ **Don't:**
```tsx
const token = localStorage.getItem('token');
fetch(url, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
})
```

✅ **Do:**
```tsx
import { apiFetch } from '~/config/api';
apiFetch(url, { token })
```

### 3. Handle Errors Consistently
```tsx
import { apiFetch, API_ENDPOINTS } from '~/config/api';

try {
  const response = await apiFetch(API_ENDPOINTS.auth.me);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }
  
  return response.json();
} catch (error) {
  console.error('API Error:', error);
  throw error;
}
```

### 4. Type Your Responses
```tsx
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

const fetchProfile = async (): Promise<UserProfile> => {
  const response = await apiFetch(API_ENDPOINTS.auth.me);
  
  if (!response.ok) throw new Error('Failed to fetch profile');
  return response.json();
};
```

## Switching Environments

### Option 1: Environment Variables
Update `.env` file:
```bash
# Development
API_BASE_URL=http://localhost:8080

# Production
API_BASE_URL=https://api.homexpert.co.ke
```

### Option 2: Build-time Configuration
```bash
# Development build
npm run dev

# Production build
API_BASE_URL=https://api.homexpert.co.ke npm run build
```

### Option 3: Runtime Configuration
The config automatically detects the environment:
1. Checks `window.ENV.API_BASE_URL` (set in root.tsx)
2. Falls back to `process.env.API_BASE_URL`
3. Defaults to production URL

## Troubleshooting

### Issue: API calls fail with CORS errors
**Solution:** Ensure your API server allows requests from your domain.

### Issue: Environment variables not loading
**Solution:** 
1. Restart dev server after changing `.env`
2. Ensure `.env` is in project root
3. Check variable names match exactly

### Issue: Getting 404 errors
**Solution:** 
1. Verify the endpoint exists in `API_ENDPOINTS`
2. Check the API server is running
3. Verify the base URL is correct

### Issue: Auth token not being sent
**Solution:**
1. Use `apiFetch` helper or `getAuthHeaders`
2. Ensure token is in localStorage
3. Check token format (should be `Bearer ${token}`)

## Adding New Endpoints

To add a new endpoint:

1. Open `app/config/api.ts`
2. Add to `API_ENDPOINTS` object:

```tsx
export const API_ENDPOINTS = {
  // ... existing endpoints
  
  // New endpoint category
  myNewFeature: {
    list: `${API_BASE_URL}/api/v1/my-feature`,
    byId: (id: string) => `${API_BASE_URL}/api/v1/my-feature/${id}`,
    create: `${API_BASE_URL}/api/v1/my-feature`,
    update: (id: string) => `${API_BASE_URL}/api/v1/my-feature/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/v1/my-feature/${id}`,
  },
} as const;
```

3. Use in your code:
```tsx
import { API_ENDPOINTS, apiFetch } from '~/config/api';

const data = await apiFetch(API_ENDPOINTS.myNewFeature.list);
```

## Summary

✅ **Centralized Configuration**: All API URLs in one place
✅ **Environment Switching**: Easy switch between dev/prod
✅ **Type Safety**: TypeScript support throughout
✅ **Helper Functions**: Simplified API calls
✅ **Consistent Auth**: Automatic auth header management
✅ **Easy Migration**: Simple to update existing code

---

**Need help? Check the examples above or refer to `app/config/api.ts`**
