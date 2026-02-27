import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import CustomSelect from '../CustomSelect';

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

describe('CustomSelect Component', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
    vi.clearAllMocks();
  });

  describe('1. Rendering & Content', () => {
    it('should render with placeholder when no value selected', () => {
      render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
          placeholder="Select an option"
        />
      );
      
      expect(screen.getByText(/select an option/i)).toBeInTheDocument();
    });

    it('should render default placeholder when not provided', () => {
      render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      expect(screen.getByText(/select\.\.\./i)).toBeInTheDocument();
    });

    it('should render selected option label', () => {
      render(
        <CustomSelect
          value="option2"
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      expect(screen.getByText(/option 2/i)).toBeInTheDocument();
    });

    it('should render chevron icon', () => {
      const { container } = render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      const chevron = container.querySelector('svg');
      expect(chevron).toBeInTheDocument();
    });

    it('should not show dropdown initially', () => {
      render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      // Options should not be visible initially
      expect(screen.queryByText(/option 1/i)).not.toBeInTheDocument();
    });

    it('should render all options when dropdown is open', async () => {
      const user = userEvent.setup();
      render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(screen.getByText(/option 1/i)).toBeInTheDocument();
      expect(screen.getByText(/option 2/i)).toBeInTheDocument();
      expect(screen.getByText(/option 3/i)).toBeInTheDocument();
    });
  });

  describe('2. Dropdown Interactions', () => {
    it('should open dropdown when button clicked', async () => {
      const user = userEvent.setup();
      render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(screen.getByText(/option 1/i)).toBeInTheDocument();
    });

    it('should close dropdown when button clicked again', async () => {
      const user = userEvent.setup();
      render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      expect(screen.getByText(/option 1/i)).toBeInTheDocument();
      
      await user.click(button);
      await waitFor(() => {
        expect(screen.queryByText(/option 1/i)).not.toBeInTheDocument();
      });
    });

    it('should toggle dropdown on multiple clicks', async () => {
      const user = userEvent.setup();
      render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      const button = screen.getByRole('button');
      
      // Open
      await user.click(button);
      expect(screen.getByText(/option 1/i)).toBeInTheDocument();
      
      // Close
      await user.click(button);
      await waitFor(() => {
        expect(screen.queryByText(/option 1/i)).not.toBeInTheDocument();
      });
      
      // Open again
      await user.click(button);
      expect(screen.getByText(/option 1/i)).toBeInTheDocument();
    });

    it('should rotate chevron when dropdown opens', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const chevron = container.querySelector('svg');
      expect(chevron).toHaveClass('rotate-180');
    });

    it('should reset chevron rotation when dropdown closes', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      await user.click(button);
      
      await waitFor(() => {
        const chevron = container.querySelector('svg');
        expect(chevron).not.toHaveClass('rotate-180');
      });
    });
  });

  describe('3. Option Selection', () => {
    it('should call onChange when option selected', async () => {
      const user = userEvent.setup();
      render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const option = screen.getByText(/option 2/i);
      await user.click(option);
      
      expect(mockOnChange).toHaveBeenCalledWith('option2');
    });

    it('should close dropdown after selection', async () => {
      const user = userEvent.setup();
      render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const option = screen.getByText(/option 2/i);
      await user.click(option);
      
      await waitFor(() => {
        expect(screen.queryByText(/option 1/i)).not.toBeInTheDocument();
      });
    });

    it('should call onChange with correct value for each option', async () => {
      const user = userEvent.setup();
      
      for (const opt of mockOptions) {
        mockOnChange.mockClear();
        const { unmount } = render(
          <CustomSelect
            value=""
            onChange={mockOnChange}
            options={mockOptions}
          />
        );
        
        const button = screen.getByRole('button');
        await user.click(button);
        
        const option = screen.getByText(opt.label);
        await user.click(option);
        
        expect(mockOnChange).toHaveBeenCalledWith(opt.value);
        unmount();
      }
    });

    it('should highlight selected option', async () => {
      const user = userEvent.setup();
      render(
        <CustomSelect
          value="option2"
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const allButtons = screen.getAllByRole('button');
      const selectedOption = allButtons.find(btn => btn.textContent === 'Option 2' && btn !== button);
      expect(selectedOption).toHaveClass('bg-gradient-to-r', 'from-purple-600', 'to-pink-600');
    });

    it('should not highlight unselected options', async () => {
      const user = userEvent.setup();
      render(
        <CustomSelect
          value="option2"
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const unselectedOption = screen.getByText(/option 1/i);
      expect(unselectedOption).not.toHaveClass('bg-gradient-to-r');
    });
  });

  describe('4. Click Outside Behavior', () => {
    it('should close dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <CustomSelect
            value=""
            onChange={mockOnChange}
            options={mockOptions}
          />
          <div data-testid="outside">Outside element</div>
        </div>
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      expect(screen.getByText(/option 1/i)).toBeInTheDocument();
      
      const outside = screen.getByTestId('outside');
      await user.click(outside);
      
      await waitFor(() => {
        expect(screen.queryByText(/option 1/i)).not.toBeInTheDocument();
      });
    });

    it('should not close dropdown when clicking inside', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const dropdown = container.querySelector('.absolute.z-50');
      if (dropdown) {
        await user.click(dropdown);
      }
      
      expect(screen.getByText(/option 1/i)).toBeInTheDocument();
    });
  });

  describe('5. Styling & Theme', () => {
    it('should have purple theme colors', () => {
      render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-purple-200', 'focus:ring-purple-500');
    });

    it('should have dark mode classes', () => {
      render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('dark:bg-[#13131a]', 'dark:border-purple-500/30');
    });

    it('should have rounded corners', () => {
      render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('rounded-xl');
    });

    it('should have focus ring', () => {
      render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:ring-2', 'focus:ring-purple-500');
    });

    it('should have shadow effects', () => {
      render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('shadow-sm', 'dark:shadow-inner-glow');
    });

    it('should have transition effects', () => {
      render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('transition-all');
    });

    it('should style placeholder text differently', () => {
      render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
          placeholder="Select..."
        />
      );
      
      const placeholder = screen.getByText(/select\.\.\./i);
      expect(placeholder).toHaveClass('text-gray-500', 'dark:text-gray-400');
    });

    it('should not style selected value as placeholder', () => {
      render(
        <CustomSelect
          value="option1"
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      const selectedText = screen.getByText(/option 1/i);
      expect(selectedText).not.toHaveClass('text-gray-500');
    });

    it('should have hover effects on options', async () => {
      const user = userEvent.setup();
      render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const option = screen.getByText(/option 1/i);
      expect(option).toHaveClass('hover:bg-purple-50', 'dark:hover:bg-purple-900/20');
    });
  });

  describe('6. Props & Customization', () => {
    it('should accept custom className', () => {
      const { container } = render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
          className="custom-class"
        />
      );
      
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-class');
    });

    it('should merge custom className with default classes', () => {
      const { container } = render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
          className="mt-4"
        />
      );
      
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('mt-4', 'relative');
    });

    it('should handle empty options array', () => {
      render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={[]}
        />
      );
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle single option', async () => {
      const user = userEvent.setup();
      const singleOption = [{ value: 'only', label: 'Only Option' }];
      
      render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={singleOption}
        />
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(screen.getByText(/only option/i)).toBeInTheDocument();
    });

    it('should handle many options', async () => {
      const user = userEvent.setup();
      const manyOptions = Array.from({ length: 20 }, (_, i) => ({
        value: `opt${i}`,
        label: `Option ${i}`,
      }));
      
      render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={manyOptions}
        />
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(screen.getByText(/option 0/i)).toBeInTheDocument();
      expect(screen.getByText(/option 19/i)).toBeInTheDocument();
    });

    it('should handle required prop', () => {
      render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
          required={true}
        />
      );
      
      // Component should render (required is passed but not used in current implementation)
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('7. Accessibility', () => {
    it('should have button role', () => {
      render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should have button type', () => {
      render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should be keyboard focusable', async () => {
      const user = userEvent.setup();
      render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      await user.tab();
      
      const button = screen.getByRole('button');
      expect(button).toHaveFocus();
    });

    it('should have focus outline', () => {
      render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
    });

    it('should have option buttons with type', async () => {
      const user = userEvent.setup();
      render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const options = screen.getAllByRole('button');
      options.slice(1).forEach(option => {
        expect(option).toHaveAttribute('type', 'button');
      });
    });
  });

  describe('8. Edge Cases', () => {
    it('should handle option with empty label', async () => {
      const user = userEvent.setup();
      const optionsWithEmpty = [
        { value: 'empty', label: '' },
        ...mockOptions,
      ];
      
      render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={optionsWithEmpty}
        />
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const allButtons = screen.getAllByRole('button');
      expect(allButtons.length).toBeGreaterThan(1);
    });

    it('should handle option with special characters', async () => {
      const user = userEvent.setup();
      const specialOptions = [
        { value: 'special', label: 'Option & <Special>' },
      ];
      
      render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={specialOptions}
        />
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(screen.getByText(/option & <special>/i)).toBeInTheDocument();
    });

    it('should handle very long option labels', async () => {
      const user = userEvent.setup();
      const longOptions = [
        { value: 'long', label: 'This is a very long option label that might wrap to multiple lines' },
      ];
      
      render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={longOptions}
        />
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(screen.getByText(/this is a very long option/i)).toBeInTheDocument();
    });

    it('should handle selecting same option twice', async () => {
      const user = userEvent.setup();
      render(
        <CustomSelect
          value="option1"
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const allButtons = screen.getAllByRole('button');
      const option = allButtons.find(btn => btn.textContent === 'Option 1' && btn !== button);
      if (option) {
        await user.click(option);
      }
      
      expect(mockOnChange).toHaveBeenCalledWith('option1');
    });

    it('should handle rapid open/close', async () => {
      const user = userEvent.setup();
      render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      const button = screen.getByRole('button');
      
      await user.click(button);
      await user.click(button);
      await user.click(button);
      
      // Should be open after odd number of clicks
      expect(screen.getByText(/option 1/i)).toBeInTheDocument();
    });

    it('should handle value not in options', () => {
      render(
        <CustomSelect
          value="nonexistent"
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      // Should show placeholder when value doesn't match any option
      expect(screen.getByText(/select\.\.\./i)).toBeInTheDocument();
    });
  });

  describe('9. Dropdown Layout', () => {
    it('should have dropdown with absolute positioning', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const dropdown = container.querySelector('.absolute.z-50');
      expect(dropdown).toBeInTheDocument();
    });

    it('should have dropdown with high z-index', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const dropdown = container.querySelector('.z-50');
      expect(dropdown).toBeInTheDocument();
    });

    it('should have scrollable dropdown for many options', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const scrollContainer = container.querySelector('.max-h-60.overflow-y-auto');
      expect(scrollContainer).toBeInTheDocument();
    });

    it('should have full width dropdown', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <CustomSelect
          value=""
          onChange={mockOnChange}
          options={mockOptions}
        />
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const dropdown = container.querySelector('.absolute.w-full');
      expect(dropdown).toBeInTheDocument();
    });
  });
});
