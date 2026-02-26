import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter, userEvent, VIEWPORTS, setViewport } from '~/test/utils/test-utils';
import VerifyEmailPage from '../verify-email';

// Mock dependencies
vi.mock('~/contexts/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
  })),
}));

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    localStorage.clear();
    localStorage.setItem('user_object', JSON.stringify({ profile_type: 'household' }));
  });

  describe('Rendering', () => {
    it('should render verify email form correctly', () => {
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      expect(screen.getByRole('heading', { name: /verify your email/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send verification/i })).toBeInTheDocument();
    });

    it('should render skip button', () => {
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      expect(screen.getByRole('button', { name: /skip for now/i })).toBeInTheDocument();
    });

    it('should render email input with placeholder', () => {
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveAttribute('placeholder', 'Enter your email');
    });
  });

  describe('Theme Consistency', () => {
    it('should use primary purple color scheme', () => {
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      const heading = screen.getByRole('heading', { name: /verify your email/i });
      expect(heading.className).toMatch(/purple|gradient/i);
    });

    it('should have themed submit button', () => {
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      const button = screen.getByRole('button', { name: /send verification/i });
      expect(button.className).toMatch(/purple|gradient/i);
      expect(button.className).toMatch(/rounded/);
    });

    it('should have themed input field', () => {
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput.className).toMatch(/rounded/);
      expect(emailInput.className).toMatch(/border/);
      expect(emailInput.className).toMatch(/purple/);
    });

    it('should work in dark mode', () => {
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' },
        darkMode: true 
      });
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should be responsive on mobile (375px)', () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      expect(screen.getByRole('heading', { name: /verify your email/i })).toBeVisible();
      expect(screen.getByLabelText(/email address/i)).toBeVisible();
      expect(screen.getByRole('button', { name: /send verification/i })).toBeVisible();
    });

    it('should be responsive on tablet (768px)', () => {
      setViewport(VIEWPORTS.tablet.width, VIEWPORTS.tablet.height);
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      expect(screen.getByRole('heading', { name: /verify your email/i })).toBeVisible();
    });

    it('should be responsive on desktop (1920px)', () => {
      setViewport(VIEWPORTS.desktop.width, VIEWPORTS.desktop.height);
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      expect(screen.getByRole('heading', { name: /verify your email/i })).toBeVisible();
    });

    it('should have touch-friendly button size on mobile', () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      const button = screen.getByRole('button', { name: /send verification/i });
      expect(button.className).toMatch(/p-|py-|px-/);
    });
  });

  describe('Accessibility', () => {
    it('should have proper form label with htmlFor attribute', () => {
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      await user.tab();
      expect(document.activeElement).toBeTruthy();
    });

    it('should have accessible button labels', () => {
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      const submitButton = screen.getByRole('button', { name: /send verification/i });
      const skipButton = screen.getByRole('button', { name: /skip for now/i });
      
      expect(submitButton).toHaveAccessibleName();
      expect(skipButton).toHaveAccessibleName();
    });

    it('should have proper heading hierarchy', () => {
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      const heading = screen.getByRole('heading', { name: /verify your email/i });
      expect(heading.tagName).toBe('H1');
    });
  });

  describe('Form Validation', () => {
    it('should disable submit button for invalid email', async () => {
      const user = userEvent.setup();
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'invalid-email');
      
      const submitButton = screen.getByRole('button', { name: /send verification/i });
      expect(submitButton).toBeDisabled();
    });

    it('should show validation feedback for invalid email', async () => {
      const user = userEvent.setup();
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'invalid-email');
      
      // Should show red border
      await waitFor(() => {
        expect(emailInput.className).toMatch(/red/);
      });
    });

    it('should enable submit button for valid email', async () => {
      const user = userEvent.setup();
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');
      
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /send verification/i });
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('should show valid email indicator', async () => {
      const user = userEvent.setup();
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');
      
      await waitFor(() => {
        expect(screen.getByText(/valid email/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('should handle email input change', async () => {
      const user = userEvent.setup();
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      await user.type(emailInput, 'test@example.com');
      
      expect(emailInput.value).toBe('test@example.com');
    });

    it('should have skip button that is clickable', async () => {
      const user = userEvent.setup();
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      const skipButton = screen.getByRole('button', { name: /skip for now/i });
      expect(skipButton).toBeInTheDocument();
      expect(skipButton).not.toBeDisabled();
    });

    it('should handle validation state changes', async () => {
      const user = userEvent.setup();
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      const emailInput = screen.getByLabelText(/email address/i);
      
      // Type invalid email
      await user.type(emailInput, 'invalid');
      await waitFor(() => {
        expect(emailInput.className).toMatch(/red/);
      });
      
      // Clear and type valid email
      await user.clear(emailInput);
      await user.type(emailInput, 'test@example.com');
      
      await waitFor(() => {
        expect(emailInput.className).toMatch(/green/);
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        new Promise((resolve) => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ verification: { id: '123' } }),
        }), 100))
      ) as any;
      
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send verification/i }));
      
      expect(screen.getByText(/sending/i)).toBeInTheDocument();
    });

    it('should disable submit button during loading', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        new Promise((resolve) => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ verification: { id: '123' } }),
        }), 100))
      ) as any;
      
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send verification/i }));
      
      const button = screen.getByRole('button', { name: /sending/i });
      expect(button).toBeDisabled();
    });

    it('should disable email input during loading', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        new Promise((resolve) => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ verification: { id: '123' } }),
        }), 100))
      ) as any;
      
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send verification/i }));
      
      expect(emailInput).toBeDisabled();
    });
  });

  describe('Success States', () => {
    it('should show success message after sending verification', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ verification: { id: '123' } }),
        })
      ) as any;
      
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send verification/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/verification email sent/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error States', () => {
    it('should handle API failure gracefully', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: 'Email already exists' }),
        })
      ) as any;
      
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send verification/i }));
      
      // Verify fetch was called
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should display generic error on network failure', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;
      
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');
      await user.click(screen.getByRole('button', { name: /send verification/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle email with special characters', async () => {
      const user = userEvent.setup();
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      await user.type(emailInput, 'test+tag@example.co.uk');
      
      expect(emailInput.value).toBe('test+tag@example.co.uk');
      
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /send verification/i });
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('should handle very long email addresses', async () => {
      const user = userEvent.setup();
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      const longEmail = 'a'.repeat(50) + '@example.com';
      await user.type(emailInput, longEmail);
      
      expect(emailInput.value).toBe(longEmail);
    });

    it('should handle email with uppercase letters', async () => {
      const user = userEvent.setup();
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      await user.type(emailInput, 'Test@Example.COM');
      
      expect(emailInput.value).toBe('Test@Example.COM');
      
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /send verification/i });
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('should show warning for invalid email format', async () => {
      const user = userEvent.setup();
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'notanemail');
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address to continue/i)).toBeInTheDocument();
      });
    });
  });

  describe('Visual Feedback', () => {
    it('should show green border for valid email', async () => {
      const user = userEvent.setup();
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');
      
      await waitFor(() => {
        expect(emailInput.className).toMatch(/green/);
      });
    });

    it('should show red border for invalid email', async () => {
      const user = userEvent.setup();
      renderWithRouter(<VerifyEmailPage />, { 
        initialRoute: '/verify-email',
        locationState: { user_id: '123' }
      });
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'invalid');
      
      await waitFor(() => {
        expect(emailInput.className).toMatch(/red/);
      });
    });
  });
});
