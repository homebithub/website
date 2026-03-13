/**
 * Auth Service - gRPC-Web Client
 * 
 * Provides authentication methods using gRPC-Web protocol
 */

import { AuthServiceClient } from '~/grpc/generated/auth/AuthServiceClientPb';
import * as auth_pb from '~/grpc/generated/auth/auth_pb';
import { GRPC_WEB_BASE_URL, handleGrpcError } from './client';
import { getAccessTokenFromCookies } from '~/utils/cookie';

// Create singleton client instance
const authClient = new AuthServiceClient(GRPC_WEB_BASE_URL, null, null);

/**
 * Get metadata with auth token
 */
function getMetadata(): { [key: string]: string } {
  const token = getAccessTokenFromCookies();
  if (token) {
    return {
      'authorization': `Bearer ${token}`,
    };
  }
  return {};
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
  ): Promise<auth_pb.SignupResponse> {
    return new Promise((resolve, reject) => {
      const request = new auth_pb.SignupRequest();
      request.setPhone(phone);
      request.setPassword(password);
      request.setFirstName(firstName);
      request.setLastName(lastName);
      request.setProfileType(profileType);
      
      if (bureauId) {
        request.setBureauId(bureauId);
      }

      authClient.signup(request, getMetadata(), (err, response) => {
        if (err) {
          reject(handleGrpcError(err));
        } else {
          resolve(response);
        }
      });
    });
  },

  /**
   * Log in an existing user
   */
  async login(phone: string, password: string): Promise<auth_pb.LoginResponse> {
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
   * Send OTP for verification
   * @param userId - User ID
   * @param verificationType - Type of verification (e.g., 'phone', 'email')
   * @param target - Target phone number or email
   */
  async sendOTP(userId: string, verificationType: string, target: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = new auth_pb.SendOTPRequest();
      request.setUserId(userId);
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
   * @param userId - User ID
   * @param verificationType - Type of verification
   * @param otp - OTP code
   */
  async verifyOTP(userId: string, verificationType: string, otp: string): Promise<auth_pb.VerifyOTPResponse> {
    return new Promise((resolve, reject) => {
      const request = new auth_pb.VerifyOTPRequest();
      request.setUserId(userId);
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
   * Get current authenticated user
   */
  async getCurrentUser(userId: string): Promise<auth_pb.User> {
    return new Promise((resolve, reject) => {
      const request = new auth_pb.GetCurrentUserRequest();
      request.setUserId(userId);

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
   * Log out current user
   */
  async logout(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = new auth_pb.LogoutRequest();

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
