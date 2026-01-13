import React from "react";
import { useNavigate } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { PurpleCard } from '~/components/ui/PurpleCard';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from "~/contexts/useAuth";

const tiers = [
  {
    name: 'Basic',
    id: 'tier-basic',
    href: '#',
    priceMonthly: '$15',
    description: 'Everything necessary to get started.',
    features: ['5 products', 'Up to 1,000 subscribers', 'Basic analytics', '48-hour support response time'],
  },
  {
    name: 'Essential',
    id: 'tier-essential',
    href: '#',
    priceMonthly: '$30',
    description: 'The perfect plan for small businesses and creators.',
    features: [
      '25 products',
      'Up to 10,000 subscribers',
      'Advanced analytics',
      '24-hour support response time',
      'Marketing automations',
    ],
  },
  {
    name: 'Growth',
    id: 'tier-growth',
    href: '#',
    priceMonthly: '$60',
    description: 'A plan that scales with your rapidly growing business.',
    features: [
      'Unlimited products',
      'Unlimited subscribers',
      'Advanced analytics',
      '1-hour, dedicated support response time',
      'Marketing automations',
      'Custom reporting tools',
    ],
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSelectPlan = React.useCallback(() => {
    if (user) {
      navigate('/checkout');
    } else {
      const redirect = encodeURIComponent('/checkout');
      navigate(`/login?redirect=${redirect}`);
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="gradient" bubbles={true} bubbleDensity="medium" className="flex-1">
      <main className="flex-1 container mx-auto px-4 py-8 min-h-[calc(100vh-200px)]">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl mb-4">Plans and Pricing</h1>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600 dark:text-gray-300">
          Choose an affordable plan that's packed with the best features for engaging your audience, creating customer loyalty, and driving sales.
        </p>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {tiers.map((tier, tierIdx) => (
            <div
              key={tier.id}
              className="flex flex-col justify-between rounded-3xl bg-white/90 dark:bg-[#13131a]/95 p-8 shadow-light-glow-lg dark:shadow-glow-lg backdrop-blur-lg transition-all duration-500 hover:scale-105 hover:shadow-light-glow-lg dark:hover:shadow-glow-lg fade-in-scroll ring-2 ring-primary-200 dark:ring-purple-500/30 sm:p-10">
              <div>
                <h3 id={tier.id} className="text-base font-semibold leading-7 text-slate-900 dark:text-purple-400">
                  {tier.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">Ksh {tier.priceMonthly.replace('$', '').replace('15', '1,500').replace('30', '3,000').replace('60', '6,000')}</span>
<span className="text-base font-semibold leading-7 text-gray-600 dark:text-gray-300">/month</span>
                </div>
                <p className="mt-6 text-base leading-7 text-gray-600 dark:text-gray-300">{tier.description}</p>
                <ul role="list" className="mt-10 space-y-4 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckIcon className="h-6 w-5 flex-none text-slate-900 dark:text-purple-400" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={handleSelectPlan}
                aria-describedby={tier.id}
                className="mt-8 block w-full rounded-md bg-gradient-to-r from-purple-600 to-pink-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
              >
                Select Plan
              </button>
            </div>
          ))}
        </div>
      </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
