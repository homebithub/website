import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { motion } from "motion/react";
import { Link } from "@remix-run/react";
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
    name: "Customer Support",
    description: "24/7 customer support to assist you with any queries.",
    icon: PhoneArrowUpRightIcon,
  },
  {
    name: "Secure Payments",
    description: "Safe and secure payment processing for all services.",
    icon: ShieldCheckIcon,
  },
];

export default function Index() {
  // Typewriter animation for the main heading
  const fullText = "Your Home, Our Expertise";
  const [typedText, setTypedText] = useState("");

  // Use refs to avoid interval/timeout overlap and memory leaks
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = React.useRef(0);

  useEffect(() => {
    function clearTimers() {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }

    function startTyping() {
      clearTimers();
      setTypedText("");
      currentIndexRef.current = 0;
      intervalRef.current = setInterval(() => {
        currentIndexRef.current++;
        setTypedText(fullText.slice(0, currentIndexRef.current));
        if (currentIndexRef.current >= fullText.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          timeoutRef.current = setTimeout(() => {
            startTyping();
          }, 3000);
        }
      }, 100);
    }

    startTyping();

    return () => {
      clearTimers();
    };
  }, []);

  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [userType, setUserType] = useState<'househelp' | 'household' | null>(null);

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
          onUserTypeSelected={handleUserTypeSelected}
        />
        
        {/* Profile Completion Modal */}
        <HousehelpSignupFlow 
          isOpen={isProfileModalOpen} 
          onClose={handleProfileComplete}
          initialUserType={userType || undefined}
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="mx-auto max-w-2xl lg:mx-auto lg:max-w-xl lg:flex-shrink-0 lg:pt-0 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
              <span
                style={{
                  whiteSpace: "nowrap",
                  minHeight: "1em",
                  display: "inline-block",
                }}
              >
                {typedText}
                <span className="animate-pulse">|</span>
              </span>
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-slate-600 mx-auto text-center max-w-xl font-medium">Professional home services at your fingertips. From laundry to childcare, we've got you covered with our expert team of house managers.</p>
          </div>
        </div>

        {/* How it works image section */}
        <div className="w-full my-8 px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
          <div className="relative w-full mx-auto rounded-xl overflow-hidden shadow-lg">
            <img
              src="/how%20it%20works.jpg"
              alt="How it works"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* What we offer section */}
        <div className="w-full my-8 px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="relative w-full mx-auto rounded-xl overflow-hidden shadow-lg">
                  <img
                    src="/AdobeStock_1207852325_Preview.jpeg"
                    alt="Home services illustration"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
              <div className="order-1 md:order-2 max-w-2xl mx-auto text-center md:text-left font-sans">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight tracking-tight">
                  What We Offer
                </h2>
                <p className="mt-3 text-xl sm:text-2xl font-semibold text-slate-800 leading-relaxed">
                  More than just a home services platform.
                </p>
                <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-600 font-normal">
                  Whether you need a quick clean, or full-time help, HomeXpert
                  connects you with reliable professionals you can trust.
                </p>
                
                {/* Detailed points */}
                <div className="mt-8 space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      ✓
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-slate-900 leading-tight mb-2">Comprehensive Home Services</h4>
                      <p className="text-base leading-relaxed text-slate-600 font-normal">From daily cleaning and laundry to specialized childcare and elderly care, we provide a full spectrum of home management services tailored to your specific needs.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      ✓
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-slate-900 leading-tight mb-2">Vetted & Certified Professionals</h4>
                      <p className="text-base leading-relaxed text-slate-600 font-normal">All our service providers undergo rigorous background checks, skill assessments, and continuous training to ensure the highest standards of professionalism and reliability.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      ✓
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-slate-900 leading-tight mb-2">Flexible Scheduling & Real-time Tracking</h4>
                      <p className="text-base leading-relaxed text-slate-600 font-normal">Book services on-demand or schedule recurring appointments. Track service progress in real-time and receive instant updates through our user-friendly platform.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us section */}
        <div className="bg-purple-50 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Why Choose Us
              </h2>
              <p className="mt-4 text-xl text-gray-700">
                Everything you need for your home
              </p>
              <p className="mt-4 text-lg text-gray-600">
                We provide comprehensive home services with a focus on quality,
                reliability, and customer satisfaction.
              </p>
            </div>
            
            <div className="mt-16 max-w-7xl mx-auto">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
                {features.map((feature) => (
                  <div key={feature.name} className="relative flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 p-3">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold leading-7 tracking-tight text-gray-900">{feature.name}</h3>
                    <p className="mt-4 text-base leading-7 text-gray-600">{feature.description}</p>

                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}