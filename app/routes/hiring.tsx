import React, { useEffect, useMemo, useRef, useState } from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { API_BASE_URL } from "~/config/api";
import { apiClient } from "~/utils/apiClient";

type Employment = {
  id: string;
  household_id: string;
  househelp_id: string;
  start_date: string | null;
  end_date: string | null;
  salary: number;
  notes: string;
  status: string;
  created_at: string;
};

export default function HiringHistoryPage() {
  const API_BASE = useMemo(() => (typeof window !== 'undefined' && (window as any).ENV?.AUTH_API_BASE_URL) || API_BASE_URL, []);
  const [items, setItems] = useState<Employment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const endpoint = useMemo(() => {
    let userType: string | null = null;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('user_object');
        if (stored) userType = JSON.parse(stored)?.profile_type || null;
      } catch {}
      if (!userType) userType = localStorage.getItem('userType') || localStorage.getItem('profile_type');
    }
    if (userType === 'househelp') return `${API_BASE}/api/v1/employments/history/househelp`;
    return `${API_BASE}/api/v1/employments/history/household`;
  }, [API_BASE]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.auth(`${endpoint}?offset=${offset}&limit=${limit}`);
        if (!res.ok) throw new Error("Failed to load hiring history");
        const data = await apiClient.json<Employment[]>(res);
        if (cancelled) return;
        setItems((prev) => (offset === 0 ? data : [...prev, ...data]));
        setHasMore(data.length === limit);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load hiring history");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [endpoint, offset]);

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
        <main className="flex-1 py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Hiring</h1>

            {items.length === 0 && !loading && !error && (
              <div className="rounded-2xl border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] p-8 text-center">
                <p className="text-gray-600 dark:text-gray-300 text-lg">No hiring records yet.</p>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-300 mb-4">{error}</div>
            )}

            <ul className="space-y-3">
              {items.map((e) => (
                <li key={e.id} className="rounded-xl border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-primary-700 dark:text-purple-300">{e.status}</div>
                    <div className="text-sm text-gray-500">{new Date(e.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 mt-1 text-sm">
                    Start: {e.start_date ? new Date(e.start_date).toLocaleDateString() : 'N/A'}
                    {" • "} End: {e.end_date ? new Date(e.end_date).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 mt-1 text-sm">Salary: {e.salary ? e.salary.toLocaleString() : 'N/A'}</div>
                  {e.notes && <div className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Notes: {e.notes}</div>}
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
