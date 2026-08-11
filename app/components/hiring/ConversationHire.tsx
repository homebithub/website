import { useCallback, useEffect, useState } from "react";
import { Briefcase, Loader2 } from "lucide-react";

import { jobService, hireContractService, listingApplicationService } from "~/services/grpc/authServices";
import { getStoredUserProfileId } from "~/utils/authStorage";

/**
 * Hiring somebody from a conversation.
 *
 * This replaces a four-step wizard that collected a job type, a salary, a
 * schedule and a set of requirements, and then wrote a hire request — a record
 * that sat beside the listing and application tables rather than in them, and
 * that nothing downstream turned into a contract.
 *
 * All four of those things are already on the job. The household wrote them
 * when they posted it. Asking again produced a second, quieter description of
 * the same work that could disagree with the advert the househelp answered.
 *
 * So the question here is only "which job", and usually not even that: a
 * conversation belongs to a listing now, so the job is known and the household
 * is confirming rather than choosing.
 *
 * What follows is the path that already existed and works: an application if
 * there is not one, then an engagement and a contract in a single transaction,
 * then the offer notification. The househelp accepts by signing — which is what
 * makes this an offer rather than a hire done to them.
 */
export default function ConversationHire({
  househelpProfileId,
  househelpName,
  listingId,
  onClose,
  onHired,
}: {
  househelpProfileId: string;
  househelpName: string;
  /** The job this conversation is about, when it has one. */
  listingId?: string | number;
  onClose: () => void;
  onHired: (contractId: string) => void;
}) {
  const [listings, setListings] = useState<any[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string>(String(listingId || ""));
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingListings, setLoadingListings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only fetched when the conversation does not already name a job, which is
  // the headhunt case: the household approached this person directly and the
  // thread is not about any particular advert.
  useEffect(() => {
    if (listingId) return;
    let cancelled = false;
    setLoadingListings(true);
    (async () => {
      try {
        const raw = await jobService.listJobs(50, 0, getStoredUserProfileId(), "active");
        const items = raw?.data?.data ?? raw?.data ?? [];
        if (!cancelled) setListings(Array.isArray(items) ? items : []);
      } catch {
        if (!cancelled) setError("We could not load your job posts. Please try again.");
      } finally {
        if (!cancelled) setLoadingListings(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  const hire = useCallback(async () => {
    if (!selectedListingId) {
      setError("Choose which job you are hiring for.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // An application first, because a contract is built from one.
      //
      // The househelp usually already applied, in which case this is refused
      // for being a duplicate and the existing application is the one used.
      // When the household approached them directly there is no application at
      // all, and the household opens it — which is what headhunting is.
      let applicationId = "";
      try {
        const applied = await listingApplicationService.applyToListing(
          selectedListingId,
          househelpProfileId,
          notes.trim(),
        );
        applicationId = String(applied?.id ?? applied?.data?.id ?? "");
      } catch {
        // Already applied. Their application is the one to hire against.
      }

      if (!applicationId) {
        const existing = await listingApplicationService.listApplications({ listingId: selectedListingId });
        const rows = existing?.data?.data ?? existing?.data ?? existing ?? [];
        const match = (Array.isArray(rows) ? rows : []).find(
          (a: any) => String(a?.applicant_profile_id ?? a?.service_provider_id ?? "") === String(househelpProfileId),
        );
        applicationId = String(match?.id ?? "");
      }

      if (!applicationId) {
        throw new Error("We could not open an application for this person on that job.");
      }

      const contract = await hireContractService.createFromHireRequest("", {
        application_id: applicationId,
        notes: notes.trim(),
      });

      const contractId = String(contract?.id ?? contract?.data?.id ?? "");
      onHired(contractId);
    } catch (err: any) {
      setError(err?.message || "We could not complete the hire. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedListingId, househelpProfileId, notes, onHired]);

  return (
    <div className="w-full max-w-md rounded-2xl border border-purple-200 bg-white p-6 shadow-2xl dark:border-purple-500/30 dark:bg-[#1b1524]">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-200">
          <Briefcase className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Hire {househelpName}
          </h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            They will get an offer to review and sign. Nothing is agreed until they do.
          </p>
        </div>
      </div>

      {!listingId && (
        <div className="mt-5">
          <label htmlFor="hire-listing" className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            Which job?
          </label>
          {loadingListings ? (
            <p className="mt-2 text-xs text-gray-500">Loading your job posts…</p>
          ) : listings.length === 0 ? (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              You have no open job posts. Post a job first, then hire from it — the contract takes
              its terms from the advert.
            </p>
          ) : (
            <select
              id="hire-listing"
              value={selectedListingId}
              onChange={(event) => setSelectedListingId(event.target.value)}
              className="mt-2 w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm dark:border-purple-500/30 dark:bg-[#0d0d14] dark:text-white"
            >
              <option value="">Choose a job…</option>
              {listings.map((listing: any) => (
                <option key={String(listing.id)} value={String(listing.id)}>
                  {listing.title || `Job #${listing.id}`}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <div className="mt-4">
        <label htmlFor="hire-notes" className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
          Anything to add? <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          id="hire-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          placeholder="Start date, anything you agreed in chat…"
          className="mt-2 w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm dark:border-purple-500/30 dark:bg-[#0d0d14] dark:text-white"
        />
        <p className="mt-1 text-[11px] text-gray-400">
          The pay, schedule and duties come from the job post, so you do not have to repeat them.
        </p>
      </div>

      {error && (
        <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={hire}
          disabled={loading || !selectedListingId}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2 text-xs font-semibold text-white shadow-lg disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Sending offer…" : "Send offer"}
        </button>
      </div>
    </div>
  );
}
