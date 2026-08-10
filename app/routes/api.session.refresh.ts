import * as auth_pb_module from '~/grpc/generated/auth/auth_pb';
import { callUnaryGrpc, resolveAuthGrpcBaseUrl } from '~/utils/grpcRaw.server';
import {
  REFRESH_TOKEN_COOKIE_NAME,
  TOKEN_COOKIE_NAME,
  accessTokenOptions,
  parseCookies,
  refreshTokenOptions,
  serializeCookie,
} from '~/utils/cookie';

const auth_pb = (auth_pb_module as any).default ?? auth_pb_module;

/**
 * Renewing a session on the server, where the refresh token actually is.
 *
 * The refresh cookie is HttpOnly, so browser JavaScript can neither read it nor
 * replace it — Firefox says so out loud: "hb_refresh_token has been rejected
 * because there is already an HTTP-Only cookie but script tried to store a new
 * one". The client-side renewal path read it with document.cookie, got nothing,
 * and gave up on its first line. Every service could be wired for retry and the
 * session would still never renew, because the credential was invisible to the
 * code trying to use it.
 *
 * Doing it here needs no such access: the cookie arrives on the request, the
 * new pair is written back with Set-Cookie, and the refresh token never enters
 * a script. That is what the HttpOnly flag was for, and the reason not to
 * "solve" this by moving the token into localStorage.
 *
 * A token in the body is accepted as a fallback for sessions whose cookie was
 * written by client code — those exist today, because setAuthCookies writes the
 * cookie from JavaScript, where the HttpOnly attribute is ignored.
 */
export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return Response.json({ message: 'Method Not Allowed' }, { status: 405 });
  }

  const cookies = parseCookies(request.headers.get('cookie') || '');
  let refreshToken = cookies[REFRESH_TOKEN_COOKIE_NAME] || '';

  if (!refreshToken) {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    refreshToken = String(body.refresh_token || body.refreshToken || '');
  }

  if (!refreshToken) {
    // No credential to renew with. Not an error worth a 500: it is the ordinary
    // state of somebody who is not signed in.
    return Response.json({ message: 'No refresh token' }, { status: 401 });
  }

  try {
    const renewRequest = new auth_pb.RefreshTokenRequest();
    renewRequest.setRefreshToken(refreshToken);

    const { body: responseBody } = await callUnaryGrpc(
      resolveAuthGrpcBaseUrl(request),
      '/auth.AuthService/RefreshToken',
      renewRequest.serializeBinary(),
    );

    const payload = (responseBody ?? {}) as Record<string, unknown>;
    const token = String(payload.token || payload.access_token || payload.accessToken || '');
    const nextRefresh = String(
      payload.refresh_token || payload.refreshToken || refreshToken,
    );

    if (!token) {
      return Response.json({ message: 'Renewal returned no token' }, { status: 502 });
    }

    // Both cookies are rewritten, not just the access token: auth rotates the
    // refresh token on every use, so keeping the old one would leave the next
    // renewal holding a token that has already been spent.
    const headers = new Headers();
    headers.append('Set-Cookie', serializeCookie(TOKEN_COOKIE_NAME, token, accessTokenOptions));
    headers.append(
      'Set-Cookie',
      serializeCookie(REFRESH_TOKEN_COOKIE_NAME, nextRefresh, refreshTokenOptions),
    );
    headers.set('Cache-Control', 'no-store');
    headers.set('Content-Type', 'application/json');

    // The access token is returned as well as set, because the rest of the app
    // reads it from localStorage — the access cookie is HttpOnly in production
    // and unreadable from a script for the same reason as above.
    return new Response(JSON.stringify({ token }), { status: 200, headers });
  } catch (error: unknown) {
    // A refusal here ends the session: the refresh token has expired, been
    // rotated away, or belongs to an account the server will not renew. 401 so
    // the caller can tell that apart from a fault it should retry.
    const message = error instanceof Error ? error.message : 'Could not renew the session';
    console.warn('[session] renewal refused:', message);
    return Response.json({ message: 'Could not renew the session' }, { status: 401 });
  }
}
