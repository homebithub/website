import React, { useEffect, useMemo, useRef, useState } from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { API_BASE_URL } from "~/config/api";
import { apiClient } from "~/utils/apiClient";

type ShortlistItem = {
  id: string;
  profile_id: string;
  household_id: string;
  is_locked: boolean;
  expires_at?: string | null;
  created_at: string;
};

export default function ShortlistPage() {
  const API_BASE = useMemo(() => (typeof window !== 'undefined' && (window as any).ENV?.AUTH_API_BASE_URL) || API_BASE_URL, []);
  const [items, setItems] = useState<ShortlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.auth(`${API_BASE}/api/v1/shortlists/househelp?offset=${offset}&limit=${limit}`);
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
        <main className="flex-1 py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Shortlist</h1>

            {items.length === 0 && !loading && !error && (
              <div className="rounded-2xl border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] p-8 text-center">
                <p className="text-gray-600 dark:text-gray-300 text-lg">No shortlisted items yet.</p>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-300 mb-4">{error}</div>
            )}

            <ul className="space-y-3">
              {items.map((s) => (
                <li key={s.id} className="rounded-xl border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-primary-700 dark:text-purple-300">Shortlisted profile</div>
                    <div className="text-sm text-gray-500">{new Date(s.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 mt-1 text-sm break-all">Profile ID: {s.profile_id}</div>
                  <div className="text-gray-600 dark:text-gray-300 mt-1 text-sm">Status: {s.is_locked ? 'Locked' : 'Unlocked'}</div>
                  {s.expires_at && <div className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Expires: {new Date(s.expires_at).toLocaleString()}</div>}
                </li>
              ))}
            </ul>

            <div ref={sentinelRef} className="h-8" />
            {loading && (
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
