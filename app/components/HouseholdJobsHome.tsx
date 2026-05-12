import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { openForWorkService, shortlistService } from "~/services/grpc/authServices";
import { OptimizedImage } from "~/components/ui/OptimizedImage";
import { useProfilePhotos } from "~/hooks/useProfilePhotos";
import { getStoredUserId } from "~/utils/authStorage";
import { useSubscription } from "~/hooks/useSubscription";
import { SubscriptionRequiredModal } from "~/components/subscriptions/SubscriptionRequiredModal";
import { NOTIFICATIONS_API_BASE_URL } from "~/config/api";
import { getInboxRoute, startOrGetConversation } from "~/utils/conversationLauncher";
import { ErrorAlert } from "~/components/ui/ErrorAlert";
import { formatTimeAgo } from "~/utils/timeAgo";
import { normalizeOnboardingAmountFromStorage } from "~/utils/onboardingCompensation";
import { useOnboardingOptions } from "~/hooks/useOnboardingOptions";
import { Heart, ChevronDown } from "lucide-react";

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

const FILTER_SELECT_CLASS =
  "h-10 w-full appearance-none rounded-xl border-2 border-purple-200/70 dark:border-purple-500/30 bg-white/90 dark:bg-[#13131a] px-3 pr-10 text-xs font-medium text-gray-900 dark:text-gray-100 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30";
const FILTER_SELECT_ICON_CLASS =
  "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-400 dark:text-purple-300";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [shortlistedListingIds, setShortlistedListingIds] = useState<Set<string>>(() => new Set());
  const [shortlistLoadingId, setShortlistLoadingId] = useState<string | null>(null);
  const [openOnly, setOpenOnly] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(() => ({ ...DEFAULT_OPEN_FOR_WORK_FILTERS }));
  const [sortBy, setSortBy] = useState("default");
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const limit = 12;

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
  const sortedListings = useMemo(() => {
    if (!sortBy) return filteredListings;
    const items = [...filteredListings];
    switch (sortBy) {
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
      } catch {
        // The card can still render and retry on click if this lookup fails.
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
        const raw = await openForWorkService.listOpenForWork(limit, offset);
        const payload = raw?.data || raw || {};
        const items = Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload)
              ? payload
              : [];
        const total = typeof payload?.total === "number" ? payload.total : (Array.isArray(items) ? items.length : 0);
        const normalizedItems = (items as unknown[]).map((item: unknown, index: number) => (
          normalizeOpenForWorkListing(item, `open-for-work-${offset + index}`)
        ));
        if (cancelled) return;
        setListings((prev) => (offset === 0 ? normalizedItems : [...prev, ...normalizedItems]));
        setHasMore(offset + normalizedItems.length < total);
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

  const handleViewProfile = (listing: OpenForWorkListing) => {
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
      } else {
        await shortlistService.createShortlist('', 'household', {
          profile_id: listing.id,
          profile_type: 'open_for_work',
        });
        setShortlistedListingIds((prev) => new Set(prev).add(listing.id));
      }
      window.dispatchEvent(new CustomEvent('shortlist-updated'));
    } catch (err: any) {
      setError(err?.message || "Failed to update shortlist. Please try again.");
    } finally {
      setShortlistLoadingId(null);
    }
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
                      <div className="relative">
                        <select
                          value={filters.jobType}
                          onChange={(event) => setFilters((prev) => ({ ...prev, jobType: event.target.value }))}
                          className={FILTER_SELECT_CLASS}
                        >
                          <option value="">Any job type</option>
                          {jobTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className={FILTER_SELECT_ICON_CLASS} />
                      </div>
                    </label>
                    <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Availability
                      <div className="relative">
                        <select
                          value={filters.availabilityWindow}
                          onChange={(event) => setFilters((prev) => ({ ...prev, availabilityWindow: event.target.value }))}
                          className={FILTER_SELECT_CLASS}
                        >
                          <option value="">Any start window</option>
                          <option value="next_14">Within 2 weeks</option>
                          <option value="next_30">Within 30 days</option>
                          <option value="later">Later</option>
                          <option value="flexible">Flexible</option>
                        </select>
                        <ChevronDown className={FILTER_SELECT_ICON_CLASS} />
                      </div>
                    </label>
                    <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Schedule slot
                      <div className="relative">
                        <select
                          value={filters.scheduleSlot}
                          onChange={(event) => setFilters((prev) => ({ ...prev, scheduleSlot: event.target.value }))}
                          className={FILTER_SELECT_CLASS}
                        >
                          <option value="">Any slot</option>
                          <option value="morning">Morning</option>
                          <option value="afternoon">Afternoon</option>
                          <option value="evening">Evening</option>
                        </select>
                        <ChevronDown className={FILTER_SELECT_ICON_CLASS} />
                      </div>
                    </label>
                    <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Salary range
                      <div className="relative">
                        <select
                          value={filters.salaryRangeId}
                          onChange={(event) => setFilters((prev) => ({ ...prev, salaryRangeId: event.target.value }))}
                          className={FILTER_SELECT_CLASS}
                        >
                          <option value="">Any salary</option>
                          {salaryRangeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className={FILTER_SELECT_ICON_CLASS} />
                      </div>
                    </label>
                    <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Chore focus
                      <div className="relative">
                        <select
                          value={filters.choreId}
                          onChange={(event) => setFilters((prev) => ({ ...prev, choreId: event.target.value }))}
                          className={FILTER_SELECT_CLASS}
                        >
                          <option value="">Any chores</option>
                          {onboardingOptions?.chores?.map((chore) => (
                            <option key={chore.id} value={String(chore.id)}>
                              {chore.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className={FILTER_SELECT_ICON_CLASS} />
                      </div>
                    </label>
                    <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Pet type
                      <div className="relative">
                        <select
                          value={filters.petTypeId}
                          onChange={(event) => setFilters((prev) => ({ ...prev, petTypeId: event.target.value }))}
                          className={FILTER_SELECT_CLASS}
                        >
                          <option value="">Any pets</option>
                          {onboardingOptions?.pet_types?.map((pet) => (
                            <option key={pet.id} value={String(pet.id)}>
                              {pet.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className={FILTER_SELECT_ICON_CLASS} />
                      </div>
                    </label>
                    <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Children age range
                      <div className="relative">
                        <select
                          value={filters.childrenAgeRangeId}
                          onChange={(event) => setFilters((prev) => ({ ...prev, childrenAgeRangeId: event.target.value }))}
                          className={FILTER_SELECT_CLASS}
                        >
                          <option value="">Any age range</option>
                          {onboardingOptions?.children_age_ranges?.map((range) => (
                            <option key={range.id} value={String(range.id)}>
                              {range.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className={FILTER_SELECT_ICON_CLASS} />
                      </div>
                    </label>
                    <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Children capacity
                      <div className="relative">
                        <select
                          value={filters.childrenCapacityId}
                          onChange={(event) => setFilters((prev) => ({ ...prev, childrenCapacityId: event.target.value }))}
                          className={FILTER_SELECT_CLASS}
                        >
                          <option value="">Any capacity</option>
                          {onboardingOptions?.children_capacities?.map((capacity) => (
                            <option key={capacity.id} value={String(capacity.id)}>
                              {capacity.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className={FILTER_SELECT_ICON_CLASS} />
                      </div>
                    </label>
                    <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Work with kids
                      <div className="relative">
                        <select
                          value={filters.canWorkWithKids}
                          onChange={(event) => setFilters((prev) => ({ ...prev, canWorkWithKids: event.target.value }))}
                          className={FILTER_SELECT_CLASS}
                        >
                          <option value="">Any preference</option>
                          <option value="yes">Can work with kids</option>
                          <option value="no">Prefers no kids</option>
                        </select>
                        <ChevronDown className={FILTER_SELECT_ICON_CLASS} />
                      </div>
                    </label>
                    <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Work with pets
                      <div className="relative">
                        <select
                          value={filters.canWorkWithPets}
                          onChange={(event) => setFilters((prev) => ({ ...prev, canWorkWithPets: event.target.value }))}
                          className={FILTER_SELECT_CLASS}
                        >
                          <option value="">Any preference</option>
                          <option value="yes">Can work with pets</option>
                          <option value="no">Prefers no pets</option>
                        </select>
                        <ChevronDown className={FILTER_SELECT_ICON_CLASS} />
                      </div>
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
                  <div className="relative min-w-[220px]">
                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value)}
                      className={FILTER_SELECT_CLASS}
                    >
                      <option value="default">Newest first</option>
                      <option value="created_asc">Oldest first</option>
                      <option value="budget_desc">Budget high to low</option>
                      <option value="budget_asc">Budget low to high</option>
                    </select>
                    <ChevronDown className={FILTER_SELECT_ICON_CLASS} />
                  </div>
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

            {error && <ErrorAlert message={error} className="mb-6" />}

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

                  return (
                    <div
                      key={listing.id}
                      className="bg-white dark:bg-[#13131a] rounded-2xl border-2 border-purple-200/40 dark:border-purple-500/30 p-6 shadow-sm hover:shadow-lg transition-all"
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
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleShortlist(listing)}
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
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
                              Available {formatDate(listing.available_from)}
                            </span>
                            {scheduleLabel && (
                              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                                {scheduleLabel}
                              </span>
                            )}
                          </div>

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
                            onClick={() => handleViewProfile(listing)}
                            className="px-4 py-1.5 text-xs font-semibold rounded-xl border border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-500/40 dark:text-purple-200 dark:hover:bg-purple-500/10"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => handleMessage(listing)}
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
