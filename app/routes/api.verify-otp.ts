import * as auth_pb_module from '~/grpc/generated/auth/auth_pb';
import { callUnaryGrpc, resolveAuthGrpcBaseUrl } from '~/utils/grpcRaw.server';

const auth_pb = (auth_pb_module as any).default ?? auth_pb_module;

function normalizeUser(raw: any) {
  if (!raw) return null;
  return {
    user_id: raw.id || raw.user_id || raw.userId || '',
    email: raw.email || '',
    phone: raw.phone || raw.phone_number || raw.phoneNumber || '',
    first_name: raw.first_name || raw.firstName || '',
    last_name: raw.last_name || raw.lastName || '',
    profile_type: raw.profile_type || raw.profileType || '',
    profile_id: raw.profile_id || raw.profileId || '',
    user_profile_id: raw.user_profile_id || raw.userProfileId || '',
    is_verified: Boolean(raw.is_verified ?? raw.isVerified ?? raw.email_verified ?? raw.emailVerified ?? false),
    profile_image: raw.profile_image || raw.profileImage || '',
  };
}

export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return Response.json({ message: 'Method Not Allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const verifyRequest = new auth_pb.VerifyOTPRequest();
    verifyRequest.setUserId(String(body.user_id || ''));
    verifyRequest.setVerificationType(String(body.verification_type || 'phone'));
    verifyRequest.setOtp(String(body.otp || ''));

    const { body: responseBody } = await callUnaryGrpc(
      resolveAuthGrpcBaseUrl(request),
      '/auth.AuthService/VerifyOTP',
      verifyRequest.serializeBinary(),
    );

    return Response.json({
      verified: Boolean(responseBody.verified),
      token: responseBody.access_token || responseBody.accessToken || '',
      refresh_token: responseBody.refresh_token || responseBody.refreshToken || '',
      user: normalizeUser(responseBody.user),
      user_profile_id:
        responseBody.user_profile_id ||
        responseBody.userProfileId ||
        (responseBody.user as any)?.user_profile_id ||
        (responseBody.user as any)?.userProfileId ||
        '',
      profile_id:
        responseBody.profile_id ||
        responseBody.profileId ||
        (responseBody.user as any)?.profile_id ||
        (responseBody.user as any)?.profileId ||
        '',
    });
  } catch (err: any) {
    return Response.json(
      {
        message: err?.message || 'OTP verification failed',
        grpcCode: err?.grpcCode || 'UNKNOWN',
      },
      { status: 400 },
    );
  }
}
