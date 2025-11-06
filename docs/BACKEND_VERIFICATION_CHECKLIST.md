# Backend Verification Checklist 🔍

## 📋 Overview

This document outlines all the backend requirements for the househelp profile setup flow, including new fields added in Phases 1-3.

---

## 🗄️ Database Schema Requirements

### Table: `househelps`

#### Existing Fields (Verify These Exist):
```sql
-- Core Identity
id SERIAL PRIMARY KEY,
user_id INTEGER REFERENCES users(id),
first_name VARCHAR(100),
last_name VARCHAR(100),
gender VARCHAR(20),
date_of_birth DATE,

-- Location
location VARCHAR(255),
latitude DECIMAL(10, 8),
longitude DECIMAL(11, 8),

-- Experience & Skills
years_of_experience INTEGER,
certifications TEXT,  -- Comma-separated
can_help_with TEXT,   -- Comma-separated

-- Salary
salary_expectation VARCHAR(50),
salary_frequency VARCHAR(20),  -- 'daily', 'weekly', 'monthly'

-- Work Preferences
can_work_with_kid BOOLEAN,
children_age_range VARCHAR(100),  -- Comma-separated: '0-2,2-5,5-10,10+'
number_of_concurrent_children INTEGER,

can_work_with_pet BOOLEAN,
pet_types TEXT,  -- Comma-separated

-- Languages
languages TEXT,  -- Comma-separated

-- Personal
has_kids BOOLEAN,
needs_accommodation BOOLEAN,
children JSONB,  -- Array of child objects

-- Profile
bio TEXT,
profile_picture VARCHAR(255),

-- Timestamps
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

#### NEW FIELDS REQUIRED (From Phases 1-3):
```sql
-- Service Type & Availability (Phase 1 - NanyType)
offers_live_in BOOLEAN DEFAULT false,
offers_day_worker BOOLEAN DEFAULT false,
off_days TEXT,  -- Comma-separated: 'Monday,Sunday'
availability_schedule TEXT,  -- JSON string: '{"monday":{"morning":true,...}}'
available_from DATE,

-- Work Environment Preferences (Phase 2 - PreferredWorkEnvironment)
preferred_household_size VARCHAR(50),  -- 'small', 'medium', 'large', 'any'
preferred_location_type VARCHAR(50),   -- 'urban', 'suburban', 'rural', 'any'
preferred_family_type VARCHAR(50),     -- 'single', 'couple', 'young_family', 'elderly', 'any'
work_environment_notes TEXT,

-- References (Phase 2 - References)
references TEXT,  -- JSON string: '[{"name":"...","relationship":"...","phone":"...","email":"...","duration":"..."}]'

-- Background Check (Phase 2 - BackgroundCheckConsent)
background_check_consent BOOLEAN DEFAULT false,
background_check_status VARCHAR(50),  -- 'pending', 'in_progress', 'completed', 'failed'
background_check_date TIMESTAMP
```

---

## 🔌 API Endpoints to Verify

### 1. GET `/api/v1/househelps/me/fields`

**Purpose**: Load existing househelp profile data

**Headers**:
```
Authorization: Bearer <token>
```

**Expected Response** (200 OK):
```json
{
  "id": 123,
  "user_id": 456,
  "first_name": "Jane",
  "last_name": "Doe",
  "gender": "female",
  "date_of_birth": "1995-05-15",
  "location": "Nairobi, Kenya",
  "years_of_experience": 5,
  "certifications": "I have a valid driving license,I have a First Aid certificate,CPR Certified",
  "can_help_with": "Cooking,Childcare,Elderly care,Gardening",
  "salary_expectation": "30000-40000",
  "salary_frequency": "monthly",
  "can_work_with_kid": true,
  "children_age_range": "0-2,2-5",
  "number_of_concurrent_children": 2,
  "can_work_with_pet": true,
  "pet_types": "dog,cat",
  "languages": "English,Swahili,Kikuyu",
  "has_kids": false,
  "needs_accommodation": false,
  "bio": "Experienced househelp with 5 years...",
  "profile_picture": "https://...",
  
  // NEW FIELDS
  "offers_live_in": true,
  "offers_day_worker": false,
  "off_days": "Sunday,Monday",
  "availability_schedule": "{\"monday\":{\"morning\":true,\"afternoon\":false,\"evening\":true}}",
  "available_from": "2025-01-01",
  "preferred_household_size": "medium",
  "preferred_location_type": "urban",
  "preferred_family_type": "young_family",
  "work_environment_notes": "Prefer quiet households",
  "references": "[{\"name\":\"John Doe\",\"relationship\":\"Previous Employer\",\"phone\":\"0712345678\",\"email\":\"john@example.com\",\"duration\":\"2 years\"}]",
  "background_check_consent": true,
  "background_check_status": null,
  "background_check_date": null,
  
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-15T12:00:00Z"
}
```

**Test Command** (cURL):
```bash
curl -X GET \
  http://localhost:8000/api/v1/househelps/me/fields \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json'
```

**Verification Checklist**:
- [ ] Endpoint returns 200 OK
- [ ] All existing fields are present
- [ ] All NEW fields are present (or null if not set)
- [ ] Field types match expected types
- [ ] Dates are in ISO format
- [ ] JSON strings are valid JSON

---

### 2. PATCH `/api/v1/househelps/me/fields`

**Purpose**: Update househelp profile fields

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body Format**:
```json
{
  "updates": {
    "field_name": "value"
  }
}
```

**Test Cases**:

#### Test 1: Update Service Type (NanyType)
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
      "availability_schedule": "{\"monday\":{\"morning\":true,\"afternoon\":false,\"evening\":true}}",
      "available_from": "2025-01-01"
    }
  }'
```

**Expected Response**: 200 OK
```json
{
  "message": "Profile updated successfully",
  "updated_fields": ["offers_live_in", "offers_day_worker", "off_days", "availability_schedule", "available_from"]
}
```

**Verification**:
- [ ] Returns 200 OK
- [ ] Fields are saved to database
- [ ] GET request returns updated values
- [ ] Boolean fields accept true/false
- [ ] Date fields accept ISO format
- [ ] Text fields accept long strings

---

#### Test 2: Update Certifications (Enhanced)
```bash
curl -X PATCH \
  http://localhost:8000/api/v1/househelps/me/fields \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '{
    "updates": {
      "certifications": "I have a valid driving license,I have a First Aid certificate,CPR Certified,Food Safety Level 2",
      "can_help_with": "Cooking,Childcare,Elderly care,Gardening,Pet care"
    }
  }'
```

**Expected Response**: 200 OK

**Verification**:
- [ ] Accepts comma-separated custom values
- [ ] Handles special characters in custom values
- [ ] Trims whitespace correctly
- [ ] Handles empty strings

---

#### Test 3: Update Work Environment Preferences
```bash
curl -X PATCH \
  http://localhost:8000/api/v1/househelps/me/fields \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '{
    "updates": {
      "preferred_household_size": "medium",
      "preferred_location_type": "urban",
      "preferred_family_type": "young_family",
      "work_environment_notes": "I prefer quiet households with a structured routine. I am comfortable with pets and children."
    }
  }'
```

**Expected Response**: 200 OK

**Verification**:
- [ ] Accepts enum values for preferences
- [ ] Accepts long text for notes
- [ ] Handles null/empty values
- [ ] Validates enum values (optional)

---

#### Test 4: Update References
```bash
curl -X PATCH \
  http://localhost:8000/api/v1/househelps/me/fields \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '{
    "updates": {
      "references": "[{\"name\":\"John Doe\",\"relationship\":\"Previous Employer\",\"phone\":\"0712345678\",\"email\":\"john@example.com\",\"duration\":\"2 years\"},{\"name\":\"Jane Smith\",\"relationship\":\"Supervisor\",\"phone\":\"0723456789\",\"email\":\"jane@example.com\",\"duration\":\"1 year\"}]"
    }
  }'
```

**Expected Response**: 200 OK

**Verification**:
- [ ] Accepts JSON string
- [ ] Validates JSON format (optional)
- [ ] Handles escaped quotes
- [ ] Handles multiple references
- [ ] Handles empty array "[]"

---

#### Test 5: Update Background Check Consent
```bash
curl -X PATCH \
  http://localhost:8000/api/v1/househelps/me/fields \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '{
    "updates": {
      "background_check_consent": true
    }
  }'
```

**Expected Response**: 200 OK

**Verification**:
- [ ] Accepts boolean values
- [ ] Defaults to false if not set
- [ ] Can be updated multiple times

---

### 3. POST `/api/v1/profile-setup-progress`

**Purpose**: Track profile setup progress

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "profile_type": "househelp",
  "current_step": 5,
  "last_completed_step": 5,
  "completed_steps": [1, 2, 3, 4, 5],
  "step_id": "certifications",
  "time_spent_seconds": 120,
  "status": "in_progress",
  "skipped": false,
  "is_auto_save": false
}
```

**Test Command**:
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
  }'
```

**Expected Response**: 200 OK
```json
{
  "message": "Progress saved successfully",
  "progress_id": 789
}
```

**Verification**:
- [ ] Endpoint exists and returns 200
- [ ] Progress is saved to database
- [ ] Can retrieve progress on next login
- [ ] Handles auto-save correctly
- [ ] Handles completion (status: "completed")
- [ ] Handles skipped steps

---

## 🧪 Testing Scenarios

### Scenario 1: New User Onboarding
1. User signs up as househelp
2. User goes through all 15 steps
3. Each step saves via `PATCH /api/v1/househelps/me/fields`
4. Progress tracked via `POST /api/v1/profile-setup-progress`
5. Final step triggers completion
6. Congratulations modal appears
7. User redirected to `/househelp/profile`

**Verify**:
- [ ] All fields save correctly
- [ ] Progress is tracked
- [ ] Profile is marked as complete
- [ ] Profile page displays all data

---

### Scenario 2: Returning User (Resume Setup)
1. User starts profile setup
2. User completes 5 steps
3. User closes browser
4. User returns later
5. User should resume from step 6

**Verify**:
- [ ] Progress is loaded from backend
- [ ] User starts at correct step
- [ ] Previously saved data is displayed
- [ ] User can continue from where they left off

---

### Scenario 3: Edit Existing Profile
1. User has completed profile
2. User goes to `/househelp/profile`
3. User clicks "Edit" on a section
4. User updates a field
5. Field saves via `PATCH /api/v1/househelps/me/fields`

**Verify**:
- [ ] Edit mode works
- [ ] Updates save correctly
- [ ] Profile page refreshes with new data
- [ ] No duplicate entries created

---

### Scenario 4: Optional Fields
1. User skips optional steps (References, Background Check, etc.)
2. Profile should still be complete

**Verify**:
- [ ] Optional fields can be null
- [ ] Profile is marked as complete without optional fields
- [ ] User can add optional fields later

---

## 🚨 Error Handling

### Test Error Cases:

#### 1. Invalid Token
```bash
curl -X GET \
  http://localhost:8000/api/v1/househelps/me/fields \
  -H 'Authorization: Bearer INVALID_TOKEN'
```

**Expected**: 401 Unauthorized
- [ ] Returns proper error message
- [ ] Doesn't expose sensitive data

---

#### 2. Missing Required Fields
```bash
curl -X PATCH \
  http://localhost:8000/api/v1/househelps/me/fields \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '{
    "updates": {
      "date_of_birth": "invalid-date"
    }
  }'
```

**Expected**: 400 Bad Request
- [ ] Returns validation error
- [ ] Specifies which field is invalid
- [ ] Doesn't save partial data

---

#### 3. Invalid Field Names
```bash
curl -X PATCH \
  http://localhost:8000/api/v1/househelps/me/fields \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '{
    "updates": {
      "non_existent_field": "value"
    }
  }'
```

**Expected**: 400 Bad Request OR field is ignored
- [ ] Handles gracefully
- [ ] Doesn't crash server
- [ ] Returns clear error message

---

#### 4. SQL Injection Attempt
```bash
curl -X PATCH \
  http://localhost:8000/api/v1/househelps/me/fields \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '{
    "updates": {
      "bio": "Test\"; DROP TABLE househelps; --"
    }
  }'
```

**Expected**: Field is safely escaped
- [ ] No SQL injection occurs
- [ ] Data is properly escaped
- [ ] Field saves as literal string

---

## 📊 Database Migration Script

If new fields don't exist, here's the migration script:

```sql
-- Add new fields to househelps table
ALTER TABLE househelps
  -- Service Type & Availability
  ADD COLUMN IF NOT EXISTS offers_live_in BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS offers_day_worker BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS off_days TEXT,
  ADD COLUMN IF NOT EXISTS availability_schedule TEXT,
  ADD COLUMN IF NOT EXISTS available_from DATE,
  
  -- Work Environment Preferences
  ADD COLUMN IF NOT EXISTS preferred_household_size VARCHAR(50),
  ADD COLUMN IF NOT EXISTS preferred_location_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS preferred_family_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS work_environment_notes TEXT,
  
  -- References
  ADD COLUMN IF NOT EXISTS references TEXT,
  
  -- Background Check
  ADD COLUMN IF NOT EXISTS background_check_consent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS background_check_status VARCHAR(50),
  ADD COLUMN IF NOT EXISTS background_check_date TIMESTAMP;

-- Add indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_househelps_offers_live_in ON househelps(offers_live_in);
CREATE INDEX IF NOT EXISTS idx_househelps_offers_day_worker ON househelps(offers_day_worker);
CREATE INDEX IF NOT EXISTS idx_househelps_available_from ON househelps(available_from);
CREATE INDEX IF NOT EXISTS idx_househelps_preferred_household_size ON househelps(preferred_household_size);
CREATE INDEX IF NOT EXISTS idx_househelps_preferred_location_type ON househelps(preferred_location_type);
CREATE INDEX IF NOT EXISTS idx_househelps_background_check_consent ON househelps(background_check_consent);

-- Add comments for documentation
COMMENT ON COLUMN househelps.offers_live_in IS 'Whether househelp offers live-in service';
COMMENT ON COLUMN househelps.offers_day_worker IS 'Whether househelp offers day worker service';
COMMENT ON COLUMN househelps.off_days IS 'Comma-separated list of off days (e.g., "Monday,Sunday")';
COMMENT ON COLUMN househelps.availability_schedule IS 'JSON string of availability schedule';
COMMENT ON COLUMN househelps.available_from IS 'Date when househelp is available to start';
COMMENT ON COLUMN househelps.preferred_household_size IS 'Preferred household size: small, medium, large, any';
COMMENT ON COLUMN househelps.preferred_location_type IS 'Preferred location type: urban, suburban, rural, any';
COMMENT ON COLUMN househelps.preferred_family_type IS 'Preferred family type: single, couple, young_family, elderly, any';
COMMENT ON COLUMN househelps.work_environment_notes IS 'Additional notes about preferred work environment';
COMMENT ON COLUMN househelps.references IS 'JSON string array of professional references';
COMMENT ON COLUMN househelps.background_check_consent IS 'Whether househelp consents to background check';
COMMENT ON COLUMN househelps.background_check_status IS 'Status of background check: pending, in_progress, completed, failed';
COMMENT ON COLUMN househelps.background_check_date IS 'Date when background check was completed';
```

---

## ✅ Verification Checklist

### Database:
- [ ] All new columns exist in `househelps` table
- [ ] Column types match requirements
- [ ] Indexes are created for performance
- [ ] Default values are set correctly

### API Endpoints:
- [ ] `GET /api/v1/househelps/me/fields` returns all fields
- [ ] `PATCH /api/v1/househelps/me/fields` accepts all new fields
- [ ] `POST /api/v1/profile-setup-progress` works correctly
- [ ] Error handling is implemented
- [ ] Authentication is enforced

### Data Validation:
- [ ] Enum fields validate values
- [ ] Date fields accept ISO format
- [ ] JSON fields validate JSON syntax
- [ ] Text fields handle special characters
- [ ] Boolean fields accept true/false

### Integration:
- [ ] Frontend can save all fields
- [ ] Frontend can load all fields
- [ ] Profile page displays all fields
- [ ] Edit mode works for all fields

---

## 🚀 Next Steps

1. **Run Database Migration** (if needed)
2. **Test All API Endpoints** (use cURL commands above)
3. **Verify Data Persistence** (save → reload → verify)
4. **Test Error Cases** (invalid data, missing auth, etc.)
5. **Integration Test** (complete full flow end-to-end)
6. **Profile Page Verification** (ensure it displays new fields)

---

## 📝 Notes

- All text fields should support UTF-8 for international characters
- JSON fields should be validated before saving
- Consider adding field-level validation in backend
- Consider adding rate limiting for API endpoints
- Consider adding audit logging for profile changes

---

**Status**: Ready for backend verification
**Priority**: HIGH - Required for production deployment
**Estimated Time**: 2-3 hours for complete verification
