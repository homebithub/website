# User Preferences Integration - Website

## Overview

The website now integrates with the backend user preferences API to track theme usage (dark/light mode) and other settings for both **anonymous** and **authenticated** users. This provides accurate analytics about individual user behavior.

## Key Features Implemented

### ✅ 1. Robust User Tracking
- **Browser Fingerprinting**: Identifies users based on browser characteristics (screen resolution, timezone, language, platform, canvas fingerprint, etc.)
- **Persistent User ID**: Combines fingerprint with random component for unique identification
- **Session Tracking**: Short-term session IDs for additional tracking granularity
- **Survives localStorage Clear**: Fingerprint regeneration helps re-identify users

### ✅ 2. Backend Integration
- Automatic sync of theme preferences to backend
- Seamless migration when anonymous users sign up/login
- Optimistic UI updates for instant feedback
- Graceful fallback if backend is unavailable

### ✅ 3. Accurate Individual Tracking
- Same user switching between dark/light is tracked as **one person**
- Fingerprint prevents duplicate counting
- Session IDs provide additional context

## Files Created/Modified

### New Files:
1. **`app/utils/userTracking.ts`** - User identification and fingerprinting
2. **`app/utils/preferencesApi.ts`** - Backend API client for preferences

### Modified Files:
1. **`app/contexts/ThemeContext.tsx`** - Integrated with backend API
2. **`app/contexts/AuthContext.tsx`** - Added preference migration on login/signup

## How It Works

### For Anonymous Users

```typescript
// 1. User visits website
// - Browser fingerprint is generated
// - Persistent user ID is created: user_1696800000_a1b2c3d4_xyz789
// - Session ID is created: sess_1696800000_abc123

// 2. User toggles theme to dark
// - UI updates instantly (optimistic)
// - Backend API is called with session_id
// - Preference saved: { theme: "dark", session_id: "sess_..." }

// 3. User refreshes page
// - Same user ID and fingerprint detected
// - Theme loaded from backend
// - Dark mode applied automatically

// 4. User switches to light, then back to dark
// - All changes tracked under same user_id
// - Backend sees: 1 user, 3 theme changes
// - Analytics: Accurate individual behavior
```

### For Authenticated Users

```typescript
// 1. Anonymous user logs in
// - Login successful, token stored
// - migratePreferences() called automatically
// - Backend migrates: session_id → user_id
// - Anonymous preferences now linked to account

// 2. User logs out and logs in on different device
// - Theme preference loaded from backend
// - Consistent experience across devices
```

## User Tracking Strategy

### Browser Fingerprint Components

```typescript
const fingerprint = hash([
  screen.width + 'x' + screen.height,  // Screen resolution
  screen.colorDepth,                    // Color depth
  navigator.language,                   // Language
  navigator.platform,                   // OS platform
  browser_version,                      // Browser type/version
  navigator.hardwareConcurrency,        // CPU cores
  navigator.deviceMemory,               // RAM (if available)
  canvas_fingerprint                    // Canvas rendering signature
]);
```

### User ID Generation

```
user_[timestamp]_[fingerprint_short]_[random]
Example: user_1696800000_a1b2c3d4_xyz789
```

This ensures:
- **Uniqueness**: Timestamp + random component
- **Persistence**: Fingerprint helps re-identify
- **Privacy**: No PII collected

### Session ID Generation

```
sess_[timestamp]_[random]
Example: sess_1696800000_abc123
```

Sessions expire after **30 minutes** of inactivity.

## Analytics Insights

### What We Can Track

1. **Theme Preferences**
   - How many users prefer dark mode vs light mode
   - Theme switching patterns (do users experiment?)
   - Time-of-day preferences (if we add timestamps)

2. **User Behavior**
   - Anonymous vs authenticated user preferences
   - Conversion: Do anonymous users keep their settings after signup?
   - Retention: Do users come back with same preferences?

3. **Individual Accuracy**
   - Same user switching themes = 1 person, multiple actions
   - Not: 1 dark mode user + 1 light mode user (incorrect)
   - Accurate: 1 user who tried both themes

### Example Analytics Query

```sql
-- Get theme distribution (accurate per user)
SELECT 
  settings->>'theme' as theme,
  COUNT(DISTINCT COALESCE(user_id::text, session_id)) as unique_users
FROM user_preferences
GROUP BY settings->>'theme';

-- Result:
-- dark: 950 unique users
-- light: 450 unique users
-- Total: 1400 users (not 1400 because some tried both)
```

## Testing the Integration

### Test Scenario 1: Anonymous User
```bash
# 1. Open website in incognito
# 2. Open DevTools Console
# 3. Check user tracking:
localStorage.getItem('homexpert_user_id')
// → "user_1696800000_a1b2c3d4_xyz789"

# 4. Toggle theme to dark
# 5. Check network tab - should see:
POST /api/v1/preferences
Body: {
  "session_id": "sess_...",
  "settings": { "theme": "dark" }
}

# 6. Refresh page
# 7. Theme should still be dark (loaded from backend)
```

### Test Scenario 2: Theme Switching
```bash
# 1. Toggle dark → light → dark → light
# 2. Check backend analytics:
GET /api/v1/admin/preferences/analytics

# Should show:
# - 1 unique user (same session_id)
# - Multiple updates (theme changes)
```

### Test Scenario 3: Login Migration
```bash
# 1. As anonymous user, set theme to dark
# 2. Sign up / Log in
# 3. Check network tab - should see:
POST /api/v1/preferences/migrate?session_id=sess_...

# 4. Check backend:
# - Old record: session_id=sess_..., user_id=null
# - New record: session_id=sess_..., user_id=<actual_user_id>
# - Theme should still be dark
```

## Privacy Considerations

### What We Track
- ✅ Browser characteristics (fingerprint)
- ✅ Theme preferences
- ✅ Session duration
- ✅ Anonymous user ID (generated, not PII)

### What We DON'T Track
- ❌ IP addresses (not stored in preferences)
- ❌ Personal information (unless user is authenticated)
- ❌ Browsing history
- ❌ Cross-site tracking

### User Control
- Users can clear localStorage to reset tracking
- Preferences can be deleted via API
- Authenticated users can manage preferences in settings

## Performance Considerations

### Optimistic Updates
```typescript
// UI updates immediately
setTheme('dark');
applyTheme('dark');

// Backend sync happens asynchronously
updatePreferences({ theme: 'dark' }).catch(console.error);
```

### Caching Strategy
1. **localStorage**: Immediate access (fallback)
2. **Backend API**: Source of truth (synced)
3. **Load Order**: Backend → localStorage → System preference

### Debouncing
Theme changes are not debounced because:
- Toggle is a discrete action (not continuous)
- Users don't rapidly switch themes
- Each change is meaningful for analytics

If needed, add debouncing:
```typescript
const debouncedUpdate = debounce(updatePreferences, 500);
```

## Future Enhancements

### Additional Settings to Track
```typescript
interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'sw';
  notifications: boolean;
  compact_view: boolean;
  font_size: 'small' | 'medium' | 'large';
  reduced_motion: boolean;
  // ... more settings
}
```

### Advanced Analytics
- **A/B Testing**: Track preference changes after UI updates
- **Cohort Analysis**: Compare behavior of different user segments
- **Heatmaps**: Visualize when users change preferences
- **Retention**: Track if users keep customizations over time

### Enhanced Fingerprinting
- WebGL fingerprinting (more unique)
- Audio context fingerprinting
- Font detection
- Plugin detection

**Note**: Balance uniqueness with privacy concerns.

## Troubleshooting

### Issue: Preferences not syncing
```typescript
// Check if API is reachable
fetch('/api/v1/preferences')
  .then(r => console.log('API Status:', r.status))
  .catch(e => console.error('API Error:', e));

// Check user tracking
import { getUserIdentifiers } from '~/utils/userTracking';
getUserIdentifiers().then(console.log);
```

### Issue: Theme not persisting
```typescript
// Check localStorage
console.log('Theme:', localStorage.getItem('theme'));
console.log('User ID:', localStorage.getItem('homexpert_user_id'));

// Check backend
fetchPreferences().then(console.log);
```

### Issue: Duplicate users in analytics
```typescript
// Verify fingerprint consistency
import { generateBrowserFingerprint } from '~/utils/userTracking';
generateBrowserFingerprint().then(fp => {
  console.log('Current:', fp);
  console.log('Stored:', localStorage.getItem('homexpert_fingerprint'));
});
```

## API Endpoints Used

```
GET    /api/v1/preferences?session_id=xxx     # Fetch preferences
PUT    /api/v1/preferences                    # Update preferences
POST   /api/v1/preferences/migrate            # Migrate to user account
DELETE /api/v1/preferences                    # Delete preferences
GET    /api/v1/admin/preferences/analytics    # View analytics (admin)
```

## Summary

The integration provides:
1. ✅ **Accurate tracking** of individual users (not just sessions)
2. ✅ **Seamless experience** for anonymous and authenticated users
3. ✅ **Reliable analytics** for understanding user preferences
4. ✅ **Privacy-conscious** approach with browser fingerprinting
5. ✅ **Performance-optimized** with optimistic updates

Users can now freely switch between themes, and we'll accurately track that it's **one person exploring options**, not multiple different users.
