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
    lower.includes('no such column') ||
    // GORM's ErrRecordNotFound. It reads like prose, so it slipped past the
    // patterns above and reached users as a bare "record not found".
    lower === 'record not found' ||
    lower.includes('gorm')
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

/**
 * Renewing a lapsed session in the middle of a call.
 *
 * The renewal timer in AuthProvider is not enough on its own, and never was.
 * It fires two minutes before expiry, which covers a tab that is awake and
 * watching the clock — and nothing else. A device that sleeps past expiry, a
 * background tab whose timers the browser has throttled, a page opened from
 * cache, or simply a request already in flight as the token turns: each of
 * those reaches the server with an expired token and, until now, failed for
 * good. The person saw "Please sign in again to continue" while holding a
 * refresh token that was valid for another year.
 *
 * Access tokens lasted six months when the timer was written, so this gap was
 * unreachable. Shortening them to fifteen minutes made it the common case.
 */

/** gRPC UNAUTHENTICATED. The server's word that this token is no longer good. */
const GRPC_UNAUTHENTICATED = 16;

/**
 * One renewal at a time, shared by every caller.
 *
 * A page makes several requests at once, so an expiry is discovered by all of
 * them within milliseconds. Without this they would each mint a replacement,
 * and — because the server rotates the refresh token on every use — all but one
 * would be spending a token that a sibling had already consumed, turning a
 * recoverable lapse into a forced sign-out.
 */
let inFlightRenewal: Promise<boolean> | null = null;

function isUnauthenticated(error: any): boolean {
  if (!error) return false;
  if (error.code === GRPC_UNAUTHENTICATED) return true;
  const message = String(error.message || '');
  return /token is expired|invalid or expired token|UNAUTHENTICATED/i.test(message);
}

async function renewSessionOnce(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (inFlightRenewal) return inFlightRenewal;

  inFlightRenewal = (async () => {
    try {
      const [{ getAuthFromCookies }, { cacheAuthSession }, authService] = await Promise.all([
        import('~/utils/cookie'),
        import('~/utils/authStorage'),
        import('./auth.service').then((m) => m.default ?? m.authService),
      ]);

      const { refreshToken } = getAuthFromCookies();
      if (!refreshToken) return false;

      const renewed = await authService.refreshSession(refreshToken);
      if (!renewed?.token) return false;

      cacheAuthSession({ token: renewed.token, refreshToken: renewed.refreshToken });
      return true;
    } catch {
      // A refusal here is the end of the session, not a transient fault: the
      // refresh token has expired, been rotated away, or belongs to an account
      // the server will no longer renew. The original UNAUTHENTICATED is
      // allowed to surface, which is the honest answer.
      return false;
    } finally {
      // Cleared in a microtask so callers that arrived during this renewal
      // still join it rather than starting a second one.
      queueMicrotask(() => {
        inFlightRenewal = null;
      });
    }
  })();

  return inFlightRenewal;
}

/**
 * Run a unary gRPC call, renewing the session once if the server says the token
 * has expired.
 *
 * `fn` is re-invoked rather than replayed, which is what makes the retry pick
 * up the new token: every call site builds its metadata inside this closure by
 * calling getMetadata(), so the second attempt reads the refreshed token from
 * storage. A call site that captured metadata beforehand would retry with the
 * stale one — none do today, and that is the property to preserve.
 *
 * Retried exactly once. A second failure means the renewal did not help, and
 * looping on it would turn one lapsed session into a stream of requests.
 */
export function callWithAuthRetry<T>(fn: (cb: (err: any, res: T) => void) => void): Promise<T> {
  const attempt = () =>
    new Promise<T>((resolve, reject) => {
      fn((err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });

  return attempt().catch(async (error) => {
    if (!isUnauthenticated(error)) throw handleGrpcError(error);
    const renewed = await renewSessionOnce();
    if (!renewed) throw handleGrpcError(error);
    return attempt().catch((retryError) => {
      throw handleGrpcError(retryError);
    });
  });
}
