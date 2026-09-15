import * as auth_pb_module from '~/grpc/generated/auth/auth_pb';
import { callUnaryGrpc, resolveAuthGrpcBaseUrl } from '~/utils/grpcRaw.server';
import {
  REFRESH_TOKEN_COOKIE_NAME,
  TOKEN_COOKIE_NAME,
  USER_COOKIE_NAME,
  accessTokenOptions,
  cookieOptions,
  refreshTokenOptions,
  serializeCookie,
} from '~/utils/cookie';

const auth_pb = (auth_pb_module as any).default ?? auth_pb_module;

/**
 * Signing in, with the server writing the cookies.
 *
 * The browser used to call auth directly and then write the cookies itself.
 * That cannot work here: both auth cookies are HttpOnly in a deployed
 * environment, and a browser refuses a document.cookie write when an HttpOnly
 * cookie of that name already exists — Firefox says so out loud. The first
 * server-side renewal makes them HttpOnly for good, and from that moment every
 * subsequent sign-in updated localStorage while the refresh cookie kept a token
 * auth had already rotated away. The next renewal presented it, auth refused,
 * and the person was signed out. That is the 401.
 *
 * So the server owns them. It holds the only writes that are not silently
 * discarded, which makes it the only place they can be kept true.
 */
function normalizeUser(raw: any, fallbackPhone: string, envelope: Record<string, any> = {}) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const userId = String(
    source.id || source.user_id || source.userId || source.auth_id || source.authId || '',
  );
  return {
    id: userId,
    user_id: userId,
    email: String(source.email || ''),
    phone: String(source.phone || source.phone_number || source.phoneNumber || fallbackPhone),
    first_name: String(source.first_name || source.firstName || ''),
    last_name: String(source.last_name || source.lastName || ''),
    profile_type: String(source.profile_type || source.profileType || ''),
    profile_id: String(source.profile_id || source.profileId || envelope.profile_id || ''),
    // The profile id sits beside `user` in the login result, not inside it.
    //
    // The website scopes a person's own data by this — their job listings,
    // their hiring pages — and reads it from what sign-in returned. Reading
    // only the nested copy meant it was empty on any browser that signed in
    // with a password, so those pages had nothing to scope by and showed
    // nothing of their own, while messages worked because they go by user id.
    // A browser that had signed in during the OTP era still had it stored,
    // which is what made it look like a caching problem.
    user_profile_id: String(
      source.user_profile_id || source.userProfileId
      || envelope.user_profile_id || envelope.userProfileId || '',
    ),
    is_verified: Boolean(source.is_verified ?? source.isVerified ?? false),
    profile_image: String(source.profile_image || source.profileImage || ''),
  };
}

export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return Response.json({ message: 'Method Not Allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    // Auth accepts +254…, 254… and 07… alike now, but the stored form is what
    // the rest of this response reports back.
    const phone = String(body.phone || '').replace(/^\+/, '');
    const loginRequest = new auth_pb.LoginRequest();
    loginRequest.setPhone(phone);
    loginRequest.setPassword(String(body.password || ''));

    const { body: responseBody } = await callUnaryGrpc(
      resolveAuthGrpcBaseUrl(request),
      '/auth.AuthService/Login',
      loginRequest.serializeBinary(),
    );

    const payload = (responseBody?.data && typeof responseBody.data === 'object'
      ? { ...responseBody, ...responseBody.data }
      : responseBody ?? {}) as Record<string, any>;

    const token = String(payload.access_token || payload.accessToken || payload.token || '');
    const refreshToken = String(payload.refresh_token || payload.refreshToken || '');
    const user = normalizeUser(payload.user, phone, payload);

    if (!token || !user.user_id) {
      throw Object.assign(new Error('Login succeeded but returned no session'), {
        grpcCode: 'UNKNOWN',
      });
    }

    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Cache-Control', 'no-store');
    headers.append('Set-Cookie', serializeCookie(TOKEN_COOKIE_NAME, token, accessTokenOptions));
    if (refreshToken) {
      headers.append(
        'Set-Cookie',
        serializeCookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, refreshTokenOptions),
      );
    }
    headers.append(
      'Set-Cookie',
      serializeCookie(USER_COOKIE_NAME, JSON.stringify(user), cookieOptions),
    );

    // The access token comes back in the body as well as the cookie: the access
    // cookie is HttpOnly too, and the rest of the app reads the token from
    // localStorage to put it in gRPC metadata. The refresh token deliberately
    // does not — nothing in the browser needs it, and renewal happens on the
    // server where the cookie already is.
    return new Response(JSON.stringify({ token, user }), { status: 200, headers });
  } catch (err: any) {
    const rawMessage = String(err?.message || '');
    const isLoginUnavailable =
      err?.grpcCode === 'UNIMPLEMENTED' ||
      rawMessage.toLowerCase().includes('method login not implemented');

    return Response.json(
      {
        message: isLoginUnavailable
          ? 'Password login is not available right now. Please use OTP verification or contact support.'
          : err?.message || 'Login failed',
        grpcCode: err?.grpcCode || 'UNKNOWN',
      },
      { status: 400 },
    );
  }
}
