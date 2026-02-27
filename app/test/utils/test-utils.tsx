import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

/**
 * Custom render function that wraps components with necessary providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
  darkMode?: boolean;
}

export function renderWithRouter(
  ui: ReactElement,
  {
    initialRoute = '/',
    darkMode = false,
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  // Set dark mode class if needed
  if (darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialRoute]}>
        {children}
      </MemoryRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Helper to test responsive behavior
 */
export function setViewport(width: number, height: number = 768) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  window.dispatchEvent(new Event('resize'));
}

/**
 * Mobile viewport presets
 */
export const VIEWPORTS = {
  mobile: { width: 375, height: 667 }, // iPhone SE
  tablet: { width: 768, height: 1024 }, // iPad
  desktop: { width: 1920, height: 1080 }, // Desktop
  mobileSmall: { width: 320, height: 568 }, // iPhone 5
  mobileLarge: { width: 414, height: 896 }, // iPhone 11 Pro Max
};

/**
 * Helper to wait for async operations
 */
export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Helper to check if element has theme colors
 */
export function hasThemeColor(element: HTMLElement, colorClass: string): boolean {
  return element.className.includes(colorClass);
}

/**
 * Helper to check if element is mobile responsive
 */
export function isMobileResponsive(element: HTMLElement): boolean {
  const styles = window.getComputedStyle(element);
  const hasResponsiveClasses = 
    element.className.includes('sm:') ||
    element.className.includes('md:') ||
    element.className.includes('lg:') ||
    element.className.includes('xl:');
  
  return hasResponsiveClasses || styles.display === 'flex' || styles.display === 'grid';
}

/**
 * Helper to check if button follows theme
 */
export function hasThemeButton(button: HTMLElement): boolean {
  const hasPrimaryButton = 
    button.className.includes('bg-primary') ||
    button.className.includes('bg-purple');
  
  const hasHoverState = 
    button.className.includes('hover:');
  
  const hasRoundedCorners = 
    button.className.includes('rounded');
  
  return hasPrimaryButton && hasHoverState && hasRoundedCorners;
}

/**
 * Helper to check if form follows theme
 */
export function hasThemeForm(form: HTMLElement): boolean {
  const inputs = form.querySelectorAll('input, textarea, select');
  
  return Array.from(inputs).every((input) => {
    const hasRoundedCorners = input.className.includes('rounded');
    const hasBorder = input.className.includes('border');
    const hasFocusState = input.className.includes('focus:');
    
    return hasRoundedCorners && hasBorder && hasFocusState;
  });
}

/**
 * Re-export everything from testing library
 */
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
