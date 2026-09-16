import { afterEach, describe, expect, it, vi } from 'vitest';

import { getAccessTokenFromCookies } from './cookie';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getAccessTokenFromCookies', () => {
  it('uses the current browser session before a readable legacy cookie', () => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => key === 'token' ? 'current-session-token' : null),
    });
    vi.stubGlobal('document', { cookie: 'hb_token=legacy-account-token' });

    expect(getAccessTokenFromCookies()).toBe('current-session-token');
  });

  it('keeps an explicit server cookie header authoritative', () => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', { getItem: vi.fn(() => 'browser-token') });

    expect(getAccessTokenFromCookies('hb_token=server-request-token')).toBe('server-request-token');
  });
});
