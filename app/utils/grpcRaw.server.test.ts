import { describe, expect, it } from 'vitest';

import { authMetadata } from './grpcRaw.server';

describe('authMetadata', () => {
  it('forwards the current browser bearer token ahead of an older cookie', () => {
    const request = new Request('https://homebit.co.ke/api/job-listings', {
      headers: {
        authorization: 'Bearer current-browser-token',
        cookie: 'hb_token=legacy-cookie-token',
      },
    });

    expect(authMetadata(request)).toEqual({ authorization: 'Bearer current-browser-token' });
  });

  it('falls back to the cookie for browserless and server requests', () => {
    const request = new Request('https://homebit.co.ke/api/job-listings', {
      headers: { cookie: 'hb_token=server-cookie-token' },
    });

    expect(authMetadata(request)).toEqual({ authorization: 'Bearer server-cookie-token' });
  });
});
