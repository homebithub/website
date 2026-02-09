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
            <PurpleThemeWrapper variant="gradient" bubbles={false} bubbleDensity="medium" className="flex-1">
            <main className="flex-1">
                {/* Hero Section */}
                <div className="relative bg-transparent dark:from-[#050508] dark:via-[#0a0a0f] dark:to-purple-950 overflow-hidden transition-colors duration-500">
                    <div className="flex flex-col items-center justify-center w-full px-4 sm:px-6 pt-10 sm:pt-14 pb-12 sm:pb-16 lg:px-8 lg:pt-16 lg:pb-20 relative z-10">
                        <div className="mx-auto max-w-4xl text-center px-2 sm:px-0">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 sm:mb-8 font-sans drop-shadow-lg">
                                About HomeBit
                            </h1>
                            <p className="mt-6 sm:mt-8 text-base sm:text-lg md:text-2xl leading-7 sm:leading-8 md:leading-9 text-gray-700 dark:text-purple-200 font-medium px-2 sm:px-0">
                                Bridging the gap between households and trusted home professionals — with security, transparency, and care at the heart of everything we do.
                            </p>
                        </div>
                    </div>
                </div>

                {/* About Us Section */}
                <div className="relative bg-gradient-to-br from-purple-100 via-white to-purple-200 dark:from-[#0a0a0f] dark:via-[#13131a] dark:to-[#0a0a0f] py-12 sm:py-16 md:py-24 rounded-2xl sm:rounded-3xl mx-4 sm:mx-7 md:mx-14 lg:mx-28 overflow-hidden transition-colors duration-300">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-6xl rounded-2xl sm:rounded-3xl bg-white dark:bg-[#13131a] p-6 sm:p-8 md:p-12 lg:p-16 shadow-light-glow-lg dark:shadow-glow-lg transition-colors duration-300 border-2 border-purple-200/50 dark:border-purple-500/20">
                            <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-2">
                                <div className="lg:pr-8">
                                    <h2 className="text-3xl font-extrabold tracking-tight text-primary-700 dark:text-purple-400">About Us</h2>
                                    <p className="mt-4 font-bold text-2xl sm:text-3xl leading-tight text-gray-900 dark:text-white">A Better Way to Manage Your Home</p>
                                    <p className="mt-4 text-base leading-7 text-gray-700 dark:text-gray-300">
                                        Homebit bridges the gap between households seeking trustworthy househelps and nannies, and professionals seeking reliable jobs. We prioritize security, transparency, and a rigorous vetting process to ensure peace of mind for every family and worker.
                                    </p>
                                </div>
                                <div className="lg:pr-8">
                                    <h2 className="text-3xl font-extrabold tracking-tight text-primary-700 dark:text-purple-400">Our Mission</h2>
                                    <p className="mt-4 font-bold text-2xl sm:text-3xl leading-tight text-gray-900 dark:text-white">Connecting Families and Professionals</p>
                                    <p className="mt-4 text-base leading-7 text-gray-700 dark:text-gray-300">
                                        At Homebit, our mission is to connect families with trustworthy, vetted househelps and nannies, making home management simpler, safer, and more reliable for everyone.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Values Section */}
                <div className="relative bg-gradient-to-br from-purple-200 via-white to-purple-100 dark:from-[#0a0a0f] dark:via-[#13131a] dark:to-[#0a0a0f] py-12 sm:py-16 md:py-20 overflow-hidden transition-colors duration-300">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mx-auto max-w-[1100px] rounded-2xl sm:rounded-3xl bg-white dark:bg-[#13131a] shadow-light-glow-md dark:shadow-glow-md p-6 sm:p-10 md:p-16 lg:p-20 mb-6 sm:mb-8 border-2 border-purple-200/40 dark:border-purple-500/20">
                            <div className="text-center max-w-5xl mx-auto">
                                <h2 className="text-3xl font-extrabold tracking-tight text-primary-700 dark:text-purple-400">Our Values</h2>
                                <p className="mt-4 font-bold text-3xl leading-tight text-gray-900 dark:text-white sm:text-4xl">What drives everything we do</p>
                                <p className="mt-2 text-base leading-7 text-gray-700 dark:text-gray-300">Our commitment to excellence is guided by these core principles.</p>
                            </div>
                            <div className="mt-12 sm:mt-16 max-w-7xl mx-auto">
                                <div className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4">
                                    {values.map((value) => (
                                        <div key={value.name} className="relative flex flex-col items-center text-center rounded-xl sm:rounded-2xl border-2 border-primary-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] p-6 sm:p-8 shadow-light-glow-sm dark:shadow-glow-sm transition-transform duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-light-glow-md dark:hover:shadow-glow-md">
                                            <div className="relative inline-flex items-center justify-center p-[2px] rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 shadow-lg shadow-purple-500/40">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-[#050510]">
                                                    <value.icon className="h-8 w-8 text-purple-600 dark:text-purple-200" aria-hidden="true" />
                                                </div>
                                            </div>
                                            <h3 className="mt-4 text-lg sm:text-xl font-bold leading-6 sm:leading-7 tracking-tight text-primary-700 dark:text-purple-400">{value.name}</h3>
                                            <p className="mt-3 text-base sm:text-lg leading-6 sm:leading-7 text-gray-600 dark:text-gray-300">{value.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="relative bg-gradient-to-br from-purple-100/60 via-purple-200/40 to-pink-100/60 dark:from-[#0a0a0f] dark:via-[#13131a] dark:to-[#0a0a0f] py-12 sm:py-16 md:py-24 overflow-hidden transition-colors duration-300">
                    <div className="mx-auto max-w-4xl text-center px-6">
                        <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl leading-tight text-gray-900 dark:text-white">Ready to get started?</h2>
                        <p className="mt-4 text-base leading-7 text-gray-700 dark:text-gray-300">Join thousands of families and professionals who trust HomeBit for their home management needs.</p>
                        <div className="mt-8 sm:mt-10 flex items-center justify-center">
                            <Link
                                to="/signup"
                                className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 sm:px-10 py-1.5 sm:py-1 text-lg sm:text-2xl font-bold text-white shadow-lg hover:from-purple-700 hover:to-pink-700 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transform hover:scale-110 transition-all duration-300"
                            >
                                Join HomeBit Today
                            </Link>
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
