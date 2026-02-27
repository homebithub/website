import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSubscription } from '../useSubscription';

// Mock dependencies
vi.mock('~/config/api', () => ({
  API_ENDPOINTS: {
    payments: {
      subscriptions: {
        mine: 'https://api.test.com/api/v1/subscriptions/mine',
      },
    },
  },
}));

vi.mock('~/utils/apiClient', () => ({
  apiClient: {
    auth: vi.fn(),
    json: vi.fn(),
  },
}));

import { apiClient } from '~/utils/apiClient';

describe('useSubscription', () => {
  let consoleErrorSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('starts with loading state', () => {
      vi.mocked(apiClient.auth).mockResolvedValue({ ok: true, status: 404 } as any);

      const { result } = renderHook(() => useSubscription('user-123'));

      expect(result.current.status).toBe('loading');
      expect(result.current.loading).toBe(true);
      expect(result.current.subscription).toBeNull();
      expect(result.current.isActive).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('sets status to none when no userId provided', async () => {
      const { result } = renderHook(() => useSubscription(null));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.status).toBe('none');
      expect(result.current.subscription).toBeNull();
      expect(result.current.isActive).toBe(false);
    });

    it('sets status to none when userId is undefined', async () => {
      const { result } = renderHook(() => useSubscription(undefined));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.status).toBe('none');
    });
  });

  describe('Active Subscription', () => {
    it('fetches and sets active subscription', async () => {
      const mockSubscription = {
        id: 'sub-123',
        plan_id: 'plan-456',
        status: 'active',
        current_period_start: '2026-01-01T00:00:00Z',
        current_period_end: '2026-03-01T00:00:00Z',
        is_trial_used: false,
      };

      vi.mocked(apiClient.auth).mockResolvedValue({ ok: true, status: 200 } as any);
      vi.mocked(apiClient.json).mockResolvedValue({ subscription: mockSubscription });

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.status).toBe('active');
      expect(result.current.subscription).toEqual(mockSubscription);
      expect(result.current.isActive).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('handles nested subscription data structure', async () => {
      const mockSubscription = {
        id: 'sub-456',
        status: 'active',
        current_period_end: '2026-03-01T00:00:00Z',
      };

      vi.mocked(apiClient.auth).mockResolvedValue({ ok: true, status: 200 } as any);
      vi.mocked(apiClient.json).mockResolvedValue({
        data: { subscription: mockSubscription },
      });

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.subscription).toEqual(mockSubscription);
      });

      expect(result.current.status).toBe('active');
    });

    it('handles deeply nested subscription data', async () => {
      const mockSubscription = {
        id: 'sub-789',
        status: 'active',
        current_period_end: '2026-03-01T00:00:00Z',
      };

      vi.mocked(apiClient.auth).mockResolvedValue({ ok: true, status: 200 } as any);
      vi.mocked(apiClient.json).mockResolvedValue({
        data: { data: { subscription: mockSubscription } },
      });

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.subscription).toEqual(mockSubscription);
      });
    });

    it('handles subscription in data field directly', async () => {
      const mockSubscription = {
        id: 'sub-999',
        status: 'active',
        current_period_end: '2026-03-01T00:00:00Z',
      };

      vi.mocked(apiClient.auth).mockResolvedValue({ ok: true, status: 200 } as any);
      vi.mocked(apiClient.json).mockResolvedValue({ data: mockSubscription });

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.subscription).toEqual(mockSubscription);
      });
    });
  });

  describe('Trial Subscription', () => {
    it('fetches and sets trial subscription', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const mockSubscription = {
        id: 'sub-trial',
        plan_id: 'plan-456',
        status: 'trial',
        current_period_start: '2026-01-01T00:00:00Z',
        current_period_end: '2026-03-01T00:00:00Z',
        trial_start: '2026-01-01T00:00:00Z',
        trial_end: futureDate.toISOString(),
        is_trial_used: false,
      };

      vi.mocked(apiClient.auth).mockResolvedValue({ ok: true, status: 200 } as any);
      vi.mocked(apiClient.json).mockResolvedValue({ subscription: mockSubscription });

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.status).toBe('trial');
      expect(result.current.subscription).toEqual(mockSubscription);
      expect(result.current.isActive).toBe(true);
    });

    it('detects expired trial', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const mockSubscription = {
        id: 'sub-trial-expired',
        status: 'trial',
        trial_end: pastDate.toISOString(),
        current_period_end: '2026-03-01T00:00:00Z',
      };

      vi.mocked(apiClient.auth).mockResolvedValue({ ok: true, status: 200 } as any);
      vi.mocked(apiClient.json).mockResolvedValue({ subscription: mockSubscription });

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.status).toBe('expired');
      });

      expect(result.current.isActive).toBe(false);
    });
  });

  describe('Expired Subscription', () => {
    it('handles expired subscription status', async () => {
      const mockSubscription = {
        id: 'sub-expired',
        status: 'expired',
        current_period_end: '2025-12-01T00:00:00Z',
      };

      vi.mocked(apiClient.auth).mockResolvedValue({ ok: true, status: 200 } as any);
      vi.mocked(apiClient.json).mockResolvedValue({ subscription: mockSubscription });

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.status).toBe('expired');
      });

      expect(result.current.isActive).toBe(false);
    });

    it('detects expired active subscription by date', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const mockSubscription = {
        id: 'sub-past',
        status: 'active',
        current_period_end: pastDate.toISOString(),
      };

      vi.mocked(apiClient.auth).mockResolvedValue({ ok: true, status: 200 } as any);
      vi.mocked(apiClient.json).mockResolvedValue({ subscription: mockSubscription });

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.status).toBe('expired');
      });
    });
  });

  describe('No Subscription', () => {
    it('handles 404 response (no subscription)', async () => {
      vi.mocked(apiClient.auth).mockResolvedValue({ ok: false, status: 404 } as any);

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.status).toBe('none');
      expect(result.current.subscription).toBeNull();
      expect(result.current.isActive).toBe(false);
    });

    it('handles empty subscription response', async () => {
      vi.mocked(apiClient.auth).mockResolvedValue({ ok: true, status: 200 } as any);
      vi.mocked(apiClient.json).mockResolvedValue({});

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.status).toBe('none');
      });

      expect(result.current.subscription).toBeNull();
    });

    it('handles subscription without id', async () => {
      vi.mocked(apiClient.auth).mockResolvedValue({ ok: true, status: 200 } as any);
      vi.mocked(apiClient.json).mockResolvedValue({
        subscription: { status: 'active' },
      });

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.status).toBe('none');
      });
    });

    it('handles null subscription', async () => {
      vi.mocked(apiClient.auth).mockResolvedValue({ ok: true, status: 200 } as any);
      vi.mocked(apiClient.json).mockResolvedValue({ subscription: null });

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.status).toBe('none');
      });
    });
  });

  describe('Early Adopter', () => {
    it('detects early adopter from metadata', async () => {
      const mockSubscription = {
        id: 'sub-early',
        status: 'active',
        current_period_end: '2026-03-01T00:00:00Z',
        metadata: { early_adopter: true },
      };

      vi.mocked(apiClient.auth).mockResolvedValue({ ok: true, status: 200 } as any);
      vi.mocked(apiClient.json).mockResolvedValue({ subscription: mockSubscription });

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.isEarlyAdopter).toBe(true);
      });
    });

    it('returns false for non-early adopter', async () => {
      const mockSubscription = {
        id: 'sub-regular',
        status: 'active',
        current_period_end: '2026-03-01T00:00:00Z',
      };

      vi.mocked(apiClient.auth).mockResolvedValue({ ok: true, status: 200 } as any);
      vi.mocked(apiClient.json).mockResolvedValue({ subscription: mockSubscription });

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.isEarlyAdopter).toBe(false);
      });
    });

    it('returns false when metadata.early_adopter is false', async () => {
      const mockSubscription = {
        id: 'sub-not-early',
        status: 'active',
        current_period_end: '2026-03-01T00:00:00Z',
        metadata: { early_adopter: false },
      };

      vi.mocked(apiClient.auth).mockResolvedValue({ ok: true, status: 200 } as any);
      vi.mocked(apiClient.json).mockResolvedValue({ subscription: mockSubscription });

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.isEarlyAdopter).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('handles API error', async () => {
      vi.mocked(apiClient.auth).mockResolvedValue({ ok: false, status: 500 } as any);

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(result.current.error).toBe('Failed to fetch subscription');
      expect(result.current.loading).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('handles network error', async () => {
      vi.mocked(apiClient.auth).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(result.current.error).toBe('Network error');
    });

    it('handles JSON parsing error', async () => {
      vi.mocked(apiClient.auth).mockResolvedValue({ ok: true, status: 200 } as any);
      vi.mocked(apiClient.json).mockRejectedValue(new Error('Invalid JSON'));

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(result.current.error).toBe('Invalid JSON');
    });

    it('handles error without message', async () => {
      vi.mocked(apiClient.auth).mockRejectedValue({});

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(result.current.error).toBe('Failed to check subscription');
    });
  });

  describe('Refetch', () => {
    it('refetches subscription data', async () => {
      const mockSubscription = {
        id: 'sub-123',
        status: 'active',
        current_period_end: '2026-03-01T00:00:00Z',
      };

      vi.mocked(apiClient.auth).mockResolvedValue({ ok: true, status: 200 } as any);
      vi.mocked(apiClient.json).mockResolvedValue({ subscription: mockSubscription });

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.status).toBe('active');

      // Change mock to return expired
      const expiredSubscription = { ...mockSubscription, status: 'expired' };
      vi.mocked(apiClient.json).mockResolvedValue({ subscription: expiredSubscription });

      // Refetch
      result.current.refetch();

      await waitFor(() => {
        expect(result.current.status).toBe('expired');
      });
    });

    it('clears error on successful refetch', async () => {
      // First call fails
      vi.mocked(apiClient.auth).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });

      // Second call succeeds
      const mockSubscription = {
        id: 'sub-123',
        status: 'active',
        current_period_end: '2026-03-01T00:00:00Z',
      };
      vi.mocked(apiClient.auth).mockResolvedValue({ ok: true, status: 200 } as any);
      vi.mocked(apiClient.json).mockResolvedValue({ subscription: mockSubscription });

      result.current.refetch();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });

      expect(result.current.status).toBe('active');
    });
  });

  describe('User ID Changes', () => {
    it('refetches when userId changes', async () => {
      const mockSubscription1 = {
        id: 'sub-user1',
        status: 'active',
        current_period_end: '2026-03-01T00:00:00Z',
      };

      vi.mocked(apiClient.auth).mockResolvedValue({ ok: true, status: 200 } as any);
      vi.mocked(apiClient.json).mockResolvedValue({ subscription: mockSubscription1 });

      const { result, rerender } = renderHook(
        ({ userId }) => useSubscription(userId),
        { initialProps: { userId: 'user-1' } }
      );

      await waitFor(() => {
        expect(result.current.subscription?.id).toBe('sub-user1');
      });

      // Change userId
      const mockSubscription2 = {
        id: 'sub-user2',
        status: 'trial',
        trial_end: '2026-03-15T00:00:00Z',
        current_period_end: '2026-03-01T00:00:00Z',
      };
      vi.mocked(apiClient.json).mockResolvedValue({ subscription: mockSubscription2 });

      rerender({ userId: 'user-2' });

      await waitFor(() => {
        expect(result.current.subscription?.id).toBe('sub-user2');
      });

      expect(result.current.status).toBe('trial');
    });

    it('sets status to none when userId becomes null', async () => {
      const mockSubscription = {
        id: 'sub-123',
        status: 'active',
        current_period_end: '2026-03-01T00:00:00Z',
      };

      vi.mocked(apiClient.auth).mockResolvedValue({ ok: true, status: 200 } as any);
      vi.mocked(apiClient.json).mockResolvedValue({ subscription: mockSubscription });

      const { result, rerender } = renderHook(
        ({ userId }) => useSubscription(userId),
        { initialProps: { userId: 'user-1' } }
      );

      await waitFor(() => {
        expect(result.current.status).toBe('active');
      });

      // Change to null
      rerender({ userId: null });

      await waitFor(() => {
        expect(result.current.status).toBe('none');
      });
    });
  });

  describe('Plan Information', () => {
    it('includes plan information when available', async () => {
      const mockSubscription = {
        id: 'sub-123',
        status: 'active',
        current_period_end: '2026-03-01T00:00:00Z',
        plan: {
          id: 'plan-pro',
          name: 'Pro Plan',
          description: 'Professional features',
          price_amount: 2999,
          billing_cycle: 'monthly',
          trial_days: 14,
        },
      };

      vi.mocked(apiClient.auth).mockResolvedValue({ ok: true, status: 200 } as any);
      vi.mocked(apiClient.json).mockResolvedValue({ subscription: mockSubscription });

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.subscription?.plan).toEqual(mockSubscription.plan);
      });
    });
  });
});
