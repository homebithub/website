# Frontend Testing Implementation Guide

**Date:** February 26, 2026  
**Status:** ✅ COMPLETE - Ready for Use

---

## Overview

Comprehensive unit testing setup for the Homebit frontend application using Vitest and React Testing Library. All tests focus on theme consistency, mobile responsiveness, accessibility, and user interactions.

---

## What Was Implemented

### 1. Testing Framework Setup

**Vitest Configuration** (`vitest.config.ts`):
- React plugin for JSX support
- TypeScript paths resolution
- jsdom environment for DOM testing
- Coverage reporting (v8 provider)
- CSS modules support
- Path aliases configuration

**Test Setup** (`app/test/setup.ts`):
- jest-dom matchers integration
- Automatic cleanup after each test
- window.matchMedia mock
- IntersectionObserver mock
- ResizeObserver mock
- localStorage/sessionStorage mocks
- scrollTo mock

### 2. Test Utilities

**Custom Render Function** (`app/test/utils/test-utils.tsx`):
- `renderWithRouter` - Wraps components with React Router
- Dark mode support
- Initial route configuration
- Provider wrapping

**Viewport Helpers**:
- `setViewport(width, height)` - Set viewport size
- `VIEWPORTS` - Predefined viewport sizes:
  - mobile: 375x667 (iPhone SE)
  - tablet: 768x1024 (iPad)
  - desktop: 1920x1080
  - mobileSmall: 320x568 (iPhone 5)
  - mobileLarge: 414x896 (iPhone 11 Pro Max)

**Theme Helpers**:
- `hasThemeColor(element, colorClass)` - Check theme colors
- `hasThemeButton(button)` - Validate button theming
- `hasThemeForm(form)` - Validate form theming
- `isMobileResponsive(element)` - Check responsive classes

### 3. Mock Data

**User Mocks** (`app/test/mocks/mockData.ts`):
- `mockUser` - Active subscription user
- `mockTrialUser` - Trial period user
- `mockExpiredUser` - Suspended subscription user

**Profile Mocks**:
- `mockHousehelpProfile` - Househelp profile data
- `mockHouseholdProfile` - Household profile data

**Feature Mocks**:
- `mockConversation` - Chat conversation data
- `mockHireRequest` - Hire request data
- `mockSubscriptionPlan` - Subscription plan data

### 4. Example Tests

Created comprehensive test examples for:
- **Loading Component** - Theme, responsiveness, accessibility
- **ConfirmDialog Component** - User interactions, keyboard navigation
- **Location Component** - Form validation, mobile responsiveness

---

## Test Categories

### 1. Theme Consistency Tests

Ensures all components follow the purple theme design system:

```typescript
describe('Theme Consistency', () => {
  it('should use primary purple color', () => {
    renderWithRouter(<Button />);
    const button = screen.getByRole('button');
    expect(button.className).toMatch(/bg-primary|bg-purple/);
  });

  it('should have hover effects', () => {
    renderWithRouter(<Button />);
    const button = screen.getByRole('button');
    expect(button.className).toMatch(/hover:/);
  });

  it('should have rounded corners', () => {
    renderWithRouter(<Button />);
    const button = screen.getByRole('button');
    expect(button.className).toMatch(/rounded/);
  });

  it('should work in dark mode', () => {
    renderWithRouter(<Button />, { darkMode: true });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
```

**What to Test:**
- Primary purple color usage (`bg-primary-*`, `text-primary-*`)
- Hover and focus states
- Rounded corners (`rounded-*`)
- Shadow effects (`shadow-*`)
- Dark mode compatibility
- Gradient backgrounds
- Animation effects

### 2. Mobile Responsiveness Tests

Tests components across different viewport sizes:

```typescript
describe('Mobile Responsiveness', () => {
  it('should be responsive on mobile (375px)', () => {
    setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
    renderWithRouter(<Component />);
    expect(screen.getByRole('button')).toBeVisible();
  });

  it('should stack elements vertically on small screens', () => {
    setViewport(VIEWPORTS.mobileSmall.width);
    const { container } = renderWithRouter(<Component />);
    const flexContainer = container.querySelector('[class*="flex"]');
    expect(flexContainer?.className).toMatch(/flex-col|sm:flex-row/);
  });

  it('should have touch-friendly button size', () => {
    setViewport(VIEWPORTS.mobile.width);
    renderWithRouter(<Button />);
    const button = screen.getByRole('button');
    expect(button.className).toMatch(/p-|py-|px-/);
  });
});
```

**What to Test:**
- Visibility on mobile (375px), tablet (768px), desktop (1920px)
- Responsive classes (`sm:`, `md:`, `lg:`, `xl:`)
- Touch-friendly sizes (minimum 44x44px)
- Vertical stacking on small screens
- Horizontal scrolling prevention
- Text readability at small sizes
- Image scaling

### 3. Accessibility Tests

Ensures WCAG 2.1 AA compliance:

```typescript
describe('Accessibility', () => {
  it('should have proper ARIA labels', () => {
    renderWithRouter(<Button />);
    const button = screen.getByRole('button');
    expect(button).toHaveAccessibleName();
  });

  it('should be keyboard navigable', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Form />);
    
    await user.tab();
    expect(screen.getByLabelText('Name')).toHaveFocus();
  });

  it('should announce errors to screen readers', async () => {
    renderWithRouter(<Form />);
    const error = screen.getByText('Required field');
    expect(error).toHaveAttribute('role', 'alert');
  });
});
```

**What to Test:**
- ARIA labels and roles
- Keyboard navigation (Tab, Enter, Escape)
- Focus management
- Screen reader announcements
- Color contrast ratios
- Form label associations
- Error message accessibility
- Skip links
- Focus indicators

### 4. Form Validation Tests

Tests form inputs and validation logic:

```typescript
describe('Form Validation', () => {
  it('should show error for empty required field', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Form />);
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);
    
    expect(screen.getByText(/required/i)).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    renderWithRouter(<EmailInput />);
    
    const input = screen.getByLabelText(/email/i);
    await user.type(input, 'invalid-email');
    
    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
  });
});
```

**What to Test:**
- Required field validation
- Email format validation
- Phone number format validation
- Password strength validation
- Min/max length validation
- Pattern matching (regex)
- Custom validation rules
- Error message display
- Error clearing on input
- Form submission prevention

### 5. User Interaction Tests

Tests user flows and interactions:

```typescript
describe('User Interactions', () => {
  it('should call onClick when clicked', async () => {
    const mockOnClick = vi.fn();
    const user = userEvent.setup();
    renderWithRouter(<Button onClick={mockOnClick} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should handle async operations', async () => {
    const user = userEvent.setup();
    renderWithRouter(<AsyncButton />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });
  });
});
```

**What to Test:**
- Button clicks
- Form submissions
- Modal open/close
- Dropdown interactions
- Toggle switches
- Checkbox/radio selections
- File uploads
- Drag and drop
- Async operations
- Loading states
- Error states

---

## Running Tests

### Install Dependencies

```bash
cd website
npm install
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests in UI mode (visual interface)
npm run test:ui

# Run specific test file
npm test -- Location.test.tsx

# Run tests matching pattern
npm test -- --grep="Theme Consistency"
```

### Coverage Report

After running `npm run test:coverage`, open `coverage/index.html` in your browser to see detailed coverage report.

**Coverage Goals:**
- Lines: 70%+
- Functions: 70%+
- Branches: 70%+
- Statements: 70%+

---

## Writing New Tests

### Step 1: Create Test File

Place test file next to component:
```
app/components/MyComponent.tsx
app/components/__tests__/MyComponent.test.tsx
```

### Step 2: Import Dependencies

```typescript
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter, userEvent, VIEWPORTS, setViewport } from '~/test/utils/test-utils';
import MyComponent from '../MyComponent';
```

### Step 3: Write Test Suites

```typescript
describe('MyComponent', () => {
  describe('Rendering', () => {
    it('should render correctly', () => {
      renderWithRouter(<MyComponent />);
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });

  describe('Theme Consistency', () => {
    // Theme tests
  });

  describe('Mobile Responsiveness', () => {
    // Responsive tests
  });

  describe('Accessibility', () => {
    // A11y tests
  });

  describe('User Interactions', () => {
    // Interaction tests
  });
});
```

---

## Best Practices

### 1. Use Semantic Queries

```typescript
// ✅ Good - Reflects how users interact
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText('Email')
screen.getByText('Welcome')

// ❌ Avoid - Implementation details
container.querySelector('.submit-button')
container.querySelector('#email-input')
```

### 2. Test User Behavior, Not Implementation

```typescript
// ✅ Good - Tests what users see
it('should show success message after submission', async () => {
  const user = userEvent.setup();
  renderWithRouter(<Form />);
  
  await user.type(screen.getByLabelText('Name'), 'John');
  await user.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(screen.getByText(/success/i)).toBeInTheDocument();
});

// ❌ Avoid - Tests internal state
it('should set state.submitted to true', () => {
  // Don't test internal state
});
```

### 3. Use userEvent Over fireEvent

```typescript
// ✅ Good - More realistic user interactions
const user = userEvent.setup();
await user.click(button);
await user.type(input, 'text');

// ❌ Avoid - Less realistic
fireEvent.click(button);
fireEvent.change(input, { target: { value: 'text' } });
```

### 4. Clean Up After Tests

```typescript
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup(); // Automatic in setup.ts
});
```

### 5. Test Edge Cases

```typescript
it('should handle empty state', () => {
  renderWithRouter(<List items={[]} />);
  expect(screen.getByText(/no items/i)).toBeInTheDocument();
});

it('should handle loading state', () => {
  renderWithRouter(<Component loading={true} />);
  expect(screen.getByRole('status')).toBeInTheDocument();
});

it('should handle error state', () => {
  renderWithRouter(<Component error="Failed" />);
  expect(screen.getByText(/failed/i)).toBeInTheDocument();
});
```

---

## Component Testing Checklist

For each component, ensure you test:

### Visual/Theme
- [ ] Uses primary purple color scheme
- [ ] Has proper hover/focus states
- [ ] Has rounded corners
- [ ] Works in dark mode
- [ ] Has proper shadows/glows
- [ ] Uses correct typography

### Responsive
- [ ] Visible on mobile (375px)
- [ ] Visible on tablet (768px)
- [ ] Visible on desktop (1920px)
- [ ] Has responsive classes (sm:, md:, lg:)
- [ ] Touch-friendly sizes on mobile
- [ ] No horizontal scrolling

### Accessibility
- [ ] Has proper ARIA labels
- [ ] Keyboard navigable (Tab, Enter, Escape)
- [ ] Focus indicators visible
- [ ] Screen reader friendly
- [ ] Color contrast meets WCAG AA
- [ ] Form labels associated
- [ ] Error messages accessible

### Functionality
- [ ] Renders correctly
- [ ] Handles user interactions
- [ ] Validates input (if form)
- [ ] Shows loading states
- [ ] Shows error states
- [ ] Handles edge cases
- [ ] Calls callbacks correctly

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
        working-directory: ./website
      
      - name: Run tests
        run: npm test
        working-directory: ./website
      
      - name: Generate coverage
        run: npm run test:coverage
        working-directory: ./website
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./website/coverage/lcov.info
```

---

## Troubleshooting

### Issue: "Not wrapped in act(...)"
**Solution:** Use `userEvent` instead of `fireEvent`

### Issue: Element not found
**Solution:** Use `queryBy` for optional elements, `getBy` for required

### Issue: Async test timeout
**Solution:** Use `waitFor` with increased timeout

### Issue: Mock not working
**Solution:** Clear mocks in `beforeEach` hook

### Issue: Dark mode not applying
**Solution:** Check `document.documentElement.classList.contains('dark')`

---

## Next Steps

### 1. Write Tests for Existing Components

Priority components to test:
- [ ] Navigation
- [ ] Footer
- [ ] Modal
- [ ] Forms (all form components)
- [ ] Buttons
- [ ] Cards
- [ ] Profile components
- [ ] Subscription components
- [ ] Chat/messaging components

### 2. Set Up CI/CD

- [ ] Add GitHub Actions workflow
- [ ] Configure coverage reporting
- [ ] Set up automated testing on PR
- [ ] Add test status badges

### 3. Improve Coverage

- [ ] Aim for 70%+ coverage
- [ ] Focus on critical paths
- [ ] Test edge cases
- [ ] Add integration tests

### 4. Documentation

- [ ] Document testing patterns
- [ ] Create component testing guides
- [ ] Add examples for common scenarios
- [ ] Update README with testing info

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## Summary

✅ **Complete testing setup** with Vitest and React Testing Library  
✅ **Custom test utilities** for routing, viewports, and theme checking  
✅ **Mock data** for users, profiles, and features  
✅ **Example tests** demonstrating all test categories  
✅ **Comprehensive documentation** with best practices  
✅ **Ready to use** - Just run `npm install` and `npm test`

The testing framework is production-ready and follows industry best practices for React applications.
