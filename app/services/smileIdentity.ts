/**
 * Launching Smile ID's hosted capture.
 *
 * Shared by the desktop flow and the phone that picks up a handoff, so a
 * verification continued on a phone is configured identically to one started at
 * the desk. The two must not drift: they submit to the same job.
 */

const SMILE_SCRIPT_URL = "https://cdn.smileidentity.com/inline/v11/js/script.min.js";

export interface SmileSession {
  token: string;
  job_id: string;
  user_id: string;
  product: string;
  callback_url: string;
  environment: string;
  partner_id: string;
}

export interface SmileLaunchHandlers {
  onSuccess?: () => void;
  onClose?: () => void;
  onError?: (message: string) => void;
}

declare global {
  interface Window {
    SmileIdentity?: (config: Record<string, unknown>) => void;
  }
}

let smileScriptPromise: Promise<void> | null = null;

export const loadSmileScript = (): Promise<void> => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Smile ID is only available in the browser."));
  }
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

/**
 * Opens the hosted capture for a session minted by our backend.
 *
 * Two things about this configuration are deliberate. Capture is camera only:
 * an upload lets a photocopy, a scan or a photograph of a screen through, and
 * those are what the document's security-features check rejects. And nothing
 * here asks for the back of the ID, because nothing can — Smile's hosted
 * Enhanced Document Verification page sets `hide-back-of-id` on every path
 * regardless of what we send.
 */
export const launchSmileSession = (session: SmileSession, handlers: SmileLaunchHandlers = {}) => {
  if (typeof window === "undefined" || !window.SmileIdentity) {
    throw new Error("Smile ID is not ready yet.");
  }

  window.SmileIdentity({
    token: session.token,
    product: session.product,
    callback_url: session.callback_url,
    environment: session.environment,
    id_selection: {
      KE: ["IDENTITY_CARD", "RESIDENT_ID", "PASSPORT"],
    },
    document_capture_modes: ["camera"],
    partner_details: {
      partner_id: session.partner_id,
      name: "Homebit",
      logo_url: "https://homebit.co.ke/logos/logo-dark.png",
      policy_url: "https://homebit.co.ke/privacy",
      theme_color: "#9333ea",
    },
    partner_params: {
      user_id: session.user_id,
      job_id: session.job_id,
    },
    onSuccess: () => handlers.onSuccess?.(),
    onClose: () => handlers.onClose?.(),
    onError: (smileError: { message?: string }) =>
      handlers.onError?.(smileError?.message || "Smile ID could not complete verification."),
  });
};
