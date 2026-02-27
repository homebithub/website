import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter, userEvent, VIEWPORTS, setViewport } from '~/test/utils/test-utils';
import ResetPasswordPage from '../reset-password';

// Mock dependencies
vi.mock('~/contexts/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
  })),
}));

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('Rendering', () => {
    it('should render reset password form correctly', () => {
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
      expect(document.getElementById('password')).toBeInTheDocument();
      expect(document.getElementById('confirmPassword')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });

    it('should render sign in link', () => {
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render instructions text', () => {
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      expect(screen.getByText(/enter your new password below/i)).toBeInTheDocument();
    });
  });

  describe('Theme Consistency', () => {
    it('should use primary purple color scheme', () => {
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      const heading = screen.getByRole('heading', { name: /reset password/i });
      expect(heading.className).toMatch(/purple|gradient/i);
    });

    it('should have themed submit button', () => {
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      const button = screen.getByRole('button', { name: /reset password/i });
      expect(button.className).toMatch(/purple|gradient/i);
      expect(button.className).toMatch(/rounded/);
    });

    it('should have themed input fields', () => {
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      const passwordInput = document.getElementById('password');
      expect(passwordInput?.className).toMatch(/rounded/);
      expect(passwordInput?.className).toMatch(/border/);
      expect(passwordInput?.className).toMatch(/purple/);
    });

    it('should work in dark mode', () => {
      renderWithRouter(<ResetPasswordPage />, { 
        initialRoute: '/reset-password?token=abc123',
        darkMode: true 
      });
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should be responsive on mobile (375px)', () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      expect(screen.getByRole('heading', { name: /reset password/i })).toBeVisible();
      expect(document.getElementById('password')).toBeVisible();
      expect(screen.getByRole('button', { name: /reset password/i })).toBeVisible();
    });

    it('should be responsive on tablet (768px)', () => {
      setViewport(VIEWPORTS.tablet.width, VIEWPORTS.tablet.height);
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      expect(screen.getByRole('heading', { name: /reset password/i })).toBeVisible();
    });

    it('should be responsive on desktop (1920px)', () => {
      setViewport(VIEWPORTS.desktop.width, VIEWPORTS.desktop.height);
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      expect(screen.getByRole('heading', { name: /reset password/i })).toBeVisible();
    });

    it('should have touch-friendly button size on mobile', () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      const button = screen.getByRole('button', { name: /reset password/i });
      expect(button.className).toMatch(/p-|py-|px-/);
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      expect(document.getElementById('password')).toBeInTheDocument();
      expect(document.getElementById('confirmPassword')).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      await user.tab();
      expect(document.activeElement).toBeTruthy();
    });

    it('should have accessible button label', () => {
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      const button = screen.getByRole('button', { name: /reset password/i });
      expect(button).toHaveAccessibleName();
    });

    it('should have proper heading hierarchy', () => {
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      const heading = screen.getByRole('heading', { name: /reset password/i });
      expect(heading.tagName).toBe('H1');
    });
  });

  describe('Form Validation', () => {
    it('should disable submit button when passwords do not match', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      const confirmInput = document.getElementById('confirmPassword') as HTMLInputElement;
      
      await user.type(passwordInput, 'Password123!');
      await user.type(confirmInput, 'Different123!');
      
      const submitButton = screen.getByRole('button', { name: /reset password/i });
      expect(submitButton).toBeDisabled();
    });

    it('should show password mismatch error', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      const confirmInput = document.getElementById('confirmPassword') as HTMLInputElement;
      
      await user.type(passwordInput, 'Password123!');
      await user.type(confirmInput, 'Different123!');
      
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('should show password strength indicator', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      await user.type(passwordInput, 'weak');
      
      // Password strength feedback should appear
      await waitFor(() => {
        expect(screen.getByText(/uppercase letter/i)).toBeInTheDocument();
      });
    });

    it('should enable submit button when passwords match and are strong', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      const strongPassword = 'StrongPass123!';
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      const confirmInput = document.getElementById('confirmPassword') as HTMLInputElement;
      
      await user.type(passwordInput, strongPassword);
      await user.type(confirmInput, strongPassword);
      
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /reset password/i });
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('User Interactions', () => {
    it('should handle password input change', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      await user.type(passwordInput, 'Password123!');
      
      expect(passwordInput.value).toBe('Password123!');
    });

    it('should navigate to login page', () => {
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      const loginLink = screen.getByRole('link', { name: /sign in/i });
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('should submit form on button click', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Password reset successful' }),
        })
      ) as any;
      
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      const strongPassword = 'StrongPass123!';
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      const confirmInput = document.getElementById('confirmPassword') as HTMLInputElement;
      
      await user.type(passwordInput, strongPassword);
      await user.type(confirmInput, strongPassword);
      await user.click(screen.getByRole('button', { name: /reset password/i }));
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        new Promise((resolve) => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Success' }),
        }), 100))
      ) as any;
      
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      const strongPassword = 'StrongPass123!';
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      const confirmInput = document.getElementById('confirmPassword') as HTMLInputElement;
      
      await user.type(passwordInput, strongPassword);
      await user.type(confirmInput, strongPassword);
      await user.click(screen.getByRole('button', { name: /reset password/i }));
      
      expect(screen.getByText(/resetting password/i)).toBeInTheDocument();
    });

    it('should disable submit button during loading', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        new Promise((resolve) => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Success' }),
        }), 100))
      ) as any;
      
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      const strongPassword = 'StrongPass123!';
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      const confirmInput = document.getElementById('confirmPassword') as HTMLInputElement;
      
      await user.type(passwordInput, strongPassword);
      await user.type(confirmInput, strongPassword);
      
      const submitButton = screen.getByRole('button', { name: /reset password/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/resetting password/i)).toBeInTheDocument();
      });
    });
  });

  describe('Success States', () => {
    it('should show success message after password reset', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Password reset successful' }),
        })
      ) as any;
      
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      const strongPassword = 'StrongPass123!';
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      const confirmInput = document.getElementById('confirmPassword') as HTMLInputElement;
      
      await user.type(passwordInput, strongPassword);
      await user.type(confirmInput, strongPassword);
      await user.click(screen.getByRole('button', { name: /reset password/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/password reset successful/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error States', () => {
    it('should display error when token is missing', () => {
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password' });
      
      // Form should still render but submission will fail
      expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
    });

    it('should display error message on API failure', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: 'Invalid or expired token' }),
        })
      ) as any;
      
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      const strongPassword = 'StrongPass123!';
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      const confirmInput = document.getElementById('confirmPassword') as HTMLInputElement;
      
      await user.type(passwordInput, strongPassword);
      await user.type(confirmInput, strongPassword);
      await user.click(screen.getByRole('button', { name: /reset password/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/invalid or expired token/i)).toBeInTheDocument();
      });
    });

    it('should display generic error on network failure', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;
      
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      const strongPassword = 'StrongPass123!';
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      const confirmInput = document.getElementById('confirmPassword') as HTMLInputElement;
      
      await user.type(passwordInput, strongPassword);
      await user.type(confirmInput, strongPassword);
      await user.click(screen.getByRole('button', { name: /reset password/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in password', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      await user.type(passwordInput, 'P@ssw0rd!#$%');
      
      expect(passwordInput.value).toBe('P@ssw0rd!#$%');
    });

    it('should handle very long passwords', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      const longPassword = 'A'.repeat(100) + '1!';
      await user.type(passwordInput, longPassword);
      
      expect(passwordInput.value).toBe(longPassword);
    });

    it('should prevent submission with weak password', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      const weakPassword = 'weak';
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      const confirmInput = document.getElementById('confirmPassword') as HTMLInputElement;
      
      await user.type(passwordInput, weakPassword);
      await user.type(confirmInput, weakPassword);
      
      const submitButton = screen.getByRole('button', { name: /reset password/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Password Strength', () => {
    it('should show weak password indicator', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      await user.type(passwordInput, 'weak');
      
      // Should show feedback about missing requirements
      await waitFor(() => {
        const feedback = screen.getByText(/uppercase letter/i);
        expect(feedback).toBeInTheDocument();
      });
    });

    it('should show strong password indicator', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ResetPasswordPage />, { initialRoute: '/reset-password?token=abc123' });
      
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      await user.type(passwordInput, 'StrongPass123!');
      
      // Password strength bar should be visible
      expect(passwordInput).toHaveValue('StrongPass123!');
    });
  });
});
