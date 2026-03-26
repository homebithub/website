# Website Code Quality Issues - Summary

**Generated:** March 12, 2026  
**Source:** CI/CD Build and Test Logs

## Executive Summary

The website codebase has **5,966 warnings** from ESLint and extensive test issues. While the build passes, the code quality needs significant improvement across TypeScript types, accessibility, React best practices, and test coverage.

---

## 1. ESLint Warnings Breakdown (5,966 total)

### Critical Issues by Category:

#### **TypeScript Type Safety (High Priority)**
- **~2,479 instances**: `prefer-const` - Variables declared with `let` that should be `const`
- **~683 instances**: `no-case-declarations` - Variable declarations in switch cases without blocks
- **~500+ instances**: `@typescript-eslint/no-explicit-any` - Overuse of `any` type instead of proper types
- **~100+ instances**: `@typescript-eslint/no-unused-vars` - Unused variables and imports

**Impact:** Type safety is compromised, making refactoring dangerous and bugs harder to catch.

#### **Accessibility Issues (Medium Priority)**
- **~200+ instances**: `jsx-a11y/label-has-associated-control` - Form labels not properly associated with inputs
- **~100+ instances**: `jsx-a11y/click-events-have-key-events` - Click handlers without keyboard support
- **~100+ instances**: `jsx-a11y/no-static-element-interactions` - Non-interactive elements with event handlers
- **~50+ instances**: `jsx-a11y/aria-role` - Invalid ARIA roles
- **~20+ instances**: `jsx-a11y/img-redundant-alt` - Images with redundant alt text
- **~10+ instances**: `jsx-a11y/no-autofocus` - Autofocus usage issues

**Impact:** Website is not accessible to users with disabilities, potential legal/compliance issues.

#### **React Best Practices (Medium Priority)**
- **~50+ instances**: `react/no-unescaped-entities` - Unescaped quotes and apostrophes in JSX
- **~30+ instances**: `react-hooks/exhaustive-deps` - Missing dependencies in useEffect/useCallback
- **~10+ instances**: `no-extra-semi` - Unnecessary semicolons
- **~5+ instances**: `react-hooks/rules-of-hooks` - Hooks called conditionally

**Impact:** Potential runtime bugs, re-render issues, and React violations.

#### **Import/Module Issues (Low Priority)**
- **~20+ instances**: `import/export` - Import/export conflicts
- **~10+ instances**: `import/no-unresolved` - Unresolved imports (disabled in config)

---

## 2. Test Suite Issues

### **React Testing Warnings**
- **Hundreds of instances**: "An update to [Component] inside a test was not wrapped in act(...)"
  - Affects: `NanyType`, `Bio`, `Location`, `Languages`, and many other components
  - **Root cause:** Async state updates in tests not properly wrapped
  - **Impact:** Tests may pass but don't accurately reflect real user behavior

### **Affected Test Files (Partial List):**
```
app/components/__tests__/NanyType.test.tsx
app/components/__tests__/Bio.test.tsx
app/components/__tests__/Location.test.tsx
app/components/__tests__/Languages.test.tsx
app/components/__tests__/Certifications.test.tsx
app/components/__tests__/Chores.test.tsx
app/components/__tests__/Pets.test.tsx
app/components/__tests__/Children.test.tsx
app/components/__tests__/HouseSize.test.tsx
app/components/__tests__/Salary.test.tsx
```

### **Test Coverage Gaps**
- Many components have tests but they're not properly testing async behavior
- State updates happen outside of `act()` wrapper
- Tests may give false confidence

---

## 3. Most Problematic Files

### **High Warning Count Files:**

1. **`app/components/AuthenticatedHome.tsx`**
   - 15+ warnings (TypeScript `any`, accessibility, ARIA roles)

2. **`app/components/HousehelpHome.tsx`**
   - 20+ warnings (TypeScript `any`, accessibility, unused vars, ARIA roles)

3. **`app/components/HousehelpSignupFlow.tsx`**
   - 12+ warnings (accessibility, React hooks deps, unescaped entities)

4. **`app/routes/profile-setup.househelp.tsx`**
   - Multiple warnings (TypeScript, accessibility)

5. **`app/routes/profile-setup.household.tsx`**
   - Multiple warnings (TypeScript, accessibility)

6. **`app/routes/inbox.tsx`**
   - Multiple warnings (TypeScript, state management)

---

## 4. Recommended Action Plan

### **Phase 1: Critical Fixes (High Impact, Low Effort)**
1. **Fix `prefer-const` violations** (~2,479 instances)
   - Run: `npm run lint -- --fix` to auto-fix most
   - Estimated time: 5 minutes

2. **Fix `no-case-declarations` violations** (~683 instances)
   - Wrap case statements in blocks: `case X: { ... }`
   - Can be partially automated

3. **Remove unused imports/variables** (~100+ instances)
   - Run: `npm run lint -- --fix`
   - Manual review for intentional unused vars

### **Phase 2: Type Safety Improvements (High Impact, Medium Effort)**
1. **Replace `any` types with proper types** (~500+ instances)
   - Start with most-used components
   - Create proper interfaces/types
   - Estimated time: 2-3 days

2. **Fix React Hooks dependencies** (~30+ instances)
   - Add missing dependencies or use `useCallback`/`useMemo` properly
   - Estimated time: 1 day

### **Phase 3: Accessibility Fixes (Medium Impact, Medium Effort)**
1. **Associate labels with form controls** (~200+ instances)
   - Add `htmlFor` to labels or wrap inputs
   - Estimated time: 2 days

2. **Add keyboard event handlers** (~100+ instances)
   - Add `onKeyDown`/`onKeyPress` alongside `onClick`
   - Make interactive elements keyboard-accessible
   - Estimated time: 2 days

3. **Fix ARIA roles and attributes** (~50+ instances)
   - Use semantic HTML or correct ARIA roles
   - Estimated time: 1 day

### **Phase 4: Test Quality Improvements (Medium Impact, High Effort)**
1. **Wrap async updates in `act()`** (hundreds of instances)
   - Update all component tests
   - Use `waitFor` from testing-library
   - Estimated time: 3-4 days

2. **Add missing test coverage**
   - Identify untested components
   - Write comprehensive tests
   - Estimated time: 1 week

### **Phase 5: Code Quality Standards (Low Impact, Ongoing)**
1. **Fix unescaped entities** (~50+ instances)
   - Replace quotes with HTML entities
   - Estimated time: 1 day

2. **Remove unnecessary semicolons** (~10+ instances)
   - Auto-fixable
   - Estimated time: 5 minutes

---

## 5. Long-term Recommendations

### **Tooling & Process**
1. **Enable stricter ESLint rules** - Convert warnings to errors for new code
2. **Add pre-commit hooks** - Run linting and type checking before commits
3. **Set up Husky + lint-staged** - Auto-fix issues on commit
4. **Add SonarQube/CodeClimate** - Track code quality metrics over time

### **Code Standards**
1. **TypeScript strict mode** - Enable `strict: true` in tsconfig.json
2. **No implicit any** - Enforce explicit types everywhere
3. **Accessibility audit** - Run automated a11y tests (axe, lighthouse)
4. **Component library** - Create reusable, accessible components

### **Testing Standards**
1. **Test coverage targets** - Aim for 80%+ coverage
2. **Integration tests** - Add E2E tests with Playwright/Cypress
3. **Visual regression tests** - Catch UI breaking changes
4. **Performance budgets** - Monitor bundle size and load times

---

## 6. Quick Wins (Do These First)

Run these commands to auto-fix ~3,000+ warnings immediately:

```bash
cd website
npm run lint -- --fix
```

This will automatically fix:
- `prefer-const` violations
- `no-extra-semi` violations
- Some `no-unused-vars` violations
- Import ordering issues

**Estimated time:** 5 minutes  
**Impact:** Reduces warnings from 5,966 to ~2,500

---

## 7. Estimated Total Effort

| Phase | Effort | Impact | Priority |
|-------|--------|--------|----------|
| Phase 1: Auto-fixes | 1 hour | High | **Immediate** |
| Phase 2: Type Safety | 2-3 days | High | **Week 1** |
| Phase 3: Accessibility | 5 days | Medium | **Week 2-3** |
| Phase 4: Test Quality | 1-2 weeks | Medium | **Month 1** |
| Phase 5: Code Quality | 2 days | Low | **Ongoing** |

**Total estimated effort:** 3-4 weeks of focused development work

---

## 8. Conclusion

The website is functional but has significant technical debt:
- **5,966 ESLint warnings** indicate systemic code quality issues
- **Heavy use of `any` types** compromises type safety
- **Accessibility violations** make the site unusable for some users
- **Test quality issues** reduce confidence in changes

**Recommendation:** Allocate 3-4 weeks for a focused code quality sprint to address these issues systematically. Start with auto-fixable items (Phase 1) for immediate wins, then tackle type safety and accessibility in parallel.
