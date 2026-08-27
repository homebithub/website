import { afterEach, describe, expect, it, vi } from 'vitest';

import { SupportRequestError, supportService } from './support.service';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('supportService messages', () => {
  it('keeps the scoped support token out of the URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ chat: {}, messages: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
    vi.stubGlobal('fetch', fetchMock);

    await supportService.messages('ticket-id', 'scoped-secret');

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/v1/support/chats/ticket-id/messages');
    expect(url).not.toContain('access_token');
    expect(url).not.toContain('scoped-secret');
    expect(init.headers).toMatchObject({ 'X-Support-Token': 'scoped-secret' });
  });

  it('preserves the status needed to retire a missing browser ticket', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'Chat not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })));

    await expect(supportService.messages('missing-ticket', 'expired-secret')).rejects.toMatchObject({
      name: 'SupportRequestError',
      status: 404,
      message: 'Chat not found',
    } satisfies Partial<SupportRequestError>);
  });
});
