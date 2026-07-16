import { ArrowRight, CircleAlert } from "lucide-react";

interface ProfileCompletionBannerProps {
  title: string;
  description: string;
  ctaLabel: string;
  completedSteps: number;
  totalSteps: number;
  nextStep: number;
  progressValue: number;
  onContinue: () => void;
}

export function ProfileCompletionBanner({
  title,
  description,
  ctaLabel,
  completedSteps,
  totalSteps,
  nextStep,
  progressValue,
  onContinue,
}: ProfileCompletionBannerProps) {
  return (
    <section
      className="mb-6 rounded-2xl border border-amber-300/70 bg-amber-50/95 px-5 py-4 text-amber-950 shadow-sm dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-50"
      aria-labelledby="profile-completion-banner-title"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200">
              <CircleAlert className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-200">
                Profile setup incomplete
              </p>
              <h2 id="profile-completion-banner-title" className="mt-1 text-base font-semibold text-amber-950 dark:text-white">
                {title}
              </h2>
              <p className="mt-1 text-sm leading-6 text-amber-900/90 dark:text-amber-50/90">{description}</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex flex-wrap items-center gap-3 text-xs font-medium text-amber-800 dark:text-amber-100">
              <span>{completedSteps} of {totalSteps} steps completed</span>
              <span>Next step: {nextStep} of {totalSteps}</span>
            </div>
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-amber-200/80 dark:bg-white/10"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                style={{ width: `${Math.max(progressValue, 6)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-50 dark:focus-visible:ring-offset-[#16111f]"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
