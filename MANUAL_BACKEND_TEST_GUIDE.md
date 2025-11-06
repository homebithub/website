# Manual Backend Testing Guide 🧪

## Quick Start

### Step 1: Get Your Auth Token

1. Log in to the app as a househelp user
2. Open browser DevTools (F12)
3. Go to Console tab
4. Type: `localStorage.getItem('token')`
5. Copy the token value

### Step 2: Test GET Endpoint

Open a new terminal and run:

```bash
curl -X GET \
  http://localhost:8000/api/v1/househelps/me/fields \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json' | jq '.'
```

**What to look for:**
- ✅ Returns 200 OK
- ✅ Returns JSON with profile data
- ✅ Check if these NEW fields exist:
  - `offers_live_in`
  - `offers_day_worker`
  - `off_days`
  - `availability_schedule`
  - `available_from`
  - `preferred_household_size`
  - `preferred_location_type`
  - `preferred_family_type`
  - `work_environment_notes`
  - `references`
  - `background_check_consent`

**If fields are missing:**
- ❌ Backend needs database migration
- ❌ See migration script in BACKEND_VERIFICATION_CHECKLIST.md

---

### Step 3: Test PATCH Endpoint (Service Type)

```bash
curl -X PATCH \
  http://localhost:8000/api/v1/househelps/me/fields \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '{
    "updates": {
      "offers_live_in": true,
      "offers_day_worker": false,
      "off_days": "Sunday,Monday",
      "available_from": "2025-01-01"
    }
  }' | jq '.'
```

**What to look for:**
- ✅ Returns 200 OK
- ✅ Returns success message
- ✅ No errors in response

**Then verify it saved:**
```bash
curl -X GET \
  http://localhost:8000/api/v1/househelps/me/fields \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' | jq '.offers_live_in, .off_days'
```

Should return:
```json
true
"Sunday,Monday"
```

---

### Step 4: Test PATCH Endpoint (Work Environment)

```bash
curl -X PATCH \
  http://localhost:8000/api/v1/househelps/me/fields \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '{
    "updates": {
      "preferred_household_size": "medium",
      "preferred_location_type": "urban",
      "preferred_family_type": "young_family"
    }
  }' | jq '.'
```

**Verify it saved:**
```bash
curl -X GET \
  http://localhost:8000/api/v1/househelps/me/fields \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' | jq '.preferred_household_size, .preferred_location_type, .preferred_family_type'
```

---

### Step 5: Test PATCH Endpoint (References)

```bash
curl -X PATCH \
  http://localhost:8000/api/v1/househelps/me/fields \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '{
    "updates": {
      "references": "[{\"name\":\"John Doe\",\"relationship\":\"Previous Employer\",\"phone\":\"0712345678\",\"email\":\"john@example.com\",\"duration\":\"2 years\"}]"
    }
  }' | jq '.'
```

**Verify it saved:**
```bash
curl -X GET \
  http://localhost:8000/api/v1/househelps/me/fields \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' | jq '.references'
```

---

### Step 6: Test Progress Tracking

```bash
curl -X POST \
  http://localhost:8000/api/v1/profile-setup-progress \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '{
    "profile_type": "househelp",
    "current_step": 5,
    "last_completed_step": 5,
    "completed_steps": [1, 2, 3, 4, 5],
    "step_id": "certifications",
    "time_spent_seconds": 120,
    "status": "in_progress",
    "skipped": false,
    "is_auto_save": false
  }' | jq '.'
```

**What to look for:**
- ✅ Returns 200 OK
- ✅ Progress is saved

---

## Quick Checklist

Run through this checklist:

### Database Schema:
- [ ] Run: `psql -d homebit -c "\d househelps"` (or equivalent)
- [ ] Verify all new columns exist
- [ ] Check column types match requirements

### API Endpoints:
- [ ] GET `/api/v1/househelps/me/fields` returns 200
- [ ] GET returns all new fields (even if null)
- [ ] PATCH accepts `offers_live_in`, `offers_day_worker`
- [ ] PATCH accepts `off_days`, `availability_schedule`
- [ ] PATCH accepts `preferred_household_size`, `preferred_location_type`, `preferred_family_type`
- [ ] PATCH accepts `references` (JSON string)
- [ ] PATCH accepts `background_check_consent`
- [ ] POST `/api/v1/profile-setup-progress` works

### Data Persistence:
- [ ] PATCH → GET returns updated values
- [ ] Values persist after server restart
- [ ] Multiple updates work correctly

---

## Common Issues & Solutions

### Issue 1: "Column does not exist"
**Error**: `column "offers_live_in" does not exist`

**Solution**: Run database migration
```sql
ALTER TABLE househelps
  ADD COLUMN IF NOT EXISTS offers_live_in BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS offers_day_worker BOOLEAN DEFAULT false,
  -- ... (see full migration in BACKEND_VERIFICATION_CHECKLIST.md)
```

---

### Issue 2: "Invalid field name"
**Error**: `Unknown field: preferred_household_size`

**Solution**: Backend needs to whitelist new fields in the PATCH endpoint handler

---

### Issue 3: "JSON parse error"
**Error**: `Invalid JSON in references field`

**Solution**: Ensure JSON is properly escaped in the request

---

### Issue 4: "401 Unauthorized"
**Error**: `Authentication required`

**Solution**: 
1. Check token is valid
2. Check token hasn't expired
3. Try logging in again to get fresh token

---

## Using the Test Script

Make the script executable and run it:

```bash
chmod +x test-backend-api.sh

# Edit the script to add your token
nano test-backend-api.sh
# Replace YOUR_TOKEN_HERE with actual token

# Run the tests
./test-backend-api.sh
```

The script will test all endpoints and show results with color coding:
- 🟢 Green = Success
- 🔴 Red = Failed

---

## Next Steps After Verification

Once all tests pass:

1. ✅ Test complete profile setup flow in browser
2. ✅ Verify congratulations modal appears
3. ✅ Check profile page displays all data
4. ✅ Test edit functionality
5. ✅ Test with multiple users
6. ✅ Test error cases (invalid data, etc.)

---

## Need Help?

If tests are failing:

1. **Check backend logs** - Look for error messages
2. **Check database** - Verify columns exist
3. **Check API handler** - Ensure new fields are whitelisted
4. **Check validation** - Ensure validation rules allow new values
5. **Ask for help** - Share error messages and logs

---

**Status**: Ready for manual testing
**Time Required**: 15-30 minutes
**Prerequisites**: Backend running, valid auth token
