/**
 * gRPC-Web Client Configuration
 * 
 * Provides base configuration and utilities for gRPC-Web clients
 */

import { GrpcWebFetchTransport } from '@protobuf-ts/grpcweb-transport';
import type { RpcOptions } from '@protobuf-ts/runtime-rpc';
import { getAccessTokenFromCookies } from '~/utils/cookie';

// Get gRPC-Web endpoint from environment or default to gateway
const getGrpcWebBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1') {
      return `${window.location.protocol}//${window.location.hostname}:3005`;
    }
  }
  return 'https://api.homebit.co.ke';
};

export const GRPC_WEB_BASE_URL = getGrpcWebBaseUrl();

/**
 * Create a gRPC-Web transport with auth interceptor
 */
export function createGrpcTransport(baseUrl: string = GRPC_WEB_BASE_URL) {
  return new GrpcWebFetchTransport({
    baseUrl,
    // Add auth token to all requests
    interceptors: [
      {
        interceptUnary(next, method, input, options) {
          const token = getAccessTokenFromCookies();
          if (token) {
            options.meta = {
              ...options.meta,
              authorization: `Bearer ${token}`,
            };
          }
          return next(method, input, options);
        },
      },
    ],
  });
}

/**
 * Default RPC options with timeout and retry
 */
export const defaultRpcOptions: RpcOptions = {
  timeout: 30000, // 30 seconds
};

/**
 * Create RPC options with custom timeout
 */
export function createRpcOptions(timeout?: number): RpcOptions {
  return {
    ...defaultRpcOptions,
    ...(timeout ? { timeout } : {}),
  };
}

/**
 * Handle gRPC errors and transform them to user-friendly messages
 */
export function handleGrpcError(error: any): Error {
  // Extract error message from gRPC error
  if (error.message) {
    return new Error(error.message);
  }
  
  if (error.code) {
    switch (error.code) {
      case 'UNAUTHENTICATED':
        return new Error('Authentication required. Please log in.');
      case 'PERMISSION_DENIED':
        return new Error('You do not have permission to perform this action.');
      case 'NOT_FOUND':
        return new Error('Resource not found.');
      case 'ALREADY_EXISTS':
        return new Error('Resource already exists.');
      case 'INVALID_ARGUMENT':
        return new Error('Invalid request. Please check your input.');
      case 'UNAVAILABLE':
        return new Error('Service temporarily unavailable. Please try again.');
      case 'DEADLINE_EXCEEDED':
        return new Error('Request timeout. Please try again.');
      default:
        return new Error('An unexpected error occurred. Please try again.');
    }
  }
  
  return new Error('An unexpected error occurred. Please try again.');
}
