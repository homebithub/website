import React, { useEffect, useRef, useState } from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { Link } from "react-router";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";

export const meta = () => [
    { title: "Home Services — Homebit Kenya" },
    { name: "description", content: "Explore Homebit's range of home services: housekeeping, nanny care, cooking, laundry, gardening, and more. Professional, vetted staff across Kenya." },
    { property: "og:title", content: "Home Services — Homebit Kenya" },
    { property: "og:url", content: "https://homebit.co.ke/services" },
];
import {
  WrenchScrewdriverIcon,
  PaintBrushIcon,
  HomeIcon,
  ShieldCheckIcon,
  BoltIcon,
  HeartIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

function SlideUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-600 ease-out ${
        visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-[0.97]"
      } ${className}`}
      style={{ transitionDuration: "600ms" }}
    >
      {children}
    </div>
  );
}

const services = [
  {
    name: "House Helps",
    description:
      "Professional house helps to make your daily chores effortless and keep your home running smoothly.",
    icon: HomeIcon,
    href: "/services/house-helps",
  },
  {
    name: "Child Care (Nannies)",
    description:
      "Caring, reliable nannies to nurture and support your children in a safe and loving environment.",
    icon: HeartIcon,
    href: "/services/child-care",
  },
  {
    name: "Home Maintenance & Repairs",
    description:
      "Comprehensive care for your home, from routine upkeep to fixing what’s broken. We handle everything so you don’t have to.",
    icon: WrenchScrewdriverIcon,
    href: "/services/maintenance-repairs",
  },
  {
    name: "Security Systems",
    description:
      "Protect your loved ones and property with our advanced home security solutions.",
    icon: ShieldCheckIcon,
    href: "/services/security",
  },
  {
    name: "Electrical Services",
    description:
      "Safe and reliable electrical installations, repairs, and upgrades for your peace of mind.",
    icon: BoltIcon,
    href: "/services/electrical",
  },
  {
    name: "Plumbing Services",
    description:
      "Prompt and professional plumbing solutions for leaks, clogs, and installations.",
    icon: WrenchScrewdriverIcon,
    href: "/services/plumbing",
  },
];

export default function Services() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="gradient" bubbles={false} className="flex-1">
        <main className="flex-grow">
          {/* Hero */}
          <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24">
            <SlideUp>
              <div className="mx-auto max-w-3xl text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 dark:bg-purple-900/30 px-3 py-1 mb-5">
                  <SparklesIcon className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                    What We Offer
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                  Our Services
                </h1>
                <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-purple-200 leading-relaxed max-w-2xl mx-auto">
                  Homebit connects households with trusted professionals for help at home, and gives service
                  providers a simple way to reach the families who need their help &mdash; all through one smart,
                  reliable platform.
                </p>
              </div>
            </SlideUp>
          </section>

          {/* Services Grid */}
          <section className="bg-white dark:bg-[#0a0a0f] py-14 sm:py-20 transition-colors duration-300">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {services.map((service, idx) => {
                  const showBadge = !["House Helps", "Child Care (Nannies)"].includes(service.name);
                  return (
                    <SlideUp key={service.name} delay={idx * 80}>
                      <div className="group relative rounded-2xl border border-purple-200/30 dark:border-purple-500/15 bg-gradient-to-br from-white to-purple-50/50 dark:from-[#13131a] dark:to-[#0a0a0f] p-5 sm:p-6 transition-all duration-300 hover:shadow-light-glow-md dark:hover:shadow-glow-sm hover:-translate-y-1">
                        <div className="flex items-start gap-3.5">
                          <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-md group-hover:scale-110 transition-transform duration-300">
                            <service.icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                              {service.name}
                            </h3>
                            {showBadge && (
                              <span className="mt-1 inline-block rounded-full bg-gray-100 dark:bg-purple-900/30 px-2 py-0.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
                                Coming soon
                              </span>
                            )}
                            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                              {service.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </SlideUp>
                  );
                })}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-br from-purple-100 via-white to-purple-200 dark:from-[#0a0a0f] dark:via-[#13131a] dark:to-[#0a0a0f] py-14 sm:py-20 transition-colors duration-300">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
              <SlideUp>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  Need help around the house?
                </h2>
                <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Join Homebit and connect with trusted professionals today.
                </p>
                <div className="mt-6">
                  <Link
                    to="/signup"
                    className="inline-block rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 text-sm sm:text-base font-bold text-white shadow-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300"
                  >
                    Get Started
                  </Link>
                </div>
              </SlideUp>
            </div>
          </section>
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";

