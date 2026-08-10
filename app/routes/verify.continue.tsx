import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { CheckCircle2, Fingerprint, RefreshCw, ShieldCheck } from "lucide-react";
import { redeemIdentityHandoff } from "~/services/identityHandoff";
import { launchSmileSession, loadSmileScript } from "~/services/smileIdentity";

/**
 * Picks up an identity verification handed over from a computer.
 *
 * Reached by scanning a QR code, by someone who is signed in on their desktop and
 * not on this phone. The single-use code in the link is the whole authorisation:
 * it starts the capture for the account that issued it and does nothing else — no
 * session, nothing to read, nothing that names the account before the person
 * decides to continue.
 *
 * Opening the page deliberately redeems nothing. QR scanners and link previewers
 * fetch what they are pointed at, and a code burned by a preview would send the
 * person back to the desktop for another one. Tapping the button is the write.
 */
export default function VerifyContinue() {
  const [params] = useSearchParams();
  const token = params.get("t") || "";

  const [state, setState] = useState<"ready" | "starting" | "capturing" | "done">("ready");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("This link is incomplete. Please scan the code on your computer again.");
    }
  }, [token]);

  const start = useCallback(async () => {
    if (!token) return;
    setState("starting");
    setError("");
    try {
      const [, session] = await Promise.all([loadSmileScript(), redeemIdentityHandoff(token)]);
      setState("capturing");
      launchSmileSession(session, {
        onSuccess: () => setState("done"),
        onClose: () => setState((current) => (current === "done" ? current : "ready")),
        onError: (message) => {
          setError(message);
          setState("ready");
        },
      });
    } catch (failure: any) {
      setError(failure?.message || "We could not continue your verification.");
      setState("ready");
    }
  }, [token]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
      <div className="rounded-3xl border border-purple-200 bg-white p-6 shadow-xl dark:border-purple-500/30 dark:bg-[#111018]">
        <span className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-100 px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-purple-700 dark:border-purple-400/25 dark:bg-purple-500/10 dark:text-purple-200">
          <ShieldCheck className="h-3.5 w-3.5" />
          IDENTITY VERIFIED
        </span>

        {state === "done" ? (
          <>
            <h1 className="mt-4 flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden="true" />
              Photos received
            </h1>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-white/65">
              You can put your phone down and go back to your computer. The page there will update on
              its own once the check is complete — there is nothing more to do here.
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
              Continue your verification
            </h1>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-white/65">
              You will photograph your ID document and take a short selfie. Have the original document
              with you — a photo of a copy or of a screen will be rejected — and find a bright spot
              without glare.
            </p>

            {error && (
              <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={() => void start()}
              disabled={!token || state !== "ready"}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 text-sm font-semibold text-white shadow-lg shadow-purple-950/40 transition hover:from-purple-500 hover:to-pink-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {state === "ready" ? (
                <Fingerprint className="h-4 w-4" />
              ) : (
                <RefreshCw className="h-4 w-4 animate-spin" />
              )}
              {state === "ready" ? "Start" : "Opening the camera…"}
            </button>

            <p className="mt-4 text-[11px] leading-4 text-gray-500 dark:text-white/50">
              This link works once and expires quickly. If it has stopped working, show a new code on
              your computer and scan it again.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
