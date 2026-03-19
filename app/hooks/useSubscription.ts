import { useState, useEffect, useCallback } from 'react';
import { paymentsService } from '~/services/grpc/payments.service';
import { handleGrpcError } from '~/services/grpc/client';
import { useSubscriptionSSE } from './useSubscriptionSSE';

export type SubscriptionStatus = 'loading' | 'active' | 'trial' | 'none' | 'expired' | 'error';

export type SubscriptionData = {
  id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  trial_start?: string;
  trial_end?: string;
  is_trial_used: boolean;
  metadata?: Record<string, any>;
  plan?: {
    id: string;
    name: string;
    description: string;
    price_amount: number;
    billing_cycle: string;
    trial_days: number;
  };
};

export type UseSubscriptionResult = {
  status: SubscriptionStatus;
  subscription: SubscriptionData | null;
  isActive: boolean;
  isEarlyAdopter: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useSubscription(userId?: string | null): UseSubscriptionResult {
  const [status, setStatus] = useState<SubscriptionStatus>('loading');
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!userId) {
      setStatus('none');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await paymentsService.getMySubscription(userId);
      const data = response?.getData?.()?.toJavaScript?.() || response;
      const sub = data?.subscription || null;

      if (!sub || !sub.id) {
        setStatus('none');
        setSubscription(null);
        return;
      }

      // Map dynamic fields to SubscriptionData
      const normalizedSub: SubscriptionData = {
        id: sub.id || "",
        plan_id: sub.plan_id || "",
        status: sub.status || "",
        current_period_start: sub.current_period_start || "",
        current_period_end: sub.current_period_end || "",
        trial_start: sub.trial_start,
        trial_end: sub.trial_end,
        is_trial_used: sub.is_trial_used || false,
        metadata: sub.metadata || {},
        plan: sub.plan ? {
          id: sub.plan.id || "",
          name: sub.plan.name || "",
          description: sub.plan.description || "",
          price_amount: sub.plan.price_amount || 0,
          billing_cycle: sub.plan.billing_cycle || "",
          trial_days: sub.plan.trial_days || 0,
        } : undefined
      };

      setSubscription(normalizedSub);

      if (normalizedSub.status === 'active' || normalizedSub.status === 'trial') {
        const endDate = normalizedSub.trial_end || normalizedSub.current_period_end;
        if (endDate && new Date(endDate) < new Date()) {
          setStatus('expired');
        } else {
          setStatus(normalizedSub.status === 'trial' ? 'trial' : 'active');
        }
      } else if (normalizedSub.status === 'expired') {
        setStatus('expired');
      } else {
        setStatus('none');
      }
    } catch (err: any) {
      if (err.code === 'NOT_FOUND' || err.status === 5) {
        setStatus('none');
        setSubscription(null);
        return;
      }
      console.error('[useSubscription] Error fetching subscription:', err);
      setError(err?.message || 'Failed to check subscription');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // SSE for real-time subscription updates
  useSubscriptionSSE(
    // onActivated
    useCallback(() => {
      console.log('[useSubscription SSE] Subscription activated, refetching...');
      fetchSubscription();
    }, [fetchSubscription]),
    // onSuspended
    useCallback(() => {
      console.log('[useSubscription SSE] Subscription suspended, refetching...');
      fetchSubscription();
    }, [fetchSubscription]),
    // onReactivated
    useCallback(() => {
      console.log('[useSubscription SSE] Subscription reactivated, refetching...');
      fetchSubscription();
    }, [fetchSubscription]),
    // onPastDue
    useCallback((event: import('./useSubscriptionSSE').SubscriptionSSEEvent) => {
      console.log('[useSubscription SSE] Subscription past due:', event.data);
      fetchSubscription();
    }, [fetchSubscription]),
    // onTrialStarted
    useCallback(() => {
      console.log('[useSubscription SSE] Trial started, refetching...');
      fetchSubscription();
    }, [fetchSubscription]),
    // onExpiryWarning
    useCallback((event: import('./useSubscriptionSSE').SubscriptionSSEEvent) => {
      console.log('[useSubscription SSE] Expiry warning:', event.data);
      // Could show a toast notification here
    }, []),
    // onLapsed
    useCallback(() => {
      console.log('[useSubscription SSE] Subscription lapsed, refetching...');
      fetchSubscription();
    }, [fetchSubscription]),
    // onCancelled
    useCallback(() => {
      console.log('[useSubscription SSE] Subscription cancelled, refetching...');
      fetchSubscription();
    }, [fetchSubscription])
  );

  const isActive = status === 'active' || status === 'trial';
  const isEarlyAdopter = !!subscription?.metadata?.early_adopter;

  return {
    status,
    subscription,
    isActive,
    isEarlyAdopter,
    loading,
    error,
    refetch: fetchSubscription,
  };
}
