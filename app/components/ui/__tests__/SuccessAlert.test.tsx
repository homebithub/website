import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import { SuccessAlert } from '../SuccessAlert';

describe('SuccessAlert Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Rendering & Content', () => {
    it('should render with required message prop', () => {
      render(<SuccessAlert message="Operation successful" />);
      
      expect(screen.getByText(/operation successful/i)).toBeInTheDocument();
    });

    it('should render message text', () => {
      render(<SuccessAlert message="This is a success message" />);
      
      expect(screen.getByText(/this is a success message/i)).toBeInTheDocument();
    });

    it('should not render title when not provided', () => {
      render(<SuccessAlert message="Test success" />);
      
      // Only message should be visible
      expect(screen.getByText(/test success/i)).toBeInTheDocument();
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('should render title when provided', () => {
      render(<SuccessAlert title="Success Title" message="Test success" />);
      
      expect(screen.getByText(/success title/i)).toBeInTheDocument();
    });

    it('should render both title and message when both provided', () => {
      render(<SuccessAlert title="Success" message="Your changes have been saved" />);
      
      expect(screen.getByText(/^success$/i)).toBeInTheDocument();
      expect(screen.getByText(/your changes have been saved/i)).toBeInTheDocument();
    });

    it('should render checkmark icon', () => {
      render(<SuccessAlert message="Test success" />);
      
      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('should render icon in a circular container', () => {
      render(<SuccessAlert message="Test success" />);
      
      const icon = screen.getByText('✓');
      expect(icon).toHaveClass('rounded-full');
    });
  });

  describe('2. Props & Variations', () => {
    it('should handle long success messages', () => {
      const longMessage = 'This is a very long success message that contains a lot of text to test how the component handles lengthy content and whether it wraps properly without breaking the layout.';
      render(<SuccessAlert message={longMessage} />);
      
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle short success messages', () => {
      render(<SuccessAlert message="Done" />);
      
      expect(screen.getByText(/^done$/i)).toBeInTheDocument();
    });

    it('should handle special characters in message', () => {
      render(<SuccessAlert message="Success: File 'test.txt' uploaded!" />);
      
      expect(screen.getByText(/success: file 'test\.txt' uploaded!/i)).toBeInTheDocument();
    });

    it('should handle special characters in title', () => {
      render(<SuccessAlert title="100% Complete" message="All tasks done" />);
      
      expect(screen.getByText(/100% complete/i)).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      const { container } = render(<SuccessAlert message="Test" className="custom-class" />);
      
      const alert = container.firstChild;
      expect(alert).toHaveClass('custom-class');
    });

    it('should merge custom className with default classes', () => {
      const { container } = render(<SuccessAlert message="Test" className="mt-4" />);
      
      const alert = container.firstChild;
      expect(alert).toHaveClass('mt-4', 'mb-6', 'rounded-xl');
    });

    it('should handle empty custom className', () => {
      const { container } = render(<SuccessAlert message="Test" className="" />);
      
      const alert = container.firstChild;
      expect(alert).toHaveClass('mb-6');
    });

    it('should handle multiple custom classes', () => {
      const { container } = render(<SuccessAlert message="Test" className="mt-4 mx-2 p-6" />);
      
      const alert = container.firstChild;
      expect(alert).toHaveClass('mt-4', 'mx-2', 'p-6');
    });
  });

  describe('3. Layout & Structure', () => {
    it('should have flex layout for icon and content', () => {
      const { container } = render(<SuccessAlert message="Test success" />);
      
      const flexContainer = container.querySelector('.flex.items-start');
      expect(flexContainer).toBeInTheDocument();
    });

    it('should have gap between icon and content', () => {
      const { container } = render(<SuccessAlert message="Test success" />);
      
      const flexContainer = container.querySelector('.flex.items-start');
      expect(flexContainer).toHaveClass('gap-3');
    });

    it('should have icon that does not shrink', () => {
      render(<SuccessAlert message="Test success" />);
      
      const icon = screen.getByText('✓');
      expect(icon).toHaveClass('shrink-0');
    });

    it('should have content area that can grow', () => {
      const { container } = render(<SuccessAlert message="Test success" />);
      
      const contentDiv = container.querySelector('.flex-1');
      expect(contentDiv).toBeInTheDocument();
    });

    it('should have proper spacing when title is present', () => {
      render(<SuccessAlert title="Success" message="Test success" />);
      
      const title = screen.getByText(/^success$/i);
      expect(title).toHaveClass('mb-0.5');
    });

    it('should have padding on alert container', () => {
      const { container } = render(<SuccessAlert message="Test success" />);
      
      const alert = container.firstChild;
      expect(alert).toHaveClass('p-4');
    });

    it('should have bottom margin on alert container', () => {
      const { container } = render(<SuccessAlert message="Test success" />);
      
      const alert = container.firstChild;
      expect(alert).toHaveClass('mb-6');
    });
  });

  describe('4. Theme & Styling', () => {
    it('should have green background in light mode', () => {
      const { container } = render(<SuccessAlert message="Test success" />);
      
      const alert = container.firstChild;
      expect(alert).toHaveClass('bg-green-50');
    });

    it('should have dark mode background class', () => {
      const { container } = render(<SuccessAlert message="Test success" />);
      
      const alert = container.firstChild;
      expect(alert).toHaveClass('dark:bg-green-950/30');
    });

    it('should have green border in light mode', () => {
      const { container } = render(<SuccessAlert message="Test success" />);
      
      const alert = container.firstChild;
      expect(alert).toHaveClass('border-green-300/30');
    });

    it('should have dark mode border class', () => {
      const { container } = render(<SuccessAlert message="Test success" />);
      
      const alert = container.firstChild;
      expect(alert).toHaveClass('dark:border-green-500/20');
    });

    it('should have rounded corners', () => {
      const { container } = render(<SuccessAlert message="Test success" />);
      
      const alert = container.firstChild;
      expect(alert).toHaveClass('rounded-xl');
    });

    it('should have backdrop blur effect', () => {
      const { container } = render(<SuccessAlert message="Test success" />);
      
      const alert = container.firstChild;
      expect(alert).toHaveClass('backdrop-blur-sm');
    });

    it('should have green icon background in light mode', () => {
      render(<SuccessAlert message="Test success" />);
      
      const icon = screen.getByText('✓');
      expect(icon).toHaveClass('bg-green-100');
    });

    it('should have dark mode icon background class', () => {
      render(<SuccessAlert message="Test success" />);
      
      const icon = screen.getByText('✓');
      expect(icon).toHaveClass('dark:bg-green-500/15');
    });

    it('should have green icon text in light mode', () => {
      render(<SuccessAlert message="Test success" />);
      
      const icon = screen.getByText('✓');
      expect(icon).toHaveClass('text-green-600');
    });

    it('should have dark mode icon text class', () => {
      render(<SuccessAlert message="Test success" />);
      
      const icon = screen.getByText('✓');
      expect(icon).toHaveClass('dark:text-green-400');
    });

    it('should have green message text in light mode', () => {
      render(<SuccessAlert message="Test success" />);
      
      const message = screen.getByText(/test success/i);
      expect(message).toHaveClass('text-green-700');
    });

    it('should have dark mode message text class', () => {
      render(<SuccessAlert message="Test success" />);
      
      const message = screen.getByText(/test success/i);
      expect(message).toHaveClass('dark:text-green-300');
    });

    it('should have green title text in light mode when title provided', () => {
      render(<SuccessAlert title="Success" message="Test success" />);
      
      const title = screen.getByText(/^success$/i);
      expect(title).toHaveClass('text-green-700');
    });

    it('should have dark mode title text class when title provided', () => {
      render(<SuccessAlert title="Success" message="Test success" />);
      
      const title = screen.getByText(/^success$/i);
      expect(title).toHaveClass('dark:text-green-400');
    });

    it('should have semibold font weight for title', () => {
      render(<SuccessAlert title="Success" message="Test success" />);
      
      const title = screen.getByText(/^success$/i);
      expect(title).toHaveClass('font-semibold');
    });

    it('should have medium font weight for message', () => {
      render(<SuccessAlert message="Test success" />);
      
      const message = screen.getByText(/test success/i);
      expect(message).toHaveClass('font-medium');
    });

    it('should have small text size for title', () => {
      render(<SuccessAlert title="Success" message="Test success" />);
      
      const title = screen.getByText(/^success$/i);
      expect(title).toHaveClass('text-sm');
    });

    it('should have small text size for message', () => {
      render(<SuccessAlert message="Test success" />);
      
      const message = screen.getByText(/test success/i);
      expect(message).toHaveClass('text-sm');
    });

    it('should have bold font weight for icon', () => {
      render(<SuccessAlert message="Test success" />);
      
      const icon = screen.getByText('✓');
      expect(icon).toHaveClass('font-bold');
    });

    it('should have extra small text size for icon', () => {
      render(<SuccessAlert message="Test success" />);
      
      const icon = screen.getByText('✓');
      expect(icon).toHaveClass('text-xs');
    });
  });

  describe('5. Icon Styling', () => {
    it('should have fixed width for icon', () => {
      render(<SuccessAlert message="Test success" />);
      
      const icon = screen.getByText('✓');
      expect(icon).toHaveClass('w-6');
    });

    it('should have fixed height for icon', () => {
      render(<SuccessAlert message="Test success" />);
      
      const icon = screen.getByText('✓');
      expect(icon).toHaveClass('h-6');
    });

    it('should center icon content', () => {
      render(<SuccessAlert message="Test success" />);
      
      const icon = screen.getByText('✓');
      expect(icon).toHaveClass('items-center', 'justify-center');
    });

    it('should have flex display for icon', () => {
      render(<SuccessAlert message="Test success" />);
      
      const icon = screen.getByText('✓');
      expect(icon).toHaveClass('flex');
    });

    it('should have top margin adjustment for icon', () => {
      render(<SuccessAlert message="Test success" />);
      
      const icon = screen.getByText('✓');
      expect(icon).toHaveClass('mt-0.5');
    });
  });

  describe('6. Accessibility', () => {
    it('should render message in paragraph element', () => {
      render(<SuccessAlert message="Test success" />);
      
      const message = screen.getByText(/test success/i);
      expect(message.tagName).toBe('P');
    });

    it('should render title in paragraph element when provided', () => {
      render(<SuccessAlert title="Success" message="Test success" />);
      
      const title = screen.getByText(/^success$/i);
      expect(title.tagName).toBe('P');
    });

    it('should have semantic structure with icon and text', () => {
      const { container } = render(<SuccessAlert message="Test success" />);
      
      const alert = container.firstChild;
      expect(alert).toBeInTheDocument();
      expect(screen.getByText('✓')).toBeInTheDocument();
      expect(screen.getByText(/test success/i)).toBeInTheDocument();
    });

    it('should be readable with screen readers', () => {
      render(<SuccessAlert title="Success" message="Your changes have been saved" />);
      
      // Both title and message should be accessible
      expect(screen.getByText(/success/i)).toBeInTheDocument();
      expect(screen.getByText(/your changes have been saved/i)).toBeInTheDocument();
    });

    it('should have proper text contrast for light mode', () => {
      render(<SuccessAlert message="Test success" />);
      
      const message = screen.getByText(/test success/i);
      // text-green-700 provides good contrast on bg-green-50
      expect(message).toHaveClass('text-green-700');
    });
  });

  describe('7. Edge Cases', () => {
    it('should handle empty string message', () => {
      render(<SuccessAlert message="" />);
      
      // Component should still render
      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('should handle empty string title', () => {
      render(<SuccessAlert title="" message="Test success" />);
      
      // Component should not render title paragraph when title is empty
      expect(screen.getByText(/test success/i)).toBeInTheDocument();
      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('should handle very long title', () => {
      const longTitle = 'This is a very long success title that might wrap to multiple lines';
      render(<SuccessAlert title={longTitle} message="Test success" />);
      
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle message with HTML entities', () => {
      render(<SuccessAlert message="Success: 5 > 3 & 2 < 4" />);
      
      expect(screen.getByText(/success: 5 > 3 & 2 < 4/i)).toBeInTheDocument();
    });

    it('should handle message with line breaks', () => {
      render(<SuccessAlert message="Line 1\nLine 2\nLine 3" />);
      
      // React will render this as a single text node
      expect(screen.getByText(/line 1/i)).toBeInTheDocument();
    });

    it('should handle Unicode characters in message', () => {
      render(<SuccessAlert message="成功: 文件已上传 ✅" />);
      
      expect(screen.getByText(/成功: 文件已上传 ✅/i)).toBeInTheDocument();
    });

    it('should handle multiple spaces in message', () => {
      render(<SuccessAlert message="Success:    Multiple    Spaces" />);
      
      expect(screen.getByText(/success:\s+multiple\s+spaces/i)).toBeInTheDocument();
    });

    it('should handle className with special characters', () => {
      const { container } = render(<SuccessAlert message="Test" className="my-class-123" />);
      
      const alert = container.firstChild;
      expect(alert).toHaveClass('my-class-123');
    });

    it('should handle undefined className gracefully', () => {
      const { container } = render(<SuccessAlert message="Test" className={undefined} />);
      
      const alert = container.firstChild;
      expect(alert).toBeInTheDocument();
    });

    it('should handle title and message with same text', () => {
      render(<SuccessAlert title="Success" message="Success" />);
      
      const successTexts = screen.getAllByText(/success/i);
      expect(successTexts.length).toBe(2); // Title and message
    });

    it('should handle very long className string', () => {
      const longClassName = 'class1 class2 class3 class4 class5 class6 class7 class8';
      const { container } = render(<SuccessAlert message="Test" className={longClassName} />);
      
      const alert = container.firstChild;
      expect(alert).toHaveClass('class1', 'class2', 'class3');
    });
  });

  describe('8. Content Wrapping', () => {
    it('should allow message text to wrap', () => {
      const { container } = render(<SuccessAlert message="Test success" />);
      
      const contentDiv = container.querySelector('.flex-1.min-w-0');
      expect(contentDiv).toBeInTheDocument();
    });

    it('should prevent icon from wrapping', () => {
      render(<SuccessAlert message="Test success" />);
      
      const icon = screen.getByText('✓');
      expect(icon).toHaveClass('shrink-0');
    });

    it('should handle message with no spaces', () => {
      render(<SuccessAlert message="Thisisaverylongwordwithoutanyspacesthatmightcauseissues" />);
      
      expect(screen.getByText(/thisisaverylongword/i)).toBeInTheDocument();
    });

    it('should maintain layout with both title and long message', () => {
      const longMessage = 'This is a very long message that should wrap properly without breaking the layout or causing any visual issues in the component.';
      render(<SuccessAlert title="Success" message={longMessage} />);
      
      expect(screen.getByText(/success/i)).toBeInTheDocument();
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });
  });
});
