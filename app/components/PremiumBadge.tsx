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
  const summary = "Active member — active HomeBit subscription";

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
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="52%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
          </defs>
          {/* A faceted membership medallion. Rating owns the star shape and
              identity verification owns the tick. */}
          <path
            d="M12 1.8l2.3 2.05 3.05-.2.9 2.92 2.65 1.53-.9 2.92 1.38 2.73-2.43 1.86-.4 3.04-3.06.17L12 21.4l-2.49-2.58-3.06-.17-.4-3.04-2.43-1.86L5 11.02 4.1 8.1l2.65-1.53.9-2.92 3.05.2L12 1.8z"
            fill={`url(#${gradientId})`}
          />
          <path d="M9 12.1l1.85 1.85L15.4 9.4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {showLabel ? (
        <span className="bg-gradient-to-r from-amber-500 via-purple-500 to-pink-500 bg-clip-text text-xs font-semibold text-transparent">Active member</span>
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
