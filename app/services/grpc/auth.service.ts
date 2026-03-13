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
function getMetadata() {
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
  async signup(email: string, password: string, phone: string, firstName: string, lastName: string, profileType: string): Promise<auth_pb.SignupResponse> {
    return new Promise((resolve, reject) => {
      const request = new auth_pb.SignupRequest();
      request.setEmail(email);
      request.setPassword(password);
      request.setPhone(phone);
      request.setFirstName(firstName);
      request.setLastName(lastName);
      request.setProfileType(profileType);

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
  async login(email: string, password: string): Promise<auth_pb.LoginResponse> {
    return new Promise((resolve, reject) => {
      const request = new auth_pb.LoginRequest();
      request.setEmail(email);
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
   */
  async sendOTP(phone: string, type: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = new auth_pb.SendOTPRequest();
      request.setPhone(phone);
      request.setType(type);

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
  async verifyOTP(phone: string, code: string, type: string): Promise<auth_pb.VerifyOTPResponse> {
    return new Promise((resolve, reject) => {
      const request = new auth_pb.VerifyOTPRequest();
      request.setPhone(phone);
      request.setCode(code);
      request.setType(type);

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
