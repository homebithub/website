/**
 * Auth Service - gRPC-Web Client
 * 
 * Provides authentication methods using gRPC-Web protocol
 */

import { createChannel, createClientFactory, Metadata } from 'nice-grpc-web';
import { 
  AuthServiceDefinition,
  type AuthServiceClient,
  type SignupRequest,
  type SignupResponse,
  type LoginRequest,
  type LoginResponse,
  type SendOTPRequest,
  type VerifyOTPRequest,
  type VerifyOTPResponse,
} from '~/grpc/generated/auth/auth';
import { GRPC_WEB_BASE_URL, handleGrpcError } from './client';
import { getAccessTokenFromCookies } from '~/utils/cookie';

// Create gRPC-Web channel
const channel = createChannel(GRPC_WEB_BASE_URL);

// Create client factory
const clientFactory = createClientFactory();

// Create singleton client instance
console.log('[gRPC-Web] Initializing AuthServiceClient with base URL:', GRPC_WEB_BASE_URL);
const authClient: AuthServiceClient = clientFactory.create(AuthServiceDefinition, channel);

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
  ): Promise<SignupResponse> {
    console.log('[gRPC-Web] signup() called with:', { phone, firstName, lastName, profileType, bureauId });
    
    try {
      const request: SignupRequest = {
        phone,
        password,
        firstName,
        lastName,
        profileType,
        bureauId: bureauId || '',
        householdId: '',
        dateOfBirth: '',
        signedDate: '',
      };

      console.log('[gRPC-Web] Making signup request to:', GRPC_WEB_BASE_URL);
      
      const response = await authClient.signup(request, {
        metadata: Metadata(getMetadata()),
      });
      
      console.log('[gRPC-Web] signup success:', response);
      return response;
    } catch (error) {
      console.error('[gRPC-Web] signup error:', error);
      throw handleGrpcError(error);
    }
  },

  /**
   * Log in an existing user
   */
  async login(phone: string, password: string): Promise<LoginResponse> {
    try {
      const request: LoginRequest = {
        phone,
        password,
      };

      const response = await authClient.login(request, {
        metadata: Metadata(getMetadata()),
      });
      
      return response;
    } catch (error) {
      throw handleGrpcError(error);
    }
  },

  /**
   * Send OTP to user
   */
  async sendOTP(userId: string, verificationType: string, target: string): Promise<void> {
    try {
      const request: SendOTPRequest = {
        userId,
        verificationType,
        target,
      };

      await authClient.sendOTP(request, {
        metadata: Metadata(getMetadata()),
      });
    } catch (error) {
      throw handleGrpcError(error);
    }
  },

  /**
   * Verify OTP
   */
  async verifyOTP(userId: string, verificationType: string, otp: string): Promise<VerifyOTPResponse> {
    try {
      const request: VerifyOTPRequest = {
        userId,
        verificationType,
        otp,
      };

      const response = await authClient.verifyOTP(request, {
        metadata: Metadata(getMetadata()),
      });
      
      return response;
    } catch (error) {
      throw handleGrpcError(error);
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<any> {
    try {
      const response = await authClient.getCurrentUser({}, {
        metadata: Metadata(getMetadata()),
      });
      
      return response;
    } catch (error) {
      throw handleGrpcError(error);
    }
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
