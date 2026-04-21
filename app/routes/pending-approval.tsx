import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { getAccessTokenFromCookies } from "~/utils/cookie";
import { householdMemberService } from '~/services/grpc/authServices';
import { Button } from '~/components/ui/Button';
import { useSSESubscription } from '~/hooks/useSSESubscription';

export default function PendingApprovalPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);
  const [householdName, setHouseholdName] = useState<string>("");

  const checkRequestStatus = useCallback(async () => {
    const token = getAccessTokenFromCookies();
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const data = await householdMemberService.getJoinRequestStatus('');
      const request = data?.data || data;

      if (!request || !request.status) {
        navigate("/household-choice", { replace: true });
        return;
      }

      setRequestStatus(request.status);
      setHouseholdName(request.household_name || "the household");

      if (request.status === 'approved') {
        navigate("/household/profile", { replace: true });
      }
    } catch (err) {
      console.error("Error checking join status:", err);
      navigate("/household-choice", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void checkRequestStatus();
  }, [checkRequestStatus]);

  const refreshPendingStatus = useCallback(() => {
    if (requestStatus === 'pending') {
      void checkRequestStatus();
    }
  }, [checkRequestStatus, requestStatus]);

  useSSESubscription('notifications.snapshot', refreshPendingStatus, requestStatus === 'pending');
  useSSESubscription('notifications.created', refreshPendingStatus, requestStatus === 'pending');
  useSSESubscription('auth.household.updated', refreshPendingStatus, requestStatus === 'pending');

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <PurpleThemeWrapper variant="gradient" bubbles={false} bubbleDensity="low">
          <main className="flex-1 flex items-center justify-center">
            <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full" />
          </main>
        </PurpleThemeWrapper>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PurpleThemeWrapper variant="gradient" bubbles={false} bubbleDensity="low">
        <main className="flex-1 py-12">
          <div className="max-w-2xl mx-auto px-4">
            {requestStatus === 'approved' ? (
              <div className="bg-white dark:bg-[#13131a] rounded-2xl shadow-xl border-2 border-green-200 dark:border-green-500/30 p-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    🎉 Request Approved!
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                    You've been added to {householdName}. Redirecting you to your household profile...
                  </p>
                  <div className="flex justify-center">
                    <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full" />
                  </div>
                </div>
              </div>
            ) : requestStatus === 'rejected' ? (
              <div className="bg-white dark:bg-[#13131a] rounded-2xl shadow-xl border-2 border-red-200 dark:border-red-500/30 p-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Request Declined
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                    Your request to join {householdName} was not approved by the household owner.
                  </p>
                  <div className="space-y-4">
                    <Button
                      as={Link}
                      to="/household-choice"
                      variant="primary"
                      size="lg"
                      fullWidth
                    >
                      Try Another Code
                    </Button>
                    <Button
                      as={Link}
                      to="/profile-setup/household?step=1"
                      variant="secondary"
                      size="lg"
                      fullWidth
                    >
                      Create Your Own Household
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#13131a] rounded-2xl shadow-xl border-2 border-purple-200 dark:border-purple-500/30 p-8">
                <div className="text-center">
                  {/* Animated waiting icon */}
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 bg-purple-100 dark:bg-purple-900/30 rounded-full animate-pulse" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-12 h-12 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>

                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    ⏳ Awaiting Approval
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                    Your request to join <span className="font-bold text-purple-600 dark:text-purple-400">{householdName}</span> has been sent!
                  </p>
                  <p className="text-base text-gray-500 dark:text-gray-500 mb-8">
                    We're waiting for the household owner to approve your request.
                  </p>

                  {/* Status card */}
                  <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl p-6 mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
                      <span className="text-sm font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                        Request Pending
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      You'll be notified as soon as the household owner responds to your request.
                    </p>
                  </div>

                  {/* Action tips */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-xl p-6 mb-8">
                    <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Speed Up the Process
                    </h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      💬 Contact the household owner directly to let them know you've sent a request. They can approve it from their household settings.
                    </p>
                  </div>

                  {/* Additional actions */}
                  <div className="space-y-3">
                    <Button
                      as={Link}
                      to="/"
                      variant="secondary"
                      size="lg"
                      fullWidth
                    >
                      Go to Home
                    </Button>
                  </div>
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
