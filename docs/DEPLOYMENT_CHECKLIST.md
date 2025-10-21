# User Preferences System - Deployment Checklist

## ✅ Implementation Status

### Backend (Auth Microservice)
- [x] Database schema created (`user_preferences` table)
- [x] Type definitions (`src/types/user_preferences.go`)
- [x] Service layer (`src/internal/domain/service/preferences_service.go`)
- [x] API handlers (`src/api/handlers/preferences_handler.go`)
- [x] Routes registered (`src/api/routes/preferences_routes.go`)
- [x] Migration added to `cmd/main.go`
- [x] Code compiles successfully
- [x] SSL auto-configuration for localhost

### Frontend (Website)
- [x] User tracking utility (`app/utils/userTracking.ts`)
- [x] Preferences API client (`app/utils/preferencesApi.ts`)
- [x] Theme context updated (`app/contexts/ThemeContext.tsx`)
- [x] Auth context updated (`app/contexts/AuthContext.tsx`)
- [x] Auto-migration on login/signup
- [x] Browser fingerprinting implemented

### Documentation
- [x] Backend API docs (`auth/USER_PREFERENCES_API.md`)
- [x] Frontend integration guide (`website/USER_PREFERENCES_INTEGRATION.md`)
- [x] Implementation summary (`auth/PREFERENCES_IMPLEMENTATION_SUMMARY.md`)
- [x] Complete summary (`PREFERENCES_COMPLETE_SUMMARY.md`)
- [x] Quick start guide (`website/PREFERENCES_QUICK_START.md`)

---

## 🚀 Pre-Deployment Steps

### Backend Deployment

#### 1. Environment Variables
```bash
# Ensure these are set in production
DB_HOST=<production-db-host>
DB_PORT=5432
DB_USER=<db-user>
DB_PASSWORD=<db-password>
DB_NAME=auth
DB_SSL_MODE=require  # Auto-set based on host, but can override
```

#### 2. Database Migration
```bash
# Option A: Auto-migration (enabled for localhost)
# Migrations run automatically when DB_HOST is localhost/127.0.0.1

# Option B: Manual migration (production)
# Run migration SQL manually or use migration tool
psql -h <host> -U <user> -d auth -f migrations/create_user_preferences.sql
```

#### 3. Build & Test
```bash
cd /Users/seannjenga/Projects/microservices/HomeXpert/auth

# Build
go build -o bin/auth ./cmd/main.go

# Test compilation
go build ./...

# Run locally
./bin/auth
```

#### 4. Verify Endpoints
```bash
# Health check
curl http://localhost:3000/health

# Test preferences endpoint (should return 404 for new user)
curl http://localhost:3000/api/v1/preferences?session_id=test_session

# Test update
curl -X PUT http://localhost:3000/api/v1/preferences \
  -H "Content-Type: application/json" \
  -d '{"session_id":"test_session","settings":{"theme":"dark"}}'
```

### Frontend Deployment

#### 1. Update API Configuration
```typescript
// app/config/api.ts
// Ensure API_BASE_URL points to production
export const API_BASE_URL = 'https://api.homexpert.co.ke';
```

#### 2. Build
```bash
cd /Users/seannjenga/Projects/microservices/HomeXpert/website

# Install dependencies (if needed)
npm install

# Build for production
npm run build

# The TypeScript errors in other files won't block the build
# Our new files are syntactically correct
```

#### 3. Test Locally
```bash
# Run dev server
npm run dev

# Test in browser:
# 1. Open DevTools Console
# 2. Check: localStorage.getItem('homexpert_user_id')
# 3. Toggle theme
# 4. Check Network tab for API calls
```

---

## 🧪 Post-Deployment Testing

### Test 1: Anonymous User Flow
```bash
# 1. Open website in incognito mode
# 2. Open DevTools Console
# 3. Verify user tracking:
localStorage.getItem('homexpert_user_id')
# Should return: "user_1696800000_a1b2c3d4_xyz789"

# 4. Toggle theme to dark
# 5. Check Network tab:
# Should see: PUT /api/v1/preferences
# Status: 200 OK

# 6. Refresh page
# 7. Theme should still be dark ✅
```

### Test 2: Theme Switching
```bash
# 1. Toggle: light → dark → light → dark
# 2. Check backend analytics:
curl -X GET 'https://api.homexpert.co.ke/api/v1/admin/preferences/analytics' \
  -H 'Authorization: Bearer <admin_token>'

# Should show:
# - 1 unique user (same session_id)
# - Theme changes tracked
```

### Test 3: Login Migration
```bash
# 1. As anonymous user, set theme to dark
# 2. Log in with test account
# 3. Check Network tab:
# Should see: POST /api/v1/preferences/migrate?session_id=sess_...
# Status: 200 OK

# 4. Theme should still be dark ✅
# 5. Log out and log in again
# 6. Theme should still be dark ✅ (loaded from backend)
```

### Test 4: Cross-Device Sync
```bash
# 1. Log in on Device A
# 2. Set theme to dark
# 3. Log in on Device B (different browser/computer)
# 4. Theme should be dark ✅
```

### Test 5: Analytics Accuracy
```bash
# 1. Create 3 anonymous users (3 different browsers)
# 2. User 1: dark
# 3. User 2: light
# 4. User 3: dark → light → dark (3 changes)
# 5. Check analytics:

curl -X GET 'https://api.homexpert.co.ke/api/v1/admin/preferences/analytics' \
  -H 'Authorization: Bearer <admin_token>'

# Expected:
{
  "total_users": 3,
  "anonymous_users": 3,
  "theme_breakdown": {
    "dark": 2,  // User 1 and User 3
    "light": 1  // User 2
  }
}
# Note: User 3's multiple changes = 1 user ✅
```

---

## 🔍 Monitoring & Validation

### Database Checks
```sql
-- Check table exists
SELECT * FROM user_preferences LIMIT 5;

-- Count total preferences
SELECT COUNT(*) FROM user_preferences;

-- Check anonymous vs authenticated
SELECT 
  COUNT(*) FILTER (WHERE user_id IS NULL) as anonymous,
  COUNT(*) FILTER (WHERE user_id IS NOT NULL) as authenticated
FROM user_preferences;

-- Theme distribution
SELECT 
  settings->>'theme' as theme,
  COUNT(*) as count
FROM user_preferences
GROUP BY settings->>'theme';
```

### API Health Checks
```bash
# Backend health
curl https://api.homexpert.co.ke/health

# Preferences endpoint (anonymous)
curl 'https://api.homexpert.co.ke/api/v1/preferences?session_id=test'

# Preferences endpoint (authenticated)
curl https://api.homexpert.co.ke/api/v1/preferences \
  -H 'Authorization: Bearer <token>'
```

### Frontend Checks
```javascript
// In browser console
// 1. Check user tracking
localStorage.getItem('homexpert_user_id')
localStorage.getItem('homexpert_fingerprint')
sessionStorage.getItem('homexpert_session_id')

// 2. Test API client
import { getUserIdentifiers } from '~/utils/userTracking';
getUserIdentifiers().then(console.log);

// 3. Test preferences API
import { fetchPreferences } from '~/utils/preferencesApi';
fetchPreferences().then(console.log);
```

---

## 🐛 Troubleshooting

### Issue: API returns 404
**Cause**: Preferences not created yet
**Solution**: Normal for first-time users. Will be created on first update.

### Issue: Theme not syncing
**Check**:
1. Network tab - are API calls being made?
2. Console - any JavaScript errors?
3. Backend logs - any errors?
4. CORS - is frontend domain allowed?

**Fix**:
```bash
# Check CORS in backend
# Ensure frontend domain is allowed in CORS middleware
```

### Issue: Migration not working
**Check**:
1. Is user authenticated? (token present)
2. Is session_id being passed?
3. Backend logs - migration endpoint called?

**Debug**:
```javascript
// Manually trigger migration
import { migratePreferences } from '~/utils/preferencesApi';
migratePreferences().then(success => {
  console.log('Migration success:', success);
});
```

### Issue: Duplicate users in analytics
**Check**:
1. Fingerprint consistency
2. localStorage not being cleared
3. Session ID generation

**Debug**:
```javascript
import { generateBrowserFingerprint } from '~/utils/userTracking';
generateBrowserFingerprint().then(fp => {
  console.log('Current:', fp);
  console.log('Stored:', localStorage.getItem('homexpert_fingerprint'));
  console.log('Match:', fp === localStorage.getItem('homexpert_fingerprint'));
});
```

---

## 📊 Success Metrics

After deployment, monitor these metrics:

### Week 1
- [ ] Total users with preferences > 100
- [ ] Anonymous users creating preferences
- [ ] Successful migrations after login
- [ ] No API errors in logs

### Week 2
- [ ] Theme distribution data available
- [ ] Cross-device sync working
- [ ] User retention (same user_id returning)

### Month 1
- [ ] Accurate analytics dashboard
- [ ] User behavior insights
- [ ] Conversion tracking (anonymous → authenticated)

---

## 🎯 Rollback Plan

If issues arise:

### Backend Rollback
```bash
# 1. Revert to previous version
git checkout <previous-commit>
go build -o bin/auth ./cmd/main.go

# 2. Optionally drop table (if causing issues)
psql -c "DROP TABLE IF EXISTS user_preferences;"

# 3. Restart service
systemctl restart auth-service
```

### Frontend Rollback
```bash
# 1. Revert changes
git checkout <previous-commit>

# 2. Rebuild
npm run build

# 3. Redeploy
```

**Note**: Preferences are non-critical. If they fail, users can still use the app. Theme will fall back to localStorage.

---

## ✅ Final Checklist

Before marking as complete:

- [ ] Backend deployed and running
- [ ] Database migration successful
- [ ] Frontend deployed
- [ ] API endpoints tested
- [ ] Anonymous user flow works
- [ ] Login migration works
- [ ] Analytics endpoint returns data
- [ ] No errors in logs
- [ ] Documentation reviewed
- [ ] Team notified

---

## 📞 Support

**Documentation**:
- Backend API: `/auth/USER_PREFERENCES_API.md`
- Frontend: `/website/USER_PREFERENCES_INTEGRATION.md`
- Quick Start: `/website/PREFERENCES_QUICK_START.md`

**Logs**:
- Backend: Check application logs for API errors
- Frontend: Browser DevTools Console
- Database: PostgreSQL logs

**Monitoring**:
- API health: `GET /health`
- Analytics: `GET /api/v1/admin/preferences/analytics`

---

## 🎉 Success!

Once all checks pass, you'll have:
- ✅ Accurate user preference tracking
- ✅ Individual user identification
- ✅ Cross-device sync
- ✅ Comprehensive analytics
- ✅ Privacy-conscious implementation

**Result**: Know exactly how many people prefer dark mode vs light mode, with confidence that the same user switching themes counts as **one person**, not multiple users.
