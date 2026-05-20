import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { openForWorkService, shortlistService, profileService as grpcProfileService } from "~/services/grpc/authServices";
import { notificationsService } from "~/services/grpc/notifications.service";
import { OptimizedImage } from "~/components/ui/OptimizedImage";
import { useProfilePhotos } from "~/hooks/useProfilePhotos";
import { getStoredUserId } from "~/utils/authStorage";
import { useSubscription } from "~/hooks/useSubscription";
import { SubscriptionRequiredModal } from "~/components/subscriptions/SubscriptionRequiredModal";
import { NOTIFICATIONS_API_BASE_URL } from "~/config/api";
import { getInboxRoute, startOrGetConversation, type StartConversationPayload } from "~/utils/conversationLauncher";
import { ErrorAlert } from "~/components/ui/ErrorAlert";
import { SuccessAlert } from "~/components/ui/SuccessAlert";
import { formatTimeAgo } from "~/utils/timeAgo";
import { normalizeOnboardingAmountFromStorage } from "~/utils/onboardingCompensation";
import { useOnboardingOptions } from "~/hooks/useOnboardingOptions";
import CustomSelect from "~/components/ui/CustomSelect";
import { Heart, ChevronDown, X } from "lucide-react";

interface HousehelpSummary {
  id?: string;
  user_id?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  photos?: string[];
  town?: string;
  location?: string | Record<string, any>;
  years_of_experience?: number;
  salary_expectation?: number;
  salary_frequency?: string;
  user?: {
    id?: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
  rating?: number;
  review_count?: number;
  completed_jobs?: number;
  response_rate?: number;
  responseRate?: number;
  average_response_minutes?: number;
  avg_response_minutes?: number;
  response_minutes_avg?: number;
  last_active_at?: string;
  lastActiveAt?: string;
}

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

const toRecord = (value: unknown): Record<string, any> | null => (
  value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, any> : null
);

const formatTextValue = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  const record = toRecord(value);
  if (record) {
    return (
      formatTextValue(record.name) ||
      formatTextValue(record.place) ||
      formatTextValue(record.town) ||
      formatTextValue(record.label) ||
      formatTextValue(record.display_name) ||
      formatTextValue(record.title) ||
      fallback
    );
  }
  return fallback;
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.map((item) => formatTextValue(item)).filter(Boolean);
};

const firstString = (...values: unknown[]): string => {
  for (const value of values) {
    const text = formatTextValue(value);
    if (text) return text;
  }
  return "";
};

interface OpenForWorkListing {
  id: string;
  job_types?: string[];
  available_from?: string;
  work_schedule?: Record<string, { morning?: boolean; afternoon?: boolean; evening?: boolean }>;
  chores_ids?: number[] | string[];
  pet_type_ids?: number[] | string[];
  children_age_range_id?: number | string;
  children_capacity_id?: number | string;
  can_work_with_kids?: boolean;
  can_work_with_pets?: boolean;
  status?: string;
  created_at?: string;
  salary_min?: number;
  salary_max?: number;
  salary_frequency?: string;
  fit_score?: number;
  match_reasons?: string[];
  househelp?: HousehelpSummary;
}

type SalaryRangeOption = {
  value: string;
  label: string;
  min: number | null;
  max: number | null;
  frequency?: string;
};

const DEFAULT_OPEN_FOR_WORK_FILTERS = {
  jobType: "",
  availabilityWindow: "",
  scheduleSlot: "",
  salaryRangeId: "",
  choreId: "",
  petTypeId: "",
  childrenAgeRangeId: "",
  childrenCapacityId: "",
  canWorkWithKids: "",
  canWorkWithPets: "",
};

const HOUSEHOLD_FILTERS_STORAGE_KEY = "homebit_household_filters_open";

const SAVED_INVITE_STORAGE_KEY = "homebit_household_invite_message";

const loadSavedInviteMessage = (): string => {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(SAVED_INVITE_STORAGE_KEY) || "";
  } catch {
    return "";
  }
};

const persistSavedInviteMessage = (value: string) => {
  if (typeof window === "undefined") return;
  try {
    if (value) {
      window.localStorage.setItem(SAVED_INVITE_STORAGE_KEY, value);
    } else {
      window.localStorage.removeItem(SAVED_INVITE_STORAGE_KEY);
    }
  } catch {
    // ignore storage issues
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

const deriveHousehelpResponsivenessBadge = (househelp?: HousehelpSummary): ResponsivenessBadge | null => {
  if (!househelp) return null;
  const responseRate = toNumericMetric((househelp as any)?.response_rate ?? (househelp as any)?.responseRate);
  const avgMinutes = toNumericMetric(
    (househelp as any)?.average_response_minutes ?? (househelp as any)?.avg_response_minutes ?? (househelp as any)?.response_minutes_avg,
  );
  const lastActiveMinutes = minutesSince((househelp as any)?.last_active_at ?? (househelp as any)?.lastActiveAt);

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

  const rating = toNumericMetric(househelp.rating);
  const reviewCount = toNumericMetric(househelp.review_count);
  if (rating != null && reviewCount != null && rating >= 4 && reviewCount >= 3) {
    return { tone: "steady", label: "Highly rated", detail: `${rating.toFixed(1)}★ • ${reviewCount} reviews` };
  }

  return null;
};

const formatDate = (value?: string) => {
  if (!value) return "Flexible";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime()) || parsed.getFullYear() < 1900) return "Flexible";
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const toFiniteNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const hasScheduleSlot = (
  schedule: OpenForWorkListing["work_schedule"],
  slot: "morning" | "afternoon" | "evening"
): boolean => {
  if (!schedule) return false;
  return Object.values(schedule).some((day) => day?.[slot]);
};

const matchesAvailabilityWindow = (value: string | undefined, window: string) => {
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

const matchesOpenForWorkSalary = (listing: OpenForWorkListing, selected?: SalaryRangeOption) => {
  if (!selected) return true;
  const rawMin = toFiniteNumber(listing.salary_min ?? listing.househelp?.salary_expectation);
  const rawMax = toFiniteNumber(listing.salary_max ?? listing.househelp?.salary_expectation);
  if (rawMin == null && rawMax == null) return false;
  const listingMin = rawMin ?? rawMax ?? 0;
  const listingMax = rawMax ?? rawMin ?? 0;
  const listingFrequency = listing.salary_frequency || listing.househelp?.salary_frequency;
  if (selected.frequency && listingFrequency && normalizeToken(listingFrequency) !== normalizeToken(selected.frequency)) {
    return false;
  }
  if (selected.min != null && listingMax < selected.min) return false;
  if (selected.max != null && listingMin > selected.max) return false;
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

const getListingBudgetValue = (listing: OpenForWorkListing): number | null => {
  const max = toFiniteNumber(listing.salary_max ?? listing.househelp?.salary_expectation);
  const min = toFiniteNumber(listing.salary_min ?? listing.househelp?.salary_expectation);
  if (max != null) return max;
  if (min != null) return min;
  return null;
};

const normalizeHousehelp = (raw: unknown): HousehelpSummary | undefined => {
  const househelp = toRecord(raw);
  if (!househelp) return undefined;
  const user = toRecord(househelp.user);

  return {
    ...househelp,
    id: formatTextValue(househelp.id) || undefined,
    user_id: formatTextValue(househelp.user_id) || undefined,
    first_name: formatTextValue(househelp.first_name) || undefined,
    last_name: formatTextValue(househelp.last_name) || undefined,
    avatar_url: formatTextValue(househelp.avatar_url) || undefined,
    photos: toStringArray(househelp.photos),
    town: formatTextValue(househelp.town) || undefined,
    location: formatTextValue(househelp.location) || undefined,
    years_of_experience: toFiniteNumber(househelp.years_of_experience),
    salary_expectation: toFiniteNumber(househelp.salary_expectation),
    salary_frequency: formatTextValue(househelp.salary_frequency) || undefined,
    user: user ? {
      ...user,
      id: formatTextValue(user.id) || undefined,
      first_name: formatTextValue(user.first_name) || undefined,
      last_name: formatTextValue(user.last_name) || undefined,
      avatar_url: formatTextValue(user.avatar_url) || undefined,
    } : undefined,
  };
};

const normalizeOpenForWorkListing = (raw: unknown, fallbackId: string): OpenForWorkListing => {
  const listing = toRecord(raw) || {};

  return {
    ...listing,
    id: formatTextValue(listing.id) || fallbackId,
    job_types: toStringArray(listing.job_types),
    available_from: formatTextValue(listing.available_from) || undefined,
    status: formatTextValue(listing.status) || undefined,
    created_at: formatTextValue(listing.created_at) || undefined,
    salary_min: toFiniteNumber(listing.salary_min),
    salary_max: toFiniteNumber(listing.salary_max),
    salary_frequency: formatTextValue(listing.salary_frequency) || undefined,
    fit_score: toFiniteNumber(listing.fit_score),
    match_reasons: toStringArray(listing.match_reasons),
    househelp: normalizeHousehelp(listing.househelp),
  };
};

const formatSalary = (min?: unknown, max?: unknown, frequency?: unknown) => {
  const frequencyLabel = formatTextValue(frequency);
  const rawMin = toFiniteNumber(min);
  const rawMax = toFiniteNumber(max);
  const normalizedMin = rawMin == null ? undefined : normalizeOnboardingAmountFromStorage(rawMin, frequencyLabel);
  const normalizedMax = rawMax == null ? undefined : normalizeOnboardingAmountFromStorage(rawMax, frequencyLabel);
  if (normalizedMin == null && normalizedMax == null) return "Not specified";
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  });
  const minLabel = normalizedMin != null ? formatter.format(normalizedMin) : null;
  const maxLabel = normalizedMax != null ? formatter.format(normalizedMax) : null;
  const base = minLabel && maxLabel ? `${minLabel} - ${maxLabel}` : (minLabel || maxLabel || "Not specified");
  const freqLabel = frequencyLabel ? ` / ${frequencyLabel}` : "";
  return `${base}${freqLabel}`;
};

const extractShortlistItems = (raw: any): Array<{ profile_id?: string; profile_type?: string }> => {
  const payload = raw?.data?.data || raw?.data || raw || [];
  return Array.isArray(payload) ? payload : [];
};

const summarizeSchedule = (schedule?: Record<string, { morning?: boolean; afternoon?: boolean; evening?: boolean }>) => {
  if (!schedule) return null;
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const activeDays = days.filter((day) => {
    const slots = schedule[day];
    return slots?.morning || slots?.afternoon || slots?.evening;
  });
  if (activeDays.length === 0) return null;
  return activeDays.map((day) => day.slice(0, 3)).join(", ");
};

const isOpenForWorkListingActive = (listing: OpenForWorkListing) => {
  const status = (listing.status || "active").toLowerCase();
  return ["active", "open", "available"].includes(status);
};

const formatListingStatus = (status?: string) => {
  const normalized = formatTextValue(status);
  if (!normalized) return "Open";
  return normalized.replace(/_/g, " ");
};

export default function HouseholdJobsHome() {
  const navigate = useNavigate();
  const currentUserId = useMemo(() => getStoredUserId(), []);
  const { isActive: hasActiveSubscription, status: subscriptionStatus, loading: subscriptionLoading } = useSubscription(currentUserId);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const [listings, setListings] = useState<OpenForWorkListing[]>([]);
  const [selectedListing, setSelectedListing] = useState<OpenForWorkListing | null>(null);
  const [selectedInviteListing, setSelectedInviteListing] = useState<OpenForWorkListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [shortlistedListingIds, setShortlistedListingIds] = useState<Set<string>>(() => new Set());
  const [shortlistLoadingId, setShortlistLoadingId] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [openOnly, setOpenOnly] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(() => ({ ...DEFAULT_OPEN_FOR_WORK_FILTERS }));
  const [sortBy, setSortBy] = useState("best_match");
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [inviteDraft, setInviteDraft] = useState(loadSavedInviteMessage());
  const [currentHouseholdProfileId, setCurrentHouseholdProfileId] = useState<string | null>(null);
  const [previewHousehelpListing, setPreviewHousehelpListing] = useState<OpenForWorkListing | null>(null);

  const limit = 12;
  const backToPath = "/household/jobs";

  const buildInviteTemplate = useCallback((listing: OpenForWorkListing, variant: "skills" | "availability" = "skills") => {
    const househelp = listing.househelp || {};
    const user = househelp.user || {};
    const name = firstString(user.first_name, househelp.first_name, "there");
    const jobTypes = toStringArray(listing.job_types).map((type) => type.replace(/_/g, " ")).join(", ") || "your preferred role";
    const scheduleLabel = summarizeSchedule(listing.work_schedule) || "your ideal schedule";
    const location = firstString(househelp.town, househelp.location) || "your area";
    if (variant === "availability") {
      return `Hi ${name},\n\nWe have a family in ${location} hoping to hire a ${jobTypes} and they are ready as soon as ${formatDate(listing.available_from)}. Your availability and schedule (${scheduleLabel}) look like a great match. Can we chat this week?`;
    }
    return `Hi ${name},\n\nYour profile stood out—especially your ${jobTypes} experience. We think you'd be a perfect fit for a household in ${location} and would love to invite you to apply. Let me know when you're free to discuss details!`;
  }, []);

  const { options: onboardingOptions } = useOnboardingOptions("househelp");

  const househelpUserIds = useMemo(
    () => listings.map((listing) => firstString(listing.househelp?.user_id, listing.househelp?.user?.id)).filter(Boolean),
    [listings]
  );

  const profilePhotos = useProfilePhotos(househelpUserIds);
  const openListingsCount = useMemo(
    () => listings.filter((listing) => isOpenForWorkListingActive(listing)).length,
    [listings]
  );
  const jobTypeOptions = useMemo(() => {
    const options = new Map<string, string>();
    listings.forEach((listing) => {
      toStringArray(listing.job_types).forEach((type) => {
        const normalized = normalizeToken(type);
        if (normalized) options.set(normalized, type.replace(/_/g, " "));
      });
    });
    return Array.from(options.entries()).map(([value, label]) => ({ value, label }));
  }, [listings]);
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
  const clearFilters = () => setFilters({ ...DEFAULT_OPEN_FOR_WORK_FILTERS });
  const filteredListings = useMemo(() => {
    const choreFilter = filters.choreId ? Number(filters.choreId) : null;
    const petFilter = filters.petTypeId ? Number(filters.petTypeId) : null;
    return listings.filter((listing) => {
      if (openOnly && !isOpenForWorkListingActive(listing)) return false;
      if (filters.jobType && !toStringArray(listing.job_types).some((type) => normalizeToken(type) === filters.jobType)) {
        return false;
      }
      if (filters.availabilityWindow && !matchesAvailabilityWindow(listing.available_from, filters.availabilityWindow)) {
        return false;
      }
      if (filters.scheduleSlot && !hasScheduleSlot(listing.work_schedule, filters.scheduleSlot as "morning" | "afternoon" | "evening")) {
        return false;
      }
      if (choreFilter && !toNumberArray(listing.chores_ids).includes(choreFilter)) return false;
      if (petFilter && !toNumberArray(listing.pet_type_ids).includes(petFilter)) return false;
      if (filters.childrenAgeRangeId && toIdString(listing.children_age_range_id) !== filters.childrenAgeRangeId) return false;
      if (filters.childrenCapacityId && toIdString(listing.children_capacity_id) !== filters.childrenCapacityId) return false;
      if (filters.canWorkWithKids === "yes" && !listing.can_work_with_kids) return false;
      if (filters.canWorkWithKids === "no" && listing.can_work_with_kids) return false;
      if (filters.canWorkWithPets === "yes" && !listing.can_work_with_pets) return false;
      if (filters.canWorkWithPets === "no" && listing.can_work_with_pets) return false;
      if (!matchesOpenForWorkSalary(listing, selectedSalaryRange)) return false;
      return true;
    });
  }, [listings, openOnly, filters, selectedSalaryRange]);

  useEffect(() => {
    let cancelled = false;
    const fetchProfileId = async () => {
      try {
        const profile = await grpcProfileService.getCurrentHouseholdProfile('');
        if (!cancelled) {
          setCurrentHouseholdProfileId(profile?.id || profile?.profile_id || null);
        }
      } catch {
        if (!cancelled) {
          setCurrentHouseholdProfileId(null);
        }
      }
    };
    fetchProfileId();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    persistSavedInviteMessage(inviteDraft);
  }, [inviteDraft]);

  const sortedListings = useMemo(() => {
    if (!sortBy) return filteredListings;
    const items = [...filteredListings];
    switch (sortBy) {
      case "best_match":
        items.sort((a, b) =>
          compareNumbers(
            (toFiniteNumber(a.fit_score) ?? null),
            (toFiniteNumber(b.fit_score) ?? null),
            "desc",
          ),
        );
        break;
      case "budget_desc":
        items.sort((a, b) => compareNumbers(getListingBudgetValue(a), getListingBudgetValue(b), "desc"));
        break;
      case "budget_asc":
        items.sort((a, b) => compareNumbers(getListingBudgetValue(a), getListingBudgetValue(b), "asc"));
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
  }, [filteredListings, sortBy]);
  const topMatches = useMemo(() => (
    (Array.isArray(listings) ? [...listings] : [])
      .filter((listing) => (listing.fit_score ?? 0) > 0)
      .sort((a, b) => compareNumbers(a.fit_score ?? null, b.fit_score ?? null, 'desc'))
      .slice(0, 6)
  ), [listings]);

  const searchKey = useMemo(
    () => JSON.stringify({ filters, openOnly, sortBy, salaryRangeId: filters.salaryRangeId }),
    [filters, openOnly, sortBy]
  );

  useEffect(() => {
    setOffset(0);
    setHasMore(true);
    setListings([]);
  }, [searchKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(HOUSEHOLD_FILTERS_STORAGE_KEY);
    if (stored !== null) {
      setFiltersOpen(stored === "true");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(HOUSEHOLD_FILTERS_STORAGE_KEY, String(filtersOpen));
  }, [filtersOpen]);

  useEffect(() => {
    let cancelled = false;
    const fetchShortlist = async () => {
      try {
        const raw = await shortlistService.listByHousehold('');
        if (cancelled) return;
        const ids = extractShortlistItems(raw)
          .filter((item) => item.profile_type === 'open_for_work')
          .map((item) => item.profile_id)
          .filter((id): id is string => Boolean(id));
        setShortlistedListingIds(new Set(ids));
        setActionSuccess(null);
      } catch {
        // The card can still render and retry on click if this lookup fails.
        setActionSuccess(null);
      }
    };

    fetchShortlist();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      try {
        const payload: Record<string, any> = {
          limit,
          offset,
        };
        if (openOnly) payload.status = "active";
        if (filters.jobType) payload.job_type = filters.jobType;
        if (filters.choreId) payload.chores_ids = [Number(filters.choreId)];
        if (filters.petTypeId) payload.pet_type_ids = [Number(filters.petTypeId)];
        if (filters.childrenAgeRangeId) payload.children_age_range_id = Number(filters.childrenAgeRangeId);
        if (filters.childrenCapacityId) payload.children_capacity_id = Number(filters.childrenCapacityId);
        if (filters.canWorkWithKids) payload.can_work_with_kids = filters.canWorkWithKids === "yes";
        if (filters.canWorkWithPets) payload.can_work_with_pets = filters.canWorkWithPets === "yes";
        if (selectedSalaryRange?.min != null) payload.salary_min = selectedSalaryRange.min;
        if (selectedSalaryRange?.max != null) payload.salary_max = selectedSalaryRange.max;
        if (selectedSalaryRange?.frequency) payload.salary_frequency = selectedSalaryRange.frequency;
        if (filters.availabilityWindow) {
          const now = new Date();
          const addDays = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
          if (filters.availabilityWindow === "next_14") payload.available_from_before = addDays(14);
          if (filters.availabilityWindow === "next_30") payload.available_from_before = addDays(30);
          if (filters.availabilityWindow === "later") payload.available_from_after = addDays(30);
        }
        if (sortBy === "best_match") payload.sort = "best_match";

        const raw = await openForWorkService.searchOpenForWork(currentUserId, payload);
        const data = raw?.data || raw || {};
        const items = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data)
              ? data
              : [];
        const normalizedItems = (items as unknown[]).map((item: unknown, index: number) => (
          normalizeOpenForWorkListing(item, `open-for-work-${offset + index}`)
        ));
        if (cancelled) return;
        setListings((prev) => (offset === 0 ? normalizedItems : [...prev, ...normalizedItems]));
        setHasMore(normalizedItems.length === limit);
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to load open-for-work listings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchListings();

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

  const handleMessage = async (listing: OpenForWorkListing) => {
    const househelpUserId = listing.househelp?.user_id || listing.househelp?.user?.id;
    const househelpProfileId = listing.househelp?.id;
    if (!househelpUserId || !currentUserId) return;
    if (!hasActiveSubscription && !subscriptionLoading) {
      setShowSubscriptionModal(true);
      return;
    }
    try {
      const convId = await startOrGetConversation(NOTIFICATIONS_API_BASE_URL, {
        household_user_id: currentUserId,
        househelp_user_id: househelpUserId,
        househelp_profile_id: househelpProfileId,
      });
      navigate(getInboxRoute(convId));
    } catch (err) {
      console.error("Failed to start conversation", err);
      navigate("/inbox");
    }
  };

  const handleOpenInviteModal = (listing: OpenForWorkListing, options?: { template?: "skills" | "availability" }) => {
    if (!hasActiveSubscription && !subscriptionLoading) {
      setShowSubscriptionModal(true);
      return;
    }
    setSelectedInviteListing(listing);
    setInviteError(null);
    if (options?.template) {
      setInviteDraft(buildInviteTemplate(listing, options.template));
    } else if (!inviteDraft.trim()) {
      setInviteDraft(buildInviteTemplate(listing, "skills"));
    }
  };

  const handleCloseInviteModal = () => {
    if (inviteLoading) return;
    setSelectedInviteListing(null);
    setInviteError(null);
  };

  const handleSendInvite = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!selectedInviteListing) return;
    if (!currentUserId) {
      setInviteError("We couldn’t verify your household profile.");
      return;
    }
    const body = inviteDraft.trim();
    if (!body) {
      setInviteError("Please add a short message before sending.");
      return;
    }
    const househelpUserId = firstString(selectedInviteListing.househelp?.user_id, selectedInviteListing.househelp?.user?.id);
    if (!househelpUserId) {
      setInviteError("We couldn’t reach this househelp right now.");
      return;
    }
    if (!hasActiveSubscription && !subscriptionLoading) {
      setShowSubscriptionModal(true);
      return;
    }

    setInviteLoading(true);
    setInviteError(null);
    try {
      const payload: StartConversationPayload = {
        household_user_id: currentUserId,
        househelp_user_id: househelpUserId,
      };
      if (currentHouseholdProfileId) payload.household_profile_id = currentHouseholdProfileId;
      if (selectedInviteListing.househelp?.id) payload.househelp_profile_id = selectedInviteListing.househelp.id;

      const convId = await startOrGetConversation(NOTIFICATIONS_API_BASE_URL, payload);
      if (!convId) throw new Error("We couldn't open a conversation just yet.");

      await notificationsService.sendMessage(convId, body, '', currentUserId, currentHouseholdProfileId || '', 'household');
      persistSavedInviteMessage(body);
      setActionSuccess("Invite sent successfully.");
      setSelectedInviteListing(null);
    } catch (err: any) {
      setInviteError(err?.message || "Failed to send invite. Please try again.");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleViewProfile = (listing: OpenForWorkListing) => {
    if (!hasActiveSubscription && !subscriptionLoading) {
      setPreviewHousehelpListing(listing);
      return;
    }
    const profileId = listing.househelp?.id;
    if (!profileId) return;
    navigate(`/househelp/public-profile?profileId=${encodeURIComponent(profileId)}&openForWorkId=${encodeURIComponent(listing.id)}`);
  };

  const handleShortlist = async (listing: OpenForWorkListing) => {
    if (!listing.id) return;
    const isShortlisted = shortlistedListingIds.has(listing.id);
    setShortlistLoadingId(listing.id);
    setError(null);

    try {
      if (isShortlisted) {
        await shortlistService.deleteShortlist(listing.id);
        setShortlistedListingIds((prev) => {
          const next = new Set(prev);
          next.delete(listing.id);
          return next;
        });
        setActionSuccess("Listing removed from your shortlist.");
      } else {
        await shortlistService.createShortlist('', 'household', {
          profile_id: listing.id,
          profile_type: 'open_for_work',
        });
        setShortlistedListingIds((prev) => new Set(prev).add(listing.id));
        setActionSuccess("Listing added to your shortlist.");
      }
      window.dispatchEvent(new CustomEvent('shortlist-updated'));
    } catch (err: any) {
      setError(err?.message || "Failed to update shortlist. Please try again.");
    } finally {
      setShortlistLoadingId(null);
    }
  };

  const handleOpenListingModal = (listing: OpenForWorkListing) => {
    setSelectedListing(listing);
  };

  const handleCloseListingModal = () => {
    setSelectedListing(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="gradient" bubbles={false} bubbleDensity="low" className="flex-1 flex flex-col">
        <main className="flex-1 py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Open for Work</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Browse househelps who are actively looking for their next role.
              </p>
            </div>

            <div className="mb-4 rounded-2xl border border-purple-200/60 dark:border-purple-500/30 bg-white/80 dark:bg-[#141020]/80 shadow-sm">
              <button
                type="button"
                onClick={() => setFiltersOpen((prev) => !prev)}
                className="w-full flex flex-wrap items-center justify-between gap-4 px-5 py-4"
              >
                <div className="text-left">
                  <p className="text-xs uppercase tracking-[0.2em] text-purple-500 dark:text-purple-300 font-semibold">Filters</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Narrow down househelps by availability, skills, and preferences.
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
                      Open to work
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
                      All listings
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
                      Availability
                      <CustomSelect
                        value={filters.availabilityWindow}
                        onChange={(value) => setFilters((prev) => ({ ...prev, availabilityWindow: value }))}
                        options={[
                          { value: "", label: "Any start window" },
                          { value: "next_14", label: "Within 2 weeks" },
                          { value: "next_30", label: "Within 30 days" },
                          { value: "later", label: "Later" },
                          { value: "flexible", label: "Flexible" },
                        ]}
                        className="w-full"
                        size="sm"
                        placeholder="Any start window"
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
                    <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Work with kids
                      <CustomSelect
                        value={filters.canWorkWithKids}
                        onChange={(value) => setFilters((prev) => ({ ...prev, canWorkWithKids: value }))}
                        options={[
                          { value: "", label: "Any preference" },
                          { value: "yes", label: "Can work with kids" },
                          { value: "no", label: "Prefers no kids" },
                        ]}
                        className="w-full"
                        size="sm"
                        placeholder="Any preference"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Work with pets
                      <CustomSelect
                        value={filters.canWorkWithPets}
                        onChange={(value) => setFilters((prev) => ({ ...prev, canWorkWithPets: value }))}
                        options={[
                          { value: "", label: "Any preference" },
                          { value: "yes", label: "Can work with pets" },
                          { value: "no", label: "Prefers no pets" },
                        ]}
                        className="w-full"
                        size="sm"
                        placeholder="Any preference"
                      />
                    </label>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200 font-semibold">
                        {openListingsCount} open now
                      </span>
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300">
                        {listings.length} total listings
                      </span>
                      {hasActiveFilters && (
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200 font-semibold">
                          {filteredListings.length} match your filters
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
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Prioritize househelps by budget or newest listings.</p>
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
            {actionSuccess && <SuccessAlert message={actionSuccess} className="mb-6" onClose={() => setActionSuccess(null)} />}

            {topMatches.length > 0 && (
              <section className="mb-8">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-purple-500 dark:text-purple-300 font-semibold">Top matches</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Househelps ready now and highly compatible with your preferences.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{topMatches.length} listing{topMatches.length === 1 ? '' : 's'}</span>
                    {topMatches[0] && (
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-gray-500 dark:text-gray-300">Quick invite:</span>
                        <button
                          type="button"
                          onClick={() => handleOpenInviteModal(topMatches[0], { template: "skills" })}
                          className="px-3 py-1 rounded-full border border-purple-200/70 dark:border-purple-500/30 text-purple-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-500/10"
                        >
                          Skills fit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenInviteModal(topMatches[0], { template: "availability" })}
                          className="px-3 py-1 rounded-full border border-blue-200/70 dark:border-blue-500/30 text-blue-700 dark:text-blue-200 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                        >
                          Availability
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                  {topMatches.map((listing) => {
                    const househelp = listing.househelp || {};
                    const user = househelp.user || {};
                    const name = `${firstString(househelp.user?.first_name, househelp.first_name)} ${firstString(househelp.user?.last_name, househelp.last_name)}`.trim() || 'Househelp';
                    const location = firstString(househelp.town, househelp.location) || 'Location not specified';
                    const jobTypes = toStringArray(listing.job_types);
                    const scheduleLabel = summarizeSchedule(listing.work_schedule);
                    const responseBadge = deriveHousehelpResponsivenessBadge(listing.househelp);
                    return (
                      <button
                        key={listing.id}
                        type="button"
                        onClick={() => handleOpenListingModal(listing)}
                        className="min-w-[250px] max-w-[280px] text-left rounded-2xl border border-purple-200/60 dark:border-purple-500/30 bg-white/90 dark:bg-[#151025]/80 p-4 shadow-sm hover:shadow-lg transition snap-start"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
                              Match {listing.fit_score}%
                            </p>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-1 line-clamp-2">
                              {name}
                            </h3>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isOpenForWorkListingActive(listing)
                              ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200'
                              : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300'
                          }`}>
                            {formatListingStatus(listing.status)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">📍 {location}</p>
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
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">💰 {formatSalary(listing.salary_min, listing.salary_max, listing.salary_frequency)}</p>
                        {listing.match_reasons && listing.match_reasons.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {listing.match_reasons.slice(0, 2).map((reason) => (
                              <span
                                key={reason}
                                className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] dark:bg-emerald-500/10 dark:text-emerald-200"
                              >
                                {reason}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {jobTypes.slice(0, 2).map((type) => (
                            <span key={type} className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] dark:bg-purple-500/10 dark:text-purple-200">
                              {type.replace(/_/g, ' ')}
                            </span>
                          ))}
                          {scheduleLabel && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] dark:bg-amber-500/10 dark:text-amber-200">
                              {scheduleLabel}
                            </span>
                          )}
                          {listing.available_from && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] dark:bg-blue-500/10 dark:text-blue-200">
                              From {formatDate(listing.available_from)}
                            </span>
                          )}
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-semibold">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleOpenInviteModal(listing, { template: "skills" });
                            }}
                            className="rounded-xl border border-green-200/60 dark:border-green-500/30 text-green-700 dark:text-green-200 px-3 py-1 hover:bg-green-50 dark:hover:bg-green-500/10"
                          >
                            Invite
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleOpenInviteModal(listing, { template: "availability" });
                            }}
                            className="rounded-xl border border-blue-200/60 dark:border-blue-500/30 text-blue-700 dark:text-blue-200 px-3 py-1 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                          >
                            Availability
                          </button>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {loading && sortedListings.length === 0 ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
              </div>
            ) : sortedListings.length === 0 ? (
              <div className="bg-white dark:bg-[#13131a] border-2 border-purple-200 dark:border-purple-500/30 rounded-2xl p-10 sm:p-14 text-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {hasActiveFilters ? "No listings match your filters" : openOnly ? "No open listings yet" : "No listings yet"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
                  {hasActiveFilters
                    ? "Try adjusting your filters or clear them to see more househelps."
                    : openOnly
                      ? "When househelps mark themselves as open to work, their listings will appear here."
                      : "When househelps create listings, they will appear here."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedListings.map((listing) => {
                  const househelp = listing.househelp || {};
                  const user = househelp.user || {};
                  const name = `${firstString(user.first_name, househelp.first_name)} ${firstString(user.last_name, househelp.last_name)}`.trim() || "Househelp";
                  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "HW";
                  const userId = firstString(househelp.user_id, user.id);
                  const photos = toStringArray(househelp.photos);
                  const avatar = firstString(househelp.avatar_url, photos[0], profilePhotos[userId]);
                  const scheduleLabel = summarizeSchedule(listing.work_schedule);
                  const jobTypes = toStringArray(listing.job_types);
                  const location = firstString(househelp.town, househelp.location) || "Location not specified";
                  const experienceYears = toFiniteNumber(househelp.years_of_experience);
                  const shortlisted = shortlistedListingIds.has(listing.id);
                  const isOpen = isOpenForWorkListingActive(listing);
                  const responseBadge = deriveHousehelpResponsivenessBadge(listing.househelp);

                  return (
                    <div
                      key={listing.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleOpenListingModal(listing)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleOpenListingModal(listing);
                        }
                      }}
                      className="bg-white dark:bg-[#13131a] rounded-2xl border-2 border-purple-200/40 dark:border-purple-500/30 p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-400"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center text-lg font-bold overflow-hidden">
                          {avatar ? (
                            <OptimizedImage
                              path={avatar}
                              alt={name}
                              className="w-full h-full object-cover"
                              onError={(e: any) => { e.currentTarget.style.display = "none"; }}
                            />
                          ) : (
                            initials
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{name}</h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400">📍 {location}</p>
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
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleShortlist(listing);
                                }}
                                disabled={shortlistLoadingId === listing.id}
                                className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
                                  shortlisted
                                    ? "border-pink-400 bg-pink-500 text-white"
                                    : "border-purple-200/70 bg-white text-purple-700 hover:bg-purple-50 dark:border-purple-500/30 dark:bg-white/10 dark:text-purple-200 dark:hover:bg-purple-500/10"
                                } disabled:opacity-60`}
                                aria-label={shortlisted ? "Remove open-for-work listing from shortlist" : "Shortlist open-for-work listing"}
                                title={shortlisted ? "Remove from shortlist" : "Add to shortlist"}
                              >
                                {shortlistLoadingId === listing.id ? (
                                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : (
                                  <Heart className={`h-4 w-4 ${shortlisted ? "fill-current" : ""}`} />
                                )}
                              </button>
                              <span
                                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                  isOpen
                                    ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200"
                                    : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"
                                }`}
                              >
                                {formatListingStatus(listing.status)}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {jobTypes.length > 0 ? (
                              jobTypes.map((type) => (
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
                            {typeof listing.fit_score === "number" && listing.fit_score > 0 && (
                              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                                Match {listing.fit_score}%
                              </span>
                            )}
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
                              Available {formatDate(listing.available_from)}
                            </span>
                            {scheduleLabel && (
                              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                                {scheduleLabel}
                              </span>
                            )}
                          </div>

                          {listing.match_reasons && listing.match_reasons.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {listing.match_reasons.slice(0, 3).map((reason) => (
                                <span
                                  key={reason}
                                  className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] dark:bg-emerald-500/10 dark:text-emerald-200"
                                >
                                  {reason}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="mt-3 text-xs text-gray-600 dark:text-gray-300 space-y-1">
                            <p>Experience: {experienceYears ? `${experienceYears} yrs` : "Not specified"}</p>
                            <p>
                              Salary: {formatSalary(listing.salary_min ?? househelp.salary_expectation, listing.salary_max, listing.salary_frequency || househelp.salary_frequency)}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {listing.can_work_with_kids && (
                                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] dark:bg-blue-500/10 dark:text-blue-200">Kids</span>
                              )}
                              {listing.can_work_with_pets && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] dark:bg-emerald-500/10 dark:text-emerald-200">Pets</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-gray-400">Updated {formatTimeAgo(listing.created_at)}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleViewProfile(listing);
                            }}
                            className="px-4 py-1.5 text-xs font-semibold rounded-xl border border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-500/40 dark:text-purple-200 dark:hover:bg-purple-500/10"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleOpenInviteModal(listing);
                            }}
                            className="px-4 py-1.5 text-xs font-semibold rounded-xl border border-green-200/60 dark:border-green-500/30 text-green-700 dark:text-green-200 hover:bg-green-50 dark:hover:bg-green-500/10"
                          >
                            Invite
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleMessage(listing);
                            }}
                            className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                          >
                            Message
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && hasMore && listings.length > 0 && (
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
      {selectedListing && (() => {
        const househelp = selectedListing.househelp || {};
        const user = househelp.user || {};
        const name = `${firstString(user.first_name, househelp.first_name)} ${firstString(user.last_name, househelp.last_name)}`.trim() || "Househelp";
        const initials = name
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0])
          .join("")
          .toUpperCase();
        const userId = firstString(househelp.user_id, user.id);
        const photos = toStringArray(househelp.photos);
        const avatar = firstString(househelp.avatar_url, photos[0], profilePhotos[userId]);
        const scheduleLabel = summarizeSchedule(selectedListing.work_schedule);
        const jobTypes = toStringArray(selectedListing.job_types);
        const location = firstString(househelp.town, househelp.location) || "Location not specified";
        const experienceYears = toFiniteNumber(househelp.years_of_experience);
        const shortlisted = shortlistedListingIds.has(selectedListing.id);
        const isOpen = isOpenForWorkListingActive(selectedListing);
        const responseBadge = deriveHousehelpResponsivenessBadge(selectedListing.househelp);

        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseListingModal} />
            <div className="relative w-full sm:max-w-2xl bg-white dark:bg-[#1b1524] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-purple-200/50 dark:border-purple-700/40 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-purple-500 dark:text-purple-300 font-semibold">Open for work</p>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-2">{name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">📍 {location}</p>
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
                  onClick={handleCloseListingModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Close details"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-5">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center text-xl font-bold overflow-hidden">
                  {avatar ? (
                    <OptimizedImage
                      path={avatar}
                      alt={name}
                      className="w-full h-full object-cover"
                      onError={(e: any) => { e.currentTarget.style.display = "none"; }}
                    />
                  ) : (
                    initials || "HW"
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        isOpen
                          ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200"
                          : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"
                      }`}
                    >
                      {formatListingStatus(selectedListing.status)}
                    </span>
                    {scheduleLabel && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                        {scheduleLabel}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Experience</p>
                      <p className="mt-1">{experienceYears ? `${experienceYears} yrs` : "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Availability</p>
                      <p className="mt-1">{formatDate(selectedListing.available_from)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Salary</p>
                      <p className="mt-1">
                        {formatSalary(
                          selectedListing.salary_min ?? househelp.salary_expectation,
                          selectedListing.salary_max,
                          selectedListing.salary_frequency || househelp.salary_frequency
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Updated</p>
                      <p className="mt-1">{formatTimeAgo(selectedListing.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {jobTypes.length > 0 ? (
                  jobTypes.map((type) => (
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
                {selectedListing.can_work_with_kids && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
                    Kids friendly
                  </span>
                )}
                {selectedListing.can_work_with_pets && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                    Pets friendly
                  </span>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => handleViewProfile(selectedListing)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-500/40 dark:text-purple-200 dark:hover:bg-purple-500/10"
                >
                  View Profile
                </button>
                <button
                  onClick={() => handleMessage(selectedListing)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                >
                  Message
                </button>
                <button
                  onClick={() => handleShortlist(selectedListing)}
                  disabled={shortlistLoadingId === selectedListing.id}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl border transition ${
                    shortlisted
                      ? "border-pink-400 bg-pink-500 text-white"
                      : "border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-500/40 dark:text-purple-200 dark:hover:bg-purple-500/10"
                  } disabled:opacity-60`}
                >
                  {shortlistLoadingId === selectedListing.id
                    ? "Updating..."
                    : shortlisted
                      ? "Shortlisted"
                      : "Shortlist"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      {selectedInviteListing && (() => {
        const househelp = selectedInviteListing.househelp || {};
        const user = househelp.user || {};
        const name = `${firstString(user.first_name, househelp.first_name)} ${firstString(user.last_name, househelp.last_name)}`.trim() || 'Househelp';
        const location = firstString(househelp.town, househelp.location) || 'Location not specified';
        return (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseInviteModal} />
            <div className="relative w-full sm:max-w-lg bg-white dark:bg-[#1b1524] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-purple-200/50 dark:border-purple-700/40 p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-purple-500 dark:text-purple-300 font-semibold">Invite househelp</p>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">{name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">📍 {location}</p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseInviteModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Close invite"
                  disabled={inviteLoading}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {inviteError && (
                <ErrorAlert message={inviteError} className="mt-4" onClose={() => setInviteError(null)} />
              )}

              <form onSubmit={handleSendInvite} className="mt-6 space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-gray-400">Message</label>
                  <textarea
                    value={inviteDraft}
                    onChange={(event) => setInviteDraft(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-purple-200/60 dark:border-purple-700/40 bg-white dark:bg-[#120b1a] p-4 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={6}
                    placeholder="Introduce your household and why they’re a great fit..."
                  />
                </div>
                <div className="flex flex-wrap gap-3 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setInviteDraft(buildInviteTemplate(selectedInviteListing, "skills"))}
                    className="px-4 py-2 rounded-xl border border-purple-200/70 text-purple-700 hover:bg-purple-50 dark:border-purple-500/30 dark:text-purple-200 dark:hover:bg-purple-500/10"
                  >
                    Skills template
                  </button>
                  <button
                    type="button"
                    onClick={() => setInviteDraft(buildInviteTemplate(selectedInviteListing, "availability"))}
                    className="px-4 py-2 rounded-xl border border-blue-200/70 text-blue-700 hover:bg-blue-50 dark:border-blue-500/30 dark:text-blue-200 dark:hover:bg-blue-500/10"
                  >
                    Availability template
                  </button>
                </div>
                <div className="flex items-center gap-3 justify-end">
                  <button
                    type="button"
                    onClick={handleCloseInviteModal}
                    disabled={inviteLoading}
                    className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold shadow-lg shadow-purple-500/30 hover:from-purple-700 hover:to-pink-700 disabled:opacity-60"
                  >
                    {inviteLoading ? "Sending..." : "Send invite"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
      {previewHousehelpListing && (() => {
        const househelp = previewHousehelpListing.househelp || {};
        const user = househelp.user || {};
        const profileData = househelp as Record<string, any>;
        const displayName = firstString(user.first_name, househelp.first_name, "This househelp");
        const headline = toStringArray(previewHousehelpListing.job_types).join(", ") || "Trusted househelp";
        const locationLabel = firstString(househelp.town, househelp.location, "Location hidden");
        const maskedDetails = [
          {
            label: "Full experience",
            value: profileData["experience_summary"] || "Detailed experience timeline unlocks with a plan.",
          },
          {
            label: "References & reviews",
            value: "Ratings, testimonials, and verification badges are hidden for free accounts.",
          },
          {
            label: "Contact methods",
            value: "Direct chat, phone, and invite tools unlock once you subscribe.",
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
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPreviewHousehelpListing(null)} />
            <div className="relative w-full sm:max-w-xl bg-white dark:bg-[#1b1524] rounded-t-3xl sm:rounded-3xl border border-purple-200/60 dark:border-purple-700/30 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-purple-500 dark:text-purple-300 font-semibold">Limited profile preview</p>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{displayName}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{headline}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-300 mt-2">Location hint: {locationLabel}</p>
                  <p className="text-xs text-gray-400 mt-2">Unlock a subscription to reveal work history, badges, and direct contact options.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewHousehelpListing(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  aria-label="Close househelp preview"
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
                  <li>✔️ Verified references & background checks</li>
                  <li>✔️ Full availability, salary expectations, and attachments</li>
                  <li>✔️ Direct invites, chat, and booking workflows</li>
                </ul>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewHousehelpListing(null);
                    setShowSubscriptionModal(true);
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold shadow-lg shadow-purple-500/30 hover:from-purple-700 hover:to-pink-700"
                >
                  Unlock full profile
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewHousehelpListing(null)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      <SubscriptionRequiredModal
        open={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        status={subscriptionStatus}
        actionLabel="message househelps"
        plansHref="/plans"
      />
      <Footer />
    </div>
  );
}
