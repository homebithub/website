/**
 * Auth Service - gRPC-Web Client
 * 
 * Provides authentication methods using gRPC-Web protocol
 */

import { AuthServiceClient } from '~/grpc/generated/auth/auth_grpc_web_pb';
import auth_pb_module from '~/grpc/generated/auth/auth_pb';
import { GRPC_WEB_BASE_URL, handleGrpcError } from './client';
import { getAccessTokenFromCookies } from '~/utils/cookie';

// Extract proto.auth from the default export
const auth_pb = auth_pb_module as any;

// Create singleton client instance
console.log('[gRPC-Web] Initializing AuthServiceClient with base URL:', GRPC_WEB_BASE_URL);
const authClient = new AuthServiceClient(GRPC_WEB_BASE_URL, null, null);

function resolveUserId(userId: string): string {
  if (userId) return userId;
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('user_object');
      if (raw) {
        const user = JSON.parse(raw);
        return user.user_id || user.id || '';
      }
    }
  } catch {}
  return '';
}

/**
 * Get metadata with auth token and profile type
 */
function getMetadata(): { [key: string]: string } {
  const md: { [key: string]: string } = {};
  // Try cookie first, then localStorage (for production where cookie is httpOnly)
  let token = getAccessTokenFromCookies();
  if (!token && typeof window !== 'undefined') {
    token = localStorage.getItem('token') || undefined;
  }
  if (token) md['authorization'] = `Bearer ${token}`;
  try {
    if (typeof window !== 'undefined') {
      const profileType = localStorage.getItem('profile_type');
      if (profileType) md['x-profile-type'] = profileType;
    }
  } catch {}
  return md;
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
    profileType: string,
    bureauId?: string
  ): Promise<any> {
    console.log('[gRPC-Web] signup() called with:', { phone, firstName, lastName, profileType, bureauId });
    
    return new Promise((resolve, reject) => {
      try {
        const request = new auth_pb.SignupRequest();
        request.setPhone(phone);
        request.setPassword(password);
        request.setFirstName(firstName);
        request.setLastName(lastName);
        request.setProfileType(profileType);
        
        if (bureauId) {
          request.setBureauId(bureauId);
        }

        console.log('[gRPC-Web] Making signup request to:', GRPC_WEB_BASE_URL);
        
        authClient.signup(request, getMetadata(), (err, response) => {
          if (err) {
            console.error('[gRPC-Web] signup error:', err);
            reject(handleGrpcError(err));
          } else {
            console.log('[gRPC-Web] signup success:', response);
            resolve(response);
          }
        });
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

      authClient.login(request, getMetadata(), (err, response) => {
        if (err) {
          reject(handleGrpcError(err));
        } else {
          resolve(response);
        }
      });
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

      authClient.sendOTP(request, getMetadata(), (err) => {
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

      authClient.verifyOTP(request, getMetadata(), (err, response) => {
        if (err) {
          reject(handleGrpcError(err));
        } else {
          resolve(response);
        }
      });
    });
  },

  /**
   * Get current user
   */
  async getCurrentUser(userId?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new auth_pb.GetCurrentUserRequest();
      request.setUserId(resolveUserId(userId || ''));

      authClient.getCurrentUser(request, getMetadata(), (err, response) => {
        if (err) {
          reject(handleGrpcError(err));
        } else {
          resolve(response);
        }
      });
    });
  },

  /**
   * Update user phone (triggers phone verification OTP)
   */
  async updatePhone(userId: string, phone: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new auth_pb.UpdatePhoneRequest();
      request.setUserId(resolveUserId(userId));
      request.setPhone(phone);

      authClient.updatePhone(request, getMetadata(), (err, response) => {
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

      authClient.forgotPassword(request, getMetadata(), (err, response) => {
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

      authClient.updateEmail(request, getMetadata(), (err, response) => {
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

      authClient.resendOTP(request, getMetadata(), (err, response) => {
        if (err) {
          reject(handleGrpcError(err));
        } else {
          resolve(response);
        }
      });
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
  async completeGoogleSignup(googleId: string, email: string, firstName: string, lastName: string, phone: string, profileType: string, bureauId?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new auth_pb.CompleteGoogleSignupRequest();
      request.setGoogleId(googleId);
      request.setEmail(email);
      request.setFirstName(firstName);
      request.setLastName(lastName);
      request.setPhone(phone);
      request.setProfileType(profileType);
      if (bureauId) request.setBureauId(bureauId);

      authClient.completeGoogleSignup(request, getMetadata(), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response);
      });
    });
  },

  /**
   * Log out current user
   */
  async logout(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = new auth_pb.LogoutRequest();
      request.setUserId(resolveUserId(''));

      authClient.logout(request, getMetadata(), (err) => {
        if (err) {
          reject(handleGrpcError(err));
        } else {
          resolve();
        }
      });
    });
  },
};

export default authService;
