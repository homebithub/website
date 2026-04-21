import React from "react";
import { Link, useNavigate } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { CreditCardIcon } from "@heroicons/react/24/outline";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const handleGoBack = () => {
    if (
      typeof window !== "undefined" &&
      window.history.length > 1 &&
      document.referrer.startsWith(window.location.origin)
    ) {
      navigate(-1);
      return;
    }

    navigate("/pricing", { replace: true });
  };

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

              <h1 className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent mb-3">
                Continue on Pricing
              </h1>

              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200 max-w-xl mx-auto mb-6">
                Subscription selection and payment now happen from the pricing page.
                Pick your plan there and we&apos;ll continue the purchase flow with the latest account-aware pricing data.
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-10">
                If you landed here from an older link, nothing is broken. We&apos;ll route you to the current purchase entry point instead.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="inline-flex items-center justify-center px-6 py-1 rounded-xl border border-purple-200/70 dark:border-purple-500/60 text-xs font-semibold text-purple-700 dark:text-purple-100 bg-white dark:bg-black hover:bg-purple-50 dark:hover:bg-purple-900/40 shadow-sm transition-colors"
                >
                  Go Back
                </button>

                <Link
                  to="/pricing"
                  prefetch="intent"
                  className="inline-flex items-center justify-center px-6 py-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-xs font-semibold text-white shadow-lg hover:from-purple-700 hover:to-pink-700 hover:shadow-purple-500/40 transition-all"
                >
                  View Plans
                </Link>
              </div>

              <div className="mt-10 text-[11px] uppercase tracking-[0.25em] text-gray-500 dark:text-gray-500">
                Pricing handles checkout
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
