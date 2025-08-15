import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { motion } from "motion/react";
import { Link, useNavigate } from "@remix-run/react";
import React, { useEffect, useState } from "react";
import SignupFlow from "~/components/SignupFlow";
import HousehelpSignupFlow from "~/components/HousehelpSignupFlow";
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
  

  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [userType, setUserType] = useState<'househelp' | 'household' | null>(null);
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
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
        <div className="relative bg-white">
          <div className="flex flex-col items-center justify-center w-full px-4 sm:px-6 pt-16 sm:pt-20 pb-12 sm:pb-16 lg:px-8 lg:pt-20 lg:pb-20">
                          <div className="mx-auto max-w-4xl text-center px-2 sm:px-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-black mb-6 sm:mb-8 font-sans whitespace-nowrap">
                  Your Home, Our Expertise!
                </h1>
              <p className="mt-6 sm:mt-8 md:mt-12 text-sm sm:text-base md:text-lg leading-6 sm:leading-7 md:leading-8 text-gray-750 font-medium px-2 sm:px-0">
                Transform your living space with our comprehensive home services. From deep cleaning to specialized childcare, we connect you with verified professionals who treat your home like their own.
              </p>
              {/* Image Cards Section */}
              <div className="mt-12 sm:mt-16 md:mt-20 w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                {/* Mobile: 2x2 Grid, Desktop: Horizontal Layout */}
                <div className="grid grid-cols-2 gap-4 sm:gap-6 md:flex md:justify-center md:gap-8">
                  <div className="aspect-square w-full md:w-56 h-40 sm:h-48 md:h-56 bg-white rounded-lg shadow-md p-3 sm:p-4">
                    <img src="/kufua.png" alt="Laundry Service" className="w-full h-full object-cover rounded-md" />
                  </div>
                  <div className="aspect-square w-full md:w-56 h-40 sm:h-48 md:h-56 bg-white rounded-lg shadow-md p-3 sm:p-4">
                    <img src="/lady laundry.jpg" alt="Woman doing laundry" className="w-full h-full object-cover rounded-md" />
                  </div>
                  <div className="aspect-square w-full md:w-56 h-40 sm:h-48 md:h-56 bg-white rounded-lg shadow-md p-3 sm:p-4">
                    <img src="/man dishes.png" alt="Man washing dishes" className="w-full h-full object-cover rounded-md" />
                  </div>
                  <div className="aspect-square w-full md:w-56 h-40 sm:h-48 md:h-56 bg-white rounded-lg shadow-md p-3 sm:p-4">
                    <img src="/babysitter.webp" alt="Babysitter with child" className="w-full h-full object-cover rounded-md" />
                  </div>
                </div>
              </div>

                              {/* CTA Button */}
                <div className="mt-8 sm:mt-10 md:mt-12 flex items-center justify-center gap-x-1 sm:gap-x-2 px-4 sm:px-0">
                  <Link
                    to="/signup"
                    className="rounded-md bg-primary-700 px-4 sm:px-6 py-2.5 sm:py-3 text-base sm:text-lg font-semibold text-white shadow-sm hover:bg-primary-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transform hover:scale-105 transition-transform"
                  >
                    Get Started...     
                  </Link>
                  <img src="/glitter.png" alt="Sparkle icon" className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
            </div>
          </div>
        </div>

        {/* What we offer section */}
        <div className="bg-[#d1c4e9] py-12 sm:py-16 md:py-24 rounded-2xl sm:rounded-3xl mx-4 sm:mx-7 md:mx-14 lg:mx-28">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-6xl rounded-2xl sm:rounded-3xl bg-white p-6 sm:p-8 md:p-12 lg:p-16 shadow-lg">
              <div className="text-center">
                <h2 className="text-2xl font-semibold tracking-tight text-gray-600">
                  What We Offer
                </h2>
                <p className="mt-4 font-bold text-2xl sm:text-3xl md:text-4xl leading-tight text-gray-900">
                  More than just a home services platform.
                </p>
                <p className="mt-2 text-base leading-7 text-gray-750">
                  Whether you need a quick clean, or full-time help, HomeXpert connects you with reliable professionals you can trust.
                </p>
              </div>
              <div className="mt-12 sm:mt-16 grid grid-cols-1 gap-y-8 sm:gap-y-12 text-center sm:grid-cols-3 sm:gap-x-6 lg:gap-x-8">
                <div className="flex flex-col items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                    <svg className="h-10 w-10 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-gray-900">Comprehensive Home Services</h3>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-100">
                    <svg className="h-10 w-10 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />
                    </svg>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-gray-900">Qualified Househelps</h3>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
                    <svg className="h-10 w-10 text-teal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 14h.01" />
                    </svg>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-gray-900">Flexible Scheduling </h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Whatever You Need section */}
        <div className="bg-white py-12 sm:py-16 md:py-24">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
            <div className="mx-auto max-w-[1400px]">
              <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-16 items-center">
                {/* Text Content - Left Column */}
                <div className="lg:w-1/2 mx-auto text-center">
                  <h2 className="text-2xl font-semibold tracking-tight text-gray-600">
                    HomeXpert
                  </h2>
                  <p className="mt-4 font-bold text-2xl sm:text-3xl md:text-4xl leading-tight text-gray-900">
                    Where Quality help meets Opportunity
                  </p>
                  <p className="mt-2 text-base leading-7 text-gray-750">
                    At HomeXpert, we bring skilled, reliable househelps together with households that value trust and professionalism. Whether you're seeking work or looking to hire, we make the connection simple, secure, and stress-free.
                  </p>
                  <div className="mt-8 sm:mt-10 md:mt-12 flex items-center justify-center">
                    <Link
                      to="/signup"
                      className="rounded-md bg-primary-700 px-4 sm:px-6 py-2.5 sm:py-3 text-base sm:text-lg font-semibold text-white shadow-sm hover:bg-primary-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transform hover:scale-105 transition-transform"
                    >
                      Join HomeXpert Today
                    </Link>
                  </div>
                </div>
                
                {/* How It Works Image - Right Column */}
                <div className="lg:w-1/2 flex justify-center lg:justify-end">
                  <div className="w-full max-w-[1200px]">
                    <img 
                      src="/how it works.jpg" 
                      alt="How It Works" 
                      className="w-full h-auto rounded-2xl shadow-lg border-rad-20"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us section */}
        <div className="bg-[#d1c4e9] py-12 sm:py-16 md:py-20">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-[1100px] rounded-2xl sm:rounded-3xl bg-white shadow-lg p-6 sm:p-10 md:p-16 lg:p-20 mb-6 sm:mb-8">
      <div className="text-center max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-600">
          Why Choose Us
        </h2>
        <p className="mt-4 font-bold text-3xl leading-tight text-gray-900 sm:text-4xl">
          Everything you need for your home
        </p>
        <p className="mt-2 text-base leading-7 text-gray-750">
          We provide comprehensive home services with a focus on quality,
          reliability, and customer satisfaction.
        </p>
      </div>
              <div className="mt-12 sm:mt-16 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="relative flex flex-col items-center text-center rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 p-3">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="mt-4 text-lg sm:text-xl font-semibold leading-6 sm:leading-7 tracking-tight text-gray-900">{feature.name}</h3>
                <p className="mt-3 text-base sm:text-lg leading-6 sm:leading-7 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
    </div>
  </div>
</div>
      </main>
      <Footer />
    </div>
  );
}