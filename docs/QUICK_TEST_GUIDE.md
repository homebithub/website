# 🧪 Quick Test Guide - Both Onboarding Flows

## 🚀 Setup

### 1. **Start Backend:**
```bash
cd /Users/seannjenga/Projects/microservices/HomeXpert/auth
go run cmd/main.go
```

### 2. **Start Frontend:**
```bash
cd /Users/seannjenga/Projects/microservices/HomeXpert/website
npm run dev
```

### 3. **Open Browser:**
```
http://localhost:5173
```

---

## ✅ Test 1: Household Onboarding

### **Step-by-Step:**
```bash
1. Navigate to http://localhost:5173/signup
2. Fill in details:
   - First Name: John
   - Last Name: Doe
   - Phone: +254712345678
   - Password: Test@1234
   - Profile Type: "Household"
3. Click "Sign Up"
4. ✅ Should redirect to /profile-setup/household
5. ✅ Should see "Complete Your Profile" header
6. ✅ Progress bar should show "Step 1 of 10"

Complete all 10 steps:
Step 1: Location
  - Town: Nairobi
  - Area: Westlands
  - Address: 123 Main St

Step 2: Children
  - Has children: Yes
  - Number of kids: 2
  - Ages: 5, 8

Step 3: Service Type
  - Type: Live-in Nanny
  - Live in: Yes

Step 4: Chores
  - Select: Cleaning, Cooking, Laundry

Step 5: Additional Notes
  - Notes: "Looking for experienced nanny"

Step 6: Schedule
  - Days: Monday-Friday
  - Hours: 8am-5pm

Step 7: Preferences
  - Preferences: "Non-smoker, references required"

Step 8: Pets
  - Has pets: Yes
  - Types: Dog, Cat

Step 9: Budget
  - Min: 25000
  - Max: 35000
  - Frequency: Monthly

Step 10: Review
  - Review all data
  - Click "🎉 Complete"

7. ✅ Should save successfully
8. ✅ Should redirect to home
```

### **Verify in Database:**
```sql
-- Check user created
SELECT * FROM users WHERE phone = '+254712345678';

-- Check profile created
SELECT * FROM employer_profiles WHERE user_id = '...';

-- Check progress tracking
SELECT * FROM profile_setup_progress WHERE profile_type = 'employer';
```

---

## ✅ Test 2: Househelp Onboarding

### **Step-by-Step:**
```bash
1. Navigate to http://localhost:5173/signup
2. Fill in details:
   - First Name: Mary
   - Last Name: Smith
   - Phone: +254787654321
   - Password: Test@1234
   - Profile Type: "Househelp/Nanny"
3. Click "Sign Up"
4. ✅ Should redirect to /profile-setup/househelp
5. ✅ Should see "Complete Your Househelp Profile" header
6. ✅ Progress bar should show "Step 1 of 13"

Complete all 13 steps:
Step 1: Service Type
  - Type: Live-in Nanny

Step 2: Location
  - Town: Nairobi
  - Area: Karen
  - Address: Available

Step 3: Gender & Age
  - Gender: Female
  - Date of Birth: 1990-05-15

Step 4: Experience
  - Years: 8

Step 5: Work with Kids
  - Can work with kids: Yes
  - Age range: 0-5 years
  - Talents: Patient, Creative

Step 6: Work with Pets
  - Can work with pets: Yes
  - Pet types: Dogs, Cats

Step 7: Languages
  - Languages: English, Swahili

Step 8: My Kids
  - Child preference: Toddlers
  - Number can handle: 2

Step 9: Certifications
  - First Aid: Yes
  - Good Conduct: Yes
  - Can Drive: No

Step 10: Salary
  - Expectation: 30000
  - Frequency: Monthly

Step 11: Religion
  - Religion: Christian

Step 12: Bio
  - Bio: "Experienced nanny with 8 years..."

Step 13: Photos
  - Upload photos (optional)
  - Click "🎉 Complete"

7. ✅ Should save successfully
8. ✅ Should redirect to home
```

### **Verify in Database:**
```sql
-- Check user created
SELECT * FROM users WHERE phone = '+254787654321';

-- Check profile created
SELECT * FROM househelp_profiles WHERE user_id = '...';

-- Check progress tracking
SELECT * FROM profile_setup_progress WHERE profile_type = 'househelp';
```

---

## ✅ Test 3: Progress Tracking (Household)

### **Partial Completion:**
```bash
1. Sign up as household (new account)
2. Complete Steps 1-5 only
3. Close browser tab
4. Open new browser
5. Navigate to /profile-setup/household
6. ✅ Should auto-load previous data
7. ✅ Should jump to Step 6 automatically
8. ✅ Previous steps should have saved data
9. Complete Steps 6-10
10. Click "🎉 Complete"
11. ✅ Should save successfully
```

---

## ✅ Test 4: Progress Tracking (Househelp)

### **Partial Completion:**
```bash
1. Sign up as househelp (new account)
2. Complete Steps 1-7 only
3. Close browser tab
4. Open new browser
5. Navigate to /profile-setup/househelp
6. ✅ Should auto-load previous data
7. ✅ Should jump to Step 8 automatically
8. ✅ Previous steps should have saved data
9. Complete Steps 8-13
10. Click "🎉 Complete"
11. ✅ Should save successfully
```

---

## ✅ Test 5: Data Editing

### **Edit Previous Steps:**
```bash
1. Complete all steps (either flow)
2. Return to profile setup page
3. Navigate back to Step 3
4. Change some data
5. Click "Next" through remaining steps
6. Click "🎉 Complete"
7. ✅ Should save updated data
8. Verify in database
```

---

## 📊 Check Analytics

### **Query Progress Data:**
```sql
-- All progress records
SELECT * FROM profile_setup_progress ORDER BY created_at DESC;

-- Completion rates by type
SELECT 
  profile_type,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
  ROUND(COUNT(CASE WHEN status = 'completed' THEN 1 END)::numeric / COUNT(*) * 100, 2) as completion_rate
FROM profile_setup_progress
GROUP BY profile_type;

-- Average steps completed
SELECT 
  profile_type,
  AVG(last_completed_step) as avg_steps_completed,
  AVG(completion_percentage) as avg_completion_pct
FROM profile_setup_progress
WHERE status != 'completed'
GROUP BY profile_type;

-- Time to complete
SELECT 
  profile_type,
  ROUND(AVG(time_spent_seconds)/60, 1) as avg_minutes_to_complete
FROM profile_setup_progress
WHERE status = 'completed'
GROUP BY profile_type;
```

---

## 🐛 Common Issues & Fixes

### **Issue: "No authentication token found"**
**Fix:** 
- Check localStorage has 'token' key
- Re-login if token expired
- Check backend is running

### **Issue: "Failed to save step"**
**Fix:**
- Check backend logs for errors
- Verify database connection
- Check field validation errors

### **Issue: "Progress not loading"**
**Fix:**
- Clear browser cache
- Check backend /api/v1/profile-setup-progress endpoint
- Verify user_id and profile_type match

### **Issue: "Steps not auto-jumping"**
**Fix:**
- Check lastCompletedStep calculation in ProfileSetupContext
- Verify progress data returned from backend
- Check useEffect dependencies in profile setup page

---

## ✅ Success Criteria

### **Household Flow:**
- ✅ All 10 steps complete without errors
- ✅ Data saved to `employer_profiles` table
- ✅ Progress tracked in `profile_setup_progress` table
- ✅ Can resume from any step
- ✅ Data persists across sessions

### **Househelp Flow:**
- ✅ All 13 steps complete without errors
- ✅ Data saved to `househelp_profiles` table
- ✅ Progress tracked in `profile_setup_progress` table
- ✅ Can resume from any step
- ✅ Data persists across sessions

---

## 🎯 Expected Results

### **Database Counts:**
```sql
-- After successful testing
SELECT 'users' as table_name, COUNT(*) FROM users
UNION ALL
SELECT 'employer_profiles', COUNT(*) FROM employer_profiles
UNION ALL
SELECT 'househelp_profiles', COUNT(*) FROM househelp_profiles
UNION ALL
SELECT 'profile_setup_progress', COUNT(*) FROM profile_setup_progress;

-- Expected:
-- users: 4+ (2 household, 2+ househelp)
-- employer_profiles: 2+
-- househelp_profiles: 2+
-- profile_setup_progress: 4+ (one per user)
```

### **Progress Status Distribution:**
```sql
SELECT 
  profile_type,
  status,
  COUNT(*) as count
FROM profile_setup_progress
GROUP BY profile_type, status
ORDER BY profile_type, status;

-- Expected to see mix of:
-- in_progress (partial completion tests)
-- completed (full completion tests)
```

---

## 🎉 Ready!

If all tests pass:
- ✅ Both onboarding flows work perfectly
- ✅ Progress tracking functioning
- ✅ Data persistence working
- ✅ Auto-resume operational
- ✅ Analytics collecting data

**System is production-ready!** 🚀

---

## 📞 Need Help?

Check documentation:
- `HOUSEHELP_ONBOARDING_IMPLEMENTATION.md` - Detailed implementation
- `BOTH_ONBOARDING_FLOWS_COMPLETE.md` - Overview
- `PROFILE_SETUP_PROGRESS_TRACKING.md` - Progress system
- `PROFILE_SETUP_ANALYTICS.md` - Analytics guide

