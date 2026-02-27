import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { OptimizedImage } from "~/components/ui/OptimizedImage";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { API_BASE_URL, NOTIFICATIONS_API_BASE_URL } from "~/config/api";
import { apiClient } from "~/utils/apiClient";
import { getInboxRoute, startOrGetConversation, type StartConversationPayload } from '~/utils/conversationLauncher';
import HouseholdFilters, { type HouseholdSearchFields } from "~/components/features/HouseholdFilters";
import { ChatBubbleLeftRightIcon, HeartIcon } from '@heroicons/react/24/outline';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { formatTimeAgo } from "~/utils/timeAgo";
import OnboardingTipsBanner from "~/components/OnboardingTipsBanner";
import { fetchPreferences } from "~/utils/preferencesApi";
import SearchableTownSelect from "~/components/ui/SearchableTownSelect";
import { useProfilePhotos } from '~/hooks/useProfilePhotos';

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
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const countTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [shortlistedProfiles, setShortlistedProfiles] = useState<Set<string>>(new Set());
  const [showTips, setShowTips] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [accessibilityMode, setAccessibilityMode] = useState(false);

  const API_BASE = useMemo(
    () => (typeof window !== "undefined" && (window as any).ENV?.AUTH_API_BASE_URL) || API_BASE_URL,
    []
  );
  const NOTIFICATIONS_BASE = useMemo(
    () => (typeof window !== "undefined" && (window as any).ENV?.NOTIFICATIONS_API_BASE_URL) || NOTIFICATIONS_API_BASE_URL,
    []
  );
  const navigate = useNavigate();
  const currentUser = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("user_object");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);
  const currentUserId: string | undefined = currentUser?.id;
  const currentProfileType: string | undefined = currentUser?.profile_type;
  const [currentHouseholdProfileId, setCurrentHouseholdProfileId] = useState<string | null>(null);

  // Fetch household profile ID if current user is a household
  useEffect(() => {
    let cancelled = false;

    const fetchHouseholdProfileId = async () => {
      if (currentProfileType?.toLowerCase() === 'household' && currentUserId) {
        try {
          const token = localStorage.getItem("token");
          if (!token) return;
          
          const res = await fetch(`${API_BASE_URL}/api/v1/profile/household/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const raw = await res.json();
            const profile = raw?.data?.data || raw?.data || raw;
            if (!cancelled) {
              setCurrentHouseholdProfileId(profile?.id || profile?.profile_id || null);
            }
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
    if (item?.id) {
      navigate(`/household/public-profile?user_id=${item.id}`, {
        state: { profileId: item.id, backTo: '/', backLabel: 'Back to results' },
      });
    }
  };

  const handleStartChat = async (householdUserId?: string) => {
    try {
      if (!householdUserId) throw new Error('Missing household user id');
      if (!currentUserId) throw new Error('Missing current user id');

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
      const isShortlisted = shortlistedProfiles.has(profileId);
      if (isShortlisted) {
        const res = await apiClient.auth(`${API_BASE}/api/v1/shortlists/${profileId}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to remove from shortlist');
        setShortlistedProfiles((prev) => {
          const next = new Set(prev);
          next.delete(profileId);
          return next;
        });
      } else {
        const res = await apiClient.auth(`${API_BASE}/api/v1/shortlists`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile_id: profileId, profile_type: 'household' }),
        });
        if (!res.ok) throw new Error('Failed to add to shortlist');
        setShortlistedProfiles((prev) => new Set(prev).add(profileId));
      }
      window.dispatchEvent(new CustomEvent('shortlist-updated'));
    } catch (err) {
      console.error('Failed to update shortlist', err);
      alert('Shortlist for households will be available soon.');
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
      const res = await apiClient.auth(`${API_BASE}/api/v1/households/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload()),
      });
      const raw = await apiClient.json<any>(res);
      const data = raw?.data?.data || raw?.data || raw;
      // Ensure data is always an array
      const households = Array.isArray(data) ? data : [];
      setResults(households as HouseholdItem[]);
    } catch (err: any) {
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
        const res = await apiClient.auth(`${API_BASE}/api/v1/shortlists`);
        if (!res.ok) return;
        const raw = await apiClient.json<any>(res);
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
  }, [API_BASE]);

  // Debounced count updates on filter changes
  useEffect(() => {
    if (countTimerRef.current) clearTimeout(countTimerRef.current);
    const payload = buildCountPayload();
    countTimerRef.current = setTimeout(async () => {
      try {
        const res = await apiClient.auth(`${API_BASE}/api/v1/households/search/count`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await apiClient.json<{ count: number }>(res);
        setTotalCount(typeof data.count === "number" ? data.count : 0);
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
        <main className={`flex-1 py-8 ${accessibilityMode ? 'text-base sm:text-lg' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {showTips && <OnboardingTipsBanner role="househelp" onDismiss={handleDismissTips} />}
            <div className={`bg-white dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900 rounded-3xl ${compactView ? 'p-4 sm:p-6' : 'p-6 sm:p-8'} mb-8 shadow-lg shadow-purple-200/50 dark:shadow-purple-500/20 border-2 border-gray-200 dark:border-gray-700/50`}>
              <div className="flex items-center justify-between gap-3 mb-4">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Find Households</h1>
                <button
                  onClick={() => setShowMoreFilters(true)}
                  className="px-4 py-1 rounded-xl bg-gray-100 dark:bg-purple-600/30 text-gray-700 dark:text-white font-semibold border border-gray-300 dark:border-purple-500/30 hover:bg-gray-200 dark:hover:bg-purple-600/50 transition"
                >
                  More filters
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-semibold text-gray-700 dark:text-white">Town</label>
                  <SearchableTownSelect
                    value={filters.town}
                    onChange={(value) => setFilters((prev) => ({ ...prev, town: value }))}
                    target="households"
                    buttonClassName="w-full h-12 px-4 rounded-xl text-base bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 border border-purple-200/60 dark:border-purple-500/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-semibold text-gray-700 dark:text-white">House Size</label>
                  <select
                    name="house_size"
                    value={filters.house_size}
                    onChange={handleSelect}
                    className="w-full h-12 px-4 rounded-xl text-base bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 border border-purple-200/60 dark:border-purple-500/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {['', 'bedsitter', '1br', '2br', '3br+', 'mansion'].map((s) => (
                      <option key={s} value={s}>
                        {s || 'Any'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-semibold text-gray-700 dark:text-white">Has Kids</label>
                  <select
                    name="has_kids"
                    value={filters.has_kids}
                    onChange={handleSelect}
                    className="w-full h-12 px-4 rounded-xl text-base bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 border border-purple-200/60 dark:border-purple-500/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Any</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
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
            {showMoreFilters && (
              <div className="fixed inset-0 z-[70]">
                <div className="absolute inset-x-0 top-20 sm:top-24 bottom-20 sm:bottom-24 bg-slate-900/20 backdrop-blur-[2px]" onClick={() => setShowMoreFilters(false)} />
                <div className="absolute right-0 sm:right-4 top-20 sm:top-24 bottom-20 sm:bottom-24 w-full max-w-[460px] bg-[#f3f4f7] dark:bg-gradient-to-br dark:from-[#0a0a0f] dark:via-[#13131a] dark:to-[#0a0a0f] shadow-[0_24px_80px_rgba(15,23,42,0.28)] rounded-[2rem] p-6 sm:p-7 overflow-y-auto border border-[#d6dbe7] dark:border-purple-500/30">
                  <div className="sticky top-0 z-10 -mx-2 px-2 pb-4 pt-1 bg-[#f3f4f7] dark:bg-[#13131a] flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">More Filters</h2>
                    <button
                      onClick={() => setShowMoreFilters(false)}
                      className="h-9 w-9 rounded-full border border-[#c7cdd9] dark:border-purple-500/30 text-slate-500 hover:text-slate-700 hover:bg-white/70 dark:text-gray-300 dark:hover:text-white dark:hover:bg-purple-500/10 transition-colors"
                      aria-label="Close more filters"
                    >
                      <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
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
                </div>
              </div>
            )}

            <div className="mt-6 sm:mt-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Households</h2>
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
                </div>
              ) : error ? (
                <ErrorAlert message={getFriendlyErrorMessage(error)} />
              ) : (!results || results.length === 0) ? (
                <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl p-12 text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-lg">No households found. Try adjusting filters.</p>
                </div>
              ) : (
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${compactView ? 'gap-4' : 'gap-6'}`}>
                  {(Array.isArray(results) ? results : []).map((r) => (
                    <div
                      key={r.profile_id}
                      onClick={() => handleViewMore(r)}
                      className={`relative bg-white dark:bg-[#13131a] rounded-2xl shadow-light-glow-md dark:shadow-glow-md border-2 border-purple-200/40 dark:border-purple-500/30 ${compactView ? 'p-4' : 'p-6'} hover:scale-105 transition-all duration-300 cursor-pointer`}
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
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl font-bold shadow-lg overflow-hidden">
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
                      <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                        {r.first_name} {r.last_name}
                      </h3>

                      {/* Town */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
                        📍 {r.town?.trim() || "No location specified"}
                      </p>

                      {/* House size */}
                      <p className="text-sm text-purple-600 dark:text-purple-400 text-center mb-3">
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
      <Footer />
    </div>
  );
}
