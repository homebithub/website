import { extractSubscription, extractSubscriptionAccess } from './subscriptionData';

/** Only a successful access check may decide whether this profile can interact. */
export async function loadSubscriptionSnapshot(
  readSubscription: () => Promise<unknown>,
  checkAccess: () => Promise<unknown>,
  options: { requireDetails?: boolean } = {},
) {
  const [subscriptionResult, accessResult] = await Promise.allSettled([
    readSubscription(), checkAccess(),
  ]);
  if (accessResult.status === 'rejected') throw accessResult.reason;
  const access = extractSubscriptionAccess(accessResult.value);
  if (!access) throw new Error('Unable to check subscription access. Please retry.');
  if (options.requireDetails && subscriptionResult.status === 'rejected') {
    const error = subscriptionResult.reason;
    // The shared gRPC adapter preserves status as grpcCode on its friendly Error.
    // Accept raw errors too, but never interpret a network failure as no plan.
    const code = error?.grpcCode ?? error?.code ?? error?.status;
    const notFound = code === 5 || code === 'NOT_FOUND';
    if (!notFound || access.has_access) throw error;
  }
  const sub = subscriptionResult.status === 'fulfilled'
    ? extractSubscription(subscriptionResult.value) : null;
  const status = access.has_access ? (access.is_trial ? 'trial' : 'active')
    : access.status === 'expired' ? 'expired' : 'none';
  return { sub, access, status } as const;
}
