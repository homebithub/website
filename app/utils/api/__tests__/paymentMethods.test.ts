import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  listPaymentMethods,
  getDefaultPaymentMethod,
  addPaymentMethod,
  setDefaultPaymentMethod,
  updatePaymentMethodNickname,
  deletePaymentMethod,
} from '../paymentMethods';

// Mock dependencies
vi.mock('~/config/api', () => ({
  API_ENDPOINTS: {
    payments: {
      paymentMethods: {
        list: 'https://api.test.com/api/v1/payment-methods',
        default: 'https://api.test.com/api/v1/payment-methods/default',
        add: 'https://api.test.com/api/v1/payment-methods',
        setDefault: (id: string) => `https://api.test.com/api/v1/payment-methods/${id}/default`,
        updateNickname: (id: string) => `https://api.test.com/api/v1/payment-methods/${id}/nickname`,
        delete: (id: string) => `https://api.test.com/api/v1/payment-methods/${id}`,
      },
    },
  },
  getAuthHeaders: vi.fn((token: string | null) => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  })),
}));

vi.mock('~/utils/errors/apiErrors', () => ({
  parseErrorResponse: vi.fn(async (response: Response) => {
    const data = await response.json().catch(() => ({}));
    return new Error(data.error || data.message || 'API Error');
  }),
}));

describe('paymentMethods API', () => {
  let mockFetch: any;
  let mockLocalStorage: any;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    mockLocalStorage = {
      getItem: vi.fn(() => 'test-token'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('listPaymentMethods', () => {
    it('lists payment methods successfully', async () => {
      const mockMethods = [
        {
          id: 'pm-1',
          type: 'card',
          last4: '4242',
          brand: 'visa',
          exp_month: 12,
          exp_year: 2026,
          is_default: true,
        },
        {
          id: 'pm-2',
          type: 'card',
          last4: '5555',
          brand: 'mastercard',
          exp_month: 6,
          exp_year: 2027,
          is_default: false,
        },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ payment_methods: mockMethods }),
      });

      const result = await listPaymentMethods();

      expect(result).toEqual(mockMethods);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/v1/payment-methods',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('returns empty array when no payment methods', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ payment_methods: [] }),
      });

      const result = await listPaymentMethods();

      expect(result).toEqual([]);
    });

    it('returns empty array when payment_methods field missing', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      const result = await listPaymentMethods();

      expect(result).toEqual([]);
    });

    it('throws error on failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Unauthorized' }),
      });

      await expect(listPaymentMethods()).rejects.toThrow('Unauthorized');
    });
  });

  describe('getDefaultPaymentMethod', () => {
    it('gets default payment method successfully', async () => {
      const mockMethod = {
        id: 'pm-default',
        type: 'card',
        last4: '4242',
        brand: 'visa',
        is_default: true,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ payment_method: mockMethod }),
      });

      const result = await getDefaultPaymentMethod();

      expect(result).toEqual(mockMethod);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/v1/payment-methods/default',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('returns null when no default payment method (404)', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({}),
      });

      const result = await getDefaultPaymentMethod();

      expect(result).toBeNull();
    });

    it('throws error on other failures', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      });

      await expect(getDefaultPaymentMethod()).rejects.toThrow('Server error');
    });
  });

  describe('addPaymentMethod', () => {
    it('adds payment method successfully', async () => {
      const mockMethod = {
        id: 'pm-new',
        type: 'card',
        last4: '4242',
        brand: 'visa',
        exp_month: 12,
        exp_year: 2026,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ payment_method: mockMethod }),
      });

      const request = {
        payment_method_token: 'tok_visa',
        set_as_default: true,
      };

      const result = await addPaymentMethod(request);

      expect(result).toEqual(mockMethod);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/v1/payment-methods',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request),
        })
      );
    });

    it('adds payment method with nickname', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ payment_method: { id: 'pm-1' } }),
      });

      const request = {
        payment_method_token: 'tok_visa',
        nickname: 'My Visa Card',
      };

      await addPaymentMethod(request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(request),
        })
      );
    });

    it('throws error on invalid token', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Invalid payment method token' }),
      });

      await expect(
        addPaymentMethod({ payment_method_token: 'invalid' })
      ).rejects.toThrow('Invalid payment method token');
    });
  });

  describe('setDefaultPaymentMethod', () => {
    it('sets default payment method successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await setDefaultPaymentMethod('pm-123');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/v1/payment-methods/pm-123/default',
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });

    it('throws error when payment method not found', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Payment method not found' }),
      });

      await expect(setDefaultPaymentMethod('pm-invalid')).rejects.toThrow(
        'Payment method not found'
      );
    });

    it('throws error when payment method belongs to another user', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Unauthorized' }),
      });

      await expect(setDefaultPaymentMethod('pm-other')).rejects.toThrow(
        'Unauthorized'
      );
    });
  });

  describe('updatePaymentMethodNickname', () => {
    it('updates nickname successfully', async () => {
      const mockMethod = {
        id: 'pm-123',
        nickname: 'Business Card',
        last4: '4242',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ payment_method: mockMethod }),
      });

      const request = { nickname: 'Business Card' };
      const result = await updatePaymentMethodNickname('pm-123', request);

      expect(result).toEqual(mockMethod);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/v1/payment-methods/pm-123/nickname',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(request),
        })
      );
    });

    it('clears nickname with empty string', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ payment_method: { id: 'pm-123', nickname: null } }),
      });

      await updatePaymentMethodNickname('pm-123', { nickname: '' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ nickname: '' }),
        })
      );
    });

    it('throws error on failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Payment method not found' }),
      });

      await expect(
        updatePaymentMethodNickname('pm-invalid', { nickname: 'Test' })
      ).rejects.toThrow('Payment method not found');
    });
  });

  describe('deletePaymentMethod', () => {
    it('deletes payment method successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await deletePaymentMethod('pm-123');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/v1/payment-methods/pm-123',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('throws error when payment method not found', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Payment method not found' }),
      });

      await expect(deletePaymentMethod('pm-invalid')).rejects.toThrow(
        'Payment method not found'
      );
    });

    it('throws error when deleting default payment method', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Cannot delete default payment method' }),
      });

      await expect(deletePaymentMethod('pm-default')).rejects.toThrow(
        'Cannot delete default payment method'
      );
    });

    it('throws error when payment method in use', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Payment method is in use by active subscription' }),
      });

      await expect(deletePaymentMethod('pm-active')).rejects.toThrow(
        'Payment method is in use by active subscription'
      );
    });
  });

  describe('Authentication', () => {
    it('includes auth token in all requests', async () => {
      mockLocalStorage.getItem.mockReturnValue('my-special-token');
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ payment_methods: [] }),
      });

      await listPaymentMethods();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer my-special-token',
          }),
        })
      );
    });

    it('handles missing token', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ payment_methods: [] }),
      });

      await listPaymentMethods();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.anything(),
          }),
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('handles network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(listPaymentMethods()).rejects.toThrow('Network error');
    });

    it('handles malformed JSON responses', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(listPaymentMethods()).rejects.toThrow();
    });

    it('uses default error message when none provided', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({}),
      });

      await expect(listPaymentMethods()).rejects.toThrow('API Error');
    });
  });

  describe('Integration Scenarios', () => {
    it('handles complete payment method lifecycle', async () => {
      // Add payment method
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          payment_method: { id: 'pm-new', last4: '4242', is_default: false },
        }),
      });

      const added = await addPaymentMethod({ payment_method_token: 'tok_visa' });
      expect(added.id).toBe('pm-new');

      // Set as default
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await setDefaultPaymentMethod('pm-new');

      // Update nickname
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          payment_method: { id: 'pm-new', nickname: 'Primary Card' },
        }),
      });

      const updated = await updatePaymentMethodNickname('pm-new', {
        nickname: 'Primary Card',
      });
      expect(updated.nickname).toBe('Primary Card');

      // List all methods
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          payment_methods: [{ id: 'pm-new', is_default: true }],
        }),
      });

      const methods = await listPaymentMethods();
      expect(methods).toHaveLength(1);
    });
  });
});
