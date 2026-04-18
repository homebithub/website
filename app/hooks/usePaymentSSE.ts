import { useMemo } from 'react';
import { useSSEContext } from '~/contexts/SSEContext';
import { useSSESubscriptions } from '~/hooks/useSSESubscription';

export type PaymentSSEEvent = {
  event_type: string;
  data: {
    payment_id?: string;
    user_id?: string;
    transaction_id?: string;
    amount?: number;
    currency?: string;
    refund_reason?: string;
    succeeded_at?: string;
    failed_at?: string;
    refunded_at?: string;
    reason?: string;
  };
};

export type PaymentSSEHandler = (event: PaymentSSEEvent) => void;

export function usePaymentSSE(
  onPaymentSucceeded?: PaymentSSEHandler,
  onPaymentFailed?: PaymentSSEHandler,
  onPaymentRefunded?: PaymentSSEHandler
) {
  const { isConnected, reconnect } = useSSEContext();

  const subscriptions = useMemo(
    () =>
      [
        onPaymentSucceeded && { eventType: 'payments.payment.succeeded', handler: onPaymentSucceeded as (event: any) => void },
        onPaymentFailed && { eventType: 'payments.payment.failed', handler: onPaymentFailed as (event: any) => void },
        onPaymentRefunded && { eventType: 'payments.payment.refunded', handler: onPaymentRefunded as (event: any) => void },
      ].filter(Boolean) as Array<{ eventType: string; handler: (event: any) => void }>,
    [onPaymentFailed, onPaymentRefunded, onPaymentSucceeded]
  );

  useSSESubscriptions(subscriptions, subscriptions.length > 0);

  return {
    isConnected,
    reconnect,
  };
}
