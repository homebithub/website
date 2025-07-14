import { Navigation } from "~/components/Navigation";
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
    name: "Home Maintenance",
    description: "Regular maintenance services to keep your home in top condition.",
    icon: WrenchScrewdriverIcon,
    href: "/services/maintenance",
  },
  {
    name: "Painting & Decorating",
    description: "Professional painting and decorating services for your home.",
    icon: PaintBrushIcon,
    href: "/services/painting",
  },
  {
    name: "Home Repairs",
    description: "Expert repair services for all your home needs.",
    icon: HomeIcon,
    href: "/services/repairs",
  },
  {
    name: "Security Systems",
    description: "Installation and maintenance of home security systems.",
    icon: ShieldCheckIcon,
    href: "/services/security",
  },
  {
    name: "Electrical Services",
    description: "Professional electrical services and installations.",
    icon: BoltIcon,
    href: "/services/electrical",
  },
  {
    name: "Plumbing Services",
    description: "Expert plumbing services for your home.",
    icon: HeartIcon,
    href: "/services/plumbing",
  },
];

export default function Services() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navigation />
      
      <div className="relative isolate overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-primary-200 sm:text-6xl">
              Our Services
            </h2>
            <p className="mt-6 text-lg font-semibold leading-8 text-slate-700 dark:text-gray-200">
              We offer a wide range of professional home services to keep your home
              in perfect condition. Our expert technicians are here to help with
              all your home maintenance and repair needs.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.name}
              className="rounded-2xl shadow-lg p-6 bg-gradient-to-br from-primary-100 via-white to-primary-50 dark:from-primary-900 dark:via-slate-900 dark:to-primary-800 border border-primary-200 dark:border-primary-700 flex flex-col gap-2"
            >
              <h3 className="text-lg font-semibold leading-7 tracking-tight text-slate-900 dark:text-primary-300">
                {service.name}
              </h3>
              <p className="text-base leading-7 text-slate-700 dark:text-gray-200">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-slate-50 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-primary-600 sm:text-4xl dark:text-primary-200">
            Ready to get started?
            <br />
            Book a service today.
          </h2>
          <div className="mt-10 flex items-center gap-x-6">
            <Link
              to="/contact"
              className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-primary-600 shadow-sm hover:bg-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white dark:bg-slate-900 dark:text-primary-200 dark:hover:bg-slate-800"
            >
              Contact Us
            </Link>
            <Link
              to="/about"
              className="text-sm font-semibold leading-6 text-primary-600 dark:text-primary-100"
            >
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}