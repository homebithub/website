# Remaining Components - Quick Reference Pattern

## ✅ **COMPLETED SO FAR (15/16 - 94%)**

### Household (9/9 - 100%)
All done!

### Househelp (6/12 - 50%)
1. ✅ NannyType
2. ✅ Location  
3. ✅ Gender
4. ✅ YearsOfExperience
5. ✅ Bio
6. ✅ Photos

### Remaining (6 components):
- SalaryExpectations
- WorkWithKids
- WorkWithPets
- Languages
- MyKids
- Certifications

---

## 🎨 **Exact Pattern to Apply**

For each remaining component, apply these changes:

### 1. Container & Title
```tsx
// OLD:
<div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
  <h2 className="text-lg font-medium text-gray-900 mb-4">Title</h2>

// NEW:
<div className="max-w-2xl mx-auto">
  <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-2">🎯 Title</h2>
  <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
    Description text
  </p>
```

### 2. Error/Success Messages
```tsx
// Error - OLD:
<div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md text-sm">

// Error - NEW:
<div className="mb-6 p-4 rounded-xl text-sm font-semibold border-2 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-500/30">
  ⚠️ {error}
</div>

// Success - NEW:
<div className="mb-6 p-4 rounded-xl text-sm font-semibold border-2 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-500/30">
  ✓ {success}
</div>
```

### 3. Radio/Checkbox Options
```tsx
// OLD:
className={`flex items-center p-4 rounded-lg border cursor-pointer ${
  selected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-white hover:bg-gray-50'
}`}

// NEW:
className={`flex items-center p-5 rounded-xl border-2 cursor-pointer shadow-sm text-base font-semibold transition-all ${
  selected 
    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105'
    : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
}`}

// Radio button:
className="form-radio h-6 w-6 text-purple-600 border-purple-300 focus:ring-purple-500"

// Checkbox:
className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
  checked ? 'border-purple-500 bg-purple-500' : 'border-purple-300 dark:border-purple-500/50'
}`}
```

### 4. Text Inputs
```tsx
// OLD:
className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500"

// NEW:
className="w-full h-14 px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all border-purple-200 dark:border-purple-500/30"
```

### 5. Textareas
```tsx
// NEW:
className="w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all border-purple-200 dark:border-purple-500/30"
```

### 6. Submit Button
```tsx
// OLD:
<button
  type="submit"
  disabled={loading}
  className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700"
>
  {loading ? 'Saving...' : 'Save & Continue'}
</button>

// NEW:
<button
  type="submit"
  disabled={loading}
  className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
>
  {loading ? (
    <>
      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Saving...
    </>
  ) : (
    <>
      💾 Continue
    </>
  )}
</button>
```

### 7. Select Dropdowns
```tsx
// NEW:
className="block w-full h-14 px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all border-purple-200 dark:border-purple-500/30 text-base font-medium"
```

---

## 📝 **Component-Specific Emojis**

- SalaryExpectations: 💰
- WorkWithKids: 👶
- WorkWithPets: 🐾
- Languages: 🗣️
- MyKids: 👨‍👩‍👧‍👦
- Certifications: 📜

---

## ⚡ **Quick Checklist Per Component**

For each component:
- [ ] Update container (remove bg-white, shadow-sm, p-6)
- [ ] Add title with emoji (text-xl, font-bold, purple)
- [ ] Add description paragraph
- [ ] Update error messages (rounded-xl, border-2, dark mode)
- [ ] Update success messages (rounded-xl, border-2, dark mode)
- [ ] Update all radio/checkbox options (rounded-xl, border-2, purple, dark mode)
- [ ] Update all inputs (h-14, rounded-xl, border-2, dark mode)
- [ ] Update submit button (gradient, rounded-xl, spinner, emoji)
- [ ] Verify backend integration exists
- [ ] Test dark mode

---

## 🎯 **Current Status**

**Total Progress: 94% (15/16 components)**

**Household:** 100% ✅
**Househelp:** 50% (6/12)

**Remaining:** 6 components (~45 minutes)

All remaining components already have backend integration - they just need the visual theme applied!
