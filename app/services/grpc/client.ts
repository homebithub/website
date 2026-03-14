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
 * Parse a gRPC error message that may contain JSON from the backend.
 * Backend errors look like: {"code":"ALREADY_EXISTS","message":"This phone number is already in use"}
 */
function parseGrpcErrorMessage(raw: string): { code: string; message: string } | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.message === 'string') {
      return { code: parsed.code || '', message: parsed.message };
    }
  } catch {
    // Not JSON, return null
  }
  return null;
}

/**
 * Handle gRPC errors and transform them to user-friendly messages.
 * Preserves the backend error code in error.cause for programmatic handling.
 */
export function handleGrpcError(error: any): Error {
  const rawMessage = error.message || '';
  const grpcCode = error.code; // numeric gRPC status code

  // Try to parse JSON error payload from backend
  const parsed = parseGrpcErrorMessage(rawMessage);
  if (parsed) {
    const err = new Error(parsed.message);
    (err as any).grpcCode = parsed.code; // e.g. "ALREADY_EXISTS"
    return err;
  }

  // Fallback: map numeric gRPC status codes to friendly messages
  if (grpcCode !== undefined && grpcCode !== 0) {
    const codeMessages: Record<number, string> = {
      2:  rawMessage || 'An unexpected error occurred.',           // UNKNOWN
      3:  rawMessage || 'Invalid request. Please check your input.', // INVALID_ARGUMENT
      5:  rawMessage || 'Resource not found.',                     // NOT_FOUND
      6:  rawMessage || 'Resource already exists.',                // ALREADY_EXISTS
      7:  rawMessage || 'You do not have permission.',             // PERMISSION_DENIED
      13: rawMessage || 'Internal server error.',                  // INTERNAL
      14: rawMessage || 'Service temporarily unavailable.',        // UNAVAILABLE
      16: rawMessage || 'Authentication required. Please log in.', // UNAUTHENTICATED
    };
    return new Error(codeMessages[grpcCode] || rawMessage || 'An unexpected error occurred.');
  }

  return new Error(rawMessage || 'An unexpected error occurred. Please try again.');
}
