import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { motion } from "motion/react";
import { Link } from "@remix-run/react";
import React, { useEffect, useState } from "react";
import {
  HomeIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { OfferCard } from "~/components/OfferCard";
import "~/styles/glow-card.css";

const features = [
  {
    name: "Home Services",
    description: "Reliable and professional home services .",
    icon: HomeIcon,
  },
  {
    name: "Skilled Personnel",
    description:
      "We've got you covered by offering experienced, vetted and rated personnels.",
    icon: WrenchScrewdriverIcon,
  },
  {
    name: "Customer Support",
    description: "24/7 customer support to assist you with any queries.",
    icon: UserGroupIcon,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-16 sm:pb-24 lg:px-8 lg:py-32 pt-12 sm:pt-16 md:pt-20 lg:pt-24">
        <div className="mx-auto max-w-2xl lg:mx-auto lg:max-w-xl lg:flex-shrink-0 lg:pt-0 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-purple-900 dark:text-purple-400">
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
          <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-slate-600 dark:text-gray-300 mx-auto text-center max-w-xl">Professional home services at your fingertips. From laundry to childcare, we've got you covered with our expert team of house managers.</p>
        </div>
      </div>

      {/* How it works image section - Full width */}
      <div className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-screen overflow-hidden">
        {/* Full Background Image */}
        <img
          src="/how%20it%20works.jpg"
          alt="How it works"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60 z-10"></div>

        {/* Text Block */}
        <div className="relative z-20 flex items-start justify-start h-full">
          
        </div>
        {/* Animated CTA: Get Started */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 sm:bottom-8 sm:left-8 sm:translate-x-0 z-30">
  <Link
    to="/signup"
    className="link underline text-2xl font-semibold transition-colors duration-200 text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-100"
    style={{ fontFamily: 'Inter, ui-sans-serif, system-ui' }}
  >
    Get started
  </Link>
</div>
      </div>

      {/* What we offer section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 sm:pt-24 md:pt-32 pb-6 sm:pb-12 md:pb-16">
        <div className="mx-auto max-w-2xl lg:text-center center-mobile">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white leading-tight text-center">
            What We Offer
          </h2>
          <p className="mt-2 text-lg sm:text-2xl text-purple-400 text-center">
            More than just a home services platform.
          </p>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-slate-600 dark:text-gray-300 text-center">
            Whether you need a quick clean, or full-time help, HomeXpert
            connects you with reliable professionals you can trust.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-5xl sm:mt-20 lg:mt-24">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <OfferCard
              className="offer-glow-card"
              icon={
                <UserPlusIcon className="h-12 w-12 text-purple-600 dark:text-purple-400" />
              }
              title="Create an Account"
              description="Sign up in seconds to start accessing our wide range of home services."
            />
            <OfferCard
              className="offer-glow-card"
              icon={
                <CalendarDaysIcon className="h-12 w-12 text-purple-600 dark:text-purple-400" />
              }
              title="Bookings"
              description="Book trusted professionals for cleaning, care, and more."
            />
            <OfferCard
              className="offer-glow-card"
              icon={
                <UserGroupIcon className="h-12 w-12 text-purple-600 dark:text-purple-400" />
              }
              title="Placements"
              description="Personalised placements for families looking to hire trusted, full-time support."
            />
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-12 md:pt-16 pb-12 sm:pb-24 md:pb-32">
        <div className="mx-auto max-w-2xl lg:text-center center-mobile">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white leading-tight text-center">
            Why Choose Us
          </h2>
          <p className="mt-2 text-lg sm:text-2xl text-purple-400 text-center">
            Everything you need for your home
          </p>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-slate-600 dark:text-gray-300 text-center">
            We provide comprehensive home services with a focus on quality,
            reliability, and customer satisfaction.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-4xl sm:mt-20 lg:mt-24">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
            {features.map((feature) => (
              <OfferCard
                key={feature.name}
                className="offer-glow-card"
                icon={<feature.icon className="h-12 w-12 text-purple-600 dark:text-purple-400" />}
                title={feature.name}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}