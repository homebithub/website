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
    <div className="min-h-screen bg-white">
      <Navigation />

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
      <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8 my-8">
  <div
    className="relative rounded-xl overflow-hidden shadow-lg bg-gray-100 w-full max-w-7xl mx-auto"
  >
    <img
      src="/how%20it%20works.jpg"
      alt="How it works"
      className="w-full h-auto object-cover"
    />
    {/* CTA overlay - visually integrated, left-aligned, responsive */}
    <div className="absolute inset-0 flex items-end sm:items-center justify-start p-4 sm:p-8 lg:p-12 pointer-events-none">
      <div className="w-full max-w-2xl flex justify-start">
        <Link
          to="/signup"
          className="pointer-events-auto px-5 py-3 text-lg rounded-xl bg-purple-600 text-white font-bold shadow-lg hover:bg-purple-700 transition-colors duration-200 border-4 border-white/20 focus:outline-none focus:ring-4 focus:ring-purple-300"
          style={{ boxShadow: '0 8px 32px rgba(128,0,255,0.16)' }}
        >
          Join HomeXpert
        </Link>
      </div>
    </div>
  </div>
</div>



      {/* What we offer section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mx-auto max-w-2xl lg:text-center center-mobile">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 leading-tight text-center">
            What We Offer
          </h2>
          <p className="mt-2 text-lg sm:text-2xl text-slate-900 text-center">
            More than just a home services platform.
          </p>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-slate-600 text-center font-medium">
            Whether you need a quick clean, or full-time help, HomeXpert
            connects you with reliable professionals you can trust.
          </p>
        </div>
      </div>

      {/* Feature section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mx-auto max-w-2xl lg:text-center center-mobile">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 leading-tight text-center">
            Why Choose Us
          </h2>
          <p className="mt-2 text-lg sm:text-2xl text-slate-900 text-center">
            Everything you need for your home
          </p>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-slate-600 text-center font-medium">
            We provide comprehensive home services with a focus on quality,
            reliability, and customer satisfaction.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-4xl sm:mt-20 lg:mt-24">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="relative flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                <feature.icon className="h-12 w-12 text-purple-600" />
                <h3 className="mt-4 text-lg font-semibold leading-7 tracking-tight text-gray-900">{feature.name}</h3>
                <p className="mt-4 text-base leading-7 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}