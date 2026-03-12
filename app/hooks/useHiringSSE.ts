import { useEffect, useRef, useCallback } from 'react';
import { API_BASE_URL } from '~/config/api';
import { getAccessTokenFromCookies } from '~/utils/cookie';

export type HiringSSEEvent = {
  event_type: string;
  data: {
    request_id?: string;
    contract_id?: string;
    household_id?: string;
    househelp_id?: string;
    household_user_id?: string;
    househelp_user_id?: string;
    household_name?: string;
    househelp_name?: string;
    position?: string;
    salary?: string;
    reason?: string;
    signer_id?: string;
    recipient_id?: string;
    signer_name?: string;
    signer_type?: string;
    terminator_id?: string;
    terminator_name?: string;
    other_party_name?: string;
    days_remaining?: number;
    created_at?: string;
    accepted_at?: string;
    rejected_at?: string;
    signed_at?: string;
    expires_at?: string;
    terminated_at?: string;
  };
};

export type HiringSSEHandler = (event: HiringSSEEvent) => void;

export function useHiringSSE(
  onHireRequestReceived?: HiringSSEHandler,
  onHireRequestAccepted?: HiringSSEHandler,
  onHireRequestRejected?: HiringSSEHandler,
  onContractSigned?: HiringSSEHandler,
  onContractExpiring?: HiringSSEHandler,
  onContractTerminated?: HiringSSEHandler
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
      console.log('[HiringSSE] No auth token, skipping SSE connection');
      return;
    }

    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }

    console.log('[HiringSSE] Connecting to SSE stream...');
    const es = new EventSource(`${API_BASE_URL}/api/v1/notifications/stream`);
    esRef.current = es;

    es.onopen = () => {
      console.log('[HiringSSE] Connected successfully');
      reconnectAttemptsRef.current = 0;
    };

    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        const eventType = payload.event_type;
        
        console.log('[HiringSSE] Received event:', eventType);

        switch (eventType) {
          case 'hiring.request.received':
            onHireRequestReceived?.(payload);
            break;
          case 'hiring.request.accepted':
            onHireRequestAccepted?.(payload);
            break;
          case 'hiring.request.rejected':
            onHireRequestRejected?.(payload);
            break;
          case 'hiring.contract.signed':
            onContractSigned?.(payload);
            break;
          case 'hiring.contract.expiring':
            onContractExpiring?.(payload);
            break;
          case 'hiring.contract.terminated':
            onContractTerminated?.(payload);
            break;
          default:
            // Ignore other event types
            break;
        }
      } catch (err) {
        console.error('[HiringSSE] Failed to parse event:', err);
      }
    };

    es.onerror = (err) => {
      console.error('[HiringSSE] Connection error:', err);
      es.close();
      esRef.current = null;

      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
        console.log(`[HiringSSE] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      } else {
        console.error('[HiringSSE] Max reconnection attempts reached');
      }
    };
  }, [
    onHireRequestReceived,
    onHireRequestAccepted,
    onHireRequestRejected,
    onContractSigned,
    onContractExpiring,
    onContractTerminated
  ]);

  useEffect(() => {
    connect();

    return () => {
      console.log('[HiringSSE] Cleaning up SSE connection');
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
