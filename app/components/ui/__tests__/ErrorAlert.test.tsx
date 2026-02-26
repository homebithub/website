import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import { ErrorAlert } from '../ErrorAlert';

describe('ErrorAlert Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Rendering & Content', () => {
    it('should render with required message prop', () => {
      render(<ErrorAlert message="Something went wrong" />);
      
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('should render message text', () => {
      render(<ErrorAlert message="This is an error message" />);
      
      expect(screen.getByText(/this is an error message/i)).toBeInTheDocument();
    });

    it('should not render title when not provided', () => {
      render(<ErrorAlert message="Test error" />);
      
      // Only message should be visible
      expect(screen.getByText(/test error/i)).toBeInTheDocument();
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('should render title when provided', () => {
      render(<ErrorAlert title="Error Title" message="Test error" />);
      
      expect(screen.getByText(/error title/i)).toBeInTheDocument();
    });

    it('should render both title and message when both provided', () => {
      render(<ErrorAlert title="Warning" message="Please check your input" />);
      
      expect(screen.getByText(/warning/i)).toBeInTheDocument();
      expect(screen.getByText(/please check your input/i)).toBeInTheDocument();
    });

    it('should render exclamation icon', () => {
      render(<ErrorAlert message="Test error" />);
      
      expect(screen.getByText('!')).toBeInTheDocument();
    });

    it('should render icon in a circular container', () => {
      const { container } = render(<ErrorAlert message="Test error" />);
      
      const icon = screen.getByText('!');
      expect(icon).toHaveClass('rounded-full');
    });
  });

  describe('2. Props & Variations', () => {
    it('should handle long error messages', () => {
      const longMessage = 'This is a very long error message that contains a lot of text to test how the component handles lengthy content and whether it wraps properly without breaking the layout.';
      render(<ErrorAlert message={longMessage} />);
      
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle short error messages', () => {
      render(<ErrorAlert message="Error" />);
      
      expect(screen.getByText(/^error$/i)).toBeInTheDocument();
    });

    it('should handle special characters in message', () => {
      render(<ErrorAlert message="Error: File 'test.txt' not found!" />);
      
      expect(screen.getByText(/error: file 'test\.txt' not found!/i)).toBeInTheDocument();
    });

    it('should handle special characters in title', () => {
      render(<ErrorAlert title="404 - Not Found" message="Page not found" />);
      
      expect(screen.getByText(/404 - not found/i)).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      const { container } = render(<ErrorAlert message="Test" className="custom-class" />);
      
      const alert = container.firstChild;
      expect(alert).toHaveClass('custom-class');
    });

    it('should merge custom className with default classes', () => {
      const { container } = render(<ErrorAlert message="Test" className="mt-4" />);
      
      const alert = container.firstChild;
      expect(alert).toHaveClass('mt-4', 'mb-6', 'rounded-xl');
    });

    it('should handle empty custom className', () => {
      const { container } = render(<ErrorAlert message="Test" className="" />);
      
      const alert = container.firstChild;
      expect(alert).toHaveClass('mb-6');
    });

    it('should handle multiple custom classes', () => {
      const { container } = render(<ErrorAlert message="Test" className="mt-4 mx-2 p-6" />);
      
      const alert = container.firstChild;
      expect(alert).toHaveClass('mt-4', 'mx-2', 'p-6');
    });
  });

  describe('3. Layout & Structure', () => {
    it('should have flex layout for icon and content', () => {
      const { container } = render(<ErrorAlert message="Test error" />);
      
      const flexContainer = container.querySelector('.flex.items-start');
      expect(flexContainer).toBeInTheDocument();
    });

    it('should have gap between icon and content', () => {
      const { container } = render(<ErrorAlert message="Test error" />);
      
      const flexContainer = container.querySelector('.flex.items-start');
      expect(flexContainer).toHaveClass('gap-3');
    });

    it('should have icon that does not shrink', () => {
      render(<ErrorAlert message="Test error" />);
      
      const icon = screen.getByText('!');
      expect(icon).toHaveClass('shrink-0');
    });

    it('should have content area that can grow', () => {
      const { container } = render(<ErrorAlert message="Test error" />);
      
      const contentDiv = container.querySelector('.flex-1');
      expect(contentDiv).toBeInTheDocument();
    });

    it('should have proper spacing when title is present', () => {
      render(<ErrorAlert title="Error" message="Test error" />);
      
      const title = screen.getByText(/^error$/i);
      expect(title).toHaveClass('mb-0.5');
    });

    it('should have padding on alert container', () => {
      const { container } = render(<ErrorAlert message="Test error" />);
      
      const alert = container.firstChild;
      expect(alert).toHaveClass('p-4');
    });

    it('should have bottom margin on alert container', () => {
      const { container } = render(<ErrorAlert message="Test error" />);
      
      const alert = container.firstChild;
      expect(alert).toHaveClass('mb-6');
    });
  });

  describe('4. Theme & Styling', () => {
    it('should have purple background in light mode', () => {
      const { container } = render(<ErrorAlert message="Test error" />);
      
      const alert = container.firstChild;
      expect(alert).toHaveClass('bg-purple-50');
    });

    it('should have dark mode background class', () => {
      const { container } = render(<ErrorAlert message="Test error" />);
      
      const alert = container.firstChild;
      expect(alert).toHaveClass('dark:bg-purple-950/30');
    });

    it('should have purple border in light mode', () => {
      const { container } = render(<ErrorAlert message="Test error" />);
      
      const alert = container.firstChild;
      expect(alert).toHaveClass('border-purple-300/30');
    });

    it('should have dark mode border class', () => {
      const { container } = render(<ErrorAlert message="Test error" />);
      
      const alert = container.firstChild;
      expect(alert).toHaveClass('dark:border-purple-500/20');
    });

    it('should have rounded corners', () => {
      const { container } = render(<ErrorAlert message="Test error" />);
      
      const alert = container.firstChild;
      expect(alert).toHaveClass('rounded-xl');
    });

    it('should have backdrop blur effect', () => {
      const { container } = render(<ErrorAlert message="Test error" />);
      
      const alert = container.firstChild;
      expect(alert).toHaveClass('backdrop-blur-sm');
    });

    it('should have red icon background in light mode', () => {
      render(<ErrorAlert message="Test error" />);
      
      const icon = screen.getByText('!');
      expect(icon).toHaveClass('bg-red-100');
    });

    it('should have dark mode icon background class', () => {
      render(<ErrorAlert message="Test error" />);
      
      const icon = screen.getByText('!');
      expect(icon).toHaveClass('dark:bg-red-500/15');
    });

    it('should have red icon text in light mode', () => {
      render(<ErrorAlert message="Test error" />);
      
      const icon = screen.getByText('!');
      expect(icon).toHaveClass('text-red-600');
    });

    it('should have dark mode icon text class', () => {
      render(<ErrorAlert message="Test error" />);
      
      const icon = screen.getByText('!');
      expect(icon).toHaveClass('dark:text-red-400');
    });

    it('should have red message text in light mode', () => {
      render(<ErrorAlert message="Test error" />);
      
      const message = screen.getByText(/test error/i);
      expect(message).toHaveClass('text-red-700');
    });

    it('should have dark mode message text class', () => {
      render(<ErrorAlert message="Test error" />);
      
      const message = screen.getByText(/test error/i);
      expect(message).toHaveClass('dark:text-red-300');
    });

    it('should have red title text in light mode when title provided', () => {
      render(<ErrorAlert title="Error" message="Test error" />);
      
      const title = screen.getByText(/^error$/i);
      expect(title).toHaveClass('text-red-700');
    });

    it('should have dark mode title text class when title provided', () => {
      render(<ErrorAlert title="Error" message="Test error" />);
      
      const title = screen.getByText(/^error$/i);
      expect(title).toHaveClass('dark:text-red-400');
    });

    it('should have semibold font weight for title', () => {
      render(<ErrorAlert title="Error" message="Test error" />);
      
      const title = screen.getByText(/^error$/i);
      expect(title).toHaveClass('font-semibold');
    });

    it('should have medium font weight for message', () => {
      render(<ErrorAlert message="Test error" />);
      
      const message = screen.getByText(/test error/i);
      expect(message).toHaveClass('font-medium');
    });

    it('should have small text size for title', () => {
      render(<ErrorAlert title="Error" message="Test error" />);
      
      const title = screen.getByText(/^error$/i);
      expect(title).toHaveClass('text-sm');
    });

    it('should have small text size for message', () => {
      render(<ErrorAlert message="Test error" />);
      
      const message = screen.getByText(/test error/i);
      expect(message).toHaveClass('text-sm');
    });

    it('should have bold font weight for icon', () => {
      render(<ErrorAlert message="Test error" />);
      
      const icon = screen.getByText('!');
      expect(icon).toHaveClass('font-bold');
    });

    it('should have extra small text size for icon', () => {
      render(<ErrorAlert message="Test error" />);
      
      const icon = screen.getByText('!');
      expect(icon).toHaveClass('text-xs');
    });
  });

  describe('5. Icon Styling', () => {
    it('should have fixed width for icon', () => {
      render(<ErrorAlert message="Test error" />);
      
      const icon = screen.getByText('!');
      expect(icon).toHaveClass('w-6');
    });

    it('should have fixed height for icon', () => {
      render(<ErrorAlert message="Test error" />);
      
      const icon = screen.getByText('!');
      expect(icon).toHaveClass('h-6');
    });

    it('should center icon content', () => {
      render(<ErrorAlert message="Test error" />);
      
      const icon = screen.getByText('!');
      expect(icon).toHaveClass('items-center', 'justify-center');
    });

    it('should have flex display for icon', () => {
      render(<ErrorAlert message="Test error" />);
      
      const icon = screen.getByText('!');
      expect(icon).toHaveClass('flex');
    });

    it('should have top margin adjustment for icon', () => {
      render(<ErrorAlert message="Test error" />);
      
      const icon = screen.getByText('!');
      expect(icon).toHaveClass('mt-0.5');
    });
  });

  describe('6. Accessibility', () => {
    it('should render message in paragraph element', () => {
      render(<ErrorAlert message="Test error" />);
      
      const message = screen.getByText(/test error/i);
      expect(message.tagName).toBe('P');
    });

    it('should render title in paragraph element when provided', () => {
      render(<ErrorAlert title="Error" message="Test error" />);
      
      const title = screen.getByText(/^error$/i);
      expect(title.tagName).toBe('P');
    });

    it('should have semantic structure with icon and text', () => {
      const { container } = render(<ErrorAlert message="Test error" />);
      
      const alert = container.firstChild;
      expect(alert).toBeInTheDocument();
      expect(screen.getByText('!')).toBeInTheDocument();
      expect(screen.getByText(/test error/i)).toBeInTheDocument();
    });

    it('should be readable with screen readers', () => {
      render(<ErrorAlert title="Error" message="Please fix the following issues" />);
      
      // Both title and message should be accessible
      expect(screen.getByText(/error/i)).toBeInTheDocument();
      expect(screen.getByText(/please fix the following issues/i)).toBeInTheDocument();
    });

    it('should have proper text contrast for light mode', () => {
      render(<ErrorAlert message="Test error" />);
      
      const message = screen.getByText(/test error/i);
      // text-red-700 provides good contrast on bg-purple-50
      expect(message).toHaveClass('text-red-700');
    });
  });

  describe('7. Edge Cases', () => {
    it('should handle empty string message', () => {
      render(<ErrorAlert message="" />);
      
      // Component should still render
      expect(screen.getByText('!')).toBeInTheDocument();
    });

    it('should handle empty string title', () => {
      render(<ErrorAlert title="" message="Test error" />);
      
      // Component should not render title paragraph when title is empty
      expect(screen.getByText(/test error/i)).toBeInTheDocument();
      expect(screen.getByText('!')).toBeInTheDocument();
    });

    it('should handle very long title', () => {
      const longTitle = 'This is a very long error title that might wrap to multiple lines';
      render(<ErrorAlert title={longTitle} message="Test error" />);
      
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle message with HTML entities', () => {
      render(<ErrorAlert message="Error: 5 > 3 & 2 < 4" />);
      
      expect(screen.getByText(/error: 5 > 3 & 2 < 4/i)).toBeInTheDocument();
    });

    it('should handle message with line breaks', () => {
      render(<ErrorAlert message="Line 1\nLine 2\nLine 3" />);
      
      // React will render this as a single text node
      expect(screen.getByText(/line 1/i)).toBeInTheDocument();
    });

    it('should handle Unicode characters in message', () => {
      render(<ErrorAlert message="错误: 文件未找到 🚫" />);
      
      expect(screen.getByText(/错误: 文件未找到 🚫/i)).toBeInTheDocument();
    });

    it('should handle multiple spaces in message', () => {
      render(<ErrorAlert message="Error:    Multiple    Spaces" />);
      
      expect(screen.getByText(/error:\s+multiple\s+spaces/i)).toBeInTheDocument();
    });

    it('should handle className with special characters', () => {
      const { container } = render(<ErrorAlert message="Test" className="my-class-123" />);
      
      const alert = container.firstChild;
      expect(alert).toHaveClass('my-class-123');
    });

    it('should handle undefined className gracefully', () => {
      const { container } = render(<ErrorAlert message="Test" className={undefined} />);
      
      const alert = container.firstChild;
      expect(alert).toBeInTheDocument();
    });

    it('should handle title and message with same text', () => {
      render(<ErrorAlert title="Error" message="Error" />);
      
      const errorTexts = screen.getAllByText(/error/i);
      expect(errorTexts.length).toBe(2); // Title and message
    });

    it('should handle very long className string', () => {
      const longClassName = 'class1 class2 class3 class4 class5 class6 class7 class8';
      const { container } = render(<ErrorAlert message="Test" className={longClassName} />);
      
      const alert = container.firstChild;
      expect(alert).toHaveClass('class1', 'class2', 'class3');
    });
  });

  describe('8. Content Wrapping', () => {
    it('should allow message text to wrap', () => {
      const { container } = render(<ErrorAlert message="Test error" />);
      
      const contentDiv = container.querySelector('.flex-1.min-w-0');
      expect(contentDiv).toBeInTheDocument();
    });

    it('should prevent icon from wrapping', () => {
      render(<ErrorAlert message="Test error" />);
      
      const icon = screen.getByText('!');
      expect(icon).toHaveClass('shrink-0');
    });

    it('should handle message with no spaces', () => {
      render(<ErrorAlert message="Thisisaverylongwordwithoutanyspacesthatmightcauseissues" />);
      
      expect(screen.getByText(/thisisaverylongword/i)).toBeInTheDocument();
    });

    it('should maintain layout with both title and long message', () => {
      const longMessage = 'This is a very long message that should wrap properly without breaking the layout or causing any visual issues in the component.';
      render(<ErrorAlert title="Warning" message={longMessage} />);
      
      expect(screen.getByText(/warning/i)).toBeInTheDocument();
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });
  });
});
