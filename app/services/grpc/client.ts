/**
 * gRPC-Web Client Configuration
 * 
 * Provides base URL and error handling for gRPC-Web clients (google-protobuf style).
 */

import { API_BASE_URL } from '~/config/api';

export const GRPC_WEB_BASE_URL = API_BASE_URL;
export const AUTH_GRPC_WEB_BASE_URL = API_BASE_URL;

export function getGrpcErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message || '';
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && typeof (error as any).message === 'string') {
    return (error as any).message;
  }
  return '';
}

export function isLocalGatewayUrl(url: string = API_BASE_URL): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  } catch {
    return url.includes('localhost') || url.includes('127.0.0.1');
  }
}

export function isGatewayUnavailableError(error: unknown): boolean {
  const message = getGrpcErrorMessage(error).toLowerCase();
  const code = Number((error as any)?.code);
  const status = Number((error as any)?.status);
  const grpcCode = Number((error as any)?.grpcCode);

  return (
    code === 0 ||
    code === 14 ||
    status === 0 ||
    status === 14 ||
    grpcCode === 14 ||
    message.includes('http status code: 0') ||
    message.includes('connection refused') ||
    message.includes('err_connection_refused') ||
    message.includes('failed to fetch') ||
    message.includes('network error') ||
    message.includes('networkerror') ||
    message.includes('service temporarily unavailable')
  );
}

export function shouldSilenceGatewayError(error: unknown): boolean {
  return isLocalGatewayUrl() && isGatewayUnavailableError(error);
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

const SERVICE_UNAVAILABLE_MESSAGE =
  "We’re unable to reach Homebit right now. Please check your connection and try again.";
const GENERIC_ERROR_MESSAGE =
  "We couldn’t complete that request. Please try again.";

function isTechnicalErrorMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('sqlstate') ||
    lower.includes('dial tcp') ||
    lower.includes('connection refused') ||
    lower.includes('transport:') ||
    lower.includes('rpc error') ||
    lower.includes('grpc.') ||
    lower.includes('stack trace') ||
    lower.includes('does not exist') ||
    lower.includes('no such table') ||
    lower.includes('no such column')
  );
}

function friendlyError(message: string, cause: unknown, grpcCode?: string | number): Error {
  const result = new Error(message);
  result.cause = cause;
  if (grpcCode !== undefined) {
    (result as Error & { grpcCode?: string | number }).grpcCode = grpcCode;
  }
  return result;
}

/**
 * Handle gRPC errors and transform them to user-friendly messages.
 * Preserves the original error as the cause and the backend code for diagnostics.
 */
export function handleGrpcError(error: any): Error {
  const rawMessage = error.message || '';
  const grpcCode = error.code; // numeric gRPC status code

  if (isGatewayUnavailableError(error)) {
    return friendlyError(SERVICE_UNAVAILABLE_MESSAGE, error, grpcCode);
  }

  // Try to parse JSON error payload from backend
  const parsed = parseGrpcErrorMessage(rawMessage);
  if (parsed) {
    const parsedCode = parsed.code.toUpperCase();
    if (parsedCode === 'UNAVAILABLE') {
      return friendlyError(SERVICE_UNAVAILABLE_MESSAGE, error, parsed.code);
    }
    if (
      parsedCode === 'INTERNAL' ||
      parsedCode === 'UNKNOWN' ||
      parsedCode === 'DATA_LOSS' ||
      isTechnicalErrorMessage(parsed.message)
    ) {
      return friendlyError(GENERIC_ERROR_MESSAGE, error, parsed.code);
    }
    return friendlyError(parsed.message || GENERIC_ERROR_MESSAGE, error, parsed.code);
  }

  // Fallback: map numeric gRPC status codes to friendly messages
  if (grpcCode !== undefined && grpcCode !== 0) {
    const codeMessages: Record<number, string> = {
      2:  GENERIC_ERROR_MESSAGE,                                      // UNKNOWN
      3:  'Some information was invalid. Please check and try again.', // INVALID_ARGUMENT
      5:  'We couldn’t find the requested information.',              // NOT_FOUND
      6:  'That information already exists.',                          // ALREADY_EXISTS
      7:  'You do not have permission to do that.',                    // PERMISSION_DENIED
      13: GENERIC_ERROR_MESSAGE,                                      // INTERNAL
      14: SERVICE_UNAVAILABLE_MESSAGE,                                // UNAVAILABLE
      16: 'Please sign in again to continue.',                         // UNAUTHENTICATED
    };
    return friendlyError(codeMessages[grpcCode] || GENERIC_ERROR_MESSAGE, error, grpcCode);
  }

  if (isTechnicalErrorMessage(rawMessage)) {
    return friendlyError(GENERIC_ERROR_MESSAGE, error, grpcCode);
  }
  return friendlyError(rawMessage || GENERIC_ERROR_MESSAGE, error, grpcCode);
}
