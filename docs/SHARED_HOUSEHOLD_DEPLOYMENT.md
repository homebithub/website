# Shared Household Feature - Deployment Guide

## 🎯 Overview
This guide walks you through deploying the shared household feature to production. This feature allows multiple users (e.g., parents, family members) to share a single household profile.

---

## ✅ Pre-Deployment Checklist

### Backend
- [ ] All Go files compile without errors
- [ ] Database migration reviewed and tested
- [ ] API endpoints tested manually
- [ ] Service layer methods tested
- [ ] Import paths corrected (`github.com/homexpertke/src/...`)

### Frontend
- [ ] All TypeScript files compile without errors
- [ ] Components render correctly
- [ ] API client functions work
- [ ] Signup flow redirects properly
- [ ] Dark mode works on all pages

### Database
- [ ] Backup created
- [ ] Migration tested on staging
- [ ] Rollback script ready
- [ ] Indexes verified

---

## 📋 Deployment Steps

### Step 1: Backend Deployment (30-60 minutes)

#### 1.1 Integrate Routes into Server

Edit `auth/src/api/server.go`:

```go
import (
    "github.com/homexpertke/src/api/handlers"
    "github.com/homexpertke/src/api/routes"
    "github.com/homexpertke/src/internal/domain/service"
)

// In your setupRoutes() or similar function:
func (s *Server) setupRoutes() {
    // ... existing routes ...
    
    // Initialize household member service
    householdMemberService := service.NewHouseholdMemberService(s.db)
    
    // Initialize handler
    householdMemberHandler := handlers.NewHouseholdMemberHandler(householdMemberService)
    
    // Register routes with rate limiting
    routes.RegisterHouseholdMemberRoutesWithRateLimit(
        s.echo,
        householdMemberHandler,
        middleware.JWTAuth(), // Your auth middleware
        middleware.RateLimiter(), // Your rate limiter
    )
}
```

#### 1.2 Compile and Test

```bash
cd auth

# Build
go build -o bin/auth ./src/cmd/main.go

# Run tests (if you have them)
go test ./...

# Start server
./bin/auth
```

#### 1.3 Apply Database Migration

**IMPORTANT:** Backup your database first!

```bash
# Backup
pg_dump -U your_user -d your_database > backup_$(date +%Y%m%d_%H%M%S).sql

# Review migration
cat migrations/000_add_shared_households.sql

# Apply migration
psql -U your_user -d your_database -f migrations/000_add_shared_households.sql

# Verify
psql -U your_user -d your_database -c "SELECT COUNT(*) FROM household_profiles;"
psql -U your_user -d your_database -c "SELECT COUNT(*) FROM household_members;"
```

#### 1.4 Verify Backend

```bash
# Test invite code validation
curl http://localhost:8080/api/v1/households/invitations/validate/HH-TEST-CODE

# Should return 400 with error message (expected for invalid code)

# Test with auth (replace with real token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/v1/users/me/households
```

---

### Step 2: Frontend Deployment (15-30 minutes)

#### 2.1 Build Frontend

```bash
cd website

# Install dependencies (if needed)
npm install

# Build
npm run build

# Test build locally
npm run preview
```

#### 2.2 Verify Routes

Test these URLs work:
- `/signup` - Should redirect to `/household/setup` for household users
- `/household/setup` - Shows join/create prompt
- `/household/members` - Shows member management (requires auth)

#### 2.3 Deploy

```bash
# Build and deploy to your hosting
npm run build

# Deploy to your server
rsync -avz build/ user@server:/var/www/homexpert/

# Or use Docker
docker build -t homebit-website .
docker push your-registry/homebit-website:latest
```

---

### Step 3: Post-Deployment Verification (15 minutes)

#### 3.1 Test Complete Flow

**Test 1: Create Household**
1. Go to `/signup`
2. Sign up as "Household"
3. Should redirect to `/household/setup`
4. Click "Create New Household"
5. Complete profile
6. Go to `/household/members`
7. Click "Invite Family Member"
8. Generate code
9. Copy code

**Test 2: Join Household**
1. Open incognito window
2. Go to `/signup`
3. Sign up as "Household" (different user)
4. Should redirect to `/household/setup`
5. Enter invite code from Test 1
6. Click "Join This Household"
7. Should show "Request Sent" screen

**Test 3: Approve Member**
1. Back to first user
2. Go to `/household/members`
3. Should see pending request
4. Click "Approve"
5. Member should appear in active members list

**Test 4: Member Access**
1. Back to second user
2. Refresh page or navigate to `/household/profile`
3. Should now have access to household data

#### 3.2 Monitor Logs

```bash
# Backend logs
tail -f /var/log/auth-service.log

# Database queries
# Watch for slow queries or errors
```

#### 3.3 Check Database

```sql
-- Verify data integrity
SELECT 
    hp.id,
    hp.household_name,
    hp.owner_user_id,
    hp.is_shared,
    hp.member_count,
    COUNT(hm.id) as actual_members
FROM household_profiles hp
LEFT JOIN household_members hm ON hm.household_id = hp.id AND hm.status = 'active'
GROUP BY hp.id
HAVING hp.member_count != COUNT(hm.id);

-- Should return 0 rows (member counts should match)
```

---

## 🔄 Rollback Plan

If something goes wrong:

### Backend Rollback

```bash
# Stop the service
systemctl stop auth-service

# Rollback database
psql -U your_user -d your_database -f migrations/000_add_shared_households_down.sql

# Restore from backup if needed
psql -U your_user -d your_database < backup_YYYYMMDD_HHMMSS.sql

# Deploy previous version
git checkout previous-version
go build -o bin/auth ./src/cmd/main.go
systemctl start auth-service
```

### Frontend Rollback

```bash
# Deploy previous version
git checkout previous-version
npm run build

# Deploy to your server
rsync -avz build/ user@server:/var/www/homexpert/

# Or rollback Docker image
kubectl set image deployment/website website=your-registry/homebit-website:previous-tag
```

---

## 📊 Monitoring

### Metrics to Watch

**First 24 Hours:**
- API error rates
- Database query performance
- User signup success rate
- Invite code generation rate
- Join request approval rate

**First Week:**
- Number of shared households created
- Average members per household
- Feature adoption rate
- User feedback/complaints

### Database Queries for Monitoring

```sql
-- Shared households count
SELECT COUNT(*) FROM household_profiles WHERE is_shared = true;

-- Average members
SELECT AVG(member_count) FROM household_profiles;

-- Pending requests
SELECT COUNT(*) FROM household_member_requests WHERE status = 'pending';

-- Active invitations
SELECT COUNT(*) FROM household_invitations 
WHERE status = 'pending' AND expires_at > NOW();

-- Recent activity
SELECT 
    DATE(created_at) as date,
    COUNT(*) as invitations_created
FROM household_invitations
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## 🆘 Troubleshooting

### Issue: "Invalid invite code" for valid codes

**Possible Causes:**
1. Backend not deployed
2. Database migration not applied
3. Code expired
4. Code already used

**Fix:**
```sql
-- Check invitation
SELECT * FROM household_invitations WHERE invite_code = 'HH-XXXX-XXXX';

-- Check expiry
SELECT invite_code, expires_at, status 
FROM household_invitations 
WHERE expires_at < NOW() AND status = 'pending';

-- Update expired codes
UPDATE household_invitations 
SET status = 'expired' 
WHERE expires_at < NOW() AND status = 'pending';
```

### Issue: Member count mismatch

**Fix:**
```sql
-- Recalculate all member counts
UPDATE household_profiles hp
SET member_count = (
    SELECT COUNT(*) 
    FROM household_members hm 
    WHERE hm.household_id = hp.id 
    AND hm.status = 'active'
),
is_shared = (
    SELECT COUNT(*) > 1
    FROM household_members hm 
    WHERE hm.household_id = hp.id 
    AND hm.status = 'active'
);
```

### Issue: Permission denied errors

**Check:**
```sql
-- Verify member permissions
SELECT 
    hm.user_id,
    hm.role,
    hm.status,
    hm.permissions
FROM household_members hm
WHERE hm.household_id = 'YOUR_HOUSEHOLD_ID';
```

---

## 📚 Documentation Links

### For Developers
- `auth/docs/SHARED_HOUSEHOLD_IMPLEMENTATION.md` - Complete implementation plan
- `auth/docs/SHARED_HOUSEHOLD_BACKEND_COMPLETE.md` - Backend details
- `website/docs/SHARED_HOUSEHOLD_FRONTEND_COMPLETE.md` - Frontend details
- `auth/docs/SHARED_HOUSEHOLD_QUICK_START.md` - Quick reference

### For Users
- Create user guide for household sharing
- Create FAQ document
- Create video tutorial
- Add help section in app

---

## ✅ Go-Live Checklist

### Pre-Launch
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Database backed up
- [ ] Migration tested on staging
- [ ] Rollback plan ready
- [ ] Monitoring set up
- [ ] Documentation complete

### Launch
- [ ] Apply database migration
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Verify all endpoints
- [ ] Test complete user flow
- [ ] Monitor error logs

### Post-Launch
- [ ] Monitor for 24 hours
- [ ] Check metrics
- [ ] Gather user feedback
- [ ] Fix any issues
- [ ] Document lessons learned

---

## 🎊 Success Criteria

The deployment is successful when:

✅ Users can sign up and choose to join or create household  
✅ Invite codes can be generated and shared  
✅ Join requests are created successfully  
✅ Owners can approve/reject requests  
✅ Members can access household data  
✅ Permissions work correctly  
✅ No critical errors in logs  
✅ Database integrity maintained  

---

## 📞 Emergency Contacts

If critical issues arise:
1. Check error logs immediately
2. Review recent database changes
3. Consider rollback if data integrity at risk
4. Document the issue for post-mortem

---

**Deployment Owner:** [Your Name]  
**Deployment Date:** [To Be Scheduled]  
**Estimated Downtime:** 5-10 minutes (for migration)  
**Risk Level:** Medium (database schema changes)  
**Rollback Time:** 10-15 minutes

---

## 🚀 Ready to Deploy!

All code is complete and documented. Follow this guide step-by-step for a smooth deployment.

**Good luck! 🎉**
