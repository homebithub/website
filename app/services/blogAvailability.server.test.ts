import { afterEach, expect, it, vi } from 'vitest';
import { hasPublishedBlogPosts } from './blogAvailability.server';

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it('hides an empty blog and checks only published posts', async () => {
  const fetchMock = vi.fn().mockResolvedValue(Response.json({ posts: [], total: 0 }));
  vi.stubGlobal('fetch', fetchMock);
  expect(await hasPublishedBlogPosts('https://empty.test/')).toBe(false);
  expect(fetchMock.mock.calls[0][0]).toBe('https://empty.test/api/v1/blog/posts?status=published&limit=1&offset=0');
});

it('shows a populated blog, coalesces queries, and caches the result', async () => {
  const fetchMock = vi.fn().mockResolvedValue(Response.json({ posts: [{ id: 'published' }], total: 1 }));
  vi.stubGlobal('fetch', fetchMock);
  expect(await Promise.all([hasPublishedBlogPosts('https://posts.test'), hasPublishedBlogPosts('https://posts.test')])).toEqual([true, true]);
  expect(await hasPublishedBlogPosts('https://posts.test')).toBe(true);
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it('updates after publishing or deleting posts, preserving the last value on outages', async () => {
  const now = Date.now();
  const clock = vi.spyOn(Date, 'now').mockReturnValue(now);
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(Response.json({ posts: [] }))
    .mockResolvedValueOnce(Response.json({ posts: [{ id: 'new' }] }))
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce(Response.json({ limit: 1 }));
  vi.stubGlobal('fetch', fetchMock);
  expect(await hasPublishedBlogPosts('https://changing.test')).toBe(false);
  clock.mockReturnValue(now + 61_000);
  expect(await hasPublishedBlogPosts('https://changing.test')).toBe(true);
  clock.mockReturnValue(now + 122_000);
  expect(await hasPublishedBlogPosts('https://changing.test')).toBe(true);
  clock.mockReturnValue(now + 138_000);
  expect(await hasPublishedBlogPosts('https://changing.test')).toBe(false);
});

it('does not break navigation when availability cannot be read', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Unavailable', { status: 503 })));
  expect(await hasPublishedBlogPosts('https://unavailable.test')).toBe(false);
});
