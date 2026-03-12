import { useEffect } from 'react';
import { useSSEContext, type SSEEventHandler } from '~/contexts/SSEContext';

/**
 * Hook to subscribe to specific SSE event types using the centralized SSE connection
 * 
 * @param eventType - The event type to subscribe to (e.g., 'messaging.message.received')
 * @param handler - Callback function to handle the event
 * @param enabled - Whether the subscription is active (default: true)
 */
export function useSSESubscription(
  eventType: string,
  handler: SSEEventHandler,
  enabled: boolean = true
) {
  const { subscribe } = useSSEContext();

  useEffect(() => {
    if (!enabled || !handler) {
      return;
    }

    const unsubscribe = subscribe(eventType, handler);

    return () => {
      unsubscribe();
    };
  }, [eventType, handler, enabled, subscribe]);
}

/**
 * Hook to subscribe to multiple SSE event types at once
 * 
 * @param subscriptions - Array of {eventType, handler} objects
 * @param enabled - Whether the subscriptions are active (default: true)
 */
export function useSSESubscriptions(
  subscriptions: Array<{ eventType: string; handler: SSEEventHandler }>,
  enabled: boolean = true
) {
  const { subscribe } = useSSEContext();

  useEffect(() => {
    if (!enabled || !subscriptions || subscriptions.length === 0) {
      return;
    }

    const unsubscribers = subscriptions.map(({ eventType, handler }) => 
      subscribe(eventType, handler)
    );

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [subscriptions, enabled, subscribe]);
}

export default useSSESubscription;
