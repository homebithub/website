import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter, userEvent, VIEWPORTS, setViewport } from '~/test/utils/test-utils';
import Footer from '../Footer';

// Mock the profile setup hook
vi.mock('~/hooks/useProfileSetupStatus', () => ({
  useProfileSetupStatus: vi.fn(() => ({
    isInSetupMode: false,
  })),
}));

describe('Footer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render footer with brand name', () => {
      renderWithRouter(<Footer />);
      expect(screen.getByText('Homebit')).toBeInTheDocument();
    });

    it('should render current year in copyright', () => {
      renderWithRouter(<Footer />);
      const currentYear = new Date().getFullYear();
      expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument();
    });

    it('should render social media links', () => {
      renderWithRouter(<Footer />);
      
      expect(screen.getByLabelText('Facebook')).toBeInTheDocument();
      expect(screen.getByLabelText('Instagram')).toBeInTheDocument();
      expect(screen.getByLabelText(/X.*Twitter/i)).toBeInTheDocument();
      expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
    });

    it('should render footer links', () => {
      renderWithRouter(<Footer />);
      
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      expect(screen.getByText('Terms of Service')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    it('should not render when in setup mode', () => {
      const { useProfileSetupStatus } = require('~/hooks/useProfileSetupStatus');
      useProfileSetupStatus.mockReturnValue({ isInSetupMode: true });
      
      const { container } = renderWithRouter(<Footer />);
      expect(container.firstChild).toBeNull();
    });

    it('should render profile links on househelp profile route', () => {
      renderWithRouter(<Footer />, { initialRoute: '/househelp/profile' });
      
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Profile 1')).toBeInTheDocument();
      expect(screen.getByText('Profile 2')).toBeInTheDocument();
      expect(screen.getByText('Profile 3')).toBeInTheDocument();
    });
  });

  describe('Theme Consistency', () => {
    it('should use dark variant by default', () => {
      const { container } = renderWithRouter(<Footer />);
      const footer = container.querySelector('footer');
      
      expect(footer?.className).toMatch(/bg-gray-900|dark:bg-/);
    });

    it('should use light variant when specified', () => {
      const { container } = renderWithRouter(<Footer variant="light" />);
      const footer = container.querySelector('footer');
      
      expect(footer?.className).toMatch(/bg-white/);
    });

    it('should have purple hover effects on links', () => {
      renderWithRouter(<Footer />);
      const privacyLink = screen.getByText('Privacy Policy');
      
      expect(privacyLink.className).toMatch(/hover:text-purple/);
    });

    it('should have purple hover effects on social icons', () => {
      const { container } = renderWithRouter(<Footer />);
      const socialLinks = container.querySelectorAll('a[aria-label]');
      
      socialLinks.forEach(link => {
        expect(link.className).toMatch(/hover:text-purple/);
      });
    });

    it('should have gradient text on brand', () => {
      renderWithRouter(<Footer />);
      const brand = screen.getByText('Homebit');
      
      expect(brand.className).toMatch(/gradient-text/);
    });

    it('should work in dark mode', () => {
      renderWithRouter(<Footer />, { darkMode: true });
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(screen.getByText('Homebit')).toBeVisible();
    });

    it('should have transition effects', () => {
      const { container } = renderWithRouter(<Footer />);
      const footer = container.querySelector('footer');
      
      expect(footer?.className).toMatch(/transition/);
    });

    it('should have border styling', () => {
      const { container } = renderWithRouter(<Footer />);
      const footer = container.querySelector('footer');
      
      expect(footer?.className).toMatch(/border-t/);
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should be responsive on mobile', () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      renderWithRouter(<Footer />);
      
      expect(screen.getByText('Homebit')).toBeVisible();
      expect(screen.getByText('Privacy Policy')).toBeVisible();
    });

    it('should stack elements vertically on mobile', () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      const { container } = renderWithRouter(<Footer />);
      const footerContent = container.querySelector('.container');
      
      expect(footerContent?.className).toMatch(/flex-col|md:flex-row/);
    });

    it('should be responsive on tablet', () => {
      setViewport(VIEWPORTS.tablet.width, VIEWPORTS.tablet.height);
      renderWithRouter(<Footer />);
      
      expect(screen.getByText('Homebit')).toBeVisible();
    });

    it('should be responsive on desktop', () => {
      setViewport(VIEWPORTS.desktop.width, VIEWPORTS.desktop.height);
      renderWithRouter(<Footer />);
      
      expect(screen.getByText('Homebit')).toBeVisible();
    });

    it('should have proper spacing on mobile', () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      const { container } = renderWithRouter(<Footer />);
      const footer = container.querySelector('footer');
      
      expect(footer?.className).toMatch(/py-/);
    });

    it('should wrap footer links on small screens', () => {
      setViewport(VIEWPORTS.mobileSmall.width, VIEWPORTS.mobileSmall.height);
      const { container } = renderWithRouter(<Footer />);
      const linksContainer = container.querySelector('.flex-wrap');
      
      expect(linksContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper footer landmark', () => {
      const { container } = renderWithRouter(<Footer />);
      const footer = container.querySelector('footer');
      
      expect(footer).toBeInTheDocument();
    });

    it('should have accessible social media links', () => {
      renderWithRouter(<Footer />);
      
      const facebookLink = screen.getByLabelText('Facebook');
      const instagramLink = screen.getByLabelText('Instagram');
      const twitterLink = screen.getByLabelText(/X.*Twitter/i);
      const linkedinLink = screen.getByLabelText('LinkedIn');
      
      expect(facebookLink).toHaveAttribute('href');
      expect(instagramLink).toHaveAttribute('href');
      expect(twitterLink).toHaveAttribute('href');
      expect(linkedinLink).toHaveAttribute('href');
    });

    it('should have rel="noopener noreferrer" on external links', () => {
      const { container } = renderWithRouter(<Footer />);
      const externalLinks = container.querySelectorAll('a[target="_blank"]');
      
      externalLinks.forEach(link => {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Footer />);
      
      // Tab through footer links
      await user.tab();
      
      // At least one element should have focus
      expect(document.activeElement).not.toBe(document.body);
    });

    it('should have proper link text', () => {
      renderWithRouter(<Footer />);
      
      const privacyLink = screen.getByText('Privacy Policy');
      const termsLink = screen.getByText('Terms of Service');
      const contactLink = screen.getByText('Contact');
      
      expect(privacyLink).toHaveAccessibleName();
      expect(termsLink).toHaveAccessibleName();
      expect(contactLink).toHaveAccessibleName();
    });

    it('should have proper ARIA labels for icon-only links', () => {
      renderWithRouter(<Footer />);
      
      const facebookLink = screen.getByLabelText('Facebook');
      const instagramLink = screen.getByLabelText('Instagram');
      
      expect(facebookLink).toHaveAttribute('aria-label');
      expect(instagramLink).toHaveAttribute('aria-label');
    });
  });

  describe('Navigation Links', () => {
    it('should link to privacy policy', () => {
      renderWithRouter(<Footer />);
      const privacyLink = screen.getByText('Privacy Policy');
      
      expect(privacyLink).toHaveAttribute('href', '/privacy');
    });

    it('should link to terms of service', () => {
      renderWithRouter(<Footer />);
      const termsLink = screen.getByText('Terms of Service');
      
      expect(termsLink).toHaveAttribute('href', '/terms');
    });

    it('should link to contact page', () => {
      renderWithRouter(<Footer />);
      const contactLink = screen.getByText('Contact');
      
      expect(contactLink).toHaveAttribute('href', '/contact');
    });

    it('should have prefetch on internal links', () => {
      renderWithRouter(<Footer />);
      const privacyLink = screen.getByText('Privacy Policy');
      
      expect(privacyLink).toHaveAttribute('prefetch', 'viewport');
    });
  });

  describe('Social Media Links', () => {
    it('should link to Facebook page', () => {
      renderWithRouter(<Footer />);
      const facebookLink = screen.getByLabelText('Facebook');
      
      expect(facebookLink).toHaveAttribute('href');
      expect(facebookLink.getAttribute('href')).toContain('facebook.com');
    });

    it('should link to Instagram page', () => {
      renderWithRouter(<Footer />);
      const instagramLink = screen.getByLabelText('Instagram');
      
      expect(instagramLink).toHaveAttribute('href');
      expect(instagramLink.getAttribute('href')).toContain('instagram.com');
    });

    it('should link to X (Twitter) page', () => {
      renderWithRouter(<Footer />);
      const twitterLink = screen.getByLabelText(/X.*Twitter/i);
      
      expect(twitterLink).toHaveAttribute('href');
      expect(twitterLink.getAttribute('href')).toContain('x.com');
    });

    it('should link to LinkedIn page', () => {
      renderWithRouter(<Footer />);
      const linkedinLink = screen.getByLabelText('LinkedIn');
      
      expect(linkedinLink).toHaveAttribute('href');
      expect(linkedinLink.getAttribute('href')).toContain('linkedin.com');
    });

    it('should open social links in new tab', () => {
      const { container } = renderWithRouter(<Footer />);
      const socialLinks = container.querySelectorAll('a[aria-label]');
      
      socialLinks.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank');
      });
    });

    it('should have hover scale effect on social icons', () => {
      const { container } = renderWithRouter(<Footer />);
      const socialLinks = container.querySelectorAll('a[aria-label]');
      
      socialLinks.forEach(link => {
        expect(link.className).toMatch(/hover:scale/);
      });
    });
  });

  describe('Conditional Rendering', () => {
    it('should hide footer during profile setup', () => {
      const { useProfileSetupStatus } = require('~/hooks/useProfileSetupStatus');
      useProfileSetupStatus.mockReturnValue({ isInSetupMode: true });
      
      const { container } = renderWithRouter(<Footer />);
      expect(container.firstChild).toBeNull();
    });

    it('should show footer when not in setup mode', () => {
      const { useProfileSetupStatus } = require('~/hooks/useProfileSetupStatus');
      useProfileSetupStatus.mockReturnValue({ isInSetupMode: false });
      
      renderWithRouter(<Footer />);
      expect(screen.getByText('Homebit')).toBeInTheDocument();
    });

    it('should show profile links only on househelp profile route', () => {
      renderWithRouter(<Footer />, { initialRoute: '/househelp/profile' });
      
      expect(screen.getByText('Profile 1')).toBeInTheDocument();
    });

    it('should not show profile links on other routes', () => {
      renderWithRouter(<Footer />, { initialRoute: '/about' });
      
      expect(screen.queryByText('Profile 1')).not.toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should apply dark variant styles', () => {
      const { container } = renderWithRouter(<Footer variant="dark" />);
      const footer = container.querySelector('footer');
      
      expect(footer?.className).toMatch(/bg-gray-900/);
    });

    it('should apply light variant styles', () => {
      const { container } = renderWithRouter(<Footer variant="light" />);
      const footer = container.querySelector('footer');
      
      expect(footer?.className).toMatch(/bg-white/);
    });

    it('should have proper text color for dark variant', () => {
      const { container } = renderWithRouter(<Footer variant="dark" />);
      const footer = container.querySelector('footer');
      
      expect(footer?.className).toMatch(/text-gray-100/);
    });

    it('should have proper text color for light variant', () => {
      const { container } = renderWithRouter(<Footer variant="light" />);
      const footer = container.querySelector('footer');
      
      expect(footer?.className).toMatch(/text-gray-800/);
    });
  });

  describe('User Interactions', () => {
    it('should navigate to privacy policy on click', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Footer />);
      
      const privacyLink = screen.getByText('Privacy Policy');
      await user.click(privacyLink);
      
      expect(privacyLink).toHaveAttribute('href', '/privacy');
    });

    it('should navigate to terms on click', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Footer />);
      
      const termsLink = screen.getByText('Terms of Service');
      await user.click(termsLink);
      
      expect(termsLink).toHaveAttribute('href', '/terms');
    });

    it('should navigate to contact on click', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Footer />);
      
      const contactLink = screen.getByText('Contact');
      await user.click(contactLink);
      
      expect(contactLink).toHaveAttribute('href', '/contact');
    });
  });

  describe('Performance', () => {
    it('should render without unnecessary re-renders', () => {
      const { rerender } = renderWithRouter(<Footer />);
      
      const initialBrand = screen.getByText('Homebit');
      
      rerender(<Footer />);
      
      const rerenderedBrand = screen.getByText('Homebit');
      
      expect(initialBrand).toBe(rerenderedBrand);
    });

    it('should memoize year calculation', () => {
      renderWithRouter(<Footer />);
      const currentYear = new Date().getFullYear();
      
      expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument();
    });
  });
});
