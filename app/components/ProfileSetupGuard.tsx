import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { API_BASE_URL } from '~/config/api';
import { Loading } from './Loading';

interface ProfileSetupGuardProps {
  children: React.ReactNode;
}

/**
 * ProfileSetupGuard - Protects routes and ensures users complete profile setup
 * before accessing other pages. Redirects incomplete profiles to setup flow.
 */
export function ProfileSetupGuard({ children }: ProfileSetupGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  // Routes that don't require profile setup completion
  const exemptRoutes = [
    '/profile-setup/household',
    '/profile-setup/househelp',
    '/household-choice',
    '/join-household',
    '/login',
    '/signup',
    '/logout',
    '/forgot-password',
    '/reset-password',
    '/verify-otp',
    '/verify-email',
    '/about',
    '/services',
    '/contact',
    '/pricing',
    '/terms',
    '/privacy',
    '/cookies',
    '/'
  ];

  const isExemptRoute = () => {
    return exemptRoutes.some(route => location.pathname.startsWith(route)) || location.pathname === '/';
  };

  useEffect(() => {
    checkProfileSetup();
  }, [location.pathname]);

  const checkProfileSetup = async () => {
    // Skip check for exempt routes
    if (isExemptRoute()) {
      setIsSetupComplete(true);
      setIsChecking(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const profileType = localStorage.getItem('profile_type');

      if (!token || !profileType) {
        // Not logged in, allow navigation (auth guard will handle)
        setIsSetupComplete(true);
        setIsChecking(false);
        return;
      }

      // Only check for household and househelp users
      if (profileType !== 'household' && profileType !== 'househelp') {
        setIsSetupComplete(true);
        setIsChecking(false);
        return;
      }

      // Check profile setup status
      const response = await fetch(`${API_BASE_URL}/api/v1/profile-setup-progress`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Handle response structure: { data: { last_completed_step: ..., status: ... } }
        const progressData = data.data || {};
        const isComplete = progressData.status === 'completed';
        const lastStep = progressData.last_completed_step || 0;

        console.log('ProfileSetupGuard - Setup status:', { isComplete, lastStep });

        if (!isComplete) {
          // Household users who haven't started setup go to choice page first
          if (profileType === 'household' && lastStep === 0) {
            console.log('ProfileSetupGuard - Household user at step 0, redirecting to choice page');
            navigate('/household-choice', { replace: true });
            return;
          }
          // Profile incomplete, redirect to setup
          const setupRoute = profileType === 'household'
            ? `/profile-setup/household?step=${lastStep + 1}`
            : `/profile-setup/househelp?step=${lastStep + 1}`;

          console.log('ProfileSetupGuard - Redirecting to:', setupRoute);
          return setupRoute;
        }
      } else if (response.status === 404) {
        // No profile setup record exists - user hasn't started setup
        if (profileType === 'household') {
          console.log('ProfileSetupGuard - No setup record, redirecting to household choice');
          navigate('/household-choice', { replace: true });
          return;
        }
        console.log("ProfileSetupGuard - No profile setup record found, starting from step 1");
        navigate('/profile-setup/househelp?step=1', { replace: true });
        return;
      } else {
        // Error checking, allow navigation (fail open)
        console.error('ProfileSetupGuard - Error checking setup status:', response.status);
        setIsSetupComplete(true);
      }
    } catch (error) {
      console.error('ProfileSetupGuard - Error:', error);
      // On error, allow navigation (fail open)
      setIsSetupComplete(true);
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return <Loading text="Checking profile..." />;
  }

  if (!isSetupComplete) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
