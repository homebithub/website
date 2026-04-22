import { useState, useEffect, useCallback } from 'react';
import { paymentsService } from '~/services/grpc/payments.service';
import { shouldSilenceGatewayError } from '~/services/grpc/client';
import { useSubscriptionSSE } from './useSubscriptionSSE';
import { extractSubscription, extractSubscriptionAccess } from '~/utils/subscriptionData';

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
  daysRemaining: number;
  expiresAt: string | null;
  accessMessage: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useSubscription(userId?: string | null): UseSubscriptionResult {
  const [status, setStatus] = useState<SubscriptionStatus>('loading');
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [accessMessage, setAccessMessage] = useState<string | null>(null);
  const [isEarlyAdopter, setIsEarlyAdopter] = useState(false);

  const fetchSubscription = useCallback(async () => {
    if (!userId) {
      setStatus('none');
      setIsEarlyAdopter(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [subscriptionResult, accessResult] = await Promise.allSettled([
        paymentsService.getMySubscription(userId),
        paymentsService.checkSubscriptionAccess(userId),
      ]);

      const sub =
        subscriptionResult.status === 'fulfilled'
          ? extractSubscription(subscriptionResult.value)
          : null;
      const access =
        accessResult.status === 'fulfilled'
          ? extractSubscriptionAccess(accessResult.value)
          : null;

      if (!sub || !sub.id) {
        setSubscription(null);
      } else {
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
      }

      setDaysRemaining(access?.days_remaining ?? 0);
      setExpiresAt(access?.expires_at ?? null);
      setAccessMessage(access?.message ?? null);
      setIsEarlyAdopter(Boolean(access?.is_early_adopter || sub?.metadata?.early_adopter));

      if (access?.has_access) {
        setStatus(access.is_trial ? 'trial' : 'active');
      } else if (sub?.status === 'expired' || access?.status === 'expired') {
        setStatus('expired');
      } else if (!sub?.id) {
        setStatus('none');
      } else {
        setStatus((sub.status as SubscriptionStatus) || 'none');
      }
    } catch (err: any) {
      if (err.code === 'NOT_FOUND' || err.status === 5) {
        setStatus('none');
        setSubscription(null);
        return;
      }
      if (shouldSilenceGatewayError(err)) {
        setStatus('none');
        setSubscription(null);
        setError(null);
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
      fetchSubscription();
    }, [fetchSubscription]),
    // onSuspended
    useCallback(() => {
      fetchSubscription();
    }, [fetchSubscription]),
    // onReactivated
    useCallback(() => {
      fetchSubscription();
    }, [fetchSubscription]),
    // onPastDue
    useCallback(() => {
      fetchSubscription();
    }, [fetchSubscription]),
    // onTrialStarted
    useCallback(() => {
      fetchSubscription();
    }, [fetchSubscription]),
    // onExpiryWarning
    useCallback(() => {
      // Could show a toast notification here
    }, []),
    // onLapsed
    useCallback(() => {
      fetchSubscription();
    }, [fetchSubscription]),
    // onCancelled
    useCallback(() => {
      fetchSubscription();
    }, [fetchSubscription])
  );

  const isActive = status === 'active' || status === 'trial';

  return {
    status,
    subscription,
    isActive,
    isEarlyAdopter,
    daysRemaining,
    expiresAt,
    accessMessage,
    loading,
    error,
    refetch: fetchSubscription,
  };
}
