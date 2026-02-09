import React from "react";
import { useNavigate } from "react-router";

interface OnboardingTipsBannerProps {
  onDismiss?: () => void;
  role?: 'household' | 'househelp';
}

/**
 * Simple onboarding tips banner controlled by `show_onboarding` preference.
 * Shown on main dashboards to help new users discover key actions.
 */
export default function OnboardingTipsBanner({ onDismiss, role = 'household' }: OnboardingTipsBannerProps) {
  const navigate = useNavigate();

  const profilePath = role === 'househelp' ? '/househelp/profile' : '/household/profile';
  const shortlistPath = role === 'househelp' ? '/shortlist' : '/household/shortlist';
  const titleText = role === 'househelp' ? 'Get started as a househelp' : 'Get started with Homebit';

  return (
    <div className="mb-4 rounded-2xl border border-purple-200 dark:border-purple-500/40 bg-gradient-to-r from-purple-50 via-white to-pink-50 dark:from-purple-950/40 dark:via-[#13131a] dark:to-pink-950/30 p-4 sm:p-5 shadow-md dark:shadow-glow-sm text-left">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-2xl">
          <span role="img" aria-label="lightbulb">💡</span>
        </div>
        <div className="flex-1 space-y-1 text-sm sm:text-base">
          <div className="font-semibold text-purple-800 dark:text-purple-200">{titleText}</div>
          <p className="text-gray-700 dark:text-gray-200">
            Here are a few quick tips to help you find the right match faster:
          </p>
          <ul className="list-disc pl-5 text-gray-700 dark:text-gray-200 space-y-0.5 text-sm">
            <li>Complete your household or househelp profile so searches can match you better.</li>
            <li>Use the shortlist to save favourites and compare options later.</li>
            <li>Start a conversation from profiles to discuss details and expectations.</li>
          </ul>
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs sm:text-sm font-semibold shadow hover:from-purple-700 hover:to-pink-700 hover:scale-[1.02] transition-all"
              onClick={() => navigate(profilePath, { replace: false })}
            >
              Go to my profile
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-500/60 text-xs sm:text-sm text-purple-700 dark:text-purple-200 bg-white dark:bg-[#13131a] hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
              onClick={() => navigate(shortlistPath, { replace: false })}
            >
              View my shortlist
            </button>
          </div>
        </div>
        {onDismiss && (
          <button
            type="button"
            className="ml-2 text-xs text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={onDismiss}
          >
            Hide
          </button>
        )}
      </div>
    </div>
  );
}
