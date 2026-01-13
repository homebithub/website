import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { Link } from "react-router";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { PurpleCard } from "~/components/ui/PurpleCard";
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
        <div className="relative isolate overflow-hidden bg-transparent dark:from-[#050508] dark:via-[#0a0a0f] dark:to-purple-950 transition-colors duration-500">
          {/* Floating SVG shapes for playful effect */}
          <svg
            className="absolute top-0 left-0 w-48 h-48 opacity-30 dark:opacity-20 animate-float"
            viewBox="0 0 200 200"
          >
            <circle cx="100" cy="100" r="100" fill="#ec4899" />
          </svg>
          <svg
            className="absolute bottom-0 right-0 w-64 h-64 opacity-20 dark:opacity-10 animate-float delay-1000"
            viewBox="0 0 200 200"
          >
            <rect width="200" height="200" rx="70" fill="#a855f7" />
          </svg>
          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl lg:mx-0">
              <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl drop-shadow-lg">
                Our Services
              </h2>
              <p className="mt-6 text-lg font-semibold leading-8 text-gray-700 dark:text-purple-200">
                Homebit connects households with trusted professionals for help at home, and gives service
                providers a simple way to reach the families who need their help &mdash; all through one smart,
                reliable platform.
              </p>
            </div>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-purple-100/60 via-purple-200/40 to-pink-100/60 dark:from-[#0a0a0f] dark:via-[#13131a] dark:to-[#0a0a0f] py-12 sm:py-16 md:py-24 transition-colors duration-300">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              {services.map((service) => {
                const showBadge = !["House Helps", "Child Care (Nannies)"].includes(service.name);
                return (
                  <div
                    key={service.name}
                    className="relative flex flex-col rounded-2xl border-2 border-primary-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] p-8 shadow-light-glow-sm dark:shadow-glow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-light-glow-md dark:hover:shadow-glow-md"
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
        </div>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";

