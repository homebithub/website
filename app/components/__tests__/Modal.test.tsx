import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter, userEvent, VIEWPORTS, setViewport } from '~/test/utils/test-utils';
import { Modal } from '../Modal';

describe('Modal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when open', () => {
      renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Modal Content</div>
        </Modal>
      );
      
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      renderWithRouter(
        <Modal isOpen={false} onClose={mockOnClose}>
          <div>Modal Content</div>
        </Modal>
      );
      
      expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
    });

    it('should render title when provided', () => {
      renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Content</div>
        </Modal>
      );
      
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });

    it('should not render title section when not provided', () => {
      renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('should render close button', () => {
      renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should render children content', () => {
      renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>
            <p>Paragraph 1</p>
            <p>Paragraph 2</p>
          </div>
        </Modal>
      );
      
      expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
    });
  });

  describe('Theme Consistency', () => {
    it('should have purple gradient icon background', () => {
      const { container } = renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose} title="Test">
          <div>Content</div>
        </Modal>
      );
      
      const iconBg = container.querySelector('.bg-gradient-to-br');
      expect(iconBg?.className).toMatch(/from-purple|to-purple/);
    });

    it('should have rounded corners', () => {
      const { container } = renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const panel = container.querySelector('[class*="rounded"]');
      expect(panel?.className).toMatch(/rounded-3xl/);
    });

    it('should have shadow effect', () => {
      const { container } = renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const panel = container.querySelector('[class*="shadow"]');
      expect(panel).toBeInTheDocument();
    });

    it('should have backdrop blur', () => {
      const { container } = renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const backdrop = container.querySelector('.backdrop-blur-sm');
      expect(backdrop).toBeInTheDocument();
    });

    it('should have purple focus ring on close button', () => {
      renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton.className).toMatch(/focus:ring-purple/);
    });

    it('should have hover effects on close button', () => {
      renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton.className).toMatch(/hover:/);
    });

    it('should work in dark mode', () => {
      renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>,
        { darkMode: true }
      );
      
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(screen.getByText('Content')).toBeVisible();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should be responsive on mobile', () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      expect(screen.getByText('Content')).toBeVisible();
    });

    it('should position at bottom on mobile', () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      const { container } = renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const modalContainer = container.querySelector('.items-end');
      expect(modalContainer).toBeInTheDocument();
    });

    it('should be responsive on tablet', () => {
      setViewport(VIEWPORTS.tablet.width, VIEWPORTS.tablet.height);
      renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      expect(screen.getByText('Content')).toBeVisible();
    });

    it('should be responsive on desktop', () => {
      setViewport(VIEWPORTS.desktop.width, VIEWPORTS.desktop.height);
      renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      expect(screen.getByText('Content')).toBeVisible();
    });

    it('should have proper padding on mobile', () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      const { container } = renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const modalContainer = container.querySelector('.p-4');
      expect(modalContainer).toBeInTheDocument();
    });

    it('should have max width constraint', () => {
      const { container } = renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const panel = container.querySelector('.sm\\:max-w-md');
      expect(panel).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper dialog role', () => {
      renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('should have accessible close button', () => {
      renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toHaveAccessibleName();
    });

    it('should have sr-only text for close button', () => {
      const { container } = renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const srText = container.querySelector('.sr-only');
      expect(srText).toHaveTextContent('Close');
    });

    it('should trap focus within modal', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose} title="Test">
          <button>Button 1</button>
          <button>Button 2</button>
        </Modal>
      );
      
      // Tab through elements
      await user.tab();
      
      // Focus should be within modal
      const dialog = screen.getByRole('dialog');
      expect(dialog).toContainElement(document.activeElement);
    });

    it('should have proper heading when title provided', () => {
      renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
          <div>Content</div>
        </Modal>
      );
      
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Test Modal');
    });

    it('should hide icon from screen readers', () => {
      const { container } = renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <button>Action Button</button>
        </Modal>
      );
      
      await user.tab();
      
      // Should be able to navigate to elements
      expect(document.activeElement).not.toBe(document.body);
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when close button clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking backdrop', async () => {
      const user = userEvent.setup();
      const { container } = renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const backdrop = container.querySelector('.fixed.inset-0.bg-black\\/50');
      if (backdrop) {
        await user.click(backdrop);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('should call onClose when pressing Escape', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      await user.keyboard('{Escape}');
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not close when clicking inside modal', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const content = screen.getByText('Content');
      await user.click(content);
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Animations', () => {
    it('should have enter transition', () => {
      const { container } = renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const transition = container.querySelector('[class*="duration"]');
      expect(transition).toBeInTheDocument();
    });

    it('should have opacity transition', () => {
      const { container } = renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const backdrop = container.querySelector('.transition-opacity');
      expect(backdrop).toBeInTheDocument();
    });

    it('should have scale transition on panel', () => {
      const { container } = renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const panel = container.querySelector('.transition-all');
      expect(panel).toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should center modal on screen', () => {
      const { container } = renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const modalContainer = container.querySelector('.justify-center');
      expect(modalContainer).toBeInTheDocument();
    });

    it('should have proper z-index', () => {
      const { container } = renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const dialog = container.querySelector('.z-50');
      expect(dialog).toBeInTheDocument();
    });

    it('should have overflow handling', () => {
      const { container } = renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const scrollContainer = container.querySelector('.overflow-y-auto');
      expect(scrollContainer).toBeInTheDocument();
    });

    it('should position close button absolutely', () => {
      const { container } = renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const closeButtonContainer = container.querySelector('.absolute.right-6.top-6');
      expect(closeButtonContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle long content', () => {
      const longContent = 'A'.repeat(1000);
      renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>{longContent}</div>
        </Modal>
      );
      
      expect(screen.getByText(longContent)).toBeInTheDocument();
    });

    it('should handle complex children', () => {
      renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>
            <form>
              <input type="text" />
              <button>Submit</button>
            </form>
          </div>
        </Modal>
      );
      
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('should handle rapid open/close', async () => {
      const { rerender } = renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      rerender(
        <Modal isOpen={false} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      rerender(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument();
      });
    });

    it('should handle empty title', () => {
      renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose} title="">
          <div>Content</div>
        </Modal>
      );
      
      // Should still render title section but empty
      expect(screen.queryByRole('heading')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = renderWithRouter(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const initialContent = screen.getByText('Content');
      
      rerender(
        <Modal isOpen={true} onClose={mockOnClose}>
          <div>Content</div>
        </Modal>
      );
      
      const rerenderedContent = screen.getByText('Content');
      
      expect(initialContent).toBe(rerenderedContent);
    });
  });
});
