import { ArrowRight, CircleAlert } from "lucide-react";

interface ProfileCompletionBannerProps {
  title: string;
  description: string;
  ctaLabel: string;
  completedItems: number;
  totalItems: number;
  progressValue: number;
  onContinue: () => void;
}

export function ProfileCompletionBanner({
  title,
  description,
  ctaLabel,
  completedItems,
  totalItems,
  progressValue,
  onContinue,
}: ProfileCompletionBannerProps) {
  return (
    <section
      className="mb-5 rounded-2xl border border-amber-300/60 bg-amber-50/90 px-4 py-3 text-amber-950 shadow-sm dark:border-amber-400/25 dark:bg-amber-500/10 dark:text-amber-50"
      aria-labelledby="profile-completion-banner-title"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200">
              <CircleAlert className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <h2 id="profile-completion-banner-title" className="text-sm font-semibold text-amber-950 dark:text-white">
                  {title}
                </h2>
                <span className="text-[11px] font-medium text-amber-800 dark:text-amber-100">
                  {completedItems} of {totalItems} complete
                </span>
              </div>
              <p className="mt-0.5 hidden truncate text-xs text-amber-900/80 dark:text-amber-50/80 lg:block">{description}</p>
            </div>
          </div>

          <div className="mt-2 pl-12">
            <div
              className="h-1.5 w-full max-w-xl overflow-hidden rounded-full bg-amber-200/80 dark:bg-white/10"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                style={{ width: `${Math.max(progressValue, 6)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center pl-12 sm:pl-0">
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-amber-50 dark:focus-visible:ring-offset-[#16111f]"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
