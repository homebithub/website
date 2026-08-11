import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { BadgeCheck, Briefcase, CreditCard, Loader2 } from "lucide-react";

import OpenForWorkModal from "~/components/modals/OpenForWorkModal";
import { useSubscription } from "~/hooks/useSubscription";
import { useIdentityVerification } from "~/hooks/useIdentityVerification";
import { openForWorkService } from "~/services/grpc/authServices";
import { getStoredUser, getStoredUserId } from "~/utils/authStorage";

/**
 * Telling households you are available.
 *
 * An open-for-work listing is how a househelp is found rather than having to
 * find. The modal that writes one already existed and was reachable from
 * nowhere, so nobody could publish one at all.
 *
 * Two things must be true before it can be switched on: an active subscription,
 * and an approved identity check. Households search these listings to decide who
 * comes into their home, so an unverified one is worth less than none — and the
 * subscription is what the marketplace runs on.
 *
 * The button is always visible, which is the deliberate part. Hiding it until
 * somebody qualifies means the people who most need to know what to do next are
 * the ones who never see it exists. Shown and unmet, it names the missing thing
 * and links to it.
 */
export function OpenForWorkButton({
  className = "",
  onChanged,
}: {
  className?: string;
  onChanged?: () => void;
}) {
  const navigate = useNavigate();
  const userId = getStoredUserId() || "";

  const { isActive: hasSubscription, loading: subscriptionLoading } = useSubscription(userId);
  const verification = useIdentityVerification(userId);

  const [listing, setListing] = useState<Record<string, any> | null>(null);
  const [loadingListing, setLoadingListing] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

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
      const found = raw?.data ?? raw ?? null;
      setListing(found && (found.id || found.listing_id) ? found : null);
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

  const verified = verification.status === "approved";
  const checking = subscriptionLoading || verification.status === "loading" || loadingListing;
  const eligible = hasSubscription && verified;
  const isLive = Boolean(listing) && String(listing?.status ?? "active").toLowerCase() === "active";

  // What is missing, said in the order somebody should deal with it: the
  // identity check takes days and the subscription takes a minute.
  const blockedBy = !verified ? "verification" : !hasSubscription ? "subscription" : null;

  const handleClick = () => {
    if (checking) return;
    if (blockedBy === "verification") {
      navigate("/househelp/profile?verify=1");
      return;
    }
    if (blockedBy === "subscription") {
      navigate("/subscriptions");
      return;
    }
    setModalOpen(true);
  };

  const label = checking
    ? "Checking…"
    : isLive
      ? "Open for work"
      : blockedBy === "verification"
        ? "Verify to go open for work"
        : blockedBy === "subscription"
          ? "Subscribe to go open for work"
          : "Go open for work";

  const tone = isLive
    ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200"
    : eligible
      ? "border-transparent bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:from-purple-700 hover:to-pink-700"
      : "border-purple-200 bg-white text-purple-700 dark:border-purple-500/30 dark:bg-white/5 dark:text-purple-200";

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={checking}
        title={
          isLive
            ? "Households can find you. Tap to edit what you are available for."
            : blockedBy === "verification"
              ? "Households search these listings to decide who comes into their home, so an identity check comes first."
              : blockedBy === "subscription"
                ? "An active subscription is needed to be listed."
                : "Tell households what you are available for."
        }
        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold transition disabled:opacity-60 ${tone} ${className}`}
      >
        {checking ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : blockedBy === "verification" ? (
          <BadgeCheck className="h-4 w-4" />
        ) : blockedBy === "subscription" ? (
          <CreditCard className="h-4 w-4" />
        ) : (
          <Briefcase className="h-4 w-4" />
        )}
        {label}
        {isLive ? (
          <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
        ) : null}
      </button>

      {modalOpen ? (
        <OpenForWorkModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          listing={listing}
          onSaved={() => {
            setModalOpen(false);
            void loadListing();
            onChanged?.();
          }}
        />
      ) : null}
    </>
  );
}
