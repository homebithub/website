import { getAccessTokenFromCookies } from '~/utils/cookie';
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { profileSetupService } from '~/services/grpc/profileSetup.service';
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

    const profileType = localStorage.getItem('profile_type');
    try {
      const token = getAccessTokenFromCookies();

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
      const data = await profileSetupService.getProgress('', profileType);
      if (data) {
        const progressData = data.data || data || {};
        const totalSteps = progressData.total_steps || 0;
        const lastStep = progressData.last_completed_step || 0;
        const isComplete = progressData.status === 'completed' ||
          (totalSteps > 0 && lastStep >= totalSteps);

        console.log('ProfileSetupGuard - Setup status:', { isComplete, lastStep, totalSteps });

        if (isComplete) {
          setIsSetupComplete(true);
          setIsChecking(false);
          return;
        }

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
        navigate(setupRoute, { replace: true });
        return;
      } else {
        // No data returned - treat as no setup record
        if (profileType === 'household') {
          console.log('ProfileSetupGuard - No setup record, redirecting to household choice');
          navigate('/household-choice', { replace: true });
          return;
        }
        console.log("ProfileSetupGuard - No profile setup record found, starting from step 1");
        navigate('/profile-setup/househelp?step=1', { replace: true });
        return;
      }
    } catch (error: any) {
      // Handle NOT_FOUND (no profile setup record) - user hasn't started setup
      if (error?.code === 5 || error?.message?.includes('not found') || error?.message?.includes('NOT_FOUND')) {
        if (profileType === 'household') {
          console.log('ProfileSetupGuard - No setup record, redirecting to household choice');
          navigate('/household-choice', { replace: true });
        } else {
          console.log("ProfileSetupGuard - No profile setup record found, starting from step 1");
          navigate('/profile-setup/househelp?step=1', { replace: true });
        }
        setIsChecking(false);
        return;
      }
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
    return null; // Will redirect
  }

  return <>{children}</>;
}
