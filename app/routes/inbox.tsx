import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { API_BASE_URL } from "~/config/api";
import { apiClient } from "~/utils/apiClient";

type Conversation = {
  id: string;
  household_id: string;
  househelp_id: string;
  last_message_at: string;
  unread_count?: number;
};

export default function InboxPage() {
  const API_BASE = React.useMemo(() => (typeof window !== 'undefined' && (window as any).ENV?.AUTH_API_BASE_URL) || API_BASE_URL, []);
  const [items, setItems] = useState<Conversation[]>([]);
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
        const res = await apiClient.auth(`${API_BASE}/api/v1/inbox/conversations?offset=${offset}&limit=${limit}`);
        if (!res.ok) throw new Error("Failed to load conversations");
        const data = await apiClient.json<Conversation[]>(res);
        if (cancelled) return;
        setItems((prev) => (offset === 0 ? data : [...prev, ...data]));
        setHasMore(data.length === limit);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load conversations");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [offset]);

  // Polling refresh: every 15s, refresh the first N items (where N = already loaded or default limit)
  useEffect(() => {
    const id = setInterval(async () => {
      if (loading) return;
      try {
        const count = items.length > 0 ? items.length : limit;
        const res = await apiClient.auth(`${API_BASE}/api/v1/inbox/conversations?offset=0&limit=${count}`);
        if (!res.ok) return;
        const data = await apiClient.json<Conversation[]>(res);
        setItems(data);
        setHasMore(data.length >= count);
      } catch {}
    }, 15000);
    return () => clearInterval(id);
  }, [API_BASE, items.length, loading]);

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
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">Inbox</h1>

            {items.length === 0 && !loading && !error && (
              <div className="rounded-2xl border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] p-8 text-center">
                <p className="text-gray-600 dark:text-gray-300 text-lg">No conversations yet.</p>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-300 mb-4">{error}</div>
            )}

            <ul className="space-y-3">
              {items.map((c) => (
                <li key={c.id} className="rounded-xl border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] p-0 overflow-hidden">
                  <Link to={`/inbox/${c.id}`} className="block p-4 hover:bg-purple-50 dark:hover:bg-slate-800/60 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-primary-700 dark:text-purple-300">Conversation</div>
                        {typeof c.unread_count === 'number' && c.unread_count > 0 && (
                          <span className="inline-flex items-center justify-center rounded-full bg-purple-600 text-white text-xs font-bold min-w-[22px] h-[22px] px-1">
                            {c.unread_count}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{new Date(c.last_message_at).toLocaleString()}</div>
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 mt-1 text-sm break-all">ID: {c.id}</div>
                  </Link>
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
