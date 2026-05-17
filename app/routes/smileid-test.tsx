import React, { useEffect, useMemo, useState } from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { Button } from "~/components/ui/Button";
import { getStoredUserId } from "~/utils/authStorage";
import { kycService } from "~/services/grpc/authServices";

declare global {
  interface Window {
    SmileIdentity?: (config: Record<string, any>) => void;
  }
}

const SMILE_SCRIPT_URL = "https://cdn.smileidentity.com/inline/v11/js/script.min.js";

interface TokenResponse {
  token: string;
  job_id: string;
  user_id: string;
  product: string;
  callback_url: string;
  environment: string;
  partner_id: string;
}

export default function SmileIDTestPage() {
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [userId, setUserId] = useState("");
  const [statusMessage, setStatusMessage] = useState("Ready to start");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flowMode, setFlowMode] = useState<"web" | "upload">("web");

  useEffect(() => {
    setUserId(getStoredUserId());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.SmileIdentity) {
      setSdkReady(true);
      return;
    }

    const existingScript = document.querySelector("script[data-smileid-sdk='web']") as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", () => setSdkReady(true));
      existingScript.addEventListener("error", () => setSdkError("Failed to load Smile ID SDK"));
      return;
    }

    const script = document.createElement("script");
    script.src = SMILE_SCRIPT_URL;
    script.async = true;
    script.dataset.smileidSdk = "web";
    script.onload = () => setSdkReady(true);
    script.onerror = () => setSdkError("Failed to load Smile ID SDK");
    document.body.appendChild(script);
  }, []);

  const statusPill = useMemo(() => {
    if (sdkError) return "SDK error";
    if (!sdkReady) return "SDK loading";
    return "SDK ready";
  }, [sdkReady, sdkError]);

  const fetchToken = async (): Promise<TokenResponse> => {
    if (!userId) {
      throw new Error("Please sign in to start verification.");
    }
    const product = flowMode === "upload" ? "enhanced_document_verification" : "biometric_kyc";
    const data = await kycService.getSmileIDToken(userId, { user_id: userId, product });
    if (!data?.token) {
      throw new Error("Failed to fetch Smile ID token");
    }
    return data as TokenResponse;
  };

  const handleLaunch = async () => {
    setError(null);
    setStatusMessage("Requesting web token...");
    setIsLoading(true);

    try {
      const tokenResponse = await fetchToken();

      if (!window.SmileIdentity) {
        throw new Error("SmileIdentity SDK not loaded yet.");
      }

      const partnerParams: Record<string, string> = {
        user_id: tokenResponse.user_id,
        job_id: tokenResponse.job_id,
      };

      setStatusMessage("Launching Smile ID verification...");
      window.SmileIdentity({
        token: tokenResponse.token,
        product: tokenResponse.product,
        callback_url: tokenResponse.callback_url,
        environment: tokenResponse.environment,
        partner_details: {
          partner_id: tokenResponse.partner_id,
          name: "Homebit",
          logo_url: "https://homebit.co.ke/logo.png",
          policy_url: "https://homebit.co.ke/privacy",
          theme_color: "#0B5FFF",
        },
        partner_params: partnerParams,
        onSuccess: () => setStatusMessage("Verification completed. Awaiting webhook."),
        onClose: () => setStatusMessage("Widget closed by user."),
        onError: (err: { message?: string }) => {
          setStatusMessage("Verification error.");
          setError(err?.message || "Smile ID reported an error.");
        },
      });
    } catch (err: any) {
      setError(err?.message || "Failed to launch Smile ID.");
      setStatusMessage("Error preparing verification.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetToken = () => {
    setStatusMessage("Ready to start");
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={false} bubbleDensity="low" className="flex-1">
        <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
          <section className="rounded-3xl border border-purple-100 bg-white/90 shadow-xl p-8 md:p-10 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 text-purple-700 px-4 py-1 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                Identity verification
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Verify your identity
              </h1>
              <p className="text-sm text-gray-600 max-w-2xl">
                To keep Homebit safe and trusted, we verify every user with a secure identity check. This quick process
                helps protect our community and prevents fraud.
              </p>
            </div>

            <div className="rounded-2xl border border-purple-100 bg-white p-4 md:p-5 space-y-4">
              <div className="text-sm font-semibold text-gray-900">Choose verification flow</div>
              <div className="grid gap-3 md:grid-cols-2">
                <label className={`rounded-xl border px-4 py-3 text-sm cursor-pointer transition ${
                  flowMode === "web" ? "border-purple-400 bg-purple-50" : "border-gray-200"
                }`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="smile-flow"
                      value="web"
                      checked={flowMode === "web"}
                      onChange={() => setFlowMode("web")}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">Flow 1: ID number only</div>
                      <div className="text-xs text-gray-600">Smile ID web capture (ID number + selfie/liveness).</div>
                    </div>
                  </div>
                </label>
                <label className={`rounded-xl border px-4 py-3 text-sm cursor-pointer transition ${
                  flowMode === "upload" ? "border-purple-400 bg-purple-50" : "border-gray-200"
                }`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="smile-flow"
                      value="upload"
                      checked={flowMode === "upload"}
                      onChange={() => setFlowMode("upload")}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">Flow 2: ID document + selfie</div>
                      <div className="text-xs text-gray-600">Uploads front/back + selfie for IPRS + face match.</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {flowMode === "upload" && (
              <div className="rounded-2xl border border-amber-100 bg-amber-50/60 px-4 py-4 text-sm text-amber-900">
                Flow 2 uses Smile ID’s hosted capture to collect the ID number, document images, and selfie. No files are
                uploaded to Homebit — Smile ID uploads directly and returns them via the callback for us to download.
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-purple-100 bg-purple-50/70 p-4 text-sm text-purple-900 space-y-2">
                <h2 className="text-sm font-semibold">Why we need your documents</h2>
                <p className="text-purple-800/80">
                  We compare your government-issued ID with a live selfie to confirm it really is you. Your documents
                  are encrypted, used only for verification, and stored securely.
                </p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-4 text-sm text-gray-700 space-y-3">
                <h2 className="text-sm font-semibold text-gray-900">What you’ll need</h2>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                    A valid national ID, passport, or alien card.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                    A clear selfie in good lighting.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                    About 2–3 minutes to complete the check.
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
              <strong>You’ll be redirected to Smile ID.</strong> We partner with Smile ID to run this verification. You’ll
              complete the capture in their secure flow and return to Homebit automatically.
            </div>

            <p className="text-xs text-gray-500">
              By continuing, you consent to Homebit and Smile ID collecting and processing your documents and biometric
              data for verification, in line with our privacy policy.
            </p>

            {!userId && (
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600">
                Please sign in to start verification.
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={handleLaunch}
                isLoading={isLoading}
                disabled={!sdkReady || !!sdkError || !userId}
              >
                Start verification
              </Button>
              <Button variant="ghost" size="lg" onClick={resetToken} disabled={isLoading}>
                Reset
              </Button>
              <div className="text-xs text-gray-500 sm:ml-auto">
                <span className="font-semibold text-gray-700">Status:</span> {statusMessage}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-purple-700">
                Smile ID system: <span className="font-semibold">{statusPill}</span>
              </div>
              <span>We’ll notify you once verification is complete.</span>
            </div>
          </section>
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}
