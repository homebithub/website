/**
 * Deciding when a session needs renewing.
 *
 * The refresh token has been stored in a cookie since sign-up and never used:
 * the RPC existed, the token existed, and nothing ever connected them. A
 * session therefore lasted exactly as long as its access token and then ended,
 * wherever the person happened to be.
 *
 * Worth knowing while reading this: access tokens are currently issued with a
 * six-month life, so this rarely fires today. That is the reason to build it —
 * shortening that token is the real fix, and shortening it is only safe once
 * renewal works. This is the prerequisite, not the whole job.
 */

/**
 * How long before expiry to renew.
 *
 * Sized for the failure it protects against — a slow request, a tab waking
 * late — rather than for the length of the token.
 */
export const REFRESH_MARGIN_MS = 2 * 60 * 1000;

/**
 * Browsers clamp long timers and do not run them while a device sleeps, so a
 * long wait is taken in chunks and re-armed.
 */
export const MAX_TIMER_MS = 10 * 60 * 1000;

/**
 * Reads a JWT's expiry without verifying it.
 *
 * Unverified on purpose: the browser has no key, and this decides only whether
 * to renew early. The server remains the sole judge of whether a token is
 * good, so the worst a tampered expiry can cause is a wasted refresh.
 */
export function expiryOf(token: string | null | undefined): number | null {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof payload.exp !== "number") return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

export type SessionState = "fresh" | "expiring" | "expired" | "unknown";

/**
 * `unknown` is kept apart from `expired` deliberately: a token whose expiry
 * cannot be parsed may be entirely valid, and signing someone out over a
 * parsing failure would be worse than doing nothing.
 */
export function sessionState(token: string | null | undefined, now: number = Date.now()): SessionState {
  if (!token) return "expired";

  const expiry = expiryOf(token);
  if (expiry === null) return "unknown";

  if (expiry <= now) return "expired";
  if (expiry - now <= REFRESH_MARGIN_MS) return "expiring";
  return "fresh";
}

/** Never negative — a negative delay makes setTimeout fire in a tight loop. */
export function msUntilRefresh(token: string | null | undefined, now: number = Date.now()): number | null {
  const expiry = expiryOf(token);
  if (expiry === null) return null;
  return Math.max(0, expiry - now - REFRESH_MARGIN_MS);
}

export function nextTimerDelay(msUntil: number): number {
  return Math.min(msUntil, MAX_TIMER_MS);
}

/**
 * Whether holding this token means the session should be renewed now.
 *
 * Named for the question the caller is asking, so call sites do not have to
 * remember which of the four states warrant action.
 */
export function needsRenewal(token: string | null | undefined, now: number = Date.now()): boolean {
  const state = sessionState(token, now);
  return state === "expiring" || state === "expired";
}
