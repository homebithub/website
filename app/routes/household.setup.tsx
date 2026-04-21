import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Navigation } from '~/components/Navigation';
import { Footer } from '~/components/Footer';
import { Loading } from '~/components/Loading';
import { useAuth } from '~/contexts/useAuth';
import { HouseholdCodePrompt } from '~/components/household/HouseholdCodePrompt';
import { joinHousehold } from '~/utils/householdApi';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { getAccessTokenFromCookies } from '~/utils/cookie';
import { getStoredUser } from '~/utils/authStorage';

export default function HouseholdSetupPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinStatus, setJoinStatus] = useState<'idle' | 'pending' | 'approved'>('idle');

  useEffect(() => {
    // Wait for auth to finish loading before checking user
    if (authLoading) {
      return;
    }
    
    // Check cached auth first - if we have a token and user data, we're authenticated
    const token = getAccessTokenFromCookies();
    const storedUser = getStoredUser();
    
    // If no token and no user from AuthContext, redirect to login
    if (!token && !user && !storedUser) {
      navigate('/login', { replace: true });
      return;
    }
    
    // Check if user already has a household
    if (storedUser?.household_id) {
      navigate('/household/profile', { replace: true });
    }
  }, [user, authLoading, navigate]);
  
  // Show loading screen while auth is loading
  if (authLoading) {
    return <Loading text="Loading..." />;
  }

  const handleJoinExisting = async (code: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await joinHousehold({
        invite_code: code,
        message: 'Hi! I would like to join this household.',
      });

      if (result.status === 'pending') {
        setJoinStatus('pending');
      } else if (result.status === 'approved') {
        setJoinStatus('approved');
        // Redirect to household profile after a short delay
        setTimeout(() => {
          navigate('/household/profile', { replace: true });
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to join household');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    // Redirect to household profile setup wizard
    navigate('/profile-setup/household');
  };

  if (joinStatus === 'pending') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0a0a0f]">
        <Navigation />
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="max-w-2xl w-full p-8 bg-white dark:bg-[#13131a] rounded-2xl shadow-xl dark:shadow-glow border-2 border-purple-200 dark:border-purple-500/30 text-center">
            <div className="text-3xl mb-6">⏳</div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Request Sent!
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-300 mb-6">
              Your request to join the household has been sent to the owner for approval.
            </p>
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-500/30 rounded-xl mb-6">
              <p className="text-blue-800 dark:text-blue-300 font-semibold mb-2">
                What happens next?
              </p>
              <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-2 text-left">
                <li className="flex items-start">
                  <span className="mr-2">1️⃣</span>
                  <span>The household owner will receive your request</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">2️⃣</span>
                  <span>They'll review and approve or reject it</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">3️⃣</span>
                  <span>You'll receive a notification once approved</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">4️⃣</span>
                  <span>After approval, you can access the household</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Go to Home
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (joinStatus === 'approved') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0a0a0f]">
        <Navigation />
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="max-w-2xl w-full p-8 bg-white dark:bg-[#13131a] rounded-2xl shadow-xl dark:shadow-glow border-2 border-green-200 dark:border-green-500/30 text-center">
            <div className="text-3xl mb-6">🎉</div>
            <h2 className="text-lg font-bold text-green-600 dark:text-green-400 mb-4">
              Welcome to the Household!
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-300 mb-6">
              You've been approved! Redirecting to your household profile...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0a0a0f]">
      <Navigation />
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {error && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
            <ErrorAlert message={error} />
          </div>
        )}

        <HouseholdCodePrompt
          onJoinExisting={handleJoinExisting}
          onCreateNew={handleCreateNew}
          loading={loading}
        />
      </main>
      <Footer />
    </div>
  );
}

export { ErrorBoundary } from '~/components/ErrorBoundary';
