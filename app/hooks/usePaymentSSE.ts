import { useEffect, useRef, useCallback } from 'react';
import { API_BASE_URL } from '~/config/api';
import { getAccessTokenFromCookies } from '~/utils/cookie';

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
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000;

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const token = getAccessTokenFromCookies();
    if (!token) {
      console.log('[PaymentSSE] No auth token, skipping SSE connection');
      return;
    }

    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    console.log('[PaymentSSE] Connecting to SSE stream...');
    const es = new EventSource(`${API_BASE_URL}/api/v1/notifications/stream?token=${encodeURIComponent(token)}`, { withCredentials: true });
    esRef.current = es;

    es.onopen = () => {
      console.log('[PaymentSSE] Connected successfully');
      reconnectAttemptsRef.current = 0;
    };

    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        const eventType = payload.event_type;
        
        console.log('[PaymentSSE] Received event:', eventType);

        switch (eventType) {
          case 'payments.payment.succeeded':
            onPaymentSucceeded?.(payload);
            break;
          case 'payments.payment.failed':
            onPaymentFailed?.(payload);
            break;
          case 'payments.payment.refunded':
            onPaymentRefunded?.(payload);
            break;
          default:
            // Ignore other event types
            break;
        }
      } catch (err) {
        console.error('[PaymentSSE] Failed to parse event:', err);
      }
    };

    es.onerror = (err) => {
      console.error('[PaymentSSE] Connection error:', err);
      es.close();
      esRef.current = null;

      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
        console.log(`[PaymentSSE] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      } else {
        console.error('[PaymentSSE] Max reconnection attempts reached');
      }
    };
  }, [onPaymentSucceeded, onPaymentFailed, onPaymentRefunded]);

  useEffect(() => {
    connect();

    return () => {
      console.log('[PaymentSSE] Cleaning up SSE connection');
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [connect]);

  return {
    isConnected: esRef.current?.readyState === EventSource.OPEN,
    reconnect: connect
  };
}
