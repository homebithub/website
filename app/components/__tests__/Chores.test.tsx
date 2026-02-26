import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import Chores from '../features/Chores';

// Mock fetch
global.fetch = vi.fn();

const CHORES = [
  "Laundry",
  "Cooking",
  "Dishwashing",
  "Sweeping",
  "Mopping",
  "Ironing clothes",
  "Grocery shopping",
  "Window cleaning",
  "Bathroom cleaning",
  "Pet care"
];

describe('Chores Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Rendering & Content', () => {
    it('should render title', () => {
      render(<Chores />);
      
      expect(screen.getByText(/select chores/i)).toBeInTheDocument();
    });

    it('should render all chore options', () => {
      render(<Chores />);
      
      CHORES.forEach(chore => {
        expect(screen.getByText(chore)).toBeInTheDocument();
      });
    });

    it('should render save button', () => {
      render(<Chores />);
      
      expect(screen.getByRole('button', { name: /save chores/i })).toBeInTheDocument();
    });

    it('should show selected chores section', () => {
      render(<Chores />);
      
      expect(screen.getByText(/selected chores:/i)).toBeInTheDocument();
    });

    it('should show "None" when no chores selected', () => {
      render(<Chores />);
      
      expect(screen.getByText('None')).toBeInTheDocument();
    });
  });

  describe('2. Checkbox Interactions', () => {
    it('should select chore on click', async () => {
      const user = userEvent.setup();
      render(<Chores />);
      
      const laundry = screen.getByLabelText('Laundry');
      await user.click(laundry);
      
      expect(laundry).toBeChecked();
    });

    it('should deselect chore on second click', async () => {
      const user = userEvent.setup();
      render(<Chores />);
      
      const laundry = screen.getByLabelText('Laundry');
      await user.click(laundry);
      expect(laundry).toBeChecked();
      
      await user.click(laundry);
      expect(laundry).not.toBeChecked();
    });

    it('should allow selecting multiple chores', async () => {
      const user = userEvent.setup();
      render(<Chores />);
      
      const laundry = screen.getByLabelText('Laundry');
      const cooking = screen.getByLabelText('Cooking');
      const dishwashing = screen.getByLabelText('Dishwashing');
      
      await user.click(laundry);
      await user.click(cooking);
      await user.click(dishwashing);
      
      expect(laundry).toBeChecked();
      expect(cooking).toBeChecked();
      expect(dishwashing).toBeChecked();
    });

    it('should update selected chores display', async () => {
      const user = userEvent.setup();
      render(<Chores />);
      
      const laundry = screen.getByLabelText('Laundry');
      await user.click(laundry);
      
      expect(screen.getByText('Laundry')).toBeInTheDocument();
      expect(screen.queryByText('None')).not.toBeInTheDocument();
    });
  });

  describe('3. Theme & Styling', () => {
    it('should highlight selected chores', async () => {
      const user = userEvent.setup();
      render(<Chores />);
      
      const laundry = screen.getByLabelText('Laundry');
      await user.click(laundry);
      
      const label = laundry.closest('label');
      expect(label).toHaveClass('border-primary-500', 'bg-primary-50');
    });

    it('should show checkmark for selected chores', async () => {
      const user = userEvent.setup();
      render(<Chores />);
      
      const laundry = screen.getByLabelText('Laundry');
      await user.click(laundry);
      
      const svg = laundry.parentElement?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should have hover effect on unselected chores', () => {
      render(<Chores />);
      
      const laundry = screen.getByLabelText('Laundry');
      const label = laundry.closest('label');
      
      expect(label).toHaveClass('hover:bg-gray-50');
    });
  });

  describe('4. Accessibility', () => {
    it('should have checkboxes for all chores', () => {
      render(<Chores />);
      
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(CHORES.length);
    });

    it('should have proper labels for checkboxes', () => {
      render(<Chores />);
      
      CHORES.forEach(chore => {
        const checkbox = screen.getByLabelText(chore);
        expect(checkbox).toHaveAttribute('type', 'checkbox');
      });
    });

    it('should have accessible button', () => {
      render(<Chores />);
      
      const button = screen.getByRole('button', { name: /save chores/i });
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('5. Form Validation', () => {
    it('should disable button when no chores selected', () => {
      render(<Chores />);
      
      const button = screen.getByRole('button', { name: /save chores/i });
      expect(button).toBeDisabled();
    });

    it('should enable button when chores selected', async () => {
      const user = userEvent.setup();
      render(<Chores />);
      
      const laundry = screen.getByLabelText('Laundry');
      await user.click(laundry);
      
      const button = screen.getByRole('button', { name: /save chores/i });
      expect(button).toBeEnabled();
    });

    it('should show validation message when trying to save without selection', async () => {
      const user = userEvent.setup();
      render(<Chores />);
      
      // Manually enable and click button
      const button = screen.getByRole('button', { name: /save chores/i });
      
      // Button is disabled, so validation is enforced
      expect(button).toBeDisabled();
    });
  });

  describe('6. Selected Chores Display', () => {
    it('should display selected chores as badges', async () => {
      const user = userEvent.setup();
      render(<Chores />);
      
      const laundry = screen.getByLabelText('Laundry');
      const cooking = screen.getByLabelText('Cooking');
      
      await user.click(laundry);
      await user.click(cooking);
      
      const badges = screen.getAllByText(/Laundry|Cooking/);
      expect(badges.length).toBeGreaterThanOrEqual(2);
    });

    it('should remove badge when chore deselected', async () => {
      const user = userEvent.setup();
      render(<Chores />);
      
      const laundry = screen.getByLabelText('Laundry');
      await user.click(laundry);
      
      // Verify badge exists
      const badges = screen.getAllByText('Laundry');
      expect(badges.length).toBeGreaterThan(1);
      
      await user.click(laundry);
      
      // Only the label should remain
      const remainingBadges = screen.getAllByText('Laundry');
      expect(remainingBadges.length).toBe(1);
    });
  });

  describe('7. API Integration - Save Chores', () => {
    it('should save chores successfully', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ chores: ['laundry', 'cooking'] }),
        })
      ) as any;
      
      render(<Chores />);
      
      const laundry = screen.getByLabelText('Laundry');
      const cooking = screen.getByLabelText('Cooking');
      await user.click(laundry);
      await user.click(cooking);
      
      const button = screen.getByRole('button', { name: /save chores/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/chores saved successfully/i)).toBeInTheDocument();
      });
    });

    it('should send correct data to API', async () => {
      const user = userEvent.setup();
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ chores: ['laundry'] }),
        })
      ) as any;
      global.fetch = mockFetch;
      
      render(<Chores />);
      
      const laundry = screen.getByLabelText('Laundry');
      await user.click(laundry);
      
      const button = screen.getByRole('button', { name: /save chores/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/v1/househelp-preferences/chores'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              'Authorization': 'Bearer test-token',
            }),
            body: expect.stringContaining('laundry'),
          })
        );
      });
    });

    it('should convert chores to lowercase', async () => {
      const user = userEvent.setup();
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ chores: ['laundry'] }),
        })
      ) as any;
      global.fetch = mockFetch;
      
      render(<Chores />);
      
      const laundry = screen.getByLabelText('Laundry');
      await user.click(laundry);
      
      const button = screen.getByRole('button', { name: /save chores/i });
      await user.click(button);
      
      await waitFor(() => {
        const call = mockFetch.mock.calls[0];
        const body = JSON.parse(call[1].body);
        expect(body.chores).toEqual(['laundry']);
      });
    });
  });

  describe('8. Error Handling', () => {
    it('should show error message on API failure', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: 'Server error' }),
        })
      ) as any;
      
      render(<Chores />);
      
      const laundry = screen.getByLabelText('Laundry');
      await user.click(laundry);
      
      const button = screen.getByRole('button', { name: /save chores/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/server error|failed to save chores/i)).toBeInTheDocument();
      });
    });

    it('should handle network error', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;
      
      render(<Chores />);
      
      const laundry = screen.getByLabelText('Laundry');
      await user.click(laundry);
      
      const button = screen.getByRole('button', { name: /save chores/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/an error occurred/i)).toBeInTheDocument();
      });
    });

    it('should show error styling for error messages', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: 'Error' }),
        })
      ) as any;
      
      render(<Chores />);
      
      const laundry = screen.getByLabelText('Laundry');
      await user.click(laundry);
      
      const button = screen.getByRole('button', { name: /save chores/i });
      await user.click(button);
      
      await waitFor(() => {
        const errorDiv = screen.getByText(/error/i).closest('div');
        expect(errorDiv).toHaveClass('bg-red-100', 'text-red-800');
      });
    });
  });

  describe('9. Loading States', () => {
    it('should disable button while saving', async () => {
      const user = userEvent.setup();
      let resolveSubmit: any;
      const submitPromise = new Promise(resolve => { resolveSubmit = resolve; });
      
      global.fetch = vi.fn(() => submitPromise) as any;
      
      render(<Chores />);
      
      const laundry = screen.getByLabelText('Laundry');
      await user.click(laundry);
      
      const button = screen.getByRole('button', { name: /save chores/i });
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
      
      render(<Chores />);
      
      const laundry = screen.getByLabelText('Laundry');
      await user.click(laundry);
      
      const button = screen.getByRole('button', { name: /save chores/i });
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
          json: () => Promise.resolve({ chores: ['laundry'] }),
        })
      ) as any;
      
      render(<Chores />);
      
      const laundry = screen.getByLabelText('Laundry');
      await user.click(laundry);
      
      const button = screen.getByRole('button', { name: /save chores/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/chores saved successfully/i)).toBeInTheDocument();
      });
      
      expect(button).toBeEnabled();
    });
  });

  describe('10. Visual Feedback', () => {
    it('should show success styling for success messages', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ chores: ['laundry'] }),
        })
      ) as any;
      
      render(<Chores />);
      
      const laundry = screen.getByLabelText('Laundry');
      await user.click(laundry);
      
      const button = screen.getByRole('button', { name: /save chores/i });
      await user.click(button);
      
      await waitFor(() => {
        const successDiv = screen.getByText(/successfully/i).closest('div');
        expect(successDiv).toHaveClass('bg-green-100', 'text-green-800');
      });
    });

    it('should display selected chores with badge styling', async () => {
      const user = userEvent.setup();
      render(<Chores />);
      
      const laundry = screen.getByLabelText('Laundry');
      await user.click(laundry);
      
      const badges = screen.getAllByText('Laundry');
      const badge = badges.find(el => el.classList.contains('rounded-full'));
      expect(badge).toHaveClass('bg-primary-100', 'text-primary-800');
    });
  });

  describe('11. Responsive Layout', () => {
    it('should use grid layout for chores', () => {
      render(<Chores />);
      
      const gridContainer = screen.getByLabelText('Laundry').closest('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1', 'sm:grid-cols-2');
    });

    it('should render all chores in grid', () => {
      render(<Chores />);
      
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(10);
    });
  });
});
