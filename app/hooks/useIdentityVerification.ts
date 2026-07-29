import { useCallback, useEffect, useMemo, useState } from "react";
import { kycService } from "~/services/grpc/authServices";
import { getStoredUserId } from "~/utils/authStorage";

const SMILE_SCRIPT_URL = "https://cdn.smileidentity.com/inline/v11/js/script.min.js";
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
}
interface SmileTokenResponse {
  token: string;
  job_id: string;
  user_id: string;
  product: string;
  callback_url: string;
  environment: string;
  partner_id: string;
}

declare global {
  interface Window {
    SmileIdentity?: (config: Record<string, unknown>) => void;
  }
}

let smileScriptPromise: Promise<void> | null = null;

const loadSmileScript = (): Promise<void> => {
  if (typeof window === "undefined") return Promise.reject(new Error("Smile ID is only available in the browser."));
  if (window.SmileIdentity) return Promise.resolve();
  if (smileScriptPromise) return smileScriptPromise;

  smileScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-smileid-sdk='web']");
    const script = existing ?? document.createElement("script");
    const handleLoad = () => {
      if (window.SmileIdentity) resolve();
      else reject(new Error("Smile ID loaded without its verification client."));
    };
    const handleError = () => {
      smileScriptPromise = null;
      reject(new Error("We could not load Smile ID. Check your connection and try again."));
    };

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    if (!existing) {
      script.src = SMILE_SCRIPT_URL;
      script.async = true;
      script.dataset.smileidSdk = "web";
      document.body.appendChild(script);
    }
  });
  return smileScriptPromise;
};

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
      const token = normalizeResponse(rawToken) as SmileTokenResponse;
      if (!token?.token || !window.SmileIdentity) {
        throw new Error("Smile ID did not return a valid verification session.");
      }

      setStatus("in_progress");
      setInternalStatus("session_created");
      setCanRetry(false);

      window.SmileIdentity({
        token: token.token,
        product: token.product,
        callback_url: token.callback_url,
        environment: token.environment,
        id_selection: {
          KE: ["IDENTITY_CARD", "RESIDENT_ID", "PASSPORT"],
        },
        document_capture_modes: ["camera", "upload"],
        use_new_component: true,
        partner_details: {
          partner_id: token.partner_id,
          name: "Homebit",
          logo_url: "https://homebit.co.ke/logos/logo-dark.png",
          policy_url: "https://homebit.co.ke/privacy",
          theme_color: "#9333ea",
        },
        partner_params: {
          user_id: token.user_id,
          job_id: token.job_id,
        },
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
        onError: (smileError: { message?: string }) => {
          setError(smileError?.message || "Smile ID could not complete verification.");
        },
      });
    } catch (launchError: any) {
      setError(launchError?.message || "We could not start identity verification.");
      await refresh();
    } finally {
      setLaunching(false);
    }
  }, [refresh, userId]);

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
  };
}
