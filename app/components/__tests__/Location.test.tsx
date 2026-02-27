import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import Location from '../features/Location';

// Mock fetch
global.fetch = vi.fn();

describe('Location Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('1. Rendering & Content', () => {
    it('should render location label', () => {
      render(<Location />);
      
      expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    });

    it('should render helper text', () => {
      render(<Location />);
      
      expect(screen.getByText(/if your exact location isn't found/i)).toBeInTheDocument();
    });

    it('should render input field', () => {
      render(<Location />);
      
      const input = screen.getByPlaceholderText(/enter location/i);
      expect(input).toBeInTheDocument();
    });

    it('should render save button', () => {
      render(<Location />);
      
      expect(screen.getByRole('button', { name: /save location/i })).toBeInTheDocument();
    });
  });

  describe('2. Input Interactions', () => {
    it('should update input value on typing', async () => {
      const user = userEvent.setup({ delay: null });
      render(<Location />);
      
      const input = screen.getByPlaceholderText(/enter location/i) as HTMLInputElement;
      await user.type(input, 'Nairobi');
      
      expect(input.value).toBe('Nairobi');
    });

    it('should not show dropdown for short input', async () => {
      const user = userEvent.setup({ delay: null });
      render(<Location />);
      
      const input = screen.getByPlaceholderText(/enter location/i);
      await user.type(input, 'Na');
      
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    it('should trigger search after 3+ characters', async () => {
      const user = userEvent.setup({ delay: null });
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { name: 'Nairobi', mapbox_id: '1', feature_type: 'city' }
          ]),
        })
      ) as any;
      
      render(<Location />);
      
      const input = screen.getByPlaceholderText(/enter location/i);
      await user.type(input, 'Nai');
      
      // Advance timer for debounce
      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('3. Autocomplete Suggestions', () => {
    it('should display suggestions after search', async () => {
      const user = userEvent.setup({ delay: null });
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { name: 'Nairobi', mapbox_id: '1', feature_type: 'city' },
            { name: 'Nakuru', mapbox_id: '2', feature_type: 'city' }
          ]),
        })
      ) as any;
      
      render(<Location />);
      
      const input = screen.getByPlaceholderText(/enter location/i);
      await user.type(input, 'Nai');
      
      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText('Nairobi')).toBeInTheDocument();
        expect(screen.getByText('Nakuru')).toBeInTheDocument();
      });
    });

    it('should select suggestion on click', async () => {
      const user = userEvent.setup({ delay: null });
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { name: 'Nairobi', mapbox_id: '1', feature_type: 'city' }
          ]),
        })
      ) as any;
      
      render(<Location />);
      
      const input = screen.getByPlaceholderText(/enter location/i) as HTMLInputElement;
      await user.type(input, 'Nai');
      
      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText('Nairobi')).toBeInTheDocument();
      });
      
      const suggestion = screen.getByText('Nairobi');
      await user.click(suggestion);
      
      expect(input.value).toBe('Nairobi');
    });

    it('should close dropdown after selection', async () => {
      const user = userEvent.setup({ delay: null });
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { name: 'Nairobi', mapbox_id: '1', feature_type: 'city' }
          ]),
        })
      ) as any;
      
      render(<Location />);
      
      const input = screen.getByPlaceholderText(/enter location/i);
      await user.type(input, 'Nai');
      
      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText('Nairobi')).toBeInTheDocument();
      });
      
      const suggestion = screen.getByText('Nairobi');
      await user.click(suggestion);
      
      await waitFor(() => {
        expect(screen.queryByText('Nairobi')).not.toBeInTheDocument();
      });
    });

    it('should call onSelect callback when provided', async () => {
      const user = userEvent.setup({ delay: null });
      const onSelect = vi.fn();
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { name: 'Nairobi', mapbox_id: '1', feature_type: 'city' }
          ]),
        })
      ) as any;
      
      render(<Location onSelect={onSelect} />);
      
      const input = screen.getByPlaceholderText(/enter location/i);
      await user.type(input, 'Nai');
      
      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText('Nairobi')).toBeInTheDocument();
      });
      
      const suggestion = screen.getByText('Nairobi');
      await user.click(suggestion);
      
      expect(onSelect).toHaveBeenCalledWith({
        name: 'Nairobi',
        mapbox_id: '1',
        feature_type: 'city'
      });
    });
  });

  describe('4. Keyboard Navigation', () => {
    it('should navigate suggestions with arrow down', async () => {
      const user = userEvent.setup({ delay: null });
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { name: 'Nairobi', mapbox_id: '1', feature_type: 'city' },
            { name: 'Nakuru', mapbox_id: '2', feature_type: 'city' }
          ]),
        })
      ) as any;
      
      render(<Location />);
      
      const input = screen.getByPlaceholderText(/enter location/i);
      await user.type(input, 'Nai');
      
      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText('Nairobi')).toBeInTheDocument();
      });
      
      await user.keyboard('{ArrowDown}');
      
      const firstSuggestion = screen.getByText('Nairobi').closest('div');
      expect(firstSuggestion).toHaveClass('bg-primary-50');
    });

    it('should navigate suggestions with arrow up', async () => {
      const user = userEvent.setup({ delay: null });
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { name: 'Nairobi', mapbox_id: '1', feature_type: 'city' },
            { name: 'Nakuru', mapbox_id: '2', feature_type: 'city' }
          ]),
        })
      ) as any;
      
      render(<Location />);
      
      const input = screen.getByPlaceholderText(/enter location/i);
      await user.type(input, 'Nai');
      
      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText('Nairobi')).toBeInTheDocument();
      });
      
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowUp}');
      
      const firstSuggestion = screen.getByText('Nairobi').closest('div');
      expect(firstSuggestion).toHaveClass('bg-primary-50');
    });

    it('should select suggestion with Enter key', async () => {
      const user = userEvent.setup({ delay: null });
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { name: 'Nairobi', mapbox_id: '1', feature_type: 'city' }
          ]),
        })
      ) as any;
      
      render(<Location />);
      
      const input = screen.getByPlaceholderText(/enter location/i) as HTMLInputElement;
      await user.type(input, 'Nai');
      
      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText('Nairobi')).toBeInTheDocument();
      });
      
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{Enter}');
      
      expect(input.value).toBe('Nairobi');
    });
  });

  describe('5. Debouncing', () => {
    it('should debounce API calls', async () => {
      const user = userEvent.setup({ delay: null });
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      ) as any;
      
      render(<Location />);
      
      const input = screen.getByPlaceholderText(/enter location/i);
      await user.type(input, 'Nairobi');
      
      // Should not call immediately
      expect(global.fetch).not.toHaveBeenCalled();
      
      // Advance timer
      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });
    });

    it('should cancel previous debounced call', async () => {
      const user = userEvent.setup({ delay: null });
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      ) as any;
      
      render(<Location />);
      
      const input = screen.getByPlaceholderText(/enter location/i);
      await user.type(input, 'Nai');
      
      vi.advanceTimersByTime(500);
      
      await user.type(input, 'robi');
      
      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('6. API Integration - Search', () => {
    it('should call search API with correct params', async () => {
      const user = userEvent.setup({ delay: null });
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      ) as any;
      global.fetch = mockFetch;
      
      render(<Location />);
      
      const input = screen.getByPlaceholderText(/enter location/i);
      await user.type(input, 'Nairobi');
      
      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/v1/location?q=Nairobi'),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer test-token',
            }),
          })
        );
      });
    });

    it('should handle search API error', async () => {
      const user = userEvent.setup({ delay: null });
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;
      
      render(<Location />);
      
      const input = screen.getByPlaceholderText(/enter location/i);
      await user.type(input, 'Nairobi');
      
      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
      
      // Should not crash
      expect(input).toBeInTheDocument();
    });
  });

  describe('7. API Integration - Save Location', () => {
    it('should save location successfully', async () => {
      const user = userEvent.setup({ delay: null });
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([
            { name: 'Nairobi', mapbox_id: '1', feature_type: 'city' }
          ]),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ message: 'Location saved successfully!' }),
        });
      
      render(<Location />);
      
      const input = screen.getByPlaceholderText(/enter location/i);
      await user.type(input, 'Nai');
      
      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText('Nairobi')).toBeInTheDocument();
      });
      
      const suggestion = screen.getByText('Nairobi');
      await user.click(suggestion);
      
      const button = screen.getByRole('button', { name: /save location/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/location saved successfully/i)).toBeInTheDocument();
      });
    });

    it('should send correct data to save API', async () => {
      const user = userEvent.setup({ delay: null });
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([
            { name: 'Nairobi', mapbox_id: '1', feature_type: 'city' }
          ]),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ message: 'Success' }),
        });
      global.fetch = mockFetch;
      
      render(<Location />);
      
      const input = screen.getByPlaceholderText(/enter location/i);
      await user.type(input, 'Nai');
      
      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText('Nairobi')).toBeInTheDocument();
      });
      
      const suggestion = screen.getByText('Nairobi');
      await user.click(suggestion);
      
      const button = screen.getByRole('button', { name: /save location/i });
      await user.click(button);
      
      await waitFor(() => {
        const saveCall = mockFetch.mock.calls.find((call: any) => 
          call[0].includes('/save-user-location')
        );
        expect(saveCall).toBeDefined();
        const body = JSON.parse(saveCall[1].body);
        expect(body.mapbox_id).toBe('1');
        expect(body.town).toBe('Nairobi');
        expect(body._step_metadata).toEqual({
          step_id: 'location',
          step_number: 1,
          is_completed: true,
        });
      });
    });

    it('should show validation error when no location selected', async () => {
      const user = userEvent.setup({ delay: null });
      render(<Location />);
      
      const button = screen.getByRole('button', { name: /save location/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/please select a location from the suggestions/i)).toBeInTheDocument();
      });
    });
  });

  describe('8. Error Handling', () => {
    it('should show error message on save failure', async () => {
      const user = userEvent.setup({ delay: null });
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([
            { name: 'Nairobi', mapbox_id: '1', feature_type: 'city' }
          ]),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ message: 'Server error' }),
        });
      
      render(<Location />);
      
      const input = screen.getByPlaceholderText(/enter location/i);
      await user.type(input, 'Nai');
      
      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText('Nairobi')).toBeInTheDocument();
      });
      
      const suggestion = screen.getByText('Nairobi');
      await user.click(suggestion);
      
      const button = screen.getByRole('button', { name: /save location/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/server error|failed to save location/i)).toBeInTheDocument();
      });
    });

    it('should handle network error on save', async () => {
      const user = userEvent.setup({ delay: null });
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([
            { name: 'Nairobi', mapbox_id: '1', feature_type: 'city' }
          ]),
        })
        .mockRejectedValueOnce(new Error('Network error'));
      
      render(<Location />);
      
      const input = screen.getByPlaceholderText(/enter location/i);
      await user.type(input, 'Nai');
      
      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText('Nairobi')).toBeInTheDocument();
      });
      
      const suggestion = screen.getByText('Nairobi');
      await user.click(suggestion);
      
      const button = screen.getByRole('button', { name: /save location/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/an error occurred/i)).toBeInTheDocument();
      });
    });
  });

  describe('9. Loading States', () => {
    it('should show loading text while searching', async () => {
      const user = userEvent.setup({ delay: null });
      let resolveSearch: any;
      const searchPromise = new Promise(resolve => { resolveSearch = resolve; });
      
      global.fetch = vi.fn(() => searchPromise) as any;
      
      render(<Location />);
      
      const input = screen.getByPlaceholderText(/enter location/i);
      await user.type(input, 'Nai');
      
      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
      });
      
      resolveSearch({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });

    it('should disable button while saving', async () => {
      const user = userEvent.setup({ delay: null });
      let resolveSave: any;
      const savePromise = new Promise(resolve => { resolveSave = resolve; });
      
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([
            { name: 'Nairobi', mapbox_id: '1', feature_type: 'city' }
          ]),
        })
        .mockReturnValueOnce(savePromise);
      
      render(<Location />);
      
      const input = screen.getByPlaceholderText(/enter location/i);
      await user.type(input, 'Nai');
      
      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText('Nairobi')).toBeInTheDocument();
      });
      
      const suggestion = screen.getByText('Nairobi');
      await user.click(suggestion);
      
      const button = screen.getByRole('button', { name: /save location/i });
      const clickPromise = user.click(button);
      
      await waitFor(() => {
        expect(button).toBeDisabled();
      });
      
      resolveSave({
        ok: true,
        json: () => Promise.resolve({ message: 'Success' }),
      });
      await clickPromise;
    });

    it('should show saving text while submitting', async () => {
      const user = userEvent.setup({ delay: null });
      let resolveSave: any;
      const savePromise = new Promise(resolve => { resolveSave = resolve; });
      
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([
            { name: 'Nairobi', mapbox_id: '1', feature_type: 'city' }
          ]),
        })
        .mockReturnValueOnce(savePromise);
      
      render(<Location />);
      
      const input = screen.getByPlaceholderText(/enter location/i);
      await user.type(input, 'Nai');
      
      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText('Nairobi')).toBeInTheDocument();
      });
      
      const suggestion = screen.getByText('Nairobi');
      await user.click(suggestion);
      
      const button = screen.getByRole('button', { name: /save location/i });
      const clickPromise = user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/saving.../i)).toBeInTheDocument();
      });
      
      resolveSave({
        ok: true,
        json: () => Promise.resolve({ message: 'Success' }),
      });
      await clickPromise;
    });
  });

  describe('10. Accessibility', () => {
    it('should have proper label for input', () => {
      render(<Location />);
      
      const input = screen.getByLabelText(/location/i);
      expect(input).toHaveAttribute('id', 'location-input');
    });

    it('should have autocomplete off', () => {
      render(<Location />);
      
      const input = screen.getByPlaceholderText(/enter location/i);
      expect(input).toHaveAttribute('autocomplete', 'off');
    });

    it('should have accessible button', () => {
      render(<Location />);
      
      const button = screen.getByRole('button', { name: /save location/i });
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('11. Visual Feedback', () => {
    it('should highlight hovered suggestion', async () => {
      const user = userEvent.setup({ delay: null });
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { name: 'Nairobi', mapbox_id: '1', feature_type: 'city' }
          ]),
        })
      ) as any;
      
      render(<Location />);
      
      const input = screen.getByPlaceholderText(/enter location/i);
      await user.type(input, 'Nai');
      
      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText('Nairobi')).toBeInTheDocument();
      });
      
      const suggestion = screen.getByText('Nairobi').closest('div');
      expect(suggestion).toHaveClass('hover:bg-primary-100');
    });

    it('should show success styling for success messages', async () => {
      const user = userEvent.setup({ delay: null });
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([
            { name: 'Nairobi', mapbox_id: '1', feature_type: 'city' }
          ]),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ message: 'Success' }),
        });
      
      render(<Location />);
      
      const input = screen.getByPlaceholderText(/enter location/i);
      await user.type(input, 'Nai');
      
      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText('Nairobi')).toBeInTheDocument();
      });
      
      const suggestion = screen.getByText('Nairobi');
      await user.click(suggestion);
      
      const button = screen.getByRole('button', { name: /save location/i });
      await user.click(button);
      
      await waitFor(() => {
        const successDiv = screen.getByText(/success/i).closest('div');
        expect(successDiv).toHaveClass('bg-green-50', 'text-green-800');
      });
    });

    it('should show error styling for error messages', async () => {
      const user = userEvent.setup({ delay: null });
      render(<Location />);
      
      const button = screen.getByRole('button', { name: /save location/i });
      await user.click(button);
      
      await waitFor(() => {
        const errorDiv = screen.getByText(/please select/i).closest('div');
        expect(errorDiv).toHaveClass('bg-red-50', 'text-red-800');
      });
    });
  });
});
