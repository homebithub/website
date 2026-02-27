import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { API_BASE_URL } from "~/config/api";
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { Button } from '~/components/ui/Button';

export default function JoinHouseholdPage() {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validationInfo, setValidationInfo] = useState<any>(null);
  const [success, setSuccess] = useState(false);
  const [joinStatus, setJoinStatus] = useState<'approved' | 'pending' | 'rejected' | null>(null);

  useEffect(() => {
    const checkCurrentStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setCheckingStatus(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/households/join/status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          const request = data?.data;
          if (request) {
            setJoinStatus(request.status);
            setSuccess(true);
            
            if (request.status === 'approved') {
              navigate("/household/profile");
            }
          }
        }
      } catch (err) {
        console.error("Error checking join status:", err);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkCurrentStatus();
  }, [navigate]);

  useEffect(() => {
    if (!success || joinStatus !== 'pending') return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const eventSource = new EventSource(`${API_BASE_URL}/api/v1/notifications/stream?token=${token}`);

    eventSource.onmessage = (event: any) => {
      try {
        const data = JSON.parse(event.data);
        const notifications = data.notifications || [];
        
        // Handle snapshot or incremental updates
        const list = Array.isArray(notifications) ? notifications : 
                     (data.data?.notifications || []);
        
        // Look for join request approved or rejected notifications
        for (const n of list) {
          if (n.type === 'household_join_approved') {
            setJoinStatus('approved');
            setTimeout(() => navigate("/household/profile"), 2000);
            eventSource.close();
            break;
          } else if (n.type === 'household_join_rejected') {
            setJoinStatus('rejected');
            setSuccess(false);
            setError("Your request to join the household was rejected.");
            eventSource.close();
            break;
          }
        }
      } catch (err) {
        console.error("SSE error:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("EventSource failed:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [success, joinStatus, navigate]);

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
      const status = data?.data?.status || data?.status || 'pending';
      setJoinStatus(status);
      setSuccess(true);
      
      // Only auto-redirect if auto-approved
      if (status === 'approved') {
        setTimeout(() => {
          navigate("/household/profile");
        }, 2000);
      }
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

            {checkingStatus ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full" />
              </div>
            ) : success ? (
              <div className="space-y-6">
                {joinStatus === 'approved' ? (
                  <>
                    <SuccessAlert message="You have been automatically added to the household. Redirecting..." title="Successfully Joined!" />
                    <div className="text-center">
                      <Button
                        as={Link}
                        to="/household/members"
                        variant="primary"
                        size="lg"
                      >
                        View Household Members
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <SuccessAlert message="Your request has been sent to the household owner for approval. You will be notified once they respond." title="Request Sent!" />
                    <div className="text-center">
                      <Button
                        as={Link}
                        to="/dashboard"
                        variant="secondary"
                        size="lg"
                      >
                        Back to Dashboard
                      </Button>
                    </div>
                  </>
                )}
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
                    <Button
                      onClick={handleValidateCode}
                      disabled={!inviteCode.trim() || loading || validating}
                      isLoading={validating}
                      variant="primary"
                    >
                      Validate
                    </Button>
                  </div>
                </div>

                {/* Error Message */}
                {error && <div className="mb-4"><ErrorAlert message={error} /></div>}

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
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none mb-4"
                        disabled={loading}
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      onClick={handleJoinHousehold}
                      isLoading={loading}
                      fullWidth
                      variant="primary"
                      size="lg"
                    >
                      Request to Join Household
                    </Button>
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
