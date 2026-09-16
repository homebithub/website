import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { expect, it, vi } from 'vitest';

it('can cache an asset after the browser has consumed the original response', async () => {
  const listeners = new Map<string, (event: any) => void>();
  const response = new Response('asset contents');
  Object.defineProperty(response, 'type', { value: 'basic' });
  let openCache!: (cache: { put: ReturnType<typeof vi.fn> }) => void;
  const cacheReady = new Promise((resolve) => { openCache = resolve; });
  const pending: Promise<unknown>[] = [];
  let result!: Promise<Response>;
  const put = vi.fn(async (_request, copy: Response) => { expect(await copy.text()).toBe('asset contents'); });

  runInNewContext(readFileSync(new URL('../../public/sw.js', import.meta.url), 'utf8'), {
    URL,
    self: { location: { origin: 'https://homebit.co.ke' }, addEventListener: (name: string, handler: (event: any) => void) => listeners.set(name, handler) },
    fetch: async () => response,
    caches: { match: async () => undefined, open: () => cacheReady },
  });
  listeners.get('fetch')!({
    request: { method: 'GET', url: 'https://homebit.co.ke/assets/inbox.js', mode: 'cors', destination: 'script' },
    respondWith: (promise: Promise<Response>) => { result = promise; },
    waitUntil: (promise: Promise<unknown>) => pending.push(promise),
  });
  expect(await (await result).text()).toBe('asset contents');
  openCache({ put });
  await Promise.all(pending);
  expect(put).toHaveBeenCalledOnce();
});
