import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import NanyType from '../features/NanyType';

// Mock fetch
global.fetch = vi.fn();

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIMES = ["morning", "afternoon", "evening"];

describe('NanyType Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
    
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
      render(<NanyType />);
      
      expect(screen.getByText(/type of househelp/i)).toBeInTheDocument();
    });

    it('should render sleep in option', () => {
      render(<NanyType />);
      
      expect(screen.getByLabelText(/sleep in/i)).toBeInTheDocument();
    });

    it('should render day burg option', () => {
      render(<NanyType />);
      
      expect(screen.getByLabelText(/day burg/i)).toBeInTheDocument();
    });

    it('should render available from date input', () => {
      render(<NanyType />);
      
      expect(screen.getByLabelText(/available from/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<NanyType />);
      
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('should not show availability grid initially', () => {
      render(<NanyType />);
      
      expect(screen.queryByText(/select availability/i)).not.toBeInTheDocument();
    });

    it('should not show off days section initially', () => {
      render(<NanyType />);
      
      expect(screen.queryByText(/select off days/i)).not.toBeInTheDocument();
    });
  });

  describe('2. Radio Button Selection', () => {
    it('should select sleep in option', async () => {
      const user = userEvent.setup();
      render(<NanyType />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      await user.click(sleepIn);
      
      expect(sleepIn).toBeChecked();
    });

    it('should select day burg option', async () => {
      const user = userEvent.setup();
      render(<NanyType />);
      
      const dayBurg = screen.getByLabelText(/day burg/i);
      await user.click(dayBurg);
      
      expect(dayBurg).toBeChecked();
    });

    it('should switch between options', async () => {
      const user = userEvent.setup();
      render(<NanyType />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      const dayBurg = screen.getByLabelText(/day burg/i);
      
      await user.click(sleepIn);
      expect(sleepIn).toBeChecked();
      
      await user.click(dayBurg);
      expect(dayBurg).toBeChecked();
      expect(sleepIn).not.toBeChecked();
    });


    it('should highlight selected option', async () => {
      const user = userEvent.setup();
      render(<NanyType />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      await user.click(sleepIn);
      
      const label = sleepIn.closest('label');
      expect(label).toHaveClass('border-primary-500', 'bg-primary-50');
    });
  });

  describe('3. Availability Grid - Day Worker', () => {
    it('should show availability grid when day burg selected', async () => {
      const user = userEvent.setup();
      render(<NanyType />);
      
      const dayBurg = screen.getByLabelText(/day burg/i);
      await user.click(dayBurg);
      
      expect(screen.getByText(/select availability/i)).toBeInTheDocument();
    });

    it('should render all days in grid', async () => {
      const user = userEvent.setup();
      render(<NanyType />);
      
      const dayBurg = screen.getByLabelText(/day burg/i);
      await user.click(dayBurg);
      
      DAYS.forEach(day => {
        expect(screen.getByText(day)).toBeInTheDocument();
      });
    });

    it('should render all time slots', async () => {
      const user = userEvent.setup();
      render(<NanyType />);
      
      const dayBurg = screen.getByLabelText(/day burg/i);
      await user.click(dayBurg);
      
      expect(screen.getByText(/morning/i)).toBeInTheDocument();
      expect(screen.getByText(/afternoon/i)).toBeInTheDocument();
      expect(screen.getByText(/evening/i)).toBeInTheDocument();
    });

    it('should toggle individual time slot', async () => {
      const user = userEvent.setup();
      render(<NanyType />);
      
      const dayBurg = screen.getByLabelText(/day burg/i);
      await user.click(dayBurg);
      
      const mondayMorning = screen.getByLabelText(/toggle monday morning/i);
      await user.click(mondayMorning);
      
      expect(mondayMorning).toHaveClass('bg-purple-700');
    });


    it('should toggle off time slot on second click', async () => {
      const user = userEvent.setup();
      render(<NanyType />);
      
      const dayBurg = screen.getByLabelText(/day burg/i);
      await user.click(dayBurg);
      
      const mondayMorning = screen.getByLabelText(/toggle monday morning/i);
      await user.click(mondayMorning);
      expect(mondayMorning).toHaveClass('bg-purple-700');
      
      await user.click(mondayMorning);
      expect(mondayMorning).toHaveClass('bg-white');
    });

    it('should toggle entire day when clicking day name', async () => {
      const user = userEvent.setup();
      render(<NanyType />);
      
      const dayBurg = screen.getByLabelText(/day burg/i);
      await user.click(dayBurg);
      
      const mondayButton = screen.getByRole('button', { name: 'Monday' });
      await user.click(mondayButton);
      
      const mondayMorning = screen.getByLabelText(/toggle monday morning/i);
      const mondayAfternoon = screen.getByLabelText(/toggle monday afternoon/i);
      const mondayEvening = screen.getByLabelText(/toggle monday evening/i);
      
      expect(mondayMorning).toHaveClass('bg-purple-700');
      expect(mondayAfternoon).toHaveClass('bg-purple-700');
      expect(mondayEvening).toHaveClass('bg-purple-700');
    });

    it('should toggle entire time column when clicking time header', async () => {
      const user = userEvent.setup();
      render(<NanyType />);
      
      const dayBurg = screen.getByLabelText(/day burg/i);
      await user.click(dayBurg);
      
      const morningButton = screen.getByRole('button', { name: 'Morning' });
      await user.click(morningButton);
      
      const mondayMorning = screen.getByLabelText(/toggle monday morning/i);
      const tuesdayMorning = screen.getByLabelText(/toggle tuesday morning/i);
      
      expect(mondayMorning).toHaveClass('bg-purple-700');
      expect(tuesdayMorning).toHaveClass('bg-purple-700');
    });
  });


  describe('4. Off Days Selection - Household Sleep-in', () => {
    it('should show off days section for household sleep-in', async () => {
      const user = userEvent.setup();
      render(<NanyType userType="household" />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      await user.click(sleepIn);
      
      expect(screen.getByText(/select off days/i)).toBeInTheDocument();
    });

    it('should not show off days for househelp', async () => {
      const user = userEvent.setup();
      render(<NanyType userType="househelp" />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      await user.click(sleepIn);
      
      expect(screen.queryByText(/select off days/i)).not.toBeInTheDocument();
    });

    it('should render all days as checkboxes', async () => {
      const user = userEvent.setup();
      render(<NanyType userType="household" />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      await user.click(sleepIn);
      
      DAYS.forEach(day => {
        const dayCheckbox = screen.getByText(day).closest('label');
        expect(dayCheckbox).toBeInTheDocument();
      });
    });

    it('should select off day', async () => {
      const user = userEvent.setup();
      render(<NanyType userType="household" />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      await user.click(sleepIn);
      
      const monday = screen.getByText('Monday').closest('label');
      await user.click(monday!);
      
      expect(monday).toHaveClass('border-primary-500', 'bg-primary-50');
    });

    it('should allow selecting up to 3 days', async () => {
      const user = userEvent.setup();
      render(<NanyType userType="household" />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      await user.click(sleepIn);
      
      const monday = screen.getByText('Monday').closest('label');
      const tuesday = screen.getByText('Tuesday').closest('label');
      const wednesday = screen.getByText('Wednesday').closest('label');
      
      await user.click(monday!);
      await user.click(tuesday!);
      await user.click(wednesday!);
      
      expect(screen.getByText(/selected: monday, tuesday, wednesday/i)).toBeInTheDocument();
    });


    it('should not allow selecting more than 3 days', async () => {
      const user = userEvent.setup();
      render(<NanyType userType="household" />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      await user.click(sleepIn);
      
      const monday = screen.getByText('Monday').closest('label');
      const tuesday = screen.getByText('Tuesday').closest('label');
      const wednesday = screen.getByText('Wednesday').closest('label');
      const thursday = screen.getByText('Thursday').closest('label');
      
      await user.click(monday!);
      await user.click(tuesday!);
      await user.click(wednesday!);
      await user.click(thursday!);
      
      expect(thursday).toHaveClass('opacity-50', 'cursor-not-allowed');
      expect(screen.queryByText(/thursday/i, { selector: '.text-sm.text-gray-500' })).not.toBeInTheDocument();
    });

    it('should deselect off day on second click', async () => {
      const user = userEvent.setup();
      render(<NanyType userType="household" />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      await user.click(sleepIn);
      
      const monday = screen.getByText('Monday').closest('label');
      await user.click(monday!);
      expect(monday).toHaveClass('border-primary-500');
      
      await user.click(monday!);
      expect(monday).not.toHaveClass('border-primary-500');
    });

    it('should show count of selected days', async () => {
      const user = userEvent.setup();
      render(<NanyType userType="household" />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      await user.click(sleepIn);
      
      const monday = screen.getByText('Monday').closest('label');
      const tuesday = screen.getByText('Tuesday').closest('label');
      
      await user.click(monday!);
      await user.click(tuesday!);
      
      expect(screen.getByText(/\(2\/3\)/i)).toBeInTheDocument();
    });
  });


  describe('5. Date Input', () => {
    it('should accept date input', async () => {
      const user = userEvent.setup();
      render(<NanyType />);
      
      const dateInput = screen.getByLabelText(/available from/i) as HTMLInputElement;
      await user.type(dateInput, '2026-03-15');
      
      expect(dateInput.value).toBe('2026-03-15');
    });

    it('should have min date set to today', () => {
      render(<NanyType />);
      
      const dateInput = screen.getByLabelText(/available from/i) as HTMLInputElement;
      const today = new Date().toISOString().split('T')[0];
      
      expect(dateInput).toHaveAttribute('min', today);
    });

    it('should be required', () => {
      render(<NanyType />);
      
      const dateInput = screen.getByLabelText(/available from/i);
      expect(dateInput).toHaveAttribute('required');
    });

    it('should show required indicator', () => {
      render(<NanyType />);
      
      const label = screen.getByText(/available from/i);
      const requiredMarker = label.parentElement?.querySelector('.text-red-500');
      expect(requiredMarker).toHaveTextContent('*');
    });
  });

  describe('6. Theme Consistency', () => {
    it('should use purple theme for radio buttons', () => {
      render(<NanyType />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      expect(sleepIn).toHaveClass('text-primary-600');
    });

    it('should use purple theme for selected state', async () => {
      const user = userEvent.setup();
      render(<NanyType />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      await user.click(sleepIn);
      
      const label = sleepIn.closest('label');
      expect(label).toHaveClass('border-primary-500', 'bg-primary-50');
    });

    it('should use purple theme for availability grid', async () => {
      const user = userEvent.setup();
      render(<NanyType />);
      
      const dayBurg = screen.getByLabelText(/day burg/i);
      await user.click(dayBurg);
      
      const mondayMorning = screen.getByLabelText(/toggle monday morning/i);
      await user.click(mondayMorning);
      
      expect(mondayMorning).toHaveClass('bg-purple-700');
    });


    it('should use purple theme for submit button', () => {
      render(<NanyType />);
      
      const button = screen.getByRole('button', { name: /submit/i });
      expect(button).toHaveClass('bg-primary-700', 'hover:bg-primary-800');
    });

    it('should use purple theme for date input focus', () => {
      render(<NanyType />);
      
      const dateInput = screen.getByLabelText(/available from/i);
      expect(dateInput).toHaveClass('focus:ring-purple-500', 'focus:border-purple-500');
    });
  });

  describe('7. Accessibility', () => {
    it('should have radio buttons with proper name', () => {
      render(<NanyType />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      const dayBurg = screen.getByLabelText(/day burg/i);
      
      expect(sleepIn).toHaveAttribute('name', 'nanyType');
      expect(dayBurg).toHaveAttribute('name', 'nanyType');
    });

    it('should have aria-labels for availability buttons', async () => {
      const user = userEvent.setup();
      render(<NanyType />);
      
      const dayBurg = screen.getByLabelText(/day burg/i);
      await user.click(dayBurg);
      
      const mondayMorning = screen.getByLabelText(/toggle monday morning/i);
      expect(mondayMorning).toHaveAttribute('aria-label');
    });

    it('should have proper button types', () => {
      render(<NanyType />);
      
      const submitButton = screen.getByRole('button', { name: /submit/i });
      expect(submitButton).toHaveAttribute('type', 'button');
    });

    it('should have accessible date input', () => {
      render(<NanyType />);
      
      const dateInput = screen.getByLabelText(/available from/i);
      expect(dateInput).toHaveAttribute('type', 'date');
    });

    it('should have checkboxes hidden with sr-only', async () => {
      const user = userEvent.setup();
      render(<NanyType userType="household" />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      await user.click(sleepIn);
      
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toHaveClass('sr-only');
      });
    });
  });


  describe('8. Form Validation', () => {
    it('should show error when no type selected', async () => {
      const user = userEvent.setup();
      render(<NanyType />);
      
      const dateInput = screen.getByLabelText(/available from/i);
      await user.type(dateInput, '2026-03-15');
      
      const button = screen.getByRole('button', { name: /submit/i });
      await user.click(button);
      
      expect(screen.getByText(/please select the type of househelp/i)).toBeInTheDocument();
    });

    it('should show error when no date selected', async () => {
      const user = userEvent.setup();
      render(<NanyType />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      await user.click(sleepIn);
      
      const button = screen.getByRole('button', { name: /submit/i });
      await user.click(button);
      
      expect(screen.getByText(/please select the 'available from' date/i)).toBeInTheDocument();
    });

    it('should show error when day worker has no availability', async () => {
      const user = userEvent.setup();
      render(<NanyType />);
      
      const dayBurg = screen.getByLabelText(/day burg/i);
      await user.click(dayBurg);
      
      const dateInput = screen.getByLabelText(/available from/i);
      await user.type(dateInput, '2026-03-15');
      
      const button = screen.getByRole('button', { name: /submit/i });
      await user.click(button);
      
      expect(screen.getByText(/please select at least one available day or time slot/i)).toBeInTheDocument();
    });

    it('should show error when household sleep-in has no off days', async () => {
      const user = userEvent.setup();
      render(<NanyType userType="household" />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      await user.click(sleepIn);
      
      const dateInput = screen.getByLabelText(/available from/i);
      await user.type(dateInput, '2026-03-15');
      
      const button = screen.getByRole('button', { name: /submit/i });
      await user.click(button);
      
      expect(screen.getByText(/please select at least one off day/i)).toBeInTheDocument();
    });

    it('should highlight availability grid on error', async () => {
      const user = userEvent.setup();
      render(<NanyType />);
      
      const dayBurg = screen.getByLabelText(/day burg/i);
      await user.click(dayBurg);
      
      const dateInput = screen.getByLabelText(/available from/i);
      await user.type(dateInput, '2026-03-15');
      
      const button = screen.getByRole('button', { name: /submit/i });
      await user.click(button);
      
      const grid = screen.getByText(/select availability/i).closest('.bg-slate-50');
      expect(grid).toHaveClass('border-red-500');
    });


    it('should highlight date input on error', async () => {
      const user = userEvent.setup();
      render(<NanyType />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      await user.click(sleepIn);
      
      const button = screen.getByRole('button', { name: /submit/i });
      await user.click(button);
      
      const dateInput = screen.getByLabelText(/available from/i);
      expect(dateInput).toHaveClass('border-red-500');
    });
  });

  describe('9. API Integration - Save Availability', () => {
    it('should save sleep-in availability successfully', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      ) as any;
      
      render(<NanyType />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      await user.click(sleepIn);
      
      const dateInput = screen.getByLabelText(/available from/i);
      await user.type(dateInput, '2026-03-15');
      
      const button = screen.getByRole('button', { name: /submit/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/availability updated successfully/i)).toBeInTheDocument();
      });
    });

    it('should save day worker availability successfully', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      ) as any;
      
      render(<NanyType />);
      
      const dayBurg = screen.getByLabelText(/day burg/i);
      await user.click(dayBurg);
      
      const mondayMorning = screen.getByLabelText(/toggle monday morning/i);
      await user.click(mondayMorning);
      
      const dateInput = screen.getByLabelText(/available from/i);
      await user.type(dateInput, '2026-03-15');
      
      const button = screen.getByRole('button', { name: /submit/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/availability updated successfully/i)).toBeInTheDocument();
      });
    });


    it('should send correct availability data', async () => {
      const user = userEvent.setup();
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      ) as any;
      global.fetch = mockFetch;
      
      render(<NanyType />);
      
      const dayBurg = screen.getByLabelText(/day burg/i);
      await user.click(dayBurg);
      
      const mondayMorning = screen.getByLabelText(/toggle monday morning/i);
      await user.click(mondayMorning);
      
      const dateInput = screen.getByLabelText(/available from/i);
      await user.type(dateInput, '2026-03-15');
      
      const button = screen.getByRole('button', { name: /submit/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/v1/househelp-preferences/availability'),
          expect.objectContaining({
            method: 'PUT',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
          })
        );
      });
    });

    it('should include off days for household sleep-in', async () => {
      const user = userEvent.setup();
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      ) as any;
      global.fetch = mockFetch;
      
      render(<NanyType userType="household" />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      await user.click(sleepIn);
      
      const monday = screen.getByText('Monday').closest('label');
      await user.click(monday!);
      
      const dateInput = screen.getByLabelText(/available from/i);
      await user.type(dateInput, '2026-03-15');
      
      const button = screen.getByRole('button', { name: /submit/i });
      await user.click(button);
      
      await waitFor(() => {
        const call = mockFetch.mock.calls[0];
        const body = JSON.parse(call[1].body);
        expect(body.off_days).toEqual(['Monday']);
      });
    });


    it('should include availability grid data', async () => {
      const user = userEvent.setup();
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      ) as any;
      global.fetch = mockFetch;
      
      render(<NanyType />);
      
      const dayBurg = screen.getByLabelText(/day burg/i);
      await user.click(dayBurg);
      
      const mondayMorning = screen.getByLabelText(/toggle monday morning/i);
      await user.click(mondayMorning);
      
      const dateInput = screen.getByLabelText(/available from/i);
      await user.type(dateInput, '2026-03-15');
      
      const button = screen.getByRole('button', { name: /submit/i });
      await user.click(button);
      
      await waitFor(() => {
        const call = mockFetch.mock.calls[0];
        const body = JSON.parse(call[1].body);
        expect(body.availability.monday.morning).toBe(true);
        expect(body.available_from).toBe('2026-03-15');
      });
    });
  });

  describe('10. Error Handling', () => {
    it('should show error message on API failure', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: 'Server error' }),
        })
      ) as any;
      
      render(<NanyType />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      await user.click(sleepIn);
      
      const dateInput = screen.getByLabelText(/available from/i);
      await user.type(dateInput, '2026-03-15');
      
      const button = screen.getByRole('button', { name: /submit/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/failed to save availability/i)).toBeInTheDocument();
      });
    });

    it('should handle network error', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;
      
      render(<NanyType />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      await user.click(sleepIn);
      
      const dateInput = screen.getByLabelText(/available from/i);
      await user.type(dateInput, '2026-03-15');
      
      const button = screen.getByRole('button', { name: /submit/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });


    it('should show error styling', async () => {
      const user = userEvent.setup();
      render(<NanyType />);
      
      const button = screen.getByRole('button', { name: /submit/i });
      await user.click(button);
      
      const errorDiv = screen.getByText(/please select the type of househelp/i);
      expect(errorDiv).toHaveClass('text-red-600');
    });

    it('should clear error on successful submit', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      ) as any;
      
      render(<NanyType />);
      
      // Trigger error first
      const button = screen.getByRole('button', { name: /submit/i });
      await user.click(button);
      expect(screen.getByText(/please select the type of househelp/i)).toBeInTheDocument();
      
      // Fix and submit
      const sleepIn = screen.getByLabelText(/sleep in/i);
      await user.click(sleepIn);
      
      const dateInput = screen.getByLabelText(/available from/i);
      await user.type(dateInput, '2026-03-15');
      
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.queryByText(/please select the type of househelp/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('11. Loading States', () => {
    it('should disable button while submitting', async () => {
      const user = userEvent.setup();
      let resolveSubmit: any;
      const submitPromise = new Promise(resolve => { resolveSubmit = resolve; });
      
      global.fetch = vi.fn(() => submitPromise) as any;
      
      render(<NanyType />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      await user.click(sleepIn);
      
      const dateInput = screen.getByLabelText(/available from/i);
      await user.type(dateInput, '2026-03-15');
      
      const button = screen.getByRole('button', { name: /submit/i });
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
      
      global.fetch = vi.fn(() => submitPromise) as any;
      
      render(<NanyType />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      await user.click(sleepIn);
      
      const dateInput = screen.getByLabelText(/available from/i);
      await user.type(dateInput, '2026-03-15');
      
      const button = screen.getByRole('button', { name: /submit/i });
      const clickPromise = user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/submitting.../i)).toBeInTheDocument();
      });
      
      resolveSubmit({ ok: true, json: () => Promise.resolve({}) });
      await clickPromise;
    });

    it('should re-enable button after submission completes', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      ) as any;
      
      render(<NanyType />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      await user.click(sleepIn);
      
      const dateInput = screen.getByLabelText(/available from/i);
      await user.type(dateInput, '2026-03-15');
      
      const button = screen.getByRole('button', { name: /submit/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/availability updated successfully/i)).toBeInTheDocument();
      });
      
      expect(button).toBeEnabled();
    });
  });

  describe('12. Visual Feedback', () => {
    it('should show success message styling', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      ) as any;
      
      render(<NanyType />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      await user.click(sleepIn);
      
      const dateInput = screen.getByLabelText(/available from/i);
      await user.type(dateInput, '2026-03-15');
      
      const button = screen.getByRole('button', { name: /submit/i });
      await user.click(button);
      
      await waitFor(() => {
        const successDiv = screen.getByText(/successfully/i);
        expect(successDiv).toHaveClass('text-green-600');
      });
    });


    it('should show checkmark for selected time slots', async () => {
      const user = userEvent.setup();
      render(<NanyType />);
      
      const dayBurg = screen.getByLabelText(/day burg/i);
      await user.click(dayBurg);
      
      const mondayMorning = screen.getByLabelText(/toggle monday morning/i);
      await user.click(mondayMorning);
      
      const svg = mondayMorning.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should show checkmark for selected off days', async () => {
      const user = userEvent.setup();
      render(<NanyType userType="household" />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      await user.click(sleepIn);
      
      const monday = screen.getByText('Monday').closest('label');
      await user.click(monday!);
      
      const svg = monday?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should have hover effect on radio buttons', () => {
      render(<NanyType />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      const label = sleepIn.closest('label');
      
      expect(label).toHaveClass('hover:bg-gray-50');
    });

    it('should have transition classes', () => {
      render(<NanyType />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      const label = sleepIn.closest('label');
      
      expect(label).toHaveClass('cursor-pointer');
    });
  });

  describe('13. Edge Cases', () => {
    it('should handle invalid date format', async () => {
      const user = userEvent.setup();
      render(<NanyType />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      await user.click(sleepIn);
      
      const dateInput = screen.getByLabelText(/available from/i);
      await user.type(dateInput, 'invalid-date');
      
      const button = screen.getByRole('button', { name: /submit/i });
      await user.click(button);
      
      expect(screen.getByText(/please select the 'available from' date/i)).toBeInTheDocument();
    });

    it('should handle switching from day to sleep-in', async () => {
      const user = userEvent.setup();
      render(<NanyType />);
      
      const dayBurg = screen.getByLabelText(/day burg/i);
      await user.click(dayBurg);
      
      const mondayMorning = screen.getByLabelText(/toggle monday morning/i);
      await user.click(mondayMorning);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      await user.click(sleepIn);
      
      expect(screen.queryByText(/select availability/i)).not.toBeInTheDocument();
    });


    it('should handle empty availability grid submission', async () => {
      const user = userEvent.setup();
      render(<NanyType />);
      
      const dayBurg = screen.getByLabelText(/day burg/i);
      await user.click(dayBurg);
      
      const dateInput = screen.getByLabelText(/available from/i);
      await user.type(dateInput, '2026-03-15');
      
      const button = screen.getByRole('button', { name: /submit/i });
      await user.click(button);
      
      expect(screen.getByText(/please select at least one available day or time slot/i)).toBeInTheDocument();
    });

    it('should handle toggling all days off and on', async () => {
      const user = userEvent.setup();
      render(<NanyType />);
      
      const dayBurg = screen.getByLabelText(/day burg/i);
      await user.click(dayBurg);
      
      const mondayButton = screen.getByRole('button', { name: 'Monday' });
      await user.click(mondayButton);
      
      const mondayMorning = screen.getByLabelText(/toggle monday morning/i);
      expect(mondayMorning).toHaveClass('bg-purple-700');
      
      await user.click(mondayButton);
      expect(mondayMorning).toHaveClass('bg-white');
    });

    it('should handle toggling all times off and on', async () => {
      const user = userEvent.setup();
      render(<NanyType />);
      
      const dayBurg = screen.getByLabelText(/day burg/i);
      await user.click(dayBurg);
      
      const morningButton = screen.getByRole('button', { name: 'Morning' });
      await user.click(morningButton);
      
      const mondayMorning = screen.getByLabelText(/toggle monday morning/i);
      expect(mondayMorning).toHaveClass('bg-purple-700');
      
      await user.click(morningButton);
      expect(mondayMorning).toHaveClass('bg-white');
    });

    it('should not send off_days for househelp user', async () => {
      const user = userEvent.setup();
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      ) as any;
      global.fetch = mockFetch;
      
      render(<NanyType userType="househelp" />);
      
      const sleepIn = screen.getByLabelText(/sleep in/i);
      await user.click(sleepIn);
      
      const dateInput = screen.getByLabelText(/available from/i);
      await user.type(dateInput, '2026-03-15');
      
      const button = screen.getByRole('button', { name: /submit/i });
      await user.click(button);
      
      await waitFor(() => {
        const call = mockFetch.mock.calls[0];
        const body = JSON.parse(call[1].body);
        expect(body.off_days).toBeUndefined();
      });
    });
  });
});
