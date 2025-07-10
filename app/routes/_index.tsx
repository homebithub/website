import { Navigation } from "~/components/Navigation";
import { Link } from "@remix-run/react";
import {
  HomeIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    name: "Expert Home Services",
    description: "Professional and reliable home maintenance and repair services.",
    icon: HomeIcon,
  },
  {
    name: "Skilled Technicians",
    description: "Our team consists of certified and experienced professionals.",
    icon: WrenchScrewdriverIcon,
  },
  {
    name: "Customer Support",
    description: "24/7 customer support to assist you with any queries.",
    icon: UserGroupIcon,
  },
  {
    name: "Secure Payments",
    description: "Safe and secure payment processing for all services.",
    icon: ShieldCheckIcon,
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navigation />
      
      {/* Hero section */}
      <div className="relative isolate overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl dark:text-primary-400">
              Your Home, Our Expertise
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-gray-300">
              Professional home services at your fingertips. From maintenance to repairs,
              we've got you covered with our expert team of technicians.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link
                to="/services"
                className="btn-primary"
              >
                Our Services
              </Link>
              <Link
                to="/contact"
                className="text-sm font-semibold leading-6 text-slate-900 dark:text-primary-300"
              >
                Contact Us <span aria-hidden="true">→</span>
              </Link>
            </div>

            {/* Landing page illustrations */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-14 justify-items-center">
              {/* Dishwashing Service */}
              <div className="flex flex-col items-center max-w-md">
                <img
                  src="/washing_dishes.jpg"
                  alt="Professional dishwashing service"
                  className="w-80 sm:w-96 md:w-[28rem] lg:w-[32rem] rounded-2xl shadow-2xl transform scale-110 hover:scale-120 transition-transform"
                />
                <p className="mt-2 text-center text-sm font-medium text-slate-700 dark:text-gray-300">
                  Spotless dishes handled by pros.
                </p>
              </div>

              {/* Nanny Service */}
              <div className="md:-translate-y-6 flex flex-col items-center max-w-md">
                <img
                  src="/nanny.png"
                  alt="Experienced nanny caring for child"
                  className="w-80 sm:w-96 md:w-[28rem] lg:w-[32rem] rounded-2xl shadow-2xl transform scale-110 hover:scale-120 transition-transform"
                />
                <p className="mt-2 text-center text-sm font-medium text-slate-700 dark:text-gray-300">
                  Caring nannies for your little ones.
                </p>
              </div>

              {/* Home Cleaning Service */}
              <div className="md:translate-y-3 flex flex-col items-center max-w-md">
                <img
                  src="/cleaning_house.png"
                  alt="Cleaning professional tidying a living room"
                  className="w-80 sm:w-96 md:w-[28rem] lg:w-[32rem] rounded-2xl shadow-2xl transform scale-110 hover:scale-120 transition-transform"
                />
                <p className="mt-2 text-center text-sm font-medium text-slate-700 dark:text-gray-300">
                  Thorough home cleaning made easy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary-600">
            Why Choose Us
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Everything you need for your home
          </p>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            We provide comprehensive home services with a focus on quality, reliability,
            and customer satisfaction.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-slate-900">
                  <feature.icon
                    className="h-5 w-5 flex-none text-primary-600"
                    aria-hidden="true"
                  />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
} 