import React, { useEffect, useState } from "react";
import { Link } from "react-router";

import { bureauService, profileService as grpcProfileService } from "~/services/grpc/authServices";
import { getStoredAccessToken } from "~/utils/authStorage";

type LinkFlowState = {
  message?: string;
  link_request?: {
    id?: string;
    status?: string;
  } | null;
  verification?: {
    target?: string;
    expires_at?: string;
    next_resend_at?: string;
  } | null;
  service_provider?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
  } | null;
} | null;

export default function BureauServiceProviders() {
  const [serviceProviders, setServiceProviders] = useState<any[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [bureauId, setBureauId] = useState<string | null>(null);

  const [linkPhone, setLinkPhone] = useState("");
  const [linkOtp, setLinkOtp] = useState("");
  const [linkState, setLinkState] = useState<LinkFlowState>(null);
  const [linkLoading, setLinkLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [linkSuccess, setLinkSuccess] = useState("");

  const loadBureauServiceProviders = async () => {
    const token = getStoredAccessToken();
    if (!token) {
      setListLoading(false);
      setListError("Please log in to manage bureau service providers.");
      return;
    }

    setListLoading(true);
    setListError("");

    try {
      const data = await bureauService.getCurrentBureauProfile("");
      const resolvedBureauId = data?.id || data?._id || null;
      setBureauId(resolvedBureauId);

      if (!resolvedBureauId) {
        setServiceProviders([]);
        setListError("Could not resolve the authenticated bureau profile.");
        return;
      }

      const result = await grpcProfileService.getServiceProvidersByBureau(resolvedBureauId, 20, 0);
      setServiceProviders(Array.isArray(result?.data) ? result.data : []);
    } catch (error: any) {
      setServiceProviders([]);
      setListError(error?.message || "Failed to load bureau service providers.");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadBureauServiceProviders();
  }, []);

  const handleInitiateLink = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!linkPhone.trim()) {
      setLinkError("Enter the service provider phone number first.");
      return;
    }

    setLinkLoading(true);
    setLinkError("");
    setLinkSuccess("");

    try {
      const result = await bureauService.initiateServiceProviderLink(linkPhone.trim());
      setLinkState(result);
      setLinkOtp("");
      setLinkSuccess(result?.message || "Verification code sent.");
    } catch (error: any) {
      setLinkState(null);
      setLinkError(error?.message || "Failed to send verification code.");
    } finally {
      setLinkLoading(false);
    }
  };

  const handleVerifyLink = async (event: React.FormEvent) => {
    event.preventDefault();

    const requestId = linkState?.link_request?.id;
    if (!requestId) {
      setLinkError("Start a link request before verifying.");
      return;
    }
    if (!linkOtp.trim()) {
      setLinkError("Enter the OTP shared by the service provider.");
      return;
    }

    setVerifyLoading(true);
    setLinkError("");
    setLinkSuccess("");

    try {
      const result = await bureauService.verifyServiceProviderLink(requestId, linkOtp.trim());
      setLinkSuccess(result?.message || "Service provider linked successfully.");
      setLinkState(null);
      setLinkPhone("");
      setLinkOtp("");
      await loadBureauServiceProviders();
    } catch (error: any) {
      setLinkError(error?.message || "Failed to verify the OTP.");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendOTP = async () => {
    const requestId = linkState?.link_request?.id;
    if (!requestId) {
      setLinkError("Start a link request before resending.");
      return;
    }

    setResendLoading(true);
    setLinkError("");
    setLinkSuccess("");

    try {
      const result = await bureauService.resendServiceProviderLinkOTP(requestId);
      setLinkState(result);
      setLinkSuccess(result?.message || "OTP resent successfully.");
    } catch (error: any) {
      setLinkError(error?.message || "Failed to resend the OTP.");
    } finally {
      setResendLoading(false);
    }
  };

  const linkedServiceProviderName = [linkState?.service_provider?.first_name, linkState?.service_provider?.last_name]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-lg font-bold text-primary dark:text-primary-300">Service providers</h2>
      <div className="mb-4 mt-6 flex items-center justify-between">
        <div className="text-gray-500 dark:text-gray-300">Manage service providers registered with your bureau.</div>
        <div className="flex gap-2">
          {bureauId && (
            <Link
              to={`/signup?bureauId=${bureauId}`}
              className="btn-primary flex items-center justify-center"
            >
              Create New (Service provider)
            </Link>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-950">
        <div className="font-semibold">Link an existing service provider with OTP verification</div>
        <p className="mt-1 text-amber-900">
          Homebit sends the verification code to the service provider phone number. Ask the service provider to share the code with your bureau before you confirm the link.
        </p>

        <form className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]" onSubmit={handleInitiateLink}>
          <input
            type="tel"
            value={linkPhone}
            onChange={(event) => setLinkPhone(event.target.value)}
            placeholder="+2547XXXXXXXX"
            className="w-full rounded-xl border border-amber-300 bg-white px-4 py-3 text-xs text-gray-900 outline-none transition focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={linkLoading}
            className="rounded-xl bg-amber-600 px-4 py-3 text-xs font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {linkLoading ? "Sending..." : "Send Link OTP"}
          </button>
        </form>

        {linkSuccess ? <div className="mt-3 rounded-xl bg-green-50 px-3 py-2 text-xs text-green-800">{linkSuccess}</div> : null}
        {linkError ? <div className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{linkError}</div> : null}

        {linkState?.link_request?.id ? (
          <div className="mt-4 rounded-2xl border border-amber-300 bg-white p-4">
            <div className="text-xs font-semibold text-gray-900">
              {linkedServiceProviderName || "Existing service provider found"}
            </div>
            <div className="mt-1 text-xs text-gray-600">
              OTP sent to {linkState?.verification?.target || linkState?.service_provider?.phone || linkPhone}.
            </div>
            {linkState?.verification?.expires_at ? (
              <div className="mt-1 text-xs text-gray-500">
                Expires at {new Date(linkState.verification.expires_at).toLocaleString()}
              </div>
            ) : null}

            <form className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]" onSubmit={handleVerifyLink}>
              <input
                type="text"
                value={linkOtp}
                onChange={(event) => setLinkOtp(event.target.value)}
                placeholder="Enter OTP from service provider"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-xs text-gray-900 outline-none transition focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={verifyLoading}
                className="rounded-xl bg-gray-900 px-4 py-3 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {verifyLoading ? "Verifying..." : "Verify and Link"}
              </button>
            </form>

            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="rounded-lg border border-amber-300 px-3 py-2 text-xs font-medium text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resendLoading ? "Resending..." : "Resend OTP"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLinkState(null);
                  setLinkOtp("");
                  setLinkError("");
                  setLinkSuccess("");
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white p-6 text-gray-600 shadow-lg">
        {listLoading ? (
          <div>Loading bureau service providers...</div>
        ) : listError ? (
          <div className="text-red-600">{listError}</div>
        ) : serviceProviders.length === 0 ? (
          <div>No service providers are currently linked to this bureau.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-purple-200 text-left text-gray-700">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Phone</th>
                  <th className="py-2 pr-4">Location</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {serviceProviders.map((item: any) => {
                  const provider = item?.ServiceProvider ?? item?.service_provider ?? item?.Househelp ?? item?.househelp ?? {};
                  const user = item?.User ?? item?.user ?? {};
                  return (
                  <tr key={provider?.id || user?.id} className="border-b border-purple-100 last:border-b-0">
                    <td className="py-2 pr-4 font-medium text-gray-900">
                      {[user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Unnamed service provider"}
                    </td>
                    <td className="py-2 pr-4">{user?.phone || "-"}</td>
                    <td className="py-2 pr-4">{provider?.current_location || provider?.location || "-"}</td>
                    <td className="py-2 pr-4">{user?.status || provider?.profile_status || "-"}</td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export { ErrorBoundary } from "~/components/ErrorBoundary";
