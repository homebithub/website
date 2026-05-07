import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import {
  interestService,
  jobService,
  profileService as grpcProfileService,
  shortlistService,
} from "~/services/grpc/authServices";
import { ErrorAlert } from "~/components/ui/ErrorAlert";
import { SuccessAlert } from "~/components/ui/SuccessAlert";
import { formatTimeAgo } from "~/utils/timeAgo";
import { getStoredUser, getStoredUserId } from "~/utils/authStorage";
import {
  getInboxRoute,
  startOrGetConversation,
  type StartConversationPayload,
} from "~/utils/conversationLauncher";
import { NOTIFICATIONS_API_BASE_URL } from "~/config/api";
import {
  resolveHouseholdProfile,
  resolveHouseholdOwnerUserId,
  type HouseholdProfileLike,
} from "~/utils/householdProfiles";
import { Heart, MessageCircle, Eye, X } from "lucide-react";

interface JobListing {
  id: string;
  title?: string;
  description?: string;
  location?: string | JobLocation;
  job_types?: string[];
  start_date?: string;
  salary_range?: { min?: number; max?: number; currency?: string };
  max_applicants?: number;
  status?: string;
  created_at?: string;
  household_id?: string;
}

interface HousehelpSummary {
  id?: string;
  user_id?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  photos?: string[];
  town?: string;
  location?: string;
  years_of_experience?: number;
  salary_expectation?: number;
  salary_frequency?: string;
  user?: {
    id?: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
}

interface JobLocation {
  place_type?: string;
  latitude?: number;
  longitude?: number;
  mapbox_id?: string;
  name?: string;
  place?: string;
}

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

const formatSalaryRange = (range?: JobListing["salary_range"]) => {
  if (!range) return "Not specified";
  const min = range.min ? `KES ${range.min.toLocaleString()}` : "";
  const max = range.max ? `KES ${range.max.toLocaleString()}` : "";
  if (min && max) return `${min} - ${max}`;
  return min || max || "Not specified";
};

const extractArray = <T,>(raw: any): T[] => {
  const payload: any = raw?.data?.data ?? raw?.data ?? raw ?? [];
  if (Array.isArray(payload)) return payload as T[];
  if (Array.isArray(payload?.data)) return payload.data as T[];
  if (Array.isArray(payload?.items)) return payload.items as T[];
  if (typeof payload === "object" && payload !== null) {
    const firstArray = Object.values(payload).find(Array.isArray);
    if (firstArray) return firstArray as T[];
  }
  return [];
};

const getDefaultSalaryExpectation = (job: JobListing): number => {
  const min = typeof job.salary_range?.min === "number" ? job.salary_range?.min : undefined;
  const max = typeof job.salary_range?.max === "number" ? job.salary_range?.max : undefined;
  if (typeof min === "number" && min > 0) return min;
  if (typeof max === "number" && max > 0) return max;
  return 1000;
};

export default function HousehelpJobsHome() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [househelpProfileId, setHousehelpProfileId] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [pitch, setPitch] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [householdProfiles, setHouseholdProfiles] = useState<Record<string, HouseholdProfileLike | null>>({});
  const [shortlistedHouseholdIds, setShortlistedHouseholdIds] = useState<Set<string>>(() => new Set());
  const [chatLoadingId, setChatLoadingId] = useState<string | null>(null);
  const [shortlistLoadingId, setShortlistLoadingId] = useState<string | null>(null);

  const limit = 12;
  const backToPath = "/househelp/jobs";

  const currentUser = useMemo(() => getStoredUser(), []);
  const currentUserId: string | undefined = currentUser?.user_id || currentUser?.id || getStoredUserId() || undefined;

  useEffect(() => {
    let cancelled = false;
    const fetchShortlisted = async () => {
      try {
        const raw = await shortlistService.listByProfile('', 'househelp');
        if (cancelled) return;
        const items = extractArray<{ profile_id?: string }>(raw);
        setShortlistedHouseholdIds(new Set(items.map((item) => item.profile_id).filter((id): id is string => Boolean(id))));
      } catch (err) {
        // Silently ignore; shortlist button will still function
      }
    };

    fetchShortlisted();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchProfile = async () => {
      try {
        const profile = await grpcProfileService.getCurrentHousehelpProfile("");
        const resolvedId = profile?.id || profile?.profile_id || "";
        if (!cancelled) setHousehelpProfileId(resolvedId);
      } catch (err) {
        // Non-blocking: allow browsing even if we can't resolve profile ID yet
      }
    };
    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = await jobService.listJobs(limit, offset);
        const payload = raw?.data || raw || {};
        const items = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : [];
        if (cancelled) return;
        setJobs((prev) => (offset === 0 ? items : [...prev, ...items]));
        setHasMore(items.length === limit);
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to load job listings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchJobs();

    return () => {
      cancelled = true;
    };
  }, [offset]);

  useEffect(() => {
    const missingIds = jobs
      .map((job) => job.household_id)
      .filter((id): id is string => Boolean(id))
      .filter((id) => !(id in householdProfiles));

    if (missingIds.length === 0) return;

    let cancelled = false;

    (async () => {
      try {
        const resolved = await Promise.all(
          missingIds.map(async (id) => {
            try {
              return await resolveHouseholdProfile(id, { identifierType: 'profileId' });
            } catch (err) {
              return null;
            }
          }),
        );

        if (cancelled) return;

        setHouseholdProfiles((prev) => {
          const next = { ...prev } as Record<string, HouseholdProfileLike | null>;
          missingIds.forEach((id, index) => {
            next[id] = resolved[index];
          });
          return next;
        });
      } catch (err) {
        // ignore profile lookups failing entirely
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [jobs, householdProfiles]);

  const getHouseholdProfileId = (job: JobListing): string | undefined => {
    const lookupId = job.household_id;
    const profile = lookupId ? householdProfiles[lookupId] : null;
    return profile?.id || profile?.profile_id || lookupId;
  };

  const getHouseholdUserId = (job: JobListing): string | undefined => {
    const lookupId = job.household_id;
    const profile = lookupId ? householdProfiles[lookupId] : null;
    return resolveHouseholdOwnerUserId(profile) || profile?.user_id || undefined;
  };

  const handleOpenApplyModal = (job: JobListing) => {
    setSelectedJob(job);
    setPitch("");
    setApplyError(null);
  };

  const handleCloseApplyModal = () => {
    if (applyLoading) return;
    setSelectedJob(null);
    setPitch("");
    setApplyError(null);
  };

  const handleSubmitApplication = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedJob) return;

    if (!househelpProfileId) {
      setApplyError("Please complete your househelp profile before applying.");
      return;
    }

    const householdProfileId = getHouseholdProfileId(selectedJob);
    if (!householdProfileId) {
      setApplyError("We couldn’t find this household’s profile right now. Please try again later.");
      return;
    }

    setApplyLoading(true);
    setApplyError(null);

    try {
      await jobService.applyForJob(selectedJob.id, househelpProfileId);

      try {
        await interestService.createInterest('', 'househelp', {
          household_id: householdProfileId,
          salary_expectation: getDefaultSalaryExpectation(selectedJob),
          salary_frequency: 'monthly',
          available_from: null,
          job_type: selectedJob.job_types?.[0] || 'general',
          comments: pitch.trim() || undefined,
        });
      } catch (err) {
        // If interest already exists, ignore duplicate errors and continue
      }

      setSuccess("Application submitted successfully.");
      setSelectedJob(null);
      setPitch("");
    } catch (err: any) {
      setApplyError(err?.message || "Failed to submit application. Please try again.");
    } finally {
      setApplyLoading(false);
    }
  };

  const isJobOpen = (job: JobListing) => (job.status || "open") === "open";

  const handleChatWithHousehold = async (job: JobListing) => {
    const householdUserId = getHouseholdUserId(job);
    if (!householdUserId || !currentUserId) {
      setError("We couldn’t start a chat right now. Please try again later.");
      return;
    }

    setChatLoadingId(job.id);
    try {
      const payload: StartConversationPayload = {
        household_user_id: householdUserId,
        househelp_user_id: currentUserId,
      };

      const householdProfileId = getHouseholdProfileId(job);
      if (householdProfileId) payload.household_profile_id = householdProfileId;
      if (househelpProfileId) payload.househelp_profile_id = househelpProfileId;

      const conversationId = await startOrGetConversation(NOTIFICATIONS_API_BASE_URL, payload);
      navigate(getInboxRoute(conversationId));
    } catch (err) {
      setError("Could not open chat. Please try again.");
    } finally {
      setChatLoadingId(null);
    }
  };

  const handleShortlistHousehold = async (job: JobListing) => {
    const profileId = getHouseholdProfileId(job);
    if (!profileId) {
      setError("We couldn’t shortlist this household right now. Please try again later.");
      return;
    }
    if (shortlistedHouseholdIds.has(profileId)) {
      setSuccess("This household is already in your shortlist.");
      return;
    }

    setShortlistLoadingId(job.id);
    try {
      await shortlistService.createShortlist('', 'househelp', {
        profile_id: profileId,
        profile_type: 'household',
      });

      setShortlistedHouseholdIds((prev) => {
        const next = new Set(prev);
        next.add(profileId);
        return next;
      });
      window.dispatchEvent(new CustomEvent('shortlist-updated'));
      setSuccess("Household added to your shortlist.");
    } catch (err: any) {
      setError(err?.message || "Failed to add to shortlist. Please try again.");
    } finally {
      setShortlistLoadingId(null);
    }
  };

  const handleViewProfile = (job: JobListing) => {
    const profileId = getHouseholdProfileId(job);
    const householdUserId = getHouseholdUserId(job);
    if (!profileId && !householdUserId) {
      setError("We couldn’t open this household’s profile right now.");
      return;
    }

    const url = householdUserId
      ? `/household/public-profile?userId=${encodeURIComponent(householdUserId)}&from=jobs&backTo=${encodeURIComponent(backToPath)}&backLabel=${encodeURIComponent('Back to jobs')}`
      : `/household/public-profile?profileId=${encodeURIComponent(profileId!)}&from=jobs&backTo=${encodeURIComponent(backToPath)}&backLabel=${encodeURIComponent('Back to jobs')}`;

    navigate(url, { state: { backTo: backToPath, backLabel: 'Back to jobs' } });
  };

  const renderHouseholdName = (job: JobListing) => {
    const profileId = job.household_id;
    const profile = profileId ? householdProfiles[profileId] : null;
    return profile?.display_name || profile?.household_name || profile?.name || null;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="gradient" bubbles={false} bubbleDensity="low" className="flex-1 flex flex-col">
        <main className="flex-1 py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Latest Job Openings</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Apply directly to households that are actively hiring.
              </p>
            </div>

            {error && <ErrorAlert message={error} className="mb-6" onClose={() => setError(null)} />}
            {success && <SuccessAlert message={success} className="mb-6" onClose={() => setSuccess(null)} />}

            {loading && jobs.length === 0 ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white dark:bg-[#13131a] border-2 border-purple-200 dark:border-purple-500/30 rounded-2xl p-10 sm:p-14 text-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No jobs available yet</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
                  New openings from households will appear here. Check back soon or update your profile to get matched faster.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map((job) => {
                  const householdName = renderHouseholdName(job);
                  const profileId = getHouseholdProfileId(job);
                  const shortlisted = profileId ? shortlistedHouseholdIds.has(profileId) : false;
                  return (
                    <div
                      key={job.id}
                      className="bg-white dark:bg-[#13131a] rounded-2xl border-2 border-purple-200/40 dark:border-purple-500/30 p-6 shadow-sm hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{job.title || "Household Job"}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">📍 {formatJobLocation(job.location)}</p>
                          {householdName && (
                            <p className="mt-1 text-xs font-semibold text-purple-600 dark:text-purple-300">Hosted by {householdName}</p>
                          )}
                        </div>
                        <div className="flex items-start gap-2">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${isJobOpen(job)
                            ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200"
                            : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"}`}
                          >
                            {job.status || "open"}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleChatWithHousehold(job)}
                              disabled={chatLoadingId === job.id}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-purple-200/60 dark:border-purple-500/30 bg-white dark:bg-white/10 text-purple-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition disabled:opacity-60"
                              aria-label="Chat with household"
                            >
                              {chatLoadingId === job.id ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                              ) : (
                                <MessageCircle className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleShortlistHousehold(job)}
                              disabled={shortlistLoadingId === job.id || shortlisted}
                              className={`inline-flex items-center justify-center w-9 h-9 rounded-full border transition ${shortlisted
                                ? "border-green-500 bg-green-500/90 text-white"
                                : "border-purple-200/60 dark:border-purple-500/30 bg-white dark:bg-white/10 text-purple-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-500/10"} disabled:opacity-60`}
                              aria-label={shortlisted ? "Household shortlisted" : "Shortlist household"}
                            >
                              {shortlistLoadingId === job.id ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              ) : (
                                <Heart className={`w-4 h-4 ${shortlisted ? 'fill-current' : ''}`} />
                              )}
                            </button>
                            <button
                              onClick={() => handleViewProfile(job)}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-purple-200/60 dark:border-purple-500/30 bg-white dark:bg-white/10 text-purple-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition"
                              aria-label="View household profile"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {job.description && (
                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                          {job.description}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        {(job.job_types || []).length > 0 ? (
                          job.job_types?.map((type) => (
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
                          Start {formatDate(job.start_date)}
                        </span>
                        {job.max_applicants ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                            Max {job.max_applicants} applicants
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-4 text-xs text-gray-600 dark:text-gray-300">
                        Salary: {formatSalaryRange(job.salary_range)}
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-gray-400">Posted {formatTimeAgo(job.created_at)}</span>
                        <button
                          onClick={() => handleOpenApplyModal(job)}
                          disabled={!isJobOpen(job)}
                          className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && hasMore && jobs.length > 0 && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setOffset((prev) => prev + limit)}
                  className="px-6 py-2 rounded-xl border border-purple-300 text-purple-700 font-semibold hover:bg-purple-50 dark:border-purple-500/40 dark:text-purple-200 dark:hover:bg-purple-500/10"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        </main>
      </PurpleThemeWrapper>
      <Footer />

      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseApplyModal} />
          <div className="relative w-full sm:max-w-lg bg-white dark:bg-[#1b1524] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-purple-200/50 dark:border-purple-700/40 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-purple-500 dark:text-purple-300 font-semibold mb-1">Apply to household</p>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selectedJob.title || "Household Job"}</h2>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <p>📍 {formatJobLocation(selectedJob.location)}</p>
                  <p>💰 {formatSalaryRange(selectedJob.salary_range)}</p>
                  <p>🗓️ Start {formatDate(selectedJob.start_date)}</p>
                </div>
              </div>
              <button
                onClick={handleCloseApplyModal}
                className="text-gray-500 hover:text-purple-600 transition"
                aria-label="Close application modal"
                disabled={applyLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applyError && <ErrorAlert message={applyError} className="mt-4" onClose={() => setApplyError(null)} />}

            <form onSubmit={handleSubmitApplication} className="mt-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-purple-600 dark:text-purple-300 mb-2">Pitch (optional)</label>
                <textarea
                  value={pitch}
                  onChange={(event) => setPitch(event.target.value)}
                  rows={5}
                  placeholder="Introduce yourself, highlight your experience, or explain why you’re a great fit for this household."
                  className="w-full text-sm px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white border-purple-200 dark:border-purple-500/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition resize-none"
                />
                <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">We’ll share this message with the household together with your application.</p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-600/30 rounded-xl p-4 text-xs text-purple-800 dark:text-purple-200">
                <p className="font-semibold mb-1">What happens after you submit?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your application is recorded immediately.</li>
                  <li>{pitch.trim() ? "Your pitch will appear in the household’s applicants list." : "You can add a pitch now or later to help the household shortlist you."}</li>
                  <li>You can follow up via chat using the buttons on the job card.</li>
                </ul>
              </div>

              <div className="flex items-center gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleCloseApplyModal}
                  disabled={applyLoading}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applyLoading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold shadow-lg shadow-purple-500/30 hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-60"
                >
                  {applyLoading ? "Submitting..." : "Submit application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
