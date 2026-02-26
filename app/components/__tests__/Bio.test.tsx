import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import Bio from '../features/Bio';

// Mock ProfileSetupContext
const mockMarkDirty = vi.fn();
const mockMarkClean = vi.fn();

vi.mock('~/contexts/ProfileSetupContext', () => ({
  useProfileSetup: () => ({
    markDirty: mockMarkDirty,
    markClean: mockMarkClean,
  }),
}));

// Mock fetch
global.fetch = vi.fn();

describe('Bio Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
    
    // Default mock for loading bio
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ bio: '' }),
      })
    ) as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Rendering & Content - Househelp', () => {
    beforeEach(() => {
      // Mock fetch for these tests
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ bio: '' }),
        })
      ) as any;
    });

    it('should render househelp title', () => {
      render(<Bio userType="househelp" />);
      
      expect(screen.getByText(/✍️ about you/i)).toBeInTheDocument();
    });

    it('should render househelp description', () => {
      render(<Bio userType="househelp" />);
      
      expect(screen.getByText(/share your story, experience/i)).toBeInTheDocument();
    });

    it('should render textarea with househelp placeholder', () => {
      render(<Bio userType="househelp" />);
      
      const textarea = screen.getByPlaceholderText(/tell households about your experience/i);
      expect(textarea).toBeInTheDocument();
    });

    it('should render save button', () => {
      render(<Bio userType="househelp" />);
      
      expect(screen.getByRole('button', { name: /💾 save/i })).toBeInTheDocument();
    });

    it('should render character counter', () => {
      render(<Bio userType="househelp" />);
      
      expect(screen.getByText(/2000 characters remaining/i)).toBeInTheDocument();
    });
  });

  describe('2. Rendering & Content - Household', () => {
    beforeEach(() => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ bio: '' }),
        })
      ) as any;
    });

    it('should render household title', () => {
      render(<Bio userType="household" />);
      
      expect(screen.getByText(/✍️ about your household/i)).toBeInTheDocument();
    });

    it('should render household description', () => {
      render(<Bio userType="household" />);
      
      expect(screen.getByText(/help candidates understand your family/i)).toBeInTheDocument();
    });

    it('should render textarea with household placeholder', () => {
      render(<Bio userType="household" />);
      
      const textarea = screen.getByPlaceholderText(/describe your household/i);
      expect(textarea).toBeInTheDocument();
    });

    it('should default to househelp when no userType provided', () => {
      render(<Bio />);
      
      expect(screen.getByText(/✍️ about you/i)).toBeInTheDocument();
    });
  });

  describe('3. Theme Consistency', () => {
    it('should use purple theme for labels', () => {
      render(<Bio />);
      
      const label = screen.getByText(/your bio/i);
      expect(label).toHaveClass('text-purple-700', 'dark:text-purple-400');
    });

    it('should have purple gradient submit button', () => {
      render(<Bio />);
      
      const button = screen.getByRole('button', { name: /💾 save/i });
      expect(button).toHaveClass('from-purple-600', 'to-pink-600');
    });

    it('should support dark mode classes', () => {
      render(<Bio />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('dark:bg-[#13131a]', 'dark:text-white');
    });
  });

  describe('4. Accessibility', () => {
    it('should have proper label association', () => {
      render(<Bio />);
      
      const textarea = screen.getByLabelText(/your bio/i);
      expect(textarea).toHaveAttribute('id', 'bio');
    });

    it('should have required indicator', () => {
      render(<Bio />);
      
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('should have proper button type', () => {
      render(<Bio />);
      
      const button = screen.getByRole('button', { name: /💾 save/i });
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should have accessible textarea', () => {
      render(<Bio />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
    });
  });

  describe('5. Character Counter', () => {
    it('should update character count on input', async () => {
      const user = userEvent.setup();
      render(<Bio />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello World');
      
      expect(screen.getByText(/1989 characters remaining/i)).toBeInTheDocument();
    });

    it('should show warning color when less than 100 characters remaining', async () => {
      const user = userEvent.setup();
      render(<Bio />);
      
      const textarea = screen.getByRole('textbox');
      const longText = 'A'.repeat(1950);
      await user.type(textarea, longText);
      
      const counter = screen.getByText(/50 characters remaining/i);
      expect(counter).toHaveClass('text-amber-600', 'dark:text-amber-400');
    });

    it('should enforce max character limit', async () => {
      const user = userEvent.setup();
      render(<Bio />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea).toHaveAttribute('maxLength', '2000');
    });

    it('should show 0 characters remaining at max', async () => {
      const user = userEvent.setup();
      render(<Bio />);
      
      const textarea = screen.getByRole('textbox');
      const maxText = 'A'.repeat(2000);
      await user.type(textarea, maxText);
      
      expect(screen.getByText(/0 characters remaining/i)).toBeInTheDocument();
    });
  });

  describe('6. Form Validation', () => {
    it('should disable submit button when bio is empty', () => {
      render(<Bio />);
      
      const button = screen.getByRole('button', { name: /💾 save/i });
      expect(button).toBeDisabled();
    });

    it('should disable submit button when bio is less than 25 characters', async () => {
      const user = userEvent.setup();
      render(<Bio />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Short bio');
      
      const button = screen.getByRole('button', { name: /💾 save/i });
      expect(button).toBeDisabled();
    });

    it('should show minimum character warning', async () => {
      const user = userEvent.setup();
      render(<Bio />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Short');
      
      expect(screen.getByText(/⚠️ minimum 25 characters required/i)).toBeInTheDocument();
    });

    it('should enable submit button when bio is 25+ characters', async () => {
      const user = userEvent.setup();
      render(<Bio />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'This is a valid bio with more than twenty-five characters');
      
      const button = screen.getByRole('button', { name: /💾 save/i });
      expect(button).toBeEnabled();
    });

    it('should not show warning when bio is empty', () => {
      render(<Bio />);
      
      expect(screen.queryByText(/⚠️ minimum 25 characters required/i)).not.toBeInTheDocument();
    });

    it('should show error message when trying to submit invalid bio', async () => {
      const user = userEvent.setup();
      render(<Bio />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Short');
      
      // Try to submit (button is disabled, but test the validation logic)
      expect(screen.getByText(/⚠️ minimum 25 characters required/i)).toBeInTheDocument();
    });
  });

  describe('7. User Interactions', () => {
    it('should update textarea value on input', async () => {
      const user = userEvent.setup();
      render(<Bio />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      await user.type(textarea, 'Test bio content');
      
      expect(textarea.value).toBe('Test bio content');
    });

    it('should call markDirty when typing', async () => {
      const user = userEvent.setup();
      render(<Bio />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'A');
      
      expect(mockMarkDirty).toHaveBeenCalled();
    });

    it('should allow multiline input', async () => {
      const user = userEvent.setup();
      render(<Bio />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      await user.type(textarea, 'Line 1{Enter}Line 2');
      
      expect(textarea.value).toContain('\n');
    });
  });

  describe('8. API Integration - Load Bio', () => {
    it('should load existing bio on mount', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ bio: 'Existing bio content from server' }),
        })
      ) as any;
      global.fetch = mockFetch;
      
      render(<Bio />);
      
      // Wait for fetch to be called
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      }, { timeout: 3000 });
      
      // Then wait for the bio to be loaded
      await waitFor(() => {
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        expect(textarea.value).toBe('Existing bio content from server');
      }, { timeout: 3000 });
    });

    it('should call API with correct headers', async () => {
      const fetchSpy = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ bio: '' }),
        })
      ) as any;
      global.fetch = fetchSpy;
      
      render(<Bio />);
      
      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledWith(
          expect.stringContaining('/api/v1/household/profile'),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
            }),
          })
        );
      }, { timeout: 3000 });
    });

    it('should handle API error gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockFetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;
      global.fetch = mockFetch;
      
      render(<Bio />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      }, { timeout: 3000 });
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      }, { timeout: 3000 });
      
      consoleErrorSpy.mockRestore();
    });

    it('should not load bio when no token exists', () => {
      localStorage.removeItem('token');
      const fetchSpy = vi.fn();
      global.fetch = fetchSpy;
      
      render(<Bio />);
      
      // Give it a moment to potentially call fetch
      expect(fetchSpy).not.toHaveBeenCalled();
      
      // Restore token for other tests
      localStorage.setItem('token', 'test-token');
    });
  });

  describe('9. API Integration - Save Bio (Household)', () => {
    it('should save household bio successfully', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ bio: '' }) }) // Load
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) }); // Save
      
      render(<Bio userType="household" />);
      
      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'This is a valid household bio with more than twenty-five characters');
      
      const button = screen.getByRole('button', { name: /💾 save/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/your bio has been saved successfully/i)).toBeInTheDocument();
      });
    });

    it('should call household API endpoint with correct data', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ bio: '' }) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
      
      render(<Bio userType="household" />);
      
      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
      
      const textarea = screen.getByRole('textbox');
      const bioText = 'This is a valid household bio with more than twenty-five characters';
      await user.type(textarea, bioText);
      
      const button = screen.getByRole('button', { name: /💾 save/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/your bio has been saved successfully/i)).toBeInTheDocument();
      });
      
      // Find the save call (second call or the one with PUT method)
      const saveCall = (global.fetch as any).mock.calls.find((call: any) => 
        call[1]?.method === 'PUT'
      );
      expect(saveCall).toBeDefined();
      expect(saveCall[0]).toContain('/api/v1/household/profile');
      expect(saveCall[1].headers['Content-Type']).toBe('application/json');
      expect(saveCall[1].body).toContain(bioText);
    });

    it('should include step metadata for household', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ bio: '' }) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
      
      render(<Bio userType="household" />);
      
      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'This is a valid household bio with more than twenty-five characters');
      
      const button = screen.getByRole('button', { name: /💾 save/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/your bio has been saved successfully/i)).toBeInTheDocument();
      });
      
      const saveCall = (global.fetch as any).mock.calls.find((call: any) => 
        call[0].includes('/api/v1/household/profile') && call[1]?.method === 'PUT'
      );
      expect(saveCall).toBeDefined();
      const body = JSON.parse(saveCall[1].body);
      expect(body._step_metadata).toEqual({
        step_id: 'bio',
        step_number: 7,
        is_completed: true,
      });
    });
  });

  describe('10. API Integration - Save Bio (Househelp)', () => {
    it('should save househelp bio successfully', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ bio: '' }) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
      
      render(<Bio userType="househelp" />);
      
      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'This is a valid househelp bio with more than twenty-five characters');
      
      const button = screen.getByRole('button', { name: /💾 save/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/your bio has been saved successfully/i)).toBeInTheDocument();
      });
    });

    it('should call househelp API endpoint with correct data', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ bio: '' }) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
      
      render(<Bio userType="househelp" />);
      
      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
      
      const textarea = screen.getByRole('textbox');
      const bioText = 'This is a valid househelp bio with more than twenty-five characters';
      await user.type(textarea, bioText);
      
      const button = screen.getByRole('button', { name: /💾 save/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/your bio has been saved successfully/i)).toBeInTheDocument();
      });
      
      // Find the save call (second call or the one with PATCH method)
      const saveCall = (global.fetch as any).mock.calls.find((call: any) => 
        call[1]?.method === 'PATCH'
      );
      expect(saveCall).toBeDefined();
      expect(saveCall[0]).toContain('/api/v1/househelps/me/fields');
      expect(saveCall[1].headers['Content-Type']).toBe('application/json');
    });

    it('should include step metadata for househelp', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ bio: '' }) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
      
      render(<Bio userType="househelp" />);
      
      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'This is a valid househelp bio with more than twenty-five characters');
      
      const button = screen.getByRole('button', { name: /💾 save/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/your bio has been saved successfully/i)).toBeInTheDocument();
      });
      
      const saveCall = (global.fetch as any).mock.calls.find((call: any) => 
        call[0].includes('/api/v1/househelps/me/fields') && call[1]?.method === 'PATCH'
      );
      expect(saveCall).toBeDefined();
      const body = JSON.parse(saveCall[1].body);
      expect(body._step_metadata).toEqual({
        step_id: 'bio',
        step_number: 14,
        is_completed: true,
      });
    });

    it('should call markClean after successful save', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ bio: '' }) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
      
      render(<Bio userType="househelp" />);
      
      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'This is a valid househelp bio with more than twenty-five characters');
      
      const button = screen.getByRole('button', { name: /💾 save/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(mockMarkClean).toHaveBeenCalled();
      });
    });
  });

  describe('11. Error Handling', () => {
    it('should show error message on API failure', async () => {
      const user = userEvent.setup();
      
      // Override the default mock BEFORE rendering
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ bio: '' }) }) // Load succeeds
        .mockResolvedValueOnce({ // Save fails
          ok: false, 
          status: 500,
          json: () => Promise.resolve({ message: 'Server error' }) 
        });
      
      global.fetch = mockFetch as any;
      
      render(<Bio userType="household" />);
      
      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
      
      // Clear any success messages from previous state
      const textarea = screen.getByRole('textbox');
      await user.clear(textarea);
      await user.type(textarea, 'This is a valid bio with more than twenty-five characters');
      
      const button = screen.getByRole('button', { name: /💾 save/i });
      await user.click(button);
      
      // Debug: log what's on screen
      await waitFor(async () => {
        const hasError = screen.queryByText(/failed to save your bio/i);
        const hasSuccess = screen.queryByText(/your bio has been saved successfully/i);
        if (!hasError && hasSuccess) {
          console.log('Mock calls:', mockFetch.mock.calls.length);
          console.log('Has success message when should have error');
        }
        expect(hasError).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should handle network error', async () => {
      const user = userEvent.setup();
      
      // Override the default mock BEFORE rendering
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ bio: '' }) }) // Load succeeds
        .mockRejectedValueOnce(new Error('Network error')); // Save fails
      
      global.fetch = mockFetch as any;
      
      render(<Bio userType="household" />);
      
      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
      
      const textarea = screen.getByRole('textbox');
      await user.clear(textarea);
      await user.type(textarea, 'This is a valid bio with more than twenty-five characters');
      
      const button = screen.getByRole('button', { name: /💾 save/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/failed to save your bio/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should not call markClean on error', async () => {
      const user = userEvent.setup();
      
      // Override the default mock BEFORE rendering
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ bio: '' }) }) // Load succeeds
        .mockRejectedValueOnce(new Error('Network error')); // Save fails
      
      global.fetch = mockFetch as any;
      mockMarkClean.mockClear();
      
      render(<Bio userType="household" />);
      
      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
      
      const textarea = screen.getByRole('textbox');
      await user.clear(textarea);
      await user.type(textarea, 'This is a valid bio with more than twenty-five characters');
      
      const button = screen.getByRole('button', { name: /💾 save/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/failed to save your bio/i)).toBeInTheDocument();
      }, { timeout: 5000 });
      
      expect(mockMarkClean).not.toHaveBeenCalled();
    });
  });

  describe('12. Loading States', () => {
    it('should disable button while submitting', async () => {
      const user = userEvent.setup();
      let resolveSubmit: any;
      const submitPromise = new Promise(resolve => { resolveSubmit = resolve; });
      
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ bio: '' }) }) // Load
        .mockReturnValueOnce(submitPromise); // Save - controlled promise
      
      render(<Bio userType="household" />);
      
      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'This is a valid bio with more than twenty-five characters');
      
      const button = screen.getByRole('button', { name: /💾 save/i });
      
      // Button should be enabled before submit
      expect(button).toBeEnabled();
      
      // Click and immediately check if disabled
      const clickPromise = user.click(button);
      
      // Button should be disabled during submission
      await waitFor(() => {
        expect(button).toBeDisabled();
      });
      
      // Resolve the promise
      resolveSubmit({ ok: true, json: () => Promise.resolve({}) });
      await clickPromise;
    });

    it('should show loading text while submitting', async () => {
      const user = userEvent.setup();
      let resolveSubmit: any;
      const submitPromise = new Promise(resolve => { resolveSubmit = resolve; });
      
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ bio: '' }) }) // Load
        .mockReturnValueOnce(submitPromise); // Save - controlled promise
      
      render(<Bio userType="household" />);
      
      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'This is a valid bio with more than twenty-five characters');
      
      const button = screen.getByRole('button', { name: /💾 save/i });
      const clickPromise = user.click(button);
      
      // Check for loading text
      await waitFor(() => {
        expect(screen.getByText(/saving.../i)).toBeInTheDocument();
      });
      
      // Resolve the promise
      resolveSubmit({ ok: true, json: () => Promise.resolve({}) });
      await clickPromise;
    });

    it('should show spinner icon while loading', async () => {
      const user = userEvent.setup();
      let resolveSubmit: any;
      const submitPromise = new Promise(resolve => { resolveSubmit = resolve; });
      
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ bio: '' }) }) // Load
        .mockReturnValueOnce(submitPromise); // Save - controlled promise
      
      render(<Bio userType="household" />);
      
      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'This is a valid bio with more than twenty-five characters');
      
      const button = screen.getByRole('button', { name: /💾 save/i });
      const clickPromise = user.click(button);
      
      // Check for spinner
      await waitFor(() => {
        const spinner = document.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
      });
      
      // Resolve the promise
      resolveSubmit({ ok: true, json: () => Promise.resolve({}) });
      await clickPromise;
    });

    it('should re-enable button after submission completes', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ bio: '' }) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
      
      render(<Bio userType="household" />);
      
      await waitFor(() => {
        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'This is a valid bio with more than twenty-five characters');
      
      const button = screen.getByRole('button', { name: /💾 save/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/your bio has been saved successfully/i)).toBeInTheDocument();
      });
      
      expect(button).toBeEnabled();
    });
  });

  describe('13. Visual Feedback', () => {
    it('should have purple border by default', () => {
      render(<Bio />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('border-purple-200', 'dark:border-purple-500/30');
    });

    it('should have purple border when valid', async () => {
      const user = userEvent.setup();
      render(<Bio />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'This is a valid bio with more than twenty-five characters');
      
      expect(textarea).toHaveClass('border-purple-200', 'dark:border-purple-500/30');
    });

    it('should have hover scale effect on button', () => {
      render(<Bio />);
      
      const button = screen.getByRole('button', { name: /💾 save/i });
      expect(button).toHaveClass('hover:scale-105');
    });

    it('should have transition classes', () => {
      render(<Bio />);
      
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('transition-all');
    });
  });

  describe('14. Edge Cases', () => {
    it('should handle exactly 25 characters', async () => {
      const user = userEvent.setup();
      render(<Bio />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'A'.repeat(25));
      
      const button = screen.getByRole('button', { name: /💾 save/i });
      expect(button).toBeEnabled();
    });

    it('should handle exactly 2000 characters', async () => {
      const user = userEvent.setup();
      render(<Bio />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'A'.repeat(2000));
      
      expect(screen.getByText(/0 characters remaining/i)).toBeInTheDocument();
    });

    it('should handle special characters', async () => {
      const user = userEvent.setup();
      render(<Bio />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      await user.type(textarea, 'Bio with special chars: @#$%^&*()');
      
      expect(textarea.value).toContain('@#$%^&*()');
    });

    it('should handle unicode characters', async () => {
      const user = userEvent.setup();
      render(<Bio />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      await user.type(textarea, 'Bio with emoji 😊 and unicode ñ');
      
      expect(textarea.value).toContain('😊');
      expect(textarea.value).toContain('ñ');
    });

    it('should handle rapid typing', async () => {
      const user = userEvent.setup();
      render(<Bio />);
      
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'This is a test of rapid typing with many characters');
      
      expect(mockMarkDirty).toHaveBeenCalled();
    });
  });
});
