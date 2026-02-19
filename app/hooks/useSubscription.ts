import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '~/config/api';
import { apiClient } from '~/utils/apiClient';

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

      const res = await apiClient.auth(API_ENDPOINTS.payments.subscriptions.mine);
      
      if (res.status === 404) {
        setStatus('none');
        setSubscription(null);
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to fetch subscription');
      }

      const response = await apiClient.json<any>(res);
      const sub = response?.data?.subscription || response?.subscription || response?.data?.data?.subscription || response?.data || null;

      if (!sub || !sub.id) {
        setStatus('none');
        setSubscription(null);
        return;
      }

      setSubscription(sub);

      if (sub.status === 'active' || sub.status === 'trial') {
        // Check if trial/period has expired client-side
        const endDate = sub.trial_end || sub.current_period_end;
        if (endDate && new Date(endDate) < new Date()) {
          setStatus('expired');
        } else {
          setStatus(sub.status === 'trial' ? 'trial' : 'active');
        }
      } else if (sub.status === 'expired') {
        setStatus('expired');
      } else {
        setStatus('none');
      }
    } catch (err: any) {
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
