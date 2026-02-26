# Testing Quick Start Guide

Get up and running with frontend tests in 5 minutes!

---

## 1. Install Dependencies

```bash
cd website
npm install
```

This will install:
- `vitest` - Fast unit test framework
- `@testing-library/react` - React testing utilities
- `@testing-library/jest-dom` - Custom matchers
- `@testing-library/user-event` - User interaction simulation
- `jsdom` - DOM environment
- `@vitest/ui` - Visual test interface
- `@vitest/coverage-v8` - Coverage reporting

---

## 2. Run Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with UI (visual interface)
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

---

## 3. Write Your First Test

Create `app/components/__tests__/MyButton.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter, userEvent } from '~/test/utils/test-utils';
import MyButton from '../MyButton';

describe('MyButton', () => {
  it('should render button text', () => {
    renderWithRouter(<MyButton>Click Me</MyButton>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const mockOnClick = vi.fn();
    const user = userEvent.setup();
    
    renderWithRouter(<MyButton onClick={mockOnClick}>Click Me</MyButton>);
    
    await user.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should use primary purple color', () => {
    renderWithRouter(<MyButton>Click Me</MyButton>);
    const button = screen.getByRole('button');
    expect(button.className).toMatch(/bg-primary|bg-purple/);
  });
});
```

---

## 4. Test Categories to Cover

For each component, write tests for:

### ✅ Theme Consistency
```typescript
it('should use primary purple color', () => {
  renderWithRouter(<Component />);
  const element = screen.getByRole('button');
  expect(element.className).toMatch(/primary|purple/);
});
```

### ✅ Mobile Responsiveness
```typescript
it('should be responsive on mobile', () => {
  setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
  renderWithRouter(<Component />);
  expect(screen.getByRole('button')).toBeVisible();
});
```

### ✅ Accessibility
```typescript
it('should be keyboard accessible', async () => {
  const user = userEvent.setup();
  renderWithRouter(<Component />);
  await user.tab();
  expect(screen.getByRole('button')).toHaveFocus();
});
```

### ✅ User Interactions
```typescript
it('should handle click', async () => {
  const mockOnClick = vi.fn();
  const user = userEvent.setup();
  renderWithRouter(<Button onClick={mockOnClick} />);
  await user.click(screen.getByRole('button'));
  expect(mockOnClick).toHaveBeenCalled();
});
```

---

## 5. Common Test Patterns

### Testing Forms
```typescript
it('should validate required field', async () => {
  const user = userEvent.setup();
  renderWithRouter(<Form />);
  
  await user.click(screen.getByRole('button', { name: /submit/i }));
  expect(screen.getByText(/required/i)).toBeInTheDocument();
});
```

### Testing Modals
```typescript
it('should open and close modal', async () => {
  const user = userEvent.setup();
  renderWithRouter(<Modal />);
  
  await user.click(screen.getByRole('button', { name: /open/i }));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
```

### Testing Async Operations
```typescript
it('should show loading then success', async () => {
  renderWithRouter(<AsyncComponent />);
  
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.getByText(/success/i)).toBeInTheDocument();
  });
});
```

---

## 6. Useful Helpers

### Viewport Sizes
```typescript
import { VIEWPORTS, setViewport } from '~/test/utils/test-utils';

setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
setViewport(VIEWPORTS.tablet.width, VIEWPORTS.tablet.height);
setViewport(VIEWPORTS.desktop.width, VIEWPORTS.desktop.height);
```

### Dark Mode
```typescript
renderWithRouter(<Component />, { darkMode: true });
```

### Theme Checking
```typescript
import { hasThemeButton, hasThemeForm } from '~/test/utils/test-utils';

const button = screen.getByRole('button');
expect(hasThemeButton(button)).toBe(true);
```

---

## 7. Best Practices

✅ **DO:**
- Use semantic queries (`getByRole`, `getByLabelText`)
- Test user behavior, not implementation
- Use `userEvent` for interactions
- Test accessibility
- Test mobile responsiveness
- Clean up mocks in `beforeEach`

❌ **DON'T:**
- Use `querySelector` for finding elements
- Test internal state
- Use `fireEvent` (use `userEvent` instead)
- Skip accessibility tests
- Forget to test edge cases

---

## 8. Coverage Goals

Aim for:
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

## 9. Example Test Files

Check these examples:
- `app/components/ui/__tests__/Loading.test.tsx`
- `app/components/ui/__tests__/ConfirmDialog.test.tsx`
- `app/components/__tests__/Location.test.tsx`

---

## 10. Need Help?

- Read full guide: `TESTING_IMPLEMENTATION_GUIDE.md`
- Check test utilities: `app/test/README.md`
- View mock data: `app/test/mocks/mockData.ts`

---

## Quick Reference

```bash
# Install
npm install

# Run tests
npm test                    # Run once
npm run test:watch          # Watch mode
npm run test:ui             # UI mode
npm run test:coverage       # With coverage

# Run specific test
npm test -- MyComponent.test.tsx

# Run tests matching pattern
npm test -- --grep="Theme"
```

---

**That's it!** You're ready to write tests. Start with simple components and gradually add more coverage. 🚀
