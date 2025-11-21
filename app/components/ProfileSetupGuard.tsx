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
      const response = await fetch(`${API_BASE_URL}/api/v1/profile-setup-steps`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const isComplete = data.is_complete || false;
        const lastStep = data.last_completed_step || 0;

        console.log('ProfileSetupGuard - Setup status:', { isComplete, lastStep });

        if (!isComplete) {
          // Profile incomplete, redirect to setup
          const setupRoute = profileType === 'household'
            ? `/profile-setup/household?step=${lastStep + 1}`
            : `/profile-setup/househelp?step=${lastStep + 1}`;

          console.log('ProfileSetupGuard - Redirecting to:', setupRoute);
          navigate(setupRoute, { replace: true });
          return;
        }

        setIsSetupComplete(true);
      } else if (response.status === 404) {
        // No setup tracking found, redirect to start of setup
        const setupRoute = profileType === 'household'
          ? '/profile-setup/household?step=1'
          : '/profile-setup/househelp?step=1';

        console.log('ProfileSetupGuard - No setup found, redirecting to:', setupRoute);
        navigate(setupRoute, { replace: true });
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
