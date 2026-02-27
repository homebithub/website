import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import EmergencyContact from '../features/profile/EmergencyContact';

const RELATIONSHIPS = ['Father', 'Mother', 'Sibling', 'Other'];

describe('EmergencyContact Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Rendering & Content', () => {
    it('should render main title', () => {
      render(<EmergencyContact />);
      
      expect(screen.getByText(/emergency contact information/i)).toBeInTheDocument();
    });

    it('should render emergency contact section title', () => {
      render(<EmergencyContact />);
      
      expect(screen.getByText(/^emergency contact$/i)).toBeInTheDocument();
    });

    it('should render privacy notice', () => {
      render(<EmergencyContact />);
      
      expect(screen.getByText(/we will not share this information/i)).toBeInTheDocument();
    });

    it('should render name input', () => {
      render(<EmergencyContact />);
      
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    });

    it('should render phone input', () => {
      render(<EmergencyContact />);
      
      const phoneInputs = screen.getAllByLabelText(/phone number/i);
      expect(phoneInputs[0]).toBeInTheDocument(); // Emergency phone
    });

    it('should render relationship section', () => {
      render(<EmergencyContact />);
      
      expect(screen.getByText(/^relationship$/i)).toBeInTheDocument();
    });

    it('should render all relationship options', () => {
      render(<EmergencyContact />);
      
      RELATIONSHIPS.forEach(rel => {
        expect(screen.getByText(rel)).toBeInTheDocument();
      });
    });

    it('should render references section', () => {
      render(<EmergencyContact />);
      
      expect(screen.getByText(/references \(optional\)/i)).toBeInTheDocument();
    });

    it('should render add reference button', () => {
      render(<EmergencyContact />);
      
      expect(screen.getByRole('button', { name: /\+ add reference/i })).toBeInTheDocument();
    });

    it('should render one reference by default', () => {
      render(<EmergencyContact />);
      
      expect(screen.getByText(/reference 1/i)).toBeInTheDocument();
    });

    it('should render save button', () => {
      render(<EmergencyContact />);
      
      expect(screen.getByRole('button', { name: /save information/i })).toBeInTheDocument();
    });

    it('should show required indicators', () => {
      render(<EmergencyContact />);
      
      const requiredMarkers = screen.getAllByText('*');
      expect(requiredMarkers.length).toBeGreaterThanOrEqual(3);
    });
  });


  describe('2. Text Input Interactions', () => {
    it('should accept name input', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
      await user.type(nameInput, 'John Doe');
      
      expect(nameInput.value).toBe('John Doe');
    });

    it('should accept phone input', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const phoneInputs = screen.getAllByLabelText(/phone number/i);
      const phoneInput = phoneInputs[0] as HTMLInputElement;
      await user.type(phoneInput, '+254712345678');
      
      expect(phoneInput.value).toBe('+254712345678');
    });

    it('should clear name input', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
      await user.type(nameInput, 'John Doe');
      await user.clear(nameInput);
      
      expect(nameInput.value).toBe('');
    });

    it('should clear phone input', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const phoneInputs = screen.getAllByLabelText(/phone number/i);
      const phoneInput = phoneInputs[0] as HTMLInputElement;
      await user.type(phoneInput, '+254712345678');
      await user.clear(phoneInput);
      
      expect(phoneInput.value).toBe('');
    });
  });

  describe('3. Radio Button Interactions', () => {
    it('should have Father selected by default', () => {
      render(<EmergencyContact />);
      
      const father = screen.getByLabelText(/father/i);
      expect(father).toBeChecked();
    });

    it('should select Mother relationship', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const mother = screen.getByLabelText(/mother/i);
      await user.click(mother);
      
      expect(mother).toBeChecked();
    });

    it('should select Sibling relationship', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const sibling = screen.getByLabelText(/sibling/i);
      await user.click(sibling);
      
      expect(sibling).toBeChecked();
    });

    it('should select Other relationship', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const other = screen.getByRole('radio', { name: 'Other' });
      await user.click(other);
      
      expect(other).toBeChecked();
    });

    it('should switch between relationships', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const father = screen.getByLabelText(/father/i);
      const mother = screen.getByLabelText(/mother/i);
      
      expect(father).toBeChecked();
      
      await user.click(mother);
      expect(mother).toBeChecked();
      expect(father).not.toBeChecked();
    });

    it('should highlight selected relationship', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const mother = screen.getByLabelText(/mother/i);
      await user.click(mother);
      
      const label = mother.closest('label');
      expect(label).toHaveClass('border-primary-500', 'bg-primary-50');
    });
  });

  describe('4. References - Add/Remove', () => {
    it('should add a second reference', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const addButton = screen.getByRole('button', { name: /\+ add reference/i });
      await user.click(addButton);
      
      expect(screen.getByText(/reference 1/i)).toBeInTheDocument();
      expect(screen.getByText(/reference 2/i)).toBeInTheDocument();
    });

    it('should add multiple references', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const addButton = screen.getByRole('button', { name: /\+ add reference/i });
      await user.click(addButton);
      await user.click(addButton);
      await user.click(addButton);
      
      expect(screen.getByText(/reference 1/i)).toBeInTheDocument();
      expect(screen.getByText(/reference 2/i)).toBeInTheDocument();
      expect(screen.getByText(/reference 3/i)).toBeInTheDocument();
      expect(screen.getByText(/reference 4/i)).toBeInTheDocument();
    });

    it('should not show remove button for single reference', () => {
      render(<EmergencyContact />);
      
      expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();
    });

    it('should show remove button when multiple references exist', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const addButton = screen.getByRole('button', { name: /\+ add reference/i });
      await user.click(addButton);
      
      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      expect(removeButtons.length).toBe(2);
    });

    it('should remove a reference', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const addButton = screen.getByRole('button', { name: /\+ add reference/i });
      await user.click(addButton);
      await user.click(addButton);
      
      expect(screen.getByText(/reference 3/i)).toBeInTheDocument();
      
      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      await user.click(removeButtons[1]);
      
      expect(screen.queryByText(/reference 3/i)).not.toBeInTheDocument();
    });

    it('should not remove last reference', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const addButton = screen.getByRole('button', { name: /\+ add reference/i });
      await user.click(addButton);
      
      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      await user.click(removeButtons[0]);
      await user.click(removeButtons[1]);
      
      // Should still have one reference
      expect(screen.getByText(/reference 1/i)).toBeInTheDocument();
    });
  });


  describe('5. References - Input Interactions', () => {
    it('should accept reference name input', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const nameInput = screen.getByLabelText(/^name$/i) as HTMLInputElement;
      await user.type(nameInput, 'Jane Smith');
      
      expect(nameInput.value).toBe('Jane Smith');
    });

    it('should accept reference phone input', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const phoneInputs = screen.getAllByLabelText(/phone number/i);
      const refPhone = phoneInputs[1] as HTMLInputElement; // Second phone input (first is emergency)
      await user.type(refPhone, '+254798765432');
      
      expect(refPhone.value).toBe('+254798765432');
    });

    it('should handle multiple reference inputs independently', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const addButton = screen.getByRole('button', { name: /\+ add reference/i });
      await user.click(addButton);
      
      const nameInputs = screen.getAllByLabelText(/^name$/i);
      await user.type(nameInputs[0], 'Reference One');
      await user.type(nameInputs[1], 'Reference Two');
      
      expect((nameInputs[0] as HTMLInputElement).value).toBe('Reference One');
      expect((nameInputs[1] as HTMLInputElement).value).toBe('Reference Two');
    });
  });

  describe('6. Form Validation', () => {
    it('should show error when name is empty', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const phoneInputs = screen.getAllByLabelText(/phone number/i);
      const phoneInput = phoneInputs[0];
      await user.type(phoneInput, '+254712345678');
      
      const button = screen.getByRole('button', { name: /save information/i });
      await user.click(button);
      
      expect(screen.getByText(/please fill in all required fields/i)).toBeInTheDocument();
    });

    it('should show error when phone is empty', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      await user.type(nameInput, 'John Doe');
      
      const button = screen.getByRole('button', { name: /save information/i });
      await user.click(button);
      
      expect(screen.getByText(/please fill in all required fields/i)).toBeInTheDocument();
    });

    it('should show error when both fields are empty', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const button = screen.getByRole('button', { name: /save information/i });
      await user.click(button);
      
      expect(screen.getByText(/please fill in all required fields/i)).toBeInTheDocument();
    });

    it('should not show error when all required fields filled', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      const phoneInputs = screen.getAllByLabelText(/phone number/i);
      const phoneInput = phoneInputs[0];
      
      await user.type(nameInput, 'John Doe');
      await user.type(phoneInput, '+254712345678');
      
      const button = screen.getByRole('button', { name: /save information/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.queryByText(/please fill in all required fields/i)).not.toBeInTheDocument();
      });
    });

    it('should trim whitespace in validation', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      const phoneInputs = screen.getAllByLabelText(/phone number/i);
      const phoneInput = phoneInputs[0];
      
      await user.type(nameInput, '   ');
      await user.type(phoneInput, '   ');
      
      const button = screen.getByRole('button', { name: /save information/i });
      await user.click(button);
      
      expect(screen.getByText(/please fill in all required fields/i)).toBeInTheDocument();
    });
  });

  describe('7. Form Submission', () => {
    it('should submit with emergency contact data', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'log');
      render(<EmergencyContact />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      const phoneInputs = screen.getAllByLabelText(/phone number/i);
      const phoneInput = phoneInputs[0];
      
      await user.type(nameInput, 'John Doe');
      await user.type(phoneInput, '+254712345678');
      
      const button = screen.getByRole('button', { name: /save information/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            emergencyContact: {
              name: 'John Doe',
              phone: '+254712345678',
              relationship: 'Father'
            }
          })
        );
      });
    });

    it('should submit with selected relationship', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'log');
      render(<EmergencyContact />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      const phoneInputs = screen.getAllByLabelText(/phone number/i);
      const phoneInput = phoneInputs[0];
      const mother = screen.getByLabelText(/mother/i);
      
      await user.type(nameInput, 'Jane Doe');
      await user.type(phoneInput, '+254712345678');
      await user.click(mother);
      
      const button = screen.getByRole('button', { name: /save information/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            emergencyContact: expect.objectContaining({
              relationship: 'Mother'
            })
          })
        );
      });
    });

    it('should submit with filled references', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'log');
      render(<EmergencyContact />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      const phoneInputs = screen.getAllByLabelText(/phone number/i);
      const phoneInput = phoneInputs[0];
      
      await user.type(nameInput, 'John Doe');
      await user.type(phoneInput, '+254712345678');
      
      const refNameInput = screen.getByLabelText(/^name$/i);
      const refPhoneInputs = screen.getAllByLabelText(/phone number/i);
      
      await user.type(refNameInput, 'Reference Person');
      await user.type(refPhoneInputs[1], '+254798765432');
      
      const button = screen.getByRole('button', { name: /save information/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            references: [
              { name: 'Reference Person', phone: '+254798765432' }
            ]
          })
        );
      });
    });

    it('should filter out empty references', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'log');
      render(<EmergencyContact />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      const phoneInputs = screen.getAllByLabelText(/phone number/i);
      const phoneInput = phoneInputs[0];
      
      await user.type(nameInput, 'John Doe');
      await user.type(phoneInput, '+254712345678');
      
      const addButton = screen.getByRole('button', { name: /\+ add reference/i });
      await user.click(addButton);
      
      const button = screen.getByRole('button', { name: /save information/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            references: []
          })
        );
      });
    });
  });


  describe('8. Loading States', () => {
    it('should disable button while submitting', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      const phoneInputs = screen.getAllByLabelText(/phone number/i);
      const phoneInput = phoneInputs[0];
      
      await user.type(nameInput, 'John Doe');
      await user.type(phoneInput, '+254712345678');
      
      const button = screen.getByRole('button', { name: /save information/i });
      const clickPromise = user.click(button);
      
      await waitFor(() => {
        expect(button).toBeDisabled();
      });
      
      await clickPromise;
    });

    it('should show loading text while submitting', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      const phoneInputs = screen.getAllByLabelText(/phone number/i);
      const phoneInput = phoneInputs[0];
      
      await user.type(nameInput, 'John Doe');
      await user.type(phoneInput, '+254712345678');
      
      const button = screen.getByRole('button', { name: /save information/i });
      const clickPromise = user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/saving.../i)).toBeInTheDocument();
      });
      
      await clickPromise;
    });

    it('should show spinner while submitting', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      const phoneInputs = screen.getAllByLabelText(/phone number/i);
      const phoneInput = phoneInputs[0];
      
      await user.type(nameInput, 'John Doe');
      await user.type(phoneInput, '+254712345678');
      
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
      render(<EmergencyContact />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      const phoneInputs = screen.getAllByLabelText(/phone number/i);
      const phoneInput = phoneInputs[0];
      
      await user.type(nameInput, 'John Doe');
      await user.type(phoneInput, '+254712345678');
      
      const button = screen.getByRole('button', { name: /save information/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(button).toBeEnabled();
      }, { timeout: 2000 });
    });
  });

  describe('9. Success Handling', () => {
    it('should show success message after submission', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      const phoneInputs = screen.getAllByLabelText(/phone number/i);
      const phoneInput = phoneInputs[0];
      
      await user.type(nameInput, 'John Doe');
      await user.type(phoneInput, '+254712345678');
      
      const button = screen.getByRole('button', { name: /save information/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/your emergency contact information has been saved successfully/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should show success styling', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      const phoneInputs = screen.getAllByLabelText(/phone number/i);
      const phoneInput = phoneInputs[0];
      
      await user.type(nameInput, 'John Doe');
      await user.type(phoneInput, '+254712345678');
      
      const button = screen.getByRole('button', { name: /save information/i });
      await user.click(button);
      
      await waitFor(() => {
        const successDiv = screen.getByText(/saved successfully/i).closest('div');
        expect(successDiv).toHaveClass('bg-green-50', 'text-green-700');
      }, { timeout: 2000 });
    });

    it('should clear error on successful submission', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      // First trigger error
      const button = screen.getByRole('button', { name: /save information/i });
      await user.click(button);
      expect(screen.getByText(/please fill in all required fields/i)).toBeInTheDocument();
      
      // Then submit successfully
      const nameInput = screen.getByLabelText(/full name/i);
      const phoneInputs = screen.getAllByLabelText(/phone number/i);
      const phoneInput = phoneInputs[0];
      
      await user.type(nameInput, 'John Doe');
      await user.type(phoneInput, '+254712345678');
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.queryByText(/please fill in all required fields/i)).not.toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('10. Error Handling', () => {
    it('should show error styling', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const button = screen.getByRole('button', { name: /save information/i });
      await user.click(button);
      
      const errorDiv = screen.getByText(/please fill in all required fields/i).closest('div');
      expect(errorDiv).toHaveClass('bg-red-50', 'text-red-700');
    });

    it('should clear success on new error', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      const phoneInputs = screen.getAllByLabelText(/phone number/i);
      const phoneInput = phoneInputs[0];
      
      await user.type(nameInput, 'John Doe');
      await user.type(phoneInput, '+254712345678');
      
      const button = screen.getByRole('button', { name: /save information/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText(/saved successfully/i)).toBeInTheDocument();
      }, { timeout: 2000 });
      
      // Clear inputs and submit again
      await user.clear(nameInput);
      await user.clear(phoneInput);
      await user.click(button);
      
      expect(screen.queryByText(/saved successfully/i)).not.toBeInTheDocument();
      expect(screen.getByText(/please fill in all required fields/i)).toBeInTheDocument();
    });
  });


  describe('11. Theme Consistency', () => {
    it('should use purple theme for input focus', () => {
      render(<EmergencyContact />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      expect(nameInput).toHaveClass('focus:border-primary-500', 'focus:ring-primary-500');
    });

    it('should use purple theme for selected relationship', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const mother = screen.getByLabelText(/mother/i);
      await user.click(mother);
      
      const label = mother.closest('label');
      expect(label).toHaveClass('border-primary-500', 'bg-primary-50', 'text-primary-900');
    });

    it('should use purple theme for submit button', () => {
      render(<EmergencyContact />);
      
      const button = screen.getByRole('button', { name: /save information/i });
      expect(button).toHaveClass('bg-primary-600', 'hover:bg-primary-700');
    });

    it('should use purple theme for add reference button', () => {
      render(<EmergencyContact />);
      
      const addButton = screen.getByRole('button', { name: /\+ add reference/i });
      expect(addButton).toHaveClass('text-primary-600', 'hover:text-primary-500');
    });

    it('should have hover effect on unselected relationships', () => {
      render(<EmergencyContact />);
      
      const mother = screen.getByLabelText(/mother/i);
      const label = mother.closest('label');
      
      expect(label).toHaveClass('hover:bg-gray-50');
    });
  });

  describe('12. Accessibility', () => {
    it('should have proper label for name input', () => {
      render(<EmergencyContact />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      expect(nameInput).toHaveAttribute('id', 'emergencyName');
      expect(nameInput).toHaveAttribute('type', 'text');
    });

    it('should have proper label for phone input', () => {
      render(<EmergencyContact />);
      
      const phoneInputs = screen.getAllByLabelText(/phone number/i);
      const emergencyPhone = phoneInputs[0]; // First is emergency phone
      expect(emergencyPhone).toHaveAttribute('id', 'emergencyPhone');
      expect(emergencyPhone).toHaveAttribute('type', 'tel');
    });

    it('should have radio buttons for relationships', () => {
      render(<EmergencyContact />);
      
      const radios = screen.getAllByRole('radio');
      expect(radios.length).toBe(4);
    });

    it('should have proper name attribute for radio group', () => {
      render(<EmergencyContact />);
      
      const radios = screen.getAllByRole('radio');
      radios.forEach(radio => {
        expect(radio).toHaveAttribute('name', 'relationship');
      });
    });

    it('should have proper labels for reference inputs', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const addButton = screen.getByRole('button', { name: /\+ add reference/i });
      await user.click(addButton);
      
      const nameInputs = screen.getAllByLabelText(/^name$/i);
      expect(nameInputs[0]).toHaveAttribute('id', 'refName0');
      expect(nameInputs[1]).toHaveAttribute('id', 'refName1');
    });

    it('should have accessible submit button', () => {
      render(<EmergencyContact />);
      
      const button = screen.getByRole('button', { name: /save information/i });
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should have accessible add reference button', () => {
      render(<EmergencyContact />);
      
      const addButton = screen.getByRole('button', { name: /\+ add reference/i });
      expect(addButton).toHaveAttribute('type', 'button');
    });
  });

  describe('13. Responsive Layout', () => {
    it('should use grid layout for relationships', () => {
      render(<EmergencyContact />);
      
      const father = screen.getByLabelText(/father/i);
      const gridContainer = father.closest('.grid');
      expect(gridContainer).toHaveClass('grid-cols-2');
    });

    it('should have responsive padding', () => {
      render(<EmergencyContact />);
      
      const container = screen.getByText(/emergency contact information/i).closest('div');
      expect(container).toHaveClass('p-6', 'sm:p-8');
    });
  });

  describe('14. Visual Feedback', () => {
    it('should have transition classes on inputs', () => {
      render(<EmergencyContact />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      expect(nameInput).toHaveClass('transition-colors');
    });

    it('should have rounded corners on inputs', () => {
      render(<EmergencyContact />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      expect(nameInput).toHaveClass('rounded-lg');
    });

    it('should have cursor pointer on relationship labels', () => {
      render(<EmergencyContact />);
      
      const father = screen.getByLabelText(/father/i);
      const label = father.closest('label');
      
      expect(label).toHaveClass('cursor-pointer');
    });

    it('should have disabled styling on submit button', () => {
      render(<EmergencyContact />);
      
      const button = screen.getByRole('button', { name: /save information/i });
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });
  });

  describe('15. Edge Cases', () => {
    it('should handle special characters in name', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
      await user.type(nameInput, "O'Brien-Smith");
      
      expect(nameInput.value).toBe("O'Brien-Smith");
    });

    it('should handle international phone format', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const phoneInputs = screen.getAllByLabelText(/phone number/i);
      const emergencyPhone = phoneInputs[0] as HTMLInputElement;
      await user.type(emergencyPhone, '+1-555-123-4567');
      
      expect(emergencyPhone.value).toBe('+1-555-123-4567');
    });

    it('should handle adding and removing multiple references', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const addButton = screen.getByRole('button', { name: /\+ add reference/i });
      
      // Add 3 references
      await user.click(addButton);
      await user.click(addButton);
      await user.click(addButton);
      
      expect(screen.getByText(/reference 4/i)).toBeInTheDocument();
      
      // Remove 2 references
      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      await user.click(removeButtons[0]);
      await user.click(removeButtons[0]);
      
      expect(screen.queryByText(/reference 4/i)).not.toBeInTheDocument();
      expect(screen.getByText(/reference 2/i)).toBeInTheDocument();
    });

    it('should maintain form state after validation error', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
      const mother = screen.getByLabelText(/mother/i);
      
      await user.type(nameInput, 'John Doe');
      await user.click(mother);
      
      const button = screen.getByRole('button', { name: /save information/i });
      await user.click(button);
      
      // After error, form state should be maintained
      expect(nameInput.value).toBe('John Doe');
      expect(mother).toBeChecked();
    });

    it('should handle rapid clicking of add reference', async () => {
      const user = userEvent.setup();
      render(<EmergencyContact />);
      
      const addButton = screen.getByRole('button', { name: /\+ add reference/i });
      
      await user.click(addButton);
      await user.click(addButton);
      await user.click(addButton);
      
      const references = screen.getAllByText(/reference \d/i);
      expect(references.length).toBe(4);
    });

    it('should handle empty reference fields in submission', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'log');
      render(<EmergencyContact />);
      
      const nameInput = screen.getByLabelText(/full name/i);
      const phoneInputs = screen.getAllByLabelText(/phone number/i);
      const emergencyPhone = phoneInputs[0];
      
      await user.type(nameInput, 'John Doe');
      await user.type(emergencyPhone, '+254712345678');
      
      const addButton = screen.getByRole('button', { name: /\+ add reference/i });
      await user.click(addButton);
      await user.click(addButton);
      
      const button = screen.getByRole('button', { name: /save information/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            references: []
          })
        );
      }, { timeout: 2000 });
    });
  });
});
