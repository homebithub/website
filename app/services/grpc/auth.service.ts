/**
 * Auth Service - gRPC-Web Client
 * 
 * Provides authentication methods using gRPC-Web protocol
 */

import * as auth_grpc_web_module from '~/grpc/generated/auth/auth_grpc_web_pb';
import * as auth_pb_module from '~/grpc/generated/auth/auth_pb';
import * as shared_pb_module from '~/grpc/generated/shared/shared_pb';
import * as grpcWeb from 'grpc-web';
import { AUTH_GRPC_WEB_BASE_URL, handleGrpcError } from './client';
import {
  getStoredAccessToken,
  getStoredProfileType,
  getStoredUser,
  getStoredUserId,
} from '~/utils/authStorage';

// Extract proto.auth from the default export
const auth_pb = (auth_pb_module as any).default ?? auth_pb_module;
const shared_pb = (shared_pb_module as any).default ?? shared_pb_module;
const { AuthServiceClient, AdminAuthServiceClient } = auth_grpc_web_module as any;

const authClient = new AuthServiceClient(AUTH_GRPC_WEB_BASE_URL, null, null);
const adminAuthClient = new AdminAuthServiceClient(AUTH_GRPC_WEB_BASE_URL, null, null);
const authBinaryClient = new (grpcWeb as any).GrpcWebClientBase({ format: 'binary' });
const authHostname = AUTH_GRPC_WEB_BASE_URL.replace(/\/+$/, '');

const methodDescriptorAuthSignup = new (grpcWeb as any).MethodDescriptor(
  '/auth.AuthService/Signup',
  (grpcWeb as any).MethodType.UNARY,
  auth_pb.SignupRequest,
  shared_pb.GenericResponse,
  (request: any) => request.serializeBinary(),
  shared_pb.GenericResponse.deserializeBinary
);

const methodDescriptorAuthLogin = new (grpcWeb as any).MethodDescriptor(
  '/auth.AuthService/Login',
  (grpcWeb as any).MethodType.UNARY,
  auth_pb.LoginRequest,
  shared_pb.GenericResponse,
  (request: any) => request.serializeBinary(),
  shared_pb.GenericResponse.deserializeBinary
);

const methodDescriptorAuthCompleteGoogleSignup = new (grpcWeb as any).MethodDescriptor(
  '/auth.AuthService/CompleteGoogleSignup',
  (grpcWeb as any).MethodType.UNARY,
  auth_pb.CompleteGoogleSignupRequest,
  auth_pb.SignupResponse,
  (request: any) => request.serializeBinary(),
  auth_pb.SignupResponse.deserializeBinary
);

const methodDescriptorAuthVerifyOTP = new (grpcWeb as any).MethodDescriptor(
  '/auth.AuthService/VerifyOTP',
  (grpcWeb as any).MethodType.UNARY,
  auth_pb.VerifyOTPRequest,
  shared_pb.GenericResponse,
  (request: any) => request.serializeBinary(),
  shared_pb.GenericResponse.deserializeBinary
);

const methodDescriptorAuthResendOTP = new (grpcWeb as any).MethodDescriptor(
  '/auth.AuthService/ResendOTP',
  (grpcWeb as any).MethodType.UNARY,
  auth_pb.ResendOTPRequest,
  shared_pb.GenericResponse,
  (request: any) => request.serializeBinary(),
  shared_pb.GenericResponse.deserializeBinary
);

function resolveUserId(userId: string): string {
  if (userId) return userId;
  return getStoredUserId();
}

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

const SIGNUP_PROFILE_ID_ENV_KEYS: Record<string, string[]> = {
  household: ['HOUSEHOLD_PROFILE_ID', 'VITE_HOUSEHOLD_PROFILE_ID', 'PUBLIC_HOUSEHOLD_PROFILE_ID'],
  househelp: ['HOUSEHELP_PROFILE_ID', 'VITE_HOUSEHELP_PROFILE_ID', 'PUBLIC_HOUSEHELP_PROFILE_ID'],
};

const FALLBACK_SIGNUP_PROFILE_IDS: Record<string, string> = {
  household: '11d1c188-33fa-4eef-b1e7-2e09a2e8d2f1',
  househelp: '6dbd5104-d314-4ef1-a7d3-37d7eb26ddff',
};

function getRuntimeEnvValue(key: string): string {
  const windowEnv = typeof window !== 'undefined' ? (window as any).ENV?.[key] : undefined;
  const processEnv = typeof process !== 'undefined' ? (process as any).env?.[key] : undefined;
  return String(windowEnv || processEnv || '').trim();
}

function resolveSignupProfileId(profileTypeOrId: string): string {
  const value = profileTypeOrId.trim();
  if (isValidUUID(value)) {
    return value;
  }

  const envKeys = SIGNUP_PROFILE_ID_ENV_KEYS[value.toLowerCase()];
  const profileId = envKeys?.map(getRuntimeEnvValue).find(Boolean) || FALLBACK_SIGNUP_PROFILE_IDS[value.toLowerCase()] || '';

  if (isValidUUID(profileId)) {
    return profileId;
  }

  throw new Error(
    `Signup profile ID is not configured for "${value}". Set ${envKeys?.[0] || 'HOUSEHOLD_PROFILE_ID'} to the matching homebit-auth profile.id.`
  );
}

/**
 * Get metadata with auth token and profile type
 */
function getMetadata(extra?: { [key: string]: string }): { [key: string]: string } {
  const md: { [key: string]: string } = {};
  const token = getStoredAccessToken();
  if (token) md['authorization'] = `Bearer ${token}`;
  const profileType = getStoredProfileType();
  if (profileType) md['x-profile-type'] = profileType;
  if (extra) {
    Object.entries(extra).forEach(([key, value]) => {
      if (value) md[key] = value;
    });
  }
  return md;
}

function buildReferralMetadata(referralCode?: string): { [key: string]: string } {
  const normalized = referralCode?.trim();
  if (!normalized) {
    return {};
  }
  return { 'x-referral-code': normalized.toUpperCase() };
}

/**
 * Auth Service API
 */
export const authService = {
  /**
   * Sign up a new user
   */
  async signup(
    phone: string,
    password: string,
    firstName: string,
    lastName: string,
    profileTypeOrId: string,
    bureauId?: string,
    referralCode?: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const profileId = resolveSignupProfileId(profileTypeOrId);
        const request = new auth_pb.SignupRequest();
        request.setPhone(phone);
        request.setPassword(password);
        request.setFirstName(firstName);
        request.setLastName(lastName);
        if (typeof request.setProfileId === 'function') {
          request.setProfileId(profileId);
        } else {
          request.setProfileType(profileId);
        }
        
        if (bureauId) {
          request.setBureauId(bureauId);
        }

        authBinaryClient.rpcCall(
          authHostname + '/auth.AuthService/Signup',
          request,
          getMetadata(buildReferralMetadata(referralCode)),
          methodDescriptorAuthSignup,
          (err: any, response: any) => {
            if (err) {
              console.error('[gRPC-Web] signup error:', err);
              reject(handleGrpcError(err));
            } else {
              resolve(response);
            }
          }
        );
      } catch (error) {
        console.error('[gRPC-Web] signup exception:', error);
        reject(error);
      }
    });
  },

  /**
   * Log in an existing user
   */
  async login(phone: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new auth_pb.LoginRequest();
      request.setPhone(phone);
      request.setPassword(password);

      authBinaryClient.rpcCall(
        authHostname + '/auth.AuthService/Login',
        request,
        getMetadata(),
        methodDescriptorAuthLogin,
        (err: any, response: any) => {
          if (err) {
            reject(handleGrpcError(err));
          } else {
            resolve(response);
          }
        }
      );
    });
  },

  /**
   * Send OTP to user
   */
  async sendOTP(userId: string, verificationType: string, target: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = new auth_pb.SendOTPRequest();
      request.setUserId(resolveUserId(userId));
      request.setVerificationType(verificationType);
      request.setTarget(target);

      authClient.sendOTP(request, getMetadata(), (err: any) => {
        if (err) {
          reject(handleGrpcError(err));
        } else {
          resolve();
        }
      });
    });
  },

  /**
   * Verify OTP
   */
  async verifyOTP(userId: string, verificationType: string, otp: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new auth_pb.VerifyOTPRequest();
      request.setUserId(resolveUserId(userId));
      request.setVerificationType(verificationType);
      request.setOtp(otp);

      authBinaryClient.rpcCall(
        authHostname + '/auth.AuthService/VerifyOTP',
        request,
        getMetadata(),
        methodDescriptorAuthVerifyOTP,
        (err: any, response: any) => {
          if (err) {
            reject(handleGrpcError(err));
          } else {
            resolve(response);
          }
        }
      );
    });
  },

  /**
   * Get current user
   */
  async getCurrentUser(userId?: string): Promise<any> {
    const cachedUser = getStoredUser();
    const resolvedUserId = userId || cachedUser?.user_id || cachedUser?.id || getStoredUserId();

    return {
      getId: () => resolvedUserId || '',
      getEmail: () => cachedUser?.email || '',
      getPhone: () => cachedUser?.phone || cachedUser?.phone_number || '',
      getFirstName: () => cachedUser?.first_name || cachedUser?.firstName || '',
      getLastName: () => cachedUser?.last_name || cachedUser?.lastName || '',
      getProfileType: () => cachedUser?.profile_type || cachedUser?.profileType || getStoredProfileType() || '',
      getIsVerified: () => Boolean(cachedUser?.is_verified ?? cachedUser?.isVerified ?? true),
      getProfileImage: () => cachedUser?.profile_image || cachedUser?.profileImage || '',
    };
  },

  /**
   * Update user phone (triggers phone verification OTP)
   */
  async updatePhone(userId: string, phone: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new auth_pb.UpdatePhoneRequest();
      request.setUserId(resolveUserId(userId));
      request.setPhone(phone);

      authClient.updatePhone(request, getMetadata(), (err: any, response: any) => {
        if (err) {
          reject(handleGrpcError(err));
        } else {
          resolve(response);
        }
      });
    });
  },

  /**
   * Forgot password (sends OTP to phone)
   */
  async forgotPassword(phone: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new auth_pb.ForgotPasswordRequest();
      request.setPhone(phone);

      authClient.forgotPassword(request, getMetadata(), (err: any, response: any) => {
        if (err) {
          reject(handleGrpcError(err));
        } else {
          resolve(response);
        }
      });
    });
  },

  /**
   * Update user email (triggers email verification OTP)
   */
  async updateEmail(userId: string, email: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new auth_pb.UpdateEmailRequest();
      request.setUserId(resolveUserId(userId));
      request.setEmail(email);

      authClient.updateEmail(request, getMetadata(), (err: any, response: any) => {
        if (err) {
          reject(handleGrpcError(err));
        } else {
          resolve(response);
        }
      });
    });
  },

  /**
   * Resend OTP
   */
  async resendOTP(userId: string, verificationType: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new auth_pb.ResendOTPRequest();
      request.setUserId(resolveUserId(userId));
      request.setVerificationType(verificationType);

      authBinaryClient.rpcCall(
        authHostname + '/auth.AuthService/ResendOTP',
        request,
        getMetadata(),
        methodDescriptorAuthResendOTP,
        (err: any, response: any) => {
          if (err) {
            reject(handleGrpcError(err));
          } else {
            resolve(response);
          }
        }
      );
    });
  },

  /**
   * Change password (authenticated user)
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = new auth_pb.ChangePasswordRequest();
      request.setUserId(resolveUserId(userId));
      request.setCurrentPassword(currentPassword);
      request.setNewPassword(newPassword);

      authClient.changePassword(request, getMetadata(), (err: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve();
      });
    });
  },

  /**
   * Reset password (after forgot-password OTP verification)
   */
  async resetPassword(userId: string, newPassword: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new auth_pb.ResetPasswordRequest();
      request.setUserId(resolveUserId(userId));
      request.setNewPassword(newPassword);

      authClient.resetPassword(request, getMetadata(), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response);
      });
    });
  },

  /**
   * Update user profile fields (name, etc.)
   */
  async updateUser(userId: string, fields: { email?: string; firstName?: string; lastName?: string; phone?: string }): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new auth_pb.UpdateUserRequest();
      request.setUserId(resolveUserId(userId));
      if (fields.email) request.setEmail(fields.email);
      if (fields.firstName) request.setFirstName(fields.firstName);
      if (fields.lastName) request.setLastName(fields.lastName);
      if (fields.phone) request.setPhone(fields.phone);

      authClient.updateUser(request, getMetadata(), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response);
      });
    });
  },

  /**
   * Get Google OAuth URL
   */
  async getGoogleAuthURL(flow: string, state?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new auth_pb.GetGoogleAuthURLRequest();
      request.setFlow(flow);
      if (state) request.setState(state);

      authClient.getGoogleAuthURL(request, getMetadata(), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response);
      });
    });
  },

  /**
   * Complete Google signup (add phone + profile type to Google-authed user)
   */
  async completeGoogleSignup(googleId: string, email: string, firstName: string, lastName: string, phone: string, profileType: string, bureauId?: string, referralCode?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new auth_pb.CompleteGoogleSignupRequest();
      request.setGoogleId(googleId);
      request.setEmail(email);
      request.setFirstName(firstName);
      request.setLastName(lastName);
      request.setPhone(phone);
      request.setProfileType(profileType);
      if (bureauId) request.setBureauId(bureauId);

      authBinaryClient.rpcCall(
        authHostname + '/auth.AuthService/CompleteGoogleSignup',
        request,
        getMetadata(buildReferralMetadata(referralCode)),
        methodDescriptorAuthCompleteGoogleSignup,
        (err: any, response: any) => {
          if (err) reject(handleGrpcError(err));
          else resolve(response);
        }
      );
    });
  },

  /**
   * Log out current user
   */
  async logout(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = new auth_pb.LogoutRequest();
      request.setUserId(resolveUserId(''));

      authClient.logout(request, getMetadata(), (err: any) => {
        if (err) {
          reject(handleGrpcError(err));
        } else {
          resolve();
        }
      });
    });
  },

  checkIsAdmin(email: string): Promise<boolean> {
    const request = new auth_pb.CheckIsAdminRequest();
    request.setEmail(email);
    return new Promise((resolve) => {
      adminAuthClient.checkIsAdmin(request, getMetadata(), (err: any, response: any) => {
        if (err || !response) {
          resolve(false);
        } else {
          resolve(response.getIsAdmin());
        }
      });
    });
  },
};

export default authService;
