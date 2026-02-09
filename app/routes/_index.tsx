import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import useScrollFadeIn from "~/hooks/useScrollFadeIn";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { PurpleCard } from '~/components/ui/PurpleCard';
import { Link, useNavigate } from "react-router";
import React, { useEffect, useState } from "react";
import SignupFlow from "~/components/features/SignupFlow";
import HousehelpSignupFlow from "~/components/features/HousehelpSignupFlow";
import AuthenticatedHome from "~/components/AuthenticatedHome";
import HousehelpHome from "~/components/HousehelpHome";
import Home4 from "~/routes/home4";
import {
  HomeIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  PhoneArrowUpRightIcon,
  UserPlusIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/solid";


const features = [
  {
    name: "Home Services",
    description: "Reliable and professional home services.",
    icon: HomeIcon,
  },
  {
    name: "Skilled Personnel",
    description:
      "We've got you covered by offering experienced, vetted and rated professionals.",
    icon: UserGroupIcon,
  },
  {
    name: "Transparent Payments",
    description: "Fixed prices with no hidden fees and secure payment.",
    icon: ShieldCheckIcon,
  },
];

export default function Index() {
  useScrollFadeIn();

  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [userType, setUserType] = useState<'househelp' | 'household' | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
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
        } else {
          console.warn('Authenticated but no valid user type found');
        }
      } else {
        setIsAuthenticated(false);
      }

      // Simulate a brief loading time for smooth transition
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };

    checkAuth();
  }, []);

  // No redirect: both authenticated roles stay on '/'

  const openSignupModal = (type: 'househelp' | 'household') => {
    setUserType(type);
    setIsSignupModalOpen(true);
  };

  const handleUserTypeSelected = (type: 'househelp' | 'household') => {
    setUserType(type);
    setIsProfileModalOpen(true);
  };

  const handleProfileComplete = () => {
    setIsProfileModalOpen(false);
    setUserType(null);
    // User will be redirected to dashboard from within the HousehelpSignupFlow component
  };

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

  // Show Home4 marketing page for non-authenticated users
  return <Home4 />;
}
// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
