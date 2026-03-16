import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

// ── Mock gRPC dependencies ──────────────────────────────────────────────
const mockGetMySubscription = vi.fn();

vi.mock('~/services/grpc/payments.service', () => ({
  paymentsService: {
    getMySubscription: (...args: any[]) => mockGetMySubscription(...args),
  },
}));

vi.mock('~/services/grpc/client', () => ({
  handleGrpcError: vi.fn(),
}));

vi.mock('../useSubscriptionSSE', () => ({
  useSubscriptionSSE: vi.fn(),
}));

import { useSubscription } from '../useSubscription';

// Helper: build a response mimicking protobuf getData().toJavaScript()
function buildSubResponse(sub: Record<string, any> | null) {
  if (!sub) {
    // Return object where getData().toJavaScript() returns empty
    return {
      getData: () => ({ toJavaScript: () => ({}) }),
    };
  }
  return {
    getData: () => ({
      toJavaScript: () => ({ subscription: sub }),
    }),
  };
}

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
      mockGetMySubscription.mockReturnValue(new Promise(() => {})); // never resolves

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
      mockGetMySubscription.mockResolvedValue(
        buildSubResponse({
          id: 'sub-123',
          plan_id: 'plan-456',
          status: 'active',
          current_period_start: '2026-01-01T00:00:00Z',
          current_period_end: '2026-03-01T00:00:00Z',
          is_trial_used: false,
        }),
      );

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.status).toBe('active');
      expect(result.current.subscription?.id).toBe('sub-123');
      expect(result.current.isActive).toBe(true);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Trial Subscription', () => {
    it('fetches and sets trial subscription', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      mockGetMySubscription.mockResolvedValue(
        buildSubResponse({
          id: 'sub-trial',
          plan_id: 'plan-456',
          status: 'trial',
          current_period_start: '2026-01-01T00:00:00Z',
          current_period_end: '2026-03-01T00:00:00Z',
          trial_start: '2026-01-01T00:00:00Z',
          trial_end: futureDate.toISOString(),
          is_trial_used: false,
        }),
      );

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.status).toBe('trial');
      expect(result.current.isActive).toBe(true);
    });

    it('detects expired trial', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      mockGetMySubscription.mockResolvedValue(
        buildSubResponse({
          id: 'sub-trial-expired',
          status: 'trial',
          trial_end: pastDate.toISOString(),
          current_period_end: '2026-03-01T00:00:00Z',
        }),
      );

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.status).toBe('expired');
      });

      expect(result.current.isActive).toBe(false);
    });
  });

  describe('Expired Subscription', () => {
    it('handles expired subscription status', async () => {
      mockGetMySubscription.mockResolvedValue(
        buildSubResponse({
          id: 'sub-expired',
          status: 'expired',
          current_period_end: '2025-12-01T00:00:00Z',
        }),
      );

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.status).toBe('expired');
      });

      expect(result.current.isActive).toBe(false);
    });

    it('detects expired active subscription by date', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      mockGetMySubscription.mockResolvedValue(
        buildSubResponse({
          id: 'sub-past',
          status: 'active',
          current_period_end: pastDate.toISOString(),
        }),
      );

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.status).toBe('expired');
      });
    });
  });

  describe('No Subscription', () => {
    it('handles NOT_FOUND gRPC error', async () => {
      mockGetMySubscription.mockRejectedValue({ code: 'NOT_FOUND', status: 5 });

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.status).toBe('none');
      expect(result.current.subscription).toBeNull();
      expect(result.current.isActive).toBe(false);
    });

    it('handles empty subscription response', async () => {
      mockGetMySubscription.mockResolvedValue(buildSubResponse(null));

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.status).toBe('none');
      });

      expect(result.current.subscription).toBeNull();
    });
  });

  describe('Early Adopter', () => {
    it('detects early adopter from metadata', async () => {
      mockGetMySubscription.mockResolvedValue(
        buildSubResponse({
          id: 'sub-early',
          status: 'active',
          current_period_end: '2026-03-01T00:00:00Z',
          metadata: { early_adopter: true },
        }),
      );

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.isEarlyAdopter).toBe(true);
      });
    });

    it('returns false for non-early adopter', async () => {
      mockGetMySubscription.mockResolvedValue(
        buildSubResponse({
          id: 'sub-regular',
          status: 'active',
          current_period_end: '2026-03-01T00:00:00Z',
        }),
      );

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.isEarlyAdopter).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('handles gRPC error', async () => {
      mockGetMySubscription.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(result.current.error).toBe('Network error');
    });

    it('handles error without message', async () => {
      mockGetMySubscription.mockRejectedValue({});

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(result.current.error).toBe('Failed to check subscription');
    });
  });

  describe('Refetch', () => {
    it('refetches subscription data', async () => {
      mockGetMySubscription.mockResolvedValue(
        buildSubResponse({ id: 'sub-123', status: 'active', current_period_end: '2026-03-01T00:00:00Z' }),
      );

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.status).toBe('active');

      // Change mock to return expired
      mockGetMySubscription.mockResolvedValue(
        buildSubResponse({ id: 'sub-123', status: 'expired', current_period_end: '2025-12-01T00:00:00Z' }),
      );

      result.current.refetch();

      await waitFor(() => {
        expect(result.current.status).toBe('expired');
      });
    });

    it('clears error on successful refetch', async () => {
      mockGetMySubscription.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useSubscription('user-123'));

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });

      mockGetMySubscription.mockResolvedValue(
        buildSubResponse({ id: 'sub-123', status: 'active', current_period_end: '2026-03-01T00:00:00Z' }),
      );

      result.current.refetch();

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });

      expect(result.current.status).toBe('active');
    });
  });

  describe('User ID Changes', () => {
    it('sets status to none when userId becomes null', async () => {
      mockGetMySubscription.mockResolvedValue(
        buildSubResponse({ id: 'sub-123', status: 'active', current_period_end: '2026-03-01T00:00:00Z' }),
      );

      const { result, rerender } = renderHook(
        ({ userId }) => useSubscription(userId),
        { initialProps: { userId: 'user-1' as string | null } },
      );

      await waitFor(() => {
        expect(result.current.status).toBe('active');
      });

      rerender({ userId: null });

      await waitFor(() => {
        expect(result.current.status).toBe('none');
      });
    });
  });
});
