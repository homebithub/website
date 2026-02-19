import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router';
import { API_BASE_URL } from '~/config/api';

interface ProfileSetupStatus {
  isComplete: boolean;
  isChecking: boolean;
  lastStep: number;
  profileType: string | null;
}

// Profile setup routes where nav/footer should be hidden
const SETUP_ROUTES = [
  '/profile-setup/household',
  '/profile-setup/househelp',
  '/household-choice',
  '/join-household',
];

/**
 * Hook that checks whether the current authenticated user has completed
 * their profile setup. Used by Navigation and Footer to self-hide during
 * the onboarding flow.
 *
 * Returns `isInSetupMode = true` when:
 *   1. The user is logged in as household/househelp AND
 *   2. Their profile setup status is NOT 'completed'
 *
 * The check is cached per session and only re-fetched on route changes
 * to setup-related paths.
 */
export function useProfileSetupStatus(): ProfileSetupStatus & { isInSetupMode: boolean } {
  const location = useLocation();
  const [status, setStatus] = useState<ProfileSetupStatus>({
    isComplete: true, // default to true so nav/footer show until we know otherwise
    isChecking: false,
    lastStep: 0,
    profileType: null,
  });
  const [hasFetched, setHasFetched] = useState(false);
  const [wasOnSetupRoute, setWasOnSetupRoute] = useState(false);

  const isOnSetupRoute = SETUP_ROUTES.some(route => location.pathname.startsWith(route));

  const checkStatus = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    const profileType = localStorage.getItem('profile_type');

    if (!token || !profileType) {
      setStatus({ isComplete: true, isChecking: false, lastStep: 0, profileType: null });
      setHasFetched(true);
      return;
    }

    if (profileType !== 'household' && profileType !== 'househelp') {
      setStatus({ isComplete: true, isChecking: false, lastStep: 0, profileType });
      setHasFetched(true);
      return;
    }

    setStatus(prev => ({ ...prev, isChecking: true, profileType }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/profile-setup-progress`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const progressData = data.data || {};
        const isComplete = progressData.status === 'completed';
        const lastStep = progressData.last_completed_step || 0;

        setStatus({ isComplete, isChecking: false, lastStep, profileType });
      } else if (response.status === 404) {
        // No record = hasn't started setup
        setStatus({ isComplete: false, isChecking: false, lastStep: 0, profileType });
      } else {
        // Error — fail open (show nav/footer)
        setStatus({ isComplete: true, isChecking: false, lastStep: 0, profileType });
      }
    } catch {
      // Error — fail open
      setStatus({ isComplete: true, isChecking: false, lastStep: 0, profileType });
    } finally {
      setHasFetched(true);
    }
  }, []);

  // Check on mount, on setup routes, and when transitioning away from setup routes
  useEffect(() => {
    const justLeftSetupRoute = wasOnSetupRoute && !isOnSetupRoute;

    if (!hasFetched || isOnSetupRoute || justLeftSetupRoute) {
      checkStatus();
    }

    setWasOnSetupRoute(isOnSetupRoute);
  }, [location.pathname, hasFetched, checkStatus, isOnSetupRoute, wasOnSetupRoute]);

  // Re-check when user logs in (token appears)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'profile_type') {
        setHasFetched(false);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const isInSetupMode = isOnSetupRoute && !status.isComplete && !status.isChecking && hasFetched &&
    (status.profileType === 'household' || status.profileType === 'househelp');

  return { ...status, isInSetupMode };
}
