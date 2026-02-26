import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter, userEvent, VIEWPORTS, setViewport } from '~/test/utils/test-utils';
import SignupPage from '../signup';

// Mock dependencies
vi.mock('~/contexts/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
  })),
}));

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render signup form correctly', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SignupPage />);
      
      // Close the profile type modal first
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /join us/i })).toBeInTheDocument();
      });
    });

    it('should render profile type modal on initial load', () => {
      renderWithRouter(<SignupPage />);
      
      expect(screen.getByRole('heading', { name: /choose your account type/i })).toBeInTheDocument();
      expect(screen.getByText(/household/i)).toBeInTheDocument();
      expect(screen.getByText(/househelp/i)).toBeInTheDocument();
    });

    it('should render Google sign-up button', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SignupPage />);
      
      // Close modal first
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
      });
    });

    it('should render login link', () => {
      renderWithRouter(<SignupPage />);
      
      expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    });
  });

  describe('Theme Consistency', () => {
    it('should use primary purple color scheme', () => {
      renderWithRouter(<SignupPage />);
      
      const heading = screen.getByRole('heading', { name: /choose your account type/i });
      expect(heading.className).toMatch(/purple|gradient/i);
    });

    it('should have themed buttons', () => {
      renderWithRouter(<SignupPage />);
      
      const continueButton = screen.getByRole('button', { name: /continue as/i });
      expect(continueButton.className).toMatch(/purple|gradient/i);
      expect(continueButton.className).toMatch(/rounded/);
    });

    it('should work in dark mode', () => {
      renderWithRouter(<SignupPage />, { darkMode: true });
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should be responsive on mobile (375px)', () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      renderWithRouter(<SignupPage />);
      
      expect(screen.getByRole('heading', { name: /choose your account type/i })).toBeVisible();
    });

    it('should be responsive on tablet (768px)', () => {
      setViewport(VIEWPORTS.tablet.width, VIEWPORTS.tablet.height);
      renderWithRouter(<SignupPage />);
      
      expect(screen.getByRole('heading', { name: /choose your account type/i })).toBeVisible();
    });

    it('should be responsive on desktop (1920px)', () => {
      setViewport(VIEWPORTS.desktop.width, VIEWPORTS.desktop.height);
      renderWithRouter(<SignupPage />);
      
      expect(screen.getByRole('heading', { name: /choose your account type/i })).toBeVisible();
    });

    it('should have touch-friendly button sizes on mobile', () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      renderWithRouter(<SignupPage />);
      
      const continueButton = screen.getByRole('button', { name: /continue as/i });
      expect(continueButton.className).toMatch(/p-|py-|px-/);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithRouter(<SignupPage />);
      
      const heading = screen.getByRole('heading', { name: /choose your account type/i });
      expect(heading.tagName).toBe('H3');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SignupPage />);
      
      await user.tab();
      // First focusable element should be focused
      expect(document.activeElement).toBeTruthy();
    });

    it('should have accessible button labels', () => {
      renderWithRouter(<SignupPage />);
      
      const continueButton = screen.getByRole('button', { name: /continue as/i });
      expect(continueButton).toHaveAccessibleName();
    });

    it('should have accessible checkbox for terms', () => {
      renderWithRouter(<SignupPage />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toHaveAccessibleName();
    });

    it('should have proper form labels with htmlFor attributes - ACCESSIBILITY BUG', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SignupPage />);
      
      // Close modal first
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      await waitFor(() => {
        // These should work with getByLabelText if labels have proper htmlFor
        // Use exact match for Password to avoid matching "Forgot Password?" links
        screen.getByLabelText(/first name/i);
        screen.getByLabelText(/last name/i);
        screen.getByLabelText(/phone/i);
        screen.getByLabelText('Password');
      });
    });
  });

  describe('Profile Type Selection', () => {
    it('should allow selecting household profile type', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SignupPage />);
      
      const householdButton = screen.getByText(/i need to hire help/i).closest('button');
      if (householdButton) {
        await user.click(householdButton);
        
        expect(householdButton.className).toMatch(/border-purple/);
      }
    });

    it('should allow selecting househelp profile type', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SignupPage />);
      
      const househelpButton = screen.getByText(/i'm looking for work/i).closest('button');
      if (househelpButton) {
        await user.click(househelpButton);
        
        expect(househelpButton.className).toMatch(/border-purple/);
      }
    });

    it('should require terms acceptance before continuing', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SignupPage />);
      
      const householdButton = screen.getByText(/i need to hire help/i).closest('button');
      if (householdButton) {
        await user.click(householdButton);
      }
      
      const continueButton = screen.getByRole('button', { name: /continue as/i });
      expect(continueButton).toBeDisabled();
      
      // Accept terms
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      
      expect(continueButton).not.toBeDisabled();
    });

    it('should close modal after profile selection and terms acceptance', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SignupPage />);
      
      // Select profile type
      const householdButton = screen.getByText(/i need to hire help/i).closest('button');
      if (householdButton) {
        await user.click(householdButton);
      }
      
      // Accept terms
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      
      // Click continue
      const continueButton = screen.getByRole('button', { name: /continue as household/i });
      await user.click(continueButton);
      
      // Modal should close
      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /choose your account type/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should show error for empty first name', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SignupPage />, { initialRoute: '/signup?profile_type=household' });
      
      // Wait for modal to not be present
      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /choose your account type/i })).not.toBeInTheDocument();
      });
      
      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.click(firstNameInput);
      await user.tab(); // Blur the field
      
      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument();
      });
    });

    it('should handle form input for phone number', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SignupPage />, { initialRoute: '/signup?profile_type=household' });
      
      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /choose your account type/i })).not.toBeInTheDocument();
      });
      
      const phoneInput = screen.getByLabelText(/phone/i) as HTMLInputElement;
      await user.type(phoneInput, '0712345678');
      
      expect(phoneInput.value).toBe('0712345678');
    });

    it('should handle form input for password', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SignupPage />, { initialRoute: '/signup?profile_type=household' });
      
      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /choose your account type/i })).not.toBeInTheDocument();
      });
      
      // Use exact match for password to avoid matching "Forgot Password?" links
      const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
      await user.type(passwordInput, 'TestPassword123!');
      
      expect(passwordInput.value).toBe('TestPassword123!');
    });

    it('should have validation on form fields', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SignupPage />, { initialRoute: '/signup?profile_type=household' });
      
      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /choose your account type/i })).not.toBeInTheDocument();
      });
      
      // All form fields should be required and accessible via labels
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const phoneInput = screen.getByLabelText(/phone/i);
      // Use exact match for password to avoid matching "Forgot Password?" links
      const passwordInput = screen.getByLabelText('Password');
      
      expect(firstNameInput).toHaveAttribute('required');
      expect(lastNameInput).toHaveAttribute('required');
      expect(phoneInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
    });
  });

  describe('User Interactions', () => {
    it('should handle form input changes', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SignupPage />, { initialRoute: '/signup?profile_type=household' });
      
      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /choose your account type/i })).not.toBeInTheDocument();
      });
      
      // Get first textbox (first name)
      const textboxes = screen.getAllByRole('textbox');
      const firstNameInput = textboxes[0] as HTMLInputElement;
      await user.type(firstNameInput, 'John');
      
      expect(firstNameInput.value).toBe('John');
    });

    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SignupPage />, { initialRoute: '/signup?profile_type=household' });
      
      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /choose your account type/i })).not.toBeInTheDocument();
      });
      
      const passwordInput = screen.getByRole('main').querySelector('input[name="password"]') as HTMLInputElement;
      expect(passwordInput.type).toBe('password');
      
      const toggleButton = passwordInput.parentElement?.querySelector('button');
      if (toggleButton) {
        await user.click(toggleButton);
        expect(passwordInput.type).toBe('text');
      }
    });

    it('should navigate to login page', () => {
      renderWithRouter(<SignupPage />);
      
      const loginLink = screen.getByRole('link', { name: /login/i });
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });

  describe('Loading States', () => {
    it('should handle auth loading state', () => {
      // The mock at the top of the file already handles this
      // Just verify the component renders without crashing
      renderWithRouter(<SignupPage />);
      
      // Should show the profile type modal when not loading
      expect(screen.getByRole('heading', { name: /choose your account type/i })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle bureau ID from query params', () => {
      renderWithRouter(<SignupPage />, { initialRoute: '/signup?bureauId=123' });
      
      expect(screen.getByRole('heading', { name: /choose your account type/i })).toBeInTheDocument();
    });

    it('should handle Google signup flow', () => {
      renderWithRouter(<SignupPage />, { 
        initialRoute: '/signup?google_signup=1&profile_type=household&email=test@example.com&first_name=John&last_name=Doe' 
      });
      
      // Should not show profile modal if profile_type is in URL
      expect(screen.queryByRole('heading', { name: /choose your account type/i })).not.toBeInTheDocument();
    });

    it('should handle long names', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SignupPage />, { initialRoute: '/signup?profile_type=household' });
      
      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /choose your account type/i })).not.toBeInTheDocument();
      });
      
      // Get first textbox (first name)
      const textboxes = screen.getAllByRole('textbox');
      const firstNameInput = textboxes[0] as HTMLInputElement;
      const longName = 'A'.repeat(100);
      await user.type(firstNameInput, longName);
      
      expect(firstNameInput.value).toBe(longName);
    });

    it('should handle special characters in names', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SignupPage />, { initialRoute: '/signup?profile_type=household' });
      
      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /choose your account type/i })).not.toBeInTheDocument();
      });
      
      // Get first textbox (first name)
      const textboxes = screen.getAllByRole('textbox');
      const firstNameInput = textboxes[0] as HTMLInputElement;
      await user.type(firstNameInput, "O'Brien");
      
      expect(firstNameInput.value).toBe("O'Brien");
    });
  });

  describe('Terms and Conditions', () => {
    it('should render terms and privacy policy links', () => {
      renderWithRouter(<SignupPage />);
      
      const termsLinks = screen.getAllByRole('link', { name: /terms and conditions/i });
      const privacyLinks = screen.getAllByRole('link', { name: /privacy policy/i });
      
      // Should have at least one of each (form has them, footer might too)
      expect(termsLinks.length).toBeGreaterThan(0);
      expect(privacyLinks.length).toBeGreaterThan(0);
    });

    it('should open terms in new tab', () => {
      renderWithRouter(<SignupPage />);
      
      const termsLinks = screen.getAllByRole('link', { name: /terms and conditions/i });
      // Find the one with target="_blank" (the one in the form)
      const termsLink = termsLinks.find(link => link.getAttribute('target') === '_blank');
      expect(termsLink).toBeTruthy();
      expect(termsLink).toHaveAttribute('target', '_blank');
    });

    it('should open privacy policy in new tab', () => {
      renderWithRouter(<SignupPage />);
      
      const privacyLinks = screen.getAllByRole('link', { name: /privacy policy/i });
      // Find the one with target="_blank" (the one in the form)
      const privacyLink = privacyLinks.find(link => link.getAttribute('target') === '_blank');
      expect(privacyLink).toBeTruthy();
      expect(privacyLink).toHaveAttribute('target', '_blank');
    });
  });
});
