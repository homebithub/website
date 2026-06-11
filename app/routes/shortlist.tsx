import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Eye, Heart, MessageCircle } from "lucide-react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { NOTIFICATIONS_API_BASE_URL } from "~/config/api";
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
  salary_range?: { min?: number; max?: number };
  has_applied?: boolean;
  household_id?: string;
  user_id?: string;
  user_profile_id?: string;
  household_profile_id?: string;
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
        const params = new URLSearchParams({
          limit: String(limit),
          offset: String(offset),
          status: "shortlisted",
          applicant_profile_id: currentUserProfileId,
        });
        const res = await fetch(`/api/job-applications?${params.toString()}`);
        const raw = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(raw?.message || "Failed to load shortlisted jobs");
        }
        const data = Array.isArray(raw?.data) ? raw.data : [];
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
    setItems((prev) => prev.filter((job) => job.id !== jobId));
    window.dispatchEvent(new CustomEvent('shortlist-updated'));
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-lg font-extrabold text-gray-900 dark:text-white mb-6">My Shortlist</h1>

            {(!items || items.length === 0) && !loading && !error && (
              <div className="rounded-2xl border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] p-8 text-center">
                <ShortlistPlaceholderIcon className="w-20 h-20 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 text-base">No shortlisted jobs yet.</p>
              </div>
            )}

            {error && <ErrorAlert message={error} className="mb-4" />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(Array.isArray(items) ? items : [])
                .map((job) => {
                  const jobId = String(job.id || '');
                  const householdUserId = job.household?.user_id || job.household_id || job.user_id;
                  const householdProfileId = job.household?.profile_id || job.household?.id || job.household_profile_id || job.user_profile_id;
                  const isOpen = isJobOpen(job || {});
                  const hasApplied = Boolean(job?.has_applied);
                  const householdProfileLink = `/household/public-profile?userId=${encodeURIComponent(householdUserId || '')}&jobId=${encodeURIComponent(jobId)}&from=shortlist&backTo=${encodeURIComponent('/shortlist')}&backLabel=${encodeURIComponent('Back to shortlist')}`;
                  return (
                    <div
                      key={jobId}
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
                              onClick={() => handleChatWithHousehold(householdUserId, householdProfileId, jobId)}
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
                              onClick={() => handleRemove(jobId)}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-pink-400 bg-pink-500 text-white transition"
                              aria-label="Remove job from shortlist"
                            >
                              <Heart className="w-4 h-4 fill-current" />
                            </button>
                            <button
                              onClick={() =>
                                navigate(householdProfileLink, {
                                  state: { profileId: householdProfileId, backTo: '/shortlist', backLabel: 'Back to shortlist' },
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
                        <span className="text-xs text-gray-400">Posted {formatTimeAgo(job?.created_at)}</span>
                        <button
                          onClick={() =>
                            navigate(householdProfileLink, {
                              state: { profileId: householdProfileId, backTo: '/shortlist', backLabel: 'Back to shortlist' },
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
