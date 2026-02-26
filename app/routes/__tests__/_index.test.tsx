import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter } from '~/test/utils/test-utils';
import Index from '../_index';

// Mock the lazy-loaded components
vi.mock('~/components/AuthenticatedHome', () => ({
  default: () => <div data-testid="authenticated-home">Authenticated Home</div>,
}));

vi.mock('~/components/HousehelpHome', () => ({
  default: () => <div data-testid="househelp-home">Househelp Home</div>,
}));

vi.mock('~/routes/landing', () => ({
  default: () => <div data-testid="landing-page">Landing Page</div>,
}));

// Mock the scroll hook
vi.mock('~/hooks/useScrollFadeIn', () => ({
  default: vi.fn(),
}));

describe('Index Page (Router)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Setup default fetch mock
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: {
            status: 'completed',
            total_steps: 5,
            last_completed_step: 5,
          },
        }),
      })
    ) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Rendering & Initial State', () => {
    it('should show loading screen initially', () => {
      renderWithRouter(<Index />);
      
      expect(screen.getByText(/loading your experience/i)).toBeInTheDocument();
      expect(screen.getByText(/🏠 homebit/i)).toBeInTheDocument();
    });

    it('should have loading spinner with proper styling', () => {
      renderWithRouter(<Index />);
      
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('rounded-full', 'h-20', 'w-20');
    });
  });

  describe('2. Unauthenticated Users', () => {
    it('should show landing page for non-authenticated users', async () => {
      renderWithRouter(<Index />);
      
      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should not show authenticated home for non-authenticated users', async () => {
      renderWithRouter(<Index />);
      
      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      }, { timeout: 5000 });
      
      expect(screen.queryByTestId('authenticated-home')).not.toBeInTheDocument();
      expect(screen.queryByTestId('househelp-home')).not.toBeInTheDocument();
    });

    it('should not make API calls when no token exists', async () => {
      renderWithRouter(<Index />);
      
      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      }, { timeout: 5000 });
      
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('3. Authenticated Household Users', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user_object', JSON.stringify({ profile_type: 'household' }));
    });

    it('should show authenticated home for household users with completed profile', async () => {
      renderWithRouter(<Index />);
      
      await waitFor(() => {
        expect(screen.getByTestId('authenticated-home')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should check profile setup progress for authenticated users', async () => {
      renderWithRouter(<Index />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/v1/profile-setup-progress'),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
            }),
          })
        );
      }, { timeout: 5000 });
    });

    it('should not show househelp home for household users', async () => {
      renderWithRouter(<Index />);
      
      await waitFor(() => {
        expect(screen.getByTestId('authenticated-home')).toBeInTheDocument();
      }, { timeout: 5000 });
      
      expect(screen.queryByTestId('househelp-home')).not.toBeInTheDocument();
    });
  });

  describe('4. Authenticated Househelp Users', () => {
    beforeEach(() => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user_object', JSON.stringify({ profile_type: 'househelp' }));
    });

    it('should show househelp home for househelp users with completed profile', async () => {
      renderWithRouter(<Index />);
      
      await waitFor(() => {
        expect(screen.getByTestId('househelp-home')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should not show household home for househelp users', async () => {
      renderWithRouter(<Index />);
      
      await waitFor(() => {
        expect(screen.getByTestId('househelp-home')).toBeInTheDocument();
      }, { timeout: 5000 });
      
      expect(screen.queryByTestId('authenticated-home')).not.toBeInTheDocument();
    });

    it('should check profile setup progress for househelp users', async () => {
      renderWithRouter(<Index />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/v1/profile-setup-progress'),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
            }),
          })
        );
      }, { timeout: 5000 });
    });
  });

  describe('5. User Type Detection', () => {
    it('should detect user type from user_object.profile_type', async () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user_object', JSON.stringify({ profile_type: 'household' }));
      
      renderWithRouter(<Index />);
      
      await waitFor(() => {
        expect(screen.getByTestId('authenticated-home')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should detect user type from user_object.role as fallback', async () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user_object', JSON.stringify({ role: 'househelp' }));
      
      renderWithRouter(<Index />);
      
      await waitFor(() => {
        expect(screen.getByTestId('househelp-home')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should fallback to userType from localStorage', async () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('userType', 'househelp');
      
      renderWithRouter(<Index />);
      
      await waitFor(() => {
        expect(screen.getByTestId('househelp-home')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should sync userType to localStorage when found in user_object', async () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user_object', JSON.stringify({ profile_type: 'household' }));
      
      renderWithRouter(<Index />);
      
      await waitFor(() => {
        expect(screen.getByTestId('authenticated-home')).toBeInTheDocument();
      }, { timeout: 5000 });
      
      expect(localStorage.getItem('userType')).toBe('household');
    });
  });

  describe('6. Profile Setup Progress Handling', () => {
    it('should show home when profile is completed', async () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user_object', JSON.stringify({ profile_type: 'household' }));
      
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            data: {
              status: 'completed',
              total_steps: 5,
              last_completed_step: 5,
            },
          }),
        })
      ) as any;
      
      renderWithRouter(<Index />);
      
      await waitFor(() => {
        expect(screen.getByTestId('authenticated-home')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should handle API failure gracefully and show home', async () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user_object', JSON.stringify({ profile_type: 'household' }));
      
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;
      
      renderWithRouter(<Index />);
      
      // Should show authenticated home despite API failure
      await waitFor(() => {
        expect(screen.getByTestId('authenticated-home')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should handle non-ok response gracefully', async () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user_object', JSON.stringify({ profile_type: 'household' }));
      
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({}),
        })
      ) as any;
      
      renderWithRouter(<Index />);
      
      await waitFor(() => {
        expect(screen.getByTestId('authenticated-home')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  });

  describe('7. Error Handling', () => {
    it('should handle invalid user_object JSON gracefully', async () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user_object', 'invalid-json{{{');
      
      renderWithRouter(<Index />);
      
      // Should fall back to landing page when user type cannot be determined
      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should handle missing token gracefully', async () => {
      renderWithRouter(<Index />);
      
      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should handle authenticated user without user type', async () => {
      localStorage.setItem('token', 'test-token');
      // No user_object or userType set
      
      renderWithRouter(<Index />);
      
      // Should show authenticated home as default
      await waitFor(() => {
        expect(screen.getByTestId('authenticated-home')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should log error when user_object parsing fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user_object', 'invalid-json');
      
      renderWithRouter(<Index />);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to parse user_object:',
          expect.any(Error)
        );
      }, { timeout: 5000 });
      
      consoleErrorSpy.mockRestore();
    });

    it('should log error when profile setup check fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user_object', JSON.stringify({ profile_type: 'household' }));
      
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;
      
      renderWithRouter(<Index />);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to check profile setup status:',
          expect.any(Error)
        );
      }, { timeout: 5000 });
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('8. Theme Consistency', () => {
    it('should use purple theme in loading screen', () => {
      renderWithRouter(<Index />);
      
      const container = document.querySelector('.bg-gradient-to-br');
      expect(container).toHaveClass('from-purple-600', 'to-pink-600');
    });

    it('should support dark mode in loading screen', () => {
      renderWithRouter(<Index />);
      
      const container = document.querySelector('.bg-gradient-to-br');
      expect(container).toHaveClass('dark:from-[#0a0a0f]', 'dark:via-[#13131a]', 'dark:to-purple-950');
    });

    it('should have smooth transitions', () => {
      renderWithRouter(<Index />);
      
      const container = document.querySelector('.bg-gradient-to-br');
      expect(container).toHaveClass('transition-colors', 'duration-300');
    });
  });

  describe('9. Accessibility', () => {
    it('should have descriptive loading text', () => {
      renderWithRouter(<Index />);
      
      expect(screen.getByText(/loading your experience/i)).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      renderWithRouter(<Index />);
      
      const heading = screen.getByText(/🏠 homebit/i);
      expect(heading.tagName).toBe('H2');
    });

    it('should have visible loading indicator', () => {
      renderWithRouter(<Index />);
      
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeVisible();
    });
  });

  describe('10. Component Lifecycle', () => {
    it('should call useScrollFadeIn hook', () => {
      const useScrollFadeIn = vi.fn();
      vi.doMock('~/hooks/useScrollFadeIn', () => ({
        default: useScrollFadeIn,
      }));
      
      renderWithRouter(<Index />);
      
      // Hook is called during render
      expect(useScrollFadeIn).toHaveBeenCalled();
    });

    it('should clean up properly on unmount', async () => {
      const { unmount } = renderWithRouter(<Index />);
      
      await waitFor(() => {
        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
      }, { timeout: 5000 });
      
      // Should not throw errors on unmount
      expect(() => unmount()).not.toThrow();
    });
  });
});
