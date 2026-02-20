import useScrollFadeIn from "~/hooks/useScrollFadeIn";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { lazyLoad } from "~/utils/lazyLoad";
import { API_BASE_URL } from "~/config/api";

const AuthenticatedHome = lazyLoad(() => import("~/components/AuthenticatedHome"));
const HousehelpHome = lazyLoad(() => import("~/components/HousehelpHome"));
const LandingPage = lazyLoad(() => import("~/routes/landing"));

export default function Index() {
  useScrollFadeIn();
  const navigate = useNavigate();

  const [userType, setUserType] = useState<'househelp' | 'household' | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status and profile setup progress on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      let resolvedType: 'household' | 'househelp' | null = null;
      
      // Primary source: derive from user_object (most reliable)
      try {
        const raw = localStorage.getItem('user_object');
        if (raw) {
          const obj = JSON.parse(raw);
          const pt = obj?.profile_type || obj?.role || obj?.profileType;
          if (pt === 'household' || pt === 'househelp') {
            resolvedType = pt;
            // Sync userType to localStorage for consistency
            localStorage.setItem('userType', pt);
          }
        }
      } catch (e) {
        console.error('Failed to parse user_object:', e);
      }

      // Fallback: check localStorage userType if user_object failed
      if (!resolvedType) {
        const userTypeStored = localStorage.getItem('userType');
        if (userTypeStored === 'household' || userTypeStored === 'househelp') {
          resolvedType = userTypeStored as 'household' | 'househelp';
        }
      }

      if (token) {
        setIsAuthenticated(true);
        if (resolvedType) {
          setUserType(resolvedType);
          console.log('Authenticated user type:', resolvedType);

          // Check profile setup progress and redirect if incomplete
          try {
            const setupResponse = await fetch(`${API_BASE_URL}/api/v1/profile-setup-progress`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (setupResponse.ok) {
              const setupData = await setupResponse.json();
              const progressData = setupData.data || {};
              const totalSteps = progressData.total_steps || 0;
              const lastStep = progressData.last_completed_step || 0;
              const isComplete = progressData.status === 'completed' ||
                (totalSteps > 0 && lastStep >= totalSteps);

              if (!isComplete) {
                if (resolvedType === 'household' && lastStep === 0) {
                  navigate('/household-choice', { replace: true });
                  return;
                }
                const setupRoute = resolvedType === 'household'
                  ? `/profile-setup/household?step=${lastStep + 1}`
                  : `/profile-setup/househelp?step=${lastStep + 1}`;
                navigate(setupRoute, { replace: true });
                return;
              }
            } else if (setupResponse.status === 404) {
              // No profile setup record - user hasn't started setup
              if (resolvedType === 'household') {
                navigate('/household-choice', { replace: true });
                return;
              }
              navigate('/profile-setup/househelp?step=1', { replace: true });
              return;
            }
          } catch (err) {
            console.error('Failed to check profile setup status:', err);
            // If check fails, fall through and show home page
          }
        } else {
          console.warn('Authenticated but no valid user type found');
        }
      } else {
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600 dark:from-[#0a0a0f] dark:via-[#13131a] dark:to-purple-950 transition-colors duration-300">
        <div className="text-center">
          <div className="mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-white dark:border-purple-400 mx-auto"></div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">🏠 Homebit</h2>
          <p className="text-purple-100 dark:text-purple-300 text-lg">Loading your experience...</p>
        </div>
      </div>
    );
  }

  // Show authenticated home for logged-in users based on profile type
  if (isAuthenticated) {
    if (userType === 'househelp') {
      return <HousehelpHome />;
    }
    // Default for authenticated users (household): show househelp search
    return <AuthenticatedHome />;
  }

  // Show landing/marketing page for non-authenticated users
  return <LandingPage />;
}
// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
