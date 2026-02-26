# Frontend Testing Guide

## Overview

This project uses **Vitest** and **React Testing Library** for unit and integration testing. All tests focus on:

1. **Theme Consistency** - Ensuring components follow the purple theme
2. **Mobile Responsiveness** - Testing across different viewport sizes
3. **Accessibility** - WCAG compliance and keyboard navigation
4. **User Interactions** - Testing user flows and edge cases
5. **Form Validation** - Ensuring proper validation and error handling

---

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for specific file
npm test -- Location.test.tsx

# Run tests in UI mode
npm run test:ui
```

---

## Test Structure

### Test File Location
- Place test files next to the component: `Component.tsx` → `__tests__/Component.test.tsx`
- Or in a `__tests__` directory within the component folder

### Test File Naming
- Use `.test.tsx` or `.spec.tsx` extension
- Match the component name: `Button.tsx` → `Button.test.tsx`

---

## Writing Tests

### Basic Test Template

```typescript
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter, userEvent, VIEWPORTS, setViewport } from '~/test/utils/test-utils';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  describe('Rendering', () => {
    it('should render correctly', () => {
      renderWithRouter(<MyComponent />);
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });

  describe('Theme Consistency', () => {
    it('should use primary purple color', () => {
      renderWithRouter(<MyComponent />);
      const element = screen.getByRole('button');
      expect(element.className).toMatch(/primary|purple/);
    });

    it('should work in dark mode', () => {
      renderWithRouter(<MyComponent />, { darkMode: true });
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should be responsive on mobile', () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      renderWithRouter(<MyComponent />);
      const element = screen.getByRole('button');
      expect(element).toBeVisible();
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      renderWithRouter(<MyComponent />);
      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();
    });
  });
});
```

---

## Test Categories

### 1. Theme Consistency Tests

Ensure all components follow the design system:

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

### 2. Mobile Responsiveness Tests

Test across different viewport sizes:

```typescript
describe('Mobile Responsiveness', () => {
  it('should be responsive on mobile (375px)', () => {
    setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
    renderWithRouter(<Component />);
    expect(screen.getByRole('button')).toBeVisible();
  });

  it('should be responsive on tablet (768px)', () => {
    setViewport(VIEWPORTS.tablet.width, VIEWPORTS.tablet.height);
    renderWithRouter(<Component />);
    expect(screen.getByRole('button')).toBeVisible();
  });

  it('should be responsive on desktop (1920px)', () => {
    setViewport(VIEWPORTS.desktop.width, VIEWPORTS.desktop.height);
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

### 3. Accessibility Tests

Ensure WCAG compliance:

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
    
    await user.tab(); // Focus first input
    expect(screen.getByLabelText('Name')).toHaveFocus();
    
    await user.tab(); // Focus second input
    expect(screen.getByLabelText('Email')).toHaveFocus();
  });

  it('should announce errors to screen readers', async () => {
    renderWithRouter(<Form />);
    const error = screen.getByText('Required field');
    expect(error).toHaveAttribute('role', 'alert');
  });

  it('should have proper label association', () => {
    renderWithRouter(<Input label="Name" />);
    const input = screen.getByLabelText('Name');
    expect(input).toHaveAttribute('id');
  });

  it('should support keyboard shortcuts', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Modal />);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
```

### 4. Form Validation Tests

Test form inputs and validation:

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
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);
    
    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
  });

  it('should clear error when typing', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Input />);
    
    // Trigger error
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);
    expect(screen.getByText(/required/i)).toBeInTheDocument();
    
    // Type to clear error
    const input = screen.getByLabelText(/name/i);
    await user.type(input, 'John');
    expect(screen.queryByText(/required/i)).not.toBeInTheDocument();
  });

  it('should trim whitespace', async () => {
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    renderWithRouter(<Form onSubmit={mockOnSubmit} />);
    
    const input = screen.getByLabelText(/name/i);
    await user.type(input, '  John  ');
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'John' })
    );
  });
});
```

### 5. User Interaction Tests

Test user flows:

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

  it('should toggle state on click', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Toggle />);
    
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
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

---

## Helper Functions

### renderWithRouter
Renders component with React Router context:

```typescript
renderWithRouter(<Component />, {
  initialRoute: '/profile',
  darkMode: true,
});
```

### setViewport
Sets viewport size for responsive testing:

```typescript
setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
```

### VIEWPORTS
Predefined viewport sizes:

```typescript
VIEWPORTS.mobile        // 375x667 (iPhone SE)
VIEWPORTS.tablet        // 768x1024 (iPad)
VIEWPORTS.desktop       // 1920x1080
VIEWPORTS.mobileSmall   // 320x568 (iPhone 5)
VIEWPORTS.mobileLarge   // 414x896 (iPhone 11 Pro Max)
```

### hasThemeButton
Checks if button follows theme:

```typescript
const button = screen.getByRole('button');
expect(hasThemeButton(button)).toBe(true);
```

### hasThemeForm
Checks if form follows theme:

```typescript
const form = container.querySelector('form');
expect(hasThemeForm(form)).toBe(true);
```

---

## Best Practices

### 1. Use Semantic Queries
Prefer queries that reflect how users interact:

```typescript
// ✅ Good
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText('Email')
screen.getByText('Welcome')

// ❌ Avoid
container.querySelector('.submit-button')
container.querySelector('#email-input')
```

### 2. Test User Behavior, Not Implementation
Focus on what users see and do:

```typescript
// ✅ Good
it('should show success message after submission', async () => {
  const user = userEvent.setup();
  renderWithRouter(<Form />);
  
  await user.type(screen.getByLabelText('Name'), 'John');
  await user.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(screen.getByText(/success/i)).toBeInTheDocument();
});

// ❌ Avoid
it('should set state.submitted to true', () => {
  const { result } = renderHook(() => useFormState());
  act(() => result.current.submit());
  expect(result.current.submitted).toBe(true);
});
```

### 3. Use waitFor for Async Operations

```typescript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

### 4. Clean Up After Tests

```typescript
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
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
  renderWithRouter(<Component error="Failed to load" />);
  expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
});
```

---

## Coverage Goals

- **Lines**: 70%+
- **Functions**: 70%+
- **Branches**: 70%+
- **Statements**: 70%+

---

## Common Patterns

### Testing Modals

```typescript
it('should open and close modal', async () => {
  const user = userEvent.setup();
  renderWithRouter(<ModalComponent />);
  
  // Open modal
  await user.click(screen.getByRole('button', { name: /open/i }));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  
  // Close modal
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
```

### Testing Forms

```typescript
it('should submit form with valid data', async () => {
  const mockOnSubmit = vi.fn();
  const user = userEvent.setup();
  renderWithRouter(<Form onSubmit={mockOnSubmit} />);
  
  await user.type(screen.getByLabelText('Name'), 'John Doe');
  await user.type(screen.getByLabelText('Email'), 'john@example.com');
  await user.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(mockOnSubmit).toHaveBeenCalledWith({
    name: 'John Doe',
    email: 'john@example.com',
  });
});
```

### Testing Lists

```typescript
it('should render list of items', () => {
  const items = ['Item 1', 'Item 2', 'Item 3'];
  renderWithRouter(<List items={items} />);
  
  items.forEach(item => {
    expect(screen.getByText(item)).toBeInTheDocument();
  });
});
```

---

## Troubleshooting

### Test Fails with "Not wrapped in act(...)"
Use `userEvent` instead of `fireEvent`:

```typescript
// ✅ Good
const user = userEvent.setup();
await user.click(button);

// ❌ Avoid
fireEvent.click(button);
```

### Element Not Found
Check if element is rendered conditionally:

```typescript
// Use queryBy for elements that might not exist
expect(screen.queryByText('Optional')).not.toBeInTheDocument();

// Use getBy for elements that should exist
expect(screen.getByText('Required')).toBeInTheDocument();
```

### Async Test Timeout
Increase timeout or use waitFor:

```typescript
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
}, { timeout: 5000 });
```

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
