import React from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { AnimatedStatCard } from "~/components/AnimatedStatCard";
import { Link } from "@remix-run/react";
import {
  CheckCircleIcon,
  UserGroupIcon,
  HeartIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

interface Feature {
  name: string;
  value: string;
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

const features: Feature[] = [
  { name: "Active Users", value: "10,000+" },
  { name: "Service Providers", value: "500+" },
  { name: "Cities", value: "25+" },
  { name: "Customer Satisfaction", value: "98%" },
];

const values: Value[] = [
  {
    name: "Quality",
    description: "We maintain high standards in every service we provide.",
    icon: (props) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        {...props}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
        />
      </svg>
    ),
  },
  {
    name: "Reliability",
    description: "We deliver on our promises, every time.",
    icon: (props) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        {...props}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    ),
  },
  {
    name: "Trust",
    description: "We build lasting relationships through transparency and integrity.",
    icon: (props) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        {...props}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    ),
  },
  {
    name: "Innovation",
    description: "We continuously improve and adapt to serve you better.",
    icon: (props) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        {...props}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
        />
      </svg>
    ),
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
    <div className="min-h-screen bg-white dark:bg-slate-900 font-sans">
      <Navigation />
      <main>
        {/* Hero section */}
        <div className="relative isolate overflow-hidden py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
              <h2 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-primary-400 text-center mb-6">
                About HomeXpert
              </h2>
              <p className="mx-auto max-w-3xl text-xl text-slate-700 dark:text-slate-300 text-center">
                HomeXpert bridges the gap between households seeking trustworthy househelps and nannies, and professionals seeking reliable jobs. We prioritize security, transparency, and a rigorous vetting process to ensure peace of mind for every family and worker.
              </p>
            </div>
          </div>
        </div>

        {/* Mission section */}
        <div className="mx-auto mt-12 max-w-7xl px-6 sm:mt-16 lg:px-8">
  <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-4">
  <h2 className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-primary-400 text-center mb-6">
    Our Mission
  </h2>
  <p className="mx-auto max-w-3xl text-xl text-slate-700 dark:text-slate-300 text-center">
    At HomeXpert, our mission is to connect families with trustworthy, vetted househelps and nannies, making home management simpler, safer, and more reliable for everyone.
  </p>
</div>
  <dl className="mx-auto mt-6 grid max-w-2xl grid-cols-1 gap-8 text-base leading-7 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:gap-x-16">
    {features.map((feature, idx) => (
      <AnimatedStatCard key={feature.name} name={feature.name} value={feature.value} />
    ))}
  </dl>


        </div>

        {/* Values section */}
        <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-40 lg:px-8 mb-20">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Our Values
            </p>
          </div>
          <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 text-base leading-7 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:gap-x-16">
  {values.map((value) => (
    <div key={value.name} className="flex flex-col items-center text-center p-6 rounded-xl bg-slate-50 dark:bg-slate-800 shadow-md">
      <div className="flex items-center justify-center mb-4">
        <value.icon className="h-16 w-16 text-primary-400 dark:text-primary-300" aria-hidden="true" />
      </div>
      <dt className="text-lg font-semibold leading-7 text-slate-900 dark:text-primary-100 mb-2">{value.name}</dt>
      <dd className="text-base leading-7 text-slate-600 dark:text-slate-300">{value.description}</dd>
    </div>
  ))}
</dl>
        </div>


      </main>
      <Footer />
    </div>
  );
}