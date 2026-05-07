import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { openForWorkService } from "~/services/grpc/authServices";
import { OptimizedImage } from "~/components/ui/OptimizedImage";
import { useProfilePhotos } from "~/hooks/useProfilePhotos";
import { getStoredUserId } from "~/utils/authStorage";
import { useSubscription } from "~/hooks/useSubscription";
import { SubscriptionRequiredModal } from "~/components/subscriptions/SubscriptionRequiredModal";
import { NOTIFICATIONS_API_BASE_URL } from "~/config/api";
import { getInboxRoute, startOrGetConversation } from "~/utils/conversationLauncher";
import { ErrorAlert } from "~/components/ui/ErrorAlert";
import { formatTimeAgo } from "~/utils/timeAgo";

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

interface OpenForWorkListing {
  id: string;
  job_types?: string[];
  available_from?: string;
  work_schedule?: Record<string, { morning?: boolean; afternoon?: boolean; evening?: boolean }>;
  can_work_with_kids?: boolean;
  can_work_with_pets?: boolean;
  status?: string;
  created_at?: string;
  househelp?: HousehelpSummary;
}

const formatDate = (value?: string) => {
  if (!value) return "Flexible";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Flexible";
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatSalary = (amount?: number, frequency?: string) => {
  if (!amount) return "Not specified";
  const freqLabel = frequency ? ` / ${frequency}` : "";
  return `KES ${amount.toLocaleString()}${freqLabel}`;
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

  const limit = 12;

  const househelpUserIds = useMemo(
    () => listings.map((listing) => listing.househelp?.user_id || listing.househelp?.user?.id).filter(Boolean) as string[],
    [listings]
  );
  const profilePhotos = useProfilePhotos(househelpUserIds);

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
        if (cancelled) return;
        setListings((prev) => (offset === 0 ? items : [...prev, ...items]));
        setHasMore(offset + items.length < total);
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
    navigate(`/househelp/public-profile?profileId=${encodeURIComponent(profileId)}`);
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

            {error && <ErrorAlert message={error} className="mb-6" />}

            {loading && listings.length === 0 ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
              </div>
            ) : listings.length === 0 ? (
              <div className="bg-white dark:bg-[#13131a] border-2 border-purple-200 dark:border-purple-500/30 rounded-2xl p-10 sm:p-14 text-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No open listings yet</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
                  When househelps mark themselves as open to work, their listings will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {listings.map((listing) => {
                  const househelp = listing.househelp || {};
                  const user = househelp.user || {};
                  const name = `${user.first_name || househelp.first_name || ""} ${user.last_name || househelp.last_name || ""}`.trim() || "Househelp";
                  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "HW";
                  const avatar = househelp.avatar_url || househelp.photos?.[0] || profilePhotos[househelp.user_id || user.id || ""];
                  const scheduleLabel = summarizeSchedule(listing.work_schedule);
                  const jobTypes = listing.job_types || [];
                  const location = househelp.town || househelp.location || "Location not specified";

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
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200">
                              Open
                            </span>
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
                            <p>Experience: {househelp.years_of_experience ? `${househelp.years_of_experience} yrs` : "Not specified"}</p>
                            <p>Salary: {formatSalary(househelp.salary_expectation, househelp.salary_frequency)}</p>
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
