import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { Briefcase, Loader2 } from "lucide-react";

import OpenForWorkModal from "~/components/modals/OpenForWorkModal";
import { ConfirmDialog } from "~/components/ui/ConfirmDialog";
import { useSubscription } from "~/hooks/useSubscription";
import { openForWorkService } from "~/services/grpc/authServices";
import { getStoredUser, getStoredUserId } from "~/utils/authStorage";

const resolveListingId = (listing?: Record<string, any> | null): string => {
  const candidates = [
    listing?.listing_id,
    listing?.listingId,
    listing?.id,
    listing?.data?.listing_id,
    listing?.data?.listingId,
    listing?.data?.id,
  ];
  return String(candidates.find((value) => /^\d+$/.test(String(value ?? ""))) ?? "");
};

/**
 * Telling households you are available.
 *
 * An open-for-work listing is how a househelp is found rather than having to
 * find. The modal that writes one already existed and was reachable from
 * nowhere, so nobody could publish one at all.
 *
 * The form is available before the other setup actions are complete. The
 * readiness checklist may be completed in any order; marketplace interaction
 * and discoverability are what remain locked until every action is done.
 *
 * The button is always visible, which is the deliberate part. Hiding it until
 * somebody qualifies means the people who most need to know what to do next are
 * the ones who never see it exists. Shown and unmet, it names the missing thing
 * and links to it.
 */
export interface OpenForWorkButtonHandle {
  open: () => void;
}

export const OpenForWorkButton = forwardRef<OpenForWorkButtonHandle, {
  className?: string;
  onChanged?: () => void;
  showStatus?: boolean;
}>(function OpenForWorkButton({
  className = "",
  onChanged,
  showStatus = false,
}, ref) {
  const userId = getStoredUserId() || "";

  const { isActive: hasSubscription, daysRemaining, expiresAt } = useSubscription(userId);

  const [listing, setListing] = useState<Record<string, any> | null>(null);
  const [loadingListing, setLoadingListing] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [openAfterLoad, setOpenAfterLoad] = useState(false);
  const [editing, setEditing] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState("");

  const profileId =
    (getStoredUser() || {}).user_profile_id ||
    (getStoredUser() || {}).userProfileId ||
    (getStoredUser() || {}).profile_id ||
    "";

  const loadListing = useCallback(async () => {
    if (!profileId) {
      setLoadingListing(false);
      return;
    }
    try {
      const raw = await openForWorkService.getOpenForWorkByHousehelp(profileId, "");
      const found = raw?.data?.listing ?? raw?.data ?? raw?.listing ?? raw ?? null;
      setListing(found && (found.id || found.listing_id || found.listingId) ? found : null);
    } catch {
      // Not having one is the ordinary case, and the service says so with an
      // error. Nothing to report: the button simply offers to create one.
      setListing(null);
    } finally {
      setLoadingListing(false);
    }
  }, [profileId]);

  useEffect(() => {
    void loadListing();
  }, [loadListing]);

  const checking = loadingListing;
  const hasListing = Boolean(listing);
  const isLive = hasListing && String(listing?.status ?? "active").toLowerCase() === "active";

  const openModal = useCallback(() => {
    setEditing(!hasListing);
    setModalOpen(true);
  }, [hasListing]);

  const requestModal = useCallback(() => {
    if (checking) {
      setOpenAfterLoad(true);
      return;
    }
    openModal();
  }, [checking, openModal]);

  useEffect(() => {
    if (checking || !openAfterLoad) return;
    setOpenAfterLoad(false);
    openModal();
  }, [checking, openAfterLoad, openModal]);

  useImperativeHandle(ref, () => ({ open: requestModal }), [requestModal]);

  const handleClick = () => {
    if (checking) return;
    if (hasListing && !isLive) {
      void setListingLive(true);
      return;
    }
    openModal();
  };

  const setListingLive = async (live: boolean) => {
    const listingId = resolveListingId(listing);
    if (!listingId || removing) return;
    setRemoving(true);
    setRemoveError("");
    try {
      await openForWorkService.updateOpenForWork(listingId, "", { status: live ? "active" : "paused" });
      await loadListing();
      setRemoveOpen(false);
      window.dispatchEvent(new CustomEvent("homebit:marketplace-readiness-changed"));
      onChanged?.();
    } catch (error: any) {
      setRemoveError(error?.message || `We could not turn your Open for Work listing ${live ? "on" : "off"}. Please try again.`);
    } finally {
      setRemoving(false);
    }
  };

  const expiryText = expiresAt
    ? daysRemaining <= 0
      ? `Your subscription expires today (${new Date(expiresAt).toLocaleDateString("en-KE")}).`
      : `${daysRemaining} ${daysRemaining === 1 ? "day" : "days"} remaining, until ${new Date(expiresAt).toLocaleDateString("en-KE")}.`
    : hasSubscription
      ? "This listing remains searchable while your subscription is active."
      : "An active subscription is required for households to find this listing.";

  const label = checking
    ? "Checking…"
    : hasListing
      ? isLive ? "Open for work is active" : "Open for work is off"
      : "Go open for work";

  const tone = isLive
    ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200"
    : "border-transparent bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:from-purple-700 hover:to-pink-700";

  return (
    <>
      <div className={`min-w-0 max-w-full flex flex-col gap-2 ${showStatus ? "items-stretch" : "items-start"} ${className}`}>
        {showStatus ? (
          <div className={`rounded-xl border px-3 py-2 text-xs ${isLive ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100" : "border-purple-200 bg-purple-50 text-purple-800 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-100"}`}>
            <p className="font-semibold">{isLive ? "Households can currently find you" : "You are not currently searchable"}</p>
            <p className="mt-0.5 opacity-80">{expiryText}</p>
          </div>
        ) : null}
        <div className="flex min-w-0 max-w-full flex-wrap gap-2">
          <button
        type="button"
        onClick={handleClick}
        disabled={checking}
        title={
          hasListing
            ? "View and manage your Open for Work listing."
            : "Tell households what you are available for. You can complete the other setup actions in any order."
        }
        className={`inline-flex max-w-full items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${tone}`}
      >
        {checking ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Briefcase className="h-4 w-4" />
        )}
        {label}
        {isLive ? (
          <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
        ) : null}
      </button>

        </div>
        {removeError ? <p className="text-xs text-red-600 dark:text-red-300">{removeError}</p> : null}
      </div>

      {modalOpen ? (
        <OpenForWorkModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          listing={listing}
          readOnly={Boolean(listing) && !editing}
          onEdit={() => setEditing(true)}
          onRemove={() => {
            setModalOpen(false);
            setRemoveError("");
            setRemoveOpen(true);
          }}
          onSaved={() => {
            setModalOpen(false);
            setEditing(false);
            void loadListing();
            window.dispatchEvent(new CustomEvent("homebit:marketplace-readiness-changed"));
            onChanged?.();
          }}
        />
      ) : null}

      <ConfirmDialog
        isOpen={removeOpen}
        onClose={() => { if (!removing) setRemoveOpen(false); }}
        onConfirm={() => void setListingLive(false)}
        title="Turn Open for Work off?"
        message={`Households will no longer find you in search results. Your saved listing details, profile, and applications stay intact, so turning it on again is one click. ${expiryText}`}
        confirmText={removing ? "Turning off…" : "Turn off"}
        cancelText="Keep me searchable"
        variant="danger"
        isLoading={removing}
      />
    </>
  );
});
