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
          <h2 className="text-3xl font-bold text-white mb-2">🏠 Homebit</h2>
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

  // Show marketing page for non-authenticated users
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="gradient" bubbles={true} bubbleDensity="high">
      <main className="flex-grow">
        {/* Initial Signup Modal - User Type Selection */}
        <SignupFlow 
          isOpen={isSignupModalOpen} 
          onClose={() => {
            setIsSignupModalOpen(false);
            setUserType(null);
          }}
          onUserTypeSelected={(type) => {
            setIsSignupModalOpen(false);
            setUserType(null);
            if (type === 'househelp') {
              navigate('/signup/househelp');
            } else if (type === 'household') {
              navigate('/signup/household');
            }
          }}
        />
        
        {/* Profile Completion Modal */}
        <HousehelpSignupFlow 
          isOpen={isProfileModalOpen} 
          onClose={handleProfileComplete}
          initialUserType={userType || undefined}
        />
        <div className="relative bg-transparent dark:from-[#050508] dark:via-[#0a0a0f] dark:to-purple-950 overflow-hidden fade-in-scroll transition-colors duration-500">
  {/* Floating SVG shapes for playful effect */}
  <svg className="absolute top-0 left-0 w-48 h-48 opacity-30 dark:opacity-20 animate-float" viewBox="0 0 200 200" fill="none"><circle cx="100" cy="100" r="100" fill="#c084fc" /></svg>
  <svg className="absolute bottom-0 right-0 w-64 h-64 opacity-20 dark:opacity-10 animate-float delay-1000" viewBox="0 0 200 200" fill="none"><rect width="200" height="200" rx="70" fill="#a855f7" /></svg>
  {/* Dark mode gradient orbs */}
  <div className="hidden dark:block absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
  <div className="hidden dark:block absolute bottom-1/3 left-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: '1.5s' }} />
  <div className="flex flex-col items-center justify-center w-full px-4 sm:px-6 pt-6 sm:pt-8 pb-12 sm:pb-16 lg:px-8 lg:pt-10 lg:pb-20 relative z-10">
    <div className="mx-auto max-w-4xl text-center px-2 sm:px-0">
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 sm:mb-8 font-sans drop-shadow-lg animate-fadeIn">
        Your Home, Our Expertise!
      </h1>
      <p className="mt-6 sm:mt-8 md:mt-12 text-base sm:text-lg md:text-2xl leading-7 sm:leading-8 md:leading-9 text-gray-700 dark:text-purple-200 font-medium px-2 sm:px-0 animate-fadeIn fade-in-scroll">
        Transform your living space with our comprehensive home services. From deep cleaning to specialized childcare, we connect you with verified professionals who treat your home like their own.
      </p>
      {/* Image Cards Section */}
      <div className="mt-12 sm:mt-16 md:mt-20 w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 fade-in-scroll">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:flex md:justify-center md:gap-8">
          <div className="aspect-square w-full md:w-56 h-40 sm:h-48 md:h-56 bg-white dark:bg-[#13131a] rounded-lg shadow-light-glow-sm dark:shadow-glow-sm p-3 sm:p-4 transition-all duration-500 hover:scale-105 hover:shadow-light-glow-md dark:hover:shadow-glow-md fade-in-scroll border-2 border-purple-200/40 dark:border-purple-500/20">
            <img src="/assets/kufua.png" alt="Laundry Service" className="w-full h-full object-cover rounded-md" onError={(e)=>{const img=e.currentTarget as HTMLImageElement; if(!img.dataset.fallback){img.dataset.fallback='1'; img.src='/kufua.png';}}} />
          </div>
          <div className="aspect-square w-full md:w-56 h-40 sm:h-48 md:h-56 bg-white dark:bg-[#13131a] rounded-lg shadow-light-glow-sm dark:shadow-glow-sm p-3 sm:p-4 transition-all duration-500 hover:scale-105 hover:shadow-light-glow-md dark:hover:shadow-glow-md fade-in-scroll border-2 border-purple-200/40 dark:border-purple-500/20">
            <img src="/assets/lady laundry.jpg" alt="Woman doing laundry" className="w-full h-full object-cover rounded-md" onError={(e)=>{const img=e.currentTarget as HTMLImageElement; if(!img.dataset.fallback){img.dataset.fallback='1'; img.src='/lady laundry.jpg';}}} />
          </div>
          <div className="aspect-square w-full md:w-56 h-40 sm:h-48 md:h-56 bg-white dark:bg-[#13131a] rounded-lg shadow-light-glow-sm dark:shadow-glow-sm p-3 sm:p-4 transition-all duration-500 hover:scale-105 hover:shadow-light-glow-md dark:hover:shadow-glow-md fade-in-scroll border-2 border-purple-200/40 dark:border-purple-500/20">
            <img src="/assets/man dishes.png" alt="Man washing dishes" className="w-full h-full object-cover rounded-md" onError={(e)=>{const img=e.currentTarget as HTMLImageElement; if(!img.dataset.fallback){img.dataset.fallback='1'; img.src='/man dishes.png';}}} />
          </div>
          <div className="aspect-square w-full md:w-56 h-40 sm:h-48 md:h-56 bg-white dark:bg-[#13131a] rounded-lg shadow-light-glow-sm dark:shadow-glow-sm p-3 sm:p-4 transition-all duration-500 hover:scale-105 hover:shadow-light-glow-md dark:hover:shadow-glow-md fade-in-scroll border-2 border-purple-200/40 dark:border-purple-500/20">
            <img src="/assets/babysitter.webp" alt="Babysitter with child" className="w-full h-full object-cover rounded-md" onError={(e)=>{const img=e.currentTarget as HTMLImageElement; if(!img.dataset.fallback){img.dataset.fallback='1'; img.src='/babysitter.webp';}}} />
          </div>
        </div>
      </div>
      {/* CTA Button */}
      <div className="mt-8 sm:mt-10 md:mt-12 flex items-center justify-center gap-x-2 px-4 sm:px-0 fade-in-scroll">
        <Link
          to="/signup"
          className="glow-button rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 sm:px-8 py-3 sm:py-4 text-lg sm:text-2xl font-bold text-white shadow-lg hover:from-purple-700 hover:to-pink-700 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transform hover:scale-110 transition-all duration-300 animate-fadeIn"
        >
          Get Started
        </Link>
        <img src="/assets/glitter.png" alt="Sparkle icon" className="h-8 w-8 sm:h-10 sm:w-10 animate-float" onError={(e)=>{const img=e.currentTarget as HTMLImageElement; if(!img.dataset.fallback){img.dataset.fallback='1'; img.src='/glitter.png';}}} />
      </div>
    </div>
  </div>
</div>

        {/* What we offer section */}
        <div className="relative bg-gradient-to-br from-purple-100 via-white to-purple-200 dark:from-[#0a0a0f] dark:via-[#13131a] dark:to-[#0a0a0f] py-12 sm:py-16 md:py-24 rounded-2xl sm:rounded-3xl mx-4 sm:mx-7 md:mx-14 lg:mx-28 fade-in-scroll overflow-hidden transition-colors duration-300">
  {/* Fun floating background shapes */}
  <svg className="absolute -top-16 left-0 w-64 h-64 opacity-10 animate-float" viewBox="0 0 200 200"><circle cx="100" cy="100" r="100" fill="#a855f7" /></svg>
  <svg className="absolute bottom-0 right-0 w-72 h-72 opacity-10 animate-float delay-1000" viewBox="0 0 200 200"><rect width="200" height="200" rx="70" fill="#c084fc" /></svg>
  <div className="mx-auto max-w-7xl px-6 lg:px-8">
    <div className="mx-auto max-w-6xl rounded-2xl sm:rounded-3xl bg-white/90 dark:bg-[#13131a]/95 p-6 sm:p-8 md:p-12 lg:p-16 shadow-light-glow-lg dark:shadow-glow-lg backdrop-blur-md fade-in-scroll transition-colors duration-300 border-2 border-purple-200/50 dark:border-purple-500/20">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-primary-700 dark:text-purple-400 animate-fadeIn">What We Offer</h2>
        <p className="mt-4 font-bold text-2xl sm:text-3xl md:text-4xl leading-tight text-gray-900 dark:text-white animate-fadeIn">More than just a home services platform.</p>
        <p className="mt-2 text-base leading-7 text-gray-700 dark:text-gray-300 animate-fadeIn">Whether you need a quick clean, or full-time help, Homebit connects you with reliable professionals you can trust.</p>
      </div>
      <div className="mt-12 sm:mt-16 grid grid-cols-1 gap-y-8 sm:gap-y-12 text-center sm:grid-cols-3 sm:gap-x-6 lg:gap-x-8">
        <div className="flex flex-col items-center fade-in-scroll">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-200 to-yellow-400 dark:from-yellow-600 dark:to-yellow-800 shadow-lg dark:shadow-glow-sm animate-float">
            <svg className="h-12 w-12 text-yellow-600 dark:text-yellow-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h3 className="mt-5 text-lg font-bold text-primary-700 dark:text-purple-400">Comprehensive Home Services</h3>
        </div>
        <div className="flex flex-col items-center fade-in-scroll">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-200 to-pink-400 dark:from-pink-600 dark:to-pink-800 shadow-lg dark:shadow-glow-sm animate-float delay-500">
            <svg className="h-12 w-12 text-pink-600 dark:text-pink-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />
            </svg>
          </div>
          <h3 className="mt-5 text-lg font-bold text-primary-700 dark:text-purple-400">Qualified Househelps</h3>
        </div>
        <div className="flex flex-col items-center fade-in-scroll">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-200 to-teal-400 dark:from-teal-600 dark:to-teal-800 shadow-lg dark:shadow-glow-sm animate-float delay-1000">
            <svg className="h-12 w-12 text-teal-600 dark:text-teal-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14h.01" />
            </svg>
          </div>
          <h3 className="mt-5 text-lg font-bold text-primary-700 dark:text-purple-400">Flexible Scheduling </h3>
        </div>
      </div>
    </div>
  </div>
</div>

        {/* Whatever You Need section */}
        <div className="relative bg-gradient-to-br from-purple-100/60 via-purple-200/40 to-pink-100/60 dark:from-[#0a0a0f] dark:via-[#13131a] dark:to-[#0a0a0f] py-12 sm:py-16 md:py-24 fade-in-scroll overflow-hidden transition-colors duration-300">
  {/* Purple floating blob */}
  <svg className="absolute -bottom-20 left-0 w-96 h-96 opacity-10 animate-float" viewBox="0 0 200 200"><ellipse cx="100" cy="100" rx="100" ry="80" fill="#a855f7" /></svg>
  <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
    <div className="mx-auto max-w-[1400px]">
      <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-16 items-center">
        {/* Text Content - Left Column */}
        <div className="lg:w-1/2 mx-auto text-center fade-in-scroll">
          <h2 className="text-3xl font-extrabold tracking-tight text-primary-700 dark:text-purple-400 animate-fadeIn">Homebit</h2>
          <p className="mt-4 font-bold text-2xl sm:text-3xl md:text-4xl leading-tight text-gray-900 dark:text-white animate-fadeIn">Where Quality help meets Opportunity</p>
          <p className="mt-2 text-base leading-7 text-gray-700 dark:text-gray-300 animate-fadeIn">At Homebit, we bring skilled, reliable househelps together with households that value trust and professionalism. Whether you're seeking work or looking to hire, we make the connection simple, secure, and stress-free.</p>
          <div className="mt-8 sm:mt-10 md:mt-12 flex items-center justify-center fade-in-scroll">
            <Link
              to="/signup"
              className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 sm:px-10 py-3 sm:py-4 text-lg sm:text-2xl font-bold text-white shadow-lg hover:from-purple-700 hover:to-pink-700 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transform hover:scale-110 transition-all duration-300 animate-fadeIn"
            >
              Join Homebit Today
            </Link>
          </div>
        </div>
        {/* How It Works Image - Right Column */}
        <div className="lg:w-1/2 flex justify-center lg:justify-end fade-in-scroll">
          <div className="w-full max-w-[500px] rounded-3xl overflow-hidden shadow-xl dark:shadow-glow-lg border-4 border-primary-200 dark:border-purple-500/30 animate-fadeIn group transition-all duration-500 hover:scale-110 hover:shadow-2xl dark:hover:shadow-glow-lg">
            <img 
  src="/assets/how it works.jpg" 
  alt="How It Works" 
  className="w-full h-auto object-cover rounded-3xl"
  onError={(e)=>{const img=e.currentTarget as HTMLImageElement; if(!img.dataset.fallback){img.dataset.fallback='1'; img.src='/how it works.jpg';}}}
/>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

        {/* Why Choose Us section */}
        <div className="relative bg-gradient-to-br from-purple-200 via-white to-purple-100 dark:from-[#0a0a0f] dark:via-[#13131a] dark:to-[#0a0a0f] py-12 sm:py-16 md:py-20 fade-in-scroll overflow-hidden transition-colors duration-300">
  {/* Animated background accent */}
  <svg className="absolute top-0 right-0 w-72 h-72 opacity-10 animate-float delay-1000" viewBox="0 0 200 200"><ellipse cx="100" cy="100" rx="100" ry="80" fill="#c084fc" /></svg>
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-[1100px] rounded-2xl sm:rounded-3xl bg-white/90 dark:bg-[#13131a]/95 shadow-light-glow-md dark:shadow-glow-md p-6 sm:p-10 md:p-16 lg:p-20 mb-6 sm:mb-8 backdrop-blur-md fade-in-scroll border-2 border-purple-200/40 dark:border-purple-500/20">
      <div className="text-center max-w-5xl mx-auto">
        <h2 className="text-3xl font-extrabold tracking-tight text-primary-700 dark:text-purple-400 animate-fadeIn">Why Choose Us</h2>
        <p className="mt-4 font-bold text-3xl leading-tight text-gray-900 dark:text-white sm:text-4xl animate-fadeIn">Everything you need for your home</p>
        <p className="mt-2 text-base leading-7 text-gray-700 dark:text-gray-300 animate-fadeIn">We provide comprehensive home services with a focus on quality, reliability, and customer satisfaction.</p>
      </div>
      <div className="mt-12 sm:mt-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <div key={feature.name} className="relative flex flex-col items-center text-center rounded-xl sm:rounded-2xl border-2 border-primary-200 dark:border-purple-500/30 bg-white/90 dark:bg-[#13131a]/95 p-6 sm:p-8 shadow-light-glow-sm dark:shadow-glow-sm transition-transform duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-light-glow-md dark:hover:shadow-glow-md fade-in-scroll animate-fadeIn" style={{ animationDelay: `${0.1 * idx}s` }}>
              <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-indigo-500 p-4 animate-float">
                <feature.icon className="h-10 w-10 text-white" />
              </div>
              <h3 className="mt-4 text-lg sm:text-xl font-bold leading-6 sm:leading-7 tracking-tight text-primary-700 dark:text-purple-400">{feature.name}</h3>
              <p className="mt-3 text-base sm:text-lg leading-6 sm:leading-7 text-gray-600 dark:text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</div>
      </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}
// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
