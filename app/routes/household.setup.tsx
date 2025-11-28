import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Navigation } from '~/components/Navigation';
import { Footer } from '~/components/Footer';
import { Loading } from '~/components/Loading';
import { useAuth } from '~/contexts/useAuth';
import { HouseholdCodePrompt } from '~/components/household/HouseholdCodePrompt';
import { joinHousehold } from '~/utils/householdApi';

export default function HouseholdSetupPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinStatus, setJoinStatus] = useState<'idle' | 'pending' | 'approved'>('idle');

  useEffect(() => {
    console.log('[HOUSEHOLD SETUP] Page loaded');
    console.log('[HOUSEHOLD SETUP] Auth loading:', authLoading);
    console.log('[HOUSEHOLD SETUP] User:', user);
    
    // Wait for auth to finish loading before checking user
    if (authLoading) {
      console.log('[HOUSEHOLD SETUP] Auth still loading, waiting...');
      return;
    }
    
    // Check localStorage first - if we have a token and user_object, we're authenticated
    const token = localStorage.getItem('token');
    const userObj = localStorage.getItem('user_object');
    
    console.log('[HOUSEHOLD SETUP] Token exists:', !!token);
    console.log('[HOUSEHOLD SETUP] user_object from localStorage:', userObj);
    
    // If no token and no user from AuthContext, redirect to login
    if (!token && !user) {
      console.log('[HOUSEHOLD SETUP] No token and no user, redirecting to /login');
      navigate('/login');
      return;
    }
    
    // Check if user already has a household
    if (userObj) {
      const parsed = JSON.parse(userObj);
      console.log('[HOUSEHOLD SETUP] Parsed user object:', parsed);
      console.log('[HOUSEHOLD SETUP] household_id:', parsed.household_id);
      
      if (parsed.household_id) {
        // User already has a household, redirect to profile
        console.log('[HOUSEHOLD SETUP] User has household_id, redirecting to /household/profile');
        navigate('/household/profile');
      } else {
        console.log('[HOUSEHOLD SETUP] No household_id found, staying on setup page');
      }
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
          navigate('/household/profile');
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
            <div className="text-6xl mb-6">⏳</div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Request Sent!
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Your request to join the household has been sent to the owner for approval.
            </p>
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-500/30 rounded-xl mb-6">
              <p className="text-blue-800 dark:text-blue-300 font-semibold mb-2">
                What happens next?
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-2 text-left">
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
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">
              Welcome to the Household!
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
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
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-500/30 rounded-xl shadow-lg">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-red-800 dark:text-red-300 font-semibold">{error}</p>
              </div>
            </div>
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
