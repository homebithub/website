import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { NOTIFICATIONS_API_BASE_URL } from "~/config/api";
import { shortlistService } from "~/services/grpc/authServices";
import { ListingViewToggle, useListingViewPreference } from "~/components/listing/ListingViewToggle";
import { getInboxRoute, startOrGetConversation, type StartConversationPayload } from '~/utils/conversationLauncher';
import ShortlistPlaceholderIcon from "~/components/features/ShortlistPlaceholderIcon";
import { fetchPreferences } from "~/utils/preferencesApi";
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { getStoredProfileType, getStoredUser, getStoredUserId, getStoredUserProfileId } from '~/utils/authStorage';
import { ShimmerListPlaceholder } from '~/components/ShimmerLoader';
import { JobListingCard } from '~/components/listing/JobListingCard';
import { marketplaceJobService, marketplaceListingApplicationService } from '~/services/grpc/marketplace.service';
import { notificationsService } from '~/services/grpc/notifications.service';
import { resolveHouseholdProfile } from '~/utils/householdProfiles';

type JobLocation = {
  name?: string;
  place?: string;
};

// Location and salary come from the shared helpers, the same ones the job board
// uses.
//
// This page had its own of each, and both read shapes the API does not send: a
// nested location.name, and a salary_range object. A listing carries its place
// as ward/subcounty at the top level, and its salary as a SalaryRange feature
// group — so every saved card said "Location not specified" and "Salary: Not
// specified" for jobs that showed both on the board a click earlier.
//
// A second private copy of a formatter is how that happens. There is now one of
// each, and the board is the thing keeping them honest.

type ShortlistedJob = {
  id: string;
  title?: string;
  description?: string;
  status?: string;
  location?: string | JobLocation;
  job_types?: string[];
  created_at?: string;
  start_date?: string;
  max_applicants?: number;
  has_applied?: boolean;
  user_id?: string;
  user_profile_id?: string;
  household_profile_id?: string;
  /** What ListJobs calls the poster of a listing. */
  owner_user_id?: string;
  household?: {
    id?: string;
    user_id?: string;
    profile_id?: string;
  };
};

export default function ShortlistPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ShortlistedJob[]>([]);
  const [householdProfiles, setHouseholdProfiles] = useState<Record<string, any>>({});
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [contactedIds, setContactedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [chatLoadingId, setChatLoadingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useListingViewPreference("homebit:saved-view");
  const isGridView = viewMode === "grid";
  const currentUser = useMemo(() => getStoredUser(), []);
  const currentUserId: string | undefined = currentUser?.user_id || currentUser?.id || getStoredUserId() || undefined;
  const currentUserProfileId: string | undefined = currentUser?.user_profile_id || currentUser?.userProfileId || getStoredUserProfileId() || undefined;
  const currentProfileType: string | undefined = currentUser?.profile_type || getStoredProfileType() || undefined;

  // Load UI preferences (compact view, accessibility)
  useEffect(() => {
    let cancelled = false;

    const loadPrefs = async () => {
      try {
        const prefs = await fetchPreferences();
        if (cancelled) return;
        const settings = prefs?.settings || {};
        setAccessibilityMode(Boolean(settings.accessibility_mode));
      } catch {
        if (!cancelled) {
          setAccessibilityMode(false);
        }
      }
    };

    loadPrefs();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!currentUserProfileId) {
        setItems([]);
        setHasMore(false);
        setError("User profile information is missing. Please sign in again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // Saved jobs are bookmarks now, not applications. Reading them from
        // applications with status 'shortlisted' meant a saved job was also a
        // formal application on the household's listing, which is exactly the
        // conflation this page existed on the wrong side of.
        //
        // A bookmark stores only which listing it points at, so each one is
        // fetched to build its card — the same shape the household's saved page
        // uses for the listings it has kept.
        const raw = await shortlistService.listByProfile('');
        const saved = Array.isArray(raw?.data?.data)
          ? raw.data.data
          : Array.isArray(raw?.data)
            ? raw.data
            : [];
        const bookmarks = saved.filter((item: any) => (item?.profile_type ?? 'job') === 'job');
        const ids = bookmarks.slice(offset, offset + limit).map((item: any) => String(item.profile_id ?? item.listing_id ?? '')).filter(Boolean);
        const data = await marketplaceJobService.getSavedCards(ids, currentUserProfileId, 'household');
        const profileIds = [...new Set(data.map((job: any) => job.household_profile_id || job.user_profile_id || job.owner_profile_id).filter(Boolean))];
        const profiles = await Promise.all(profileIds.map(async (id) => [id, await resolveHouseholdProfile(String(id), { identifierType: 'profileId' }).catch(() => null)]));
        if (cancelled) return;
        setHouseholdProfiles((prev) => ({ ...prev, ...Object.fromEntries(profiles) }));
        setItems((prev) => (offset === 0 ? data : [...prev, ...data]));
        setHasMore(offset + limit < bookmarks.length);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load shortlisted jobs");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [offset, currentUserProfileId]);

  useEffect(() => {
    if (!currentUserProfileId || !currentUserId) return;
    let cancelled = false;
    const rows = (raw: any): any[] => {
      const value = raw?.conversations ?? raw?.data?.data ?? raw?.data ?? raw;
      return Array.isArray(value) ? value : [];
    };
    void marketplaceListingApplicationService.listApplications({ applicantProfileId: currentUserProfileId, limit: 200 })
      .then((raw) => { if (!cancelled) setAppliedIds(new Set(rows(raw).map((row) => String(row.listing_id ?? row.listingId ?? row.job_listing_id ?? row.jobListingId)))); }).catch(() => {});
    void notificationsService.listConversations(currentUserId, 0, 200)
      .then((raw) => { if (!cancelled) setContactedIds(new Set(rows(raw).map((row) => String(row.listing_id ?? row.listingId)))); }).catch(() => {});
    return () => { cancelled = true; };
  }, [currentUserId, currentUserProfileId]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const io = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !loading && hasMore) {
        setOffset((o) => o + limit);
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [loading, hasMore]);

  const initialLoading = loading && items.length === 0;

  async function handleRemove(jobId: string) {
    setRemovingId(jobId);
    setError(null);
    try {
      await shortlistService.deleteShortlist(jobId);
      setItems((prev) => prev.filter((job) => String(job.id) !== jobId));
      window.dispatchEvent(new CustomEvent('shortlist-updated'));
    } catch (e: any) {
      setError(e?.message || "We couldn't remove this saved job. Please try again.");
    } finally {
      setRemovingId(null);
    }
  }

  async function handleChatWithHousehold(targetUserId?: string, householdProfileId?: string, jobId?: string) {
    if (!targetUserId || !currentUserId) return;
    try {
      if (jobId) setChatLoadingId(jobId);
      const profileType = (currentProfileType || '').toLowerCase();
      let householdId = targetUserId;
      let serviceProviderId = currentUserId;

      if (profileType === 'household') {
        householdId = currentUserId;
        serviceProviderId = targetUserId;
      }

      const payload: StartConversationPayload = {
        household_user_id: householdId,
        service_provider_user_id: serviceProviderId,
        listing_id: jobId,
      };
      
      if (householdProfileId) {
        payload.household_profile_id = householdProfileId;
      }

      const convId = await startOrGetConversation(NOTIFICATIONS_API_BASE_URL, payload);
      navigate(getInboxRoute(convId));
    } catch (e) {
      console.error('Failed to start chat from shortlist (household)', e);
      navigate('/inbox');
    } finally {
      if (jobId) setChatLoadingId(null);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="gradient" bubbles={false} bubbleDensity="low" className="flex-1 flex flex-col">
        <main className={`flex-1 py-8 ${accessibilityMode ? 'text-sm sm:text-base' : ''}`}>
          <div className="mx-auto flex max-w-6xl flex-col px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h1 className="text-lg font-extrabold text-gray-900 dark:text-white">Saved</h1>
              <ListingViewToggle value={viewMode} onChange={setViewMode} />
            </div>

            {initialLoading && <ShimmerListPlaceholder items={4} />}

            {(!items || items.length === 0) && !initialLoading && !error && (
              <div className="rounded-2xl border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] p-8 text-center">
                <ShortlistPlaceholderIcon className="w-20 h-20 mx-auto mb-4" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">No saved jobs yet</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">Save jobs you like and they will stay here for easy comparison.</p>
                <button onClick={() => navigate('/')} className="mt-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2 text-sm font-semibold text-white">Browse jobs</button>
              </div>
            )}

            {error && <ErrorAlert message={error} className="mb-4" />}

            <div className={`${initialLoading ? 'hidden' : 'hb-data-panel-enter'} ${isGridView ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}`}>
              {items.map((job) => {
                const jobId = String(job.id);
                const profileId = job.household?.profile_id || job.household_profile_id || job.user_profile_id || (job as any).owner_profile_id;
                const profile = householdProfiles[profileId || ''];
                const ownerId = job.household?.user_id || job.owner_user_id || job.user_id || profile?.user_id;
                const openProfile = () => navigate(
                  '/household/public-profile?' + new URLSearchParams({ userId: ownerId || '', profileId: profileId || '', jobId, from: 'shortlist', backTo: '/shortlist', backLabel: 'Back to Saved' }),
                  { state: { profileId, backTo: '/shortlist', backLabel: 'Back to Saved' } },
                );
                return <JobListingCard key={jobId} job={job} isGridView={isGridView}
                  householdProfile={profile} householdName={profile?.name}
                  hasApplied={appliedIds.has(jobId) || Boolean(job.has_applied)} contacted={contactedIds.has(jobId)} shortlisted
                  chatLoading={chatLoadingId === jobId} saving={removingId === jobId}
                  onOpen={openProfile} onViewProfile={openProfile}
                  onChat={() => handleChatWithHousehold(ownerId, profileId, jobId)} onToggleSave={() => handleRemove(jobId)} />;
              })}
            </div>

            <div ref={sentinelRef} className="h-8" />
            {loading && items.length > 0 && <ShimmerListPlaceholder items={1} className="mt-4" />}
          </div>
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}

export { ErrorBoundary } from "~/components/ErrorBoundary";
