import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { API_BASE_URL } from "~/config/api";
import { apiClient } from "~/utils/apiClient";

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
  const [loadingProfiles, setLoadingProfiles] = useState(false);

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
    // Only fetch for items where profile_type is household
    const neededUserIds = items
      .filter((s) => s.profile_type === 'household')
      .map((s) => s.user_id)
      .filter(Boolean);
    const missing = neededUserIds.filter((uid) => !(uid in profiles));
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
            if (r.data) next[r.uid] = r.data;
          }
          return next;
        });
      } finally {
        if (!cancelled) setLoadingProfiles(false);
      }
    }
    fetchProfiles();
    return () => { cancelled = true; };
  }, [items, API_BASE, profiles]);

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
    } catch (e) {
      // optionally surface error
    }
  }

  async function handleChatWithHousehold(userId?: string) {
    if (!userId) return;
    try {
      const res = await apiClient.auth(`${API_BASE}/api/v1/inbox/start/household/${userId}`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to start chat');
      navigate('/inbox');
    } catch (e) {
      // optionally surface error
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
                <p className="text-gray-600 dark:text-gray-300 text-lg">No shortlisted items yet.</p>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-300 mb-4">{error}</div>
            )}

            <ul className="space-y-3">
              {items.map((s) => {
                const prof = s.user_id ? profiles[s.user_id] : null;
                return (
                  <li key={s.id} className="rounded-xl border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-primary-700 dark:text-purple-300">{s.profile_type === 'household' ? 'Household' : 'Profile'}</div>
                        <span className={`text-xs px-2 py-1 rounded-full border ${s.is_locked ? 'border-yellow-300 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20' : 'border-green-300 text-green-700 bg-green-50 dark:bg-green-900/20'}`}>
                          {s.is_locked ? 'Locked' : 'Unlocked'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">{new Date(s.created_at).toLocaleDateString()}</div>
                    </div>
                    {prof ? (
                      <div className="mt-2 flex items-center gap-4">
                        <img src={prof.avatar_url || "https://placehold.co/48x48?text=HH"} alt={prof.address || 'Household'} className="w-12 h-12 rounded-full object-cover bg-gray-200" />
                        <div className="flex-1">
                          <div className="text-primary-800 dark:text-primary-200 font-semibold">{prof.address || 'Household'}</div>
                          {prof.budget_min && (
                            <div className="text-sm text-gray-600 dark:text-gray-300">Budget: {prof.budget_min}{prof.salary_frequency ? `/${prof.salary_frequency}` : ''}{prof.budget_max ? ` - ${prof.budget_max}` : ''}</div>
                          )}
                          {prof.house_size && (
                            <div className="text-sm text-gray-600 dark:text-gray-300">House size: {prof.house_size}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <a href={`/household/public-profile/${s.user_id}`} className="px-3 py-2 text-sm rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700">View</a>
                          <button onClick={() => handleChatWithHousehold(s.user_id)} className="px-3 py-2 text-sm rounded-lg border-2 border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-500/40 dark:text-purple-300">Chat</button>
                          <button onClick={() => handleRemove(s.profile_id)} className="px-3 py-2 text-sm rounded-lg border-2 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-500/40 dark:text-red-300">Remove</button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-600 dark:text-gray-300 mt-1 text-sm break-all">Profile ID: {s.profile_id}</div>
                    )}
                    <div className="text-gray-600 dark:text-gray-300 mt-1 text-sm">Status: {s.is_locked ? 'Locked' : 'Unlocked'}</div>
                    {s.expires_at && <div className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Expires: {new Date(s.expires_at).toLocaleString()}</div>}
                  </li>
                );
              })}
            </ul>

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
