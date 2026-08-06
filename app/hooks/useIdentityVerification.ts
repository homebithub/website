import { useCallback, useEffect, useMemo, useState } from "react";
import { kycService } from "~/services/grpc/authServices";
import { createIdentityHandoff, handoffLink, type HandoffCode } from "~/services/identityHandoff";
import { launchSmileSession, loadSmileScript, type SmileSession } from "~/services/smileIdentity";
import { getStoredUserId } from "~/utils/authStorage";

const DISMISSAL_KEY_PREFIX = "homebit_identity_verification_prompt_dismissed";

export type IdentityVerificationStatus =
  | "loading"
  | "not_started"
  | "in_progress"
  | "failed"
  | "approved";

export interface IdentityVerificationState {
  status: IdentityVerificationStatus;
  internalStatus: string;
  failureReason: string;
  canRetry: boolean;
  loading: boolean;
  launching: boolean;
  modalOpen: boolean;
  error: string;
  openModal: () => void;
  dismissModal: () => void;
  startVerification: () => Promise<void>;
  refresh: () => Promise<void>;

  /** The link behind the QR code, empty until a handoff is requested. */
  handoffLink: string;
  handoffExpiresAt: Date | null;
  handoffLoading: boolean;
  handoffError: string;
  requestHandoff: () => Promise<void>;
  clearHandoff: () => void;
}

const normalizeResponse = (response: any) => response?.data?.data ?? response?.data ?? response ?? {};

const normalizeStatus = (raw: any): {
  status: Exclude<IdentityVerificationStatus, "loading">;
  internalStatus: string;
  failureReason: string;
  canRetry: boolean;
} => {
  const verification = raw?.verification ?? {};
  const explicitStatus = String(raw?.verification_status ?? verification?.status ?? "").toLowerCase();
  const legacyStatus = String(raw?.status ?? "").toLowerCase();
  let status: Exclude<IdentityVerificationStatus, "loading"> = "not_started";

  if (["not_started", "in_progress", "failed", "approved"].includes(explicitStatus)) {
    status = explicitStatus as Exclude<IdentityVerificationStatus, "loading">;
  } else if (legacyStatus === "approved") {
    status = "approved";
  } else if (legacyStatus === "pending") {
    status = "in_progress";
  } else if (legacyStatus === "rejected" || legacyStatus === "expired") {
    status = "failed";
  }

  return {
    status,
    internalStatus: String(verification?.internal_status ?? legacyStatus),
    failureReason: String(verification?.failure_reason ?? raw?.reject_reason ?? ""),
    canRetry: Boolean(verification?.can_retry ?? status === "failed"),
  };
};

const wasDismissed = (userId: string) => {
  if (typeof window === "undefined" || !userId) return false;
  try {
    return window.localStorage.getItem(`${DISMISSAL_KEY_PREFIX}:${userId}`) === "true";
  } catch {
    return false;
  }
};

const rememberDismissal = (userId: string) => {
  if (typeof window === "undefined" || !userId) return;
  try {
    window.localStorage.setItem(`${DISMISSAL_KEY_PREFIX}:${userId}`, "true");
  } catch {
    // The banner still appears for this render if storage is unavailable.
  }
};

export function useIdentityVerification(userIdInput?: string): IdentityVerificationState {
  const userId = useMemo(() => userIdInput || getStoredUserId(), [userIdInput]);
  const [status, setStatus] = useState<IdentityVerificationStatus>("loading");
  const [internalStatus, setInternalStatus] = useState("");
  const [failureReason, setFailureReason] = useState("");
  const [canRetry, setCanRetry] = useState(false);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [handoff, setHandoff] = useState<HandoffCode | null>(null);
  const [handoffLoading, setHandoffLoading] = useState(false);
  const [handoffError, setHandoffError] = useState("");

  const refresh = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setStatus("not_started");
      return;
    }
    try {
      const response = await kycService.getMyKYC(userId);
      const next = normalizeStatus(normalizeResponse(response));
      setStatus(next.status);
      setInternalStatus(next.internalStatus);
      setFailureReason(next.failureReason);
      setCanRetry(next.canRetry);
      setError("");
    } catch (refreshError: any) {
      setError(refreshError?.message || "We could not check your verification status.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!loading && status === "not_started" && !wasDismissed(userId)) {
      setModalOpen(true);
    }
  }, [loading, status, userId]);

  useEffect(() => {
    if (status !== "in_progress") return;
    const interval = window.setInterval(() => void refresh(), 15_000);
    const handleFocus = () => void refresh();
    window.addEventListener("focus", handleFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refresh, status]);

  const openModal = useCallback(() => {
    setError("");
    setModalOpen(true);
  }, []);

  const dismissModal = useCallback(() => {
    rememberDismissal(userId);
    setModalOpen(false);
  }, [userId]);

  const startVerification = useCallback(async () => {
    if (!userId) {
      setError("Please sign in again before starting verification.");
      return;
    }
    setLaunching(true);
    setError("");
    try {
      const [, rawToken] = await Promise.all([
        loadSmileScript(),
        kycService.getSmileIDToken(userId, {}),
      ]);
      const session = normalizeResponse(rawToken) as SmileSession;
      if (!session?.token) {
        throw new Error("Smile ID did not return a valid verification session.");
      }

      setStatus("in_progress");
      setInternalStatus("session_created");
      setCanRetry(false);

      launchSmileSession(session, {
        onSuccess: () => {
          setModalOpen(false);
          setInternalStatus("submitted");
          window.dispatchEvent(new CustomEvent("homebit:identity-verification-submitted"));
          window.setTimeout(() => void refresh(), 1_500);
        },
        onClose: () => {
          setModalOpen(false);
          window.setTimeout(() => void refresh(), 500);
        },
        onError: (message: string) => setError(message),
      });
    } catch (launchError: any) {
      setError(launchError?.message || "We could not start identity verification.");
      await refresh();
    } finally {
      setLaunching(false);
    }
  }, [refresh, userId]);

  // Handing the capture to a phone.
  //
  // The code expires in ten minutes, so the panel discards it on time rather
  // than leaving a QR on screen that silently stopped working. Scanning it is
  // what tells us the phone picked it up; until then the desktop just waits, and
  // the status poll above notices the verification arriving on its own.
  const requestHandoff = useCallback(async () => {
    setHandoffError("");
    setHandoffLoading(true);
    try {
      const code = await createIdentityHandoff();
      setHandoff(code);
    } catch (handoffFailure: any) {
      setHandoff(null);
      setHandoffError(handoffFailure?.message || "We could not create a code for your phone.");
    } finally {
      setHandoffLoading(false);
    }
  }, []);

  const clearHandoff = useCallback(() => {
    setHandoff(null);
    setHandoffError("");
  }, []);

  useEffect(() => {
    if (!handoff) return;
    const remaining = handoff.expiresAt.getTime() - Date.now();
    if (remaining <= 0) {
      setHandoff(null);
      return;
    }
    const timer = window.setTimeout(() => setHandoff(null), remaining);
    return () => window.clearTimeout(timer);
  }, [handoff]);

  return {
    status,
    internalStatus,
    failureReason,
    canRetry,
    loading,
    launching,
    modalOpen,
    error,
    openModal,
    dismissModal,
    startVerification,
    refresh,
    handoffLink: handoff ? handoffLink(handoff.token) : "",
    handoffExpiresAt: handoff?.expiresAt ?? null,
    handoffLoading,
    handoffError,
    requestHandoff,
    clearHandoff,
  };
}
