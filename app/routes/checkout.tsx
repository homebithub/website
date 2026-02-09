import React from "react";
import { Link, useNavigate } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { CreditCardIcon } from "@heroicons/react/24/outline";

export default function CheckoutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper
        variant="gradient"
        bubbles={false}
        bubbleDensity="medium"
        className="flex-1 flex items-center justify-center px-4 py-12"
      >
        <main className="w-full max-w-3xl mx-auto flex-1 flex items-center justify-center">
          <div className="relative w-full">
            {/* Glowing background */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-3xl blur-3xl opacity-40 dark:opacity-60 animate-pulse" />

            {/* Card */}
            <div className="relative rounded-3xl bg-white dark:bg-[#050510] border border-purple-200/70 dark:border-purple-500/40 shadow-xl shadow-purple-500/20 dark:shadow-[0_0_40px_rgba(168,85,247,0.6)] px-6 sm:px-10 py-10 sm:py-12 flex flex-col items-center text-center overflow-hidden">
              <div className="mb-6 flex items-center justify-center">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 flex items-center justify-center animate-bounce">
                  <CreditCardIcon className="h-9 w-9 text-white" />
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent mb-3">
                Checkout is Coming Soon
              </h1>

              <p className="text-base sm:text-lg text-gray-700 dark:text-gray-200 max-w-xl mx-auto mb-6">
                We&apos;re putting the final touches on a seamless, secure subscription checkout experience.
                Soon you&apos;ll be able to pick a plan and complete your payment right here.
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-10">
                This feature is currently under active development. In the meantime, you can continue exploring
                HomeBit or manage your profile and shortlist as usual.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center justify-center px-6 py-1 rounded-xl border border-purple-200/70 dark:border-purple-500/60 text-sm font-semibold text-purple-700 dark:text-purple-100 bg-white dark:bg-black hover:bg-purple-50 dark:hover:bg-purple-900/40 shadow-sm transition-colors"
                >
                  Go Back
                </button>

                <Link
                  to="/"
                  prefetch="intent"
                  className="inline-flex items-center justify-center px-6 py-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-sm font-semibold text-white shadow-lg hover:from-purple-700 hover:to-pink-700 hover:shadow-purple-500/40 transition-all"
                >
                  Back to Home
                </Link>
              </div>

              <div className="mt-10 text-[11px] uppercase tracking-[0.25em] text-gray-500 dark:text-gray-500">
                Feature under development
              </div>
            </div>
          </div>
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}

export { ErrorBoundary } from "~/components/ErrorBoundary";
