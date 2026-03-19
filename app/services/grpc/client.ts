/**
 * gRPC-Web Client Configuration
 * 
 * Provides base URL and error handling for gRPC-Web clients (google-protobuf style).
 */

import { API_BASE_URL } from '~/config/api';

export const GRPC_WEB_BASE_URL = API_BASE_URL;

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
