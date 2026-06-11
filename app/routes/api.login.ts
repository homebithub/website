import * as auth_pb_module from '~/grpc/generated/auth/auth_pb';
import { callUnaryGrpc, resolveAuthGrpcBaseUrl } from '~/utils/grpcRaw.server';

const auth_pb = (auth_pb_module as any).default ?? auth_pb_module;

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
    const loginRequest = new auth_pb.LoginRequest();
    loginRequest.setPhone(phone);
    loginRequest.setPassword(String(body.password || ''));

    const { body: responseBody } = await callUnaryGrpc(
      resolveAuthGrpcBaseUrl(request),
      '/auth.AuthService/Login',
      loginRequest.serializeBinary(),
    );

    const authId = String(responseBody.auth_id || responseBody.authId || '');
    if (!authId) {
      throw Object.assign(new Error('Login succeeded but no auth ID was returned'), {
        grpcCode: 'UNKNOWN',
      });
    }

    return Response.json({
      auth_id: authId,
      user_id: authId,
      verification: createPhoneVerification(authId, phone),
    });
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
