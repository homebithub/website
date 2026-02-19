import React from "react";
import { useNavigate } from "react-router";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { PurpleCard } from "~/components/ui/PurpleCard";

export default function HouseholdChoicePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <PurpleThemeWrapper variant="gradient" bubbles={false} bubbleDensity="low" className="flex-1">
        <main className="flex-1 flex flex-col justify-center items-center px-4 py-12">
          <PurpleCard hover={false} glow={true} className="w-full max-w-lg p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-pink-400">
                Welcome to Homebit! 🏠
              </h1>
              <p className="mt-3 text-gray-600 dark:text-gray-400 text-base">
                How would you like to get started?
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {/* Option 1: Join existing household */}
              <button
                type="button"
                onClick={() => navigate("/join-household")}
                className="group relative w-full p-5 border-2 rounded-2xl text-left transition-all duration-300 transform hover:scale-[1.02] border-gray-300 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-gradient-to-br hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 hover:shadow-md dark:hover:shadow-glow-sm bg-gray-50/50 dark:bg-gray-800/30"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-2xl">
                    🔑
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      I have a joining code
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      My partner shared a household code with me and I'd like to join their household
                    </p>
                  </div>
                  <div className="flex-shrink-0 self-center text-gray-400 dark:text-gray-500 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Option 2: Create new household */}
              <button
                type="button"
                onClick={() => navigate("/profile-setup/household?step=1")}
                className="group relative w-full p-5 border-2 rounded-2xl text-left transition-all duration-300 transform hover:scale-[1.02] border-gray-300 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-gradient-to-br hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 hover:shadow-md dark:hover:shadow-glow-sm bg-gray-50/50 dark:bg-gray-800/30"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/40 text-2xl">
                    ✨
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      Create a new household
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      I want to set up a new household profile and start looking for help
                    </p>
                  </div>
                  <div className="flex-shrink-0 self-center text-gray-400 dark:text-gray-500 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              </button>
            </div>

            {/* Info */}
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-xl">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <span className="font-semibold">Tip:</span> If your partner already has a Homebit account, ask them for the household joining code from their profile settings. This lets you both manage the same household together.
              </p>
            </div>
          </PurpleCard>
        </main>
      </PurpleThemeWrapper>
    </div>
  );
}

export { ErrorBoundary } from "~/components/ErrorBoundary";
