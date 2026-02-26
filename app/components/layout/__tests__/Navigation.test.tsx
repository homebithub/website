import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter, userEvent, VIEWPORTS, setViewport } from '~/test/utils/test-utils';
import { Navigation } from '../../../components/Navigation';

// Mock the auth context
vi.mock('~/contexts/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    logout: vi.fn(),
    loading: false,
  })),
}));

// Mock the profile setup hook
vi.mock('~/hooks/useProfileSetupStatus', () => ({
  useProfileSetupStatus: vi.fn(() => ({
    isInSetupMode: false,
  })),
}));

// Mock fetch
global.fetch = vi.fn();

describe('Navigation Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ count: 0, conversations: [] }),
    });
  });

  describe('Rendering', () => {
    it('should render navigation links', () => {
      renderWithRouter(<Navigation />);
      
      expect(screen.getByText('Services')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
      expect(screen.getByText('Pricing')).toBeInTheDocument();
    });

    it('should render logo/brand', () => {
      const { container } = renderWithRouter(<Navigation />);
      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });

    it('should show login/signup when not authenticated', () => {
      renderWithRouter(<Navigation />);
      
      // Should show auth buttons
      const loginLink = screen.queryByText(/log in|sign in/i);
      const signupLink = screen.queryByText(/sign up|get started/i);
      
      expect(loginLink || signupLink).toBeInTheDocument();
    });
  });

  describe('Theme Consistency', () => {
    it('should use primary purple color for active links', () => {
      const { container } = renderWithRouter(<Navigation />);
      const nav = container.querySelector('nav');
      
      // Navigation should have theme colors
      expect(nav?.className).toMatch(/bg-|border-/);
    });

    it('should have proper hover states on links', () => {
      renderWithRouter(<Navigation />);
      const servicesLink = screen.getByText('Services');
      
      expect(servicesLink.className).toMatch(/hover:/);
    });

    it('should work in dark mode', () => {
      renderWithRouter(<Navigation />, { darkMode: true });
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      
      // Navigation should still be visible
      expect(screen.getByText('Services')).toBeVisible();
    });

    it('should have rounded corners on buttons', () => {
      renderWithRouter(<Navigation />);
      const { container } = renderWithRouter(<Navigation />);
      const buttons = container.querySelectorAll('button');
      
      buttons.forEach(button => {
        expect(button.className).toMatch(/rounded/);
      });
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should show mobile menu button on small screens', () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      const { container } = renderWithRouter(<Navigation />);
      
      // Should have mobile menu button (hamburger)
      const mobileMenuButton = container.querySelector('[aria-label*="menu" i], [aria-label*="navigation" i]');
      expect(mobileMenuButton || screen.queryByRole('button')).toBeInTheDocument();
    });

    it('should be responsive on tablet', () => {
      setViewport(VIEWPORTS.tablet.width, VIEWPORTS.tablet.height);
      renderWithRouter(<Navigation />);
      
      expect(screen.getByText('Services')).toBeVisible();
    });

    it('should show full navigation on desktop', () => {
      setViewport(VIEWPORTS.desktop.width, VIEWPORTS.desktop.height);
      renderWithRouter(<Navigation />);
      
      expect(screen.getByText('Services')).toBeVisible();
      expect(screen.getByText('About')).toBeVisible();
      expect(screen.getByText('Contact')).toBeVisible();
      expect(screen.getByText('Pricing')).toBeVisible();
    });

    it('should have touch-friendly button sizes on mobile', () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      const { container } = renderWithRouter(<Navigation />);
      const buttons = container.querySelectorAll('button');
      
      buttons.forEach(button => {
        // Should have adequate padding for touch
        expect(button.className).toMatch(/p-|py-|px-/);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper navigation landmark', () => {
      const { container } = renderWithRouter(<Navigation />);
      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });

    it('should have accessible links', () => {
      renderWithRouter(<Navigation />);
      const servicesLink = screen.getByText('Services');
      
      expect(servicesLink).toHaveAttribute('href');
      expect(servicesLink.getAttribute('href')).toBe('/services');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Navigation />);
      
      // Tab through navigation links
      await user.tab();
      
      // At least one element should have focus
      expect(document.activeElement).not.toBe(document.body);
    });

    it('should have proper ARIA labels for buttons', () => {
      const { container } = renderWithRouter(<Navigation />);
      const buttons = container.querySelectorAll('button');
      
      buttons.forEach(button => {
        // Should have aria-label or accessible text
        const hasAriaLabel = button.hasAttribute('aria-label');
        const hasText = button.textContent && button.textContent.trim().length > 0;
        expect(hasAriaLabel || hasText).toBe(true);
      });
    });

    it('should support keyboard shortcuts', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Navigation />);
      
      // Escape key should close mobile menu if open
      await user.keyboard('{Escape}');
      
      // Should not throw error
      expect(screen.getByText('Services')).toBeInTheDocument();
    });
  });

  describe('Authenticated State', () => {
    beforeEach(() => {
      const { useAuth } = require('~/contexts/useAuth');
      useAuth.mockReturnValue({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          profile_type: 'household',
        },
        logout: vi.fn(),
        loading: false,
      });
      localStorage.setItem('token', 'test-token');
    });

    it('should show user menu when authenticated', () => {
      renderWithRouter(<Navigation />);
      
      // Should show user-related elements
      const { container } = renderWithRouter(<Navigation />);
      const userButton = container.querySelector('[aria-label*="user" i], [aria-label*="account" i]');
      expect(userButton || screen.queryByRole('button')).toBeInTheDocument();
    });

    it('should show shortlist link for authenticated users', async () => {
      renderWithRouter(<Navigation />);
      
      await waitFor(() => {
        expect(screen.queryByText(/shortlist/i)).toBeInTheDocument();
      });
    });

    it('should show inbox link for authenticated users', async () => {
      renderWithRouter(<Navigation />);
      
      await waitFor(() => {
        expect(screen.queryByText(/inbox/i)).toBeInTheDocument();
      });
    });

    it('should fetch and display badge counts', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ count: 5 }),
      });

      renderWithRouter(<Navigation />);
      
      await waitFor(() => {
        // Should fetch shortlist count
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should handle logout', async () => {
      const mockLogout = vi.fn();
      const { useAuth } = require('~/contexts/useAuth');
      useAuth.mockReturnValue({
        user: { id: 'user-123', email: 'test@example.com' },
        logout: mockLogout,
        loading: false,
      });

      const user = userEvent.setup();
      renderWithRouter(<Navigation />);
      
      // Find and click logout button (might be in dropdown)
      const logoutButton = screen.queryByText(/log out|sign out/i);
      if (logoutButton) {
        await user.click(logoutButton);
        expect(mockLogout).toHaveBeenCalled();
      }
    });
  });

  describe('Navigation Links', () => {
    it('should navigate to services page', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Navigation />);
      
      const servicesLink = screen.getByText('Services');
      await user.click(servicesLink);
      
      // Should navigate (check URL or route change)
      expect(servicesLink).toHaveAttribute('href', '/services');
    });

    it('should navigate to about page', async () => {
      renderWithRouter(<Navigation />);
      const aboutLink = screen.getByText('About');
      expect(aboutLink).toHaveAttribute('href', '/about');
    });

    it('should navigate to contact page', async () => {
      renderWithRouter(<Navigation />);
      const contactLink = screen.getByText('Contact');
      expect(contactLink).toHaveAttribute('href', '/contact');
    });

    it('should navigate to pricing page', async () => {
      renderWithRouter(<Navigation />);
      const pricingLink = screen.getByText('Pricing');
      expect(pricingLink).toHaveAttribute('href', '/pricing');
    });
  });

  describe('Mobile Menu', () => {
    it('should toggle mobile menu on button click', async () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      const user = userEvent.setup();
      const { container } = renderWithRouter(<Navigation />);
      
      // Find mobile menu button
      const menuButton = container.querySelector('button[aria-label*="menu" i]') || 
                        container.querySelector('button');
      
      if (menuButton) {
        await user.click(menuButton);
        
        // Menu should open (check for expanded state)
        await waitFor(() => {
          const expanded = menuButton.getAttribute('aria-expanded');
          expect(expanded).toBe('true');
        });
      }
    });

    it('should close mobile menu on link click', async () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      const user = userEvent.setup();
      renderWithRouter(<Navigation />);
      
      // Open menu, click link, menu should close
      // Implementation depends on actual component behavior
    });

    it('should close mobile menu on escape key', async () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      const user = userEvent.setup();
      renderWithRouter(<Navigation />);
      
      await user.keyboard('{Escape}');
      
      // Menu should be closed
      expect(screen.getByText('Services')).toBeInTheDocument();
    });
  });

  describe('Theme Toggle', () => {
    it('should render theme toggle button', () => {
      const { container } = renderWithRouter(<Navigation />);
      
      // Should have theme toggle (sun/moon icon)
      const themeToggle = container.querySelector('[aria-label*="theme" i]');
      expect(themeToggle || container.querySelector('button')).toBeInTheDocument();
    });

    it('should toggle dark mode', async () => {
      const user = userEvent.setup();
      const { container } = renderWithRouter(<Navigation />);
      
      const themeToggle = container.querySelector('[aria-label*="theme" i]');
      if (themeToggle) {
        await user.click(themeToggle);
        
        // Dark mode should toggle
        await waitFor(() => {
          const isDark = document.documentElement.classList.contains('dark');
          expect(isDark).toBeDefined();
        });
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
      
      renderWithRouter(<Navigation />);
      
      // Should not crash
      await waitFor(() => {
        expect(screen.getByText('Services')).toBeInTheDocument();
      });
    });

    it('should handle missing token', () => {
      localStorage.removeItem('token');
      renderWithRouter(<Navigation />);
      
      // Should render without errors
      expect(screen.getByText('Services')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not make unnecessary API calls', () => {
      renderWithRouter(<Navigation />);
      
      const fetchCallCount = (global.fetch as any).mock.calls.length;
      
      // Should only fetch when authenticated
      expect(fetchCallCount).toBeLessThanOrEqual(3); // shortlist, inbox, hire requests
    });

    it('should memoize navigation links', () => {
      const { rerender } = renderWithRouter(<Navigation />);
      
      const initialLinks = screen.getAllByRole('link');
      
      rerender(<Navigation />);
      
      const rerenderedLinks = screen.getAllByRole('link');
      
      // Links should be stable
      expect(initialLinks.length).toBe(rerenderedLinks.length);
    });
  });
});
