import { beforeEach, describe, expect, it, vi } from 'vitest';

import { cachedRequest, invalidateCached, readCached, writeCached } from './requestCache';

describe('requestCache', () => {
  beforeEach(() => invalidateCached('test:'));

  it('deduplicates concurrent requests and reuses a fresh result', async () => {
    const loader = vi.fn(async () => 7);

    const [first, second] = await Promise.all([
      cachedRequest('test:count', loader),
      cachedRequest('test:count', loader),
    ]);
    const third = await cachedRequest('test:count', loader);

    expect([first, second, third]).toEqual([7, 7, 7]);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('supports realtime invalidation and forced refreshes', async () => {
    let value = 1;
    const loader = vi.fn(async () => value);

    expect(await cachedRequest('test:badge', loader)).toBe(1);
    value = 2;
    expect(await cachedRequest('test:badge', loader, { force: true })).toBe(2);

    writeCached('test:other', 3);
    expect(readCached<number>('test:other')).toBe(3);
    invalidateCached('test:');
    expect(readCached('test:badge')).toBeUndefined();
    expect(readCached('test:other')).toBeUndefined();
  });
});
