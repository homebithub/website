# Househelp Profile Setup - Component Audit

## 📋 Updated Flow (13 Steps)

1. **Location** ⭐
2. **Service Type & Availability** ⭐
3. **Personal Info (Gender & Age)** ⭐
4. **Experience & Certifications** ⭐
5. **Salary Expectations** ⭐
6. **Work with Kids** ⭐
7. **Work with Pets** ⭐
8. **Languages** ⭐
9. **My Kids & Preferred Work Environment**
10. **References**
11. **Background Check Consent**
12. **About You / Bio** ⭐
13. **Photos**

---

## ✅ Component Availability & Status

### Step 1: Location ✅
- **Component**: `/app/components/Location.tsx`
- **Status**: EXISTS & THEMED
- **Features**:
  - Mapbox autocomplete
  - Purple theme applied
  - Dark mode support
  - Error/success states with purple styling
  - API integration ready
- **Action**: ✅ READY TO USE

---

### Step 2: Service Type & Availability ⚠️
- **Component**: `/app/components/NanyType.tsx`
- **Status**: EXISTS BUT NEEDS MODIFICATION
- **Current Features**:
  - Live-in vs Day worker selection
  - Schedule selector (days/times)
  - Off-days for live-in
  - Available from date
  - Purple theme applied
- **Issues**:
  - Currently configured for HOUSEHOLD (checking household profile endpoint)
  - Needs to be adapted for HOUSEHELP perspective
- **Action**: 🔧 NEEDS MODIFICATION
  - Change API endpoint from `/household/profile` to `/househelps/me/fields`
  - Adjust field names to match househelp schema
  - Update labels from "needs" to "offers" perspective

---

### Step 3: Personal Info (Gender & Age) ✅
- **Component**: `/app/components/Gender.tsx`
- **Status**: EXISTS & THEMED
- **Features**:
  - Gender selection (radio buttons)
  - Date of birth input
  - 18+ age validation
  - Purple theme with dark mode
  - Error/success states
  - API integration with `/househelps/me/fields`
- **Action**: ✅ READY TO USE

---

### Step 4: Experience & Certifications ⚠️
- **Experience Component**: `/app/components/YearsOfExperience.tsx` ✅
  - Exists and themed
  - 0-5+ years options
  - Custom input for 5+ years
  - Purple theme applied
  
- **Certifications Component**: `/app/components/Certifications.tsx` ⚠️
  - Exists but NEEDS ENHANCEMENT
  - Current certifications list:
    - Valid driving license
    - Certificate of Good Conduct
    - First Aid certificate
    - Non-smoker
    - Diploma in Housekeeping
    - Childcare certification
    - Special needs care experience
    - Food Handling certificate
  - Also includes "Can help with" section
  
- **Action**: 🔧 NEEDS MODIFICATION
  - Add "Other" option with multiple text inputs
  - Combine with Experience component into one step
  - Keep purple theme consistent

---

### Step 5: Salary Expectations ✅
- **Component**: `/app/components/SalaryExpectations.tsx`
- **Status**: EXISTS & THEMED
- **Features**:
  - Frequency selector (Day/Week/Month)
  - Salary range options
  - "Negotiable" option
  - Purple theme with dark mode
  - API integration ready
- **Action**: ✅ READY TO USE

---

### Step 6: Work with Kids ✅
- **Component**: `/app/components/WorkWithKids.tsx`
- **Status**: EXISTS & THEMED
- **Features**:
  - Yes/No preference
  - Age range selection (0-2, 2-5, 5-10, 10+)
  - Children capacity (1-2, 2-4, 5+)
  - Purple theme applied
  - API integration ready
- **Action**: ✅ READY TO USE

---

### Step 7: Work with Pets ✅
- **Component**: `/app/components/WorkWithPets.tsx`
- **Status**: EXISTS & THEMED
- **Features**:
  - Yes/No preference
  - Pet type selection (dogs, cats, birds, fish, reptiles, small mammals)
  - "Other" option with text input
  - Input validation
  - Purple theme with dark mode
  - API integration ready
- **Action**: ✅ READY TO USE

---

### Step 8: Languages ✅
- **Component**: `/app/components/Languages.tsx`
- **Status**: EXISTS (Need to verify theming)
- **Action**: 🔍 NEEDS VERIFICATION
  - Check if purple theme is applied
  - Verify API integration
  - Ensure dark mode support

---

### Step 9: My Kids & Preferred Work Environment ⚠️
- **My Kids Component**: `/app/components/MyKids.tsx` ✅
  - Exists and themed
  - Options: No kids, Has kids, Needs accommodation
  - Children details input
  - Purple theme applied
  
- **Preferred Work Environment**: ❌ DOES NOT EXIST
  
- **Action**: 🔧 NEEDS CREATION
  - Create new component for preferred work environment
  - Combine with MyKids component
  - Add fields:
    - Household size preference
    - Location type (urban/suburban/rural)
    - Family type preference
  - Apply purple theme

---

### Step 10: References ❌
- **Component**: DOES NOT EXIST
- **Action**: 🆕 NEEDS CREATION
  - Create new References component
  - Fields needed:
    - Previous employer name
    - Contact phone/email
    - Relationship (employer, supervisor, etc.)
    - Duration worked
    - Add multiple references (2-3)
  - Apply purple theme
  - Make optional/skippable

---

### Step 11: Background Check Consent ❌
- **Component**: DOES NOT EXIST
- **Action**: 🆕 NEEDS CREATION
  - Create simple consent component
  - Yes/No radio buttons
  - Explanation text about what it entails
  - Apply purple theme
  - Make optional/skippable

---

### Step 12: About You / Bio ✅
- **Component**: `/app/components/Bio.tsx` OR `/app/components/features/Bio.tsx`
- **Status**: EXISTS (Need to verify which one is used)
- **Action**: 🔍 NEEDS VERIFICATION
  - Check if purple theme is applied
  - Verify it accepts `userType` prop
  - Ensure proper API integration

---

### Step 13: Photos ✅
- **Component**: `/app/components/Photos.tsx`
- **Status**: EXISTS (Need to verify theming)
- **Action**: 🔍 NEEDS VERIFICATION
  - Check if purple theme is applied
  - Verify it accepts `userType` prop
  - Add encouragement message: "Profiles with photos are 3x more likely to be contacted"
  - Ensure optional but recommended

---

## 🎨 Theme Consistency Check

### Current Theme Pattern (From Gender.tsx):
```tsx
// Headers
className="text-xl font-bold text-purple-700 dark:text-purple-400"

// Descriptions
className="text-base text-gray-600 dark:text-gray-400"

// Error Messages
className="mb-6 p-4 rounded-xl text-sm font-semibold border-2 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-500/30"

// Success Messages
className="mb-6 p-4 rounded-xl text-sm font-semibold border-2 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-500/30"

// Input Fields
className="w-full h-14 px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all border-purple-200 dark:border-purple-500/30"

// Radio/Checkbox Options (Selected)
className="border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105"

// Radio/Checkbox Options (Unselected)
className="border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20"

// Submit Buttons
className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
```

---

## 📊 Summary

### Components Ready: 6/13
1. ✅ Location
2. ✅ Gender & Age
3. ✅ Experience
4. ✅ Salary Expectations
5. ✅ Work with Kids
6. ✅ Work with Pets

### Components Need Modification: 2/13
1. 🔧 Service Type & Availability (change from household to househelp perspective)
2. 🔧 Certifications (add "Other" option with multiple inputs)

### Components Need Verification: 3/13
1. 🔍 Languages
2. 🔍 Bio
3. 🔍 Photos

### Components Need Creation: 3/13
1. 🆕 Preferred Work Environment (combine with MyKids)
2. 🆕 References
3. 🆕 Background Check Consent

### Components Need Combination: 2 pairs
1. Experience + Certifications → One step
2. MyKids + Preferred Work Environment → One step

---

## 🚀 Implementation Priority

### Phase 1: Verify & Fix Existing (High Priority)
1. Verify Languages component theming
2. Verify Bio component theming
3. Verify Photos component theming
4. Modify NanyType for househelp perspective
5. Enhance Certifications with "Other" option

### Phase 2: Create New Components (Medium Priority)
1. Create Preferred Work Environment component
2. Create References component
3. Create Background Check Consent component

### Phase 3: Combine Components (Low Priority)
1. Combine Experience + Certifications into one step
2. Combine MyKids + Preferred Work Environment into one step

### Phase 4: Testing & Polish
1. Test all components with API
2. Ensure consistent theming across all steps
3. Test dark mode on all components
4. Test responsive design on mobile
5. Test validation and error handling

---

## 🔧 Next Steps

1. **Verify the 3 uncertain components** (Languages, Bio, Photos)
2. **Modify NanyType component** for househelp perspective
3. **Enhance Certifications** with "Other" option
4. **Create 3 new components** (Preferred Work Environment, References, Background Check)
5. **Update profile-setup.househelp.tsx** with new step order
6. **Test complete flow** end-to-end
