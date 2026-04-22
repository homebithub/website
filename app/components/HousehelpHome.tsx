import { getAccessTokenFromCookies } from '~/utils/cookie';
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { OptimizedImage } from "~/components/ui/OptimizedImage";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { NOTIFICATIONS_API_BASE_URL } from "~/config/api";
import { profileService as grpcProfileService, shortlistService } from '~/services/grpc/authServices';
import { getInboxRoute, startOrGetConversation, type StartConversationPayload } from '~/utils/conversationLauncher';
import HouseholdFilters, { type HouseholdSearchFields } from "~/components/features/HouseholdFilters";
import { SidePanel } from '~/components/SidePanel';
import { ChatBubbleLeftRightIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { formatTimeAgo } from "~/utils/timeAgo";
import OnboardingTipsBanner from "~/components/OnboardingTipsBanner";
import { fetchPreferences } from "~/utils/preferencesApi";
import SearchableTownSelect from "~/components/ui/SearchableTownSelect";
import CustomSelect from "~/components/ui/CustomSelect";
import { useProfilePhotos } from '~/hooks/useProfilePhotos';
import { getStoredProfileType, getStoredUser, getStoredUserId } from '~/utils/authStorage';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { useSubscription } from '~/hooks/useSubscription';
import { SubscriptionRequiredModal } from '~/components/subscriptions/SubscriptionRequiredModal';

interface HouseholdItem {
  id?: string; // household user id
  profile_id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  town?: string;
  house_size?: string;
  verified?: boolean;
  created_at?: string;
};

const getFriendlyErrorMessage = (error?: string | null) => {
  if (!error) return "";
  const trimmed = error.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object") {
        if (typeof parsed.message === "string") return parsed.message;
        if (typeof parsed.error === "string") return parsed.error;
      }
    } catch {
      // fall back to original string
    }
  }
  return error;
};

export default function HousehelpHome() {
  type FilterState = HouseholdSearchFields & { town: string; house_size: string; verified: string };
  const [filters, setFilters] = useState<FilterState>({
    town: "",
    house_size: "",
    verified: "",
    has_kids: "",
    has_pets: "",
    type_of_househelp: "",
    available_from: "",
    needs_live_in: "",
    needs_day_worker: "",
    budget_min: "",
    budget_max: "",
    salary_frequency: "",
    religion: "",
    chore: "",
    min_rating: "",
  });
  const [results, setResults] = useState<HouseholdItem[]>([]);

  // Fetch profile photos from documents table for household results
  const householdUserIds = useMemo(() => {
    if (!Array.isArray(results)) return [];
    return results.map(r => r.id).filter(Boolean) as string[];
  }, [results]);
  const profilePhotos = useProfilePhotos(householdUserIds);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const countTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [shortlistedProfiles, setShortlistedProfiles] = useState<Set<string>>(new Set());
  const [showTips, setShowTips] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [accessibilityMode, setAccessibilityMode] = useState(false);

  const NOTIFICATIONS_BASE = useMemo(
    () => (typeof window !== "undefined" && (window as any).ENV?.NOTIFICATIONS_API_BASE_URL) || NOTIFICATIONS_API_BASE_URL,
    []
  );
  const navigate = useNavigate();
  const currentUser = useMemo(() => getStoredUser(), []);
  const currentUserId: string | undefined = currentUser?.user_id || currentUser?.id || getStoredUserId() || undefined;
  const currentProfileType: string | undefined = currentUser?.profile_type || getStoredProfileType() || undefined;
  const { isActive: hasActiveSubscription, status: subscriptionStatus, loading: subscriptionLoading } = useSubscription(currentUserId);
  const [currentHouseholdProfileId, setCurrentHouseholdProfileId] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

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

    const loadPrefs = async () => {
      try {
        const hiddenForSession = typeof window !== 'undefined' && sessionStorage.getItem("hide_onboarding_tips") === "1";
        const prefs = await fetchPreferences();
        if (cancelled) return;
        const settings = prefs?.settings || {};
        setCompactView(Boolean(settings.compact_view));
        setAccessibilityMode(Boolean(settings.accessibility_mode));
        if (!hiddenForSession) {
          setShowTips(Boolean(settings.show_onboarding));
        } else {
          setShowTips(false);
        }
      } catch {
        if (!cancelled) {
          setShowTips(false);
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

  const handleDismissTips = () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem("hide_onboarding_tips", "1");
      }
    } catch {
      // ignore storage errors
    }
    setShowTips(false);
  };

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Actions
  const handleViewMore = (item: HouseholdItem) => {
    const profileUrl = item?.id
      ? `/household/public-profile?userId=${item.id}&backTo=${encodeURIComponent('/')}&backLabel=${encodeURIComponent('Back to results')}`
      : item?.profile_id
        ? `/household/public-profile?profileId=${item.profile_id}&backTo=${encodeURIComponent('/')}&backLabel=${encodeURIComponent('Back to results')}`
        : null;

    if (!profileUrl) return;

    navigate(profileUrl, {
      state: { profileId: item.profile_id || item.id, backTo: '/', backLabel: 'Back to results' },
    });
  };

  const handleStartChat = async (householdUserId?: string) => {
    try {
      if (!householdUserId) throw new Error('Missing household user id');
      if (!currentUserId) throw new Error('Missing current user id');
      if (!hasActiveSubscription && !subscriptionLoading) {
        setShowSubscriptionModal(true);
        return;
      }

      const profileType = (currentProfileType || '').toLowerCase();
      let householdId = householdUserId;
      let househelpId = currentUserId;

      if (profileType === 'household') {
        householdId = currentUserId;
        househelpId = householdUserId;
      }

      const payload: StartConversationPayload = {
        household_user_id: householdId,
        househelp_user_id: househelpId,
      };
      
      // Include household_profile_id if current user is household
      if (profileType === 'household' && currentHouseholdProfileId) {
        payload.household_profile_id = currentHouseholdProfileId;
      }

      const convId = await startOrGetConversation(NOTIFICATIONS_BASE, payload);
      navigate(getInboxRoute(convId));
    } catch (err) {
      console.error('Failed to start chat from households list', err);
      navigate('/inbox');
    }
  };

  const handleShortlist = async (profileId: string) => {
    if (!profileId) return;
    try {
      setActionError(null);
      setActionSuccess(null);
      const isShortlisted = shortlistedProfiles.has(profileId);
      if (isShortlisted) {
        await shortlistService.deleteShortlist(profileId);
        setShortlistedProfiles((prev) => {
          const next = new Set(prev);
          next.delete(profileId);
          return next;
        });
        setActionSuccess('Removed from shortlist.');
      } else {
        await shortlistService.createShortlist('', 'househelp', { profile_id: profileId, profile_type: 'household' });
        setShortlistedProfiles((prev) => new Set(prev).add(profileId));
        setActionSuccess('Added to shortlist.');
      }
      window.dispatchEvent(new CustomEvent('shortlist-updated'));
    } catch (err) {
      console.error('Failed to update shortlist', err);
      setActionError(getFriendlyErrorMessage(err instanceof Error ? err.message : 'Failed to update shortlist'));
    }
  };

  

  const handleFieldChange = (name: keyof HouseholdSearchFields, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const toBool = (v?: string) => v === "true" ? true : v === "false" ? false : undefined;
  const toNum = (v?: string) => v ? Number(v) : undefined;

  const buildFilters = () => {
    const base: Record<string, any> = {
      town: filters.town || undefined,
      house_size: filters.house_size || undefined,
      verified: toBool(filters.verified),
      has_kids: toBool(filters.has_kids),
      has_pets: toBool(filters.has_pets),
      type_of_househelp: filters.type_of_househelp || undefined,
      available_from: filters.available_from || undefined,
      needs_live_in: toBool(filters.needs_live_in),
      needs_day_worker: toBool(filters.needs_day_worker),
      budget_min: toNum(filters.budget_min),
      budget_max: toNum(filters.budget_max),
      salary_frequency: filters.salary_frequency || undefined,
      religion: filters.religion || undefined,
      chore: filters.chore || undefined,
      min_rating: toNum(filters.min_rating),
    };
    return Object.fromEntries(Object.entries(base).filter(([_, v]) => v !== undefined && v !== null && v !== ""));
  };

  const toPayload = () => ({ ...buildFilters(), limit: 12, offset: 0 });
  const buildCountPayload = () => buildFilters();

  const search = async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await grpcProfileService.searchHouseholds('', 'househelp', buildFilters(), 12, 0);

      // Try multiple possible response structures
      let data = raw?.data?.data || raw?.data || raw?.profiles || raw;

      // If data is an object with a profiles or households property, extract it
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        data = data.profiles || data.households || data.data || [];
      }

      // Ensure data is always an array
      const households = Array.isArray(data) ? data : [];
      setResults(households as HouseholdItem[]);
    } catch (err: any) {
      console.error('[HousehelpHome] Search error:', err);
      setError(err.message || "Failed to load households");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch the user's full shortlist once on mount
  useEffect(() => {
    let cancelled = false;
    const fetchShortlist = async () => {
      try {
        const raw = await shortlistService.listByHousehold('');
        const items = raw?.data?.data || raw?.data || raw || [];
        if (cancelled) return;
        const ids = new Set<string>(
          (Array.isArray(items) ? items : [])
            .map((s: any) => s.profile_id)
            .filter(Boolean)
        );
        setShortlistedProfiles(ids);
      } catch (err) {
        console.error('Failed to fetch shortlist', err);
      }
    };
    fetchShortlist();
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced count updates on filter changes
  useEffect(() => {
    if (countTimerRef.current) clearTimeout(countTimerRef.current);
    const payload = buildCountPayload();
    countTimerRef.current = setTimeout(async () => {
      try {
        const count = await grpcProfileService.countHouseholds('', 'househelp', payload);
        setTotalCount(typeof count === 'number' ? count : 0);
      } catch (e) {
        setTotalCount(null);
      }
    }, 400);
    return () => {
      if (countTimerRef.current) clearTimeout(countTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="gradient" bubbles={false} bubbleDensity="low" className="flex-1 flex flex-col">
        <main className={`flex-1 py-8 ${accessibilityMode ? 'text-sm sm:text-base' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {showTips && <OnboardingTipsBanner role="househelp" onDismiss={handleDismissTips} />}
            <div className={`bg-white dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900 rounded-3xl ${compactView ? 'p-4 sm:p-6' : 'p-6 sm:p-8'} mb-8 border-2 border-gray-200 dark:border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-200/50 dark:hover:shadow-purple-500/20`}>
              <div className="flex items-center justify-between gap-3 mb-4">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Find Households</h1>
                <button
                  onClick={() => setShowMoreFilters(true)}
                  className="px-4 py-1 rounded-xl bg-gray-100 dark:bg-purple-600/30 text-gray-700 dark:text-white font-semibold border border-gray-300 dark:border-purple-500/30 hover:bg-gray-200 dark:hover:bg-purple-600/50 transition"
                >
                  More filters
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="mb-2 text-xs font-semibold text-gray-700 dark:text-white">Town</label>
                  <SearchableTownSelect
                    value={filters.town}
                    onChange={(value) => setFilters((prev) => ({ ...prev, town: value }))}
                    target="households"
                    buttonClassName="w-full h-12 px-4 rounded-xl text-sm bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 border border-purple-200/60 dark:border-purple-500/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="mb-2 text-xs font-semibold text-gray-700 dark:text-white">House Size</label>
                  <CustomSelect
                    value={filters.house_size || ""}
                    onChange={(val) => setFilters((prev) => ({ ...prev, house_size: val }))}
                    options={['', 'bedsitter', '1br', '2br', '3br+', 'mansion'].map((s) => ({ value: s, label: s || 'Any' }))}
                    placeholder="Any"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="mb-2 text-xs font-semibold text-gray-700 dark:text-white">Has Kids</label>
                  <CustomSelect
                    value={filters.has_kids || ""}
                    onChange={(val) => setFilters((prev) => ({ ...prev, has_kids: val }))}
                    options={[
                      { value: "", label: "Any" },
                      { value: "true", label: "Yes" },
                      { value: "false", label: "No" },
                    ]}
                    placeholder="Any"
                  />
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="sm:col-span-2 flex items-center">
                  <span className="text-gray-700 dark:text-white font-medium">
                    Use quick filters above or open <span className="font-semibold">More filters</span> for advanced options.
                    {totalCount !== null ? ` ${totalCount} results` : ''}
                  </span>
                </div>
                <button
                  onClick={search}
                  className="w-full px-8 py-1.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-500"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Slide-over Drawer for full filters */}
            <SidePanel isOpen={showMoreFilters} onClose={() => setShowMoreFilters(false)} title="More Filters">
              <HouseholdFilters
                fields={filters}
                onChange={handleFieldChange}
                onSearch={() => { setShowMoreFilters(false); search(); }}
                onClear={() => setFilters((prev) => ({
                  ...prev, verified: "", has_kids: "", has_pets: "", type_of_househelp: "",
                  available_from: "", needs_live_in: "", needs_day_worker: "", budget_min: "",
                  budget_max: "", salary_frequency: "", religion: "", chore: "", min_rating: "",
                }))}
              />
            </SidePanel>

            <div className="mt-6 sm:mt-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Households</h2>
              {actionSuccess && <SuccessAlert message={actionSuccess} className="mb-4" />}
              {actionError && <ErrorAlert message={actionError} className="mb-4" />}
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
                </div>
              ) : error ? (
                <div className="bg-white dark:bg-[#13131a] border-2 border-purple-200 dark:border-purple-500/30 rounded-2xl p-10 sm:p-14 text-center">
                  <div className="mx-auto mb-5 flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800">
                    <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 7.5h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Households Available</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs max-w-sm mx-auto">
                    We couldn't load household profiles right now. Please try again in a moment.
                  </p>
                  <button
                    onClick={search}
                    className="mt-6 inline-flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg text-xs"
                  >
                    Try Again
                  </button>
                </div>
              ) : (!results || results.length === 0) ? (
                <div className="bg-white dark:bg-[#13131a] border-2 border-purple-200 dark:border-purple-500/30 rounded-2xl p-10 sm:p-14 text-center">
                  <div className="mx-auto mb-5 flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800">
                    <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Results Found</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs max-w-sm mx-auto">
                    No households match your current filters. Try adjusting your search criteria or clear filters to see all profiles.
                  </p>
                </div>
              ) : (
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${compactView ? 'gap-4' : 'gap-6'}`}>
                  {(Array.isArray(results) ? results : []).map((r) => (
                    <div
                      key={r.profile_id}
                      onClick={() => handleViewMore(r)}
                      className={`relative bg-white dark:bg-[#13131a] rounded-2xl border-2 border-purple-200/40 dark:border-purple-500/30 ${compactView ? 'p-4' : 'p-6'} hover:scale-105 hover:shadow-light-glow-md dark:hover:shadow-glow-md transition-all duration-300 cursor-pointer`}
                    >
                      {/* Top-right actions */}
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStartChat(r.id); }}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/80 dark:bg-white/10 border border-purple-200/60 dark:border-purple-500/30 hover:bg-white text-purple-700 dark:text-purple-200 shadow"
                          aria-label="Chat"
                          title="Chat"
                        >
                          <ChatBubbleLeftRightIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleShortlist(r.profile_id); }}
                          className={`inline-flex items-center justify-center w-9 h-9 rounded-full border shadow transition-all ${
                            shortlistedProfiles.has(r.profile_id)
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-500 text-white hover:from-purple-700 hover:to-pink-700'
                              : 'bg-white/80 dark:bg-white/10 border-purple-200/60 dark:border-purple-500/30 hover:bg-white text-pink-600 dark:text-pink-300'
                          }`}
                          aria-label={shortlistedProfiles.has(r.profile_id) ? 'Remove from shortlist' : 'Add to shortlist'}
                          title={shortlistedProfiles.has(r.profile_id) ? 'Remove from shortlist' : 'Add to shortlist'}
                        >
                          {shortlistedProfiles.has(r.profile_id) ? (
                            <HeartIconSolid className="w-5 h-5" />
                          ) : (
                            <HeartIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>

                      {/* Avatar */}
                      <div className="flex justify-center mb-4">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-lg font-bold shadow-lg overflow-hidden">
                          {r.avatar_url || (r.id && profilePhotos[r.id]) ? (
                            <OptimizedImage
                              path={r.avatar_url || (r.id && profilePhotos[r.id]) || ''}
                              alt={(r.first_name || 'H') + ' ' + (r.last_name || 'H')}
                              className="w-full h-full object-cover"
                              onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            `${r.first_name?.[0] || 'H'}${r.last_name?.[0] || 'H'}`
                          )}
                        </div>
                      </div>

                      {/* Name */}
                      <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">
                        {r.first_name} {r.last_name}
                      </h3>

                      {/* Town */}
                      <p className="text-xs text-gray-600 dark:text-gray-400 text-center mb-3">
                        📍 {r.town?.trim() || "No location specified"}
                      </p>

                      {/* House size */}
                      <p className="text-xs text-purple-600 dark:text-purple-400 text-center mb-3">
                        🏠 {r.house_size || "House size not specified"}
                      </p>

                      {/* Verified */}
                      {r.verified && (
                        <div className="text-center"><span className="inline-block text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">Verified</span></div>
                      )}

                      {/* Bottom actions */}
                      <div className="mt-6 flex items-center gap-3">
                        <div className="text-xs font-semibold tracking-wide uppercase text-gray-400">
                          {formatTimeAgo(r.created_at)}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleViewMore(r); }}
                          className="ml-auto px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition"
                        >
                          View more
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </div>
          </div>
          
        </main>
      </PurpleThemeWrapper>
      <SubscriptionRequiredModal
        open={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        status={subscriptionStatus}
        actionLabel="message households"
        plansHref="/plans"
      />
      <Footer />
    </div>
  );
}
