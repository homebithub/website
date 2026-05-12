import { getAccessTokenFromCookies } from '~/utils/cookie';
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Eye, Heart, MessageCircle } from "lucide-react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { NOTIFICATIONS_API_BASE_URL } from "~/config/api";
import { jobService, profileService as grpcProfileService, shortlistService } from '~/services/grpc/authServices';
import { getInboxRoute, startOrGetConversation, type StartConversationPayload } from '~/utils/conversationLauncher';
import ShortlistPlaceholderIcon from "~/components/features/ShortlistPlaceholderIcon";
import { formatTimeAgo } from "~/utils/timeAgo";
import { fetchPreferences } from "~/utils/preferencesApi";
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { getStoredProfileType, getStoredUser, getStoredUserId } from '~/utils/authStorage';

type JobLocation = {
  name?: string;
  place?: string;
};

const formatJobLocation = (location?: string | JobLocation): string => {
  if (!location) return "Location not specified";
  if (typeof location === "string") return location;
  return location.name || location.place || "Location not specified";
};

const formatDate = (value?: string) => {
  if (!value) return "Flexible";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Flexible";
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatSalaryRange = (range?: { min?: number; max?: number }) => {
  if (!range) return "Not specified";
  const min = range.min ? `KES ${range.min.toLocaleString()}` : "";
  const max = range.max ? `KES ${range.max.toLocaleString()}` : "";
  if (min && max) return `${min} - ${max}`;
  return min || max || "Not specified";
};

const isJobOpen = (job: { status?: string }) => (job.status || "open").toLowerCase() === "open";

type ShortlistItem = {
  id: string;
  profile_id: string;
  profile_type: string;
  user_id: string;
  household_id: string;
  created_at: string;
};

export default function ShortlistPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ShortlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [profiles, setProfiles] = useState<Record<string, any>>({});

  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const fetchedProfilesRef = useRef<Set<string>>(new Set());
  const [compactView, setCompactView] = useState(false);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [chatLoadingId, setChatLoadingId] = useState<string | null>(null);
  const currentUser = useMemo(() => getStoredUser(), []);
  const currentUserId: string | undefined = currentUser?.user_id || currentUser?.id || getStoredUserId() || undefined;
  const currentProfileType: string | undefined = currentUser?.profile_type || getStoredProfileType() || undefined;
  const [currentHouseholdProfileId, setCurrentHouseholdProfileId] = useState<string | null>(null);

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

  // Fetch household profile ID if current user is a household
  useEffect(() => {
    let cancelled = false;

    const fetchHouseholdProfileId = async () => {
      if (currentProfileType?.toLowerCase() === 'household' && currentUserId) {
        try {
          const token = getAccessTokenFromCookies();
          if (!token) return;
          
          const profile = await grpcProfileService.getCurrentHouseholdProfile('');
          if (profile && !cancelled) {
            setCurrentHouseholdProfileId(profile?.id || profile?.profile_id || null);
          }
        } catch (err) {
          console.error('Failed to fetch household profile ID:', err);
        }
      }
    };

    fetchHouseholdProfileId();

    return () => {
      cancelled = true;
    };
  }, [currentProfileType, currentUserId]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const raw = await shortlistService.listByHousehold('');
        const data = raw?.data?.data || raw?.data || raw || [];
        if (cancelled) return;
        setItems((prev) => (offset === 0 ? data : [...prev, ...data]));
        setHasMore(data.length === limit);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load shortlist");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [offset]);

  // Fetch shortlisted job posts for the househelp shortlist.
  useEffect(() => {
    const neededProfileIds = Array.from(
      new Set(
        (Array.isArray(items) ? items : [])
          .filter((s) => s.profile_type === 'job')
          .map((s) => s.profile_id)
          .filter(Boolean)
      )
    );

    const missing = neededProfileIds.filter(
      (profileId) => profileId && !fetchedProfilesRef.current.has(profileId)
    );

    if (missing.length === 0) return;

    let cancelled = false;
    async function fetchProfiles() {
      try {
        setLoadingProfiles(true);
        const results = await Promise.all(
          missing.map(async (profileId) => {
            try {
              const data = await jobService.getJob(profileId, '');
              return { profileId, data };
            } catch {
              return { profileId, data: null };
            }
          })
        );
        if (cancelled) return;
        setProfiles((prev) => {
          const next = { ...prev } as Record<string, any>;
          for (const r of results) {
            if (r.profileId && r.data) {
              next[r.profileId] = r.data;
              fetchedProfilesRef.current.add(r.profileId);
            }
          }
          return next;
        });
      } finally {
        if (!cancelled) setLoadingProfiles(false);
      }
    }
    fetchProfiles();
    return () => { cancelled = true; };
  }, [items]);

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

  async function handleRemove(profileId: string) {
    try {
      await shortlistService.deleteShortlist(profileId);
      setItems((prev) => prev.filter((s) => s.profile_id !== profileId));
      window.dispatchEvent(new CustomEvent('shortlist-updated'));
    } catch (e) {
      // optionally surface error
    }
  }

  async function handleChatWithHousehold(targetUserId?: string, householdProfileId?: string, jobId?: string) {
    if (!targetUserId || !currentUserId) return;
    try {
      if (jobId) setChatLoadingId(jobId);
      const profileType = (currentProfileType || '').toLowerCase();
      let householdId = targetUserId;
      let househelpId = currentUserId;

      if (profileType === 'household') {
        householdId = currentUserId;
        househelpId = targetUserId;
      }

      const payload: StartConversationPayload = {
        household_user_id: householdId,
        househelp_user_id: househelpId,
      };
      
      // Use passed householdProfileId or the fetched one for current household user
      if (householdProfileId) {
        payload.household_profile_id = householdProfileId;
      } else if (profileType === 'household' && currentHouseholdProfileId) {
        payload.household_profile_id = currentHouseholdProfileId;
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-lg font-extrabold text-gray-900 dark:text-white mb-6">My Shortlist</h1>

            {(!items || items.length === 0) && !loading && !error && (
              <div className="rounded-2xl border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] p-8 text-center">
                <ShortlistPlaceholderIcon className="w-20 h-20 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 text-base">No shortlisted households yet.</p>
              </div>
            )}

            {error && <ErrorAlert message={error} className="mb-4" />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(Array.isArray(items) ? items : [])
                .filter((s) => s.profile_type === "job")
                .map((s) => {
                  const job = s.profile_id ? profiles[s.profile_id] : null;
                  const householdUserId = job?.household_id || s.user_id;
                  const isOpen = isJobOpen(job || {});
                  const hasApplied = Boolean(job?.has_applied);
                  const householdProfileLink = `/household/public-profile?userId=${encodeURIComponent(householdUserId || '')}&jobId=${encodeURIComponent(s.profile_id)}&from=shortlist&backTo=${encodeURIComponent('/shortlist')}&backLabel=${encodeURIComponent('Back to shortlist')}`;
                  return (
                    <div
                      key={s.id}
                      className="bg-white dark:bg-[#13131a] rounded-2xl border-2 border-purple-200/40 dark:border-purple-500/30 p-6 shadow-sm hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {job ? job.title || "Household Job" : "Loading..."}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">📍 {formatJobLocation(job?.location)}</p>
                        </div>
                        <div className="flex items-start gap-2">
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
                              onClick={() => handleChatWithHousehold(householdUserId, s.profile_id, job?.id || s.profile_id)}
                              disabled={chatLoadingId === (job?.id || s.profile_id)}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-purple-200/60 dark:border-purple-500/30 bg-white dark:bg-white/10 text-purple-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition disabled:opacity-60"
                              aria-label="Chat with household"
                            >
                              {chatLoadingId === (job?.id || s.profile_id) ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                              ) : (
                                <MessageCircle className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleRemove(s.profile_id)}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-pink-400 bg-pink-500 text-white transition"
                              aria-label="Remove job from shortlist"
                            >
                              <Heart className="w-4 h-4 fill-current" />
                            </button>
                            <button
                              onClick={() =>
                                navigate(householdProfileLink, {
                                  state: { profileId: s.profile_id, backTo: '/shortlist', backLabel: 'Back to shortlist' },
                                })
                              }
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
                        Salary: {formatSalaryRange(job?.salary_range)}
                      </div>

                      {hasApplied && (
                        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-xs font-semibold text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-200">
                          You have already applied to this job.
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-gray-400">Posted {formatTimeAgo(job?.created_at || s.created_at)}</span>
                        <button
                          onClick={() =>
                            navigate(householdProfileLink, {
                              state: { profileId: s.profile_id, backTo: '/shortlist', backLabel: 'Back to shortlist' },
                            })
                          }
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
            {(loading || loadingProfiles) && (
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
