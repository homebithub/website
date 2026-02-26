import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter, userEvent, VIEWPORTS, setViewport, hasThemeButton } from '~/test/utils/test-utils';
import ConfirmDialog from '../ConfirmDialog';

describe('ConfirmDialog Component', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    isOpen: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when open', () => {
      renderWithRouter(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      renderWithRouter(<ConfirmDialog {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
    });

    it('should render confirm and cancel buttons', () => {
      renderWithRouter(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('Theme Consistency', () => {
    it('should have themed buttons', () => {
      renderWithRouter(<ConfirmDialog {...defaultProps} />);
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      
      expect(hasThemeButton(confirmButton)).toBe(true);
      expect(hasThemeButton(cancelButton)).toBe(true);
    });

    it('should use primary purple color for confirm button', () => {
      renderWithRouter(<ConfirmDialog {...defaultProps} />);
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      expect(confirmButton.className).toMatch(/primary|purple/);
    });

    it('should have proper modal styling', () => {
      const { container } = renderWithRouter(<ConfirmDialog {...defaultProps} />);
      const modal = container.querySelector('[role="dialog"]');
      expect(modal).toBeInTheDocument();
      expect(modal?.className).toMatch(/rounded/);
    });

    it('should work in dark mode', () => {
      renderWithRouter(<ConfirmDialog {...defaultProps} />, { darkMode: true });
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ConfirmDialog {...defaultProps} />);
      
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);
      
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ConfirmDialog {...defaultProps} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should handle keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ConfirmDialog {...defaultProps} />);
      
      // Tab to confirm button
      await user.tab();
      expect(screen.getByRole('button', { name: /confirm/i })).toHaveFocus();
      
      // Tab to cancel button
      await user.tab();
      expect(screen.getByRole('button', { name: /cancel/i })).toHaveFocus();
    });

    it('should close on Escape key', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ConfirmDialog {...defaultProps} />);
      
      await user.keyboard('{Escape}');
      
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should be responsive on mobile', () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      const { container } = renderWithRouter(<ConfirmDialog {...defaultProps} />);
      
      const modal = container.querySelector('[role="dialog"]');
      expect(modal).toBeInTheDocument();
      expect(modal?.className).toMatch(/sm:|md:|lg:/);
    });

    it('should stack buttons vertically on small screens', () => {
      setViewport(VIEWPORTS.mobileSmall.width, VIEWPORTS.mobileSmall.height);
      const { container } = renderWithRouter(<ConfirmDialog {...defaultProps} />);
      
      const buttonContainer = container.querySelector('[class*="flex"]');
      expect(buttonContainer?.className).toMatch(/flex-col|sm:flex-row/);
    });

    it('should be readable on tablet', () => {
      setViewport(VIEWPORTS.tablet.width, VIEWPORTS.tablet.height);
      renderWithRouter(<ConfirmDialog {...defaultProps} />);
      
      const title = screen.getByText('Confirm Action');
      expect(title).toBeVisible();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const { container } = renderWithRouter(<ConfirmDialog {...defaultProps} />);
      const modal = container.querySelector('[role="dialog"]');
      
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby');
    });

    it('should trap focus within modal', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ConfirmDialog {...defaultProps} />);
      
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      
      // Tab through all focusable elements
      await user.tab();
      await user.tab();
      await user.tab(); // Should cycle back to first element
      
      const focusedElement = document.activeElement;
      expect([confirmButton, cancelButton]).toContain(focusedElement);
    });

    it('should have descriptive button labels', () => {
      renderWithRouter(<ConfirmDialog {...defaultProps} />);
      
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      
      expect(confirmButton).toHaveAccessibleName();
      expect(cancelButton).toHaveAccessibleName();
    });
  });

  describe('Custom Props', () => {
    it('should render custom confirm button text', () => {
      renderWithRouter(
        <ConfirmDialog {...defaultProps} confirmText="Delete" />
      );
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('should render custom cancel button text', () => {
      renderWithRouter(
        <ConfirmDialog {...defaultProps} cancelText="Go Back" />
      );
      expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
    });

    it('should apply danger variant styling', () => {
      renderWithRouter(
        <ConfirmDialog {...defaultProps} variant="danger" />
      );
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      expect(confirmButton.className).toMatch(/red|danger/);
    });
  });
});
