import React from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { Link } from "react-router";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { PurpleCard } from '~/components/ui/PurpleCard';
import {
  CheckBadgeIcon,
  HeartIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

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
            <PurpleThemeWrapper variant="gradient" bubbles={true} bubbleDensity="medium">
            <main className="flex-1">
                {/* Page header */}
                <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-10">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                        About Us and Mission
                    </h1>
                </div>

                {/* About Us and Mission Section */}
                <div className="relative isolate overflow-hidden bg-white/90 dark:bg-[#13131a]/95 backdrop-blur-lg py-16 sm:py-24 rounded-3xl shadow-light-glow-md dark:shadow-glow-md mx-3 sm:mx-8 mt-10 fade-in-scroll transition-colors duration-300 border-2 border-purple-200/40 dark:border-purple-500/20">
  {/* Floating SVG shapes for playful effect */}
  <svg className="absolute top-0 left-0 w-48 h-48 opacity-20 animate-float" viewBox="0 0 200 200"><circle cx="100" cy="100" r="100" fill="#c084fc" /></svg>
  <svg className="absolute bottom-0 right-0 w-64 h-64 opacity-10 animate-float delay-1000" viewBox="0 0 200 200"><rect width="200" height="200" rx="70" fill="#a855f7" /></svg>
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
                            <div className="lg:pr-8 lg:pt-4">
                                <div className="lg:max-w-lg">
                                    <h2 className="inline-block rounded-full bg-gray-100 px-4 py-2 text-primary-600 font-bold text-lg">About Us</h2>
                                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">A Better Way to Manage Your Home</p>
                                    <p className="mt-6 text-lg leading-8 text-gray-700 dark:text-gray-100">
                                        Homebit bridges the gap between households seeking trustworthy househelps and nannies, and professionals seeking reliable jobs. We prioritize security, transparency, and a rigorous vetting process to ensure peace of mind for every family and worker.
                                    </p>
                                </div>
                            </div>
                            <div className="lg:pr-8 lg:pt-4">
                                <div className="lg:max-w-lg">
                                    <h2 className="inline-block rounded-full bg-gray-100 px-4 py-2 text-primary-600 font-bold text-lg">Our Mission</h2>
                                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Connecting Families and Professionals</p>
                                    <p className="mt-6 text-lg leading-8 text-gray-700 dark:text-gray-100">
                                        At Homebit, our mission is to connect families with trustworthy, vetted househelps and nannies, making home management simpler, safer, and more reliable for everyone.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Values section */}
                <div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-20 lg:px-8 mb-20">
                    <div className="mx-auto max-w-2xl lg:mx-0">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                            Our Values
                        </h2>
                        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                            Our commitment to excellence is guided by these core principles.
                        </p>
                    </div>
                    <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 text-base leading-7 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4 lg:gap-8">
                        {values.map((value) => (
                            <div key={value.name} className="relative flex flex-col rounded-2xl border-2 border-primary-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] p-8 shadow-light-glow-sm dark:shadow-glow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-light-glow-md dark:hover:shadow-glow-md">
                                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-purple-100 via-pink-100 to-purple-200 dark:bg-purple-900/30 mb-6">
                                    <value.icon className="h-6 w-6 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                                </div>
                                <dt className="text-lg font-semibold text-gray-900 dark:text-white">{value.name}</dt>
                                <dd className="mt-2 text-base leading-7 text-gray-600 dark:text-gray-300">{value.description}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </main>
            </PurpleThemeWrapper>
            <Footer />
        </div>
    );
}
// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
