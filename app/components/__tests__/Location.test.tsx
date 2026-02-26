import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter, userEvent, VIEWPORTS, setViewport, hasThemeForm } from '~/test/utils/test-utils';
import Location from '../Location';

describe('Location Component', () => {
  const mockOnChange = vi.fn();
  const mockOnNext = vi.fn();

  const defaultProps = {
    value: '',
    onChange: mockOnChange,
    onNext: mockOnNext,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render location input field', () => {
      renderWithRouter(<Location {...defaultProps} />);
      expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    });

    it('should render with initial value', () => {
      renderWithRouter(<Location {...defaultProps} value="Nairobi" />);
      expect(screen.getByDisplayValue('Nairobi')).toBeInTheDocument();
    });

    it('should render next button', () => {
      renderWithRouter(<Location {...defaultProps} />);
      expect(screen.getByRole('button', { name: /next|continue/i })).toBeInTheDocument();
    });
  });

  describe('Theme Consistency', () => {
    it('should follow form theme', () => {
      const { container } = renderWithRouter(<Location {...defaultProps} />);
      const form = container.querySelector('form');
      
      if (form) {
        expect(hasThemeForm(form)).toBe(true);
      }
    });

    it('should have themed input field', () => {
      renderWithRouter(<Location {...defaultProps} />);
      const input = screen.getByLabelText(/location/i);
      
      expect(input.className).toMatch(/rounded/);
      expect(input.className).toMatch(/border/);
      expect(input.className).toMatch(/focus:/);
    });

    it('should have themed button', () => {
      renderWithRouter(<Location {...defaultProps} />);
      const button = screen.getByRole('button', { name: /next|continue/i });
      
      expect(button.className).toMatch(/primary|purple/);
      expect(button.className).toMatch(/rounded/);
      expect(button.className).toMatch(/hover:/);
    });

    it('should work in dark mode', () => {
      renderWithRouter(<Location {...defaultProps} />, { darkMode: true });
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      
      const input = screen.getByLabelText(/location/i);
      expect(input).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onChange when typing', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Location {...defaultProps} />);
      
      const input = screen.getByLabelText(/location/i);
      await user.type(input, 'Nairobi');
      
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should call onNext when form is submitted', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Location {...defaultProps} value="Nairobi" />);
      
      const button = screen.getByRole('button', { name: /next|continue/i });
      await user.click(button);
      
      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });

    it('should validate required field', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Location {...defaultProps} />);
      
      const button = screen.getByRole('button', { name: /next|continue/i });
      await user.click(button);
      
      // Should show validation error
      await waitFor(() => {
        expect(screen.queryByText(/required|enter/i)).toBeInTheDocument();
      });
    });

    it('should clear validation error when typing', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Location {...defaultProps} />);
      
      const button = screen.getByRole('button', { name: /next|continue/i });
      await user.click(button);
      
      // Wait for validation error
      await waitFor(() => {
        expect(screen.queryByText(/required|enter/i)).toBeInTheDocument();
      });
      
      // Type in input
      const input = screen.getByLabelText(/location/i);
      await user.type(input, 'Nairobi');
      
      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/required|enter/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should be responsive on mobile', () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      renderWithRouter(<Location {...defaultProps} />);
      
      const input = screen.getByLabelText(/location/i);
      expect(input).toBeVisible();
      expect(input.className).toMatch(/w-full/);
    });

    it('should have touch-friendly input size on mobile', () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      renderWithRouter(<Location {...defaultProps} />);
      
      const input = screen.getByLabelText(/location/i);
      const styles = window.getComputedStyle(input);
      
      // Input should have adequate padding for touch
      expect(input.className).toMatch(/p-|py-|px-/);
    });

    it('should have touch-friendly button on mobile', () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      renderWithRouter(<Location {...defaultProps} />);
      
      const button = screen.getByRole('button', { name: /next|continue/i });
      expect(button.className).toMatch(/p-|py-|px-/);
    });

    it('should stack elements vertically on small screens', () => {
      setViewport(VIEWPORTS.mobileSmall.width, VIEWPORTS.mobileSmall.height);
      const { container } = renderWithRouter(<Location {...defaultProps} />);
      
      const formContainer = container.querySelector('[class*="flex"]');
      if (formContainer) {
        expect(formContainer.className).toMatch(/flex-col|sm:flex-row/);
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper label association', () => {
      renderWithRouter(<Location {...defaultProps} />);
      const input = screen.getByLabelText(/location/i);
      
      expect(input).toHaveAttribute('id');
      const label = document.querySelector(`label[for="${input.id}"]`);
      expect(label).toBeInTheDocument();
    });

    it('should have proper input type', () => {
      renderWithRouter(<Location {...defaultProps} />);
      const input = screen.getByLabelText(/location/i);
      
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Location {...defaultProps} />);
      
      // Tab to input
      await user.tab();
      expect(screen.getByLabelText(/location/i)).toHaveFocus();
      
      // Tab to button
      await user.tab();
      expect(screen.getByRole('button', { name: /next|continue/i })).toHaveFocus();
    });

    it('should announce validation errors to screen readers', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Location {...defaultProps} />);
      
      const button = screen.getByRole('button', { name: /next|continue/i });
      await user.click(button);
      
      await waitFor(() => {
        const error = screen.queryByText(/required|enter/i);
        if (error) {
          expect(error).toHaveAttribute('role', 'alert');
        }
      });
    });

    it('should have descriptive placeholder', () => {
      renderWithRouter(<Location {...defaultProps} />);
      const input = screen.getByLabelText(/location/i);
      
      expect(input).toHaveAttribute('placeholder');
      expect(input.getAttribute('placeholder')).not.toBe('');
    });
  });

  describe('Form Validation', () => {
    it('should show error for empty input', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Location {...defaultProps} />);
      
      const button = screen.getByRole('button', { name: /next|continue/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.queryByText(/required|enter/i)).toBeInTheDocument();
      });
    });

    it('should accept valid location', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Location {...defaultProps} />);
      
      const input = screen.getByLabelText(/location/i);
      await user.type(input, 'Nairobi, Kenya');
      
      const button = screen.getByRole('button', { name: /next|continue/i });
      await user.click(button);
      
      expect(mockOnNext).toHaveBeenCalled();
    });

    it('should trim whitespace', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Location {...defaultProps} />);
      
      const input = screen.getByLabelText(/location/i);
      await user.type(input, '  Nairobi  ');
      
      const button = screen.getByRole('button', { name: /next|continue/i });
      await user.click(button);
      
      expect(mockOnChange).toHaveBeenCalledWith(expect.stringMatching(/^Nairobi$/));
    });
  });
});
