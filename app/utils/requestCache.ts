type CacheEntry<T> = {
  value?: T;
  updatedAt: number;
  promise?: Promise<T>;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();

/**
 * Deduplicate identical reads and keep their result across route component
 * remounts. This is deliberately a tiny cache rather than a data framework:
 * account chrome only needs stale-time semantics and explicit invalidation
 * from the realtime events it already receives.
 */
export async function cachedRequest<T>(
  key: string,
  loader: () => Promise<T>,
  options: { maxAgeMs?: number; force?: boolean } = {},
): Promise<T> {
  const maxAgeMs = options.maxAgeMs ?? 60_000;
  const existing = memoryCache.get(key) as CacheEntry<T> | undefined;
  const now = Date.now();

  if (!options.force && existing?.value !== undefined && now - existing.updatedAt < maxAgeMs) {
    return existing.value;
  }
  if (existing?.promise) return existing.promise;

  const promise = loader()
    .then((value) => {
      memoryCache.set(key, { value, updatedAt: Date.now() });
      return value;
    })
    .catch((error) => {
      if (existing?.value !== undefined) {
        memoryCache.set(key, { value: existing.value, updatedAt: existing.updatedAt });
      } else {
        memoryCache.delete(key);
      }
      throw error;
    });

  memoryCache.set(key, {
    value: existing?.value,
    updatedAt: existing?.updatedAt ?? 0,
    promise,
  });
  return promise;
}

export function readCached<T>(key: string): T | undefined {
  return (memoryCache.get(key) as CacheEntry<T> | undefined)?.value;
}

export function writeCached<T>(key: string, value: T): void {
  memoryCache.set(key, { value, updatedAt: Date.now() });
}

export function invalidateCached(prefix: string): void {
  for (const key of memoryCache.keys()) {
    if (key === prefix || key.startsWith(prefix)) memoryCache.delete(key);
  }
}
