import { useMemo } from 'react';
import { useSSEContext } from '~/contexts/SSEContext';
import { useSSESubscriptions } from '~/hooks/useSSESubscription';

export type SubscriptionSSEEvent = {
  event_type: string;
  data: {
    subscription_id?: string;
    user_id?: string;
    plan_id?: string;
    plan_name?: string;
    amount?: number;
    currency?: string;
    days_in_grace?: number;
    days_remaining?: number;
    trial_days?: number;
    grace_period_end?: string;
    expires_at?: string;
    activated_at?: string;
    suspended_at?: string;
    reactivated_at?: string;
    trial_end?: string;
  };
};

export type SubscriptionSSEHandler = (event: SubscriptionSSEEvent) => void;

export function useSubscriptionSSE(
  onActivated?: SubscriptionSSEHandler,
  onSuspended?: SubscriptionSSEHandler,
  onReactivated?: SubscriptionSSEHandler,
  onPastDue?: SubscriptionSSEHandler,
  onTrialStarted?: SubscriptionSSEHandler,
  onExpiryWarning?: SubscriptionSSEHandler,
  onLapsed?: SubscriptionSSEHandler,
  onCancelled?: SubscriptionSSEHandler
) {
  const { isConnected, reconnect } = useSSEContext();

  const subscriptions = useMemo(
    () =>
      [
        onActivated && { eventType: 'payments.subscription.activated', handler: onActivated as (event: any) => void },
        onSuspended && { eventType: 'payments.subscription.suspended', handler: onSuspended as (event: any) => void },
        onReactivated && { eventType: 'payments.subscription.reactivated', handler: onReactivated as (event: any) => void },
        onPastDue && { eventType: 'payments.subscription.past_due', handler: onPastDue as (event: any) => void },
        onTrialStarted && { eventType: 'payments.subscription.trial_started', handler: onTrialStarted as (event: any) => void },
        onExpiryWarning && { eventType: 'payments.subscription.expiry_warning_7d', handler: onExpiryWarning as (event: any) => void },
        onExpiryWarning && { eventType: 'payments.subscription.expiry_warning_1d', handler: onExpiryWarning as (event: any) => void },
        onExpiryWarning && { eventType: 'payments.subscription.expiry_warning_0d', handler: onExpiryWarning as (event: any) => void },
        onLapsed && { eventType: 'payments.subscription.lapsed', handler: onLapsed as (event: any) => void },
        onCancelled && { eventType: 'payments.subscription.cancelled', handler: onCancelled as (event: any) => void },
      ].filter(Boolean) as Array<{ eventType: string; handler: (event: any) => void }>,
    [onActivated, onCancelled, onExpiryWarning, onLapsed, onPastDue, onReactivated, onSuspended, onTrialStarted]
  );

  useSSESubscriptions(subscriptions, subscriptions.length > 0);

  return {
    isConnected,
    reconnect,
  };
}
