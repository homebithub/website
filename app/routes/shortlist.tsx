import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Eye, MessageCircle } from "lucide-react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { NOTIFICATIONS_API_BASE_URL } from "~/config/api";
import { jobService, shortlistService } from "~/services/grpc/authServices";
import { formatListingPlace } from "~/utils/place";
import { listingHighlights } from "~/utils/listingFeatures";
import { ListingCardFacts } from "~/components/listing/ListingCardFacts";
import { getInboxRoute, startOrGetConversation, type StartConversationPayload } from '~/utils/conversationLauncher';
import ShortlistPlaceholderIcon from "~/components/features/ShortlistPlaceholderIcon";
import { formatTimeAgo } from "~/utils/timeAgo";
import { fetchPreferences } from "~/utils/preferencesApi";
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { getStoredProfileType, getStoredUser, getStoredUserId, getStoredUserProfileId } from '~/utils/authStorage';

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

const formatDate = (value?: string) => {
  if (!value) return "Flexible";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Flexible";
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const isJobOpen = (job: { status?: string }) => {
  // A listing's status is "active" — the value the service writes and the one
  // the API returns. This compared against "open" alone, so every open job read
  // as closed: the service-provider home page showed "0 roles available" beside a
  // filter chip saying "2 total roles". It went unnoticed because the page had
  // an All jobs toggle that skipped the check, and removing that toggle turned
  // a wrong count into an empty page.
  const status = (job.status || "active").toLowerCase();
  return ["active", "open", "available"].includes(status);
};

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [compactView, setCompactView] = useState(false);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const loadingProfiles = false;
  const [chatLoadingId, setChatLoadingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
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
        setCompactView(Boolean(settings.compact_view));
        setAccessibilityMode(Boolean(settings.accessibility_mode));
      } catch {
        if (!cancelled) {
          setCompactView(false);
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
        const jobs = await Promise.all(
          saved
            .filter((item: any) => (item?.profile_type ?? 'job') === 'job')
            .map(async (item: any) => {
              const listingId = String(item.profile_id ?? item.listing_id ?? '');
              if (!listingId) return null;
              try {
                return await jobService.getJob(listingId);
              } catch {
                // A listing deleted since it was saved should drop out of the
                // list rather than take the whole page down with it.
                return null;
              }
            }),
        );
        const data = jobs.filter(Boolean);
        if (cancelled) return;
        setItems((prev) => (offset === 0 ? data : [...prev, ...data]));
        setHasMore(data.length === limit);
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
            <h1 className="text-lg font-extrabold text-gray-900 dark:text-white mb-6">Saved</h1>

            {(!items || items.length === 0) && !loading && !error && (
              <div className="rounded-2xl border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] p-8 text-center">
                <ShortlistPlaceholderIcon className="w-20 h-20 mx-auto mb-4" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">No saved jobs yet</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">Save jobs you like and they will stay here for easy comparison.</p>
                <button onClick={() => navigate('/')} className="mt-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2 text-sm font-semibold text-white">Browse jobs</button>
              </div>
            )}

            {error && <ErrorAlert message={error} className="mb-4" />}

            {/* One column, like the job board.
                This was a two-column grid, so a single saved job sat at half the
                width of the page with empty space beside it — and saved lists are
                usually short, which is exactly when that looks most wrong. The
                cards carry the same content as the board's, so they get the same
                shape. */}
            <div className="space-y-4">
              {(Array.isArray(items) ? items : [])
                .map((job) => {
                  const jobId = String(job.id || '');
                  // owner_user_id is what ListJobs calls the poster. household_id
                  // is not a field a listing carries, so the old first choice was
                  // always undefined and this fell through to job.user_id.
                  const householdUserId = job.household?.user_id || job.owner_user_id || job.user_id;
                  const householdProfileId = job.household?.profile_id || job.household?.id || job.household_profile_id || job.user_profile_id;
                  const isOpen = isJobOpen(job || {});
                  const hasApplied = Boolean(job?.has_applied);
                  const householdProfileLink = `/household/public-profile?userId=${encodeURIComponent(householdUserId || '')}&jobId=${encodeURIComponent(jobId)}&from=shortlist&backTo=${encodeURIComponent('/shortlist')}&backLabel=${encodeURIComponent('Back to shortlist')}`;
                  const openJob = () =>
                    navigate(householdProfileLink, {
                      state: { profileId: householdProfileId, backTo: '/shortlist', backLabel: 'Back to shortlist' },
                    });
                  return (
                    // The whole card opens the job, as it does on the board.
                    // Here only "View more" did, so the obvious thing to do with
                    // a card — tap it — did nothing at all, on the one page
                    // whose whole purpose is going back to something.
                    <div
                      key={jobId}
                      role="button"
                      tabIndex={0}
                      onClick={openJob}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          openJob();
                        }
                      }}
                      className="cursor-pointer bg-white dark:bg-[#13131a] rounded-2xl border-2 border-purple-200/40 dark:border-purple-500/30 p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-purple-300/70 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-400"
                    >
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 lg:grid-cols-[minmax(260px,0.9fr)_minmax(320px,1.2fr)_auto] lg:gap-8">
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                            {job ? job.title || "Household Job" : "Loading..."}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">📍 {formatListingPlace(job)}</p>
                        </div>
                        <ListingCardFacts listing={job} />
                        <div className="flex shrink-0 items-start gap-1.5 sm:gap-2">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              isOpen
                                ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200"
                                : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"
                            }`}
                          >
                            {job?.status || "open"}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleChatWithHousehold(householdUserId, householdProfileId, jobId);
                              }}
                              disabled={chatLoadingId === jobId}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-purple-200/60 dark:border-purple-500/30 bg-white dark:bg-white/10 text-purple-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition disabled:opacity-60"
                              aria-label="Chat with household"
                            >
                              {chatLoadingId === jobId ? (
                                <span className="hb-shimmer-piece h-4 w-4 rounded-full" />
                              ) : (
                                <MessageCircle className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleRemove(jobId);
                              }}
                              disabled={removingId === jobId}
                              className="inline-flex h-9 items-center justify-center rounded-xl border border-pink-400 bg-pink-500 px-3 text-xs font-semibold text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
                              aria-label="Unsave job"
                              title="Click to unsave"
                            >
                              {removingId === jobId ? "Removing..." : "Saved"}
                            </button>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                openJob();
                              }}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-purple-200/60 dark:border-purple-500/30 bg-white dark:bg-white/10 text-purple-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition"
                              aria-label="View household profile"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {job?.description && (
                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                          {job.description}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        {(job?.job_types || []).length > 0 ? (
                          job?.job_types?.map((type: string) => (
                            <span
                              key={type}
                              className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200"
                            >
                              {type.replace(/_/g, " ")}
                            </span>
                          ))
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300">
                            Flexible role
                          </span>
                        )}
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
                          Start {formatDate(job?.start_date)}
                        </span>
                        {job?.max_applicants ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                            Max {job.max_applicants} applicants
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-4 text-xs text-gray-600 dark:text-gray-300">
                        Salary: {listingHighlights(job).salary || "Not specified"}
                      </div>

                      {hasApplied && (
                        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-xs font-semibold text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-200">
                          You have already applied to this job.
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-gray-400">Posted {formatTimeAgo(job?.created_at)}</span>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            openJob();
                          }}
                          className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                        >
                          View more
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div ref={sentinelRef} className="h-8" />
            {loading && (
              <div className="mt-4 text-center text-gray-600 dark:text-gray-300">Loading...</div>
            )}
          </div>
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}

export { ErrorBoundary } from "~/components/ErrorBoundary";
