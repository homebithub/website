import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ChatBubbleLeftRightIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { API_BASE_URL, NOTIFICATIONS_API_BASE_URL } from "~/config/api";
import { apiClient } from "~/utils/apiClient";
import ShortlistPlaceholderIcon from "~/components/features/ShortlistPlaceholderIcon";
import { fetchPreferences } from "~/utils/preferencesApi";

// Types
type ShortlistItem = {
  id: string;
  profile_id: string;
  profile_type: string;
  household_id: string;
  user_id: string;
  is_locked: boolean;
  expires_at?: string | null;
  created_at: string;
};

export default function HouseholdShortlistPage() {
  const navigate = useNavigate();
  const API_BASE = useMemo(
    () => (typeof window !== "undefined" && (window as any).ENV?.AUTH_API_BASE_URL) || API_BASE_URL,
    []
  );

  const [items, setItems] = useState<ShortlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Map of profile_id -> househelp profile data
  const [profilesById, setProfilesById] = useState<Record<string, any>>({});
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});
  const [compactView, setCompactView] = useState(false);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
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

  // Load shortlist entries (mine)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.auth(
          `${API_BASE}/api/v1/shortlists/mine?offset=${offset}&limit=${limit}`
        );
        if (!res.ok) throw new Error("Failed to load shortlist");
        const data = await apiClient.json<ShortlistItem[]>(res);
        if (cancelled) return;
        setItems((prev) => (offset === 0 ? data : [...prev, ...data]));
        setHasMore(data.length === limit);
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
  }, [API_BASE, offset]);

  // Load househelp profiles for shortlist entries (only where profile_type === 'househelp')
  useEffect(() => {
    const missingIds = items
      .filter((s) => s.profile_type === "househelp")
      .map((s) => s.profile_id)
      .filter((pid) => pid && !(pid in profilesById));
    if (missingIds.length === 0) return;

    let cancelled = false;
    async function loadProfiles() {
      try {
        setLoadingProfiles(true);
        const res = await apiClient.auth(`${API_BASE}/api/v1/househelps/search_multiple`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile_type: "househelp", profile_ids: missingIds }),
        });
        if (!res.ok) throw new Error("Failed to fetch profiles");
        const data = await apiClient.json<any[]>(res);
        if (cancelled) return;
        const next: Record<string, any> = { ...profilesById };
        for (const h of data || []) {
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
  }, [items, API_BASE, profilesById]);

  async function handleRemove(profileId: string) {
    try {
      const res = await apiClient.auth(`${API_BASE}/api/v1/shortlists/${profileId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove from shortlist');
      setItems((prev) => prev.filter((s) => s.profile_id !== profileId));
      // Trigger event to update badge count in navigation
      window.dispatchEvent(new CustomEvent('shortlist-updated'));
    } catch {}
  }

  async function handleChatWithHousehelp(profileId?: string, househelpUserId?: string) {
    if (!profileId || !househelpUserId || !currentUserId) return;
    try {
      const payload: Record<string, any> = {
        household_user_id: currentUserId,
        househelp_user_id: househelpUserId,
        househelp_profile_id: profileId,
      };

      const res = await apiClient.auth(`${NOTIFICATIONS_API_BASE_URL}/notifications/api/v1/inbox/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to start chat');

      let convId: string | undefined;
      try {
        const data = await apiClient.json<any>(res);
        convId = data?.id || data?.ID || data?.conversation_id;
      } catch {
        convId = undefined;
      }

      if (convId) {
        navigate(`/inbox?conversation=${convId}`);
      } else {
        navigate('/inbox');
      }
    } catch (e) {
      console.error('Failed to start chat from shortlist (househelp)', e);
      navigate('/inbox');
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
      <PurpleThemeWrapper variant="gradient" bubbles={true} bubbleDensity="low" className="flex-1 flex flex-col">
        <main className={`flex-1 py-8 ${accessibilityMode ? 'text-base sm:text-lg' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">My Shortlist</h1>

            {items.length === 0 && !loading && !error && (
              <div className="rounded-2xl border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] p-8 text-center">
                <ShortlistPlaceholderIcon className="w-20 h-20 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 text-lg">No shortlisted househelps yet.</p>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-300 mb-4">{error}</div>
            )}
	
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${compactView ? 'gap-4' : 'gap-6'}`}>
              {items
                .filter((s) => s.profile_type === "househelp")
                .map((s) => {
                  const h = profilesById[s.profile_id];
                  return (
                    <div
                      key={s.id}
                      onClick={() => navigate('/househelp/public-profile', { state: { profileId: s.profile_id, fromShortlist: true } })}
                      className={`househelp-card relative bg-white dark:bg-[#13131a] rounded-2xl shadow-light-glow-md dark:shadow-glow-md border-2 border-purple-200/40 dark:border-purple-500/30 ${compactView ? 'p-4' : 'p-6'} hover:scale-105 transition-all duration-300 cursor-pointer`}
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

                      {/* Profile Picture */}
                      <div className="flex justify-center mb-4">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden relative">
                          {(() => {
                            const imageUrl = h?.avatar_url || h?.profile_picture || (h?.photos && h.photos[0]);
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

                      {/* Name */}
                      <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                        {h ? `${h.first_name || ''} ${h.last_name || ''}` : 'Loading...'}
                      </h3>

                      {/* Salary */}
                      {h && (
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center mb-3">
                          💰 {h.salary_expectation && Number(h.salary_expectation) > 0 
                            ? `${h.salary_expectation}${h.salary_frequency ? ` per ${
                                h.salary_frequency === 'daily' ? 'day' :
                                h.salary_frequency === 'weekly' ? 'week' :
                                h.salary_frequency === 'monthly' ? 'month' :
                                h.salary_frequency
                              }` : ''}`
                            : 'No salary expectations specified'}
                        </p>
                      )}

                      {/* Bottom actions */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-xs text-gray-400">
                          {s.created_at ? new Date(s.created_at).toLocaleDateString() : ''}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate('/househelp/public-profile', { state: { profileId: s.profile_id, fromShortlist: true } }); }}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition"
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
