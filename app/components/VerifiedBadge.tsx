import { useId } from "react";

/**
 * The verified tick, for a househelp whose identity has actually been checked.
 *
 * It means one specific thing: a KYC record with status `approved` — documents
 * and a live selfie submitted, matched by Smile ID, and not since revoked. It
 * is not a rating, not a badge of good work, and not a claim about anybody's
 * conduct. Employers will read it as a guarantee of more than that, so it is
 * worth being strict about what turns it on: the API sends it only for an
 * approved record, and pending, rejected, under-review and resubmission all
 * leave it off rather than showing a hedged version.
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
  /** When the verification was approved, for the tooltip. */
  verifiedAt?: string;
  className?: string;
}) {
  // Unique per instance: two badges on one page would otherwise share a
  // gradient id, and the second would render with the first's fill.
  const gradientId = useId();

  const dimension = size === "sm" ? 14 : 18;
  const description = verifiedAt
    ? `Identity verified by HomeBit on ${new Date(verifiedAt).toLocaleDateString("en-KE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`
    : "Identity verified by HomeBit — ID documents and a live selfie were checked";

  return (
    <span
      className={`inline-flex items-center gap-1 align-middle ${className}`}
      title={description}
    >
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 24 24"
        fill="none"
        role="img"
        aria-label={description}
        className="shrink-0"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#2563eb" />
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
      {showLabel ? (
        <span className="text-xs font-medium text-violet-700 dark:text-violet-300">Verified</span>
      ) : null}
    </span>
  );
}
