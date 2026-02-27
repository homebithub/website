import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import SearchableTownSelect from '../SearchableTownSelect';
import { apiClient } from '~/utils/apiClient';

// Mock the apiClient
vi.mock('~/utils/apiClient', () => ({
  apiClient: {
    auth: vi.fn(),
    json: vi.fn(),
  },
}));

const mockTownsResponse = {
  towns: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'],
  count: 5,
};

describe('SearchableTownSelect Component', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    target: 'househelps' as const,
    buttonClassName: 'test-button-class',
  };

  beforeEach(() => {
    mockOnChange = vi.fn();
    vi.clearAllMocks();
    
    // Setup default mock responses
    (apiClient.auth as any).mockResolvedValue({});
    (apiClient.json as any).mockResolvedValue(mockTownsResponse);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('1. Rendering & Content', () => {
    it('should render button with placeholder when no value', () => {
      render(<SearchableTownSelect {...defaultProps} onChange={mockOnChange} />);
      
      expect(screen.getByText(/any/i)).toBeInTheDocument();
    });

    it('should render button with selected value', () => {
      render(
        <SearchableTownSelect
          {...defaultProps}
          value="Nairobi"
          onChange={mockOnChange}
        />
      );
      
      expect(screen.getByText(/nairobi/i)).toBeInTheDocument();
    });

    it('should render dropdown arrow', () => {
      render(<SearchableTownSelect {...defaultProps} onChange={mockOnChange} />);
      
      expect(screen.getByText('▾')).toBeInTheDocument();
    });

    it('should not show dropdown initially', () => {
      render(<SearchableTownSelect {...defaultProps} onChange={mockOnChange} />);
      
      expect(screen.queryByPlaceholderText(/search town/i)).not.toBeInTheDocument();
    });

    it('should apply custom button className', () => {
      render(
        <SearchableTownSelect
          {...defaultProps}
          buttonClassName="custom-button"
          onChange={mockOnChange}
        />
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-button');
    });
  });

  describe('2. Dropdown Interactions', () => {
    it('should open dropdown when button clicked', async () => {
      const user = userEvent.setup();
      render(<SearchableTownSelect {...defaultProps} onChange={mockOnChange} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(screen.getByPlaceholderText(/search town/i)).toBeInTheDocument();
    });

    it('should close dropdown when button clicked again', async () => {
      const user = userEvent.setup();
      render(<SearchableTownSelect {...defaultProps} onChange={mockOnChange} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      expect(screen.getByPlaceholderText(/search town/i)).toBeInTheDocument();
      
      await user.click(button);
      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/search town/i)).not.toBeInTheDocument();
      });
    });

    it('should show search input when dropdown opens', async () => {
      const user = userEvent.setup();
      render(<SearchableTownSelect {...defaultProps} onChange={mockOnChange} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const searchInput = screen.getByPlaceholderText(/search town/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should show "Any" option in dropdown', async () => {
      const user = userEvent.setup();
      render(<SearchableTownSelect {...defaultProps} onChange={mockOnChange} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        const anyOptions = screen.getAllByText(/any/i);
        expect(anyOptions.length).toBeGreaterThan(1); // Button + dropdown option
      });
    });
  });

  describe('3. API Integration', () => {
    it('should call API when dropdown opens', async () => {
      const user = userEvent.setup();
      render(<SearchableTownSelect {...defaultProps} onChange={mockOnChange} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(apiClient.auth).toHaveBeenCalled();
      });
    });

    it('should include target in API call', async () => {
      const user = userEvent.setup();
      render(
        <SearchableTownSelect
          {...defaultProps}
          target="households"
          onChange={mockOnChange}
        />
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(apiClient.auth).toHaveBeenCalledWith(
          expect.stringContaining('target=households')
        );
      });
    });

    it('should display loaded towns', async () => {
      const user = userEvent.setup();
      render(<SearchableTownSelect {...defaultProps} onChange={mockOnChange} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/nairobi/i)).toBeInTheDocument();
        expect(screen.getByText(/mombasa/i)).toBeInTheDocument();
      });
    });

    it('should show loading state', async () => {
      const user = userEvent.setup();
      (apiClient.auth as any).mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<SearchableTownSelect {...defaultProps} onChange={mockOnChange} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/loading towns/i)).toBeInTheDocument();
      });
    });

    it('should show error message on API failure', async () => {
      const user = userEvent.setup();
      (apiClient.auth as any).mockRejectedValue(new Error('API Error'));
      
      render(<SearchableTownSelect {...defaultProps} onChange={mockOnChange} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/failed to load towns/i)).toBeInTheDocument();
      });
    });

    it('should show town count', async () => {
      const user = userEvent.setup();
      render(<SearchableTownSelect {...defaultProps} onChange={mockOnChange} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/5 towns/i)).toBeInTheDocument();
      });
    });
  });

  describe('4. Search Functionality', () => {
    it('should accept search input', async () => {
      const user = userEvent.setup();
      render(<SearchableTownSelect {...defaultProps} onChange={mockOnChange} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const searchInput = await screen.findByPlaceholderText(/search town/i);
      await user.type(searchInput, 'Nai');
      
      expect(searchInput).toHaveValue('Nai');
    });

    it('should debounce search API calls', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      render(<SearchableTownSelect {...defaultProps} onChange={mockOnChange} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const searchInput = await screen.findByPlaceholderText(/search town/i);
      
      // Clear initial API call
      vi.clearAllMocks();
      
      await user.type(searchInput, 'Nai');
      
      // Should not call immediately
      expect(apiClient.auth).not.toHaveBeenCalled();
      
      // Fast-forward time
      vi.advanceTimersByTime(250);
      
      await waitFor(() => {
        expect(apiClient.auth).toHaveBeenCalled();
      });
      
      vi.useRealTimers();
    });

    it('should include search query in API call', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      render(<SearchableTownSelect {...defaultProps} onChange={mockOnChange} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const searchInput = await screen.findByPlaceholderText(/search town/i);
      
      vi.clearAllMocks();
      await user.type(searchInput, 'Nairobi');
      vi.advanceTimersByTime(250);
      
      await waitFor(() => {
        expect(apiClient.auth).toHaveBeenCalledWith(
          expect.stringContaining('q=Nairobi')
        );
      });
      
      vi.useRealTimers();
    });

    it('should show "No towns found" when search returns empty', async () => {
      const user = userEvent.setup();
      (apiClient.json as any).mockResolvedValue({ towns: [], count: 0 });
      
      render(<SearchableTownSelect {...defaultProps} onChange={mockOnChange} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/no towns found/i)).toBeInTheDocument();
      });
    });
  });

  describe('5. Option Selection', () => {
    it('should call onChange when town selected', async () => {
      const user = userEvent.setup();
      render(<SearchableTownSelect {...defaultProps} onChange={mockOnChange} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/nairobi/i)).toBeInTheDocument();
      });
      
      const nairobiOption = screen.getByText(/nairobi/i);
      await user.click(nairobiOption);
      
      expect(mockOnChange).toHaveBeenCalledWith('Nairobi');
    });

    it('should close dropdown after selection', async () => {
      const user = userEvent.setup();
      render(<SearchableTownSelect {...defaultProps} onChange={mockOnChange} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/nairobi/i)).toBeInTheDocument();
      });
      
      const nairobiOption = screen.getByText(/nairobi/i);
      await user.click(nairobiOption);
      
      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/search town/i)).not.toBeInTheDocument();
      });
    });

    it('should clear search query after selection', async () => {
      const user = userEvent.setup();
      render(<SearchableTownSelect {...defaultProps} onChange={mockOnChange} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const searchInput = await screen.findByPlaceholderText(/search town/i);
      await user.type(searchInput, 'test');
      
      await waitFor(() => {
        expect(screen.getByText(/nairobi/i)).toBeInTheDocument();
      });
      
      const nairobiOption = screen.getByText(/nairobi/i);
      await user.click(nairobiOption);
      
      // Reopen to check if query was cleared
      await user.click(button);
      const newSearchInput = await screen.findByPlaceholderText(/search town/i);
      expect(newSearchInput).toHaveValue('');
    });

    it('should call onChange with empty string when "Any" selected', async () => {
      const user = userEvent.setup();
      render(<SearchableTownSelect {...defaultProps} onChange={mockOnChange} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        const anyOptions = screen.getAllByText(/any/i);
        expect(anyOptions.length).toBeGreaterThan(1);
      });
      
      // Click the "Any" option in dropdown (not the button text)
      const anyOptions = screen.getAllByText(/any/i);
      const anyOption = anyOptions.find(el => el.className.includes('cursor-pointer'));
      if (anyOption) {
        await user.click(anyOption);
      }
      
      expect(mockOnChange).toHaveBeenCalledWith('');
    });
  });

  describe('6. Click Outside Behavior', () => {
    it('should close dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <SearchableTownSelect {...defaultProps} onChange={mockOnChange} />
          <div data-testid="outside">Outside element</div>
        </div>
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(screen.getByPlaceholderText(/search town/i)).toBeInTheDocument();
      
      const outside = screen.getByTestId('outside');
      await user.click(outside);
      
      await waitFor(() => {
        expect(screen.queryByPlaceholderText(/search town/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('7. Styling & Customization', () => {
    it('should apply custom dropdown className', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <SearchableTownSelect
          {...defaultProps}
          dropdownClassName="custom-dropdown"
          onChange={mockOnChange}
        />
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const dropdown = container.querySelector('.custom-dropdown');
      expect(dropdown).toBeInTheDocument();
    });

    it('should apply custom input className', async () => {
      const user = userEvent.setup();
      render(
        <SearchableTownSelect
          {...defaultProps}
          inputClassName="custom-input"
          onChange={mockOnChange}
        />
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const searchInput = await screen.findByPlaceholderText(/search town/i);
      expect(searchInput).toHaveClass('custom-input');
    });

    it('should apply custom option className', async () => {
      const user = userEvent.setup();
      render(
        <SearchableTownSelect
          {...defaultProps}
          optionClassName="custom-option"
          onChange={mockOnChange}
        />
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        const anyOptions = screen.getAllByText(/any/i);
        const anyOption = anyOptions.find(el => el.className.includes('custom-option'));
        expect(anyOption).toBeInTheDocument();
      });
    });

    it('should use default classes when custom classes not provided', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <SearchableTownSelect {...defaultProps} onChange={mockOnChange} />
      );
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const dropdown = container.querySelector('.absolute.z-20');
      expect(dropdown).toBeInTheDocument();
    });

    it('should style placeholder text differently from selected value', () => {
      const { rerender } = render(
        <SearchableTownSelect {...defaultProps} value="" onChange={mockOnChange} />
      );
      
      const placeholderSpan = screen.getByText(/any/i);
      expect(placeholderSpan).toHaveClass('text-gray-500');
      
      rerender(
        <SearchableTownSelect {...defaultProps} value="Nairobi" onChange={mockOnChange} />
      );
      
      const valueSpan = screen.getByText(/nairobi/i);
      expect(valueSpan).toHaveClass('text-gray-900');
    });

    it('should have dark mode classes', async () => {
      const user = userEvent.setup();
      render(<SearchableTownSelect {...defaultProps} onChange={mockOnChange} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const searchInput = await screen.findByPlaceholderText(/search town/i);
      expect(searchInput).toHaveClass('dark:bg-[#13131a]', 'dark:text-gray-100');
    });
  });

  describe('8. Edge Cases', () => {
    it('should handle API response with nested data structure', async () => {
      const user = userEvent.setup();
      (apiClient.json as any).mockResolvedValue({
        data: {
          towns: ['Town1', 'Town2'],
        },
      });
      
      render(<SearchableTownSelect {...defaultProps} onChange={mockOnChange} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/town1/i)).toBeInTheDocument();
      });
    });

    it('should handle API response with non-array towns', async () => {
      const user = userEvent.setup();
      (apiClient.json as any).mockResolvedValue({ towns: null });
      
      render(<SearchableTownSelect {...defaultProps} onChange={mockOnChange} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/no towns found/i)).toBeInTheDocument();
      });
    });

    it('should filter out empty town names', async () => {
      const user = userEvent.setup();
      (apiClient.json as any).mockResolvedValue({
        towns: ['Nairobi', '', '  ', null, 'Mombasa'],
        count: 2,
      });
      
      render(<SearchableTownSelect {...defaultProps} onChange={mockOnChange} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/nairobi/i)).toBeInTheDocument();
        expect(screen.getByText(/mombasa/i)).toBeInTheDocument();
      });
    });

    it('should handle very long town names', async () => {
      const user = userEvent.setup();
      const longTownName = 'This is a very long town name that might cause layout issues';
      (apiClient.json as any).mockResolvedValue({
        towns: [longTownName],
        count: 1,
      });
      
      render(<SearchableTownSelect {...defaultProps} onChange={mockOnChange} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(longTownName)).toBeInTheDocument();
      });
    });

    it('should handle special characters in town names', async () => {
      const user = userEvent.setup();
      (apiClient.json as any).mockResolvedValue({
        towns: ["St. Mary's Town", 'Town & City'],
        count: 2,
      });
      
      render(<SearchableTownSelect {...defaultProps} onChange={mockOnChange} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/st\. mary's town/i)).toBeInTheDocument();
      });
    });

    it('should handle rapid dropdown open/close', async () => {
      const user = userEvent.setup();
      render(<SearchableTownSelect {...defaultProps} onChange={mockOnChange} />);
      
      const button = screen.getByRole('button');
      
      await user.click(button);
      await user.click(button);
      await user.click(button);
      
      // Should be open after odd number of clicks
      expect(screen.getByPlaceholderText(/search town/i)).toBeInTheDocument();
    });
  });

  describe('9. Accessibility', () => {
    it('should have button type', () => {
      render(<SearchableTownSelect {...defaultProps} onChange={mockOnChange} />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should be keyboard focusable', async () => {
      const user = userEvent.setup();
      render(<SearchableTownSelect {...defaultProps} onChange={mockOnChange} />);
      
      await user.tab();
      
      const button = screen.getByRole('button');
      expect(button).toHaveFocus();
    });

    it('should have search input with placeholder', async () => {
      const user = userEvent.setup();
      render(<SearchableTownSelect {...defaultProps} onChange={mockOnChange} />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      const searchInput = await screen.findByPlaceholderText(/search town/i);
      expect(searchInput).toHaveAttribute('placeholder', 'Search town...');
    });
  });
});
