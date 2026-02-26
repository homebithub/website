import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Footer from '../Footer';
import { MemoryRouter } from 'react-router';

// Mock dependencies
const mockUseLocation = vi.fn();
const mockUseProfileSetupStatus = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useLocation: () => mockUseLocation(),
  };
});

vi.mock('~/hooks/useProfileSetupStatus', () => ({
  useProfileSetupStatus: () => mockUseProfileSetupStatus(),
}));

describe('Footer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocation.mockReturnValue({ pathname: '/', search: '', hash: '', state: null });
    mockUseProfileSetupStatus.mockReturnValue({ isInSetupMode: false });
  });

  describe('Basic Rendering', () => {
    it('renders the footer', () => {
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    it('renders Homebit branding', () => {
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      expect(screen.getByText('Homebit')).toBeInTheDocument();
    });

    it('renders current year in copyright', () => {
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      const currentYear = new Date().getFullYear();
      expect(screen.getByText(`© ${currentYear}`)).toBeInTheDocument();
    });

    it('renders with dark variant by default', () => {
      const { container } = render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('bg-gray-900');
    });
  });

  describe('Variant Prop', () => {
    it('applies dark variant classes', () => {
      const { container } = render(
        <MemoryRouter>
          <Footer variant="dark" />
        </MemoryRouter>
      );
      
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('bg-gray-900', 'dark:bg-[#0a0a0f]', 'text-gray-100');
    });

    it('applies light variant classes', () => {
      const { container } = render(
        <MemoryRouter>
          <Footer variant="light" />
        </MemoryRouter>
      );
      
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('bg-white', 'text-gray-800');
    });

    it('applies base classes regardless of variant', () => {
      const { container } = render(
        <MemoryRouter>
          <Footer variant="light" />
        </MemoryRouter>
      );
      
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('py-8', 'border-t', 'transition-colors', 'duration-300');
    });
  });

  describe('Social Media Links', () => {
    it('renders Facebook link', () => {
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      const facebookLink = screen.getByLabelText('Facebook');
      expect(facebookLink).toBeInTheDocument();
      expect(facebookLink).toHaveAttribute('href', 'https://web.facebook.com/profile.php?id=61582801828384');
    });

    it('renders Instagram link', () => {
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      const instagramLink = screen.getByLabelText('Instagram');
      expect(instagramLink).toBeInTheDocument();
      expect(instagramLink).toHaveAttribute('href', 'https://www.instagram.com/homebithub/');
    });

    it('renders X (Twitter) link', () => {
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      const twitterLink = screen.getByLabelText('X (Twitter)');
      expect(twitterLink).toBeInTheDocument();
      expect(twitterLink).toHaveAttribute('href', 'https://x.com/homebithub');
    });

    it('renders LinkedIn link', () => {
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      const linkedinLink = screen.getByLabelText('LinkedIn');
      expect(linkedinLink).toBeInTheDocument();
      expect(linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/company/homebithub');
    });

    it('opens social links in new tab', () => {
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      const facebookLink = screen.getByLabelText('Facebook');
      expect(facebookLink).toHaveAttribute('target', '_blank');
      expect(facebookLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('applies hover styles to social links', () => {
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      const facebookLink = screen.getByLabelText('Facebook');
      expect(facebookLink).toHaveClass('hover:text-purple-400', 'hover:scale-125');
    });
  });

  describe('Navigation Links', () => {
    it('renders Privacy Policy link', () => {
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      const privacyLink = screen.getByRole('link', { name: /privacy policy/i });
      expect(privacyLink).toBeInTheDocument();
      expect(privacyLink).toHaveAttribute('href', '/privacy');
    });

    it('renders Terms of Service link', () => {
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      const termsLink = screen.getByRole('link', { name: /terms of service/i });
      expect(termsLink).toBeInTheDocument();
      expect(termsLink).toHaveAttribute('href', '/terms');
    });

    it('renders Contact link', () => {
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      const contactLink = screen.getByRole('link', { name: /contact/i });
      expect(contactLink).toBeInTheDocument();
      expect(contactLink).toHaveAttribute('href', '/contact');
    });

    it('applies hover styles to navigation links', () => {
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      const privacyLink = screen.getByRole('link', { name: /privacy policy/i });
      expect(privacyLink).toHaveClass('hover:text-purple-400', 'transition-colors');
    });
  });

  describe('Profile Setup Mode', () => {
    it('hides footer when in setup mode', () => {
      mockUseProfileSetupStatus.mockReturnValue({ isInSetupMode: true });
      
      const { container } = render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('shows footer when not in setup mode', () => {
      mockUseProfileSetupStatus.mockReturnValue({ isInSetupMode: false });
      
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });
  });

  describe('Househelp Profile Route', () => {
    it('shows profile navigation when on househelp profile route', () => {
      mockUseLocation.mockReturnValue({ pathname: '/househelp/profile', search: '', hash: '', state: null });
      
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      expect(screen.getByRole('link', { name: /^profile$/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /profile 1/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /profile 2/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /profile 3/i })).toBeInTheDocument();
    });

    it('shows profile navigation on househelp profile1 route', () => {
      mockUseLocation.mockReturnValue({ pathname: '/househelp/profile1', search: '', hash: '', state: null });
      
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      expect(screen.getByRole('link', { name: /^profile$/i })).toBeInTheDocument();
    });

    it('shows profile navigation on househelp profile2 route', () => {
      mockUseLocation.mockReturnValue({ pathname: '/househelp/profile2', search: '', hash: '', state: null });
      
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      expect(screen.getByRole('link', { name: /^profile$/i })).toBeInTheDocument();
    });

    it('shows profile navigation on househelp profile3 route', () => {
      mockUseLocation.mockReturnValue({ pathname: '/househelp/profile3', search: '', hash: '', state: null });
      
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      expect(screen.getByRole('link', { name: /^profile$/i })).toBeInTheDocument();
    });

    it('does not show profile navigation on non-househelp routes', () => {
      mockUseLocation.mockReturnValue({ pathname: '/dashboard', search: '', hash: '', state: null });
      
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      expect(screen.queryByRole('link', { name: /profile 1/i })).not.toBeInTheDocument();
    });

    it('profile links have correct hrefs', () => {
      mockUseLocation.mockReturnValue({ pathname: '/househelp/profile', search: '', hash: '', state: null });
      
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      expect(screen.getByRole('link', { name: /^profile$/i })).toHaveAttribute('href', '/househelp/profile');
      expect(screen.getByRole('link', { name: /profile 1/i })).toHaveAttribute('href', '/househelp/profile1');
      expect(screen.getByRole('link', { name: /profile 2/i })).toHaveAttribute('href', '/househelp/profile2');
      expect(screen.getByRole('link', { name: /profile 3/i })).toHaveAttribute('href', '/househelp/profile3');
    });

    it('profile links have hover styles', () => {
      mockUseLocation.mockReturnValue({ pathname: '/househelp/profile', search: '', hash: '', state: null });
      
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      const profileLink = screen.getByRole('link', { name: /^profile$/i });
      expect(profileLink).toHaveClass('hover:bg-purple-500/15', 'transition-colors');
    });
  });

  describe('Layout and Styling', () => {
    it('has container with proper classes', () => {
      const { container } = render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      const containerDiv = container.querySelector('.container');
      expect(containerDiv).toHaveClass('mx-auto', 'px-4');
    });

    it('uses flexbox layout', () => {
      const { container } = render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      const containerDiv = container.querySelector('.container');
      expect(containerDiv).toHaveClass('flex', 'flex-col', 'md:flex-row');
    });

    it('has gradient text on branding', () => {
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      const branding = screen.getByText('Homebit');
      expect(branding).toHaveClass('gradient-text');
    });

    it('applies transition classes', () => {
      const { container } = render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('transition-colors', 'duration-300');
    });
  });

  describe('Accessibility', () => {
    it('has semantic footer element', () => {
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('social links have aria-labels', () => {
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      expect(screen.getByLabelText('Facebook')).toBeInTheDocument();
      expect(screen.getByLabelText('Instagram')).toBeInTheDocument();
      expect(screen.getByLabelText('X (Twitter)')).toBeInTheDocument();
      expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
    });

    it('external links have proper rel attribute', () => {
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      const facebookLink = screen.getByLabelText('Facebook');
      expect(facebookLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined variant gracefully', () => {
      const { container } = render(
        <MemoryRouter>
          <Footer variant={undefined} />
        </MemoryRouter>
      );
      
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('bg-gray-900'); // defaults to dark
    });

    it('handles route with query parameters', () => {
      mockUseLocation.mockReturnValue({ 
        pathname: '/househelp/profile', 
        search: '?tab=settings', 
        hash: '', 
        state: null 
      });
      
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      expect(screen.getByRole('link', { name: /^profile$/i })).toBeInTheDocument();
    });

    it('handles route with hash', () => {
      mockUseLocation.mockReturnValue({ 
        pathname: '/househelp/profile', 
        search: '', 
        hash: '#section', 
        state: null 
      });
      
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      expect(screen.getByRole('link', { name: /^profile$/i })).toBeInTheDocument();
    });

    it('handles similar but non-matching routes', () => {
      mockUseLocation.mockReturnValue({ pathname: '/househelp', search: '', hash: '', state: null });
      
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );
      
      expect(screen.queryByRole('link', { name: /profile 1/i })).not.toBeInTheDocument();
    });
  });
});
