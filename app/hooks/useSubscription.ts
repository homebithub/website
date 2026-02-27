import { useState, useEffect, useCallback, useMemo } from 'react';
import { transport, getGrpcMetadata, handleGrpcError } from '~/utils/grpcClient';
import { PaymentsServiceClient } from '~/proto/payments/payments.client';
import { GetMySubscriptionRequest } from '~/proto/payments/payments';

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

  const client = useMemo(() => new PaymentsServiceClient(transport), []);

  const fetchSubscription = useCallback(async () => {
    if (!userId) {
      setStatus('none');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const request: GetMySubscriptionRequest = { userId: userId || "" };
      const { response: dataResponse } = await client.getMySubscription(request, { metadata: getGrpcMetadata() });
      
      const fields = dataResponse.data?.fields || {};
      const sub = fields.subscription?.structValue?.fields || dataResponse.subscription || null;

      if (!sub || (!sub.id?.stringValue && !sub.id)) {
        setStatus('none');
        setSubscription(null);
        return;
      }

      // Map dynamic fields to SubscriptionData
      const normalizedSub: SubscriptionData = {
        id: sub.id?.stringValue || sub.id || "",
        plan_id: sub.plan_id?.stringValue || sub.plan_id || "",
        status: sub.status?.stringValue || sub.status || "",
        current_period_start: sub.current_period_start?.stringValue || sub.current_period_start || "",
        current_period_end: sub.current_period_end?.stringValue || sub.current_period_end || "",
        trial_start: sub.trial_start?.stringValue || sub.trial_start,
        trial_end: sub.trial_end?.stringValue || sub.trial_end,
        is_trial_used: sub.is_trial_used?.boolValue || sub.is_trial_used || false,
        metadata: sub.metadata?.structValue ? sub.metadata.structValue.fields : {},
        plan: sub.plan?.structValue?.fields ? {
          id: sub.plan.structValue.fields.id?.stringValue || "",
          name: sub.plan.structValue.fields.name?.stringValue || "",
          description: sub.plan.structValue.fields.description?.stringValue || "",
          price_amount: sub.plan.structValue.fields.price_amount?.numberValue || 0,
          billing_cycle: sub.plan.structValue.fields.billing_cycle?.stringValue || "",
          trial_days: sub.plan.structValue.fields.trial_days?.numberValue || 0,
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
      handleGrpcError(err, false);
    } finally {
      setLoading(false);
    }
  }, [userId, client]);

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
