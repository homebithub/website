import React from "react";
import { useNavigate } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { useAuth } from "~/contexts/useAuth";

const PLAN_OPTIONS = [
  {
    id: 'monthly',
    duration: 'Monthly',
    priceLabel: 'Ksh 1,500',
    price: 1500,
  },
  {
    id: 'six-months',
    duration: '6 months',
    priceLabel: 'Ksh 6,000',
    price: 6000,
  },
  {
    id: 'yearly',
    duration: '12 months',
    priceLabel: 'Ksh 9,600',
    price: 9600,
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
      <main className="flex-1 container mx-auto px-4 py-8 min-h-[calc(100vh-200px)] flex flex-col items-center justify-center">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl mb-4">Plans and Pricing</h1>
          <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Simple, transparent pricing. Save more when you subscribe for longer periods.
          </p>
        </div>

        <div className="mt-12 w-full max-w-3xl">
          <div className="overflow-hidden rounded-3xl bg-white/90 dark:bg-[#13131a]/95 shadow-light-glow-lg dark:shadow-glow-lg border border-purple-100 dark:border-purple-500/30 backdrop-blur-lg">
            <table className="min-w-full divide-y divide-purple-100 dark:divide-purple-500/30">
              <thead className="bg-purple-50/80 dark:bg-[#181826]">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Duration
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100 dark:divide-purple-500/30">
                {PLAN_OPTIONS.map((plan) => (
                  <tr key={plan.id} className="hover:bg-purple-50/60 dark:hover:bg-[#1f1f2d] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-base font-semibold text-gray-900 dark:text-white">
                      {plan.priceLabel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {plan.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={handleSelectPlan}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-xs sm:text-sm font-semibold text-white shadow-md hover:from-purple-700 hover:to-pink-700 hover:shadow-purple-500/40 transition-all"
                      >
                        Select Plan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
