import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { useOnboardingOptions } from "~/hooks/useOnboardingOptions";
import { Heart, MessageCircle, Eye, X } from "lucide-react";

interface JobListing {
  id: string;
  title?: string;
  description?: string;
  location?: string | JobLocation;
  job_types?: string[];
  start_date?: string;
  work_schedule?: Record<string, { morning?: boolean; afternoon?: boolean; evening?: boolean }>;
  chores_ids?: number[] | string[];
  pet_type_ids?: number[] | string[];
  children_age_range_id?: number | string;
  children_capacity_id?: number | string;
  salary_range?: { min?: number; max?: number; currency?: string; frequency?: string };
  max_applicants?: number;
  status?: string;
  created_at?: string;
  household_id?: string;
  has_applied?: boolean;
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

type SalaryRangeOption = {
  value: string;
  label: string;
  min: number | null;
  max: number | null;
  frequency?: string;
};

const DEFAULT_JOB_FILTERS = {
  jobType: "",
  location: "",
  startWindow: "",
  scheduleSlot: "",
  salaryRangeId: "",
  choreId: "",
  petTypeId: "",
  childrenAgeRangeId: "",
  childrenCapacityId: "",
};

const normalizeToken = (value?: string) => (value || "").trim().toLowerCase();

const toNumberArray = (value: unknown): number[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "number") return item;
      if (typeof item === "string" && item.trim() !== "") {
        const parsed = Number(item);
        return Number.isFinite(parsed) ? parsed : undefined;
      }
      return undefined;
    })
    .filter((item): item is number => typeof item === "number");
};

const toIdString = (value: unknown): string => (value == null ? "" : String(value));

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

const isJobOpen = (job: JobListing) => (job.status || "open").toLowerCase() === "open";

const hasScheduleSlot = (
  schedule: JobListing["work_schedule"],
  slot: "morning" | "afternoon" | "evening"
): boolean => {
  if (!schedule) return false;
  return Object.values(schedule).some((day) => day?.[slot]);
};

const matchesStartWindow = (value: string | undefined, window: string) => {
  if (!window) return true;
  if (!value) return window === "flexible";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return window === "flexible";
  const now = new Date();
  const msDiff = parsed.getTime() - now.getTime();
  const days = msDiff / (1000 * 60 * 60 * 24);
  switch (window) {
    case "next_14":
      return days <= 14;
    case "next_30":
      return days <= 30;
    case "later":
      return days > 30;
    case "flexible":
      return false;
    default:
      return true;
  }
};

const matchesSalaryRange = (range: JobListing["salary_range"], selected?: SalaryRangeOption) => {
  if (!selected) return true;
  if (!range) return false;
  const min = typeof range.min === "number" ? range.min : undefined;
  const max = typeof range.max === "number" ? range.max : undefined;
  if (min == null && max == null) return false;
  const jobMin = min ?? max ?? 0;
  const jobMax = max ?? min ?? 0;
  if (selected.frequency && range.frequency && normalizeToken(range.frequency) !== normalizeToken(selected.frequency)) {
    return false;
  }
  if (selected.min != null && jobMax < selected.min) return false;
  if (selected.max != null && jobMin > selected.max) return false;
  return true;
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
  const [shortlistedJobIds, setShortlistedJobIds] = useState<Set<string>>(() => new Set());
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(() => new Set());
  const [chatLoadingId, setChatLoadingId] = useState<string | null>(null);
  const [shortlistLoadingId, setShortlistLoadingId] = useState<string | null>(null);
  const [openOnly, setOpenOnly] = useState(true);
  const [filters, setFilters] = useState(() => ({ ...DEFAULT_JOB_FILTERS }));
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const limit = 12;
  const backToPath = "/househelp/jobs";

  const { options: onboardingOptions } = useOnboardingOptions("household");

  const currentUser = useMemo(() => getStoredUser(), []);
  const currentUserId: string | undefined = currentUser?.user_id || currentUser?.id || getStoredUserId() || undefined;
  const openJobsCount = useMemo(() => jobs.filter((job) => isJobOpen(job)).length, [jobs]);
  const jobTypeOptions = useMemo(() => {
    const options = new Map<string, string>();
    jobs.forEach((job) => {
      job.job_types?.forEach((type) => {
        const normalized = normalizeToken(type);
        if (normalized) options.set(normalized, type.replace(/_/g, " "));
      });
    });
    return Array.from(options.entries()).map(([value, label]) => ({ value, label }));
  }, [jobs]);
  const locationOptions = useMemo(() => {
    const options = new Map<string, string>();
    jobs.forEach((job) => {
      const label = formatJobLocation(job.location);
      const normalized = normalizeToken(label);
      if (normalized) options.set(normalized, label);
    });
    return Array.from(options.entries()).map(([value, label]) => ({ value, label }));
  }, [jobs]);
  const salaryRangeOptions = useMemo<SalaryRangeOption[]>(() => {
    const ranges = onboardingOptions?.salary_ranges ?? [];
    return ranges.map((range) => ({
      value: String(range.id),
      label: `${range.label}${range.frequency ? ` / ${range.frequency}` : ""}`,
      min: range.min_amount ?? null,
      max: range.max_amount ?? null,
      frequency: range.frequency,
    }));
  }, [onboardingOptions]);
  const selectedSalaryRange = useMemo(
    () => salaryRangeOptions.find((range) => range.value === filters.salaryRangeId),
    [salaryRangeOptions, filters.salaryRangeId]
  );
  const hasActiveFilters = useMemo(
    () => Object.values(filters).some(Boolean),
    [filters]
  );
  const clearFilters = () => setFilters({ ...DEFAULT_JOB_FILTERS });
  const filteredJobs = useMemo(() => {
    const choreFilter = filters.choreId ? Number(filters.choreId) : null;
    const petFilter = filters.petTypeId ? Number(filters.petTypeId) : null;
    return jobs.filter((job) => {
      if (openOnly && !isJobOpen(job)) return false;
      if (filters.jobType && !job.job_types?.some((type) => normalizeToken(type) === filters.jobType)) {
        return false;
      }
      if (filters.location && normalizeToken(formatJobLocation(job.location)) !== filters.location) return false;
      if (filters.startWindow && !matchesStartWindow(job.start_date, filters.startWindow)) return false;
      if (filters.scheduleSlot && !hasScheduleSlot(job.work_schedule, filters.scheduleSlot as "morning" | "afternoon" | "evening")) {
        return false;
      }
      if (choreFilter && !toNumberArray(job.chores_ids).includes(choreFilter)) return false;
      if (petFilter && !toNumberArray(job.pet_type_ids).includes(petFilter)) return false;
      if (filters.childrenAgeRangeId && toIdString(job.children_age_range_id) !== filters.childrenAgeRangeId) return false;
      if (filters.childrenCapacityId && toIdString(job.children_capacity_id) !== filters.childrenCapacityId) return false;
      if (!matchesSalaryRange(job.salary_range, selectedSalaryRange)) return false;
      return true;
    });
  }, [jobs, openOnly, filters, selectedSalaryRange]);

  useEffect(() => {
    let cancelled = false;
    const fetchShortlisted = async () => {
      try {
        const raw = await shortlistService.listByHousehold('');
        if (cancelled) return;
        const items = extractArray<{ profile_id?: string; profile_type?: string }>(raw);
        setShortlistedJobIds(new Set(
          items
            .filter((item) => item.profile_type === 'job')
            .map((item) => item.profile_id)
            .filter((id): id is string => Boolean(id))
        ));
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
        setAppliedJobIds((prev) => {
          const next = new Set(prev);
          items.forEach((job: JobListing) => {
            if (job.has_applied) next.add(job.id);
          });
          return next;
        });
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
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loading && hasMore) {
          setOffset((prev) => prev + limit);
        }
      },
      { rootMargin: "240px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loading, hasMore]);

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
      setAppliedJobIds((prev) => new Set(prev).add(selectedJob.id));
      setSelectedJob(null);
      setPitch("");
    } catch (err: any) {
      const message = err?.message || "Failed to submit application. Please try again.";
      if (message.toLowerCase().includes("already applied")) {
        setAppliedJobIds((prev) => new Set(prev).add(selectedJob.id));
        setSuccess("You have already applied to this job.");
        setSelectedJob(null);
        setPitch("");
      } else {
        setApplyError(message);
      }
    } finally {
      setApplyLoading(false);
    }
  };

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

  const handleShortlistJob = async (job: JobListing) => {
    setShortlistLoadingId(job.id);
    const shortlisted = shortlistedJobIds.has(job.id);
    try {
      if (shortlisted) {
        await shortlistService.deleteShortlist(job.id);
        setShortlistedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(job.id);
          return next;
        });
        setSuccess("Job removed from your shortlist.");
      } else {
        await shortlistService.createShortlist('', 'househelp', {
          profile_id: job.id,
          profile_type: 'job',
        });

        setShortlistedJobIds((prev) => new Set(prev).add(job.id));
        setSuccess("Job added to your shortlist.");
      }
      window.dispatchEvent(new CustomEvent('shortlist-updated'));
    } catch (err: any) {
      setError(err?.message || "Failed to update shortlist. Please try again.");
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
      ? `/household/public-profile?userId=${encodeURIComponent(householdUserId)}&jobId=${encodeURIComponent(job.id)}&from=jobs&backTo=${encodeURIComponent(backToPath)}&backLabel=${encodeURIComponent('Back to jobs')}`
      : `/household/public-profile?profileId=${encodeURIComponent(profileId!)}&jobId=${encodeURIComponent(job.id)}&from=jobs&backTo=${encodeURIComponent(backToPath)}&backLabel=${encodeURIComponent('Back to jobs')}`;

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

            <div className="mb-6 rounded-2xl border border-purple-200/60 dark:border-purple-500/30 bg-white/80 dark:bg-[#141020]/80 p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-purple-500 dark:text-purple-300 font-semibold">Filters</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Focus on roles that match your availability and preferences.
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-purple-200/70 dark:border-purple-500/40 bg-white/70 dark:bg-white/10 p-1 shadow-inner">
                  <button
                    onClick={() => setOpenOnly(true)}
                    className={`px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wide transition ${
                      openOnly
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow"
                        : "text-purple-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-white/10"
                    }`}
                  >
                    Open roles
                  </button>
                  <button
                    onClick={() => setOpenOnly(false)}
                    className={`px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wide transition ${
                      !openOnly
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow"
                        : "text-purple-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-white/10"
                    }`}
                  >
                    All jobs
                  </button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Job type
                  <select
                    value={filters.jobType}
                    onChange={(event) => setFilters((prev) => ({ ...prev, jobType: event.target.value }))}
                    className="h-10 rounded-xl border-2 border-purple-200/70 dark:border-purple-500/30 bg-white dark:bg-[#13131a] px-3 text-xs font-medium text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  >
                    <option value="">Any job type</option>
                    {jobTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Location
                  <select
                    value={filters.location}
                    onChange={(event) => setFilters((prev) => ({ ...prev, location: event.target.value }))}
                    className="h-10 rounded-xl border-2 border-purple-200/70 dark:border-purple-500/30 bg-white dark:bg-[#13131a] px-3 text-xs font-medium text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  >
                    <option value="">Any location</option>
                    {locationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Start date
                  <select
                    value={filters.startWindow}
                    onChange={(event) => setFilters((prev) => ({ ...prev, startWindow: event.target.value }))}
                    className="h-10 rounded-xl border-2 border-purple-200/70 dark:border-purple-500/30 bg-white dark:bg-[#13131a] px-3 text-xs font-medium text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  >
                    <option value="">Any start date</option>
                    <option value="next_14">Next 2 weeks</option>
                    <option value="next_30">Next 30 days</option>
                    <option value="later">Later</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Schedule slot
                  <select
                    value={filters.scheduleSlot}
                    onChange={(event) => setFilters((prev) => ({ ...prev, scheduleSlot: event.target.value }))}
                    className="h-10 rounded-xl border-2 border-purple-200/70 dark:border-purple-500/30 bg-white dark:bg-[#13131a] px-3 text-xs font-medium text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  >
                    <option value="">Any slot</option>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Salary range
                  <select
                    value={filters.salaryRangeId}
                    onChange={(event) => setFilters((prev) => ({ ...prev, salaryRangeId: event.target.value }))}
                    className="h-10 rounded-xl border-2 border-purple-200/70 dark:border-purple-500/30 bg-white dark:bg-[#13131a] px-3 text-xs font-medium text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  >
                    <option value="">Any salary</option>
                    {salaryRangeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Chore focus
                  <select
                    value={filters.choreId}
                    onChange={(event) => setFilters((prev) => ({ ...prev, choreId: event.target.value }))}
                    className="h-10 rounded-xl border-2 border-purple-200/70 dark:border-purple-500/30 bg-white dark:bg-[#13131a] px-3 text-xs font-medium text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  >
                    <option value="">Any chores</option>
                    {onboardingOptions?.chores?.map((chore) => (
                      <option key={chore.id} value={String(chore.id)}>
                        {chore.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Pet type
                  <select
                    value={filters.petTypeId}
                    onChange={(event) => setFilters((prev) => ({ ...prev, petTypeId: event.target.value }))}
                    className="h-10 rounded-xl border-2 border-purple-200/70 dark:border-purple-500/30 bg-white dark:bg-[#13131a] px-3 text-xs font-medium text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  >
                    <option value="">Any pets</option>
                    {onboardingOptions?.pet_types?.map((pet) => (
                      <option key={pet.id} value={String(pet.id)}>
                        {pet.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Children age range
                  <select
                    value={filters.childrenAgeRangeId}
                    onChange={(event) => setFilters((prev) => ({ ...prev, childrenAgeRangeId: event.target.value }))}
                    className="h-10 rounded-xl border-2 border-purple-200/70 dark:border-purple-500/30 bg-white dark:bg-[#13131a] px-3 text-xs font-medium text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  >
                    <option value="">Any age range</option>
                    {onboardingOptions?.children_age_ranges?.map((range) => (
                      <option key={range.id} value={String(range.id)}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Children capacity
                  <select
                    value={filters.childrenCapacityId}
                    onChange={(event) => setFilters((prev) => ({ ...prev, childrenCapacityId: event.target.value }))}
                    className="h-10 rounded-xl border-2 border-purple-200/70 dark:border-purple-500/30 bg-white dark:bg-[#13131a] px-3 text-xs font-medium text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  >
                    <option value="">Any capacity</option>
                    {onboardingOptions?.children_capacities?.map((capacity) => (
                      <option key={capacity.id} value={String(capacity.id)}>
                        {capacity.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200 font-semibold">
                    {openJobsCount} open now
                  </span>
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300">
                    {jobs.length} total jobs
                  </span>
                  {hasActiveFilters && (
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200 font-semibold">
                      {filteredJobs.length} match your filters
                    </span>
                  )}
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-semibold text-purple-600 dark:text-purple-300 hover:text-purple-700 dark:hover:text-purple-200"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {error && <ErrorAlert message={error} className="mb-6" onClose={() => setError(null)} />}
            {success && <SuccessAlert message={success} className="mb-6" onClose={() => setSuccess(null)} />}

            {loading && filteredJobs.length === 0 ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="bg-white dark:bg-[#13131a] border-2 border-purple-200 dark:border-purple-500/30 rounded-2xl p-10 sm:p-14 text-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {hasActiveFilters ? "No jobs match your filters" : openOnly ? "No open jobs right now" : "No jobs available yet"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
                  {hasActiveFilters
                    ? "Try adjusting your filters or clear them to see more openings."
                    : openOnly
                      ? "Households will post new open roles soon. Check back shortly or broaden your filters."
                      : "New openings from households will appear here. Check back soon or update your profile to get matched faster."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredJobs.map((job) => {
                  const householdName = renderHouseholdName(job);
                  const shortlisted = shortlistedJobIds.has(job.id);
                  const hasApplied = appliedJobIds.has(job.id) || Boolean(job.has_applied);
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
                              onClick={() => handleShortlistJob(job)}
                              disabled={shortlistLoadingId === job.id}
                              className={`inline-flex items-center justify-center w-9 h-9 rounded-full border transition ${shortlisted
                                ? "border-pink-400 bg-pink-500 text-white"
                                : "border-purple-200/60 dark:border-purple-500/30 bg-white dark:bg-white/10 text-purple-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-500/10"} disabled:opacity-60`}
                              aria-label={shortlisted ? "Remove job from shortlist" : "Shortlist job"}
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

                      {hasApplied && (
                        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-xs font-semibold text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-200">
                          You have already applied to this job.
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-gray-400">Posted {formatTimeAgo(job.created_at)}</span>
                        <button
                          onClick={() => handleOpenApplyModal(job)}
                          disabled={!isJobOpen(job) || hasApplied}
                          className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {hasApplied ? "Applied" : "Apply"}
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
            <div ref={sentinelRef} className="h-1" />
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
