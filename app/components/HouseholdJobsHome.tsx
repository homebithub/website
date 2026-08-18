import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSavedFilters } from '~/hooks/useSavedFilters';
import { SavedFilterBar } from '~/components/SavedFilterBar';
import { Link, useNavigate } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { ShimmerListPlaceholder } from "~/components/ShimmerLoader";
import { VerifiedBadge } from "~/components/VerifiedBadge";
import { PremiumBadge } from "~/components/PremiumBadge";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import {
  marketplaceJobService as jobService,
  marketplaceListingApplicationService as listingApplicationService,
  marketplaceShortlistService as shortlistService,
} from "~/services/grpc/marketplace.service";
import { profileReadService as grpcProfileService } from "~/services/grpc/profileRead.service";
import { notificationsService } from "~/services/grpc/notifications.service";
import { OptimizedImage } from "~/components/ui/OptimizedImage";
import { useProfilePhotos } from "~/hooks/useProfilePhotos";
import { getStoredCanonicalProfileType, getStoredUserId, getStoredUserProfileId } from "~/utils/authStorage";
import { NOTIFICATIONS_API_BASE_URL } from "~/config/api";
import { getInboxRoute, startOrGetConversation, type StartConversationPayload } from "~/utils/conversationLauncher";
import { ErrorAlert } from "~/components/ui/ErrorAlert";
import { SuccessAlert } from "~/components/ui/SuccessAlert";
import { formatTimeAgo } from "~/utils/timeAgo";
import { normalizeOnboardingAmountFromStorage } from "~/utils/onboardingCompensation";
import { useOnboardingOptions } from "~/hooks/useOnboardingOptions";
import { useProfileCompletionReminder } from "~/hooks/useProfileCompletionReminder";
import CustomSelect from "~/components/ui/CustomSelect";
import { ProfileCompletionBanner } from "~/components/profile/ProfileCompletionBanner";
import { ProfileCompletionCelebrationModal } from "~/components/profile/ProfileCompletionCelebrationModal";
import { Briefcase, Heart, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { formatPlace, formatPlaceOrFallback } from "~/utils/place";
import { humanizeFeatureName, listingHighlights, readFeatureGroups } from "~/utils/listingFeatures";
import { useSubscription } from "~/hooks/useSubscription";
import { SubscriptionRequiredModal } from "~/components/subscriptions/SubscriptionRequiredModal";
import { matchScoreClasses } from "~/utils/matchScore";
import { ListingRating } from "~/components/ui/ListingRating";
import { ListingCardFacts } from "~/components/listing/ListingCardFacts";
import { resolveHousehelpProfile } from '~/utils/househelpProfiles';
import { jobService as householdJobService } from '~/services/grpc/authServices';
import JobPostModal from '~/components/modals/JobPostModal';
import ConfirmDialog from '~/components/ConfirmDialog';

interface HousehelpSummary {
  id?: string;
  user_id?: string;
  first_name?: string;
  last_name?: string;
  /** True only for a KYC record the reviewers approved. See VerifiedBadge. */
  identity_verified?: boolean;
  identity_verified_at?: string;
  /** True while a subscription is active. Separate from verification on
   *  purpose: one says who someone is, the other says that they pay us. */
  premium?: boolean;
  premium_is_trial?: boolean;
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
  title?: string;
  description?: string;
  user_profile_id?: string;
  userProfileId?: string;
  listing_feature_groups?: Array<{
    feature_id?: number | string;
    feature_name?: string;
    name?: string;
    properties?: string[];
  }>;
  listing_features?: Array<Record<string, any>>;
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
  owner_rating?: number;
  owner_review_count?: number;
}

interface HouseholdJobListing {
  id: string;
  title?: string;
  description?: string;
  status?: string;
  created_at?: string;
  expires_at?: string;
  salary_min?: number;
  salary_max?: number;
  salary_frequency?: string;
  salary_range?: { min?: number; max?: number; currency?: string };
  [key: string]: any;
}

const describeJobExpiry = (value?: string): string => {
  if (!value) return "No expiry set";
  const expires = new Date(value).getTime();
  if (Number.isNaN(expires)) return "Expiry unavailable";
  const remaining = expires - Date.now();
  if (remaining <= 0) return "Closing now";
  const days = Math.ceil(remaining / 86_400_000);
  if (days === 1) return "Closes tomorrow";
  return `Closes in ${days} days`;
};

const formatJobSalary = (job: HouseholdJobListing): string => {
  const featureSalary = listingHighlights(job).salary;
  if (featureSalary) return featureSalary;
  const min = Number(job.salary_min ?? job.salary_range?.min ?? 0);
  const max = Number(job.salary_max ?? job.salary_range?.max ?? 0);
  if (!min && !max) return "Salary not specified";
  const amount = min && max && min !== max
    ? `${min.toLocaleString()}–${max.toLocaleString()}`
    : (min || max).toLocaleString();
  return `${job.salary_range?.currency || "KES"} ${amount}${job.salary_frequency ? ` / ${job.salary_frequency}` : ""}`;
};

type SalaryRangeOption = {
  value: string;
  label: string;
  min: number | null;
  max: number | null;
  frequency?: string;
};

// Every one of these is a catalogue id the server can filter on: a job type,
// or a feature property.
//
// Availability and schedule used to be compared in the browser against
// listing.available_from and listing.work_schedule — fields no service has ever
// produced — so setting either removed every listing. They are back as what
// they always were in the data: StartTiming and ShiftWindow properties, filtered
// by the service like everything else here.
//
// The two yes/no questions about kids and pets are not back. There is no
// feature that records them; the nearest real answers are the children age
// range and pet type below, which ask the same thing of data that exists.
const DEFAULT_OPEN_FOR_WORK_FILTERS = {
  jobType: "",
  salaryRangeId: "",
  choreId: "",
  petTypeId: "",
  childrenAgeRangeId: "",
  childrenCapacityId: "",
  startTimingId: "",
  shiftWindowId: "",
  minRating: "",
};


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

const normalizeHousehelp = (raw: unknown, listing?: Record<string, any>): HousehelpSummary | undefined => {
  const househelp = toRecord(raw);
  const owner = toRecord(listing);

  // A listing carries who posted it even when it has no nested profile object,
  // which is the usual case: the search endpoint returns listings, not people.
  // Without this the card had nobody attached — hence a placeholder name and a
  // Message button with no one to message.
  //
  // Two endpoints name these differently. ListJobs resolves the poster into
  // owner_* fields; ListOpenForWork joins the househelp's own user row and
  // returns first_name / househelp_user_id. Reading only one shape left the
  // other with a placeholder name and a Message button with nobody behind it,
  // so both are accepted.
  const ownerUserId = formatTextValue(owner?.owner_user_id)
    || formatTextValue(owner?.househelp_user_id) || undefined;
  const ownerFirstName = formatTextValue(owner?.owner_first_name)
    || formatTextValue(owner?.first_name) || undefined;
  const ownerLastName = formatTextValue(owner?.owner_last_name)
    || formatTextValue(owner?.last_name) || undefined;
  const ownerProfileId = formatTextValue(owner?.user_profile_id)
    || formatTextValue(owner?.househelp_profile_id) || undefined;

  // The badge travels on the listing row rather than the nested profile: it is
  // computed from the KYC table in the same query, so it is present even when
  // the search endpoint returns listings without people attached.
  const ownerVerified = owner?.identity_verified === true;
  const ownerVerifiedAt = formatTextValue(owner?.identity_verified_at) || undefined;
  // Attached to the listing by the loader, from one batched call to payments.
  const ownerPremium = owner?.premium === true;
  const ownerPremiumTrial = owner?.premium_is_trial === true;

  if (!househelp) {
    if (!ownerUserId && !ownerFirstName) return undefined;
    return {
      id: ownerProfileId,
      user_id: ownerUserId,
      first_name: ownerFirstName,
      last_name: ownerLastName,
      identity_verified: ownerVerified,
      identity_verified_at: ownerVerifiedAt,
      premium: ownerPremium,
      premium_is_trial: ownerPremiumTrial,
      rating: toFiniteNumber(owner?.rating ?? owner?.owner_rating),
      review_count: toFiniteNumber(owner?.review_count ?? owner?.owner_review_count),
    };
  }

  const user = toRecord(househelp.user);

  return {
    ...househelp,
    id: formatTextValue(househelp.id) || ownerProfileId || undefined,
    // The nested profile wins when present; the listing's own owner fields are
    // the fallback rather than the other way round.
    user_id: formatTextValue(househelp.user_id) || ownerUserId || undefined,
    first_name: formatTextValue(househelp.first_name) || ownerFirstName || undefined,
    last_name: formatTextValue(househelp.last_name) || ownerLastName || undefined,
    // Strictly true or absent. A truthy-but-not-true value (the string "false",
    // say) must not light this up, since it is a claim about someone's identity.
    identity_verified: househelp.identity_verified === true || ownerVerified,
    identity_verified_at: formatTextValue(househelp.identity_verified_at) || ownerVerifiedAt,
    premium: househelp.premium === true || ownerPremium,
    premium_is_trial: househelp.premium_is_trial === true || ownerPremiumTrial,
    rating: toFiniteNumber(househelp.rating ?? owner?.rating ?? owner?.owner_rating),
    review_count: toFiniteNumber(househelp.review_count ?? owner?.review_count ?? owner?.owner_review_count),
    avatar_url: formatTextValue(househelp.avatar_url) || undefined,
    photos: toStringArray(househelp.photos),
    town: formatTextValue(househelp.town) || undefined,
    // Kept structured rather than flattened. formatTextValue would collapse the
    // location object to its `name`, which is just the ward, losing the
    // subcounty that makes a place recognisable.
    location: (househelp.location && typeof househelp.location === "object")
      ? househelp.location as Record<string, any>
      : formatTextValue(househelp.location) || undefined,
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
  // Through the shared reader rather than reaching into the shape here. It is
  // the one place that knows how a listing's picks arrive, and every copy of
  // that knowledge is somewhere the two sides can start disagreeing.
  const flattenedFeatureValues = readFeatureGroups(listing)
    .flatMap((group) => group.properties.map((property) => formatTextValue(property)))
    .filter(Boolean);
  const jobTypeName = firstString(
    listing.job_type_name,
    toRecord(listing.job_type)?.name,
    toRecord(listing.jobType)?.name,
    listing.title,
  );

  return {
    ...listing,
    id: formatTextValue(listing.id) || fallbackId,
    title: formatTextValue(listing.title) || undefined,
    description: formatTextValue(listing.description) || undefined,
    user_profile_id: formatTextValue(listing.user_profile_id || listing.userProfileId) || undefined,
    job_types: toStringArray(listing.job_types).length > 0
      ? toStringArray(listing.job_types)
      : jobTypeName
        ? [jobTypeName]
        : flattenedFeatureValues.slice(0, 2),
    available_from: formatTextValue(listing.available_from) || undefined,
    status: formatTextValue(listing.status) || undefined,
    created_at: formatTextValue(listing.created_at) || undefined,
    salary_min: toFiniteNumber(listing.salary_min),
    salary_max: toFiniteNumber(listing.salary_max),
    salary_frequency: formatTextValue(listing.salary_frequency) || undefined,
    fit_score: toFiniteNumber(listing.fit_score),
    match_reasons: toStringArray(listing.match_reasons),
    // Passed through untouched, so anything downstream reads the same shape
    // the service sent rather than one this function invented.
    listing_feature_groups: Array.isArray(listing.listing_feature_groups)
      ? listing.listing_feature_groups
      : [],
    listing_features: Array.isArray(listing.listing_features) ? listing.listing_features : [],
    househelp: normalizeHousehelp(
      listing.househelp || listing.user_profile || listing.userProfile,
      {
        ...listing,
        rating: listing.rating ?? listing.owner_rating,
        review_count: listing.review_count ?? listing.owner_review_count,
      },
    ),
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

const listingFeatureGroups = (listing: OpenForWorkListing) => (
  Array.isArray(listing.listing_feature_groups)
    ? listing.listing_feature_groups
        .map((group) => ({
          // Humanised, since the catalogue stores each feature as one
          // PascalCase token — the raw name reads "SalaryRange" on the card.
          name: humanizeFeatureName(formatTextValue(group.feature_name || group.name)) || "Feature",
          properties: Array.isArray(group.properties) ? group.properties.map((property) => formatTextValue(property)).filter(Boolean) : [],
        }))
        .filter((group) => group.properties.length > 0)
    : []
);

const formatListingStatus = (status?: string) => {
  const normalized = formatTextValue(status);
  if (!normalized) return "Open";
  return normalized.replace(/_/g, " ");
};

export default function HouseholdJobsHome() {
  const navigate = useNavigate();
  const currentUserId = useMemo(() => getStoredUserId(), []);
  const {
    isActive: hasActiveSubscription,
    status: subscriptionStatus,
    loading: subscriptionLoading,
  } = useSubscription(currentUserId);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const profileType = useMemo(() => getStoredCanonicalProfileType(), []);
  const isServiceProvider = profileType === "househelp";

  const [listings, setListings] = useState<OpenForWorkListing[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
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
  const [contactedListingIds, setContactedListingIds] = useState<Set<string>>(() => new Set());
  const [activeHouseholdJobs, setActiveHouseholdJobs] = useState<HouseholdJobListing[]>([]);
  const [activeJobsLoading, setActiveJobsLoading] = useState(false);
  const [showActiveJobs, setShowActiveJobs] = useState(false);
  const [editingHouseholdJob, setEditingHouseholdJob] = useState<HouseholdJobListing | null>(null);
  const [householdJobToDelete, setHouseholdJobToDelete] = useState<HouseholdJobListing | null>(null);
  const [householdJobActionId, setHouseholdJobActionId] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Kept between visits. Narrowing a search used to be thrown away when the
  // tab closed, so anyone returning daily redid the same work every day — and
  // the people who return daily are the ones actually looking.
  const viewerProfileId = useMemo(() => getStoredUserProfileId() || "", []);
  const {
    filters,
    setFilters,
    saved: savedFilters,
    saveNamed,
    applySaved,
    deleteSaved,
    restored: filtersRestored,
  } = useSavedFilters(viewerProfileId, DEFAULT_OPEN_FOR_WORK_FILTERS);
  const [sortBy, setSortBy] = useState("best_match");
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [inviteDraft, setInviteDraft] = useState(loadSavedInviteMessage());
  const [currentHouseholdProfileId, setCurrentHouseholdProfileId] = useState<string | null>(null);

  useEffect(() => {
    const handleRefresh = () => {
      setRefreshKey((value) => value + 1);
      setOffset(0);
      setListings([]);
      setHasMore(true);
    };
    window.addEventListener("homebit:refresh", handleRefresh);
    return () => window.removeEventListener("homebit:refresh", handleRefresh);
  }, []);

  const limit = 12;
  const backToPath = "/household/jobs";
  const profileCompletionReminder = useProfileCompletionReminder(currentUserId || "", "household");

  const buildInviteTemplate = useCallback((listing: OpenForWorkListing, variant: "skills" | "availability" = "skills") => {
    const househelp = listing.househelp || {};
    const user = househelp.user || {};
    const name = firstString(user.first_name, househelp.first_name, "there");
    const jobTypes = toStringArray(listing.job_types).map((type) => type.replace(/_/g, " ")).join(", ") || "your preferred role";
    const scheduleLabel = summarizeSchedule(listing.work_schedule) || "your ideal schedule";
    const location = formatPlace(househelp.location, { town: househelp.town }) || "your area";
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
  const hasActiveFilters = useMemo(
    () => Object.values(filters).some(Boolean),
    [filters]
  );
  const activeFilterCount = useMemo(
    () => Object.values(filters).filter(Boolean).length,
    [filters]
  );
  const clearFilters = () => setFilters({ ...DEFAULT_OPEN_FOR_WORK_FILTERS });
  // The filters themselves are applied by the service now, which is the only
  // place they can be applied correctly: this list is one page of twelve, and
  // narrowing a page in the browser hides results rather than finding them —
  // a ward with four matches on page nine looks empty until you scroll to it.
  //
  // What remains here is the one thing the page knows and the query does not:
  // whether a listing has lapsed since it was fetched.
  const filteredListings = useMemo(
    () => listings.filter((listing) => {
      if (!isServiceProvider && !isOpenForWorkListingActive(listing)) return false;
      // A listing the household has already approached belongs in Inbox/Hiring,
      // not discovery. Conversations are listing-scoped, so this remains
      // correct when the same househelp publishes a future opportunity.
      if (!isServiceProvider && contactedListingIds.has(String(listing.id))) return false;
      const minimum = Number(filters.minRating || 0);
      const rating = Number(listing.househelp?.rating ?? 0);
      return !minimum || rating >= minimum;
    }),
    [listings, isServiceProvider, filters.minRating, contactedListingIds],
  );

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

  const fetchActiveHouseholdJobs = useCallback(async () => {
    if (isServiceProvider || !currentHouseholdProfileId) return;
    setActiveJobsLoading(true);
    try {
      const raw = await householdJobService.listJobs(100, 0, currentHouseholdProfileId, "active");
      const payload = raw?.data ?? raw ?? [];
      const items = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
      setActiveHouseholdJobs(items as HouseholdJobListing[]);
    } catch {
      setActiveHouseholdJobs([]);
    } finally {
      setActiveJobsLoading(false);
    }
  }, [currentHouseholdProfileId, isServiceProvider]);

  useEffect(() => {
    void fetchActiveHouseholdJobs();
  }, [fetchActiveHouseholdJobs]);

  const updateHouseholdJob = async (job: HouseholdJobListing, action: "close" | "renew") => {
    setHouseholdJobActionId(job.id);
    setError(null);
    try {
      if (action === "close") {
        await householdJobService.closeJob(job.id, currentUserId);
        setActionSuccess("Job listing closed.");
      } else {
        await householdJobService.renewListing(job.id, currentHouseholdProfileId || undefined);
        setActionSuccess("Job kept open for another three weeks.");
      }
      await fetchActiveHouseholdJobs();
    } catch (err: any) {
      setError(err?.message || "Could not update this job listing.");
    } finally {
      setHouseholdJobActionId(null);
    }
  };

  const deleteHouseholdJob = async () => {
    if (!householdJobToDelete) return;
    setHouseholdJobActionId(householdJobToDelete.id);
    setError(null);
    try {
      await householdJobService.deleteJob(householdJobToDelete.id, currentUserId);
      setActionSuccess("Job listing deleted.");
      setHouseholdJobToDelete(null);
      await fetchActiveHouseholdJobs();
    } catch (err: any) {
      setError(err?.message || "Could not delete this job listing.");
    } finally {
      setHouseholdJobActionId(null);
    }
  };

  useEffect(() => {
    if (isServiceProvider || !currentUserId) return;
    let cancelled = false;
    const fetchContactedListings = async () => {
      try {
        const raw = await notificationsService.listConversations(currentUserId, 0, 200);
        if (cancelled) return;
        const conversations = Array.isArray(raw?.conversations)
          ? raw.conversations
          : Array.isArray(raw?.data)
            ? raw.data
            : Array.isArray(raw)
              ? raw
              : [];
        const ids = conversations
          .map((conversation: Record<string, any>) => conversation.listing_id ?? conversation.listingId)
          .filter((id: unknown) => id !== undefined && id !== null && String(id) !== '')
          .map(String);
        setContactedListingIds(new Set(ids));
      } catch {
        // Sending still resolves an existing listing-scoped conversation, so
        // duplicate outreach is prevented even if this decoration call fails.
      }
    };
    void fetchContactedListings();
    return () => { cancelled = true; };
  }, [currentUserId, isServiceProvider]);

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

  const searchKey = useMemo(
    () => JSON.stringify({ filters, sortBy, salaryRangeId: filters.salaryRangeId, isServiceProvider }),
    [filters, sortBy, isServiceProvider]
  );

  useEffect(() => {
    setOffset(0);
    setHasMore(true);
    setListings([]);
  }, [searchKey]);

  // The panel closes on a click outside it, and starts closed on every visit.
  //
  // Its open state used to be remembered across reloads, so a panel opened once
  // reappeared on every subsequent visit covering the results underneath — and
  // the only way to shut it was to find the toggle again. A filter sheet is a
  // transient thing: the filters themselves persist, whether the drawer happens
  // to be open does not.
  useEffect(() => {
    if (!filtersOpen) return;

    const dismiss = (event: MouseEvent) => {
      const target = event.target as Node;
      const panel = document.getElementById("household-listing-filters");
      // The toggle is excluded so its own click is not counted twice: it would
      // close the panel here and immediately reopen it in the button's handler.
      const toggle = document.getElementById("household-listing-filters-toggle");
      // CustomSelect menus are portalled to document.body to avoid clipping.
      // Although they are outside the panel in the DOM, they are still part of
      // this interaction and must not trigger the panel's outside-click close.
      const insideSelectMenu = target instanceof Element && Boolean(target.closest('[data-custom-select-panel="true"]'));
      if (panel?.contains(target) || toggle?.contains(target) || insideSelectMenu) return;
      setFiltersOpen(false);
    };

    document.addEventListener("mousedown", dismiss);
    return () => document.removeEventListener("mousedown", dismiss);
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
    // Wait for the stored filters before the first request. Otherwise the page
    // fetches once with the defaults and again when the saved set lands, and
    // the results visibly change under the person a beat after they appear.
    if (!filtersRestored) return;

    let cancelled = false;
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      try {

        // People, not job posts.
        //
        // This asked for listings without saying whose, and households' job
        // posts share a table with househelps' open-for-work posts — so a
        // household browsing "who is available" was shown job posts, its own
        // among them, with the job's title sitting where a househelp's skills
        // belong. owner: househelp restricts it to the people actually offering
        // to work.
        //
        // Scored against this household's own job, so whoever suits what they
        // are hiring for comes first. The score arrives as fit_score, which the
        // card already renders as a Match badge.
        // Chore, pet type, children age range, capacity and salary range are
        // all feature properties, and the pickers carry the catalogue's own
        // feature_properties ids, so they travel as one list — the same shape
        // the househelp board sends.
        const propertyIds = [
          filters.choreId,
          filters.petTypeId,
          filters.childrenAgeRangeId,
          filters.childrenCapacityId,
          filters.salaryRangeId,
          filters.startTimingId,
          filters.shiftWindowId,
        ]
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value) && value > 0);

        const raw = await jobService.searchJobs({
          limit,
          offset,
          status: "active",
          owner: "househelp",
          match_candidates_for_profile: getStoredUserProfileId() || "",
          ...(filters.jobType ? { job_type_id: Number(filters.jobType) } : {}),
          ...(propertyIds.length > 0 ? { property_ids: propertyIds } : {}),
        });
        const data = raw?.data || raw || [];
        const items = Array.isArray(data) ? data : [];
        const normalizedItems = items.map((item: unknown, index: number) => (
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
  }, [offset, searchKey, currentUserId, isServiceProvider, filtersRestored, refreshKey]);

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

    // Never return in silence.
    //
    // This used to be a bare `return`, so a card whose listing arrived without
    // an owner gave a button that did nothing at all — no navigation, no error,
    // nothing in the console. There is no way to tell that apart from a broken
    // app, and the person clicking has no idea whether to wait, retry, or pay
    // for something.
    if (!currentUserId) {
      setError("Please sign in again before starting a conversation.");
      return;
    }
    if (!househelpUserId) {
      setError("We couldn't work out who posted this listing, so we can't open a conversation. Please try again, or use View Profile.");
      return;
    }

    // Messaging needs a subscription, matching the home screen. Checked only
    // once the answer is known: while it is still loading, blocking would show
    // a paywall to somebody who has already paid.
    if (!hasActiveSubscription && !subscriptionLoading) {
      setShowSubscriptionModal(true);
      return;
    }

    try {
      const convId = await startOrGetConversation(NOTIFICATIONS_API_BASE_URL, {
        household_user_id: currentUserId,
        househelp_user_id: househelpUserId,
        househelp_profile_id: househelpProfileId,
        // The open-for-work post being answered, so this thread belongs to it.
        listing_id: listing.id,
      });
      navigate(getInboxRoute(convId));
    } catch (err) {
      console.error("Failed to start conversation", err);
      navigate("/inbox");
    }
  };

  const handleOpenInviteModal = (listing: OpenForWorkListing, options?: { template?: "skills" | "availability" }) => {
    if (contactedListingIds.has(String(listing.id))) {
      setActionSuccess("You have already contacted this househelp about this listing. Open Inbox to continue the conversation.");
      return;
    }
    // Invite sends a message too, so gating one path and not the other would be
    // a paywall with a hole beside it — and the hole is a button on the same
    // card. Checked when the composer opens rather than on send, so nobody
    // writes a note and is then told they cannot deliver it.
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
    if (contactedListingIds.has(String(selectedInviteListing.id))) {
      setInviteError("You have already contacted this househelp about this listing. Open Inbox to continue the conversation.");
      return;
    }
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

    setInviteLoading(true);
    setInviteError(null);
    try {
      const payload: StartConversationPayload = {
        household_user_id: currentUserId,
        househelp_user_id: househelpUserId,
      };
      if (currentHouseholdProfileId) payload.household_profile_id = currentHouseholdProfileId;
      if (selectedInviteListing.househelp?.id) payload.househelp_profile_id = selectedInviteListing.househelp.id;
      // The open-for-work post being answered. A household approaching the same
      // househelp about a different post gets a separate thread, which is what
      // keeps "which job was this about" answerable later.
      if (selectedInviteListing.id) payload.listing_id = selectedInviteListing.id;

      const convId = await startOrGetConversation(NOTIFICATIONS_API_BASE_URL, payload);
      if (!convId) throw new Error("We couldn't open a conversation just yet.");

      await notificationsService.sendMessage(convId, body, '', currentUserId, currentHouseholdProfileId || '', 'household');
      setContactedListingIds((previous) => new Set(previous).add(String(selectedInviteListing.id)));
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
        if (isServiceProvider) {
          setShortlistedListingIds((prev) => {
            const next = new Set(prev);
            next.delete(listing.id);
            return next;
          });
          setActionSuccess("Listing removed from your shortlist.");
          return;
        }

        await shortlistService.deleteShortlist(listing.id);
        setShortlistedListingIds((prev) => {
          const next = new Set(prev);
          next.delete(listing.id);
          return next;
        });
        setActionSuccess("Listing removed from your shortlist.");
      } else {
        if (isServiceProvider) {
          const serviceProviderId = getStoredUserProfileId();
          if (!serviceProviderId) {
            throw new Error("User profile information is missing. Please sign in again.");
          }

          await listingApplicationService.shortlistListing(listing.id, serviceProviderId);
        } else {
          await shortlistService.createShortlist('', 'household', {
            profile_id: listing.id,
            profile_type: 'open_for_work',
          });
        }
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
        <main className="flex-1 pb-10">
          <section className="hb-safe-sticky-below-nav sticky z-30 mb-4 h-14 w-full border-b border-purple-200/60 bg-white/90 shadow-sm backdrop-blur-xl dark:border-purple-500/20 dark:bg-[#0d0914]/90 sm:h-16">
            <div className="hb-content-rail flex h-full items-center gap-2 sm:gap-3">
              <div className="hidden min-w-0 flex-1 sm:block">
                <h1 className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {isServiceProvider ? "Job listings" : "Open for work"}
                </h1>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {sortedListings.length} {sortedListings.length === 1 ? "listing" : "listings"} available
                </p>
              </div>

              {!isServiceProvider && (
                <button
                  type="button"
                  onClick={() => setShowActiveJobs(true)}
                  disabled={activeJobsLoading}
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-3 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-500/15 disabled:cursor-wait disabled:opacity-70 dark:text-emerald-200"
                  aria-label="View your active job listings"
                >
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden md:inline">
                    {activeJobsLoading
                      ? "Checking active jobs…"
                      : `${activeHouseholdJobs.length} ${activeHouseholdJobs.length === 1 ? "job listing" : "job listings"} active`}
                  </span>
                  <span className={`h-2 w-2 rounded-full ${activeHouseholdJobs.length > 0 ? "bg-emerald-400" : "bg-gray-400"}`} />
                </button>
              )}


              <label className="min-w-0 flex-1 sm:flex-none">
                <span className="sr-only">Sort listings</span>
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
                  className="w-full sm:w-[180px]"
                  size="sm"
                  placeholder="Best match"
                />
              </label>

              <button
                type="button"
                onClick={() => setFiltersOpen((prev) => !prev)}
                id="household-listing-filters-toggle"
                aria-label={filtersOpen ? "Hide listing filters" : "Show listing filters"}
                aria-expanded={filtersOpen}
                aria-controls="household-listing-filters"
                className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-purple-200/70 bg-white/80 px-3 text-xs font-semibold text-purple-700 transition hover:bg-purple-50 dark:border-purple-500/40 dark:bg-white/10 dark:text-purple-200 dark:hover:bg-purple-500/10"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>
                  {!filtersOpen && activeFilterCount > 0
                    ? `${activeFilterCount} ${activeFilterCount === 1 ? 'filter' : 'filters'} applied`
                    : 'Filters'}
                </span>
                {filtersOpen && activeFilterCount > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-1 text-[10px] text-white shadow-sm">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown className={`h-3.5 w-3.5 transition ${filtersOpen ? "rotate-180" : ""}`} />
              </button>
            </div>

            {filtersOpen && (
              <div
                id="household-listing-filters"
                className="hb-filter-panel absolute left-0 right-0 top-full max-h-[calc(100vh-120px)] overflow-y-auto border-b border-purple-200/60 bg-white/95 pb-4 shadow-2xl backdrop-blur-xl dark:border-purple-500/30 dark:bg-[#141020]/95"
              >
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
                    Can start
                    <CustomSelect
                      value={filters.startTimingId}
                      onChange={(value) => setFilters((prev) => ({ ...prev, startTimingId: value }))}
                      options={[
                        { value: "", label: "Any time" },
                        ...(onboardingOptions?.start_timing?.map((option) => ({ value: String(option.id), label: option.name })) ?? []),
                      ]}
                      className="w-full"
                      size="sm"
                      placeholder="Any time"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Time of day
                    <CustomSelect
                      value={filters.shiftWindowId}
                      onChange={(value) => setFilters((prev) => ({ ...prev, shiftWindowId: value }))}
                      options={[
                        { value: "", label: "Any time of day" },
                        ...(onboardingOptions?.shift_window?.map((option) => ({ value: String(option.id), label: option.name })) ?? []),
                      ]}
                      className="w-full"
                      size="sm"
                      placeholder="Any time of day"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Minimum rating
                    <CustomSelect
                      value={filters.minRating}
                      onChange={(value) => setFilters((prev) => ({ ...prev, minRating: value }))}
                      options={[
                        { value: "", label: "Any rating" },
                        { value: "4", label: "4★ and above" },
                        { value: "3", label: "3★ and above" },
                        { value: "2", label: "2★ and above" },
                      ]}
                      className="w-full"
                      size="sm"
                      placeholder="Any rating"
                    />
                  </label>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200 font-semibold">
                      {isServiceProvider ? `${listings.length} active listings` : `${openListingsCount} open now`}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300">
                      {listings.length} total listings
                    </span>
                    {hasActiveFilters && (
                      <span className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 font-semibold text-white">
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

                <SavedFilterBar
                  saved={savedFilters}
                  hasActiveFilters={hasActiveFilters}
                  onSave={saveNamed}
                  onApply={applySaved}
                  onDelete={deleteSaved}
                  notifySubject="new househelps"
                />
              </div>
            )}
          </section>
          <div className="hb-content-rail flex flex-col">
            {profileCompletionReminder.shouldShow && (
              <ProfileCompletionBanner
                title={profileCompletionReminder.title}
                description={profileCompletionReminder.description}
                ctaLabel={profileCompletionReminder.ctaLabel}
                completedItems={profileCompletionReminder.completedItems}
                totalItems={profileCompletionReminder.totalItems}
                progressValue={profileCompletionReminder.progressValue}
                onContinue={() => navigate(profileCompletionReminder.destination)}
              />
            )}
            {profileCompletionReminder.shouldShowCelebration && (
              <ProfileCompletionCelebrationModal
                isOpen
                profileType="household"
                celebration={profileCompletionReminder.celebration}
                onSeen={profileCompletionReminder.markCelebrationSeen}
                onClose={() => void profileCompletionReminder.markCelebrationSeen()}
              />
            )}


            {error && <ErrorAlert message={error} className="mb-6" onClose={() => setError(null)} />}
            {actionSuccess && <SuccessAlert message={actionSuccess} className="mb-6" onClose={() => setActionSuccess(null)} />}

            {loading ? (
              <ShimmerListPlaceholder items={4} />
            ) : sortedListings.length === 0 ? (
              <div className="bg-white dark:bg-[#13131a] border-2 border-purple-200 dark:border-purple-500/30 rounded-2xl p-10 sm:p-14 text-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {hasActiveFilters
                    ? "No listings match your filters"
                    : isServiceProvider
                      ? "No job listings yet"
                      : "No open listings yet"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
                  {hasActiveFilters
                    ? isServiceProvider
                      ? "Try adjusting your filters or clear them to see more job listings."
                      : "Try adjusting your filters or clear them to see more househelps."
                    : isServiceProvider
                      ? "When households create active job listings, they will appear here."
                      : "When househelps mark themselves as open to work, their listings will appear here."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedListings.map((listing) => {
                  const househelp = listing.househelp || {};
                  const user = househelp.user || {};
                  const name = `${firstString(user.first_name, househelp.first_name)} ${firstString(user.last_name, househelp.last_name)}`.trim() || "Househelp";
                  const jobTypes = toStringArray(listing.job_types);
                  const cardTitle = isServiceProvider ? (listing.title || jobTypes[0] || "Job listing") : name;
                  const initials = cardTitle.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || (isServiceProvider ? "JL" : "HW");
                  const userId = firstString(househelp.user_id, user.id);
                  const photos = toStringArray(househelp.photos);
                  const avatar = firstString(househelp.avatar_url, photos[0], profilePhotos[userId]);
                  const scheduleLabel = summarizeSchedule(listing.work_schedule);
                  const location = formatPlaceOrFallback(househelp.location, { town: househelp.town });
                  const experienceYears = toFiniteNumber(househelp.years_of_experience);
                  const shortlisted = shortlistedListingIds.has(listing.id);
                  const isOpen = isOpenForWorkListingActive(listing);
                  const responseBadge = deriveHousehelpResponsivenessBadge(listing.househelp);
                  const featureGroups = listingFeatureGroups(listing);

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
                      className="cursor-pointer rounded-2xl border border-purple-200/50 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-purple-300/70 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-purple-400 dark:border-purple-500/25 dark:bg-[#13131a] sm:p-6"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center text-lg font-bold overflow-hidden">
                          {!isServiceProvider && avatar ? (
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
                          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 lg:grid-cols-[minmax(260px,0.9fr)_minmax(320px,1.2fr)_auto] lg:gap-8">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="min-w-0 text-base font-semibold text-gray-900 dark:text-white sm:text-lg">{cardTitle}</h3>
                                {/* Beside the name, the way every other platform
                                    places it — an employer scanning a list reads
                                    the tick as part of the person, not as one
                                    more chip among the match scores. */}
                                {househelp.identity_verified && (
                                  <VerifiedBadge verifiedAt={househelp.identity_verified_at} />
                                )}
                                {househelp.premium && (
                                  <PremiumBadge isTrial={househelp.premium_is_trial} />
                                )}
                                {typeof listing.fit_score === "number" && listing.fit_score >= 0 && (
                                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${matchScoreClasses(listing.fit_score)}`}>
                                    Match {listing.fit_score}%
                                  </span>
                                )}
                              </div>
                              {!isServiceProvider && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">📍 {location}</p>
                              )}
                              {!isServiceProvider && (
                                <ListingRating rating={househelp.rating} reviewCount={househelp.review_count} className="mt-1" />
                              )}
                              {isServiceProvider && listing.description && (
                                <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-300">{listing.description}</p>
                              )}
                              {!isServiceProvider && responseBadge && (
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
                            <ListingCardFacts listing={listing} />
                            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleShortlist(listing);
                                }}
                                disabled={shortlistLoadingId === listing.id}
                                className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition sm:h-9 sm:w-9 ${
                                  shortlisted
                                    ? "border-pink-400 bg-pink-500 text-white"
                                    : "border-purple-200/70 bg-white text-purple-700 hover:bg-purple-50 dark:border-purple-500/30 dark:bg-white/10 dark:text-purple-200 dark:hover:bg-purple-500/10"
                                } disabled:opacity-60`}
                                aria-label={shortlisted ? "Remove listing from saved" : "Save listing"}
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
                              !isServiceProvider && (
                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300">
                                  Flexible role
                                </span>
                              )
                            )}
                            {!isServiceProvider && (
                              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
                                Available {formatDate(listing.available_from)}
                              </span>
                            )}
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
                                  {humanizeFeatureName(reason)}
                                </span>
                              ))}
                            </div>
                          )}

                          {isServiceProvider && featureGroups.length > 0 ? (
                            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                              {featureGroups.slice(0, 4).map((group) => (
                                <div key={group.name} className="rounded-xl border border-purple-500/20 bg-purple-950/20 p-2">
                                  <p className="text-[10px] font-bold uppercase tracking-wide text-purple-200">{group.name}</p>
                                  <div className="mt-1 flex flex-wrap gap-1.5">
                                    {group.properties.slice(0, 3).map((property) => (
                                      <span key={property} className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[11px] font-semibold text-purple-50">
                                        {property}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
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
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-gray-400">Updated {formatTimeAgo(listing.created_at)}</span>
                        <div className="flex gap-2">
                          {isServiceProvider ? (
                            <button
                              onClick={(event) => { event.stopPropagation(); handleOpenListingModal(listing); }}
                              className="px-4 py-1.5 text-xs font-semibold rounded-xl border border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-500/40 dark:text-purple-200 dark:hover:bg-purple-500/10"
                            >
                              View Details
                            </button>
                          ) : (
                            <Link
                              to={`/househelp/public-profile?profileId=${encodeURIComponent(String(listing.househelp?.id || ''))}&openForWorkId=${encodeURIComponent(String(listing.id))}`}
                              prefetch="intent"
                              onPointerEnter={() => {
                                if (listing.househelp?.id) void resolveHousehelpProfile(String(listing.househelp.id), { identifierType: 'auto' });
                              }}
                              onClick={(event) => event.stopPropagation()}
                              className="px-4 py-1.5 text-xs font-semibold rounded-xl border border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-500/40 dark:text-purple-200 dark:hover:bg-purple-500/10"
                            >
                              View Profile
                            </Link>
                          )}
                          {!isServiceProvider && (
                            <>
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
                            </>
                          )}
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
        const jobTypes = toStringArray(selectedListing.job_types);
        const modalTitle = isServiceProvider ? (selectedListing.title || jobTypes[0] || "Job listing") : name;
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
        const location = formatPlaceOrFallback(househelp.location, { town: househelp.town });
        const experienceYears = toFiniteNumber(househelp.years_of_experience);
        const shortlisted = shortlistedListingIds.has(selectedListing.id);
        const isOpen = isOpenForWorkListingActive(selectedListing);
        const responseBadge = deriveHousehelpResponsivenessBadge(selectedListing.househelp);
        const featureGroups = listingFeatureGroups(selectedListing);

        return (
          <div className="hb-mobile-modal-viewport fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseListingModal} />
            <div className="relative w-full sm:max-w-2xl bg-white dark:bg-[#1b1524] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-purple-200/50 dark:border-purple-700/40 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-purple-500 dark:text-purple-300 font-semibold">
                    {isServiceProvider ? "Job listing" : "Open for work"}
                  </p>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-2">{modalTitle}</h2>
                  {!isServiceProvider && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">📍 {location}</p>}
                  {isServiceProvider && selectedListing.description && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">{selectedListing.description}</p>
                  )}
                  {!isServiceProvider && responseBadge && (
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
                  {!isServiceProvider && avatar ? (
                    <OptimizedImage
                      path={avatar}
                      alt={name}
                      className="w-full h-full object-cover"
                      onError={(e: any) => { e.currentTarget.style.display = "none"; }}
                    />
                  ) : isServiceProvider ? "JL" : (initials || "HW")}
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
                    {!isServiceProvider && (
                      <>
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
                      </>
                    )}
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
              {isServiceProvider && featureGroups.length > 0 && (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {featureGroups.map((group) => (
                    <div key={group.name} className="rounded-2xl border border-purple-500/20 bg-purple-950/20 p-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-purple-200">{group.name}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {group.properties.map((property) => (
                          <span key={property} className="rounded-full bg-purple-500/20 px-2.5 py-1 text-xs font-semibold text-purple-50">
                            {property}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                {!isServiceProvider && (
                  <>
                    <Link
                      to={`/househelp/public-profile?profileId=${encodeURIComponent(String(selectedListing.househelp?.id || ''))}&openForWorkId=${encodeURIComponent(String(selectedListing.id))}`}
                      prefetch="intent"
                      onPointerEnter={() => {
                        if (selectedListing.househelp?.id) void resolveHousehelpProfile(String(selectedListing.househelp.id), { identifierType: 'auto' });
                      }}
                      className="px-4 py-2 text-xs font-semibold rounded-xl border border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-500/40 dark:text-purple-200 dark:hover:bg-purple-500/10"
                    >
                      View Profile
                    </Link>
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
                          ? "Saved"
                          : "Save"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}
      {selectedInviteListing && (() => {
        const househelp = selectedInviteListing.househelp || {};
        const user = househelp.user || {};
        const name = `${firstString(user.first_name, househelp.first_name)} ${firstString(user.last_name, househelp.last_name)}`.trim() || 'Househelp';
        const location = formatPlaceOrFallback(househelp.location, { town: househelp.town });
        return (
          <div className="hb-mobile-modal-viewport fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseInviteModal} />
            <div className="relative w-full sm:max-w-lg bg-white dark:bg-[#1b1524] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-purple-200/50 dark:border-purple-700/40 p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-purple-500 dark:text-purple-300 font-semibold">Invite househelp</p>
                  <h2 className="flex items-center gap-1.5 text-lg font-bold text-gray-900 dark:text-white">
                    {name}
                    {househelp.identity_verified && (
                      <VerifiedBadge verifiedAt={househelp.identity_verified_at} showLabel />
                    )}
                    {househelp.premium && (
                      <PremiumBadge isTrial={househelp.premium_is_trial} showLabel />
                    )}
                  </h2>
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
      {showActiveJobs && (
        <div className="hb-mobile-modal-viewport fixed inset-0 z-[120] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setShowActiveJobs(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="active-jobs-title"
            className="flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-purple-500/30 bg-white shadow-2xl dark:bg-[#15101f] sm:rounded-3xl"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-4 border-b border-purple-100 px-5 py-4 dark:border-purple-500/20 sm:px-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-300">Your listings</p>
                <h2 id="active-jobs-title" className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                  {activeHouseholdJobs.length} active {activeHouseholdJobs.length === 1 ? "job" : "jobs"}
                </h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Manage the roles currently visible to househelps.</p>
              </div>
              <button type="button" onClick={() => setShowActiveJobs(false)} className="rounded-full border border-purple-200 p-2 text-purple-700 hover:bg-purple-50 dark:border-purple-500/30 dark:text-purple-200 dark:hover:bg-purple-500/10" aria-label="Close active job listings">
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="space-y-3 overflow-y-auto p-4 sm:p-6">
              {activeHouseholdJobs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-purple-300 p-10 text-center dark:border-purple-500/30">
                  <Briefcase className="mx-auto h-8 w-8 text-purple-400" />
                  <h3 className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">No active job listings</h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Create or reopen a listing from Hiring when you are ready.</p>
                </div>
              ) : activeHouseholdJobs.map((job) => (
                <article
                  key={job.id}
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    if (event.target instanceof Element && event.target.closest('button')) return;
                    setShowActiveJobs(false);
                    navigate(`/household/hiring?tab=jobs&job=${encodeURIComponent(job.id)}`);
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    setShowActiveJobs(false);
                    navigate(`/household/hiring?tab=jobs&job=${encodeURIComponent(job.id)}`);
                  }}
                  className="cursor-pointer rounded-2xl border border-purple-200 bg-purple-50/40 p-4 transition hover:-translate-y-0.5 hover:border-purple-400 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 dark:border-purple-500/25 dark:bg-purple-950/20 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-gray-900 dark:text-white">{job.title || "Untitled role"}</h3>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300">{job.description || "No description provided."}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">Active</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                    <div><p className="text-[10px] uppercase tracking-wide text-gray-400">Salary</p><p className="mt-1 font-medium text-gray-800 dark:text-gray-200">{formatJobSalary(job)}</p></div>
                    <div><p className="text-[10px] uppercase tracking-wide text-gray-400">Posted</p><p className="mt-1 font-medium text-gray-800 dark:text-gray-200">{job.created_at ? formatTimeAgo(job.created_at) : "Recently"}</p></div>
                    <div><p className="text-[10px] uppercase tracking-wide text-gray-400">Expiry</p><p className="mt-1 font-medium text-gray-800 dark:text-gray-200">{describeJobExpiry(job.expires_at)}</p></div>
                  </div>
                  <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-purple-100 pt-4 dark:border-purple-500/20">
                    <button type="button" onClick={() => setEditingHouseholdJob(job)} className="rounded-xl border border-purple-300 px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 dark:border-purple-500/40 dark:text-purple-200 dark:hover:bg-purple-500/10">Edit</button>
                    <button type="button" onClick={() => void updateHouseholdJob(job, "close")} disabled={householdJobActionId === job.id} className="rounded-xl border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-white/5">Close</button>
                    <button type="button" onClick={() => void updateHouseholdJob(job, "renew")} disabled={householdJobActionId === job.id} className="rounded-xl border border-purple-300 px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 disabled:opacity-50 dark:border-purple-500/40 dark:text-purple-200 dark:hover:bg-purple-500/10">{householdJobActionId === job.id ? "Updating…" : "Keep open"}</button>
                    <button type="button" onClick={() => setHouseholdJobToDelete(job)} disabled={householdJobActionId === job.id} className="rounded-xl border border-red-300 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10">Delete</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
      <JobPostModal
        isOpen={Boolean(editingHouseholdJob)}
        onClose={() => setEditingHouseholdJob(null)}
        job={editingHouseholdJob}
        onSaved={() => {
          setEditingHouseholdJob(null);
          setActionSuccess("Job listing updated.");
          void fetchActiveHouseholdJobs();
        }}
      />
      <ConfirmDialog
        isOpen={Boolean(householdJobToDelete)}
        title="Delete job listing"
        message="Delete this job listing? This cannot be undone."
        confirmText={householdJobActionId === householdJobToDelete?.id ? "Deleting…" : "Delete"}
        cancelText="Cancel"
        onConfirm={deleteHouseholdJob}
        onCancel={() => setHouseholdJobToDelete(null)}
        variant="danger"
      />
      {/* Same wording and destination as the home screen, so the two places a
          household can start a conversation now behave identically. */}
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
