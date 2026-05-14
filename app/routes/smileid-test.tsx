import React, { useEffect, useMemo, useState } from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { Button } from "~/components/ui/Button";
import { API_BASE_URL } from "~/config/api";
import { getStoredAccessToken, getStoredUserId } from "~/utils/authStorage";

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
  const [jobId, setJobId] = useState("");
  const [sandboxResult, setSandboxResult] = useState("");
  const [tokenData, setTokenData] = useState<TokenResponse | null>(null);
  const [statusMessage, setStatusMessage] = useState("Idle");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    const token = getStoredAccessToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/kyc/smileid/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        user_id: userId || undefined,
        job_id: jobId || undefined,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      const message = data?.error || "Failed to fetch Smile ID token";
      throw new Error(message);
    }
    return data as TokenResponse;
  };

  const handleLaunch = async () => {
    setError(null);
    setStatusMessage("Requesting web token...");
    setIsLoading(true);

    try {
      const tokenResponse = await fetchToken();
      setTokenData(tokenResponse);

      if (!window.SmileIdentity) {
        throw new Error("SmileIdentity SDK not loaded yet.");
      }

      const partnerParams: Record<string, string> = {
        user_id: tokenResponse.user_id,
        job_id: tokenResponse.job_id,
      };

      if (sandboxResult) {
        partnerParams.sandbox_result = sandboxResult;
      }

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
    setTokenData(null);
    setStatusMessage("Idle");
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={false} bubbleDensity="low" className="flex-1">
        <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 space-y-10">
          <header className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 text-purple-700 px-4 py-1 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-purple-500"></span>
              Smile ID Web Integration Test
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              KYC sandbox launcher for Smile ID
            </h1>
            <p className="text-sm text-gray-600 max-w-2xl">
              Fetch a web token from the auth service, launch the Smile ID widget, and verify that callbacks arrive in
              the Smile ID webhook pipeline. This page is for internal QA only.
            </p>
          </header>

          <section className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6">
            <div className="rounded-3xl border border-purple-100 bg-white/90 shadow-xl p-6 space-y-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold text-gray-900">Launch configuration</h2>
                <p className="text-xs text-gray-500">
                  Provide the user ID to associate with the Smile ID job. The job ID is optional; we will auto-generate
                  one if left empty.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="text-xs font-semibold text-gray-600">
                  User ID
                  <input
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300"
                    value={userId}
                    onChange={(event) => setUserId(event.target.value)}
                    placeholder="e.g. 09a0..."
                  />
                </label>
                <label className="text-xs font-semibold text-gray-600">
                  Job ID (optional)
                  <input
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300"
                    value={jobId}
                    onChange={(event) => setJobId(event.target.value)}
                    placeholder="Auto-generate"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="text-xs font-semibold text-gray-600">
                  Sandbox result (optional)
                  <input
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300"
                    value={sandboxResult}
                    onChange={(event) => setSandboxResult(event.target.value)}
                    placeholder='"0" success, "1" fail, "2" manual'
                  />
                </label>
                <div className="rounded-2xl border border-purple-100 bg-purple-50/60 px-4 py-3 text-xs text-purple-700 flex items-center justify-between">
                  <span>SDK status</span>
                  <span className="font-semibold">{statusPill}</span>
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleLaunch}
                  isLoading={isLoading}
                  disabled={!sdkReady || !!sdkError || !userId}
                >
                  Launch Smile ID
                </Button>
                <Button variant="ghost" size="lg" onClick={resetToken} disabled={isLoading}>
                  Reset
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-purple-100 bg-white/90 shadow-xl p-6 space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Session status</h2>
                <p className="text-xs text-gray-500">Track the token and webhook handoff state.</p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-700">
                <div className="text-[10px] uppercase tracking-wide text-gray-400">Current</div>
                <div className="mt-1 font-semibold text-gray-900">{statusMessage}</div>
              </div>

              <div className="rounded-2xl border border-purple-100 bg-purple-50/40 px-4 py-3 text-xs text-purple-700 space-y-2">
                <div className="text-[10px] uppercase tracking-wide text-purple-400">Latest token payload</div>
                {tokenData ? (
                  <ul className="space-y-1 text-[11px]">
                    <li><span className="font-semibold">User ID:</span> {tokenData.user_id}</li>
                    <li><span className="font-semibold">Job ID:</span> {tokenData.job_id}</li>
                    <li><span className="font-semibold">Product:</span> {tokenData.product}</li>
                    <li><span className="font-semibold">Environment:</span> {tokenData.environment}</li>
                    <li><span className="font-semibold">Callback URL:</span> {tokenData.callback_url}</li>
                  </ul>
                ) : (
                  <p>No token requested yet.</p>
                )}
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-xs text-gray-500">
                After the widget completes, Smile ID posts the callback to the auth service and the async processor will
                ingest documents + update KYC.
              </div>
            </div>
          </section>
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}
