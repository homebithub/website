import React from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { Link } from "@remix-run/react";
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
        <div className="min-h-screen bg-gray-50 font-sans">
            <Navigation />
            <main>
                {/* About Us and Mission Section */}
                <div className="relative isolate overflow-hidden bg-white py-24 sm:py-32">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
                            <div className="lg:pr-8 lg:pt-4">
                                <div className="lg:max-w-lg">
                                    <h2 className="inline-block rounded-full bg-gray-100 px-4 py-2 text-primary-600 font-bold text-lg">About Us</h2>
                                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">A Better Way to Manage Your Home</p>
                                    <p className="mt-6 text-lg leading-8 text-gray-600">
                                        HomeXpert bridges the gap between households seeking trustworthy househelps and nannies, and professionals seeking reliable jobs. We prioritize security, transparency, and a rigorous vetting process to ensure peace of mind for every family and worker.
                                    </p>
                                </div>
                            </div>
                            <div className="lg:pr-8 lg:pt-4">
                                <div className="lg:max-w-lg">
                                    <h2 className="inline-block rounded-full bg-gray-100 px-4 py-2 text-primary-600 font-bold text-lg">Our Mission</h2>
                                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Connecting Families and Professionals</p>
                                    <p className="mt-6 text-lg leading-8 text-gray-600">
                                        At HomeXpert, our mission is to connect families with trustworthy, vetted househelps and nannies, making home management simpler, safer, and more reliable for everyone.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Values section */}
                <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-40 lg:px-8 mb-20">
                    <div className="mx-auto max-w-2xl lg:mx-0">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Our Values
                        </h2>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            Our commitment to excellence is guided by these core principles.
                        </p>
                    </div>
                    <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 text-base leading-7 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4 lg:gap-8">
                        {values.map((value) => (
                            <div key={value.name} className="relative flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gray-100 mb-6">
                                    <value.icon className="h-6 w-6 text-slate-900" aria-hidden="true" />
                                </div>
                                <dt className="text-lg font-semibold text-gray-900">{value.name}</dt>
                                <dd className="mt-2 text-base leading-7 text-gray-600">{value.description}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </main>
            <Footer />
        </div>
    );
}