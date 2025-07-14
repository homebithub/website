import { Navigation } from "~/components/Navigation";
import { motion } from "motion/react";
import { Link } from "@remix-run/react";
import React, { useEffect, useState } from "react";
import {
  HomeIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  ShieldCheckIcon,
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation />

      <div className="mx-auto max-w-7xl px-6 pb-24 pt-16 sm:pb-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl lg:mx-auto lg:max-w-xl lg:flex-shrink-0 lg:pt-0 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl dark:text-primary-400">
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
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-gray-300">
            Professional home services at your fingertips. From laundry to
            childcare, we've got you covered with our expert team of house
            managers.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/services"
              className="text-sm px-6 py-2 rounded-lg bg-purple-600 dark:bg-purple-700 text-white hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors duration-200 font-semibold shadow-sm hover:shadow-md"
            >
              Our Services
            </Link>
            <Link
              to="/contact"
              className="text-sm font-semibold leading-6 text-slate-900 dark:text-primary-300 hover:text-primary-600 dark:hover:text-primary-400"
            >
              Contact Us <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* How it works image section - Full width */}
      <div className="relative w-full h-screen overflow-hidden">
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
          <div className="w-full max-w-7xl px-6 sm:px-10 pt-16 lg:pt-24">
            <div className="w-full lg:w-1/2 space-y-6">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="text-3xl font-semibold text-white leading-tight"
              >
                How it works
              </motion.h2>

              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-5xl font-bold text-purple-400 leading-snug"
              >
                Getting house managers <br />
                has never been made easier
              </motion.h3>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.8 }}
                className="text-2xl font-semibold text-gray-200 leading-relaxed max-w-md"
              >
                <strong > Create an account </strong> and
                <br />
                get started with our<br />
                our seamless onboarding process. <br />
                Our smart system matches <br />
                you with professionals perfectly <br />
                suited for your needs so you— <br />
                can focus on what matters.
              </motion.p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-3xl font-semibold text-white leading-tight">
            Why Choose Us
          </h2>
          <p className="mt-2 text-2xl text-purple-400 sm:text-6xl">
            Everything you need for your home
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-gray-300">
            We provide comprehensive home services with a focus on quality,
            reliability, and customer satisfaction.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-4xl sm:mt-20 lg:mt-24">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.name}
                className="rounded-2xl shadow-lg p-6 bg-gradient-to-br from-primary-100 via-white to-primary-50 dark:from-primary-900 dark:via-slate-900 dark:to-primary-800 border border-primary-200 dark:border-primary-700 transition-colors"
              >
                <div className="text-xl font-bold text-primary-700 dark:text-primary-300 mb-2 text-center">
                  {feature.name}
                </div>
                <div className="text-base text-slate-700 dark:text-gray-200 text-center">
                  {feature.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}