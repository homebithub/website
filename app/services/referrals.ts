/**
 * Referral codes.
 *
 * Entering one is the whole point of the prompt shown after signup: the
 * response always carries a verdict, including the step still outstanding
 * before the reward lands, so nobody types a code and is left guessing.
 */

import { API_BASE_URL, getAuthHeaders } from "~/config/api";

/** Where a code captured from a ?ref= link waits until the person has an account. */
const PENDING_CODE_KEY = "homebit_pending_referral_code";

export interface MyReferralCode {
  available: boolean;
  code?: string;
  program?: string;
  headline?: string;
  /** What the owner gets for sharing it. */
  benefit?: string;
  /** What someone gets for entering one — the sentence the prompt needs. */
  invitee_benefit?: string;
}

export interface RedeemOutcome {
  applied: boolean;
  program: string;
  message: string;
  /** Steps the person still has to finish before the reward lands. */
  outstanding: string[];
}

const readError = async (response: Response, fallback: string): Promise<string> => {
  try {
    const body = await response.json();
    return String(body?.error || fallback);
  } catch {
    return fallback;
  }
};

export const fetchMyReferralCode = async (): Promise<MyReferralCode> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/referrals/me`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error(await readError(response, "We could not load your referral code."));
  return (await response.json()) as MyReferralCode;
};

export const redeemReferralCode = async (code: string): Promise<RedeemOutcome> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/referrals/redeem`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ code }),
  });
  if (!response.ok) throw new Error(await readError(response, "We could not apply that code."));
  return (await response.json()) as RedeemOutcome;
};

/**
 * Remembers a code someone arrived with.
 *
 * A referral link lands on the signup page, but the code cannot be spent until
 * there is an account to attach it to — and asking for it on the signup form
 * meant asking before the person had seen what they were joining. So it waits
 * here and prefills the prompt afterwards.
 */
export const rememberPendingCode = (code: string) => {
  if (typeof window === "undefined") return;
  const trimmed = code.trim();
  if (!trimmed) return;
  try {
    window.sessionStorage.setItem(PENDING_CODE_KEY, trimmed.toUpperCase());
  } catch {
    // Private browsing. The prompt still appears; it just starts empty.
  }
};

export const takePendingCode = (): string => {
  if (typeof window === "undefined") return "";
  try {
    const code = window.sessionStorage.getItem(PENDING_CODE_KEY) ?? "";
    window.sessionStorage.removeItem(PENDING_CODE_KEY);
    return code;
  } catch {
    return "";
  }
};
