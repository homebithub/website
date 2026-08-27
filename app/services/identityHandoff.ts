/**
 * Moving an identity verification to the phone.
 *
 * Documents are captured by camera only, which is right for a phone and poor on
 * a desktop — a webcam photographs an ID card badly, and plenty of desktops have
 * no camera at all. These two calls back the QR code that hands the session over.
 *
 * REST rather than gRPC-Web because the phone's half runs on a page with no
 * session: the single-use code in the link is the whole authorisation.
 */

import { API_BASE_URL, getAuthHeaders } from "~/config/api";
import type { SmileSession } from "~/services/smileIdentity";

export interface HandoffCode {
  token: string;
  expiresAt: Date;
}

const readError = async (response: Response, fallback: string): Promise<string> => {
  try {
    const body = await response.json();
    return String(body?.error || fallback);
  } catch {
    return fallback;
  }
};

/** Issues the code the desktop renders as a QR. Authenticated. */
export const createIdentityHandoff = async (): Promise<HandoffCode> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/kyc/smileid/handoff`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(await readError(response, "We could not create a code for your phone."));
  }
  const body = await response.json();
  if (!body?.token) {
    throw new Error("We could not create a code for your phone.");
  }
  return { token: String(body.token), expiresAt: new Date(String(body.expires_at)) };
};

/**
 * Exchanges a scanned code for a verification session. Public by design — the
 * phone has no session, and this is the only thing the code buys.
 */
export const redeemIdentityHandoff = async (token: string): Promise<SmileSession> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/kyc/smileid/handoff/redeem`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!response.ok) {
    throw new Error(
      await readError(
        response,
        "This link has expired or has already been used. Please scan a new code from your computer.",
      ),
    );
  }
  return (await response.json()) as SmileSession;
};

/** Records that the phone capture was accepted, using the redeemed QR secret. */
export const confirmIdentityHandoffSubmission = async (token: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/kyc/smileid/handoff/submitted`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  if (!response.ok) {
    throw new Error(await readError(response, "We could not confirm that your photos were received."));
  }
};

/**
 * The link the QR encodes, built from the page's own origin so it is correct on
 * localhost, staging and production without another configured URL to keep in
 * step. The token is the only thing in it — nothing identifies the account to
 * anyone reading the code off a screen.
 */
export const handoffLink = (token: string): string => {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}/verify/continue?t=${encodeURIComponent(token)}`;
};
