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
import ShortlistPlaceholderIcon from "~/components/features/ShortlistPlaceholderIcon";

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

const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const TIME_DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Infinity, unit: "year" },
];

const formatTimeAgo = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  let duration = (date.getTime() - Date.now()) / 1000;

  for (const division of TIME_DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return RELATIVE_TIME_FORMATTER.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }
  return "";
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
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});
  const fetchedProfilesRef = useRef<Set<string>>(new Set());
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

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.auth(`${API_BASE}/api/v1/shortlists/mine?offset=${offset}&limit=${limit}`);
        if (!res.ok) throw new Error("Failed to load shortlist");
        const data = await apiClient.json<ShortlistItem[]>(res);
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
    const neededUserIds = Array.from(
      new Set(
        items
          .filter((s) => s.profile_type === 'household')
          .map((s) => s.user_id)
          .filter(Boolean)
      )
    );

    const missing = neededUserIds.filter(
      (uid) => uid && !fetchedProfilesRef.current.has(uid)
    );

    if (missing.length === 0) return;

    let cancelled = false;
    async function fetchProfiles() {
      try {
        setLoadingProfiles(true);
        const results = await Promise.all(
          missing.map(async (uid) => {
            const res = await apiClient.auth(`${API_BASE}/api/v1/profile/household/${uid}`);
            if (!res.ok) return { uid, data: null };
            const data = await apiClient.json<any>(res);
            return { uid, data };
          })
        );
        if (cancelled) return;
        setProfiles((prev) => {
          const next = { ...prev } as Record<string, any>;
          for (const r of results) {
            if (r.uid && r.data) {
              next[r.uid] = r.data;
              fetchedProfilesRef.current.add(r.uid);
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

      const payload: Record<string, any> = {
        household_user_id: householdId,
        househelp_user_id: househelpId,
      };
      if (householdProfileId) {
        payload.household_profile_id = householdProfileId;
      }

      const res = await apiClient.auth(`${NOTIFICATIONS_API_BASE_URL}/notifications/api/v1/inbox/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to start conversation');

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
      console.error('Failed to start chat from shortlist (household)', e);
      navigate('/inbox');
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="gradient" bubbles={true} bubbleDensity="low" className="flex-1 flex flex-col">
        <main className="flex-1 py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">My Shortlist</h1>

            {items.length === 0 && !loading && !error && (
              <div className="rounded-2xl border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] p-8 text-center">
                <ShortlistPlaceholderIcon className="w-20 h-20 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 text-lg">No shortlisted households yet.</p>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-300 mb-4">{error}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items
                .filter((s) => s.profile_type === "household")
                .map((s) => {
                  const prof = s.user_id ? profiles[s.user_id] : null;
                  return (
                    <div
                      key={s.id}
                      onClick={() => navigate(`/household/public-profile?user_id=${s.user_id}`, {
                        state: { profileId: s.user_id, backTo: '/shortlist', backLabel: 'Back to shortlist' }
                      })}
                      className="relative bg-white dark:bg-[#13131a] rounded-2xl shadow-light-glow-md dark:shadow-glow-md border-2 border-purple-200/40 dark:border-purple-500/30 p-6 hover:scale-105 transition-all duration-300 cursor-pointer"
                    >
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleChatWithHousehold(s.user_id, s.profile_id); }}
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
                            const imageUrl = prof?.avatar_url;
                            if (imageUrl) {
                              return (
                                <>
                                  {imageLoadingStates[s.profile_id] !== false && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-shimmer bg-[length:200%_100%]" />
                                  )}
                                  <img
                                    src={imageUrl}
                                    alt={`${prof?.first_name || ""} ${prof?.last_name || ""}`}
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
                            return `${prof?.first_name?.[0] || "H"}${prof?.last_name?.[0] || "H"}`;
                          })()}
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                        {prof ? `${prof.first_name || ""} ${prof.last_name || ""}`.trim() || "Household" : "Loading..."}
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
                        📍 {prof?.town?.trim() || "No location specified"}
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
                            navigate(`/household/public-profile?user_id=${s.user_id}`, {
                              state: { profileId: s.user_id, backTo: '/shortlist', backLabel: 'Back to shortlist' }
                            });
                          }}
                          className="ml-auto px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition"
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
