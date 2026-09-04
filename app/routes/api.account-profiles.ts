import {
  callUnaryGrpc,
  callUnaryGrpcJson,
  encodeStringField,
  resolveAuthGrpcBaseUrl,
  authMetadata,
} from '~/utils/grpcRaw.server';
import {
  REFRESH_TOKEN_COOKIE_NAME,
  TOKEN_COOKIE_NAME,
  USER_COOKIE_NAME,
  accessTokenOptions,
  cookieOptions,
  refreshTokenOptions,
  serializeCookie,
} from '~/utils/cookie';

function normalizeSwitchedUser(payload: Record<string, any>) {
  const source = payload.user && typeof payload.user === 'object' ? payload.user : {};
  const userId = String(source.id || source.user_id || source.userId || '');
  return {
    ...source,
    id: userId,
    user_id: userId,
    profile_type: String(source.profile_type || source.profileType || ''),
    profile_id: String(payload.profile_id || payload.profileId || ''),
    user_profile_id: String(payload.user_profile_id || payload.userProfileId || ''),
  };
}

export async function loader({ request }: { request: Request }) {
  try {
    const { body } = await callUnaryGrpcJson(
      resolveAuthGrpcBaseUrl(request),
      '/auth.AuthService/ListAccountProfiles',
      new Uint8Array(),
      authMetadata(request),
    );
    return Response.json({ profiles: Array.isArray(body?.profiles) ? body.profiles : [] });
  } catch (error: any) {
    return Response.json(
      { message: error?.message || 'Unable to load account profiles' },
      { status: error?.grpcCode === 'UNAUTHENTICATED' ? 401 : 400 },
    );
  }
}

export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return Response.json({ message: 'Method Not Allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const action = String(body.action || '').trim().toLowerCase();
    const baseURL = resolveAuthGrpcBaseUrl(request);
    const metadata = authMetadata(request);

    if (action === 'add') {
      const profileType = String(body.profile_type || body.profileType || '');
      const { body: created } = await callUnaryGrpcJson(
        baseURL,
        '/auth.AuthService/AddAccountProfile',
        encodeStringField(1, profileType),
        metadata,
      );
      return Response.json({ profile: created });
    }

    if (action !== 'switch') {
      return Response.json({ message: 'action must be add or switch' }, { status: 400 });
    }

    const userProfileID = String(body.user_profile_id || body.userProfileId || '');
    if (!userProfileID) {
      return Response.json({ message: 'user_profile_id is required' }, { status: 400 });
    }
    const { body: switched } = await callUnaryGrpc(
      baseURL,
      '/auth.AuthService/SwitchAccountProfile',
      encodeStringField(1, userProfileID),
      metadata,
    );
    const payload = (switched?.data && typeof switched.data === 'object'
      ? { ...switched, ...switched.data }
      : switched || {}) as Record<string, any>;
    const token = String(payload.access_token || payload.accessToken || payload.token || '');
    const refreshToken = String(payload.refresh_token || payload.refreshToken || '');
    const user = normalizeSwitchedUser(payload);
    if (!token || !user.id || !user.user_profile_id) {
      throw new Error('Profile switch returned an incomplete session');
    }

    const headers = new Headers({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    headers.append('Set-Cookie', serializeCookie(TOKEN_COOKIE_NAME, token, accessTokenOptions));
    if (refreshToken) {
      headers.append('Set-Cookie', serializeCookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, refreshTokenOptions));
    }
    headers.append('Set-Cookie', serializeCookie(USER_COOKIE_NAME, JSON.stringify(user), cookieOptions));
    return new Response(JSON.stringify({ token, user }), { status: 200, headers });
  } catch (error: any) {
    const status = error?.grpcCode === 'UNAUTHENTICATED'
      ? 401
      : error?.grpcCode === 'PERMISSION_DENIED'
        ? 403
        : 400;
    return Response.json({ message: error?.message || 'Unable to update account profile' }, { status });
  }
}

