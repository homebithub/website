import { useEffect, useRef, useCallback } from 'react';
import { API_BASE_URL } from '~/config/api';
import { getAccessTokenFromCookies } from '~/utils/cookie';

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
  const esRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000;

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const token = getAccessTokenFromCookies();
    if (!token) {
      console.log('[SubscriptionSSE] No auth token, skipping SSE connection');
      return;
    }

    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    console.log('[SubscriptionSSE] Connecting to SSE stream...');
    const es = new EventSource(`${API_BASE_URL}/api/v1/notifications/stream?token=${encodeURIComponent(token)}`, { withCredentials: true });
    esRef.current = es;

    es.onopen = () => {
      console.log('[SubscriptionSSE] Connected successfully');
      reconnectAttemptsRef.current = 0;
    };

    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        const eventType = payload.event_type;
        
        console.log('[SubscriptionSSE] Received event:', eventType);

        switch (eventType) {
          case 'payments.subscription.activated':
            onActivated?.(payload);
            break;
          case 'payments.subscription.suspended':
            onSuspended?.(payload);
            break;
          case 'payments.subscription.reactivated':
            onReactivated?.(payload);
            break;
          case 'payments.subscription.past_due':
            onPastDue?.(payload);
            break;
          case 'payments.subscription.trial_started':
            onTrialStarted?.(payload);
            break;
          case 'payments.subscription.expiry_warning_7d':
          case 'payments.subscription.expiry_warning_1d':
          case 'payments.subscription.expiry_warning_0d':
            onExpiryWarning?.(payload);
            break;
          case 'payments.subscription.lapsed':
            onLapsed?.(payload);
            break;
          case 'payments.subscription.cancelled':
            onCancelled?.(payload);
            break;
          default:
            // Ignore other event types
            break;
        }
      } catch (err) {
        console.error('[SubscriptionSSE] Failed to parse event:', err);
      }
    };

    es.onerror = (err) => {
      console.error('[SubscriptionSSE] Connection error:', err);
      es.close();
      esRef.current = null;

      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
        console.log(`[SubscriptionSSE] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      } else {
        console.error('[SubscriptionSSE] Max reconnection attempts reached');
      }
    };
  }, [
    onActivated,
    onSuspended,
    onReactivated,
    onPastDue,
    onTrialStarted,
    onExpiryWarning,
    onLapsed,
    onCancelled
  ]);

  useEffect(() => {
    connect();

    return () => {
      console.log('[SubscriptionSSE] Cleaning up SSE connection');
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
