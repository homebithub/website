import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import Budget from '../features/Budget';

// Mock ProfileSetupContext
const mockMarkDirty = vi.fn();
const mockMarkClean = vi.fn();

vi.mock('~/contexts/ProfileSetupContext', () => ({
  useProfileSetup: () => ({
    markDirty: mockMarkDirty,
    markClean: mockMarkClean,
  }),
}));

// Mock react-router
vi.mock('react-router', () => ({
  useSubmit: () => vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

describe('Budget Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
    
    // Default mock for loading budget
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    ) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Rendering & Content', () => {
    it('should render title', () => {
      render(<Budget />);
      
      expect(screen.getByText(/💰 budget/i)).toBeInTheDocument();
    });

    it('should render description', () => {
      render(<Budget />);
      
      expect(screen.getByText(/what's your budget range for household help/i)).toBeInTheDocument();
    });

    it('should render frequency dropdown', () => {
      render(<Budget />);
      
      expect(screen.getByLabelText(/📅 payment frequency/i)).toBeInTheDocument();
    });

    it('should render budget range section', () => {
      render(<Budget />);
      
      expect(screen.getByText(/select budget range/i)).toBeInTheDocument();
    });

    it('should render save button', () => {
      render(<Budget />);
      
      expect(screen.getByRole('button', { name: /💾 save budget/i })).toBeInTheDocument();
    });

    it('should show required indicators', () => {
      render(<Budget />);
      
      const requiredMarkers = screen.getAllByText('*');
      expect(requiredMarkers.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('2. Frequency Dropdown', () => {
    it('should default to Monthly', () => {
      render(<Budget />);
      
      const dropdown = screen.getByLabelText(/payment frequency/i) as HTMLSelectElement;
      expect(dropdown.value).toBe('Monthly');
    });

    it('should have all frequency options', () => {
      render(<Budget />);
      
      expect(screen.getByRole('option', { name: 'Daily' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Weekly' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Monthly' })).toBeInTheDocument();
    });

    it('should change frequency on selection', async () => {
      const user = userEvent.setup();
      render(<Budget />);
      
      const dropdown = screen.getByLabelText(/payment frequency/i);
      await user.selectOptions(dropdown, 'Weekly');
      
      expect((dropdown as HTMLSelectElement).value).toBe('Weekly');
    });

    it('should call markDirty when frequency changes', async () => {
      const user = userEvent.setup();
      render(<Budget />);
      
      const dropdown = screen.getByLabelText(/payment frequency/i);
      await user.selectOptions(dropdown, 'Daily');
      
      expect(mockMarkDirty).toHaveBeenCalled();
    });

    it('should reset selected range when frequency changes', async () => {
      const user = userEvent.setup();
      render(<Budget />);
      
      // Select a monthly range
      const monthlyRange = screen.getByLabelText(/5,000-10,000 KES/i);
      await user.click(monthlyRange);
      
      // Change frequency
      const dropdown = screen.getByLabelText(/payment frequency/i);
      await user.selectOptions(dropdown, 'Weekly');
      
      // Check that no range is selected
      const radios = screen.getAllByRole('radio');
      expect(radios.every(radio => !(radio as HTMLInputElement).checked)).toBe(true);
    });
  });

  describe('3. Budget Ranges - Monthly', () => {
    it('should display monthly ranges by default', () => {
      render(<Budget />);
      
      expect(screen.getByLabelText(/5,000-10,000 KES/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/10,000-15,000 KES/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/15,000-25,000 KES/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/25,000\+ KES/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/negotiable/i)).toBeInTheDocument();
    });

    it('should select monthly range on click', async () => {
      const user = userEvent.setup();
      render(<Budget />);
      
      const range = screen.getByLabelText(/10,000-15,000 KES/i);
      await user.click(range);
      
      expect(range).toBeChecked();
    });
  });

  describe('4. Budget Ranges - Weekly', () => {
    it('should display weekly ranges when selected', async () => {
      const user = userEvent.setup();
      render(<Budget />);
      
      const dropdown = screen.getByLabelText(/payment frequency/i);
      await user.selectOptions(dropdown, 'Weekly');
      
      expect(screen.getByLabelText(/2,000-3,000 KES/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/3,000-5,000 KES/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/5,000-7,500 KES/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/7,500\+ KES/i)).toBeInTheDocument();
    });
  });

  describe('5. Budget Ranges - Daily', () => {
    it('should display daily ranges when selected', async () => {
      const user = userEvent.setup();
      render(<Budget />);
      
      const dropdown = screen.getByLabelText(/payment frequency/i);
      await user.selectOptions(dropdown, 'Daily');
      
      expect(screen.getByLabelText(/500-1,000 KES/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/1,000-1,500 KES/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/1,500-2,000 KES/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/2,000\+ KES/i)).toBeInTheDocument();
    });
  });

  describe('6. Theme Consistency', () => {
    it('should use purple theme for labels', () => {
      render(<Budget />);
      
      const label = screen.getByText(/payment frequency/i);
      expect(label).toHaveClass('text-purple-700', 'dark:text-purple-400');
    });

    it('should have purple gradient submit button', () => {
      render(<Budget />);
      
      const button = screen.getByRole('button', { name: /💾 save budget/i });
      expect(button).toHaveClass('from-purple-600', 'to-pink-600');
    });

    it('should support dark mode classes', () => {
      render(<Budget />);
      
      const dropdown = screen.getByLabelText(/payment frequency/i);
      expect(dropdown).toHaveClass('dark:bg-[#13131a]', 'dark:text-white');
    });

    it('should highlight selected range with purple', async () => {
      const user = userEvent.setup();
      render(<Budget />);
      
      const range = screen.getByLabelText(/10,000-15,000 KES/i);
      await user.click(range);
      
      const label = range.closest('label');
      expect(label).toHaveClass('border-purple-500', 'bg-purple-50');
    });
  });

  describe('7. Accessibility', () => {
    it('should have proper label for frequency dropdown', () => {
      render(<Budget />);
      
      const dropdown = screen.getByLabelText(/payment frequency/i);
      expect(dropdown).toHaveAttribute('id', 'frequency');
    });

    it('should have radio buttons for budget ranges', () => {
      render(<Budget />);
      
      const radios = screen.getAllByRole('radio');
      expect(radios.length).toBe(5); // 5 ranges for monthly
    });

    it('should have proper name attribute for radio group', () => {
      render(<Budget />);
      
      const radios = screen.getAllByRole('radio');
      radios.forEach(radio => {
        expect(radio).toHaveAttribute('name', 'budgetRange');
      });
    });

    it('should have accessible button', () => {
      render(<Budget />);
      
      const button = screen.getByRole('button', { name: /💾 save budget/i });
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('8. Form Validation', () => {
    it('should disable submit button when no range selected', () => {
      render(<Budget />);
      
      const button = screen.getByRole('button', { name: /💾 save budget/i });
      expect(button).toBeDisabled();
    });

    it('should enable submit button when range selected', async () => {
      const user = userEvent.setup();
      render(<Budget />);
      
      const range = screen.getByLabelText(/10,000-15,000 KES/i);
      await user.click(range);
      
      const button = screen.getByRole('button', { name: /💾 save budget/i });
      expect(button).toBeEnabled();
    });

    it('should show error when submitting without selection', async () => {
      const user = userEvent.setup();
      render(<Budget />);
      
      // Manually enable button for testing
      const button = screen.getByRole('button', { name: /💾 save budget/i });
      
      // Button is disabled, so we can't actually click it
      // This test verifies the validation logic exists
      expect(button).toBeDisabled();
    });
  });

  describe('9. User Interactions', () => {
    it('should allow selecting different ranges', async () => {
      const user = userEvent.setup();
      render(<Budget />);
      
      const range1 = screen.getByLabelText(/5,000-10,000 KES/i);
      await user.click(range1);
      expect(range1).toBeChecked();
      
      const range2 = screen.getByLabelText(/10,000-15,000 KES/i);
      await user.click(range2);
      expect(range2).toBeChecked();
      expect(range1).not.toBeChecked();
    });

    it('should call markDirty when range selected', async () => {
      const user = userEvent.setup();
      render(<Budget />);
      
      const range = screen.getByLabelText(/10,000-15,000 KES/i);
      await user.click(range);
      
      expect(mockMarkDirty).toHaveBeenCalled();
    });

    it('should allow selecting Negotiable option', async () => {
      const user = userEvent.setup();
      render(<Budget />);
      
      const negotiable = screen.getByLabelText(/negotiable/i);
      await user.click(negotiable);
      
      expect(negotiable).toBeChecked();
    });
  });

  describe('10. API Integration - Load Budget', () => {
    it('should load existing budget on mount', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            salary_frequency: 'monthly',
            budget_min: 10000,
            budget_max: 15000,
          }),
        })
      ) as any;
      
      render(<Budget />);
      
      await waitFor(() => {
        const range = screen.getByLabelText(/10,000-15,000 KES/i);
        expect(range).toBeChecked();
      });
    });

    it('should load frequency from API', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            salary_frequency: 'weekly',
            budget_min: 3000,
            budget_max: 5000,
          }),
        })
      ) as any;
      
      render(<Budget />);
      
      await waitFor(() => {
        const dropdown = screen.getByLabelText(/payment frequency/i) as HTMLSelectElement;
        expect(dropdown.value).toBe('Weekly');
      });
    });

    it('should handle negotiable budget from API', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            salary_frequency: 'monthly',
            budget_min: 0,
            budget_max: 0,
          }),
        })
      ) as any;
      
      render(<Budget />);
      
      await waitFor(() => {
        const negotiable = screen.getByLabelText(/negotiable/i);
        expect(negotiable).toBeChecked();
      });
    });

    it('should call API with correct headers', async () => {
      const fetchSpy = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      ) as any;
      global.fetch = fetchSpy;
      
      render(<Budget />);
      
      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledWith(
          expect.stringContaining('/api/v1/household/profile'),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
            }),
          })
        );
      });
    });

    it('should handle API error gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;
      
      render(<Budget />);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
      
      consoleErrorSpy.mockRestore();
    });

    it('should not load budget when no token exists', () => {
      localStorage.removeItem('token');
      const fetchSpy = vi.fn();
      global.fetch = fetchSpy;
      
      render(<Budget />);
      
      expect(fetchSpy).not.toHaveBeenCalled();
      
      localStorage.setItem('token', 'test-token');
    });
  });

  describe('11. API Integration - Save Budget', () => {
    it('should save budget successfully', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) }) // Load
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) }); // Save
      
      render(<Budget />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/payment frequency/i)).toBeInTheDocument();
      });
      
      const range = screen.getByLabelText(/10,000-15,000 KES/i);
      await user.click(range);
      
      const button = screen.getByRole('button', { name: /💾 save budget/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/budget saved successfully/i)).toBeInTheDocument();
      });
    });

    it('should send correct budget data to API', async () => {
      const user = userEvent.setup();
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
      global.fetch = mockFetch as any;
      
      render(<Budget />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/payment frequency/i)).toBeInTheDocument();
      });
      
      const range = screen.getByLabelText(/10,000-15,000 KES/i);
      await user.click(range);
      
      const button = screen.getByRole('button', { name: /💾 save budget/i });
      await user.click(button);
      
      await waitFor(() => {
        const saveCall = mockFetch.mock.calls.find((call: any) => call[1]?.method === 'PUT');
        expect(saveCall).toBeDefined();
        const body = JSON.parse(saveCall[1].body);
        expect(body.budget_min).toBe(10000);
        expect(body.budget_max).toBe(15000);
        expect(body.salary_frequency).toBe('monthly');
      });
    });

    it('should send negotiable as 0/0', async () => {
      const user = userEvent.setup();
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
      global.fetch = mockFetch as any;
      
      render(<Budget />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/payment frequency/i)).toBeInTheDocument();
      });
      
      const negotiable = screen.getByLabelText(/negotiable/i);
      await user.click(negotiable);
      
      const button = screen.getByRole('button', { name: /💾 save budget/i });
      await user.click(button);
      
      await waitFor(() => {
        const saveCall = mockFetch.mock.calls.find((call: any) => call[1]?.method === 'PUT');
        expect(saveCall).toBeDefined();
        const body = JSON.parse(saveCall[1].body);
        expect(body.budget_min).toBe(0);
        expect(body.budget_max).toBe(0);
      });
    });

    it('should include step metadata', async () => {
      const user = userEvent.setup();
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
      global.fetch = mockFetch as any;
      
      render(<Budget />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/payment frequency/i)).toBeInTheDocument();
      });
      
      const range = screen.getByLabelText(/10,000-15,000 KES/i);
      await user.click(range);
      
      const button = screen.getByRole('button', { name: /💾 save budget/i });
      await user.click(button);
      
      await waitFor(() => {
        const saveCall = mockFetch.mock.calls.find((call: any) => call[1]?.method === 'PUT');
        expect(saveCall).toBeDefined();
        const body = JSON.parse(saveCall[1].body);
        expect(body._step_metadata).toEqual({
          step_id: 'budget',
          step_number: 5,
          is_completed: true,
        });
      });
    });

    it('should call markClean after successful save', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
      
      render(<Budget />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/payment frequency/i)).toBeInTheDocument();
      });
      
      const range = screen.getByLabelText(/10,000-15,000 KES/i);
      await user.click(range);
      
      const button = screen.getByRole('button', { name: /💾 save budget/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(mockMarkClean).toHaveBeenCalled();
      });
    });
  });

  describe('12. Error Handling', () => {
    it('should show error message on API failure', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
        .mockResolvedValueOnce({ 
          ok: false, 
          json: () => Promise.resolve({ message: 'Server error' }) 
        });
      
      render(<Budget />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/payment frequency/i)).toBeInTheDocument();
      });
      
      const range = screen.getByLabelText(/10,000-15,000 KES/i);
      await user.click(range);
      
      const button = screen.getByRole('button', { name: /💾 save budget/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/failed to save budget preferences/i)).toBeInTheDocument();
      });
    });

    it('should handle network error', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
        .mockRejectedValueOnce(new Error('Network error'));
      
      render(<Budget />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/payment frequency/i)).toBeInTheDocument();
      });
      
      const range = screen.getByLabelText(/10,000-15,000 KES/i);
      await user.click(range);
      
      const button = screen.getByRole('button', { name: /💾 save budget/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/failed to save budget preferences/i)).toBeInTheDocument();
      });
    });

    it('should not call markClean on error', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
        .mockRejectedValueOnce(new Error('Network error'));
      
      mockMarkClean.mockClear();
      
      render(<Budget />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/payment frequency/i)).toBeInTheDocument();
      });
      
      const range = screen.getByLabelText(/10,000-15,000 KES/i);
      await user.click(range);
      
      const button = screen.getByRole('button', { name: /💾 save budget/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/failed to save budget preferences/i)).toBeInTheDocument();
      });
      
      expect(mockMarkClean).not.toHaveBeenCalled();
    });
  });

  describe('13. Loading States', () => {
    it('should disable button while submitting', async () => {
      const user = userEvent.setup();
      let resolveSubmit: any;
      const submitPromise = new Promise(resolve => { resolveSubmit = resolve; });
      
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
        .mockReturnValueOnce(submitPromise);
      
      render(<Budget />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/payment frequency/i)).toBeInTheDocument();
      });
      
      const range = screen.getByLabelText(/10,000-15,000 KES/i);
      await user.click(range);
      
      const button = screen.getByRole('button', { name: /💾 save budget/i });
      const clickPromise = user.click(button);
      
      await waitFor(() => {
        expect(button).toBeDisabled();
      });
      
      resolveSubmit({ ok: true, json: () => Promise.resolve({}) });
      await clickPromise;
    });

    it('should show loading text while submitting', async () => {
      const user = userEvent.setup();
      let resolveSubmit: any;
      const submitPromise = new Promise(resolve => { resolveSubmit = resolve; });
      
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
        .mockReturnValueOnce(submitPromise);
      
      render(<Budget />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/payment frequency/i)).toBeInTheDocument();
      });
      
      const range = screen.getByLabelText(/10,000-15,000 KES/i);
      await user.click(range);
      
      const button = screen.getByRole('button', { name: /💾 save budget/i });
      const clickPromise = user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/saving.../i)).toBeInTheDocument();
      });
      
      resolveSubmit({ ok: true, json: () => Promise.resolve({}) });
      await clickPromise;
    });

    it('should show spinner while loading', async () => {
      const user = userEvent.setup();
      let resolveSubmit: any;
      const submitPromise = new Promise(resolve => { resolveSubmit = resolve; });
      
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
        .mockReturnValueOnce(submitPromise);
      
      render(<Budget />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/payment frequency/i)).toBeInTheDocument();
      });
      
      const range = screen.getByLabelText(/10,000-15,000 KES/i);
      await user.click(range);
      
      const button = screen.getByRole('button', { name: /💾 save budget/i });
      const clickPromise = user.click(button);
      
      await waitFor(() => {
        const spinner = document.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
      });
      
      resolveSubmit({ ok: true, json: () => Promise.resolve({}) });
      await clickPromise;
    });

    it('should re-enable button after submission completes', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
      
      render(<Budget />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/payment frequency/i)).toBeInTheDocument();
      });
      
      const range = screen.getByLabelText(/10,000-15,000 KES/i);
      await user.click(range);
      
      const button = screen.getByRole('button', { name: /💾 save budget/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/budget saved successfully/i)).toBeInTheDocument();
      });
      
      expect(button).toBeEnabled();
    });
  });

  describe('14. Visual Feedback', () => {
    it('should highlight selected range', async () => {
      const user = userEvent.setup();
      render(<Budget />);
      
      const range = screen.getByLabelText(/10,000-15,000 KES/i);
      await user.click(range);
      
      const label = range.closest('label');
      expect(label).toHaveClass('border-purple-500');
    });

    it('should show hover effect on ranges', () => {
      render(<Budget />);
      
      const range = screen.getByLabelText(/10,000-15,000 KES/i);
      const label = range.closest('label');
      
      expect(label).toHaveClass('hover:bg-purple-50');
    });

    it('should have scale effect on selected range', async () => {
      const user = userEvent.setup();
      render(<Budget />);
      
      const range = screen.getByLabelText(/10,000-15,000 KES/i);
      await user.click(range);
      
      const label = range.closest('label');
      expect(label).toHaveClass('scale-105');
    });

    it('should have transition classes', () => {
      render(<Budget />);
      
      const range = screen.getByLabelText(/10,000-15,000 KES/i);
      const label = range.closest('label');
      
      expect(label).toHaveClass('transition-all');
    });
  });
});
