# Household Profile Setup - Endpoints & Step Tracking

## Overview
The household profile setup consists of 9 steps. Each step should save data AND track progress in the `profile_setup_steps` table.

## Step-by-Step Breakdown

### Step 0: Location
- **Component**: `Location.tsx`
- **Endpoint**: `POST /api/v1/location/save-user-location`
- **Handler**: `location_handler.go` → `SaveUserLocation()`
- **Step Tracking**: ✅ **IMPLEMENTED**
- **Step ID**: `location`
- **Step Number**: `0`
- **Implementation**:
  ```go
  TrackStepCompletion(h.DB, h.Logger, userID, profileType, "location", 0)
  ```

### Step 1: Children
- **Component**: `Children.tsx`
- **Endpoint**: `POST /api/v1/household_kids`
- **Handler**: `household_kids_handler.go` → `CreateHouseholdKid()`
- **Step Tracking**: ❌ **TODO**
- **Step ID**: `children`
- **Step Number**: `1`
- **Required Changes**:
  1. Add `db *gorm.DB` field to `HouseholdKidsHandler`
  2. Update constructor to accept `db` parameter
  3. Add tracking call after successful creation:
     ```go
     TrackStepCompletion(h.db, h.logger, userID, profileType, "children", 1)
     ```

### Step 2: Nanny Type (Service Type)
- **Component**: `NannyType.tsx`
- **Endpoint**: Uses `ProfileSetupContext` → `PATCH /api/v1/household/profile`
- **Handler**: `household_handler.go` → `UpdateHouseholdProfile()`
- **Step Tracking**: ⚠️ **PARTIALLY IMPLEMENTED** (needs metadata from frontend)
- **Step ID**: `nannytype`
- **Step Number**: `2`
- **Required Changes**:
  - Frontend needs to send `_step_metadata` in request:
    ```json
    {
      "service_type": "live-in",
      "_step_metadata": {
        "step_id": "nannytype",
        "step_number": 2,
        "is_completed": true
      }
    }
    ```

### Step 3: Budget
- **Component**: `Budget.tsx`
- **Endpoint**: `PUT /api/v1/household-preferences/budget`
- **Handler**: `household_preferences_handler.go` → `UpdateBudget()`
- **Step Tracking**: ❌ **TODO**
- **Step ID**: `budget`
- **Step Number**: `3`
- **Required Changes**:
  1. Add `db *gorm.DB` field to handler
  2. Update constructor
  3. Add tracking call after successful update

### Step 4: Chores & Duties
- **Component**: `Chores.tsx`
- **Endpoint**: `POST /api/v1/househelp-preferences/chores`
- **Handler**: `househelp_preferences_handler.go` → `CreateHousehelpPreference()`
- **Step Tracking**: ❌ **TODO**
- **Step ID**: `chores`
- **Step Number**: `4`
- **Required Changes**:
  1. Add `db *gorm.DB` field to handler
  2. Update constructor
  3. Add tracking call after successful creation

### Step 5: Pets
- **Component**: `Pets.tsx`
- **Endpoint**: `POST /api/v1/pets`
- **Handler**: `pets_handler.go` → `CreatePet()`
- **Step Tracking**: ❌ **TODO**
- **Step ID**: `pets`
- **Step Number**: `5`
- **Required Changes**:
  1. Add `db *gorm.DB` field to `PetsHandler`
  2. Update constructor
  3. Add tracking call after successful creation

### Step 6: House Size
- **Component**: `HouseSize.tsx`
- **Endpoint**: `PUT /api/v1/household-preferences/house-size`
- **Handler**: `household_preferences_handler.go` → `UpdateHouseSize()`
- **Step Tracking**: ❌ **TODO**
- **Step ID**: `housesize`
- **Step Number**: `6`
- **Required Changes**:
  1. Add `db *gorm.DB` field to handler (if not already added from budget)
  2. Add tracking call after successful update

### Step 7: Bio (About Your Household)
- **Component**: `Bio.tsx`
- **Endpoint**: Uses `ProfileSetupContext` → `PATCH /api/v1/household/profile`
- **Handler**: `household_handler.go` → `UpdateHouseholdProfile()`
- **Step Tracking**: ⚠️ **PARTIALLY IMPLEMENTED** (needs metadata from frontend)
- **Step ID**: `bio`
- **Step Number**: `7`
- **Required Changes**:
  - Frontend needs to send `_step_metadata` in request

### Step 8: Photos
- **Component**: `Photos.tsx`
- **Endpoint**: Uses `ProfileSetupContext` → `PATCH /api/v1/household/profile`
- **Handler**: `household_handler.go` → `UpdateHouseholdProfile()`
- **Step Tracking**: ⚠️ **PARTIALLY IMPLEMENTED** (needs metadata from frontend)
- **Step ID**: `photos`
- **Step Number**: `8`
- **Required Changes**:
  - Frontend needs to send `_step_metadata` in request

## Implementation Summary

### ✅ Completed (1/9)
- Step 0: Location

### ⚠️ Partially Implemented (3/9)
- Step 2: Nanny Type (backend ready, needs frontend metadata)
- Step 7: Bio (backend ready, needs frontend metadata)
- Step 8: Photos (backend ready, needs frontend metadata)

### ❌ Not Implemented (5/9)
- Step 1: Children
- Step 3: Budget
- Step 4: Chores
- Step 5: Pets
- Step 6: House Size

## Helper Function

All handlers can use the centralized helper function:

```go
// In handlers/step_tracking_helper.go
func TrackStepCompletion(
    db *gorm.DB, 
    logger *zap.Logger, 
    userID uuid.UUID, 
    profileType string, 
    stepID string, 
    stepNumber int
)
```

## Next Steps

1. **Add DB field to all handlers** that need step tracking
2. **Update constructors** to accept `db *gorm.DB` parameter
3. **Update server.go** to pass `s.db` when creating handlers
4. **Add tracking calls** after successful data saves
5. **Update frontend components** to send `_step_metadata` for steps 2, 7, 8

## Testing

After implementation, verify by:
1. Complete each step in the profile setup
2. Query `profile_setup_steps` table:
   ```sql
   SELECT * FROM profile_setup_steps 
   WHERE user_id = '<user_id>' 
   ORDER BY step_number;
   ```
3. Verify all 9 steps are tracked with `is_completed = true`
