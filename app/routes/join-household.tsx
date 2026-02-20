import React, { useState } from "react";
import { useNavigate } from "react-router";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { API_BASE_URL } from "~/config/api";
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';

export default function JoinHouseholdPage() {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationInfo, setValidationInfo] = useState<any>(null);
  const [success, setSuccess] = useState(false);

  const handleValidateCode = async () => {
    if (!inviteCode.trim()) {
      setError("Please enter an invitation code");
      return;
    }

    setValidating(true);
    setError(null);
    setValidationInfo(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/households/invitations/validate/${inviteCode.trim()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Invalid invitation code");
      }

      const data = await res.json();
      setValidationInfo(data);
    } catch (err: any) {
      console.error("Validation error:", err);
      setError(err.message || "Failed to validate code");
    } finally {
      setValidating(false);
    }
  };

  const handleJoinHousehold = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/v1/households/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          invite_code: inviteCode.trim(),
          message: message.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to join household");
      }

      const data = await res.json();
      setSuccess(true);
      
      // Redirect to household profile after 2 seconds
      setTimeout(() => {
        navigate("/household/profile");
      }, 2000);
    } catch (err: any) {
      console.error("Join error:", err);
      setError(err.message || "Failed to join household");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PurpleThemeWrapper variant="gradient" bubbles={false} bubbleDensity="low">
        <main className="flex-1 py-12">
          <div className="max-w-2xl mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                🏠 Join a Household
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Enter the household code shared by your partner to request access
              </p>
            </div>

            {success ? (
              <div className="space-y-6">
                <SuccessAlert message="You have successfully joined the household." title="Successfully Joined!" />
                <div className="text-center">
                  <button
                    onClick={() => navigate('/household/members')}
                    className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold"
                  >
                    View Household Members
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#13131a] rounded-2xl shadow-xl border-2 border-purple-200 dark:border-purple-500/30 p-8">
                {/* Step 1: Enter Code */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Household Invitation Code
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => {
                        setInviteCode(e.target.value.toUpperCase());
                        setValidationInfo(null);
                        setError(null);
                      }}
                      placeholder="HH-XXXX-XXXX"
                      className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-lg"
                      disabled={loading || validating}
                    />
                    <button
                      onClick={handleValidateCode}
                      disabled={!inviteCode.trim() || loading || validating}
                      className="px-6 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                    >
                      {validating ? "Validating..." : "Validate"}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && <ErrorAlert message={error} />}

                {/* Validation Info */}
                {validationInfo && (
                  <div className="mb-8 p-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-500/30 rounded-xl">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-800/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-1">
                          Valid Invitation Code!
                        </h3>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          You're about to join: <strong>{validationInfo.household_name}</strong>
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Role: {validationInfo.role}
                        </p>
                      </div>
                    </div>

                    {/* Optional Message */}
                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Message (Optional)
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Introduce yourself to the household owner..."
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                        disabled={loading}
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={handleJoinHousehold}
                      disabled={loading}
                      className="w-full mt-4 px-6 py-1 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg text-lg"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending Request...
                        </span>
                      ) : (
                        "Request to Join Household"
                      )}
                    </button>
                  </div>
                )}

                {/* Info Box */}
                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-xl">
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-semibold mb-2">
                    ℹ️ What happens next?
                  </p>
                  <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300 list-disc list-inside">
                    <li>Enter the household code shared by your partner</li>
                    <li>We'll validate the code and show you the household details</li>
                    <li>Send a request to join the household</li>
                    <li>Wait for the household owner to approve your request</li>
                    <li>Once approved, you'll have full access to the household profile</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </main>
      </PurpleThemeWrapper>
    </div>
  );
}

export { ErrorBoundary } from "~/components/ErrorBoundary";
