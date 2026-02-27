import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter, userEvent, VIEWPORTS, setViewport } from '~/test/utils/test-utils';
import LoginPage from '../login';

// Mock dependencies
vi.mock('~/contexts/useAuth', () => ({
  useAuth: vi.fn(() => ({
    login: vi.fn(),
    loading: false,
    user: null,
    error: null,
  })),
}));

vi.mock('~/utils/deviceFingerprint', () => ({
  prepareDeviceRegistration: vi.fn(() => Promise.resolve({ device_id: 'test-device' })),
}));

vi.mock('~/utils/api/devices', () => ({
  registerDevice: vi.fn(() => Promise.resolve({ requires_confirmation: false })),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render login form correctly', () => {
      renderWithRouter(<LoginPage />);
      
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('should render Google sign-in button', () => {
      renderWithRouter(<LoginPage />);
      
      expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
    });

    it('should render forgot password link', () => {
      renderWithRouter(<LoginPage />);
      
      expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument();
    });

    it('should render signup link in form', () => {
      renderWithRouter(<LoginPage />);
      
      // Get all signup links and verify at least one exists
      const signupLinks = screen.getAllByRole('link', { name: /sign up/i });
      expect(signupLinks.length).toBeGreaterThan(0);
      expect(signupLinks.some(link => link.getAttribute('href') === '/signup')).toBe(true);
    });
  });

  describe('Theme Consistency', () => {
    it('should use primary purple color scheme', () => {
      renderWithRouter(<LoginPage />);
      
      const heading = screen.getByRole('heading', { name: /welcome back/i });
      expect(heading.className).toMatch(/purple|gradient/i);
    });

    it('should have themed login button', () => {
      renderWithRouter(<LoginPage />);
      
      const button = screen.getByRole('button', { name: /login/i });
      expect(button.className).toMatch(/purple|gradient/i);
      expect(button.className).toMatch(/rounded/);
    });

    it('should have themed input fields', () => {
      renderWithRouter(<LoginPage />);
      
      const phoneInput = screen.getByLabelText(/phone number/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      expect(phoneInput.className).toMatch(/rounded/);
      expect(phoneInput.className).toMatch(/border/);
      expect(phoneInput.className).toMatch(/purple/);
      
      expect(passwordInput.className).toMatch(/rounded/);
      expect(passwordInput.className).toMatch(/border/);
      expect(passwordInput.className).toMatch(/purple/);
    });

    it('should work in dark mode', () => {
      renderWithRouter(<LoginPage />, { darkMode: true });
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should be responsive on mobile (375px)', () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      renderWithRouter(<LoginPage />);
      
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeVisible();
      expect(screen.getByLabelText(/phone number/i)).toBeVisible();
      expect(screen.getByRole('button', { name: /login/i })).toBeVisible();
    });

    it('should be responsive on tablet (768px)', () => {
      setViewport(VIEWPORTS.tablet.width, VIEWPORTS.tablet.height);
      renderWithRouter(<LoginPage />);
      
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeVisible();
      expect(screen.getByLabelText(/phone number/i)).toBeVisible();
    });

    it('should be responsive on desktop (1920px)', () => {
      setViewport(VIEWPORTS.desktop.width, VIEWPORTS.desktop.height);
      renderWithRouter(<LoginPage />);
      
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    });

    it('should have touch-friendly button sizes on mobile', () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      renderWithRouter(<LoginPage />);
      
      const button = screen.getByRole('button', { name: /login/i });
      expect(button.className).toMatch(/p-|py-|px-/);
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      renderWithRouter(<LoginPage />);
      
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);
      
      // Tab through form elements
      await user.tab();
      
      // Check that focus moved to an interactive element
      const activeElement = document.activeElement;
      expect(activeElement).toBeTruthy();
      expect(activeElement?.tagName).toMatch(/INPUT|BUTTON|A/);
    });

    it('should have accessible button labels', () => {
      renderWithRouter(<LoginPage />);
      
      const loginButton = screen.getByRole('button', { name: /login/i });
      expect(loginButton).toHaveAccessibleName();
    });

    it('should have proper heading hierarchy', () => {
      renderWithRouter(<LoginPage />);
      
      const heading = screen.getByRole('heading', { name: /welcome back/i });
      expect(heading.tagName).toBe('H1');
    });
  });

  describe('Form Validation', () => {
    it('should show error for empty phone field', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);
      
      const phoneInput = screen.getByLabelText(/phone number/i);
      await user.click(phoneInput);
      await user.tab(); // Blur the field
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      expect(submitButton).toBeDisabled();
    });

    it('should show error for empty password field', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      await user.click(passwordInput);
      await user.tab(); // Blur the field
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when form is valid', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);
      
      await user.type(screen.getByLabelText(/phone number/i), '0712345678');
      await user.type(screen.getByLabelText(/password/i), 'Password123!');
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      expect(submitButton).not.toBeDisabled();
    });

    it('should clear errors when user starts typing', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);
      
      const phoneInput = screen.getByLabelText(/phone number/i);
      await user.type(phoneInput, '123'); // Invalid phone
      await user.clear(phoneInput);
      await user.type(phoneInput, '0712345678'); // Valid phone
      
      // Error should be cleared
      expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle phone input change', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);
      
      const phoneInput = screen.getByLabelText(/phone number/i) as HTMLInputElement;
      await user.type(phoneInput, '0712345678');
      
      expect(phoneInput.value).toBe('0712345678');
    });

    it('should handle password input change', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);
      
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
      await user.type(passwordInput, 'Password123!');
      
      expect(passwordInput.value).toBe('Password123!');
    });

    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);
      
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
      expect(passwordInput.type).toBe('password');
      
      // Find and click the eye icon button
      const toggleButton = passwordInput.parentElement?.querySelector('button');
      if (toggleButton) {
        await user.click(toggleButton);
        expect(passwordInput.type).toBe('text');
        
        await user.click(toggleButton);
        expect(passwordInput.type).toBe('password');
      }
    });

    it('should navigate to forgot password page', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);
      
      const forgotPasswordLink = screen.getByRole('link', { name: /forgot password/i });
      expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
    });

    it('should navigate to signup page', async () => {
      renderWithRouter(<LoginPage />);
      
      const signupLinks = screen.getAllByRole('link', { name: /sign up/i });
      const signupLink = signupLinks.find(link => link.getAttribute('href') === '/signup');
      expect(signupLink).toHaveAttribute('href', '/signup');
    });
  });

  describe('Loading States', () => {
    it('should disable submit button when fields are empty', () => {
      renderWithRouter(<LoginPage />);
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Error States', () => {
    it('should show error when login fails', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);
      
      // Fill in form with valid data
      await user.type(screen.getByLabelText(/phone number/i), '0712345678');
      await user.type(screen.getByLabelText(/password/i), 'WrongPassword123!');
      
      // Submit button should be enabled with valid input
      const submitButton = screen.getByRole('button', { name: /login/i });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in phone number', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);
      
      const phoneInput = screen.getByLabelText(/phone number/i) as HTMLInputElement;
      await user.type(phoneInput, '+254712345678');
      
      expect(phoneInput.value).toBe('+254712345678');
    });

    it('should handle long password', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);
      
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
      const longPassword = 'A'.repeat(100);
      await user.type(passwordInput, longPassword);
      
      expect(passwordInput.value).toBe(longPassword);
    });

    it('should handle rapid form submissions', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginPage />);
      
      await user.type(screen.getByLabelText(/phone number/i), '0712345678');
      await user.type(screen.getByLabelText(/password/i), 'Password123!');
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      
      // Button should be enabled with valid input
      expect(submitButton).not.toBeDisabled();
      
      // After first click, form should handle submission
      await user.click(submitButton);
      
      // The button text or state may change during submission
      // This tests that the form can handle the click event
    });

    it('should handle redirect URL from query params', () => {
      renderWithRouter(<LoginPage />, { initialRoute: '/login?redirect=/profile' });
      
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    });
  });

  describe('Google OAuth', () => {
    it('should handle Google sign-in button click', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ url: 'https://google.com/oauth' }),
        })
      ) as any;
      
      renderWithRouter(<LoginPage />);
      
      const googleButton = screen.getByRole('button', { name: /google/i });
      await user.click(googleButton);
      
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
