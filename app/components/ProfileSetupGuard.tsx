import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Loading } from './Loading';
import { getStoredProfileType } from '~/utils/authStorage';
import { resolveProfileSetupDestination } from '~/utils/profileSetupRouting';

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
    '/add-phone',
    '/about',
    '/services',
    '/contact',
    '/pricing',
    '/terms',
    '/privacy',
    '/cookies',
    '/devices',
  ];

  const isExemptRoute = () => {
    return location.pathname === '/' || exemptRoutes.some(route => location.pathname.startsWith(route));
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

    const profileType = getStoredProfileType();
    try {
      if (!profileType) {
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
      const destination = await resolveProfileSetupDestination({
        profileType,
        completedPath: '',
      });

      if (!destination) {
        setIsSetupComplete(true);
        setIsChecking(false);
        return;
      }

      navigate(destination, { replace: true });
      return;
    } catch (error: any) {
      console.error('ProfileSetupGuard - Error:', error);
      // On other errors, allow navigation (fail open)
      setIsSetupComplete(true);
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return <Loading text="Checking profile..." />;
  }

  if (!isSetupComplete) {
    return <Loading text="Redirecting..." />;
  }

  return <>{children}</>;
}
