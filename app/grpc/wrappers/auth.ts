/**
 * Wrapper for gRPC-Web auth client
 * This works around the CommonJS/ESM compatibility issues
 */

// Import the raw generated files
// @ts-ignore
import authGrpcWeb from '../generated/auth/auth_grpc_web_pb.js';
// @ts-ignore  
import authPb from '../generated/auth/auth_pb.js';

// Re-export with proper types
export const AuthServiceClient = authGrpcWeb.AuthServiceClient;
export const AuthServicePromiseClient = authGrpcWeb.AuthServicePromiseClient;

// Export all message types
export const SignupRequest = authPb.SignupRequest;
export const SignupResponse = authPb.SignupResponse;
export const LoginRequest = authPb.LoginRequest;
export const LoginResponse = authPb.LoginResponse;
export const SendOTPRequest = authPb.SendOTPRequest;
export const VerifyOTPRequest = authPb.VerifyOTPRequest;
export const VerifyOTPResponse = authPb.VerifyOTPResponse;

// Export the full namespace for advanced usage
export { authGrpcWeb, authPb };
