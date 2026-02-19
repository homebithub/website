import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { API_BASE_URL, NOTIFICATIONS_API_BASE_URL } from "~/config/api";
import { apiClient } from "~/utils/apiClient";
import { getInboxRoute, startOrGetConversation, type StartConversationPayload } from '~/utils/conversationLauncher';
import ShortlistPlaceholderIcon from "~/components/features/ShortlistPlaceholderIcon";
import { formatTimeAgo } from "~/utils/timeAgo";
import { fetchPreferences } from "~/utils/preferencesApi";
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { useProfilePhotos } from '~/hooks/useProfilePhotos';

type ShortlistItem = {
  id: string;
  profile_id: string;
  profile_type: string;
  user_id: string;
  household_id: string;
  is_locked: boolean;
  expires_at?: string | null;
  created_at: string;
};

export default function ShortlistPage() {
  const API_BASE = useMemo(() => (typeof window !== 'undefined' && (window as any).ENV?.AUTH_API_BASE_URL) || API_BASE_URL, []);
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
  const currentUser = useMemo(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('user_object');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);
  const currentUserId: string | undefined = currentUser?.id;
  const currentProfileType: string | undefined = currentUser?.profile_type;
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
          const token = localStorage.getItem("token");
          if (!token) return;
          
          const res = await fetch(`${API_BASE}/api/v1/profile/household/me`, {
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
  }, [currentProfileType, currentUserId, API_BASE]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.auth(`${API_BASE}/api/v1/shortlists/mine?offset=${offset}&limit=${limit}`);
        if (!res.ok) throw new Error("Failed to load shortlist");
        const raw = await apiClient.json<any>(res);
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
  }, [API_BASE, offset]);

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
            const res = await apiClient.auth(`${API_BASE}/api/v1/profile/household/${profileId}`);
            if (!res.ok) return { profileId, data: null };
            const raw = await apiClient.json<any>(res);
            const data = raw?.data?.data || raw?.data || raw;
            return { profileId, data };
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
  }, [items, API_BASE]);

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
      const res = await apiClient.auth(`${API_BASE}/api/v1/shortlists/${profileId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove from shortlist');
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
        <main className={`flex-1 py-8 ${accessibilityMode ? 'text-base sm:text-lg' : ''}`}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-xl font-extrabold text-gray-900 dark:text-white mb-6">My Shortlist</h1>

            {(!items || items.length === 0) && !loading && !error && (
              <div className="rounded-2xl border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] p-8 text-center">
                <ShortlistPlaceholderIcon className="w-20 h-20 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 text-lg">No shortlisted households yet.</p>
              </div>
            )}

            {error && <ErrorAlert message={error} className="mb-4" />}

            <div className={`grid grid-cols-1 md:grid-cols-2 ${compactView ? 'gap-4' : 'gap-6'}`}>
              {(Array.isArray(items) ? items : [])
                .filter((s) => s.profile_type === "household")
                .map((s) => {
                  const prof = s.profile_id ? profiles[s.profile_id] : null;
                  const owner = prof?.owner || prof;
                  const householdUserId = prof?.owner_user_id || prof?.user_id || owner?.id || s.user_id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => navigate(`/household/public-profile?user_id=${householdUserId || s.profile_id}`, {
                        state: { profileId: householdUserId || s.profile_id, backTo: '/shortlist', backLabel: 'Back to shortlist' }
                      })}
                      className={`relative bg-white dark:bg-[#13131a] rounded-2xl shadow-light-glow-md dark:shadow-glow-md border-2 border-purple-200/40 dark:border-purple-500/30 ${compactView ? 'p-4' : 'p-6'} hover:scale-105 transition-all duration-300 cursor-pointer`}
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

                      <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden relative">
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

                      <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                        {prof ? `${owner?.first_name || ""} ${owner?.last_name || ""}`.trim() || "Household" : "Loading..."}
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
                        📍 {prof?.town?.trim() || owner?.town?.trim() || "No location specified"}
                      </p>

                      {prof?.house_size && (
                        <p className="text-sm text-purple-600 dark:text-purple-400 text-center mb-3">🏠 {prof.house_size}</p>
                      )}

                      <div className="mt-6 flex items-center gap-3">
                        <div className="text-xs font-semibold tracking-wide uppercase text-gray-400">
                          {formatTimeAgo(s.created_at)}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/household/public-profile?user_id=${householdUserId || s.profile_id}`, {
                              state: { profileId: householdUserId || s.profile_id, backTo: '/shortlist', backLabel: 'Back to shortlist' }
                            });
                          }}
                          className="ml-auto px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition"
                        >
                          View more
                        </button>
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
