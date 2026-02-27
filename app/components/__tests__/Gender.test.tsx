import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import Gender from '../features/Gender';

// Mock fetch
global.fetch = vi.fn();

describe('Gender Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Rendering & Content', () => {
    it('should render gender title', () => {
      render(<Gender />);
      
      expect(screen.getByText(/gender/i)).toBeInTheDocument();
    });

    it('should render female option', () => {
      render(<Gender />);
      
      expect(screen.getByLabelText(/female/i)).toBeInTheDocument();
    });

    it('should render male option', () => {
      render(<Gender />);
      
      expect(screen.getByLabelText(/male/i)).toBeInTheDocument();
    });

    it('should render date of birth field', () => {
      render(<Gender />);
      
      expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<Gender />);
      
      expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    });

    it('should show age requirement text', () => {
      render(<Gender />);
      
      expect(screen.getByText(/you must be at least 18 years old/i)).toBeInTheDocument();
    });

    it('should show required indicator', () => {
      render(<Gender />);
      
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('2. Gender Selection', () => {
    it('should default to female', () => {
      render(<Gender />);
      
      const female = screen.getByLabelText(/female/i);
      expect(female).toBeChecked();
    });

    it('should select male on click', async () => {
      const user = userEvent.setup();
      render(<Gender />);
      
      const male = screen.getByLabelText(/male/i);
      await user.click(male);
      
      expect(male).toBeChecked();
    });

    it('should deselect female when male selected', async () => {
      const user = userEvent.setup();
      render(<Gender />);
      
      const female = screen.getByLabelText(/female/i);
      const male = screen.getByLabelText(/male/i);
      
      expect(female).toBeChecked();
      
      await user.click(male);
      
      expect(male).toBeChecked();
      expect(female).not.toBeChecked();
    });

    it('should highlight selected gender', async () => {
      const user = userEvent.setup();
      render(<Gender />);
      
      const male = screen.getByLabelText(/male/i);
      await user.click(male);
      
      const label = male.closest('label');
      expect(label).toHaveClass('border-primary-500', 'bg-primary-50');
    });
  });

  describe('3. Date of Birth Input', () => {
    it('should accept date input', async () => {
      const user = userEvent.setup();
      render(<Gender />);
      
      const dateInput = screen.getByLabelText(/date of birth/i) as HTMLInputElement;
      await user.type(dateInput, '2000-01-01');
      
      expect(dateInput.value).toBe('2000-01-01');
    });

    it('should have max date set to 18 years ago', () => {
      render(<Gender />);
      
      const dateInput = screen.getByLabelText(/date of birth/i) as HTMLInputElement;
      const today = new Date();
      const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
      const expectedMax = maxDate.toISOString().split('T')[0];
      
      expect(dateInput.max).toBe(expectedMax);
    });

    it('should be required', () => {
      render(<Gender />);
      
      const dateInput = screen.getByLabelText(/date of birth/i);
      expect(dateInput).toBeRequired();
    });

    it('should clear error on date change', async () => {
      const user = userEvent.setup();
      render(<Gender />);
      
      // Trigger error by submitting without date
      const button = screen.getByRole('button', { name: /continue/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/please select your date of birth/i)).toBeInTheDocument();
      });
      
      // Enter date
      const dateInput = screen.getByLabelText(/date of birth/i);
      await user.type(dateInput, '2000-01-01');
      
      // Error should be cleared
      expect(screen.queryByText(/please select your date of birth/i)).not.toBeInTheDocument();
    });
  });

  describe('4. Form Validation', () => {
    it('should show error when submitting without date', async () => {
      const user = userEvent.setup();
      render(<Gender />);
      
      const button = screen.getByRole('button', { name: /continue/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/please select your date of birth/i)).toBeInTheDocument();
      });
    });

    it('should show error for users under 18', async () => {
      const user = userEvent.setup();
      render(<Gender />);
      
      const today = new Date();
      const underageDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
      const dateString = underageDate.toISOString().split('T')[0];
      
      const dateInput = screen.getByLabelText(/date of birth/i);
      await user.type(dateInput, dateString);
      
      const button = screen.getByRole('button', { name: /continue/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/you must be at least 18 years old/i)).toBeInTheDocument();
      });
    });

    it('should accept users exactly 18 years old', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      ) as any;
      
      render(<Gender />);
      
      const today = new Date();
      const exactlyEighteen = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
      const dateString = exactlyEighteen.toISOString().split('T')[0];
      
      const dateInput = screen.getByLabelText(/date of birth/i);
      await user.type(dateInput, dateString);
      
      const button = screen.getByRole('button', { name: /continue/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });

    it('should show error styling on date input when invalid', async () => {
      const user = userEvent.setup();
      render(<Gender />);
      
      const button = screen.getByRole('button', { name: /continue/i });
      await user.click(button);
      
      await waitFor(() => {
        const dateInput = screen.getByLabelText(/date of birth/i);
        expect(dateInput).toHaveClass('border-red-500');
      });
    });
  });

  describe('5. API Integration', () => {
    it('should save gender and date successfully', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      ) as any;
      
      render(<Gender />);
      
      const male = screen.getByLabelText(/male/i);
      await user.click(male);
      
      const dateInput = screen.getByLabelText(/date of birth/i);
      await user.type(dateInput, '2000-01-01');
      
      const button = screen.getByRole('button', { name: /continue/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/your information has been saved successfully/i)).toBeInTheDocument();
      });
    });

    it('should send correct data to API', async () => {
      const user = userEvent.setup();
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      ) as any;
      global.fetch = mockFetch;
      
      render(<Gender />);
      
      const male = screen.getByLabelText(/male/i);
      await user.click(male);
      
      const dateInput = screen.getByLabelText(/date of birth/i);
      await user.type(dateInput, '2000-01-01');
      
      const button = screen.getByRole('button', { name: /continue/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/v1/househelps/me/fields'),
          expect.objectContaining({
            method: 'PATCH',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              'Authorization': 'Bearer test-token',
            }),
            body: expect.stringContaining('"gender":"male"'),
          })
        );
      });
    });

    it('should include date of birth in request', async () => {
      const user = userEvent.setup();
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      ) as any;
      global.fetch = mockFetch;
      
      render(<Gender />);
      
      const dateInput = screen.getByLabelText(/date of birth/i);
      await user.type(dateInput, '2000-01-01');
      
      const button = screen.getByRole('button', { name: /continue/i });
      await user.click(button);
      
      await waitFor(() => {
        const call = mockFetch.mock.calls[0];
        const body = JSON.parse(call[1].body);
        expect(body.updates.date_of_birth).toBe('2000-01-01');
      });
    });

    it('should show error when token missing', async () => {
      const user = userEvent.setup();
      localStorage.removeItem('token');
      
      render(<Gender />);
      
      const dateInput = screen.getByLabelText(/date of birth/i);
      await user.type(dateInput, '2000-01-01');
      
      const button = screen.getByRole('button', { name: /continue/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/authentication token not found|failed to save/i)).toBeInTheDocument();
      });
    });
  });

  describe('6. Error Handling', () => {
    it('should show error message on API failure', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: 'Server error' }),
        })
      ) as any;
      
      render(<Gender />);
      
      const dateInput = screen.getByLabelText(/date of birth/i);
      await user.type(dateInput, '2000-01-01');
      
      const button = screen.getByRole('button', { name: /continue/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/server error|failed to save/i)).toBeInTheDocument();
      });
    });

    it('should handle network error', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;
      
      render(<Gender />);
      
      const dateInput = screen.getByLabelText(/date of birth/i);
      await user.type(dateInput, '2000-01-01');
      
      const button = screen.getByRole('button', { name: /continue/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/failed to save your information/i)).toBeInTheDocument();
      });
    });

    it('should show error styling for error messages', async () => {
      const user = userEvent.setup();
      render(<Gender />);
      
      const button = screen.getByRole('button', { name: /continue/i });
      await user.click(button);
      
      await waitFor(() => {
        const errorDiv = screen.getByText(/please select/i).closest('div');
        expect(errorDiv).toHaveClass('bg-red-50', 'text-red-700');
      });
    });
  });

  describe('7. Loading States', () => {
    it('should disable button while saving', async () => {
      const user = userEvent.setup();
      let resolveSubmit: any;
      const submitPromise = new Promise(resolve => { resolveSubmit = resolve; });
      
      global.fetch = vi.fn(() => submitPromise) as any;
      
      render(<Gender />);
      
      const dateInput = screen.getByLabelText(/date of birth/i);
      await user.type(dateInput, '2000-01-01');
      
      const button = screen.getByRole('button', { name: /continue/i });
      const clickPromise = user.click(button);
      
      await waitFor(() => {
        expect(button).toBeDisabled();
      });
      
      resolveSubmit({ ok: true, json: () => Promise.resolve({}) });
      await clickPromise;
    });

    it('should show loading text while saving', async () => {
      const user = userEvent.setup();
      let resolveSubmit: any;
      const submitPromise = new Promise(resolve => { resolveSubmit = resolve; });
      
      global.fetch = vi.fn(() => submitPromise) as any;
      
      render(<Gender />);
      
      const dateInput = screen.getByLabelText(/date of birth/i);
      await user.type(dateInput, '2000-01-01');
      
      const button = screen.getByRole('button', { name: /continue/i });
      const clickPromise = user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/saving.../i)).toBeInTheDocument();
      });
      
      resolveSubmit({ ok: true, json: () => Promise.resolve({}) });
      await clickPromise;
    });

    it('should re-enable button after save completes', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      ) as any;
      
      render(<Gender />);
      
      const dateInput = screen.getByLabelText(/date of birth/i);
      await user.type(dateInput, '2000-01-01');
      
      const button = screen.getByRole('button', { name: /continue/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/your information has been saved successfully/i)).toBeInTheDocument();
      });
      
      expect(button).toBeEnabled();
    });
  });

  describe('8. Accessibility', () => {
    it('should have radio buttons for gender', () => {
      render(<Gender />);
      
      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(2);
    });

    it('should have proper name attribute for radio group', () => {
      render(<Gender />);
      
      const female = screen.getByLabelText(/female/i);
      const male = screen.getByLabelText(/male/i);
      
      expect(female).toHaveAttribute('name', 'gender');
      expect(male).toHaveAttribute('name', 'gender');
    });

    it('should have proper label for date input', () => {
      render(<Gender />);
      
      const dateInput = screen.getByLabelText(/date of birth/i);
      expect(dateInput).toHaveAttribute('type', 'date');
    });

    it('should have accessible button', () => {
      render(<Gender />);
      
      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('9. Visual Feedback', () => {
    it('should show success styling for success messages', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      ) as any;
      
      render(<Gender />);
      
      const dateInput = screen.getByLabelText(/date of birth/i);
      await user.type(dateInput, '2000-01-01');
      
      const button = screen.getByRole('button', { name: /continue/i });
      await user.click(button);
      
      await waitFor(() => {
        const successDiv = screen.getByText(/successfully/i).closest('div');
        expect(successDiv).toHaveClass('bg-green-50', 'text-green-700');
      });
    });

    it('should have hover effect on unselected gender', () => {
      render(<Gender />);
      
      const male = screen.getByLabelText(/male/i);
      const label = male.closest('label');
      
      expect(label).toHaveClass('hover:bg-gray-50');
    });

    it('should have grid layout for gender options', () => {
      render(<Gender />);
      
      const female = screen.getByLabelText(/female/i);
      const gridContainer = female.closest('.grid');
      
      expect(gridContainer).toHaveClass('grid-cols-2');
    });
  });
});
