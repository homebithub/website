import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter, userEvent, VIEWPORTS, setViewport } from '~/test/utils/test-utils';
import { Error } from '../Error';

describe('Error Component', () => {
  beforeEach(() => {
    // Clear any previous state
  });

  describe('Rendering', () => {
    it('should render error message', () => {
      renderWithRouter(<Error message="Something went wrong" />);
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should render default title', () => {
      renderWithRouter(<Error message="Test error" />);
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('should render custom title', () => {
      renderWithRouter(<Error title="Custom Error" message="Test error" />);
      expect(screen.getByText('Custom Error')).toBeInTheDocument();
    });

    it('should render action button when provided', () => {
      renderWithRouter(
        <Error
          message="Test error"
          action={{ to: '/home', label: 'Go Home' }}
        />
      );
      expect(screen.getByText('Go Home')).toBeInTheDocument();
    });

    it('should not render action button when not provided', () => {
      renderWithRouter(<Error message="Test error" />);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });

  describe('Theme Consistency', () => {
    it('should use proper background color', () => {
      const { container } = renderWithRouter(<Error message="Test error" />);
      const errorContainer = container.querySelector('.min-h-screen');
      
      expect(errorContainer?.className).toMatch(/bg-slate/);
    });

    it('should have proper text colors', () => {
      renderWithRouter(<Error message="Test error" />);
      const title = screen.getByText('Error');
      const message = screen.getByText('Test error');
      
      expect(title.className).toMatch(/text-slate-900/);
      expect(message.className).toMatch(/text-slate-600/);
    });

    it('should have themed action button', () => {
      renderWithRouter(
        <Error
          message="Test error"
          action={{ to: '/home', label: 'Go Home' }}
        />
      );
      const button = screen.getByText('Go Home');
      
      expect(button.className).toMatch(/bg-teal/);
      expect(button.className).toMatch(/hover:bg-teal/);
    });

    it('should have rounded corners on button', () => {
      renderWithRouter(
        <Error
          message="Test error"
          action={{ to: '/home', label: 'Go Home' }}
        />
      );
      const button = screen.getByText('Go Home');
      
      expect(button.className).toMatch(/rounded/);
    });

    it('should have focus ring on button', () => {
      renderWithRouter(
        <Error
          message="Test error"
          action={{ to: '/home', label: 'Go Home' }}
        />
      );
      const button = screen.getByText('Go Home');
      
      expect(button.className).toMatch(/focus:ring/);
    });

    it('should work in dark mode', () => {
      renderWithRouter(<Error message="Test error" />, { darkMode: true });
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(screen.getByText('Test error')).toBeVisible();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should be responsive on mobile', () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      renderWithRouter(<Error message="Test error" />);
      
      expect(screen.getByText('Test error')).toBeVisible();
    });

    it('should have proper padding on mobile', () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      const { container } = renderWithRouter(<Error message="Test error" />);
      const errorContainer = container.querySelector('.min-h-screen');
      
      expect(errorContainer?.className).toMatch(/px-4/);
    });

    it('should be responsive on tablet', () => {
      setViewport(VIEWPORTS.tablet.width, VIEWPORTS.tablet.height);
      renderWithRouter(<Error message="Test error" />);
      
      expect(screen.getByText('Test error')).toBeVisible();
    });

    it('should be responsive on desktop', () => {
      setViewport(VIEWPORTS.desktop.width, VIEWPORTS.desktop.height);
      renderWithRouter(<Error message="Test error" />);
      
      expect(screen.getByText('Test error')).toBeVisible();
    });

    it('should center content on all screen sizes', () => {
      const { container } = renderWithRouter(<Error message="Test error" />);
      const errorContainer = container.querySelector('.min-h-screen');
      
      expect(errorContainer?.className).toMatch(/flex|items-center|justify-center/);
    });

    it('should have max width constraint', () => {
      const { container } = renderWithRouter(<Error message="Test error" />);
      const contentContainer = container.querySelector('.max-w-md');
      
      expect(contentContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithRouter(<Error message="Test error" />);
      const heading = screen.getByRole('heading', { level: 1 });
      
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Error');
    });

    it('should have accessible action button', () => {
      renderWithRouter(
        <Error
          message="Test error"
          action={{ to: '/home', label: 'Go Home' }}
        />
      );
      const button = screen.getByRole('link', { name: 'Go Home' });
      
      expect(button).toHaveAccessibleName();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <Error
          message="Test error"
          action={{ to: '/home', label: 'Go Home' }}
        />
      );
      
      await user.tab();
      
      const button = screen.getByText('Go Home');
      expect(button).toHaveFocus();
    });

    it('should have proper focus outline', () => {
      renderWithRouter(
        <Error
          message="Test error"
          action={{ to: '/home', label: 'Go Home' }}
        />
      );
      const button = screen.getByText('Go Home');
      
      expect(button.className).toMatch(/focus:outline-none|focus:ring/);
    });

    it('should have semantic HTML structure', () => {
      const { container } = renderWithRouter(<Error message="Test error" />);
      
      const heading = container.querySelector('h1');
      const paragraph = container.querySelector('p');
      
      expect(heading).toBeInTheDocument();
      expect(paragraph).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should navigate to action link on click', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <Error
          message="Test error"
          action={{ to: '/home', label: 'Go Home' }}
        />
      );
      
      const button = screen.getByText('Go Home');
      await user.click(button);
      
      expect(button).toHaveAttribute('href', '/home');
    });

    it('should have correct href attribute', () => {
      renderWithRouter(
        <Error
          message="Test error"
          action={{ to: '/dashboard', label: 'Go to Dashboard' }}
        />
      );
      const button = screen.getByText('Go to Dashboard');
      
      expect(button).toHaveAttribute('href', '/dashboard');
    });
  });

  describe('Props Handling', () => {
    it('should handle long error messages', () => {
      const longMessage = 'A'.repeat(500);
      renderWithRouter(<Error message={longMessage} />);
      
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle special characters in message', () => {
      const specialMessage = 'Error: <script>alert("test")</script>';
      renderWithRouter(<Error message={specialMessage} />);
      
      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });

    it('should handle empty action label', () => {
      renderWithRouter(
        <Error
          message="Test error"
          action={{ to: '/home', label: '' }}
        />
      );
      
      // Should still render the link
      const link = screen.queryByRole('link');
      expect(link).toBeInTheDocument();
    });

    it('should handle different action paths', () => {
      renderWithRouter(
        <Error
          message="Test error"
          action={{ to: '/some/nested/path', label: 'Go' }}
        />
      );
      const button = screen.getByText('Go');
      
      expect(button).toHaveAttribute('href', '/some/nested/path');
    });
  });

  describe('Layout', () => {
    it('should take full screen height', () => {
      const { container } = renderWithRouter(<Error message="Test error" />);
      const errorContainer = container.querySelector('.min-h-screen');
      
      expect(errorContainer).toBeInTheDocument();
    });

    it('should center content vertically and horizontally', () => {
      const { container } = renderWithRouter(<Error message="Test error" />);
      const errorContainer = container.querySelector('.min-h-screen');
      
      expect(errorContainer?.className).toMatch(/flex/);
      expect(errorContainer?.className).toMatch(/items-center/);
      expect(errorContainer?.className).toMatch(/justify-center/);
    });

    it('should have proper spacing between elements', () => {
      renderWithRouter(
        <Error
          message="Test error"
          action={{ to: '/home', label: 'Go Home' }}
        />
      );
      const message = screen.getByText('Test error');
      
      expect(message.className).toMatch(/mt-/);
    });

    it('should center text', () => {
      const { container } = renderWithRouter(<Error message="Test error" />);
      const contentContainer = container.querySelector('.text-center');
      
      expect(contentContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined action', () => {
      renderWithRouter(<Error message="Test error" action={undefined} />);
      
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('should handle empty message', () => {
      renderWithRouter(<Error message="" />);
      
      // Should still render the component
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('should handle very long title', () => {
      const longTitle = 'A'.repeat(100);
      renderWithRouter(<Error title={longTitle} message="Test error" />);
      
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle HTML entities in message', () => {
      const messageWithEntities = 'Error &amp; Warning';
      renderWithRouter(<Error message={messageWithEntities} />);
      
      expect(screen.getByText(messageWithEntities)).toBeInTheDocument();
    });
  });

  describe('Visual Consistency', () => {
    it('should have consistent font sizes', () => {
      renderWithRouter(<Error message="Test error" />);
      const title = screen.getByText('Error');
      
      expect(title.className).toMatch(/text-xl/);
    });

    it('should have consistent font weights', () => {
      renderWithRouter(<Error message="Test error" />);
      const title = screen.getByText('Error');
      
      expect(title.className).toMatch(/font-bold/);
    });

    it('should have proper button styling', () => {
      renderWithRouter(
        <Error
          message="Test error"
          action={{ to: '/home', label: 'Go Home' }}
        />
      );
      const button = screen.getByText('Go Home');
      
      expect(button.className).toMatch(/inline-flex/);
      expect(button.className).toMatch(/items-center/);
      expect(button.className).toMatch(/px-4/);
      expect(button.className).toMatch(/py-1/);
    });

    it('should have shadow on button', () => {
      renderWithRouter(
        <Error
          message="Test error"
          action={{ to: '/home', label: 'Go Home' }}
        />
      );
      const button = screen.getByText('Go Home');
      
      expect(button.className).toMatch(/shadow/);
    });
  });
});
