import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { API_BASE_URL } from "~/config/api";

interface JoinRequest {
  id: string;
  user_id: string;
  message: string;
  status: string;
  created_at: string;
  user?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

export default function HouseholdRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
        return;
      }

      // Get household ID first
      const profileRes = await fetch(`${API_BASE_URL}/api/v1/household/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!profileRes.ok) throw new Error("Failed to fetch household profile");
      const profileData = await profileRes.json();
      const hId = profileData.id;
      setHouseholdId(hId);

      // Fetch pending requests
      const requestsRes = await fetch(`${API_BASE_URL}/api/v1/households/${hId}/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!requestsRes.ok) throw new Error("Failed to fetch requests");
      const requestsData = await requestsRes.json();
      setRequests(requestsData || []);
    } catch (err: any) {
      console.error("Error fetching requests:", err);
      setError(err.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!householdId) return;

    setActionLoading(requestId);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}/api/v1/households/${householdId}/requests/${requestId}/approve`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to approve request");
      }

      // Refresh requests list
      await fetchRequests();
    } catch (err: any) {
      console.error("Error approving request:", err);
      alert(err.message || "Failed to approve request");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!householdId) return;

    const reason = prompt("Reason for rejection (optional):");
    if (reason === null) return; // User cancelled

    setActionLoading(requestId);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}/api/v1/households/${householdId}/requests/${requestId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to reject request");
      }

      // Refresh requests list
      await fetchRequests();
    } catch (err: any) {
      console.error("Error rejecting request:", err);
      alert(err.message || "Failed to reject request");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <PurpleThemeWrapper variant="gradient" bubbles={false} bubbleDensity="low" className="flex-1 flex flex-col">
          <main className="flex-1 flex items-center justify-center py-12">
            <div className="text-center">
              <svg className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600 dark:text-gray-400">Loading requests...</p>
            </div>
          </main>
        </PurpleThemeWrapper>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="gradient" bubbles={false} bubbleDensity="low" className="flex-1 flex flex-col">
        <main className="flex-1 py-12">
          <div className="max-w-4xl mx-auto px-4">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => navigate("/household/profile")}
                className="mb-4 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Profile
              </button>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                📬 Join Requests
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Review and approve requests to join your household
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400">⚠️ {error}</p>
              </div>
            )}

            {/* Requests List */}
            {requests.length === 0 ? (
              <div className="bg-white dark:bg-[#13131a] rounded-2xl shadow-xl border-2 border-purple-200 dark:border-purple-500/30 p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No Pending Requests
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  You don't have any pending join requests at the moment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white dark:bg-[#13131a] rounded-xl shadow-lg border-2 border-purple-200 dark:border-purple-500/30 p-6"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {request.user?.first_name?.[0] || request.user?.email?.[0] || "U"}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {request.user?.first_name && request.user?.last_name
                            ? `${request.user.first_name} ${request.user.last_name}`
                            : request.user?.email || "Unknown User"}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(request.created_at).toLocaleDateString()} at{" "}
                          {new Date(request.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    {request.message && (
                      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          💬 "{request.message}"
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleReject(request.id)}
                        disabled={actionLoading === request.id}
                        className="flex-1 px-4 py-1 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(request.id)}
                        disabled={actionLoading === request.id}
                        className="flex-1 px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                      >
                        {actionLoading === request.id ? (
                          <>
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Approve
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}

export { ErrorBoundary } from "~/components/ErrorBoundary";
