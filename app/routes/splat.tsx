import { Link } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { PurpleCard } from '~/components/ui/PurpleCard';
import { HomeIcon, ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="gradient" bubbles={true} bubbleDensity="medium" className="flex-1">
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <PurpleCard hover={false} glow={true} className="w-full max-w-2xl p-12 text-center">
            {/* 404 Number */}
            <div className="mb-8">
              <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 animate-pulse">
                404
              </h1>
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <MagnifyingGlassIcon className="h-24 w-24 text-purple-400 animate-bounce" />
                <div className="absolute -top-2 -right-2 h-8 w-8 bg-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">?</span>
                </div>
              </div>
            </div>

            {/* Message */}
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              The page you're looking for seems to have wandered off. Don't worry, even the best explorers get lost sometimes!
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/"
                className="inline-flex items-center px-6 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <HomeIcon className="h-5 w-5 mr-2" />
                Go Home
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center px-6 py-1.5 bg-white dark:bg-[#13131a] text-purple-600 dark:text-purple-400 font-semibold rounded-xl border-2 border-purple-600 dark:border-purple-500/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 shadow-md dark:shadow-glow-sm hover:shadow-lg dark:hover:shadow-glow-md hover:scale-105"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Go Back
              </button>
            </div>

            {/* Helpful Links */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-purple-500/20">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Looking for something specific?</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/about" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium text-sm hover:underline">
                  About Us
                </Link>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <Link to="/services" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium text-sm hover:underline">
                  Services
                </Link>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <Link to="/contact" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium text-sm hover:underline">
                  Contact
                </Link>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <Link to="/login" className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium text-sm hover:underline">
                  Login
                </Link>
              </div>
            </div>
          </PurpleCard>
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}

// Add action handler to prevent "no action" errors from external requests
export async function action() {
  // Return 405 Method Not Allowed for unsupported actions
  return new Response("Method Not Allowed", { status: 405 });
}

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
