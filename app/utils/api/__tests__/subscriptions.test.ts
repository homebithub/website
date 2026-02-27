import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  pauseSubscription,
  resumeSubscription,
  getPauseStatus,
  cancelSubscription,
  changePlan,
  previewProration,
  getCreditBalance,
} from '../subscriptions';

// Mock dependencies
vi.mock('~/config/api', () => ({
  API_ENDPOINTS: {
    payments: {
      subscriptions: {
        pause: (id: string) => `https://api.test.com/api/v1/subscriptions/${id}/pause`,
        resume: (id: string) => `https://api.test.com/api/v1/subscriptions/${id}/resume`,
        pauseStatus: (id: string) => `https://api.test.com/api/v1/subscriptions/${id}/pause-status`,
        cancel: (id: string) => `https://api.test.com/api/v1/subscriptions/${id}/cancel`,
        changePlan: (id: string) => `https://api.test.com/api/v1/subscriptions/${id}/change-plan`,
        previewProration: (id: string) => `https://api.test.com/api/v1/subscriptions/${id}/preview-proration`,
        creditBalance: (id: string) => `https://api.test.com/api/v1/subscriptions/${id}/credit-balance`,
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

describe('subscriptions API', () => {
  let mockFetch: any;
  let mockLocalStorage: any;

  beforeEach(() => {
    // Mock fetch
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Mock localStorage
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

  describe('pauseSubscription', () => {
    it('pauses subscription successfully', async () => {
      const mockResponse = {
        subscription_id: 'sub-123',
        paused_at: '2026-02-27T00:00:00Z',
        resume_at: '2026-03-27T00:00:00Z',
        status: 'paused',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const request = {
        pause_duration_days: 30,
        reason: 'vacation',
      };

      const result = await pauseSubscription('sub-123', request);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/v1/subscriptions/sub-123/pause',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
          body: JSON.stringify(request),
        })
      );
    });

    it('pauses subscription with custom resume date', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'paused' }),
      });

      const request = {
        resume_at: '2026-04-01T00:00:00Z',
        reason: 'financial',
      };

      await pauseSubscription('sub-456', request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(request),
        })
      );
    });

    it('throws error on failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Subscription already paused' }),
      });

      await expect(
        pauseSubscription('sub-123', { pause_duration_days: 30 })
      ).rejects.toThrow('Subscription already paused');
    });

    it('includes auth token in request', async () => {
      mockLocalStorage.getItem.mockReturnValue('my-auth-token');
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await pauseSubscription('sub-123', { pause_duration_days: 30 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer my-auth-token',
          }),
        })
      );
    });
  });

  describe('resumeSubscription', () => {
    it('resumes subscription successfully', async () => {
      const mockResponse = {
        subscription_id: 'sub-123',
        resumed_at: '2026-02-27T00:00:00Z',
        status: 'active',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await resumeSubscription('sub-123');

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/v1/subscriptions/sub-123/resume',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('throws error when subscription not paused', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Subscription is not paused' }),
      });

      await expect(resumeSubscription('sub-123')).rejects.toThrow(
        'Subscription is not paused'
      );
    });

    it('throws error on network failure', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(resumeSubscription('sub-123')).rejects.toThrow('Network error');
    });
  });

  describe('getPauseStatus', () => {
    it('gets pause status successfully', async () => {
      const mockResponse = {
        is_paused: true,
        paused_at: '2026-02-01T00:00:00Z',
        resume_at: '2026-03-01T00:00:00Z',
        pause_reason: 'vacation',
        remaining_pause_days: 2,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getPauseStatus('sub-123');

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/v1/subscriptions/sub-123/pause-status',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('gets status for non-paused subscription', async () => {
      const mockResponse = {
        is_paused: false,
        paused_at: null,
        resume_at: null,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getPauseStatus('sub-456');

      expect(result.is_paused).toBe(false);
    });

    it('throws error on failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Subscription not found' }),
      });

      await expect(getPauseStatus('sub-invalid')).rejects.toThrow(
        'Subscription not found'
      );
    });
  });

  describe('cancelSubscription', () => {
    it('cancels subscription immediately', async () => {
      const mockResponse = {
        subscription_id: 'sub-123',
        canceled_at: '2026-02-27T00:00:00Z',
        status: 'canceled',
        refund_amount: 0,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const request = {
        cancel_immediately: true,
        reason: 'not_satisfied',
      };

      const result = await cancelSubscription('sub-123', request);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/v1/subscriptions/sub-123/cancel',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request),
        })
      );
    });

    it('cancels subscription at period end', async () => {
      const mockResponse = {
        subscription_id: 'sub-123',
        cancel_at_period_end: true,
        period_end: '2026-03-27T00:00:00Z',
        status: 'active',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const request = {
        cancel_immediately: false,
        reason: 'too_expensive',
      };

      const result = await cancelSubscription('sub-123', request);

      expect(result.cancel_at_period_end).toBe(true);
    });

    it('includes cancellation feedback', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'canceled' }),
      });

      const request = {
        cancel_immediately: true,
        reason: 'other',
        feedback: 'Found a better alternative',
      };

      await cancelSubscription('sub-123', request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(request),
        })
      );
    });

    it('throws error on failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Cannot cancel active subscription' }),
      });

      await expect(
        cancelSubscription('sub-123', { cancel_immediately: true })
      ).rejects.toThrow('Cannot cancel active subscription');
    });
  });

  describe('changePlan', () => {
    it('changes plan successfully', async () => {
      const mockResponse = {
        subscription_id: 'sub-123',
        old_plan_id: 'plan-basic',
        new_plan_id: 'plan-pro',
        effective_date: '2026-02-27T00:00:00Z',
        proration_amount: 1500,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const request = {
        new_plan_id: 'plan-pro',
        prorate: true,
      };

      const result = await changePlan('sub-123', request);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/v1/subscriptions/sub-123/change-plan',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request),
        })
      );
    });

    it('changes plan without proration', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ proration_amount: 0 }),
      });

      const request = {
        new_plan_id: 'plan-basic',
        prorate: false,
      };

      await changePlan('sub-123', request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(request),
        })
      );
    });

    it('changes plan at period end', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ effective_date: '2026-03-27T00:00:00Z' }),
      });

      const request = {
        new_plan_id: 'plan-enterprise',
        effective_at: 'period_end',
      };

      await changePlan('sub-123', request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('period_end'),
        })
      );
    });

    it('throws error on invalid plan', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Plan not found' }),
      });

      await expect(
        changePlan('sub-123', { new_plan_id: 'invalid-plan' })
      ).rejects.toThrow('Plan not found');
    });
  });

  describe('previewProration', () => {
    it('previews proration successfully', async () => {
      const mockResponse = {
        current_plan_id: 'plan-basic',
        new_plan_id: 'plan-pro',
        proration_amount: 1500,
        credit_amount: 500,
        amount_due: 1000,
        effective_date: '2026-02-27T00:00:00Z',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const request = {
        new_plan_id: 'plan-pro',
      };

      const result = await previewProration('sub-123', request);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/v1/subscriptions/sub-123/preview-proration',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request),
        })
      );
    });

    it('previews downgrade proration', async () => {
      const mockResponse = {
        proration_amount: -500,
        credit_amount: 500,
        amount_due: 0,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await previewProration('sub-123', { new_plan_id: 'plan-basic' });

      expect(result.proration_amount).toBeLessThan(0);
      expect(result.credit_amount).toBeGreaterThan(0);
    });

    it('throws error on failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Cannot preview proration' }),
      });

      await expect(
        previewProration('sub-123', { new_plan_id: 'plan-pro' })
      ).rejects.toThrow('Cannot preview proration');
    });
  });

  describe('getCreditBalance', () => {
    it('gets credit balance successfully', async () => {
      const mockResponse = {
        subscription_id: 'sub-123',
        credit_balance: 2500,
        currency: 'USD',
        last_updated: '2026-02-27T00:00:00Z',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getCreditBalance('sub-123');

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/v1/subscriptions/sub-123/credit-balance',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('gets zero credit balance', async () => {
      const mockResponse = {
        subscription_id: 'sub-456',
        credit_balance: 0,
        currency: 'USD',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getCreditBalance('sub-456');

      expect(result.credit_balance).toBe(0);
    });

    it('throws error on failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Subscription not found' }),
      });

      await expect(getCreditBalance('sub-invalid')).rejects.toThrow(
        'Subscription not found'
      );
    });
  });

  describe('Authentication', () => {
    it('includes auth token in all requests', async () => {
      mockLocalStorage.getItem.mockReturnValue('my-special-token');
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await pauseSubscription('sub-123', { pause_duration_days: 30 });

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
        json: async () => ({}),
      });

      await pauseSubscription('sub-123', { pause_duration_days: 30 });

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

      await expect(
        pauseSubscription('sub-123', { pause_duration_days: 30 })
      ).rejects.toThrow('Network error');
    });

    it('handles malformed JSON responses', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(
        pauseSubscription('sub-123', { pause_duration_days: 30 })
      ).rejects.toThrow();
    });

    it('uses default error message when none provided', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({}),
      });

      await expect(
        pauseSubscription('sub-123', { pause_duration_days: 30 })
      ).rejects.toThrow('API Error');
    });
  });
});
