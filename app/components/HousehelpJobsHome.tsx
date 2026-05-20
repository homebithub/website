import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router";
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
import CustomSelect from "~/components/ui/CustomSelect";
import { Heart, ChevronDown, Calendar, Users, Briefcase, MapPin, ArrowRight, Search, MessageCircle, Eye, X } from "lucide-react";
import { useAuth } from "~/contexts/useAuth";
import { useSubscription } from "~/hooks/useSubscription";
import { SubscriptionRequiredModal } from "~/components/subscriptions/SubscriptionRequiredModal";

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
  fit_score?: number;
  match_reasons?: string[];
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

const HOUSEHELP_FILTERS_STORAGE_KEY = "homebit_househelp_filters_open";

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

const toTimestamp = (value?: string): number | null => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.getTime();
};

const compareNumbers = (a: number | null, b: number | null, direction: "asc" | "desc") => {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return direction === "asc" ? a - b : b - a;
};

const getJobBudgetValue = (job: JobListing): number | null => {
  const max = typeof job.salary_range?.max === "number" ? job.salary_range?.max : null;
  const min = typeof job.salary_range?.min === "number" ? job.salary_range?.min : null;
  if (max != null) return max;
  if (min != null) return min;
  return null;
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

const SAVED_PITCH_STORAGE_KEY = "homebit_househelp_saved_pitch";

const loadSavedPitchFromStorage = (): string => {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(SAVED_PITCH_STORAGE_KEY) || "";
  } catch {
    return "";
  }
};

const persistSavedPitchToStorage = (value: string) => {
  if (typeof window === "undefined") return;
  try {
    if (value) {
      window.localStorage.setItem(SAVED_PITCH_STORAGE_KEY, value);
    } else {
      window.localStorage.removeItem(SAVED_PITCH_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
};

type ResponsivenessBadge = {
  tone: "fast" | "steady" | "slow";
  label: string;
  detail?: string;
};

const RESPONSIVENESS_BADGE_STYLES: Record<ResponsivenessBadge["tone"], string> = {
  fast: "bg-emerald-50 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/30",
  steady: "bg-blue-50 text-blue-700 border border-blue-200/70 dark:bg-blue-500/10 dark:text-blue-200 dark:border-blue-500/30",
  slow: "bg-amber-50 text-amber-700 border border-amber-200/70 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/30",
};

const toNumericMetric = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const minutesSince = (value?: string): number | null => {
  if (!value) return null;
  const ts = Date.parse(value);
  if (Number.isNaN(ts)) return null;
  return Math.max(0, Math.round((Date.now() - ts) / 60000));
};

const describeResponseRate = (rate: number) => `${Math.round(rate * 100)}% response rate`;
const describeAvgMinutes = (minutes: number) => {
  if (minutes < 60) return `~${Math.max(1, Math.round(minutes))} min avg reply`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `~${hours} hr response`;
  const days = Math.round(hours / 24);
  return `~${Math.max(1, days)} day response`;
};
const describeActivity = (minutes: number) => {
  if (minutes < 60) return "Active this hour";
  if (minutes < 360) return "Active today";
  if (minutes < 1440) return "Active this week";
  const days = Math.floor(minutes / 1440);
  return days <= 14 ? `Active ${days}d ago` : `Inactive ${days}d`;
};

const deriveHouseholdResponsivenessBadge = (profile?: HouseholdProfileLike | null): ResponsivenessBadge | null => {
  if (!profile) return null;
  const anyProfile = profile as Record<string, any>;
  const responseRate = toNumericMetric(anyProfile?.response_rate ?? anyProfile?.responseRate);
  const avgMinutes = toNumericMetric(
    anyProfile?.average_response_minutes ?? anyProfile?.avg_response_minutes ?? anyProfile?.response_minutes_avg,
  );
  const lastActiveMinutes = minutesSince(
    (anyProfile?.last_active_at as string) ?? anyProfile?.lastActiveAt ?? anyProfile?.updated_at ?? anyProfile?.updatedAt,
  );

  if (responseRate != null) {
    if (responseRate >= 0.85) return { tone: "fast", label: "Replies super fast", detail: describeResponseRate(responseRate) };
    if (responseRate >= 0.6) return { tone: "steady", label: "Usually replies", detail: describeResponseRate(responseRate) };
    return { tone: "slow", label: "Limited reply data", detail: describeResponseRate(responseRate) };
  }

  if (avgMinutes != null) {
    if (avgMinutes <= 60) return { tone: "fast", label: "Replies in under 1h", detail: describeAvgMinutes(avgMinutes) };
    if (avgMinutes <= 240) return { tone: "steady", label: "Replies same day", detail: describeAvgMinutes(avgMinutes) };
    return { tone: "slow", label: "Replies in a day+", detail: describeAvgMinutes(avgMinutes) };
  }

  if (lastActiveMinutes != null) {
    if (lastActiveMinutes <= 180) return { tone: "fast", label: "Active recently", detail: describeActivity(lastActiveMinutes) };
    if (lastActiveMinutes <= 1440) return { tone: "steady", label: "Active this week", detail: describeActivity(lastActiveMinutes) };
    return { tone: "slow", label: "Quiet lately", detail: describeActivity(lastActiveMinutes) };
  }

  const rating = toNumericMetric(anyProfile?.rating);
  const reviewCount = toNumericMetric(anyProfile?.review_count);
  if (rating != null && reviewCount != null && rating >= 4 && reviewCount >= 3) {
    return { tone: "steady", label: "Highly rated household", detail: `${rating.toFixed(1)}★ • ${reviewCount} reviews` };
  }

  return null;
};

export default function HousehelpJobsHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser } = useAuth();
  const memoizedStoredUser = useMemo(() => getStoredUser(), []);
  const resolvedUser = (authUser as any)?.user ?? memoizedStoredUser ?? null;
  const currentUserId: string | undefined = resolvedUser?.user_id || resolvedUser?.id || getStoredUserId() || undefined;
  const plansHref = useMemo(() => `/pricing?return=${encodeURIComponent(location.pathname)}`, [location.pathname]);
  const {
    isActive: hasActiveSubscription,
    status: subscriptionStatus,
    loading: subscriptionLoading,
  } = useSubscription(currentUserId);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [subscriptionActionLabel, setSubscriptionActionLabel] = useState("continue");
  const [previewProfileJob, setPreviewProfileJob] = useState<JobListing | null>(null);

  const openSubscriptionGate = useCallback((actionLabel: string) => {
    setSubscriptionActionLabel(actionLabel);
    setSubscriptionModalOpen(true);
  }, []);

  const requireSubscription = useCallback(
    (actionLabel: string) => {
      if (hasActiveSubscription || subscriptionLoading) {
        return false;
      }
      openSubscriptionGate(actionLabel);
      return true;
    },
    [hasActiveSubscription, subscriptionLoading, openSubscriptionGate]
  );

  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [househelpProfileId, setHousehelpProfileId] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [selectedJobDetail, setSelectedJobDetail] = useState<JobListing | null>(null);
  const [pitch, setPitch] = useState(loadSavedPitchFromStorage());
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [householdProfiles, setHouseholdProfiles] = useState<Record<string, HouseholdProfileLike | null>>({});
  const renderHouseholdName = useCallback((job: JobListing) => {
    const profileId = job.household_id;
    const profile = profileId ? householdProfiles[profileId] : null;
    return profile?.display_name || profile?.household_name || profile?.name || null;
  }, [householdProfiles]);
  const buildTemplatePitch = useCallback((job: JobListing, variant: "experience" | "availability") => {
    const householdName = renderHouseholdName(job) || "there";
    const jobType = job.job_types?.[0]?.replace(/_/g, " ") || job.title || "this role";
    const startWindow = formatDate(job.start_date);
    if (variant === "experience") {
      const choresFocus = (job.chores_ids?.length ?? 0) > 0 ? "similar chores" : "household routines";
      return `Hi ${householdName},\n\nI have hands-on experience handling ${choresFocus} and can bring a calm, reliable presence to your home. I'd love to support you as a ${jobType} and can share references if helpful.\n\nThanks for considering me!`;
    }
    return `Hello ${householdName},\n\nI noticed you're looking for help as soon as ${startWindow}. I'm currently available, flexible with schedules, and comfortable aligning with your family's routines. Let me know if you'd like to chat further or schedule a quick call.\n\nWarmly,`;
  }, [renderHouseholdName]);
  const [shortlistedJobIds, setShortlistedJobIds] = useState<Set<string>>(() => new Set());
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(() => new Set());
  const [chatLoadingId, setChatLoadingId] = useState<string | null>(null);
  const [shortlistLoadingId, setShortlistLoadingId] = useState<string | null>(null);
  const [openOnly, setOpenOnly] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(() => ({ ...DEFAULT_JOB_FILTERS }));
  const [sortBy, setSortBy] = useState("best_match");
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const limit = 12;
  const backToPath = "/househelp/jobs";

  const { options: onboardingOptions } = useOnboardingOptions("household");
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
  const sortedJobs = useMemo(() => {
    if (!sortBy) return filteredJobs;
    const items = [...filteredJobs];
    switch (sortBy) {
      case "best_match":
        items.sort((a, b) => compareNumbers(a.fit_score ?? null, b.fit_score ?? null, "desc"));
        break;
      case "budget_desc":
        items.sort((a, b) => compareNumbers(getJobBudgetValue(a), getJobBudgetValue(b), "desc"));
        break;
      case "budget_asc":
        items.sort((a, b) => compareNumbers(getJobBudgetValue(a), getJobBudgetValue(b), "asc"));
        break;
      case "created_asc":
        items.sort((a, b) => compareNumbers(toTimestamp(a.created_at), toTimestamp(b.created_at), "asc"));
        break;
      case "created_desc":
      case "default":
      default:
        items.sort((a, b) => compareNumbers(toTimestamp(a.created_at), toTimestamp(b.created_at), "desc"));
        break;
    }
    return items;
  }, [filteredJobs, sortBy]);

  const topMatches = useMemo(() => (
    [...jobs]
      .filter((job) => isJobOpen(job) && (job.fit_score ?? 0) > 0)
      .sort((a, b) => compareNumbers(a.fit_score ?? null, b.fit_score ?? null, "desc"))
      .slice(0, 6)
  ), [jobs]);

  const searchKey = useMemo(
    () => JSON.stringify({ filters, openOnly, sortBy, salaryRangeId: filters.salaryRangeId }),
    [filters, openOnly, sortBy]
  );

  useEffect(() => {
    setOffset(0);
    setHasMore(true);
    setJobs([]);
  }, [searchKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(HOUSEHELP_FILTERS_STORAGE_KEY);
    if (stored !== null) {
      setFiltersOpen(stored === "true");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(HOUSEHELP_FILTERS_STORAGE_KEY, String(filtersOpen));
  }, [filtersOpen]);

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
        const payload: Record<string, any> = {
          limit,
          offset,
        };
        if (openOnly) payload.status = "open";
        if (filters.jobType) payload.job_types = filters.jobType;
        if (filters.location) payload.location = filters.location;
        if (filters.choreId) payload.chores_ids = [Number(filters.choreId)];
        if (filters.petTypeId) payload.pet_type_ids = [Number(filters.petTypeId)];
        if (filters.childrenAgeRangeId) payload.children_age_range_id = Number(filters.childrenAgeRangeId);
        if (filters.childrenCapacityId) payload.children_capacity_id = Number(filters.childrenCapacityId);
        if (selectedSalaryRange?.min != null) payload.salary_min = selectedSalaryRange.min;
        if (selectedSalaryRange?.max != null) payload.salary_max = selectedSalaryRange.max;
        if (selectedSalaryRange?.frequency) payload.salary_frequency = selectedSalaryRange.frequency;
        if (filters.startWindow) {
          const now = new Date();
          const addDays = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
          if (filters.startWindow === "next_14") payload.start_date_to = addDays(14);
          if (filters.startWindow === "next_30") payload.start_date_to = addDays(30);
          if (filters.startWindow === "later") payload.start_date_from = addDays(30);
        }
        if (sortBy === "best_match") payload.sort = "best_match";

        const raw = await jobService.searchJobs(payload, currentUserId);
        const data = raw?.data || raw || {};
        const items = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
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
  }, [offset, searchKey, selectedSalaryRange, currentUserId]);

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

  const handleOpenApplyModal = (job: JobListing, options?: { template?: "experience" | "availability" }) => {
    if (requireSubscription("apply to jobs")) {
      return;
    }
    setSelectedJob(job);
    if (options?.template) {
      const template = buildTemplatePitch(job, options.template);
      setPitch(template);
    } else {
      setPitch(loadSavedPitchFromStorage());
    }
    setApplyError(null);
  };

  const handleOpenJobDetail = (job: JobListing) => {
    setSelectedJobDetail(job);
  };

  const handleCloseJobDetail = () => {
    setSelectedJobDetail(null);
  };

  const handleCloseApplyModal = () => {
    if (applyLoading) return;
    setSelectedJob(null);
    setApplyError(null);
  };

  const buildQuickPitch = (job: JobListing) => {
    const householdName = renderHouseholdName(job) || "your household";
    const jobType = job.job_types?.[0]?.replace(/_/g, " ") || "this role";
    return `Hi ${householdName},\n\nI'm interested in ${jobType}. I have experience with similar households and can start ${formatDate(job.start_date)}. Happy to share more details or answer any questions.\n\nThank you!`;
  };

  const handleUseQuickPitch = () => {
    if (!selectedJob) return;
    setPitch(buildQuickPitch(selectedJob));
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

      persistSavedPitchToStorage(pitch);
      setSuccess("Application submitted successfully.");
      setAppliedJobIds((prev) => new Set(prev).add(selectedJob.id));
      setSelectedJob(null);
      setPitch("");
    } catch (err: any) {
      const message = err?.message || "Failed to submit application. Please try again.";
      if (message.toLowerCase().includes("already applied")) {
        setAppliedJobIds((prev) => new Set(prev).add(selectedJob.id));
        persistSavedPitchToStorage(pitch);
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
    if (requireSubscription("message households")) {
      return;
    }
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
    if (requireSubscription("view full household profiles")) {
      setPreviewProfileJob(job);
      return;
    }

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

            {topMatches.length > 0 && (
              <section className="mb-8">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-purple-500 dark:text-purple-300 font-semibold">Top matches</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Curated roles based on your profile.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{topMatches.length} roles</span>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-gray-500 dark:text-gray-300">Quick apply:</span>
                      <button
                        type="button"
                        onClick={() => topMatches[0] && handleOpenApplyModal(topMatches[0], { template: "experience" })}
                        className="px-3 py-1 rounded-full border border-purple-200/70 dark:border-purple-500/30 text-purple-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-500/10"
                      >
                        Experience
                      </button>
                      <button
                        type="button"
                        onClick={() => topMatches[0] && handleOpenApplyModal(topMatches[0], { template: "availability" })}
                        className="px-3 py-1 rounded-full border border-purple-200/70 dark:border-purple-500/30 text-purple-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-500/10"
                      >
                        Availability
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {topMatches.map((job) => {
                    const householdProfile = job.household_id ? householdProfiles[job.household_id] : null;
                    const responseBadge = deriveHouseholdResponsivenessBadge(householdProfile);
                    return (
                      <button
                        key={job.id}
                        type="button"
                        onClick={() => handleOpenJobDetail(job)}
                        className="min-w-[240px] max-w-[280px] text-left rounded-2xl border border-purple-200/60 dark:border-purple-500/30 bg-white/90 dark:bg-[#151025]/80 p-4 shadow-sm hover:shadow-lg transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
                              Match {job.fit_score}%
                            </p>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-1 line-clamp-2">
                              {job.title || "Household Job"}
                            </h3>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${isJobOpen(job)
                              ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200"
                              : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"}`}
                          >
                            {isJobOpen(job) ? "Open" : "Closed"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">📍 {formatJobLocation(job.location)}</p>
                        {job.match_reasons && job.match_reasons.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {job.match_reasons.slice(0, 2).map((reason) => (
                              <span
                                key={reason}
                                className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] dark:bg-emerald-500/10 dark:text-emerald-200"
                              >
                                {reason}
                              </span>
                            ))}
                          </div>
                        )}
                        {responseBadge && (
                          <div className="mt-2 space-y-1 text-left">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${RESPONSIVENESS_BADGE_STYLES[responseBadge.tone]}`}>
                              {responseBadge.label}
                            </span>
                            {responseBadge.detail && (
                              <p className="text-[11px] text-gray-500 dark:text-gray-400">{responseBadge.detail}</p>
                            )}
                          </div>
                        )}
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-semibold">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleOpenApplyModal(job, { template: "experience" });
                          }}
                          className="rounded-xl border border-green-200/60 dark:border-green-500/30 text-green-700 dark:text-green-200 px-3 py-1 hover:bg-green-50 dark:hover:bg-green-500/10"
                        >
                          Quick apply
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleOpenApplyModal(job, { template: "availability" });
                          }}
                          className="rounded-xl border border-purple-200/60 dark:border-purple-500/30 text-purple-700 dark:text-purple-200 px-3 py-1 hover:bg-purple-50 dark:hover:bg-purple-500/10"
                        >
                          Fast pitch
                        </button>
                      </div>
                    </button>
                    );
                  })}
                </div>
              </section>
            )}

            <div className="mb-4 rounded-2xl border border-purple-200/60 dark:border-purple-500/30 bg-white/80 dark:bg-[#141020]/80 shadow-sm">
              <button
                type="button"
                onClick={() => setFiltersOpen((prev) => !prev)}
                className="w-full flex flex-wrap items-center justify-between gap-4 px-5 py-4"
              >
                <div className="text-left">
                  <p className="text-xs uppercase tracking-[0.2em] text-purple-500 dark:text-purple-300 font-semibold">Filters</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Focus on roles that match your availability and preferences.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full border border-purple-200/70 dark:border-purple-500/40 bg-white/70 dark:bg-white/10 p-1 shadow-inner">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenOnly(true);
                      }}
                      className={`px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wide transition ${
                        openOnly
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow"
                          : "text-purple-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-white/10"
                      }`}
                    >
                      Open roles
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setOpenOnly(false);
                      }}
                      className={`px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wide transition ${
                        !openOnly
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow"
                          : "text-purple-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-white/10"
                      }`}
                    >
                      All jobs
                    </button>
                  </div>
                  <span
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-purple-200/70 dark:border-purple-500/40 bg-white/80 dark:bg-white/10 text-purple-600 dark:text-purple-200 transition ${
                      filtersOpen ? "rotate-180" : ""
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </div>
              </button>

              {filtersOpen && (
                <div className="border-t border-purple-100/70 dark:border-purple-500/20 px-5 pb-5">
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Job type
                      <CustomSelect
                        value={filters.jobType}
                        onChange={(value) => setFilters((prev) => ({ ...prev, jobType: value }))}
                        options={[
                          { value: "", label: "Any job type" },
                          ...jobTypeOptions.map((option) => ({ value: option.value, label: option.label })),
                        ]}
                        className="w-full"
                        size="sm"
                        placeholder="Any job type"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Location
                      <CustomSelect
                        value={filters.location}
                        onChange={(value) => setFilters((prev) => ({ ...prev, location: value }))}
                        options={[
                          { value: "", label: "Any location" },
                          ...locationOptions.map((option) => ({ value: option.value, label: option.label })),
                        ]}
                        className="w-full"
                        size="sm"
                        placeholder="Any location"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Start date
                      <CustomSelect
                        value={filters.startWindow}
                        onChange={(value) => setFilters((prev) => ({ ...prev, startWindow: value }))}
                        options={[
                          { value: "", label: "Any start date" },
                          { value: "next_14", label: "Next 2 weeks" },
                          { value: "next_30", label: "Next 30 days" },
                          { value: "later", label: "Later" },
                          { value: "flexible", label: "Flexible" },
                        ]}
                        className="w-full"
                        size="sm"
                        placeholder="Any start date"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Schedule slot
                      <CustomSelect
                        value={filters.scheduleSlot}
                        onChange={(value) => setFilters((prev) => ({ ...prev, scheduleSlot: value }))}
                        options={[
                          { value: "", label: "Any slot" },
                          { value: "morning", label: "Morning" },
                          { value: "afternoon", label: "Afternoon" },
                          { value: "evening", label: "Evening" },
                        ]}
                        className="w-full"
                        size="sm"
                        placeholder="Any slot"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Salary range
                      <CustomSelect
                        value={filters.salaryRangeId}
                        onChange={(value) => setFilters((prev) => ({ ...prev, salaryRangeId: value }))}
                        options={[
                          { value: "", label: "Any salary" },
                          ...salaryRangeOptions.map((option) => ({ value: option.value, label: option.label })),
                        ]}
                        className="w-full"
                        size="sm"
                        placeholder="Any salary"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Chore focus
                      <CustomSelect
                        value={filters.choreId}
                        onChange={(value) => setFilters((prev) => ({ ...prev, choreId: value }))}
                        options={[
                          { value: "", label: "Any chores" },
                          ...(onboardingOptions?.chores?.map((chore) => ({ value: String(chore.id), label: chore.name })) ?? []),
                        ]}
                        className="w-full"
                        size="sm"
                        placeholder="Any chores"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Pet type
                      <CustomSelect
                        value={filters.petTypeId}
                        onChange={(value) => setFilters((prev) => ({ ...prev, petTypeId: value }))}
                        options={[
                          { value: "", label: "Any pets" },
                          ...(onboardingOptions?.pet_types?.map((pet) => ({ value: String(pet.id), label: pet.name })) ?? []),
                        ]}
                        className="w-full"
                        size="sm"
                        placeholder="Any pets"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Children age range
                      <CustomSelect
                        value={filters.childrenAgeRangeId}
                        onChange={(value) => setFilters((prev) => ({ ...prev, childrenAgeRangeId: value }))}
                        options={[
                          { value: "", label: "Any age range" },
                          ...(onboardingOptions?.children_age_ranges?.map((range) => ({ value: String(range.id), label: range.label })) ?? []),
                        ]}
                        className="w-full"
                        size="sm"
                        placeholder="Any age range"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Children capacity
                      <CustomSelect
                        value={filters.childrenCapacityId}
                        onChange={(value) => setFilters((prev) => ({ ...prev, childrenCapacityId: value }))}
                        options={[
                          { value: "", label: "Any capacity" },
                          ...(onboardingOptions?.children_capacities?.map((capacity) => ({ value: String(capacity.id), label: capacity.label })) ?? []),
                        ]}
                        className="w-full"
                        size="sm"
                        placeholder="Any capacity"
                      />
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
              )}
            </div>

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple-200/60 dark:border-purple-500/30 bg-white/70 dark:bg-[#141020]/70 px-5 py-4 text-xs shadow-sm">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-purple-500 dark:text-purple-300 font-semibold">Sort by</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Prioritize roles by budget or newest listings.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Order
                  <CustomSelect
                    value={sortBy}
                    onChange={(value) => setSortBy(value)}
                    options={[
                      { value: "best_match", label: "Best match" },
                      { value: "default", label: "Newest first" },
                      { value: "created_asc", label: "Oldest first" },
                      { value: "budget_desc", label: "Budget high to low" },
                      { value: "budget_asc", label: "Budget low to high" },
                    ]}
                    className="min-w-[220px]"
                    size="sm"
                    placeholder="Newest first"
                  />
                  {sortBy !== "default" && (
                    <button
                      type="button"
                      onClick={() => setSortBy("default")}
                      className="text-[11px] font-semibold text-purple-600 dark:text-purple-300 hover:text-purple-700 dark:hover:text-purple-200"
                    >
                      Clear sort
                    </button>
                  )}
                </label>
              </div>
            </div>

            {error && <ErrorAlert message={error} className="mb-6" onClose={() => setError(null)} />}
            {success && <SuccessAlert message={success} className="mb-6" onClose={() => setSuccess(null)} />}

            {loading && sortedJobs.length === 0 ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
              </div>
            ) : sortedJobs.length === 0 ? (
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
                {sortedJobs.map((job) => {
                  const householdName = renderHouseholdName(job);
                  const shortlisted = shortlistedJobIds.has(job.id);
                  const hasApplied = appliedJobIds.has(job.id) || Boolean(job.has_applied);
                  const householdProfile = job.household_id ? householdProfiles[job.household_id] : null;
                  const responseBadge = deriveHouseholdResponsivenessBadge(householdProfile);
                  return (
                    <div
                      key={job.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleOpenJobDetail(job)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleOpenJobDetail(job);
                        }
                      }}
                      className="bg-white dark:bg-[#13131a] rounded-2xl border-2 border-purple-200/40 dark:border-purple-500/30 p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-400"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{job.title || "Household Job"}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">📍 {formatJobLocation(job.location)}</p>
                          {householdName && (
                            <p className="mt-1 text-xs font-semibold text-purple-600 dark:text-purple-300">Hosted by {householdName}</p>
                          )}
                          {responseBadge && (
                            <div className="mt-2 space-y-1">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold ${RESPONSIVENESS_BADGE_STYLES[responseBadge.tone]}`}>
                                {responseBadge.label}
                              </span>
                              {responseBadge.detail && (
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">{responseBadge.detail}</p>
                              )}
                            </div>
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
                              onClick={(event) => {
                                event.stopPropagation();
                                handleChatWithHousehold(job);
                              }}
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
                              onClick={(event) => {
                                event.stopPropagation();
                                handleShortlistJob(job);
                              }}
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
                              onClick={(event) => {
                                event.stopPropagation();
                                handleViewProfile(job);
                              }}
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
                        {typeof job.fit_score === "number" && job.fit_score > 0 && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                            Match {job.fit_score}%
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

                      {job.match_reasons && job.match_reasons.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {job.match_reasons.slice(0, 3).map((reason) => (
                            <span
                              key={reason}
                              className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] dark:bg-emerald-500/10 dark:text-emerald-200"
                            >
                              {reason}
                            </span>
                          ))}
                        </div>
                      )}

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
                        <div className="flex gap-2 flex-wrap justify-end">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleShortlistJob(job);
                            }}
                            disabled={shortlistLoadingId === job.id}
                            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition ${
                              shortlisted
                                ? "border-pink-400 bg-pink-500 text-white"
                                : "border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-500/40 dark:text-purple-200 dark:hover:bg-purple-500/10"
                            } disabled:opacity-60`}
                          >
                            {shortlistLoadingId === job.id
                              ? "Updating..."
                              : shortlisted
                                ? "Shortlisted"
                                : "Shortlist"}
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleOpenApplyModal(job);
                            }}
                            disabled={!isJobOpen(job) || hasApplied}
                            className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {hasApplied ? "Applied" : "Apply"}
                          </button>
                        </div>
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

      {previewProfileJob && (() => {
        const profile = previewProfileJob.household_id ? householdProfiles[previewProfileJob.household_id] : null;
        const profileData = (profile ?? {}) as Record<string, any>;
        const householdName = profile?.display_name || profile?.household_name || profile?.name || profileData["display_name"] || "Verified household";
        const shortName = householdName.split(" ")[0] || householdName;
        const locationLabel = formatJobLocation((profileData["location"] as string | JobLocation | undefined) || previewProfileJob.location);
        const lifestyle = (profileData["household_type"] as string | undefined) || (profileData["vibe"] as string | undefined) || "Family-focused";
        const maskedDetails = [
          {
            label: "Household bio",
            value: (profileData["about"] as string | undefined) || "Stories, routines, and preferences unlocked with any plan.",
          },
          {
            label: "Contact info",
            value: "Phone, WhatsApp, and chat access are hidden until you subscribe.",
          },
          {
            label: "Exact location",
            value: `${locationLabel} • Full neighborhood & directions hidden`,
          },
        ];

        const renderMaskedDetail = (detail: { label: string; value: string }, index: number) => (
          <div key={`${detail.label}-${index}`} className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">{detail.label}</p>
            <div className="relative overflow-hidden rounded-2xl border border-purple-100/60 dark:border-white/10 bg-white/80 dark:bg-white/5 px-4 py-3 shadow-inner">
              <p className="text-sm font-semibold text-gray-900 dark:text-white relative z-10">{detail.value}</p>
              <div className="absolute inset-0 backdrop-blur-[3px] bg-gradient-to-r from-purple-500/30 via-pink-500/20 to-purple-600/30 opacity-80" aria-hidden="true" />
              <span className="absolute top-2 right-3 text-[10px] font-semibold uppercase tracking-[0.4em] text-white/80">Locked</span>
            </div>
          </div>
        );

        return (
          <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPreviewProfileJob(null)} />
            <div className="relative w-full sm:max-w-xl bg-white dark:bg-[#1b1524] rounded-t-3xl sm:rounded-3xl border border-purple-200/60 dark:border-purple-700/30 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-purple-500 dark:text-purple-300 font-semibold">Limited profile preview</p>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{shortName}&apos;s household</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{locationLabel}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-300 mt-2">Lifestyle hint: {lifestyle}</p>
                  <p className="text-xs text-gray-400 mt-2">Subscribe to reveal verified contact details, reviews, and trust badges.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewProfileJob(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  aria-label="Close household preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4">
                {maskedDetails.map(renderMaskedDetail)}
              </div>

              <div className="mt-6 rounded-2xl border border-purple-200/60 dark:border-purple-500/30 bg-purple-50/80 dark:bg-purple-900/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-600 dark:text-purple-200">What you unlock</p>
                <ul className="mt-3 text-sm text-purple-900 dark:text-purple-100 space-y-2">
                  <li>✔️ Full household bio, routines, and amenities</li>
                  <li>✔️ Direct chat + phone access</li>
                  <li>✔️ Reviews, verification badges, and trust score</li>
                </ul>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewProfileJob(null);
                    openSubscriptionGate("view full household profiles");
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold shadow-lg shadow-purple-500/30 hover:from-purple-700 hover:to-pink-700"
                >
                  Unlock full profile
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewProfileJob(null)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {selectedJobDetail && (() => {
        const shortlisted = shortlistedJobIds.has(selectedJobDetail.id);
        const hasApplied = appliedJobIds.has(selectedJobDetail.id) || Boolean(selectedJobDetail.has_applied);
        const scheduleSlots = [
          hasScheduleSlot(selectedJobDetail.work_schedule, "morning") && "Morning",
          hasScheduleSlot(selectedJobDetail.work_schedule, "afternoon") && "Afternoon",
          hasScheduleSlot(selectedJobDetail.work_schedule, "evening") && "Evening",
        ].filter(Boolean) as string[];
        const householdProfile = selectedJobDetail.household_id ? householdProfiles[selectedJobDetail.household_id] : null;
        const responseBadge = deriveHouseholdResponsivenessBadge(householdProfile);

        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseJobDetail} />
            <div className="relative w-full sm:max-w-2xl bg-white dark:bg-[#1b1524] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-purple-200/50 dark:border-purple-700/40 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-purple-500 dark:text-purple-300 font-semibold">Job opening</p>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedJobDetail.title || "Household Job"}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">📍 {formatJobLocation(selectedJobDetail.location)}</p>
                  {responseBadge && (
                    <div className="mt-3 space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${RESPONSIVENESS_BADGE_STYLES[responseBadge.tone]}`}>
                        {responseBadge.label}
                      </span>
                      {responseBadge.detail && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{responseBadge.detail}</p>
                      )}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleCloseJobDetail}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Close details"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {selectedJobDetail.description && (
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                  {selectedJobDetail.description}
                </p>
              )}

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Salary</p>
                  <p className="mt-1">{formatSalaryRange(selectedJobDetail.salary_range)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Start date</p>
                  <p className="mt-1">{formatDate(selectedJobDetail.start_date)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Status</p>
                  <p className="mt-1 capitalize">{selectedJobDetail.status || "open"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Posted</p>
                  <p className="mt-1">{formatTimeAgo(selectedJobDetail.created_at)}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {(selectedJobDetail.job_types || []).length > 0 ? (
                  selectedJobDetail.job_types?.map((type) => (
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
                {scheduleSlots.map((slot) => (
                  <span
                    key={slot}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200"
                  >
                    {slot}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => handleViewProfile(selectedJobDetail)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-500/40 dark:text-purple-200 dark:hover:bg-purple-500/10"
                >
                  View Profile
                </button>
                <button
                  onClick={() => handleChatWithHousehold(selectedJobDetail)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                >
                  Message
                </button>
                <button
                  onClick={() => handleShortlistJob(selectedJobDetail)}
                  disabled={shortlistLoadingId === selectedJobDetail.id}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl border transition ${
                    shortlisted
                      ? "border-pink-400 bg-pink-500 text-white"
                      : "border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-500/40 dark:text-purple-200 dark:hover:bg-purple-500/10"
                  } disabled:opacity-60`}
                >
                  {shortlistLoadingId === selectedJobDetail.id
                    ? "Updating..."
                    : shortlisted
                      ? "Shortlisted"
                      : "Shortlist"}
                </button>
                <button
                  onClick={() => {
                    handleOpenApplyModal(selectedJobDetail);
                    handleCloseJobDetail();
                  }}
                  disabled={!isJobOpen(selectedJobDetail) || hasApplied}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {hasApplied ? "Applied" : "Apply"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-purple-600 dark:text-purple-300">Pitch (optional)</label>
                  <button
                    type="button"
                    onClick={handleUseQuickPitch}
                    className="text-[11px] font-semibold text-purple-600 dark:text-purple-300 hover:text-purple-700 dark:hover:text-purple-200"
                  >
                    Use quick pitch
                  </button>
                </div>
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
                  onClick={handleUseQuickPitch}
                  className="px-4 py-2 rounded-xl border border-green-200/70 text-green-700 text-xs font-semibold hover:bg-green-50 dark:border-green-500/30 dark:text-green-200 dark:hover:bg-green-500/10 transition"
                >
                  Use quick pitch
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedJob) return;
                    setPitch(buildTemplatePitch(selectedJob, "experience"));
                  }}
                  className="px-4 py-2 rounded-xl border border-purple-200/70 text-purple-700 text-xs font-semibold hover:bg-purple-50 dark:border-purple-500/30 dark:text-purple-200 dark:hover:bg-purple-500/10 transition"
                >
                  Experience template
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!selectedJob) return;
                    setPitch(buildTemplatePitch(selectedJob, "availability"));
                  }}
                  className="px-4 py-2 rounded-xl border border-blue-200/70 text-blue-700 text-xs font-semibold hover:bg-blue-50 dark:border-blue-500/30 dark:text-blue-200 dark:hover:bg-blue-500/10 transition"
                >
                  Availability template
                </button>
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

      <SubscriptionRequiredModal
        open={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        status={subscriptionStatus}
        actionLabel={subscriptionActionLabel}
        plansHref={plansHref}
      />
    </div>
  );
}
