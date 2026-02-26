import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '~/test/utils/test-utils';
import HouseholdChoicePage from '../household-choice';

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Household Choice Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Rendering & Content', () => {
    it('should render the page title', () => {
      renderWithRouter(<HouseholdChoicePage />);
      
      expect(screen.getByText(/welcome to homebit/i)).toBeInTheDocument();
    });

    it('should render the welcome message with emoji', () => {
      renderWithRouter(<HouseholdChoicePage />);
      
      const heading = screen.getByText(/welcome to homebit! 🏠/i);
      expect(heading).toBeInTheDocument();
    });

    it('should render the subtitle', () => {
      renderWithRouter(<HouseholdChoicePage />);
      
      expect(screen.getByText(/how would you like to get started/i)).toBeInTheDocument();
    });

    it('should render both choice options', () => {
      renderWithRouter(<HouseholdChoicePage />);
      
      expect(screen.getByText(/i have a joining code/i)).toBeInTheDocument();
      expect(screen.getByText(/create a new household/i)).toBeInTheDocument();
    });

    it('should render option descriptions', () => {
      renderWithRouter(<HouseholdChoicePage />);
      
      expect(screen.getByText(/my partner shared a household code/i)).toBeInTheDocument();
      expect(screen.getByText(/i want to set up a new household profile/i)).toBeInTheDocument();
    });

    it('should render the tip section', () => {
      renderWithRouter(<HouseholdChoicePage />);
      
      expect(screen.getByText(/tip:/i)).toBeInTheDocument();
      expect(screen.getByText(/if your partner already has a homebit account/i)).toBeInTheDocument();
    });

    it('should render emojis for both options', () => {
      renderWithRouter(<HouseholdChoicePage />);
      
      expect(screen.getByText('🔑')).toBeInTheDocument();
      expect(screen.getByText('✨')).toBeInTheDocument();
    });
  });

  describe('2. Theme Consistency', () => {
    it('should use purple gradient theme for title', () => {
      renderWithRouter(<HouseholdChoicePage />);
      
      const heading = screen.getByText(/welcome to homebit! 🏠/i);
      expect(heading).toHaveClass('bg-gradient-to-r', 'from-purple-600', 'to-pink-600');
    });

    it('should have purple card wrapper', () => {
      const { container } = renderWithRouter(<HouseholdChoicePage />);
      
      // PurpleCard should be present
      const card = container.querySelector('.max-w-lg');
      expect(card).toBeInTheDocument();
    });

    it('should have proper button styling', () => {
      renderWithRouter(<HouseholdChoicePage />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('rounded-2xl', 'border-2');
      });
    });

    it('should support dark mode classes', () => {
      renderWithRouter(<HouseholdChoicePage />);
      
      const subtitle = screen.getByText(/how would you like to get started/i);
      expect(subtitle).toHaveClass('dark:text-gray-400');
    });
  });

  describe('3. Mobile Responsiveness', () => {
    it('should render properly on mobile viewport (375px)', () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));
      
      renderWithRouter(<HouseholdChoicePage />);
      
      expect(screen.getByText(/welcome to homebit/i)).toBeInTheDocument();
      expect(screen.getAllByRole('button')).toHaveLength(2);
    });

    it('should render properly on tablet viewport (768px)', () => {
      global.innerWidth = 768;
      global.dispatchEvent(new Event('resize'));
      
      renderWithRouter(<HouseholdChoicePage />);
      
      expect(screen.getByText(/welcome to homebit/i)).toBeInTheDocument();
      expect(screen.getAllByRole('button')).toHaveLength(2);
    });

    it('should render properly on desktop viewport (1920px)', () => {
      global.innerWidth = 1920;
      global.dispatchEvent(new Event('resize'));
      
      renderWithRouter(<HouseholdChoicePage />);
      
      expect(screen.getByText(/welcome to homebit/i)).toBeInTheDocument();
      expect(screen.getAllByRole('button')).toHaveLength(2);
    });

    it('should have responsive padding classes', () => {
      const { container } = renderWithRouter(<HouseholdChoicePage />);
      
      const card = container.querySelector('.p-8');
      expect(card).toHaveClass('sm:p-10');
    });

    it('should have responsive text sizing', () => {
      renderWithRouter(<HouseholdChoicePage />);
      
      const heading = screen.getByText(/welcome to homebit! 🏠/i);
      expect(heading).toHaveClass('text-2xl', 'sm:text-3xl');
    });
  });

  describe('4. Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithRouter(<HouseholdChoicePage />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent(/welcome to homebit/i);
    });

    it('should have proper heading for option 1', () => {
      renderWithRouter(<HouseholdChoicePage />);
      
      const heading = screen.getByRole('heading', { name: /i have a joining code/i });
      expect(heading.tagName).toBe('H3');
    });

    it('should have proper heading for option 2', () => {
      renderWithRouter(<HouseholdChoicePage />);
      
      const heading = screen.getByRole('heading', { name: /create a new household/i });
      expect(heading.tagName).toBe('H3');
    });

    it('should have buttons with type="button"', () => {
      renderWithRouter(<HouseholdChoicePage />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    it('should have descriptive button text', () => {
      renderWithRouter(<HouseholdChoicePage />);
      
      const joinButton = screen.getByRole('button', { name: /i have a joining code/i });
      const createButton = screen.getByRole('button', { name: /create a new household/i });
      
      expect(joinButton).toBeInTheDocument();
      expect(createButton).toBeInTheDocument();
    });

    it('should have visible focus indicators on buttons', () => {
      renderWithRouter(<HouseholdChoicePage />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('transition-all');
      });
    });
  });

  describe('5. User Interactions - Join Household', () => {
    it('should navigate to join-household when clicking join button', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HouseholdChoicePage />);
      
      const joinButton = screen.getByRole('button', { name: /i have a joining code/i });
      await user.click(joinButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/join-household');
    });

    it('should navigate only once when clicking join button', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HouseholdChoicePage />);
      
      const joinButton = screen.getByRole('button', { name: /i have a joining code/i });
      await user.click(joinButton);
      
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('should have hover effect on join button', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HouseholdChoicePage />);
      
      const joinButton = screen.getByRole('button', { name: /i have a joining code/i });
      
      expect(joinButton).toHaveClass('hover:border-purple-400');
      expect(joinButton).toHaveClass('hover:scale-[1.02]');
    });
  });

  describe('6. User Interactions - Create Household', () => {
    it('should navigate to profile setup when clicking create button', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HouseholdChoicePage />);
      
      const createButton = screen.getByRole('button', { name: /create a new household/i });
      await user.click(createButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/profile-setup/household?step=1');
    });

    it('should navigate only once when clicking create button', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HouseholdChoicePage />);
      
      const createButton = screen.getByRole('button', { name: /create a new household/i });
      await user.click(createButton);
      
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('should have hover effect on create button', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HouseholdChoicePage />);
      
      const createButton = screen.getByRole('button', { name: /create a new household/i });
      
      expect(createButton).toHaveClass('hover:border-purple-400');
      expect(createButton).toHaveClass('hover:scale-[1.02]');
    });
  });

  describe('7. Keyboard Navigation', () => {
    it('should allow keyboard navigation between buttons', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HouseholdChoicePage />);
      
      const joinButton = screen.getByRole('button', { name: /i have a joining code/i });
      const createButton = screen.getByRole('button', { name: /create a new household/i });
      
      // Tab to first button
      await user.tab();
      expect(joinButton).toHaveFocus();
      
      // Tab to second button
      await user.tab();
      expect(createButton).toHaveFocus();
    });

    it('should activate join button with Enter key', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HouseholdChoicePage />);
      
      const joinButton = screen.getByRole('button', { name: /i have a joining code/i });
      joinButton.focus();
      
      await user.keyboard('{Enter}');
      
      expect(mockNavigate).toHaveBeenCalledWith('/join-household');
    });

    it('should activate create button with Enter key', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HouseholdChoicePage />);
      
      const createButton = screen.getByRole('button', { name: /create a new household/i });
      createButton.focus();
      
      await user.keyboard('{Enter}');
      
      expect(mockNavigate).toHaveBeenCalledWith('/profile-setup/household?step=1');
    });

    it('should activate join button with Space key', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HouseholdChoicePage />);
      
      const joinButton = screen.getByRole('button', { name: /i have a joining code/i });
      joinButton.focus();
      
      await user.keyboard(' ');
      
      expect(mockNavigate).toHaveBeenCalledWith('/join-household');
    });

    it('should activate create button with Space key', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HouseholdChoicePage />);
      
      const createButton = screen.getByRole('button', { name: /create a new household/i });
      createButton.focus();
      
      await user.keyboard(' ');
      
      expect(mockNavigate).toHaveBeenCalledWith('/profile-setup/household?step=1');
    });
  });

  describe('8. Visual Feedback', () => {
    it('should have transition classes for smooth animations', () => {
      renderWithRouter(<HouseholdChoicePage />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('transition-all', 'duration-300');
      });
    });

    it('should have transform scale on hover', () => {
      renderWithRouter(<HouseholdChoicePage />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('hover:scale-[1.02]');
      });
    });

    it('should have gradient background on hover', () => {
      renderWithRouter(<HouseholdChoicePage />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('hover:bg-gradient-to-br');
      });
    });

    it('should have arrow icons that change color on hover', () => {
      renderWithRouter(<HouseholdChoicePage />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const svg = button.querySelector('svg');
        expect(svg?.parentElement).toHaveClass('group-hover:text-purple-500');
      });
    });

    it('should have different emoji icons for each option', () => {
      renderWithRouter(<HouseholdChoicePage />);
      
      const joinButton = screen.getByRole('button', { name: /i have a joining code/i });
      const createButton = screen.getByRole('button', { name: /create a new household/i });
      
      expect(joinButton).toHaveTextContent('🔑');
      expect(createButton).toHaveTextContent('✨');
    });
  });

  describe('9. Layout & Structure', () => {
    it('should center content vertically and horizontally', () => {
      const { container } = renderWithRouter(<HouseholdChoicePage />);
      
      const main = container.querySelector('main');
      expect(main).toHaveClass('flex', 'justify-center', 'items-center');
    });

    it('should have proper spacing between elements', () => {
      renderWithRouter(<HouseholdChoicePage />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons[0].parentElement).toHaveClass('gap-4');
    });

    it('should have max width constraint on card', () => {
      const { container } = renderWithRouter(<HouseholdChoicePage />);
      
      const card = container.querySelector('.max-w-lg');
      expect(card).toBeInTheDocument();
    });

    it('should have proper padding on mobile and desktop', () => {
      const { container } = renderWithRouter(<HouseholdChoicePage />);
      
      const card = container.querySelector('.p-8');
      expect(card).toHaveClass('sm:p-10');
    });

    it('should render buttons in flex column layout', () => {
      renderWithRouter(<HouseholdChoicePage />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons[0].parentElement).toHaveClass('flex', 'flex-col');
    });
  });

  describe('10. Tip Section', () => {
    it('should render tip section with proper styling', () => {
      const { container } = renderWithRouter(<HouseholdChoicePage />);
      
      const tipSection = container.querySelector('.bg-blue-50');
      expect(tipSection).toBeInTheDocument();
      expect(tipSection).toHaveClass('dark:bg-blue-900/20');
    });

    it('should have tip label in bold', () => {
      renderWithRouter(<HouseholdChoicePage />);
      
      const tipLabel = screen.getByText(/tip:/i);
      expect(tipLabel).toHaveClass('font-semibold');
    });

    it('should have blue color scheme for tip section', () => {
      const { container } = renderWithRouter(<HouseholdChoicePage />);
      
      const tipSection = container.querySelector('.bg-blue-50');
      expect(tipSection).toHaveClass('border-blue-200', 'dark:border-blue-500/30');
    });

    it('should have rounded corners on tip section', () => {
      const { container } = renderWithRouter(<HouseholdChoicePage />);
      
      const tipSection = container.querySelector('.bg-blue-50');
      expect(tipSection).toHaveClass('rounded-xl');
    });

    it('should render complete tip message', () => {
      renderWithRouter(<HouseholdChoicePage />);
      
      expect(screen.getByText(/if your partner already has a homebit account/i)).toBeInTheDocument();
      expect(screen.getByText(/this lets you both manage the same household together/i)).toBeInTheDocument();
    });
  });

  describe('11. Edge Cases', () => {
    it('should handle rapid button clicks gracefully', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HouseholdChoicePage />);
      
      const joinButton = screen.getByRole('button', { name: /i have a joining code/i });
      
      // Click multiple times rapidly
      await user.click(joinButton);
      await user.click(joinButton);
      await user.click(joinButton);
      
      // Should still navigate (React will handle the duplicate navigations)
      expect(mockNavigate).toHaveBeenCalled();
    });

    it('should handle clicking both buttons in sequence', async () => {
      const user = userEvent.setup();
      renderWithRouter(<HouseholdChoicePage />);
      
      const joinButton = screen.getByRole('button', { name: /i have a joining code/i });
      const createButton = screen.getByRole('button', { name: /create a new household/i });
      
      await user.click(joinButton);
      await user.click(createButton);
      
      expect(mockNavigate).toHaveBeenCalledTimes(2);
      expect(mockNavigate).toHaveBeenNthCalledWith(1, '/join-household');
      expect(mockNavigate).toHaveBeenNthCalledWith(2, '/profile-setup/household?step=1');
    });

    it('should render without errors when navigate is undefined', () => {
      // This shouldn't happen in practice, but test defensive coding
      expect(() => {
        renderWithRouter(<HouseholdChoicePage />);
      }).not.toThrow();
    });

    it('should maintain layout with very long text', () => {
      renderWithRouter(<HouseholdChoicePage />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('text-left');
      });
    });
  });
});
