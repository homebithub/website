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
import { Heart } from "lucide-react";

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
  can_work_with_kids?: boolean;
  can_work_with_pets?: boolean;
  status?: string;
  created_at?: string;
  salary_min?: number;
  salary_max?: number;
  salary_frequency?: string;
  househelp?: HousehelpSummary;
}

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
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const limit = 12;

  const househelpUserIds = useMemo(
    () => listings.map((listing) => firstString(listing.househelp?.user_id, listing.househelp?.user?.id)).filter(Boolean),
    [listings]
  );
  const profilePhotos = useProfilePhotos(househelpUserIds);
  const openListingsCount = useMemo(
    () => listings.filter((listing) => isOpenForWorkListingActive(listing)).length,
    [listings]
  );
  const filteredListings = useMemo(
    () => (openOnly ? listings.filter((listing) => isOpenForWorkListingActive(listing)) : listings),
    [listings, openOnly]
  );

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

            <div className="mb-6 rounded-2xl border border-purple-200/60 dark:border-purple-500/30 bg-white/80 dark:bg-[#141020]/80 p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-purple-500 dark:text-purple-300 font-semibold">Filters</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Focus on househelps who are ready to start now.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOpenOnly(true)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition border ${
                      openOnly
                        ? "bg-purple-600 border-purple-500 text-white shadow-sm"
                        : "bg-white border-purple-200 text-purple-700 hover:bg-purple-50 dark:bg-white/10 dark:border-purple-500/30 dark:text-purple-200 dark:hover:bg-purple-500/10"
                    }`}
                  >
                    Open to work
                  </button>
                  <button
                    onClick={() => setOpenOnly(false)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition border ${
                      !openOnly
                        ? "bg-purple-600 border-purple-500 text-white shadow-sm"
                        : "bg-white border-purple-200 text-purple-700 hover:bg-purple-50 dark:bg-white/10 dark:border-purple-500/30 dark:text-purple-200 dark:hover:bg-purple-500/10"
                    }`}
                  >
                    All listings
                  </button>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-xs">
                <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200 font-semibold">
                  {openListingsCount} open now
                </span>
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300">
                  {listings.length} total listings
                </span>
              </div>
            </div>

            {error && <ErrorAlert message={error} className="mb-6" />}

            {loading && filteredListings.length === 0 ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="bg-white dark:bg-[#13131a] border-2 border-purple-200 dark:border-purple-500/30 rounded-2xl p-10 sm:p-14 text-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {openOnly ? "No open listings yet" : "No listings yet"}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
                  {openOnly
                    ? "When househelps mark themselves as open to work, their listings will appear here."
                    : "When househelps create listings, they will appear here."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredListings.map((listing) => {
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
