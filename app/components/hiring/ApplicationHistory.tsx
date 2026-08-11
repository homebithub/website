import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

import { listingApplicationService } from "~/services/grpc/authServices";

/**
 * How an application got to where it is.
 *
 * The status is one word. To the two people it is about — somebody who applied
 * for work and somebody deciding whether to give it — that word is the whole
 * account: "declined" with no sense of whether it took a day or a month, whether
 * anybody looked, or what was said. The transitions have been recorded from the
 * start and were readable by nobody.
 *
 * Shown to both sides, deliberately. A household should see what it did, and a
 * househelp should be able to tell that they were shortlisted for a fortnight
 * before it went the other way.
 */

/** What each status means, said from the point of view of whoever is reading. */
function describe(
  toStatus: string,
  fromStatus: string | undefined,
  viewer: "household" | "househelp",
): string {
  const applicantActed = ["initiated", "accepted", "declined"].includes(toStatus);
  switch (toStatus) {
    case "shortlisted":
      return viewer === "household" ? "You shortlisted them" : "You were shortlisted";
    case "initiated":
      // Reached two ways: somebody applying, or a household making an offer to
      // somebody it had shortlisted. What came before says which.
      if (fromStatus === "shortlisted") {
        return viewer === "household" ? "You sent an offer" : "You were sent an offer";
      }
      return viewer === "household" ? "They applied" : "You applied";
    case "accepted":
      return viewer === "household" ? "They accepted" : "You accepted";
    case "declined":
      return applicantActed && fromStatus === "initiated"
        ? viewer === "household"
          ? "Declined"
          : "You declined"
        : viewer === "household"
          ? "You closed this application"
          : "The household did not go ahead";
    case "approved":
      return viewer === "household" ? "You hired them" : "You were hired";
    default:
      return toStatus.replace(/_/g, " ");
  }
}

function when(value: unknown): string {
  const date = new Date(String(value ?? ""));
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ApplicationHistory({
  applicationId,
  actorProfileId,
  viewer,
  className = "",
}: {
  applicationId: string | number;
  actorProfileId: string;
  viewer: "household" | "househelp";
  className?: string;
}) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!applicationId || !actorProfileId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    listingApplicationService
      .listApplicationEvents(applicationId, actorProfileId)
      .then((rows) => {
        if (!cancelled) setEvents(rows);
      })
      .catch(() => {
        // The history is context, not the thing somebody came for. A failure
        // here should not take the rest of the panel with it.
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applicationId, actorProfileId]);

  if (loading) {
    return (
      <p className={`text-xs text-gray-500 dark:text-gray-400 ${className}`}>
        Loading history…
      </p>
    );
  }

  if (failed || events.length === 0) {
    return (
      <p className={`text-xs text-gray-500 dark:text-gray-400 ${className}`}>
        {failed ? "We could not load the history for this application." : "Nothing has happened yet."}
      </p>
    );
  }

  return (
    <ol className={`space-y-3 ${className}`}>
      {events.map((event, index) => {
        const note = typeof event?.note === "string" ? event.note.trim() : "";
        return (
          <li key={String(event?.id ?? index)} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-purple-500" aria-hidden />
              {/* The thread stops at the last entry: a line trailing off below
                  the final step suggests something still to come. */}
              {index < events.length - 1 && (
                <span className="mt-1 w-px flex-1 bg-purple-200 dark:bg-purple-500/30" aria-hidden />
              )}
            </div>
            <div className="min-w-0 pb-1">
              <p className="text-xs font-semibold text-gray-900 dark:text-white">
                {describe(
                  String(event?.to_status ?? ""),
                  event?.from_status ? String(event.from_status) : undefined,
                  viewer,
                )}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                <Clock className="h-3 w-3" aria-hidden />
                {when(event?.created_at) || "date unknown"}
              </p>
              {note && (
                <p className="mt-1 rounded-lg bg-gray-50 px-2.5 py-1.5 text-[11px] text-gray-700 dark:bg-purple-900/20 dark:text-purple-100">
                  “{note}”
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default ApplicationHistory;
