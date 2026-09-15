import { invalidateCached } from '~/utils/requestCache';

export const SUBSCRIPTION_CHANGED_EVENT = 'homebit:subscription-changed';

/**
 * Make an entitlement change visible immediately in every mounted consumer.
 * Realtime remains useful across devices, but checkout must not depend on an
 * SSE connection surviving a mobile network or NAT transition.
 */
export function notifySubscriptionChanged(userId?: string | null): void {
  if (userId) invalidateCached(`subscription:${userId}`);
  window.dispatchEvent(new CustomEvent(SUBSCRIPTION_CHANGED_EVENT, {
    detail: { userId: userId || null },
  }));
}
