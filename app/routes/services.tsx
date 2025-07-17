import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { Link } from "@remix-run/react";
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
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="relative isolate overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Our Services
            </h2>
            <p className="mt-6 text-lg font-semibold leading-8 text-slate-700">
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
      className="relative flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <h3 className="text-lg font-semibold leading-7 tracking-tight text-gray-900">
        {service.name}
      </h3>
      {showBadge && (
        <span className="mt-2 inline-block rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-slate-900 self-start">
          Coming soon
        </span>
      )}
      <p className="mt-4 text-base leading-7 text-gray-600">
        {service.description}
      </p>
    </div>
  );
})}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Ready to get started?
          </h2>
          <div className="mt-10 flex items-center gap-x-6">
            <Link
              to="/signup"
              className="rounded-md bg-purple-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}