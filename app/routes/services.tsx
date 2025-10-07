import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { Link } from "react-router";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { PurpleCard } from '~/components/ui/PurpleCard';
import {
  WrenchScrewdriverIcon,
  PaintBrushIcon,
  HomeIcon,
  ShieldCheckIcon,
  BoltIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";


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
      <PurpleThemeWrapper variant="gradient" bubbles={true} bubbleDensity="medium">
      
      <div className="relative isolate overflow-hidden">
  {/* Floating SVG shapes for playful effect */}
  <svg className="absolute top-0 left-0 w-48 h-48 opacity-20 animate-float" viewBox="0 0 200 200"><circle cx="100" cy="100" r="100" fill="#c084fc" /></svg>
  <svg className="absolute bottom-0 right-0 w-64 h-64 opacity-10 animate-float delay-1000" viewBox="0 0 200 200"><rect width="200" height="200" rx="70" fill="#a855f7" /></svg>
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
              Our Services
            </h2>
            <p className="mt-6 text-lg font-semibold leading-8 text-slate-700 dark:text-gray-300">
              We offer a wide range of professional home services to keep your home
              in perfect condition. Our expert technicians are here to help with
              all your home maintenance and repair needs.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {services.map((service) => {
  const showBadge = !["House Helps", "Child Care (Nannies)"].includes(service.name);
  return (
    <div
      key={service.name}
      className="relative flex flex-col rounded-2xl border border-gray-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] p-8 shadow-sm dark:shadow-glow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-glow-md"
    >
      <h3 className="text-lg font-semibold leading-7 tracking-tight text-gray-900 dark:text-white">
        {service.name}
      </h3>
      {showBadge && (
        <span className="mt-2 inline-block rounded-full bg-gray-100 dark:bg-purple-900/30 px-2 py-1 text-xs font-semibold text-primary-600 dark:text-purple-400 self-start">
          Coming soon
        </span>
      )}
      <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-300">
        {service.description}
      </p>
    </div>
  );
})}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-slate-50 dark:bg-[#0a0a0f] transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Ready to get started?
          </h2>
          <div className="mt-10 flex items-center gap-x-6">
            <Link
              to="/signup"
              className="glow-button rounded-md bg-purple-600 dark:bg-gradient-to-r dark:from-purple-600 dark:to-pink-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm dark:shadow-glow-sm hover:bg-purple-700 dark:hover:shadow-glow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transition-all duration-200"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}
// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
