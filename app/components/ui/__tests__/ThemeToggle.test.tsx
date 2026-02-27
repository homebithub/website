import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ThemeToggle, { ThemeToggleSwitch } from '../ThemeToggle';

// Mock ThemeContext
const mockSetThemePreference = vi.fn();
const mockToggleTheme = vi.fn();

vi.mock('~/contexts/ThemeContext', () => ({
  useTheme: vi.fn(() => ({
    themePreference: 'system',
    theme: 'dark',
    setThemePreference: mockSetThemePreference,
    toggleTheme: mockToggleTheme,
  })),
}));

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders the theme toggle button', () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /theme settings/i });
      expect(button).toBeInTheDocument();
    });

    it('renders with default size (md)', () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /theme settings/i });
      expect(button).toHaveClass('px-2.5', 'py-1.5');
    });

    it('renders with small size', () => {
      render(<ThemeToggle size="sm" />);
      const button = screen.getByRole('button', { name: /theme settings/i });
      expect(button).toHaveClass('px-2', 'py-1');
    });

    it('renders with large size', () => {
      render(<ThemeToggle size="lg" />);
      const button = screen.getByRole('button', { name: /theme settings/i });
      expect(button).toHaveClass('px-3', 'py-2');
    });

    it('applies custom className', () => {
      const { container } = render(<ThemeToggle className="custom-class" />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('does not show label by default', () => {
      render(<ThemeToggle />);
      expect(screen.queryByText('System')).not.toBeInTheDocument();
      expect(screen.queryByText('Dark')).not.toBeInTheDocument();
      expect(screen.queryByText('Light')).not.toBeInTheDocument();
    });

    it('shows label when showLabel is true', () => {
      render(<ThemeToggle showLabel={true} />);
      expect(screen.getByText('System')).toBeInTheDocument();
    });
  });

  describe('Dropdown Behavior', () => {
    it('dropdown is closed by default', () => {
      render(<ThemeToggle />);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('opens dropdown when button is clicked', () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /theme settings/i });
      fireEvent.click(button);
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('closes dropdown when button is clicked again', () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /theme settings/i });
      
      fireEvent.click(button);
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      
      fireEvent.click(button);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('sets aria-expanded to true when open', () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /theme settings/i });
      
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('sets aria-expanded to false when closed', () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /theme settings/i });
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('has aria-haspopup attribute', () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /theme settings/i });
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
    });
  });

  describe('Theme Options', () => {
    it('displays all three theme options when open', () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /theme settings/i });
      fireEvent.click(button);

      expect(screen.getByRole('option', { name: /system/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /dark/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /light/i })).toBeInTheDocument();
    });

    it('marks current theme as selected', () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /theme settings/i });
      fireEvent.click(button);

      const systemOption = screen.getByRole('option', { name: /system/i });
      expect(systemOption).toHaveAttribute('aria-selected', 'true');
    });

    it('marks non-selected themes as not selected', () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /theme settings/i });
      fireEvent.click(button);

      const darkOption = screen.getByRole('option', { name: /dark/i });
      const lightOption = screen.getByRole('option', { name: /light/i });
      
      expect(darkOption).toHaveAttribute('aria-selected', 'false');
      expect(lightOption).toHaveAttribute('aria-selected', 'false');
    });

    it('shows checkmark icon for selected theme', () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /theme settings/i });
      fireEvent.click(button);

      const systemOption = screen.getByRole('option', { name: /system/i });
      const svg = systemOption.querySelector('svg[stroke="currentColor"]');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Theme Selection', () => {
    it('calls setThemePreference when selecting dark theme', () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /theme settings/i });
      fireEvent.click(button);

      const darkOption = screen.getByRole('option', { name: /dark/i });
      fireEvent.click(darkOption);

      expect(mockSetThemePreference).toHaveBeenCalledWith('dark');
    });

    it('calls setThemePreference when selecting light theme', () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /theme settings/i });
      fireEvent.click(button);

      const lightOption = screen.getByRole('option', { name: /light/i });
      fireEvent.click(lightOption);

      expect(mockSetThemePreference).toHaveBeenCalledWith('light');
    });

    it('calls setThemePreference when selecting system theme', () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /theme settings/i });
      fireEvent.click(button);

      const systemOption = screen.getByRole('option', { name: /system/i });
      fireEvent.click(systemOption);

      expect(mockSetThemePreference).toHaveBeenCalledWith('system');
    });

    it('closes dropdown after selecting a theme', () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /theme settings/i });
      fireEvent.click(button);

      const darkOption = screen.getByRole('option', { name: /dark/i });
      fireEvent.click(darkOption);

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('Click Outside Behavior', () => {
    it('closes dropdown when clicking outside', async () => {
      render(
        <div>
          <ThemeToggle />
          <div data-testid="outside">Outside</div>
        </div>
      );

      const button = screen.getByRole('button', { name: /theme settings/i });
      fireEvent.click(button);
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      const outside = screen.getByTestId('outside');
      fireEvent.mouseDown(outside);

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('does not close dropdown when clicking inside', () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /theme settings/i });
      fireEvent.click(button);

      const listbox = screen.getByRole('listbox');
      fireEvent.mouseDown(listbox);

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA label on button', () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /theme settings/i });
      expect(button).toHaveAttribute('aria-label', 'Theme settings');
    });

    it('has proper ARIA label on listbox', () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /theme settings/i });
      fireEvent.click(button);

      const listbox = screen.getByRole('listbox');
      expect(listbox).toHaveAttribute('aria-label', 'Select theme');
    });

    it('has focus ring styles', () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /theme settings/i });
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-purple-500');
    });

    it('options have role="option"', () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /theme settings/i });
      fireEvent.click(button);

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(3);
    });
  });

  describe('Visual States', () => {
    it('applies hover styles to button', () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /theme settings/i });
      expect(button).toHaveClass('hover:bg-purple-200', 'dark:hover:bg-gray-600');
    });

    it('applies selected styles to current theme option', () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /theme settings/i });
      fireEvent.click(button);

      const systemOption = screen.getByRole('option', { name: /system/i });
      expect(systemOption).toHaveClass('bg-purple-100', 'text-purple-700');
    });

    it('applies hover styles to non-selected options', () => {
      render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /theme settings/i });
      fireEvent.click(button);

      const darkOption = screen.getByRole('option', { name: /dark/i });
      expect(darkOption).toHaveClass('hover:bg-gray-100', 'dark:hover:bg-gray-700');
    });

    it('rotates chevron icon when open', () => {
      const { container } = render(<ThemeToggle />);
      const button = screen.getByRole('button', { name: /theme settings/i });
      
      fireEvent.click(button);
      
      const chevron = container.querySelector('.rotate-180');
      expect(chevron).toBeInTheDocument();
    });

    it('does not rotate chevron icon when closed', () => {
      const { container } = render(<ThemeToggle />);
      const chevron = container.querySelector('.rotate-180');
      expect(chevron).not.toBeInTheDocument();
    });
  });

});

describe('ThemeToggleSwitch Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders the toggle switch', () => {
      render(<ThemeToggleSwitch />);
      const toggle = screen.getByRole('switch', { name: /toggle dark mode/i });
      expect(toggle).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<ThemeToggleSwitch className="custom-switch" />);
      const toggle = screen.getByRole('switch', { name: /toggle dark mode/i });
      expect(toggle).toHaveClass('custom-switch');
    });

    it('has proper dimensions', () => {
      render(<ThemeToggleSwitch />);
      const toggle = screen.getByRole('switch', { name: /toggle dark mode/i });
      expect(toggle).toHaveClass('h-8', 'w-14');
    });

    it('has rounded-full class', () => {
      render(<ThemeToggleSwitch />);
      const toggle = screen.getByRole('switch', { name: /toggle dark mode/i });
      expect(toggle).toHaveClass('rounded-full');
    });
  });

  describe('Theme State', () => {
    it('shows moon icon when theme is dark', () => {
      const { container } = render(<ThemeToggleSwitch />);
      const moonIcon = container.querySelector('.text-purple-600');
      expect(moonIcon).toBeInTheDocument();
    });

    it('sets aria-checked to true when theme is dark', () => {
      render(<ThemeToggleSwitch />);
      const toggle = screen.getByRole('switch', { name: /toggle dark mode/i });
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });

    it('applies dark theme background color', () => {
      render(<ThemeToggleSwitch />);
      const toggle = screen.getByRole('switch', { name: /toggle dark mode/i });
      expect(toggle).toHaveClass('bg-purple-600');
    });

    it('positions toggle to the right when dark', () => {
      const { container } = render(<ThemeToggleSwitch />);
      const toggleCircle = container.querySelector('.translate-x-7');
      expect(toggleCircle).toBeInTheDocument();
    });
  });

  describe('Toggle Interaction', () => {
    it('calls toggleTheme when clicked', () => {
      render(<ThemeToggleSwitch />);
      const toggle = screen.getByRole('switch', { name: /toggle dark mode/i });
      
      fireEvent.click(toggle);
      
      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });

    it('calls toggleTheme multiple times on multiple clicks', () => {
      render(<ThemeToggleSwitch />);
      const toggle = screen.getByRole('switch', { name: /toggle dark mode/i });
      
      fireEvent.click(toggle);
      fireEvent.click(toggle);
      fireEvent.click(toggle);
      
      expect(mockToggleTheme).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('has role="switch"', () => {
      render(<ThemeToggleSwitch />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toBeInTheDocument();
    });

    it('has aria-label', () => {
      render(<ThemeToggleSwitch />);
      const toggle = screen.getByRole('switch', { name: /toggle dark mode/i });
      expect(toggle).toHaveAttribute('aria-label', 'Toggle dark mode');
    });

    it('has focus ring styles', () => {
      render(<ThemeToggleSwitch />);
      const toggle = screen.getByRole('switch', { name: /toggle dark mode/i });
      expect(toggle).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-purple-500');
    });
  });

  describe('Visual Transitions', () => {
    it('has transition classes on button', () => {
      render(<ThemeToggleSwitch />);
      const toggle = screen.getByRole('switch', { name: /toggle dark mode/i });
      expect(toggle).toHaveClass('transition-colors', 'duration-200');
    });

    it('has transition classes on toggle circle', () => {
      const { container } = render(<ThemeToggleSwitch />);
      const toggleCircle = container.querySelector('.transition-transform');
      expect(toggleCircle).toBeInTheDocument();
      expect(toggleCircle).toHaveClass('duration-200', 'ease-in-out');
    });

    it('has shadow on toggle circle', () => {
      const { container } = render(<ThemeToggleSwitch />);
      const toggleCircle = container.querySelector('.shadow-lg');
      expect(toggleCircle).toBeInTheDocument();
    });
  });

});
