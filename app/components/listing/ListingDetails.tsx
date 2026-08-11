import { readFeatureGroups, listingHighlights } from "~/utils/listingFeatures";

/**
 * What a household posted, shown to whoever is looking at it.
 *
 * The same job was being described twice: the household's own page rendered the
 * full set of picks — chores, salary range, start timing, how often, how long,
 * day worker or live-in, which days, which part of the day — and the househelp's
 * side of the very same application showed the message they had sent and
 * "Salary Expected: Not specified".
 *
 * That was not a missing fetch. The listing was already being read and then
 * dropped: everything except the title was discarded on the way into the row.
 * The person deciding whether to take the work could not see the work.
 *
 * One renderer, so the two sides cannot drift into describing the same job
 * differently. Built on readFeatureGroups, which is the one place that knows how
 * a listing's picks are shaped.
 */
export function ListingDetails({
  listing,
  className = "",
  emptyMessage = "The household has not filled in the details for this job.",
}: {
  listing: unknown;
  className?: string;
  /** Shown when the listing carries no picks at all. */
  emptyMessage?: string;
}) {
  const groups = readFeatureGroups(listing);

  if (groups.length === 0) {
    return (
      <p className={`text-xs text-gray-500 dark:text-gray-400 ${className}`}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {groups.map((group) => (
        <div
          key={group.key || group.name}
          className="rounded-2xl border border-purple-200 bg-purple-50/60 p-3 dark:border-purple-500/20 dark:bg-purple-950/20"
        >
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-purple-700 dark:text-purple-200">
            {group.name}
          </p>
          <div className="flex flex-wrap gap-2">
            {group.properties.map((property) => (
              <span
                key={property}
                className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-800 ring-1 ring-purple-300/50 dark:bg-purple-500/20 dark:text-purple-50 dark:ring-purple-400/30"
              >
                {property}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * The job's pay, as the household wrote it.
 *
 * A separate export because a row usually has space for this one fact and not
 * for the rest, and because "what does it pay" is the question somebody scanning
 * a list is actually asking.
 */
export function listingSalary(listing: unknown): string {
  return listingHighlights(listing).salary;
}

export default ListingDetails;
