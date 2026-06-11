import * as auth_pb_module from '~/grpc/generated/auth/auth_pb';
import { callUnaryGrpc, resolveAuthGrpcBaseUrl } from '~/utils/grpcRaw.server';

const auth_pb = (auth_pb_module as any).default ?? auth_pb_module;

function isValidUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
}

function resolveSignupProfileId(profileId: string): string {
  const value = String(profileId || '').trim();
  if (isValidUUID(value)) return value;

  throw Object.assign(new Error('Please choose an account profile'), {
    grpcCode: 'INVALID_ARGUMENT',
  });
}

function createPhoneVerification(authId: string, target: string) {
  return {
    id: '',
    user_id: authId,
    type: 'phone',
    status: 'pending',
    target,
    expires_at: '',
    next_resend_at: '',
    attempts: 0,
    max_attempts: 3,
    resends: 0,
    max_resends: 3,
    created_at: '',
    updated_at: '',
  };
}

export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return Response.json({ message: 'Method Not Allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const phone = String(body.phone || '').replace(/^\+/, '');
    const profileId = resolveSignupProfileId(String(body.profile_id || ''));

    const signupRequest = new auth_pb.SignupRequest();
    signupRequest.setPhone(phone);
    signupRequest.setPassword(String(body.password || ''));
    signupRequest.setFirstName(String(body.first_name || ''));
    signupRequest.setLastName(String(body.last_name || ''));
    signupRequest.setProfileId(profileId);

    const { body: responseBody } = await callUnaryGrpc(
      resolveAuthGrpcBaseUrl(request),
      '/auth.AuthService/Signup',
      signupRequest.serializeBinary(),
      body.referral_code ? { 'x-referral-code': String(body.referral_code).trim().toUpperCase() } : undefined,
    );

    const authId = String(responseBody.auth_id || responseBody.authId || '');

    return Response.json({
      auth_id: authId,
      user_profile_id: responseBody.user_profile_id || responseBody.userProfileId || '',
      profile_id: responseBody.profile_id || responseBody.profileId || profileId,
      profile_type: body.profile_type || '',
      verification: createPhoneVerification(authId, phone),
    });
  } catch (err: any) {
    return Response.json(
      {
        message: err?.message || 'Signup failed',
        grpcCode: err?.grpcCode || 'UNKNOWN',
      },
      { status: 400 },
    );
  }
}
