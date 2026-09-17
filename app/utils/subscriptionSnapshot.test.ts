import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadSubscriptionSnapshot } from './subscriptionSnapshot';
import { cachedRequest, clearRequestCache } from './requestCache';

describe('subscription access decisions', () => {
  beforeEach(clearRequestCache);

  it('allows a server-confirmed free trial even if billing details fail to load', async () => {
    const result = await loadSubscriptionSnapshot(
      async () => { throw new Error('billing unavailable'); },
      async () => ({ hasAccess: true, isTrial: true, status: 'trial' }),
    );
    expect(result.status).toBe('trial');
    expect(result.access.has_access).toBe(true);
  });

  it('does not turn a failed access lookup into a cached denial', async () => {
    const check = vi.fn()
      .mockRejectedValueOnce(new Error('decoder failed'))
      .mockResolvedValue({ hasAccess: true, isTrial: true });
    const read = () => cachedRequest('profile:household', () => loadSubscriptionSnapshot(
      async () => null, check,
    ));
    await expect(read()).rejects.toThrow('decoder failed');
    await expect(read()).resolves.toMatchObject({ status: 'trial' });
    expect(check).toHaveBeenCalledTimes(2);
  });

  it('never uses a stale trial record to override a denied access check', async () => {
    const result = await loadSubscriptionSnapshot(
      async () => ({ subscription: { id: 'old-trial', status: 'trial' } }),
      async () => ({ hasAccess: false, status: 'expired' }),
    );
    expect(result.status).toBe('expired');
  });

  it('keeps profile access decisions independent', async () => {
    const read = (role: string) => cachedRequest(`account:${role}`, () => loadSubscriptionSnapshot(
      async () => null,
      async () => ({ hasAccess: role === 'household', isTrial: role === 'household', status: 'none' }),
    ));
    expect((await read('household')).status).toBe('trial');
    expect((await read('service_provider')).status).toBe('none');
  });
});
