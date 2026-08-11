import { useId, useState } from "react";

/**
 * The verified tick, for a househelp whose identity has actually been checked.
 *
 * It means one specific thing: identity documents and a live selfie were
 * submitted and matched, and the result was approved. It is not a rating, not a
 * badge of good work, and not a claim about anybody's conduct. Employers will
 * read more into it than that, so it is worth being strict about what turns it
 * on: the API sends it only for an approved record, and pending, rejected,
 * under review and resubmission all leave it off rather than showing a hedged
 * version.
 *
 * The wording never names the company that performs the check. That is a
 * supplier we can change, and if their name is written into the tooltip, the
 * profile page, the checklist and the prompts, then changing them means a
 * release across all of it — or, more likely, screens that keep naming a
 * provider we no longer use. What a person needs to know is what was verified,
 * not who we bought it from.
 *
 * There is no "unverified" badge on purpose. Marking people as not-yet-verified
 * turns a queue we control — how fast reviews get done — into a mark against
 * them, and the ones waiting longest would wear it.
 */
export function VerifiedBadge({
  size = "md",
  showLabel = false,
  verifiedAt,
  className = "",
}: {
  size?: "sm" | "md";
  showLabel?: boolean;
  /** When the verification was approved. Only ever set for an approved record. */
  verifiedAt?: string;
  className?: string;
}) {
  // Unique per instance: two badges on one page would otherwise share a
  // gradient id, and the second would render with the first's fill.
  const gradientId = useId();
  const tooltipId = useId();
  const [open, setOpen] = useState(false);

  const dimension = size === "sm" ? 14 : 18;

  const verifiedOn = verifiedAt
    ? new Date(verifiedAt).toLocaleDateString("en-KE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  // The short version, for the browser's own tooltip and for screen readers.
  // Kept in sync with the panel below by saying the same thing more briefly,
  // rather than by being a different claim.
  const summary = "Identity verified — ID document and a live selfie were checked and matched";

  return (
    <span
      className={`relative inline-flex items-center gap-1 align-middle ${className}`}
      // Hover for a mouse, focus for a keyboard, tap for a phone. A tooltip
      // that only answers to hover is invisible on the devices most people
      // browse on.
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
          // Cards are usually clickable. Without this, asking what the badge
          // means opens the househelp's profile instead of answering.
          event.preventDefault();
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        className="inline-flex cursor-help items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
        title={summary}
      >
        <svg width={dimension} height={dimension} viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
          </defs>
          {/* The scalloped disc that reads as "verified" everywhere else. */}
          <path
            d="M12 1.6l2.2 1.9 2.9-.4 1.2 2.7 2.7 1.2-.4 2.9 1.9 2.2-1.9 2.2.4 2.9-2.7 1.2-1.2 2.7-2.9-.4-2.2 1.9-2.2-1.9-2.9.4-1.2-2.7-2.7-1.2.4-2.9L1.6 12l1.9-2.2-.4-2.9 2.7-1.2 1.2-2.7 2.9.4L12 1.6z"
            fill={`url(#${gradientId})`}
          />
          <path
            d="M7.8 12.2l2.7 2.7 5.7-5.7"
            stroke="white"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {showLabel ? (
        <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Verified</span>
      ) : null}

      {open ? (
        <span
          id={tooltipId}
          role="tooltip"
          // Centred on the badge and clamped to the viewport width, because
          // these sit at the end of a name and would otherwise run off the
          // right edge of a phone.
          className="absolute left-1/2 top-full z-50 mt-2 w-[min(17rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-purple-200 bg-white p-3 text-left shadow-lg dark:border-purple-500/30 dark:bg-[#161622]"
        >
          <span className="block text-xs font-semibold text-gray-900 dark:text-white">
            Identity verified
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-gray-600 dark:text-gray-300">
            This person submitted a government ID and a live selfie. The photo was matched against
            the document to confirm they are who they say they are.
          </span>
          <span className="mt-2 block text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
            {verifiedOn ? `Checked on ${verifiedOn}. ` : ""}
            It does not rate their work or experience.
          </span>
        </span>
      ) : null}
    </span>
  );
}
