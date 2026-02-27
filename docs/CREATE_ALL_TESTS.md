# Automated Test Generation Guide

## Overview

This guide helps you quickly generate test files for all components and pages in the Homebit frontend application.

---

## Quick Start

### 1. Generate Test Files

Run this command to create test templates for all components:

```bash
cd website
npm run generate:tests
```

This will create test files in `__tests__` directories next to each component.

### 2. Fill in Test Cases

Each generated test file will have this structure:

```typescript
describe('ComponentName', () => {
  describe('Rendering', () => {
    it('should render correctly', () => {
      // TODO: Add assertions
    });
  });

  describe('Theme Consistency', () => {
    // TODO: Add theme tests
  });

  describe('Mobile Responsiveness', () => {
    // TODO: Add responsive tests
  });

  describe('Accessibility', () => {
    // TODO: Add a11y tests
  });

  describe('User Interactions', () => {
    // TODO: Add interaction tests
  });
});
```

### 3. Run Tests

```bash
# Run all tests
npm test

# Run specific test
npm test -- ComponentName.test.tsx

# Run with coverage
npm run test:coverage
```

---

## Manual Test Creation

If you prefer to create tests manually, use this template:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter, userEvent, VIEWPORTS, setViewport } from '~/test/utils/test-utils';
import ComponentName from '../ComponentName';

describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render correctly', () => {
      renderWithRouter(<ComponentName />);
      expect(screen.getByRole('...')).toBeInTheDocument();
    });

    it('should render with props', () => {
      renderWithRouter(<ComponentName prop="value" />);
      expect(screen.getByText('value')).toBeInTheDocument();
    });
  });

  describe('Theme Consistency', () => {
    it('should use primary purple color', () => {
      renderWithRouter(<ComponentName />);
      const element = screen.getByRole('...');
      expect(element.className).toMatch(/bg-primary|bg-purple/);
    });

    it('should have hover effects', () => {
      renderWithRouter(<ComponentName />);
      const element = screen.getByRole('...');
      expect(element.className).toMatch(/hover:/);
    });

    it('should have rounded corners', () => {
      renderWithRouter(<ComponentName />);
      const element = screen.getByRole('...');
      expect(element.className).toMatch(/rounded/);
    });

    it('should work in dark mode', () => {
      renderWithRouter(<ComponentName />, { darkMode: true });
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(screen.getByRole('...')).toBeVisible();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should be responsive on mobile (375px)', () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      renderWithRouter(<ComponentName />);
      expect(screen.getByRole('...')).toBeVisible();
    });

    it('should be responsive on tablet (768px)', () => {
      setViewport(VIEWPORTS.tablet.width, VIEWPORTS.tablet.height);
      renderWithRouter(<ComponentName />);
      expect(screen.getByRole('...')).toBeVisible();
    });

    it('should be responsive on desktop (1920px)', () => {
      setViewport(VIEWPORTS.desktop.width, VIEWPORTS.desktop.height);
      renderWithRouter(<ComponentName />);
      expect(screen.getByRole('...')).toBeVisible();
    });

    it('should have touch-friendly sizes on mobile', () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      renderWithRouter(<ComponentName />);
      const button = screen.getByRole('button');
      expect(button.className).toMatch(/p-|py-|px-/);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithRouter(<ComponentName />);
      const element = screen.getByRole('...');
      expect(element).toHaveAccessibleName();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ComponentName />);
      
      await user.tab();
      expect(screen.getByRole('...')).toHaveFocus();
    });

    it('should have proper focus indicators', () => {
      renderWithRouter(<ComponentName />);
      const element = screen.getByRole('...');
      expect(element.className).toMatch(/focus:/);
    });

    it('should announce errors to screen readers', async () => {
      renderWithRouter(<ComponentName />);
      const error = screen.queryByRole('alert');
      if (error) {
        expect(error).toHaveAttribute('role', 'alert');
      }
    });
  });

  describe('User Interactions', () => {
    it('should handle click events', async () => {
      const mockOnClick = vi.fn();
      const user = userEvent.setup();
      renderWithRouter(<ComponentName onClick={mockOnClick} />);
      
      await user.click(screen.getByRole('button'));
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should handle form submission', async () => {
      const mockOnSubmit = vi.fn();
      const user = userEvent.setup();
      renderWithRouter(<ComponentName onSubmit={mockOnSubmit} />);
      
      await user.type(screen.getByLabelText('Name'), 'John Doe');
      await user.click(screen.getByRole('button', { name: /submit/i }));
      
      expect(mockOnSubmit).toHaveBeenCalled();
    });

    it('should handle async operations', async () => {
      renderWithRouter(<ComponentName />);
      
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText(/success/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation (if applicable)', () => {
    it('should validate required fields', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ComponentName />);
      
      await user.click(screen.getByRole('button', { name: /submit/i }));
      
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ComponentName />);
      
      await user.type(screen.getByLabelText(/email/i), 'invalid-email');
      await user.click(screen.getByRole('button', { name: /submit/i }));
      
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });

    it('should clear errors on input', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ComponentName />);
      
      // Trigger error
      await user.click(screen.getByRole('button', { name: /submit/i }));
      expect(screen.getByText(/required/i)).toBeInTheDocument();
      
      // Clear error
      await user.type(screen.getByLabelText(/name/i), 'John');
      expect(screen.queryByText(/required/i)).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty state', () => {
      renderWithRouter(<ComponentName items={[]} />);
      expect(screen.getByText(/no items/i)).toBeInTheDocument();
    });

    it('should handle loading state', () => {
      renderWithRouter(<ComponentName loading={true} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should handle error state', () => {
      renderWithRouter(<ComponentName error="Failed to load" />);
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });

    it('should handle long text', () => {
      const longText = 'A'.repeat(1000);
      renderWithRouter(<ComponentName text={longText} />);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });
  });
});
```

---

## Test Checklist

For each component, ensure you test:

### Visual/Theme ✅
- [ ] Uses primary purple color scheme
- [ ] Has proper hover/focus states
- [ ] Has rounded corners
- [ ] Works in dark mode
- [ ] Has proper shadows/glows
- [ ] Uses correct typography

### Responsive ✅
- [ ] Visible on mobile (375px)
- [ ] Visible on tablet (768px)
- [ ] Visible on desktop (1920px)
- [ ] Has responsive classes (sm:, md:, lg:)
- [ ] Touch-friendly sizes on mobile
- [ ] No horizontal scrolling

### Accessibility ✅
- [ ] Has proper ARIA labels
- [ ] Keyboard navigable
- [ ] Focus indicators visible
- [ ] Screen reader friendly
- [ ] Color contrast meets WCAG AA
- [ ] Form labels associated
- [ ] Error messages accessible

### Functionality ✅
- [ ] Renders correctly
- [ ] Handles user interactions
- [ ] Validates input (if form)
- [ ] Shows loading states
- [ ] Shows error states
- [ ] Handles edge cases
- [ ] Calls callbacks correctly

---

## Priority Components

### Phase 1: Critical (Week 1)
1. ✅ Navigation
2. ✅ Loading
3. ✅ ConfirmDialog
4. ✅ Location
5. Footer
6. Error
7. Modal
8. ProtectedRoute

### Phase 2: Authentication (Week 1)
1. Login page
2. Signup page
3. Forgot password
4. Reset password
5. Verify OTP

### Phase 3: Profile Setup (Week 2)
1. Househelp onboarding
2. Household onboarding
3. Profile forms

### Phase 4: Main Features (Week 2-3)
1. Profile pages
2. Search/filters
3. Hire requests
4. Inbox/messaging
5. Subscriptions

### Phase 5: Secondary Features (Week 3-4)
1. Contracts
2. Employment
3. Settings
4. Payment methods

---

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- Navigation.test.tsx

# Run tests matching pattern
npm test -- --grep="Theme Consistency"
```

---

## Coverage Goals

- **Lines**: 70%+
- **Functions**: 70%+
- **Branches**: 70%+
- **Statements**: 70%+

Check coverage:
```bash
npm run test:coverage
open coverage/index.html
```

---

## Tips

1. **Start Simple**: Begin with rendering tests, then add complexity
2. **Use Semantic Queries**: Prefer `getByRole`, `getByLabelText` over `querySelector`
3. **Test User Behavior**: Focus on what users see and do
4. **Mock External Dependencies**: Mock API calls, localStorage, etc.
5. **Keep Tests Isolated**: Each test should be independent
6. **Use Descriptive Names**: Test names should explain what they test
7. **Test Edge Cases**: Empty states, errors, long text, etc.
8. **Maintain Tests**: Update tests when components change

---

## Resources

- [Testing Guide](./TESTING_IMPLEMENTATION_GUIDE.md)
- [Quick Start](./TESTING_QUICK_START.md)
- [Test Utilities](./app/test/README.md)
- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/react)

---

**Let's build a rock-solid, bug-free application! 🚀**
