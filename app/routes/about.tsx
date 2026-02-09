import React, { useEffect, useRef, useState } from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { Link } from "react-router";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import {
  CheckBadgeIcon,
  HeartIcon,
  ShieldCheckIcon,
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

interface Value {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface TeamMember {
  name: string;
  role: string;
}

const values: Value[] = [
    {
        name: "Quality",
        description: "We maintain high standards in every service we provide.",
        icon: CheckBadgeIcon,
    },
    {
        name: "Reliability",
        description: "We deliver on our promises, every time.",
        icon: ShieldCheckIcon,
    },
    {
        name: "Trust",
        description: "We build lasting relationships through transparency and integrity.",
        icon: HeartIcon,
    },
    {
        name: "Innovation",
        description: "We continuously improve and adapt to serve you better.",
        icon: SparklesIcon,
    },
];

const team: TeamMember[] = [
  {
    name: "John Smith",
    role: "CEO",
  },
  {
    name: "Sarah Johnson",
    role: "COO",
  },
  {
    name: "Michael Brown",
    role: "CTO",
  },
  {
    name: "Emily Davis",
    role: "Head of Customer Success",
  },
];

export default function About() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />
            <PurpleThemeWrapper variant="gradient" bubbles={false} className="flex-1">
            <main className="flex-1">
                {/* Hero Section */}
                <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24">
                    <SlideUp>
                        <div className="mx-auto max-w-4xl text-center">
                            <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 dark:bg-purple-900/30 px-3 py-1 mb-5">
                                <SparklesIcon className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                                    Who We Are
                                </span>
                            </div>
                            <h1 className="text-xl sm:text-2xl md:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
                                About HomeBit
                            </h1>
                            <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-purple-200 leading-relaxed max-w-2xl mx-auto">
                                Bridging the gap between households and trusted home professionals — with security, transparency, and care at the heart of everything we do.
                            </p>
                        </div>
                    </SlideUp>
                </section>

                {/* About Us & Mission Section */}
                <section className="bg-white dark:bg-[#0a0a0f] py-14 sm:py-20 transition-colors duration-300">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                            <SlideUp>
                                <div className="rounded-2xl border border-purple-200/30 dark:border-purple-500/15 bg-gradient-to-br from-white to-purple-50/50 dark:from-[#13131a] dark:to-[#0a0a0f] p-6 sm:p-8 transition-all duration-300 hover:shadow-light-glow-md dark:hover:shadow-glow-sm hover:-translate-y-1">
                                    <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">About Us</h2>
                                    <p className="mt-2 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">A Better Way to Manage Your Home</p>
                                    <p className="mt-3 text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                                        Homebit bridges the gap between households seeking trustworthy househelps and nannies, and professionals seeking reliable jobs. We prioritize security, transparency, and a rigorous vetting process to ensure peace of mind for every family and worker.
                                    </p>
                                </div>
                            </SlideUp>
                            <SlideUp delay={150}>
                                <div className="rounded-2xl border border-purple-200/30 dark:border-purple-500/15 bg-gradient-to-br from-white to-purple-50/50 dark:from-[#13131a] dark:to-[#0a0a0f] p-6 sm:p-8 transition-all duration-300 hover:shadow-light-glow-md dark:hover:shadow-glow-sm hover:-translate-y-1">
                                    <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">Our Mission</h2>
                                    <p className="mt-2 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Connecting Families and Professionals</p>
                                    <p className="mt-3 text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                                        At Homebit, our mission is to connect families with trustworthy, vetted househelps and nannies, making home management simpler, safer, and more reliable for everyone.
                                    </p>
                                </div>
                            </SlideUp>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-14 sm:py-20 px-4 sm:px-6">
                    <div className="max-w-5xl mx-auto">
                        <SlideUp>
                            <div className="text-center mb-10 sm:mb-14">
                                <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                                    Our Values
                                </h2>
                                <p className="mt-2 text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                                    What drives everything we do
                                </p>
                                <p className="mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400">
                                    Our commitment to excellence is guided by these core principles.
                                </p>
                            </div>
                        </SlideUp>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                            {values.map((value, idx) => (
                                <SlideUp key={value.name} delay={idx * 80}>
                                    <div className="group relative rounded-2xl border border-purple-200/30 dark:border-purple-500/15 bg-gradient-to-br from-white to-purple-50/50 dark:from-[#13131a] dark:to-[#0a0a0f] p-5 sm:p-6 transition-all duration-300 hover:shadow-light-glow-md dark:hover:shadow-glow-sm hover:-translate-y-1 text-center">
                                        <div className="flex items-center justify-center mb-4">
                                            <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-md group-hover:scale-110 transition-transform duration-300">
                                                <value.icon className="h-6 w-6 text-white" aria-hidden="true" />
                                            </div>
                                        </div>
                                        <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{value.name}</h3>
                                        <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{value.description}</p>
                                    </div>
                                </SlideUp>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-gradient-to-br from-purple-100 via-white to-purple-200 dark:from-[#0a0a0f] dark:via-[#13131a] dark:to-[#0a0a0f] py-14 sm:py-20 transition-colors duration-300">
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
                        <SlideUp>
                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                                Ready to get started?
                            </h2>
                            <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                                Join thousands of families and professionals who trust HomeBit for their home management needs.
                            </p>
                            <div className="mt-6">
                                <Link
                                    to="/signup"
                                    className="inline-block rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 text-sm sm:text-base font-bold text-white shadow-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300"
                                >
                                    Join HomeBit Today
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
