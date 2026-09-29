// Share one small published-post lookup across requests, not one query per menu.
const cache = new Map<string, { value: boolean; expires: number; pending?: Promise<boolean> }>();

export async function hasPublishedBlogPosts(baseUrl: string): Promise<boolean> {
  const key = baseUrl.replace(/\/+$/, '');
  let entry = cache.get(key);
  if (entry?.pending) return entry.pending;
  if (entry && entry.expires > Date.now()) return entry.value;
  entry ||= { value: false, expires: 0 };
  cache.set(key, entry);
  const current = entry;
  current.pending = (async () => {
    try {
      const response = await fetch(`${key}/api/v1/blog/posts?status=published&limit=1&offset=0`, {
        signal: AbortSignal.timeout(2000),
      });
      if (!response.ok) throw new Error('Blog availability unavailable');
      const data = await response.json();
      // Protobuf JSON omits empty repeated fields and zero totals.
      if (!data || (!Array.isArray(data.posts) && !(data.posts == null && typeof data.limit === 'number'))) {
        throw new Error('Invalid blog response');
      }
      current.value = (data.posts?.length || 0) > 0;
      current.expires = Date.now() + 60_000;
    } catch {
      // A transient outage must not break navigation or erase the last known value.
      current.expires = Date.now() + 15_000;
    }
    return current.value;
  })();
  try { return await current.pending; } finally { current.pending = undefined; }
}
