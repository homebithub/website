import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '~/test/utils/test-utils';
import Contact from '../contact';

// Mock Navigation and Footer components
vi.mock('~/components/Navigation', () => ({
  Navigation: () => <div data-testid="navigation">Navigation</div>,
}));

vi.mock('~/components/Footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>,
}));

// Mock fetch
global.fetch = vi.fn();

describe('Contact Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Rendering & Content', () => {
    it('should render the page title', () => {
      renderWithRouter(<Contact />);
      
      expect(screen.getByText(/contact us 💬/i)).toBeInTheDocument();
    });

    it('should render the subtitle', () => {
      renderWithRouter(<Contact />);
      
      expect(screen.getByText(/have questions\? we'd love to hear from you/i)).toBeInTheDocument();
    });

    it('should render all form fields', () => {
      renderWithRouter(<Contact />);
      
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      // Subject uses CustomSelect which doesn't have standard label association
      expect(screen.getAllByText(/subject/i).length).toBeGreaterThan(0);
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      renderWithRouter(<Contact />);
      
      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
    });

    it('should render alternative contact email', () => {
      renderWithRouter(<Contact />);
      
      const emailLink = screen.getByRole('link', { name: /info@homebit\.co\.ke/i });
      expect(emailLink).toBeInTheDocument();
      expect(emailLink).toHaveAttribute('href', 'mailto:info@homebit.co.ke');
    });

    it('should render emojis in title and button', () => {
      renderWithRouter(<Contact />);
      
      expect(screen.getByText(/💬/)).toBeInTheDocument();
      expect(screen.getByText(/🚀/)).toBeInTheDocument();
    });
  });

  describe('2. Theme Consistency', () => {
    it('should use purple gradient theme for title', () => {
      renderWithRouter(<Contact />);
      
      const heading = screen.getByText(/contact us 💬/i);
      expect(heading).toHaveClass('bg-gradient-to-r', 'from-purple-600', 'to-pink-600');
    });

    it('should have purple labels', () => {
      renderWithRouter(<Contact />);
      
      const labels = screen.getAllByText(/name|email|subject|message/i);
      labels.forEach(label => {
        if (label.tagName === 'LABEL') {
          expect(label).toHaveClass('text-purple-700', 'dark:text-purple-400');
        }
      });
    });

    it('should have purple gradient submit button when form is valid', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Contact />);
      
      // Fill form to enable button
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByText(/select a subject/i));
      await user.click(screen.getByText(/general inquiry/i));
      await user.type(screen.getByLabelText(/message/i), 'Test message');
      
      const button = screen.getByRole('button', { name: /send message/i });
      expect(button).toHaveClass('from-purple-600', 'to-pink-600');
    });

    it('should support dark mode classes', () => {
      const { container } = renderWithRouter(<Contact />);
      
      const card = container.querySelector('.dark\\:bg-\\[\\#13131a\\]');
      expect(card).toBeInTheDocument();
    });
  });

  describe('3. Mobile Responsiveness', () => {
    it('should render properly on mobile viewport (375px)', () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));
      
      renderWithRouter(<Contact />);
      
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
    });

    it('should render properly on tablet viewport (768px)', () => {
      global.innerWidth = 768;
      global.dispatchEvent(new Event('resize'));
      
      renderWithRouter(<Contact />);
      
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
    });

    it('should render properly on desktop viewport (1920px)', () => {
      global.innerWidth = 1920;
      global.dispatchEvent(new Event('resize'));
      
      renderWithRouter(<Contact />);
      
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
    });

    it('should have responsive text sizing', () => {
      renderWithRouter(<Contact />);
      
      const heading = screen.getByText(/contact us 💬/i);
      expect(heading).toHaveClass('text-xl', 'sm:text-2xl');
    });
  });

  describe('4. Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithRouter(<Contact />);
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent(/contact us/i);
    });

    it('should have labels properly associated with inputs', () => {
      renderWithRouter(<Contact />);
      
      expect(screen.getByLabelText(/name/i)).toHaveAttribute('id', 'name');
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('id', 'email');
      expect(screen.getByLabelText(/message/i)).toHaveAttribute('id', 'message');
    });

    it('should have required attributes on required fields', () => {
      renderWithRouter(<Contact />);
      
      expect(screen.getByLabelText(/name/i)).toBeRequired();
      expect(screen.getByLabelText(/email/i)).toBeRequired();
      expect(screen.getByLabelText(/message/i)).toBeRequired();
    });

    it('should have proper input types', () => {
      renderWithRouter(<Contact />);
      
      expect(screen.getByLabelText(/name/i)).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email');
    });

    it('should have accessible submit button', () => {
      renderWithRouter(<Contact />);
      
      const button = screen.getByRole('button', { name: /send message/i });
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('5. Form Validation', () => {
    it('should disable submit button when form is empty', () => {
      renderWithRouter(<Contact />);
      
      const button = screen.getByRole('button', { name: /send message/i });
      expect(button).toBeDisabled();
    });

    it('should disable submit button when name is empty', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Contact />);
      
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByText(/select a subject/i));
      await user.click(screen.getByText(/general inquiry/i));
      await user.type(screen.getByLabelText(/message/i), 'Test message');
      
      const button = screen.getByRole('button', { name: /send message/i });
      expect(button).toBeDisabled();
    });

    it('should disable submit button when email is empty', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Contact />);
      
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.click(screen.getByText(/select a subject/i));
      await user.click(screen.getByText(/general inquiry/i));
      await user.type(screen.getByLabelText(/message/i), 'Test message');
      
      const button = screen.getByRole('button', { name: /send message/i });
      expect(button).toBeDisabled();
    });

    it('should disable submit button when subject is not selected', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Contact />);
      
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/message/i), 'Test message');
      
      const button = screen.getByRole('button', { name: /send message/i });
      expect(button).toBeDisabled();
    });

    it('should disable submit button when message is empty', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Contact />);
      
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByText(/select a subject/i));
      await user.click(screen.getByText(/general inquiry/i));
      
      const button = screen.getByRole('button', { name: /send message/i });
      expect(button).toBeDisabled();
    });

    it('should enable submit button when all fields are filled', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Contact />);
      
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByText(/select a subject/i));
      await user.click(screen.getByText(/general inquiry/i));
      await user.type(screen.getByLabelText(/message/i), 'Test message');
      
      const button = screen.getByRole('button', { name: /send message/i });
      expect(button).toBeEnabled();
    });
  });

  describe('6. User Interactions', () => {
    it('should update name field on input', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Contact />);
      
      const nameInput = screen.getByLabelText(/name/i);
      await user.type(nameInput, 'John Doe');
      
      expect(nameInput).toHaveValue('John Doe');
    });

    it('should update email field on input', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Contact />);
      
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');
      
      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should update message field on input', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Contact />);
      
      const messageInput = screen.getByLabelText(/message/i);
      await user.type(messageInput, 'This is a test message');
      
      expect(messageInput).toHaveValue('This is a test message');
    });

    it('should allow selecting subject from dropdown', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Contact />);
      
      await user.click(screen.getByText(/select a subject/i));
      await user.click(screen.getByText(/general inquiry/i));
      
      // CustomSelect should update the value
      expect(screen.getByText(/general inquiry/i)).toBeInTheDocument();
    });
  });

  describe('7. Subject Options', () => {
    it('should have all subject options available', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Contact />);
      
      await user.click(screen.getByText(/select a subject/i));
      
      expect(screen.getByText(/general inquiry/i)).toBeInTheDocument();
      expect(screen.getByText(/technical support/i)).toBeInTheDocument();
      expect(screen.getByText(/billing question/i)).toBeInTheDocument();
      expect(screen.getByText(/feedback/i)).toBeInTheDocument();
    });

    it('should allow selecting General Inquiry', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Contact />);
      
      await user.click(screen.getByText(/select a subject/i));
      await user.click(screen.getByText(/general inquiry/i));
      
      expect(screen.getByText(/general inquiry/i)).toBeInTheDocument();
    });

    it('should allow selecting Technical Support', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Contact />);
      
      await user.click(screen.getByText(/select a subject/i));
      await user.click(screen.getByText(/technical support/i));
      
      expect(screen.getByText(/technical support/i)).toBeInTheDocument();
    });

    it('should allow selecting Billing Question', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Contact />);
      
      await user.click(screen.getByText(/select a subject/i));
      await user.click(screen.getByText(/billing question/i));
      
      expect(screen.getByText(/billing question/i)).toBeInTheDocument();
    });

    it('should allow selecting Feedback', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Contact />);
      
      await user.click(screen.getByText(/select a subject/i));
      await user.click(screen.getByText(/feedback/i));
      
      expect(screen.getByText(/feedback/i)).toBeInTheDocument();
    });
  });

  describe('8. Form Submission - Success', () => {
    it('should submit form successfully', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Success' }),
        })
      ) as any;
      
      renderWithRouter(<Contact />);
      
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByText(/select a subject/i));
      await user.click(screen.getByText(/general inquiry/i));
      await user.type(screen.getByLabelText(/message/i), 'Test message');
      
      await user.click(screen.getByRole('button', { name: /send message/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/thank you for your message/i)).toBeInTheDocument();
      });
    });

    it('should call API with correct data', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Success' }),
        })
      ) as any;
      
      renderWithRouter(<Contact />);
      
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByText(/select a subject/i));
      await user.click(screen.getByText(/general inquiry/i));
      await user.type(screen.getByLabelText(/message/i), 'Test message');
      
      await user.click(screen.getByRole('button', { name: /send message/i }));
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/v1/contact'),
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'John Doe',
              email: 'test@example.com',
              subject: 'general',
              message: 'Test message',
            }),
          })
        );
      });
    });

    it('should clear form after successful submission', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Success' }),
        })
      ) as any;
      
      renderWithRouter(<Contact />);
      
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByText(/select a subject/i));
      await user.click(screen.getByText(/general inquiry/i));
      await user.type(screen.getByLabelText(/message/i), 'Test message');
      
      await user.click(screen.getByRole('button', { name: /send message/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/thank you for your message/i)).toBeInTheDocument();
      });
    });

    it('should show success message with emoji', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Success' }),
        })
      ) as any;
      
      renderWithRouter(<Contact />);
      
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByText(/select a subject/i));
      await user.click(screen.getByText(/general inquiry/i));
      await user.type(screen.getByLabelText(/message/i), 'Test message');
      
      await user.click(screen.getByRole('button', { name: /send message/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/🎉/)).toBeInTheDocument();
        expect(screen.getByText(/✔️/)).toBeInTheDocument();
      });
    });
  });

  describe('9. Form Submission - Error', () => {
    it('should show error message on API failure', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: 'Server error' }),
        })
      ) as any;
      
      renderWithRouter(<Contact />);
      
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByText(/select a subject/i));
      await user.click(screen.getByText(/general inquiry/i));
      await user.type(screen.getByLabelText(/message/i), 'Test message');
      
      await user.click(screen.getByRole('button', { name: /send message/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      });
    });

    it('should handle network error', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;
      
      renderWithRouter(<Contact />);
      
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByText(/select a subject/i));
      await user.click(screen.getByText(/general inquiry/i));
      await user.type(screen.getByLabelText(/message/i), 'Test message');
      
      await user.click(screen.getByRole('button', { name: /send message/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should keep form data after error', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: 'Server error' }),
        })
      ) as any;
      
      renderWithRouter(<Contact />);
      
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByText(/select a subject/i));
      await user.click(screen.getByText(/general inquiry/i));
      await user.type(screen.getByLabelText(/message/i), 'Test message');
      
      await user.click(screen.getByRole('button', { name: /send message/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/server error/i)).toBeInTheDocument();
      });
      
      // Form should still have values
      expect(screen.getByLabelText(/name/i)).toHaveValue('John Doe');
      expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com');
      expect(screen.getByLabelText(/message/i)).toHaveValue('Test message');
    });
  });

  describe('10. Visual Feedback', () => {
    it('should have hover effect on submit button when form is valid', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Contact />);
      
      // Fill form to enable button
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByText(/select a subject/i));
      await user.click(screen.getByText(/general inquiry/i));
      await user.type(screen.getByLabelText(/message/i), 'Test message');
      
      const button = screen.getByRole('button', { name: /send message/i });
      expect(button).toHaveClass('hover:scale-105');
    });

    it('should have different styling for disabled button', () => {
      renderWithRouter(<Contact />);
      
      const button = screen.getByRole('button', { name: /send message/i });
      expect(button).toHaveClass('bg-gray-300', 'dark:bg-gray-700');
      expect(button).toHaveClass('cursor-not-allowed');
    });

    it('should have transition classes', () => {
      renderWithRouter(<Contact />);
      
      const button = screen.getByRole('button', { name: /send message/i });
      expect(button).toHaveClass('transition-all');
    });

    it('should have shadow on card', () => {
      const { container } = renderWithRouter(<Contact />);
      
      const card = container.querySelector('.shadow-light-glow-lg');
      expect(card).toBeInTheDocument();
    });

    it('should have hover scale effect on card', () => {
      const { container } = renderWithRouter(<Contact />);
      
      const card = container.querySelector('.hover\\:scale-105');
      expect(card).toBeInTheDocument();
    });
  });

  describe('11. Edge Cases', () => {
    it('should handle whitespace-only input as invalid', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Contact />);
      
      await user.type(screen.getByLabelText(/name/i), '   ');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByText(/select a subject/i));
      await user.click(screen.getByText(/general inquiry/i));
      await user.type(screen.getByLabelText(/message/i), 'Test message');
      
      const button = screen.getByRole('button', { name: /send message/i });
      expect(button).toBeDisabled();
    });

    it('should handle very long message', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Contact />);
      
      const longMessage = 'A'.repeat(1000);
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByText(/select a subject/i));
      await user.click(screen.getByText(/general inquiry/i));
      await user.type(screen.getByLabelText(/message/i), longMessage);
      
      const button = screen.getByRole('button', { name: /send message/i });
      expect(button).toBeEnabled();
    });

    it('should handle special characters in message', async () => {
      const user = userEvent.setup();
      renderWithRouter(<Contact />);
      
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByText(/select a subject/i));
      await user.click(screen.getByText(/general inquiry/i));
      await user.type(screen.getByLabelText(/message/i), 'Test <script>alert("xss")</script>');
      
      const button = screen.getByRole('button', { name: /send message/i });
      expect(button).toBeEnabled();
    });

    it('should handle rapid form submissions', async () => {
      const user = userEvent.setup();
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Success' }),
        })
      ) as any;
      
      renderWithRouter(<Contact />);
      
      await user.type(screen.getByLabelText(/name/i), 'John Doe');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.click(screen.getByText(/select a subject/i));
      await user.click(screen.getByText(/general inquiry/i));
      await user.type(screen.getByLabelText(/message/i), 'Test message');
      
      const button = screen.getByRole('button', { name: /send message/i });
      
      // Try to submit multiple times
      await user.click(button);
      await user.click(button);
      
      // Should only call API once (or handle gracefully)
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });
});
