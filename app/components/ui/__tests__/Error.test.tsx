import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '~/test/utils/test-utils';
import { Error } from '../Error';

describe('Error Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Rendering & Content', () => {
    it('should render with required message prop', () => {
      renderWithRouter(<Error message="Something went wrong" />);
      
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should render default title when not provided', () => {
      renderWithRouter(<Error message="Test error" />);
      
      expect(screen.getByText(/^error$/i)).toBeInTheDocument();
    });

    it('should render custom title when provided', () => {
      renderWithRouter(<Error title="Custom Error" message="Test error" />);
      
      expect(screen.getByText(/custom error/i)).toBeInTheDocument();
      expect(screen.queryByText(/^error$/i)).not.toBeInTheDocument();
    });

    it('should render message text', () => {
      renderWithRouter(<Error message="This is an error message" />);
      
      expect(screen.getByText(/this is an error message/i)).toBeInTheDocument();
    });

    it('should not render action button when action prop not provided', () => {
      renderWithRouter(<Error message="Test error" />);
      
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('should render action button when action prop provided', () => {
      renderWithRouter(
        <Error 
          message="Test error" 
          action={{ to: '/home', label: 'Go Home' }}
        />
      );
      
      expect(screen.getByRole('link', { name: /go home/i })).toBeInTheDocument();
    });

    it('should render action button with correct label', () => {
      renderWithRouter(
        <Error 
          message="Test error" 
          action={{ to: '/dashboard', label: 'Back to Dashboard' }}
        />
      );
      
      expect(screen.getByText(/back to dashboard/i)).toBeInTheDocument();
    });
  });

  describe('2. Props & Variations', () => {
    it('should handle long error messages', () => {
      const longMessage = 'This is a very long error message that contains a lot of text to test how the component handles lengthy content and whether it wraps properly without breaking the layout.';
      renderWithRouter(<Error message={longMessage} />);
      
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle short error messages', () => {
      renderWithRouter(<Error message="Oops" />);
      
      expect(screen.getByText(/oops/i)).toBeInTheDocument();
    });

    it('should handle special characters in message', () => {
      renderWithRouter(<Error message="Error: File 'test.txt' not found!" />);
      
      expect(screen.getByText(/error: file 'test\.txt' not found!/i)).toBeInTheDocument();
    });

    it('should handle special characters in title', () => {
      renderWithRouter(<Error title="404 - Not Found" message="Page not found" />);
      
      expect(screen.getByText(/404 - not found/i)).toBeInTheDocument();
    });

    it('should handle action with root path', () => {
      renderWithRouter(
        <Error 
          message="Test error" 
          action={{ to: '/', label: 'Home' }}
        />
      );
      
      const link = screen.getByRole('link', { name: /home/i });
      expect(link).toHaveAttribute('href', '/');
    });

    it('should handle action with nested path', () => {
      renderWithRouter(
        <Error 
          message="Test error" 
          action={{ to: '/dashboard/settings', label: 'Settings' }}
        />
      );
      
      const link = screen.getByRole('link', { name: /settings/i });
      expect(link).toHaveAttribute('href', '/dashboard/settings');
    });

    it('should handle multiple word action labels', () => {
      renderWithRouter(
        <Error 
          message="Test error" 
          action={{ to: '/home', label: 'Go Back to Home Page' }}
        />
      );
      
      expect(screen.getByText(/go back to home page/i)).toBeInTheDocument();
    });
  });

  describe('3. Link Behavior', () => {
    it('should render link with correct href attribute', () => {
      renderWithRouter(
        <Error 
          message="Test error" 
          action={{ to: '/dashboard', label: 'Dashboard' }}
        />
      );
      
      const link = screen.getByRole('link', { name: /dashboard/i });
      expect(link).toHaveAttribute('href', '/dashboard');
    });

    it('should be clickable', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <Error 
          message="Test error" 
          action={{ to: '/home', label: 'Go Home' }}
        />
      );
      
      const link = screen.getByRole('link', { name: /go home/i });
      await user.click(link);
      
      // Link should still be in document after click
      expect(link).toBeInTheDocument();
    });

    it('should have proper link styling classes', () => {
      renderWithRouter(
        <Error 
          message="Test error" 
          action={{ to: '/home', label: 'Go Home' }}
        />
      );
      
      const link = screen.getByRole('link', { name: /go home/i });
      expect(link).toHaveClass('inline-flex', 'items-center', 'rounded-xl');
    });
  });

  describe('4. Layout & Structure', () => {
    it('should have full screen height container', () => {
      const { container } = renderWithRouter(<Error message="Test error" />);
      
      const mainDiv = container.querySelector('.min-h-screen');
      expect(mainDiv).toBeInTheDocument();
    });

    it('should center content', () => {
      const { container } = renderWithRouter(<Error message="Test error" />);
      
      const mainDiv = container.querySelector('.min-h-screen');
      expect(mainDiv).toHaveClass('flex', 'items-center', 'justify-center');
    });

    it('should have max-width constraint', () => {
      const { container } = renderWithRouter(<Error message="Test error" />);
      
      const contentDiv = container.querySelector('.max-w-md');
      expect(contentDiv).toBeInTheDocument();
    });

    it('should have text-center alignment', () => {
      const { container } = renderWithRouter(<Error message="Test error" />);
      
      const contentDiv = container.querySelector('.text-center');
      expect(contentDiv).toBeInTheDocument();
    });

    it('should have proper spacing between elements', () => {
      renderWithRouter(
        <Error 
          message="Test error" 
          action={{ to: '/home', label: 'Go Home' }}
        />
      );
      
      const message = screen.getByText(/test error/i);
      expect(message).toHaveClass('mt-2');
    });
  });

  describe('5. Theme & Styling', () => {
    it('should use teal color for action button', () => {
      renderWithRouter(
        <Error 
          message="Test error" 
          action={{ to: '/home', label: 'Go Home' }}
        />
      );
      
      const link = screen.getByRole('link', { name: /go home/i });
      expect(link).toHaveClass('bg-teal-600', 'hover:bg-teal-700');
    });

    it('should have white text on action button', () => {
      renderWithRouter(
        <Error 
          message="Test error" 
          action={{ to: '/home', label: 'Go Home' }}
        />
      );
      
      const link = screen.getByRole('link', { name: /go home/i });
      expect(link).toHaveClass('text-white');
    });

    it('should have slate background', () => {
      const { container } = renderWithRouter(<Error message="Test error" />);
      
      const mainDiv = container.querySelector('.bg-slate-50');
      expect(mainDiv).toBeInTheDocument();
    });

    it('should have proper title styling', () => {
      renderWithRouter(<Error message="Test error" />);
      
      const title = screen.getByText(/^error$/i);
      expect(title).toHaveClass('text-xl', 'font-bold', 'text-slate-900');
    });

    it('should have proper message styling', () => {
      renderWithRouter(<Error message="Test error" />);
      
      const message = screen.getByText(/test error/i);
      expect(message).toHaveClass('text-slate-600');
    });

    it('should have rounded corners on action button', () => {
      renderWithRouter(
        <Error 
          message="Test error" 
          action={{ to: '/home', label: 'Go Home' }}
        />
      );
      
      const link = screen.getByRole('link', { name: /go home/i });
      expect(link).toHaveClass('rounded-xl');
    });

    it('should have shadow on action button', () => {
      renderWithRouter(
        <Error 
          message="Test error" 
          action={{ to: '/home', label: 'Go Home' }}
        />
      );
      
      const link = screen.getByRole('link', { name: /go home/i });
      expect(link).toHaveClass('shadow-sm');
    });

    it('should have focus ring on action button', () => {
      renderWithRouter(
        <Error 
          message="Test error" 
          action={{ to: '/home', label: 'Go Home' }}
        />
      );
      
      const link = screen.getByRole('link', { name: /go home/i });
      expect(link).toHaveClass('focus:ring-2', 'focus:ring-teal-500');
    });
  });

  describe('6. Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithRouter(<Error message="Test error" />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent(/error/i);
    });

    it('should have accessible link when action provided', () => {
      renderWithRouter(
        <Error 
          message="Test error" 
          action={{ to: '/home', label: 'Go Home' }}
        />
      );
      
      const link = screen.getByRole('link', { name: /go home/i });
      expect(link).toBeInTheDocument();
    });

    it('should be keyboard navigable to action link', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <Error 
          message="Test error" 
          action={{ to: '/home', label: 'Go Home' }}
        />
      );
      
      const link = screen.getByRole('link', { name: /go home/i });
      await user.tab();
      
      expect(link).toHaveFocus();
    });

    it('should have focus outline on action button', () => {
      renderWithRouter(
        <Error 
          message="Test error" 
          action={{ to: '/home', label: 'Go Home' }}
        />
      );
      
      const link = screen.getByRole('link', { name: /go home/i });
      expect(link).toHaveClass('focus:outline-none', 'focus:ring-2');
    });

    it('should have descriptive link text', () => {
      renderWithRouter(
        <Error 
          message="Page not found" 
          action={{ to: '/', label: 'Return to Homepage' }}
        />
      );
      
      const link = screen.getByRole('link', { name: /return to homepage/i });
      expect(link).toHaveAccessibleName();
    });
  });

  describe('7. Responsive Design', () => {
    it('should have responsive padding', () => {
      const { container } = renderWithRouter(<Error message="Test error" />);
      
      const mainDiv = container.querySelector('.min-h-screen');
      expect(mainDiv).toHaveClass('px-4');
    });

    it('should have full width on mobile', () => {
      const { container } = renderWithRouter(<Error message="Test error" />);
      
      const contentDiv = container.querySelector('.max-w-md');
      expect(contentDiv).toHaveClass('w-full');
    });

    it('should constrain width on larger screens', () => {
      const { container } = renderWithRouter(<Error message="Test error" />);
      
      const contentDiv = container.querySelector('.max-w-md');
      expect(contentDiv).toBeInTheDocument();
    });
  });

  describe('8. Edge Cases', () => {
    it('should handle empty string title', () => {
      renderWithRouter(<Error title="" message="Test error" />);
      
      // Should render empty title, not default
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('');
    });

    it('should handle empty string message', () => {
      renderWithRouter(<Error message="" />);
      
      // Component should still render
      expect(screen.getByRole('heading')).toBeInTheDocument();
    });

    it('should handle very long title', () => {
      const longTitle = 'This is a very long error title that might wrap to multiple lines';
      renderWithRouter(<Error title={longTitle} message="Test error" />);
      
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle action with empty label', () => {
      renderWithRouter(
        <Error 
          message="Test error" 
          action={{ to: '/home', label: '' }}
        />
      );
      
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveTextContent('');
    });

    it('should handle action with special characters in path', () => {
      renderWithRouter(
        <Error 
          message="Test error" 
          action={{ to: '/path?query=test&id=123', label: 'Go' }}
        />
      );
      
      const link = screen.getByRole('link', { name: /go/i });
      expect(link).toHaveAttribute('href', '/path?query=test&id=123');
    });

    it('should handle message with HTML entities', () => {
      renderWithRouter(<Error message="Error: 5 > 3 & 2 < 4" />);
      
      expect(screen.getByText(/error: 5 > 3 & 2 < 4/i)).toBeInTheDocument();
    });

    it('should handle message with line breaks', () => {
      renderWithRouter(<Error message="Line 1\nLine 2\nLine 3" />);
      
      // React will render this as a single text node
      expect(screen.getByText(/line 1/i)).toBeInTheDocument();
    });

    it('should handle Unicode characters in message', () => {
      renderWithRouter(<Error message="Error: 文件未找到 🚫" />);
      
      expect(screen.getByText(/error: 文件未找到 🚫/i)).toBeInTheDocument();
    });

    it('should handle multiple spaces in message', () => {
      renderWithRouter(<Error message="Error:    Multiple    Spaces" />);
      
      expect(screen.getByText(/error:\s+multiple\s+spaces/i)).toBeInTheDocument();
    });
  });
});
