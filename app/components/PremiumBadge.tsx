import { useId, useState } from "react";

/**
 * The premium mark, for someone with an active subscription.
 *
 * Deliberately a different shape and colour from the verified tick. They answer
 * different questions — one is "has this person been identity-checked", the
 * other is "is this person on a paid plan" — and two gold-ish ticks side by side
 * would blur into a single vague impression of trustworthiness. Verification is
 * the one that says anything about who a person is; a subscription says only
 * that they pay for the product, and it should not be able to borrow the other's
 * meaning.
 *
 * A trial counts. Someone on a trial has the same access and the same features,
 * so calling them anything else would be a distinction that only matters to our
 * billing system.
 */
export function PremiumBadge({
  size = "md",
  showLabel = false,
  /** True while a trial is what is granting access, for the tooltip wording. */
  isTrial = false,
  className = "",
}: {
  size?: "sm" | "md";
  showLabel?: boolean;
  isTrial?: boolean;
  className?: string;
}) {
  const gradientId = useId();
  const tooltipId = useId();
  const [open, setOpen] = useState(false);

  const dimension = size === "sm" ? 14 : 18;
  const summary = "Premium member — active HomeBit subscription";

  return (
    <span
      className={`relative inline-flex items-center gap-1 align-middle ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={summary}
        aria-describedby={open ? tooltipId : undefined}
        aria-expanded={open}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setOpen((value) => !value)
        }}
        className="inline-flex cursor-help items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        title={summary}
      >
        <svg width={dimension} height={dimension} viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          {/* A star, not a tick. The tick is spoken for. */}
          <path
            d="M12 2.4l2.86 5.79 6.39.93-4.62 4.5 1.09 6.36L12 16.98l-5.72 3l1.09-6.36-4.62-4.5 6.39-.93L12 2.4z"
            fill={`url(#${gradientId})`}
          />
        </svg>
      </button>

      {showLabel ? (
        <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Premium</span>
      ) : null}

      {open ? (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute left-1/2 top-full z-50 mt-2 w-[min(17rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-amber-200 bg-white p-3 text-left shadow-lg dark:border-amber-500/30 dark:bg-[#161622]"
        >
          <span className="block text-xs font-semibold text-gray-900 dark:text-white">
            Premium member
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-gray-600 dark:text-gray-300">
            {isTrial
              ? "This person is on a HomeBit plan and has full access to messaging and applications."
              : "This person has an active HomeBit subscription, with full access to messaging and applications."}
          </span>
          <span className="mt-2 block text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
            It is not an identity check and says nothing about their experience.
          </span>
        </span>
      ) : null}
    </span>
  );
}
