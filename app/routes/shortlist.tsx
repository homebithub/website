import { getAccessTokenFromCookies } from '~/utils/cookie';
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { NOTIFICATIONS_API_BASE_URL } from "~/config/api";
import { profileService as grpcProfileService, shortlistService } from '~/services/grpc/authServices';
import { getInboxRoute, startOrGetConversation, type StartConversationPayload } from '~/utils/conversationLauncher';
import ShortlistPlaceholderIcon from "~/components/features/ShortlistPlaceholderIcon";
import { formatTimeAgo } from "~/utils/timeAgo";
import { fetchPreferences } from "~/utils/preferencesApi";
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { useProfilePhotos } from '~/hooks/useProfilePhotos';
import { getStoredProfileType, getStoredUser, getStoredUserId } from '~/utils/authStorage';
import { resolveHouseholdOwnerUserId, resolveHouseholdProfile } from '~/utils/householdProfiles';

const formatBudgetAmount = (value?: string | number) => {
  if (value === undefined || value === null || value === "") return "";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return `KES ${num.toLocaleString()}`;
};

type ShortlistItem = {
  id: string;
  profile_id: string;
  profile_type: string;
  user_id: string;
  household_id: string;
  created_at: string;
};

export default function ShortlistPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ShortlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [profiles, setProfiles] = useState<Record<string, any>>({});

  // Fetch profile photos from documents table
  const shortlistUserIds = useMemo(() => items.map(s => s.user_id).filter(Boolean), [items]);
  const profilePhotos = useProfilePhotos(shortlistUserIds);

  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});
  const fetchedProfilesRef = useRef<Set<string>>(new Set());
  const [compactView, setCompactView] = useState(false);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const currentUser = useMemo(() => getStoredUser(), []);
  const currentUserId: string | undefined = currentUser?.user_id || currentUser?.id || getStoredUserId() || undefined;
  const currentProfileType: string | undefined = currentUser?.profile_type || getStoredProfileType() || undefined;
  const [currentHouseholdProfileId, setCurrentHouseholdProfileId] = useState<string | null>(null);

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
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const raw = await shortlistService.listByHousehold('');
        const data = raw?.data?.data || raw?.data || raw || [];
        if (cancelled) return;
        setItems((prev) => (offset === 0 ? data : [...prev, ...data]));
        setHasMore(data.length === limit);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load shortlist");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [offset]);

  // Fetch household public profiles for newly loaded shortlist items (househelp's own shortlist)
  useEffect(() => {
    const neededProfileIds = Array.from(
      new Set(
        (Array.isArray(items) ? items : [])
          .filter((s) => s.profile_type === 'household')
          .map((s) => s.profile_id)
          .filter(Boolean)
      )
    );

    const missing = neededProfileIds.filter(
      (profileId) => profileId && !fetchedProfilesRef.current.has(profileId)
    );

    if (missing.length === 0) return;

    let cancelled = false;
    async function fetchProfiles() {
      try {
        setLoadingProfiles(true);
        const results = await Promise.all(
          missing.map(async (profileId) => {
            try {
              const data = await resolveHouseholdProfile(profileId, { identifierType: 'profileId' });
              return { profileId, data };
            } catch {
              return { profileId, data: null };
            }
          })
        );
        if (cancelled) return;
        setProfiles((prev) => {
          const next = { ...prev } as Record<string, any>;
          for (const r of results) {
            if (r.profileId && r.data) {
              next[r.profileId] = r.data;
              fetchedProfilesRef.current.add(r.profileId);
            }
          }
          return next;
        });
      } finally {
        if (!cancelled) setLoadingProfiles(false);
      }
    }
    fetchProfiles();
    return () => { cancelled = true; };
  }, [items]);

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

  async function handleRemove(profileId: string) {
    try {
      await shortlistService.deleteShortlist(profileId);
      setItems((prev) => prev.filter((s) => s.profile_id !== profileId));
      window.dispatchEvent(new CustomEvent('shortlist-updated'));
    } catch (e) {
      // optionally surface error
    }
  }

  async function handleChatWithHousehold(targetUserId?: string, householdProfileId?: string) {
    if (!targetUserId || !currentUserId) return;
    try {
      const profileType = (currentProfileType || '').toLowerCase();
      let householdId = targetUserId;
      let househelpId = currentUserId;

      if (profileType === 'household') {
        householdId = currentUserId;
        househelpId = targetUserId;
      }

      const payload: StartConversationPayload = {
        household_user_id: householdId,
        househelp_user_id: househelpId,
      };
      
      // Use passed householdProfileId or the fetched one for current household user
      if (householdProfileId) {
        payload.household_profile_id = householdProfileId;
      } else if (profileType === 'household' && currentHouseholdProfileId) {
        payload.household_profile_id = currentHouseholdProfileId;
      }

      const convId = await startOrGetConversation(NOTIFICATIONS_API_BASE_URL, payload);
      navigate(getInboxRoute(convId));
    } catch (e) {
      console.error('Failed to start chat from shortlist (household)', e);
      navigate('/inbox');
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="gradient" bubbles={false} bubbleDensity="low" className="flex-1 flex flex-col">
        <main className={`flex-1 py-8 ${accessibilityMode ? 'text-sm sm:text-base' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-lg font-extrabold text-gray-900 dark:text-white mb-6">My Shortlist</h1>

            {(!items || items.length === 0) && !loading && !error && (
              <div className="rounded-2xl border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] p-8 text-center">
                <ShortlistPlaceholderIcon className="w-20 h-20 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 text-base">No shortlisted households yet.</p>
              </div>
            )}

            {error && <ErrorAlert message={error} className="mb-4" />}

            <div className={`grid grid-cols-1 ${compactView ? 'gap-4' : 'gap-6'}`}>
              {(Array.isArray(items) ? items : [])
                .filter((s) => s.profile_type === "household")
                .map((s) => {
                  const prof = s.profile_id ? profiles[s.profile_id] : null;
                  const owner = prof?.owner || prof;
                  const householdUserId = resolveHouseholdOwnerUserId(prof) || s.user_id;
                  const kidsCount =
                    prof?.number_of_children ??
                    prof?.children_count ??
                    prof?.kids_count ??
                    (Array.isArray(prof?.kids) ? prof.kids.length : undefined) ??
                    (Array.isArray(prof?.children) ? prof.children.length : undefined);
                  const chores = Array.isArray(prof?.chores)
                    ? prof.chores
                    : prof?.chore
                      ? [prof.chore]
                      : [];
                  const serviceTypes = [
                    prof?.needs_live_in ? 'Live-in' : '',
                    prof?.needs_day_worker ? 'Day worker' : '',
                    prof?.service_type || prof?.type_of_househelp || '',
                  ].filter(Boolean);
                  const serviceLabel = Array.from(new Set(serviceTypes)).join(', ');
                  const householdProfileLink = householdUserId
                    ? `/household/public-profile?userId=${householdUserId}&from=shortlist&backTo=${encodeURIComponent('/shortlist')}&backLabel=${encodeURIComponent('Back to shortlist')}`
                    : `/household/public-profile?profileId=${encodeURIComponent(s.profile_id)}&from=shortlist&backTo=${encodeURIComponent('/shortlist')}&backLabel=${encodeURIComponent('Back to shortlist')}`;
                  return (
                    <div
                      key={s.id}
                      onClick={() => navigate(householdProfileLink, {
                        state: { profileId: s.profile_id, backTo: '/shortlist', backLabel: 'Back to shortlist' }
                      })}
                      className={`relative bg-white dark:bg-[#13131a] rounded-2xl border-2 border-purple-200/40 dark:border-purple-500/30 ${compactView ? 'p-4' : 'p-6'} hover:scale-105 hover:shadow-light-glow-md dark:hover:shadow-glow-md transition-all duration-300 cursor-pointer`}
                    >
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleChatWithHousehold(householdUserId, s.profile_id); }}
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
                        <div className="flex justify-center sm:justify-start mb-4 sm:mb-0 shrink-0">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl font-bold shadow-lg overflow-hidden relative">
                            {(() => {
                              const imageUrl = prof?.avatar_url || owner?.avatar_url || (s.user_id && profilePhotos[s.user_id]);
                              if (imageUrl) {
                                return (
                                  <>
                                    {imageLoadingStates[s.profile_id] !== false && (
                                      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-shimmer bg-[length:200%_100%]" />
                                    )}
                                    <img
                                      src={imageUrl}
                                      alt={`${owner?.first_name || ""} ${owner?.last_name || ""}`}
                                      className={`w-full h-full object-cover transition-opacity duration-300 ${
                                        imageLoadingStates[s.profile_id] === false ? "opacity-100" : "opacity-0"
                                      }`}
                                      onLoad={() => setImageLoadingStates((prev) => ({ ...prev, [s.profile_id]: false }))}
                                      onError={(e) => {
                                        setImageLoadingStates((prev) => ({ ...prev, [s.profile_id]: false }));
                                        e.currentTarget.style.display = "none";
                                      }}
                                    />
                                  </>
                                );
                              }
                              return `${owner?.first_name?.[0] || "H"}${owner?.last_name?.[0] || "H"}`;
                            })()}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1 sm:pr-8">
                          <h3 className="text-lg font-bold text-left text-gray-900 dark:text-white mb-2">
                            {prof ? `${owner?.first_name || ""} ${owner?.last_name || ""}`.trim() || "Household" : "Loading..."}
                          </h3>

                          <p className="text-xs text-gray-600 dark:text-gray-400 text-left mb-2">
                            📍 {prof?.town?.trim() || owner?.town?.trim() || "No location specified"}
                          </p>

                          {prof?.house_size && (
                            <p className="text-xs text-purple-600 dark:text-purple-400 text-left mb-2">🏠 {prof.house_size}</p>
                          )}

                          {(prof?.budget_min || prof?.budget_max) && (
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-left mb-2">
                              💰 Budget {formatBudgetAmount(prof?.budget_min)}
                              {prof?.budget_min && prof?.budget_max ? " - " : ""}
                              {formatBudgetAmount(prof?.budget_max)}
                              {prof?.salary_frequency ? ` / ${prof.salary_frequency}` : ""}
                            </p>
                          )}

                          {serviceLabel && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 text-left mb-2">
                              🧰 Service: {serviceLabel}
                            </p>
                          )}

                          {prof?.available_from && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 text-left mb-2">
                              📅 Available from {prof.available_from}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-2 justify-start mb-3">
                            {(typeof kidsCount === 'number' || typeof prof?.has_kids === 'boolean') && (
                              <span className="inline-block text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                {typeof kidsCount === 'number'
                                  ? `${kidsCount} kid${kidsCount === 1 ? '' : 's'}`
                                  : prof?.has_kids
                                    ? 'Has kids'
                                    : 'No kids'}
                              </span>
                            )}
                            {typeof prof?.has_pets === 'boolean' && (
                              <span className="inline-block text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded">
                                {prof.has_pets ? 'Has pets' : 'No pets'}
                              </span>
                            )}
                            {typeof prof?.needs_live_in === 'boolean' && (
                              <span className="inline-block text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                                {prof.needs_live_in ? 'Needs live-in' : 'No live-in'}
                              </span>
                            )}
                            {typeof prof?.needs_day_worker === 'boolean' && (
                              <span className="inline-block text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded">
                                {prof.needs_day_worker ? 'Day worker' : 'No day worker'}
                              </span>
                            )}
                          </div>

                          {chores.length > 0 && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 text-left mb-2">
                              🧹 Chores: {chores.slice(0, 3).join(', ')}
                              {chores.length > 3 ? ` +${chores.length - 3} more` : ''}
                            </p>
                          )}

                          <div className="mt-6 flex items-center gap-3">
                            <div className="text-xs font-semibold tracking-wide uppercase text-gray-400">
                              {formatTimeAgo(s.created_at)}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(householdProfileLink, {
                                  state: { profileId: s.profile_id, backTo: '/shortlist', backLabel: 'Back to shortlist' }
                                });
                              }}
                              className="ml-auto px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition"
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
