# User Preferences - Quick Start Guide

## 🚀 What's Been Done

Your website now tracks user preferences (theme, etc.) with **accurate individual user tracking**. Same user switching themes = **1 person**, not multiple users.

## 📋 Quick Reference

### Backend API Endpoints

```bash
# Get preferences (anonymous)
GET /api/v1/preferences?session_id=sess_abc123

# Get preferences (authenticated)
GET /api/v1/preferences
Headers: Authorization: Bearer <token>

# Update preferences
PUT /api/v1/preferences
Body: {
  "session_id": "sess_abc123",  // for anonymous
  "settings": { "theme": "dark" }
}

# Migrate after login
POST /api/v1/preferences/migrate?session_id=sess_abc123
Headers: Authorization: Bearer <token>

# Analytics (admin)
GET /api/v1/admin/preferences/analytics
```

### Frontend Usage

```typescript
// Theme is automatically synced!
import { useTheme } from '~/contexts/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current: {theme}
    </button>
  );
}
```

### User Tracking

```typescript
// Get user identifiers
import { getUserIdentifiers } from '~/utils/userTracking';

const { userId, sessionId, fingerprint } = await getUserIdentifiers();
console.log('User ID:', userId);
// → "user_1696800000_a1b2c3d4_xyz789"
```

## 🧪 Testing

### Test 1: Anonymous User
```bash
# 1. Open website in incognito
# 2. Toggle theme to dark
# 3. Check localStorage:
localStorage.getItem('homexpert_user_id')
# → "user_1696800000_a1b2c3d4_xyz789"

# 4. Refresh page
# 5. Theme should still be dark ✅
```

### Test 2: Multiple Toggles
```bash
# 1. Toggle: light → dark → light → dark
# 2. Check backend:
GET /api/v1/admin/preferences/analytics

# Should show:
# - 1 unique user
# - Theme changes tracked
```

### Test 3: Login Migration
```bash
# 1. As anonymous, set theme to dark
# 2. Log in
# 3. Theme should still be dark ✅
# 4. Check network tab:
POST /api/v1/preferences/migrate
# → Success
```

## 📊 View Analytics

```bash
# Get analytics (requires admin auth)
curl -X GET \
  'https://api.homexpert.co.ke/api/v1/admin/preferences/analytics' \
  -H 'Authorization: Bearer <admin_token>'

# Response:
{
  "total_users": 1500,
  "authenticated_users": 800,
  "anonymous_users": 700,
  "theme_breakdown": {
    "dark": 950,
    "light": 450,
    "system": 100
  }
}
```

## 🔧 How It Works

### User Identification
```
1. Browser Fingerprint Generated
   ↓
2. Persistent User ID Created
   user_[timestamp]_[fingerprint]_[random]
   ↓
3. Session ID Created
   sess_[timestamp]_[random]
   ↓
4. Stored in localStorage + sessionStorage
```

### Theme Change Flow
```
1. User toggles theme
   ↓
2. UI updates instantly (optimistic)
   ↓
3. Backend API called (async)
   PUT /api/v1/preferences
   ↓
4. Preference saved with session_id
```

### Login Flow
```
1. User logs in
   ↓
2. Token stored
   ↓
3. migratePreferences() called automatically
   POST /api/v1/preferences/migrate
   ↓
4. session_id → user_id migration
   ↓
5. Preferences now linked to account
```

## 🎯 Key Benefits

✅ **Accurate Tracking**: Same user = 1 person, even with multiple theme changes
✅ **Seamless UX**: Instant UI updates, async backend sync
✅ **Cross-Device**: Preferences sync for authenticated users
✅ **Privacy-Conscious**: Browser fingerprinting, no PII
✅ **Extensible**: Easy to add new settings (JSONB storage)

## 🐛 Troubleshooting

### Issue: Theme not persisting
```typescript
// Check if user ID exists
console.log(localStorage.getItem('homexpert_user_id'));

// Check if backend is reachable
fetch('/api/v1/preferences')
  .then(r => console.log('Status:', r.status));
```

### Issue: Preferences not syncing
```typescript
// Check network tab for API calls
// Should see: PUT /api/v1/preferences

// Manually test API
import { updatePreferences } from '~/utils/preferencesApi';
updatePreferences({ theme: 'dark' }).then(console.log);
```

### Issue: Migration not working
```typescript
// Check if migration was called
// Should see in network tab after login:
POST /api/v1/preferences/migrate?session_id=sess_...

// Manually trigger
import { migratePreferences } from '~/utils/preferencesApi';
migratePreferences().then(success => console.log('Migrated:', success));
```

## 📝 Adding New Settings

### Backend (Go)
```go
// Already done! JSONB column accepts any fields
// Just update PreferencesData struct if you want type safety
type PreferencesData struct {
    Theme      string `json:"theme,omitempty"`
    Language   string `json:"language,omitempty"`
    NewSetting string `json:"new_setting,omitempty"` // Add here
}
```

### Frontend (TypeScript)
```typescript
// Update interface
interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  new_setting?: string; // Add here
}

// Use it
updatePreferences({ new_setting: 'value' });
```

## 🔗 Full Documentation

- **Backend API**: `/auth/USER_PREFERENCES_API.md`
- **Frontend Integration**: `/website/USER_PREFERENCES_INTEGRATION.md`
- **Complete Summary**: `/PREFERENCES_COMPLETE_SUMMARY.md`

## ✨ That's It!

Your preferences system is ready. Users can toggle themes, and you'll get accurate analytics showing **individual user behavior**, not inflated counts.

**Example**:
- User switches dark → light → dark
- Analytics: **1 user** with 3 theme changes ✅
- Not: 2 dark users + 1 light user ❌
