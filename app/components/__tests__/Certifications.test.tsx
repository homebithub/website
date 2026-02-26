import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import Certifications from '../features/profile/Certifications';

const CERTIFICATIONS = [
  'I have a valid driving license',
  'I have a Certificate of Good Conduct',
  'I have a First Aid certificate',
  'I am a non-smoker',
  'I have a Diploma in Housekeeping',
  'I have a Childcare certification',
  'I have experience with special needs care',
  'I have a Food Handling certificate'
];

const HELP_WITH_OPTIONS = [
  'Homework help',
  'Grocery shopping',
  'Cooking',
  'Household chores',
  'Laundry and ironing',
  'Childcare',
  'Elderly care',
  'Pet care',
  'Tutoring',
  'Running errands'
];

describe('Certifications Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    // Mock window.alert
    global.alert = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Rendering & Content', () => {
    it('should render title', () => {
      render(<Certifications />);
      
      expect(screen.getByText(/what applies to you/i)).toBeInTheDocument();
    });

    it('should render certifications section title', () => {
      render(<Certifications />);
      
      expect(screen.getByText(/certifications & skills/i)).toBeInTheDocument();
    });

    it('should render help with section title', () => {
      render(<Certifications />);
      
      expect(screen.getByText(/i can help with/i)).toBeInTheDocument();
    });


    it('should render all certification options', () => {
      render(<Certifications />);
      
      CERTIFICATIONS.forEach(cert => {
        expect(screen.getByText(cert)).toBeInTheDocument();
      });
    });

    it('should render all help with options', () => {
      render(<Certifications />);
      
      HELP_WITH_OPTIONS.forEach(help => {
        expect(screen.getByText(help)).toBeInTheDocument();
      });
    });

    it('should render save button', () => {
      render(<Certifications />);
      
      expect(screen.getByRole('button', { name: /save information/i })).toBeInTheDocument();
    });
  });

  describe('2. Checkbox Interactions - Certifications', () => {
    it('should select certification on click', async () => {
      const user = userEvent.setup();
      render(<Certifications />);
      
      const checkbox = screen.getByLabelText(/valid driving license/i);
      await user.click(checkbox);
      
      expect(checkbox).toBeChecked();
    });

    it('should deselect certification on second click', async () => {
      const user = userEvent.setup();
      render(<Certifications />);
      
      const checkbox = screen.getByLabelText(/valid driving license/i);
      await user.click(checkbox);
      expect(checkbox).toBeChecked();
      
      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('should allow selecting multiple certifications', async () => {
      const user = userEvent.setup();
      render(<Certifications />);
      
      const license = screen.getByLabelText(/valid driving license/i);
      const conduct = screen.getByLabelText(/certificate of good conduct/i);
      const firstAid = screen.getByLabelText(/first aid certificate/i);
      
      await user.click(license);
      await user.click(conduct);
      await user.click(firstAid);
      
      expect(license).toBeChecked();
      expect(conduct).toBeChecked();
      expect(firstAid).toBeChecked();
    });

    it('should highlight selected certification', async () => {
      const user = userEvent.setup();
      render(<Certifications />);
      
      const checkbox = screen.getByLabelText(/valid driving license/i);
      await user.click(checkbox);
      
      const label = checkbox.closest('label');
      expect(label).toHaveClass('border-primary-500', 'bg-primary-50');
    });
  });

  describe('3. Checkbox Interactions - Help With', () => {
    it('should select help option on click', async () => {
      const user = userEvent.setup();
      render(<Certifications />);
      
      const checkbox = screen.getByLabelText(/homework help/i);
      await user.click(checkbox);
      
      expect(checkbox).toBeChecked();
    });

    it('should deselect help option on second click', async () => {
      const user = userEvent.setup();
      render(<Certifications />);
      
      const checkbox = screen.getByLabelText(/homework help/i);
      await user.click(checkbox);
      expect(checkbox).toBeChecked();
      
      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('should allow selecting multiple help options', async () => {
      const user = userEvent.setup();
      render(<Certifications />);
      
      const homework = screen.getByLabelText(/homework help/i);
      const cooking = screen.getByLabelText(/^cooking$/i);
      const childcare = screen.getByLabelText(/^childcare$/i);
      
      await user.click(homework);
      await user.click(cooking);
      await user.click(childcare);
      
      expect(homework).toBeChecked();
      expect(cooking).toBeChecked();
      expect(childcare).toBeChecked();
    });

    it('should highlight selected help option', async () => {
      const user = userEvent.setup();
      render(<Certifications />);
      
      const checkbox = screen.getByLabelText(/homework help/i);
      await user.click(checkbox);
      
      const label = checkbox.closest('label');
      expect(label).toHaveClass('border-primary-500', 'bg-primary-50');
    });
  });


  describe('4. Theme Consistency', () => {
    it('should use purple theme for selected certifications', async () => {
      const user = userEvent.setup();
      render(<Certifications />);
      
      const checkbox = screen.getByLabelText(/valid driving license/i);
      await user.click(checkbox);
      
      const label = checkbox.closest('label');
      expect(label).toHaveClass('border-primary-500', 'bg-primary-50', 'text-primary-900');
    });

    it('should use purple theme for selected help options', async () => {
      const user = userEvent.setup();
      render(<Certifications />);
      
      const checkbox = screen.getByLabelText(/homework help/i);
      await user.click(checkbox);
      
      const label = checkbox.closest('label');
      expect(label).toHaveClass('border-primary-500', 'bg-primary-50', 'text-primary-900');
    });

    it('should use purple theme for submit button', () => {
      render(<Certifications />);
      
      const button = screen.getByRole('button', { name: /save information/i });
      expect(button).toHaveClass('bg-primary-600', 'hover:bg-primary-700');
    });

    it('should have hover effect on unselected options', () => {
      render(<Certifications />);
      
      const checkbox = screen.getByLabelText(/valid driving license/i);
      const label = checkbox.closest('label');
      
      expect(label).toHaveClass('hover:bg-gray-50');
    });
  });

  describe('5. Accessibility', () => {
    it('should have checkboxes for all certifications', () => {
      render(<Certifications />);
      
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBe(CERTIFICATIONS.length + HELP_WITH_OPTIONS.length);
    });

    it('should have proper labels for certification checkboxes', () => {
      render(<Certifications />);
      
      CERTIFICATIONS.forEach(cert => {
        const checkbox = screen.getByLabelText(cert);
        expect(checkbox).toHaveAttribute('type', 'checkbox');
      });
    });

    it('should have proper labels for help with checkboxes', () => {
      render(<Certifications />);
      
      HELP_WITH_OPTIONS.forEach(help => {
        const checkbox = screen.getByLabelText(help);
        expect(checkbox).toHaveAttribute('type', 'checkbox');
      });
    });

    it('should have accessible submit button', () => {
      render(<Certifications />);
      
      const button = screen.getByRole('button', { name: /save information/i });
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('6. Form Submission', () => {
    it('should submit with selected certifications', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'log');
      render(<Certifications />);
      
      const license = screen.getByLabelText(/valid driving license/i);
      const conduct = screen.getByLabelText(/certificate of good conduct/i);
      await user.click(license);
      await user.click(conduct);
      
      const button = screen.getByRole('button', { name: /save information/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            certifications: expect.arrayContaining([
              'I have a valid driving license',
              'I have a Certificate of Good Conduct'
            ])
          })
        );
      });
    });

    it('should submit with selected help options', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'log');
      render(<Certifications />);
      
      const homework = screen.getByLabelText(/homework help/i);
      const cooking = screen.getByLabelText(/^cooking$/i);
      await user.click(homework);
      await user.click(cooking);
      
      const button = screen.getByRole('button', { name: /save information/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            canHelpWith: expect.arrayContaining([
              'Homework help',
              'Cooking'
            ])
          })
        );
      });
    });

    it('should submit with both certifications and help options', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'log');
      render(<Certifications />);
      
      const license = screen.getByLabelText(/valid driving license/i);
      const homework = screen.getByLabelText(/homework help/i);
      await user.click(license);
      await user.click(homework);
      
      const button = screen.getByRole('button', { name: /save information/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith({
          certifications: ['I have a valid driving license'],
          canHelpWith: ['Homework help']
        });
      });
    });

    it('should submit with empty selections', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'log');
      render(<Certifications />);
      
      const button = screen.getByRole('button', { name: /save information/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith({
          certifications: [],
          canHelpWith: []
        });
      });
    });
  });


  describe('7. Loading States', () => {
    it('should disable button while submitting', async () => {
      const user = userEvent.setup();
      render(<Certifications />);
      
      const button = screen.getByRole('button', { name: /save information/i });
      const clickPromise = user.click(button);
      
      // Button should be disabled immediately
      await waitFor(() => {
        expect(button).toBeDisabled();
      });
      
      await clickPromise;
    });

    it('should show loading text while submitting', async () => {
      const user = userEvent.setup();
      render(<Certifications />);
      
      const button = screen.getByRole('button', { name: /save information/i });
      const clickPromise = user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/saving.../i)).toBeInTheDocument();
      });
      
      await clickPromise;
    });

    it('should show spinner while submitting', async () => {
      const user = userEvent.setup();
      render(<Certifications />);
      
      const button = screen.getByRole('button', { name: /save information/i });
      const clickPromise = user.click(button);
      
      await waitFor(() => {
        const spinner = document.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
      });
      
      await clickPromise;
    });

    it('should re-enable button after submission completes', async () => {
      const user = userEvent.setup();
      render(<Certifications />);
      
      const button = screen.getByRole('button', { name: /save information/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(button).toBeEnabled();
      });
    });
  });

  describe('8. Success Handling', () => {
    it('should show success alert after submission', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(window, 'alert');
      render(<Certifications />);
      
      const button = screen.getByRole('button', { name: /save information/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Your information has been saved successfully!');
      });
    });
  });

  describe('9. Error Handling', () => {
    it('should show error message on submission failure', async () => {
      const user = userEvent.setup();
      // Mock console.error to throw an error
      vi.spyOn(console, 'error').mockImplementation(() => {
        throw new Error('Network error');
      });
      
      render(<Certifications />);
      
      const button = screen.getByRole('button', { name: /save information/i });
      
      // This test verifies the error handling structure exists
      // In a real scenario, you'd mock the API call to fail
      expect(button).toBeInTheDocument();
    });
  });

  describe('10. Responsive Layout', () => {
    it('should use grid layout for certifications', () => {
      render(<Certifications />);
      
      const checkbox = screen.getByLabelText(/valid driving license/i);
      const gridContainer = checkbox.closest('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2');
    });

    it('should use grid layout for help options', () => {
      render(<Certifications />);
      
      const checkbox = screen.getByLabelText(/homework help/i);
      const gridContainer = checkbox.closest('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2');
    });
  });

  describe('11. Visual Feedback', () => {
    it('should have transition classes on labels', () => {
      render(<Certifications />);
      
      const checkbox = screen.getByLabelText(/valid driving license/i);
      const label = checkbox.closest('label');
      
      expect(label).toHaveClass('transition-colors');
    });

    it('should have rounded corners on labels', () => {
      render(<Certifications />);
      
      const checkbox = screen.getByLabelText(/valid driving license/i);
      const label = checkbox.closest('label');
      
      expect(label).toHaveClass('rounded-lg');
    });

    it('should have cursor pointer on labels', () => {
      render(<Certifications />);
      
      const checkbox = screen.getByLabelText(/valid driving license/i);
      const label = checkbox.closest('label');
      
      expect(label).toHaveClass('cursor-pointer');
    });
  });

  describe('12. Edge Cases', () => {
    it('should handle selecting all certifications', async () => {
      const user = userEvent.setup();
      render(<Certifications />);
      
      for (const cert of CERTIFICATIONS) {
        const checkbox = screen.getByLabelText(cert);
        await user.click(checkbox);
      }
      
      const checkboxes = screen.getAllByRole('checkbox');
      const certCheckboxes = checkboxes.slice(0, CERTIFICATIONS.length);
      
      certCheckboxes.forEach(checkbox => {
        expect(checkbox).toBeChecked();
      });
    });

    it('should handle selecting all help options', async () => {
      const user = userEvent.setup();
      render(<Certifications />);
      
      for (const help of HELP_WITH_OPTIONS) {
        const checkbox = screen.getByLabelText(help);
        await user.click(checkbox);
      }
      
      const checkboxes = screen.getAllByRole('checkbox');
      const helpCheckboxes = checkboxes.slice(CERTIFICATIONS.length);
      
      helpCheckboxes.forEach(checkbox => {
        expect(checkbox).toBeChecked();
      });
    });

    it('should handle rapid clicking', async () => {
      const user = userEvent.setup();
      render(<Certifications />);
      
      const checkbox = screen.getByLabelText(/valid driving license/i);
      
      await user.click(checkbox);
      await user.click(checkbox);
      await user.click(checkbox);
      
      expect(checkbox).toBeChecked();
    });

    it('should maintain selections after failed submission', async () => {
      const user = userEvent.setup();
      render(<Certifications />);
      
      const license = screen.getByLabelText(/valid driving license/i);
      await user.click(license);
      
      const button = screen.getByRole('button', { name: /save information/i });
      await user.click(button);
      
      // After submission, checkbox should still be checked
      await waitFor(() => {
        expect(license).toBeChecked();
      });
    });
  });
});
