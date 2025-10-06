# API Configuration Migration Examples

## Quick Reference

Replace hardcoded URLs with centralized config:

```tsx
import { API_ENDPOINTS, apiFetch } from '~/config/api';
```

## Example Migrations

### 1. Simple GET Request

**Before:**
```tsx
const response = await fetch('http://localhost:8080/api/v1/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**After:**
```tsx
import { apiFetch, API_ENDPOINTS } from '~/config/api';

const response = await apiFetch(API_ENDPOINTS.auth.me, { token });
```

---

### 2. POST Request with Body

**Before:**
```tsx
const response = await fetch('http://localhost:8080/api/v1/profile/househelp/me', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(data)
});
```

**After:**
```tsx
import { apiFetch, API_ENDPOINTS } from '~/config/api';

const response = await apiFetch(API_ENDPOINTS.profile.househelp.me, {
  method: 'PATCH',
  body: JSON.stringify(data),
  token
});
```

---

### 3. Dynamic URL with ID

**Before:**
```tsx
const response = await fetch(
  `http://localhost:8080/api/v1/househelps/${profileId}/profile_with_user`,
  {
    headers: { Authorization: `Bearer ${token}` }
  }
);
```

**After:**
```tsx
import { apiFetch, API_ENDPOINTS } from '~/config/api';

const response = await apiFetch(
  API_ENDPOINTS.profile.househelp.byId(profileId),
  { token }
);
```

---

### 4. Image Upload (FormData)

**Before:**
```tsx
const formData = new FormData();
files.forEach(f => formData.append('images', f));
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:8080/api/v1/images/upload', {
  method: 'POST',
  body: formData,
  headers: token ? { Authorization: `Bearer ${token}` } : undefined
});
```

**After:**
```tsx
import { API_ENDPOINTS } from '~/config/api';

const formData = new FormData();
files.forEach(f => formData.append('images', f));
const token = localStorage.getItem('token');

const response = await fetch(API_ENDPOINTS.images.upload, {
  method: 'POST',
  body: formData,
  headers: token ? { Authorization: `Bearer ${token}` } : {}
});
```

---

### 5. DELETE Request

**Before:**
```tsx
const response = await fetch(
  `http://localhost:8080/api/v1/shortlists/${profileId}`,
  {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  }
);
```

**After:**
```tsx
import { apiFetch, API_ENDPOINTS } from '~/config/api';

const response = await apiFetch(
  API_ENDPOINTS.shortlists.byId(profileId),
  {
    method: 'DELETE',
    token
  }
);
```

---

### 6. Check Existence

**Before:**
```tsx
const response = await fetch(
  `http://localhost:8080/api/v1/shortlists/exists/${profileId}`,
  {
    headers: { Authorization: `Bearer ${token}` }
  }
);
```

**After:**
```tsx
import { apiFetch, API_ENDPOINTS } from '~/config/api';

const response = await apiFetch(
  API_ENDPOINTS.shortlists.exists(profileId),
  { token }
);
```

---

### 7. Using API_BASE_URL for Custom Endpoints

**Before:**
```tsx
const API_BASE = 'http://localhost:8080';
const response = await fetch(`${API_BASE}/api/v1/custom-endpoint`);
```

**After:**
```tsx
import { API_BASE_URL } from '~/config/api';

const response = await fetch(`${API_BASE_URL}/api/v1/custom-endpoint`);
```

---

### 8. With Query Parameters

**Before:**
```tsx
const params = new URLSearchParams({
  page: '1',
  limit: '10',
  location: 'Nairobi'
});
const response = await fetch(
  `http://localhost:8080/api/v1/househelps?${params}`
);
```

**After:**
```tsx
import { buildApiUrl, API_BASE_URL } from '~/config/api';

const url = buildApiUrl(`${API_BASE_URL}/api/v1/househelps`, {
  page: 1,
  limit: 10,
  location: 'Nairobi'
});
const response = await fetch(url);
```

---

### 9. Environment-Aware Base URL

**Before:**
```tsx
const API_BASE = useMemo(
  () => (typeof window !== 'undefined' && (window as any).ENV?.AUTH_API_BASE_URL) || 
        'http://localhost:8080',
  []
);
```

**After:**
```tsx
import { API_BASE_URL } from '~/config/api';

// Just use API_BASE_URL directly - it handles environment detection
const response = await fetch(`${API_BASE_URL}/api/v1/endpoint`);
```

---

### 10. Complete Component Example

**Before:**
```tsx
export default function MyComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    };
    
    fetchData();
  }, []);
  
  return <div>{/* render data */}</div>;
}
```

**After:**
```tsx
import { apiFetch, API_ENDPOINTS } from '~/config/api';

export default function MyComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiFetch(API_ENDPOINTS.auth.me);
        
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    
    fetchData();
  }, []);
  
  return <div>{/* render data */}</div>;
}
```

---

## Search and Replace Patterns

Use these patterns to quickly update your codebase:

### Pattern 1: Auth Me Endpoint
```
Find:    'http://localhost:8080/api/v1/auth/me'
Replace: API_ENDPOINTS.auth.me
```

### Pattern 2: Househelp Profile
```
Find:    'http://localhost:8080/api/v1/profile/househelp/me'
Replace: API_ENDPOINTS.profile.househelp.me
```

### Pattern 3: Employer Profile
```
Find:    'http://localhost:8080/api/v1/profile/employer/me'
Replace: API_ENDPOINTS.profile.employer.me
```

### Pattern 4: Image Upload
```
Find:    'http://localhost:8080/api/v1/images/upload'
Replace: API_ENDPOINTS.images.upload
```

### Pattern 5: User Images
```
Find:    'http://localhost:8080/api/v1/images/user'
Replace: API_ENDPOINTS.images.user
```

### Pattern 6: Shortlists Base
```
Find:    'http://localhost:8080/api/v1/shortlists'
Replace: API_ENDPOINTS.shortlists.base
```

### Pattern 7: Contact
```
Find:    'http://localhost:8080/contact'
Replace: API_ENDPOINTS.contact
```

### Pattern 8: Settings
```
Find:    'http://localhost:8080/users/settings'
Replace: API_ENDPOINTS.users.settings
```

---

## Files to Update

Based on the grep search, these files contain hardcoded URLs:

1. `app/routes/profile.tsx`
2. `app/routes/household/profile.tsx`
3. `app/routes/household/househelp/profile.tsx`
4. `app/routes/household/househelp/contact.tsx`
5. `app/routes/househelp/profile.tsx`
6. `app/routes/househelp/find-households.tsx`
7. `app/routes/household/employment.tsx`
8. `app/routes/public/contact.tsx`
9. `app/routes/settings.tsx`
10. `app/routes/_auth/*` (all auth routes)
11. `app/components/*` (various components)

---

## Automated Migration

You can use a script to help with migration:

```bash
# Find all files with hardcoded URLs
grep -r "http://localhost:8080" app/ --include="*.tsx" --include="*.ts"

# Or use this to see just the file names
grep -rl "http://localhost:8080" app/ --include="*.tsx" --include="*.ts"
```

---

## Testing After Migration

1. **Check imports:**
```tsx
import { API_ENDPOINTS, apiFetch } from '~/config/api';
```

2. **Verify endpoints work:**
```tsx
console.log(API_ENDPOINTS.auth.me);
// Should output: https://api.homexpert.co.ke/api/v1/auth/me (or localhost)
```

3. **Test API calls:**
- Login/logout
- Profile fetch/update
- Image upload
- Shortlist operations

4. **Switch environments:**
```bash
# Test with localhost
API_BASE_URL=http://localhost:8080 npm run dev

# Test with production
API_BASE_URL=https://api.homexpert.co.ke npm run dev
```

---

## Summary

✅ Import config at top of file
✅ Replace hardcoded URLs with `API_ENDPOINTS`
✅ Use `apiFetch` helper for auth
✅ Test in both environments
✅ Remove old URL constants

**Ready to migrate? Start with one file and test thoroughly before moving to the next!**
