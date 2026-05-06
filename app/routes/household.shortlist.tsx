import { getAccessTokenFromCookies } from '~/utils/cookie';
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ChatBubbleLeftRightIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { NOTIFICATIONS_API_BASE_URL } from "~/config/api";
import { profileService as grpcProfileService, shortlistService } from '~/services/grpc/authServices';
import { getInboxRoute, startOrGetConversation, type StartConversationPayload } from '~/utils/conversationLauncher';
import ShortlistPlaceholderIcon from "~/components/features/ShortlistPlaceholderIcon";
import { fetchPreferences } from "~/utils/preferencesApi";
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { useProfilePhotos } from '~/hooks/useProfilePhotos';
import { getStoredUser, getStoredUserId } from '~/utils/authStorage';
import { formatOnboardingAmountWithFrequency } from '~/utils/onboardingCompensation';

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

  // Map of profile_id -> househelp profile data
  const [profilesById, setProfilesById] = useState<Record<string, any>>({});

  // Fetch profile photos from documents table
  const shortlistUserIds = useMemo(() => items.map(s => s.user_id).filter(Boolean), [items]);
  const profilePhotos = useProfilePhotos(shortlistUserIds);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});
  const [compactView, setCompactView] = useState(false);
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
        setCompactView(Boolean(settings.compact_view));
        setAccessibilityMode(Boolean(settings.accessibility_mode));
      } catch {
        if (!cancelled) {
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

  // Load househelp profiles for shortlist entries (only where profile_type === 'househelp')
  useEffect(() => {
    const missingIds = (items || [])
      .filter((s) => s.profile_type === "househelp")
      .map((s) => s.profile_id)
      .filter((pid) => pid && !(pid in profilesById));
    if (missingIds.length === 0) return;

    let cancelled = false;
    async function loadProfiles() {
      try {
        setLoadingProfiles(true);
        const response = await grpcProfileService.searchMultipleWithUser('', 'househelp', { profile_ids: missingIds });
        // Gateway responses can be nested as { data: [...] } or { data: { data: [...] } }
        const data = response?.data?.data || response?.data || response;
        const profiles = Array.isArray(data) ? data : [];
        if (cancelled) return;
        const next: Record<string, any> = { ...profilesById };
        for (const h of profiles) {
          if (h.profile_id) next[h.profile_id] = h;
        }
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
	
            <div className={`grid grid-cols-1 ${compactView ? 'gap-4' : 'gap-6'}`}>
              {(items || [])
                .filter((s) => s.profile_type === "househelp")
                .map((s) => {
                  const h = profilesById[s.profile_id];
                  return (
                    <div
                      key={s.id}
                      onClick={() => navigate(`/househelp/public-profile?profileId=${encodeURIComponent(s.profile_id)}&from=shortlist&backTo=${encodeURIComponent('/household/shortlist')}&backLabel=${encodeURIComponent('Back to Shortlist')}`, {
                        state: { profileId: s.profile_id, fromShortlist: true },
                      })}
                      className={`househelp-card relative bg-white dark:bg-[#13131a] rounded-2xl border-2 border-purple-200/40 dark:border-purple-500/30 ${compactView ? 'p-4' : 'p-6'} hover:scale-105 hover:shadow-light-glow-md dark:hover:shadow-glow-md transition-all duration-300 cursor-pointer`}
                    >
                      {/* Top-right actions */}
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleChatWithHousehelp(s.profile_id, s.user_id); }}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/80 dark:bg-white/10 border border-purple-200/60 dark:border-purple-500/30 hover:bg-white text-purple-700 dark:text-purple-200 shadow"
                          aria-label="Chat"
                          title="Chat"
                        >
                          <ChatBubbleLeftRightIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemove(s.profile_id); }}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-full border shadow transition-all bg-gradient-to-r from-purple-600 to-pink-600 border-purple-500 text-white hover:from-purple-700 hover:to-pink-700"
                          aria-label="Remove from shortlist"
                          title="Remove from shortlist"
                        >
                          <HeartIconSolid className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        {/* Profile Picture */}
                        <div className="flex justify-center sm:justify-start mb-4 sm:mb-0 shrink-0">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-lg font-bold shadow-lg overflow-hidden relative">
                            {(() => {
                              const imageUrl = h?.avatar_url || h?.profile_picture || (h?.photos && h.photos[0]) || (s.user_id && profilePhotos[s.user_id]);
                              if (imageUrl) {
                                return (
                                  <>
                                    {imageLoadingStates[s.profile_id] !== false && (
                                      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-shimmer bg-[length:200%_100%]" />
                                    )}
                                    <img
                                      src={imageUrl}
                                      alt={`${h?.first_name || ''} ${h?.last_name || ''}`}
                                      className={`w-full h-full object-cover transition-opacity duration-300 ${
                                        imageLoadingStates[s.profile_id] === false ? 'opacity-100' : 'opacity-0'
                                      }`}
                                      onLoad={() => setImageLoadingStates(prev => ({ ...prev, [s.profile_id]: false }))}
                                      onError={(e) => {
                                        setImageLoadingStates(prev => ({ ...prev, [s.profile_id]: false }));
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </>
                                );
                              }
                              return `${h?.first_name?.[0] || ''}${h?.last_name?.[0] || 'HH'}`;
                            })()}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1 sm:pr-8">
                          {/* Name */}
                          <h3 className="text-lg font-bold text-left text-gray-900 dark:text-white mb-2">
                            {h ? `${h.first_name || ''} ${h.last_name || ''}` : 'Loading...'}
                          </h3>

                          {(h?.county_of_residence || h?.location) && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 text-left mb-2">
                              📍 {h?.county_of_residence || h?.location}
                            </p>
                          )}

                          {((h?.years_of_experience ?? h?.experience) as number) > 0 && (
                            <p className="text-xs text-purple-600 dark:text-purple-400 text-left mb-2">
                              ⭐ {h?.years_of_experience ?? h?.experience} years experience
                            </p>
                          )}

                          {h && (
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-left mb-2">
                              💰 {formatOnboardingAmountWithFrequency(
                                h.salary_expectation,
                                h.salary_frequency,
                                'No salary expectations specified'
                              )}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-2 justify-start mb-3">
                            {h?.househelp_type && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                {h.househelp_type}
                              </span>
                            )}
                            {typeof h?.can_work_with_kids === 'boolean' && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                {h.can_work_with_kids ? 'Works with kids' : 'No kids'}
                              </span>
                            )}
                            {typeof h?.can_work_with_pets === 'boolean' && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                                {h.can_work_with_pets ? 'Pet friendly' : 'No pets'}
                              </span>
                            )}
                            {(h?.rating || h?.review_count) && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300">
                                ★ {h?.rating ? Number(h.rating).toFixed(1) : 'New'}{h?.review_count ? ` (${h.review_count})` : ''}
                              </span>
                            )}
                            {typeof h?.is_available === 'boolean' && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                {h.is_available ? 'Available now' : 'Busy'}
                              </span>
                            )}
                          </div>

                          {Array.isArray(h?.skills) && h.skills.length > 0 && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 text-left mb-2">
                              🧹 {h.skills.slice(0, 3).join(', ')}
                              {h.skills.length > 3 ? ` +${h.skills.length - 3} more` : ''}
                            </p>
                          )}

                          {h?.bio && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 text-left line-clamp-3 mb-4">
                              {h.bio}
                            </p>
                          )}

                          {/* Bottom actions */}
                          <div className="mt-4 flex items-center justify-between">
                            <div className="text-xs text-gray-400">
                              {s.created_at ? new Date(s.created_at).toLocaleDateString() : ''}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/househelp/public-profile?profileId=${encodeURIComponent(s.profile_id)}&from=shortlist&backTo=${encodeURIComponent('/household/shortlist')}&backLabel=${encodeURIComponent('Back to Shortlist')}`, {
                                  state: { profileId: s.profile_id, fromShortlist: true },
                                });
                              }}
                              className="px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition"
                            >
                              View more
                            </button>
                          </div>
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
