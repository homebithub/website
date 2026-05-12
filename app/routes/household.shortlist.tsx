import { getAccessTokenFromCookies } from '~/utils/cookie';
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Heart } from 'lucide-react';
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { NOTIFICATIONS_API_BASE_URL } from "~/config/api";
import { openForWorkService, profileService as grpcProfileService, shortlistService } from '~/services/grpc/authServices';
import { getInboxRoute, startOrGetConversation, type StartConversationPayload } from '~/utils/conversationLauncher';
import ShortlistPlaceholderIcon from "~/components/features/ShortlistPlaceholderIcon";
import { fetchPreferences } from "~/utils/preferencesApi";
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { OptimizedImage } from '~/components/ui/OptimizedImage';
import { useProfilePhotos } from '~/hooks/useProfilePhotos';
import { getStoredUser, getStoredUserId } from '~/utils/authStorage';
import { formatTimeAgo } from '~/utils/timeAgo';
import { normalizeOnboardingAmountFromStorage } from '~/utils/onboardingCompensation';

const formatDate = (value?: string) => {
  if (!value) return 'Flexible';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime()) || parsed.getFullYear() < 1900) return 'Flexible';
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const toFiniteNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const formatSalary = (min?: unknown, max?: unknown, frequency?: unknown) => {
  const frequencyLabel = typeof frequency === 'string' ? frequency : '';
  const rawMin = toFiniteNumber(min);
  const rawMax = toFiniteNumber(max);
  const normalizedMin = rawMin == null ? undefined : normalizeOnboardingAmountFromStorage(rawMin, frequencyLabel);
  const normalizedMax = rawMax == null ? undefined : normalizeOnboardingAmountFromStorage(rawMax, frequencyLabel);
  if (normalizedMin == null && normalizedMax == null) return 'Not specified';
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 });
  const minLabel = normalizedMin != null ? formatter.format(normalizedMin) : null;
  const maxLabel = normalizedMax != null ? formatter.format(normalizedMax) : null;
  const base = minLabel && maxLabel ? `${minLabel} - ${maxLabel}` : (minLabel || maxLabel || 'Not specified');
  const freqLabel = frequencyLabel ? ` / ${frequencyLabel}` : '';
  return `${base}${freqLabel}`;
};

const toRecord = (value: unknown): Record<string, any> | null => (
  value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : null
);

const formatTextValue = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
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
  return '';
};

const summarizeSchedule = (schedule?: Record<string, { morning?: boolean; afternoon?: boolean; evening?: boolean }>) => {
  if (!schedule) return null;
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const activeDays = days.filter((day) => schedule[day]?.morning || schedule[day]?.afternoon || schedule[day]?.evening);
  if (activeDays.length === 0) return null;
  return activeDays.map((day) => day.slice(0, 3)).join(', ');
};

const isOpenForWorkListingActive = (listing: { status?: string }) => {
  const status = (listing.status || 'active').toLowerCase();
  return ['active', 'open', 'available'].includes(status);
};

const formatListingStatus = (status?: string) => {
  if (!status) return 'Open';
  return status.replace(/_/g, ' ');
};

// Types
type ShortlistItem = {
  id: string;
  profile_id: string;
  profile_type: string;
  household_id: string;
  user_id: string;
  created_at: string;
};

export default function HouseholdShortlistPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState<ShortlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Map of shortlisted target id -> open-for-work listing data
  const [profilesById, setProfilesById] = useState<Record<string, any>>({});

  // Fetch profile photos from documents table
  const shortlistUserIds = useMemo(() => items.map(s => s.user_id).filter(Boolean), [items]);
  const profilePhotos = useProfilePhotos(shortlistUserIds);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const currentUser = useMemo(() => getStoredUser(), []);
  const currentUserId: string | undefined = currentUser?.user_id || currentUser?.id || getStoredUserId() || undefined;
  const [currentHouseholdProfileId, setCurrentHouseholdProfileId] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  // Load UI preferences (compact view, accessibility)
  useEffect(() => {
    let cancelled = false;

    const loadPrefs = async () => {
      try {
        const prefs = await fetchPreferences();
        if (cancelled) return;
        const settings = prefs?.settings || {};
        setAccessibilityMode(Boolean(settings.accessibility_mode));
      } catch {
        if (!cancelled) {
          setAccessibilityMode(false);
        }
      }
    };

    loadPrefs();

    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch household profile ID
  useEffect(() => {
    let cancelled = false;

    const fetchHouseholdProfileId = async () => {
      if (currentUserId) {
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
  }, [currentUserId]);

  // Load shortlist entries (mine)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const response = await shortlistService.listByHousehold('');

        // Extract shortlist array from nested structure
        const data = response?.data?.data || response?.data || response;

        // Ensure it's an array
        const shortlistArray = Array.isArray(data) ? data : [];

        if (cancelled) return;
        setItems((prev) => (offset === 0 ? shortlistArray : [...prev, ...shortlistArray]));
        setHasMore(shortlistArray.length === limit);
        // Trigger event to update badge count in navigation
        window.dispatchEvent(new CustomEvent('shortlist-updated'));
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load shortlist");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [offset]);

  // Load open-for-work records for shortlisted househelp listings.
  useEffect(() => {
    const missingIds = (items || [])
      .filter((s) => s.profile_type === "open_for_work")
      .map((s) => s.profile_id)
      .filter((pid) => pid && !(pid in profilesById));
    if (missingIds.length === 0) return;

    let cancelled = false;
    async function loadProfiles() {
      try {
        setLoadingProfiles(true);
        const profiles = await Promise.all(
          missingIds.map(async (id) => {
            try {
              return await openForWorkService.getOpenForWork(id, '');
            } catch {
              return null;
            }
          })
        );
        if (cancelled) return;
        const next: Record<string, any> = { ...profilesById };
        missingIds.forEach((id, index) => {
          if (profiles[index]) next[id] = profiles[index];
        });
        setProfilesById(next);
      } catch {
        // noop; show empty
      } finally {
        if (!cancelled) setLoadingProfiles(false);
      }
    }
    loadProfiles();
    return () => {
      cancelled = true;
    };
  }, [items, profilesById]);

  async function handleRemove(profileId: string) {
    try {
      await shortlistService.deleteShortlist(profileId);
      setItems((prev) => (prev || []).filter((s) => s.profile_id !== profileId));
      // Trigger event to update badge count in navigation
      window.dispatchEvent(new CustomEvent('shortlist-updated'));
    } catch {}
  }

  async function handleChatWithHousehelp(profileId?: string, househelpUserId?: string) {
    if (!profileId || !househelpUserId || !currentUserId) return;
    try {
      const payload: StartConversationPayload = {
        household_user_id: currentUserId,
        househelp_user_id: househelpUserId,
        househelp_profile_id: profileId,
      };
      
      // Include household_profile_id
      if (currentHouseholdProfileId) {
        payload.household_profile_id = currentHouseholdProfileId;
      }

      const convId = await startOrGetConversation(NOTIFICATIONS_API_BASE_URL, payload);
      navigate(getInboxRoute(convId));
    } catch (e) {
      console.error('Failed to start chat from shortlist (househelp)', e);
      setChatError('Could not open conversation. Please try again.');
      setTimeout(() => setChatError(null), 5000);
    }
  }


  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const io = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !loading && hasMore) {
        setOffset((o) => o + limit);
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [loading, hasMore]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="gradient" bubbles={false} bubbleDensity="low" className="flex-1 flex flex-col">
        <main className={`flex-1 py-8 ${accessibilityMode ? 'text-sm sm:text-base' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-lg font-extrabold text-gray-900 dark:text-white mb-6">My Shortlist</h1>

            {(items || []).length === 0 && !loading && !error && (
              <div className="rounded-2xl border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] p-8 text-center">
                <ShortlistPlaceholderIcon className="w-20 h-20 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 text-base">No shortlisted househelps yet.</p>
              </div>
            )}

            {chatError && <ErrorAlert message={chatError} className="mb-4" />}
            {error && <ErrorAlert message={error} className="mb-4" />}
	
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(items || [])
                .filter((s) => s.profile_type === "open_for_work")
                .map((s) => {
                  const listing = profilesById[s.profile_id] || {};
                  const househelp = listing?.househelp || {};
                  const user = househelp?.user || {};
                  const targetProfileId = househelp?.id || househelp?.profile_id || '';
                  const targetUserId = househelp?.user_id || user?.id || s.user_id;
                  const name = `${firstString(user.first_name, househelp.first_name)} ${firstString(user.last_name, househelp.last_name)}`.trim() || 'Househelp';
                  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'HW';
                  const userId = firstString(househelp.user_id, user.id, s.user_id);
                  const photos = toStringArray(househelp.photos);
                  const avatar = firstString(househelp.avatar_url, photos[0], profilePhotos[userId]);
                  const scheduleLabel = summarizeSchedule(listing?.work_schedule);
                  const jobTypes = toStringArray(listing?.job_types);
                  const location = firstString(househelp.town, househelp.location) || 'Location not specified';
                  const experienceYears = toFiniteNumber(househelp.years_of_experience);
                  const isOpen = isOpenForWorkListingActive(listing);
                  const updatedAt = listing?.created_at || s.created_at;
                  return (
                    <div
                      key={s.id}
                      className="bg-white dark:bg-[#13131a] rounded-2xl border-2 border-purple-200/40 dark:border-purple-500/30 p-6 shadow-sm hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center text-lg font-bold overflow-hidden">
                          {avatar ? (
                            <OptimizedImage
                              path={avatar}
                              alt={name}
                              className="w-full h-full object-cover"
                              onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
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
                                onClick={() => handleRemove(s.profile_id)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-pink-400 bg-pink-500 text-white transition"
                                aria-label="Remove open-for-work listing from shortlist"
                              >
                                <Heart className="h-4 w-4 fill-current" />
                              </button>
                              <span
                                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                  isOpen
                                    ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200'
                                    : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300'
                                }`}
                              >
                                {formatListingStatus(listing?.status)}
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
                                  {type.replace(/_/g, ' ')}
                                </span>
                              ))
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300">
                                Flexible role
                              </span>
                            )}
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
                              Available {formatDate(listing?.available_from)}
                            </span>
                            {scheduleLabel && (
                              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                                {scheduleLabel}
                              </span>
                            )}
                          </div>

                          <div className="mt-3 text-xs text-gray-600 dark:text-gray-300 space-y-1">
                            <p>Experience: {experienceYears ? `${experienceYears} yrs` : 'Not specified'}</p>
                            <p>
                              Salary: {formatSalary(
                                listing?.salary_min ?? househelp.salary_expectation,
                                listing?.salary_max,
                                listing?.salary_frequency || househelp.salary_frequency
                              )}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {listing?.can_work_with_kids && (
                                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] dark:bg-blue-500/10 dark:text-blue-200">Kids</span>
                              )}
                              {listing?.can_work_with_pets && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] dark:bg-emerald-500/10 dark:text-emerald-200">Pets</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-gray-400">Updated {formatTimeAgo(updatedAt)}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (!targetProfileId) return;
                              navigate(`/househelp/public-profile?profileId=${encodeURIComponent(targetProfileId)}&openForWorkId=${encodeURIComponent(s.profile_id)}&from=shortlist&backTo=${encodeURIComponent('/household/shortlist')}&backLabel=${encodeURIComponent('Back to Shortlist')}`, {
                                state: { profileId: targetProfileId, fromShortlist: true },
                              });
                            }}
                            className="px-4 py-1.5 text-xs font-semibold rounded-xl border border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-500/40 dark:text-purple-200 dark:hover:bg-purple-500/10"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => handleChatWithHousehelp(targetProfileId, targetUserId)}
                            className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                            disabled={!targetProfileId || !targetUserId}
                          >
                            Message
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div ref={sentinelRef} className="h-8" />
            {(loading || loadingProfiles) && (
              <div className="mt-4 text-center text-gray-600 dark:text-gray-300">Loading...</div>
            )}
          </div>
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}

export { ErrorBoundary } from "~/components/ErrorBoundary";
