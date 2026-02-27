import { useEffect, useMemo, useRef, useState } from "react";
import { API_BASE_URL, NOTIFICATIONS_API_BASE_URL } from "~/config/api";
import type { NotificationItem } from "~/types/notifications";

interface UseNotificationsOptions {
  pollingMs?: number;
  pageSize?: number;
  search?: string;
}

export function useNotifications({ pollingMs = 15000, pageSize = 20, search = "" }: UseNotificationsOptions = {}) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showingCount, setShowingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const esRef = useRef<EventSource | null>(null);

  const base = useMemo(() => NOTIFICATIONS_API_BASE_URL || API_BASE_URL, []);

  const computeUnread = (list: NotificationItem[]) => list.filter(n => !n.clicked && (n.status?.toLowerCase?.() !== "read")).length;

  const fetchLatest = async (query: string = search) => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : undefined;
      if (!token) {
        setItems([]);
        setUnreadCount(0);
        setTotalCount(0);
        setShowingCount(0);
        setHasMore(false);
        return;
      }
      const searchParam = query ? `&search=${encodeURIComponent(query)}` : "";
      const res = await fetch(`${base}/api/v1/notifications?limit=${pageSize}&offset=0${searchParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const list: NotificationItem[] = data.notifications || data.data?.notifications || [];
      setItems(list);
      setHasMore(list.length >= pageSize);
      setTotalCount(data.total_count || data.data?.total_count || list.length);
      setShowingCount(data.showing_count || data.data?.showing_count || list.length);
      setUnreadCount(typeof data.unread_count === 'number' ? data.unread_count : computeUnread(list));
    } catch (e) {
      // swallow for now
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : undefined;
      if (!token) return;
      const offset = items.length;
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`${base}/api/v1/notifications?limit=${pageSize}&offset=${offset}${searchParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const list: NotificationItem[] = data.notifications || data.data?.notifications || [];
      if (Array.isArray(list) && list.length) {
        // append unique by id preserving order
        setItems(prev => {
          const seen = new Set(prev.map(i => i.id));
          const merged = [...prev];
          for (const it of list) {
            if (!seen.has(it.id)) merged.push(it);
          }
          return merged;
        });
        setHasMore(list.length >= pageSize);
        setTotalCount(data.total_count || data.data?.total_count || totalCount);
        setShowingCount(prev => prev + list.length);
      } else {
        setHasMore(false);
      }
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchLatest(search);
    const id = setInterval(() => fetchLatest(search), pollingMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, pageSize, pollingMs, search]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) return;

    const url = new URL(`${base}/api/v1/notifications/stream`);
    // Attach token via query if fetch EventSource cannot set headers easily
    url.searchParams.set('token', token);

    // Prefer standard EventSource with Authorization polyfill via token query
    const es = new EventSource(url.toString());
    esRef.current = es;

    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        const list: NotificationItem[] = payload.notifications || payload.data?.notifications || [];
        if (Array.isArray(list) && list.length) {
          // Reset to latest page (first chunk); infinite scroll can still append beyond this
          setItems(list);
          setHasMore(list.length === pageSize);
          setUnreadCount(typeof payload.unread_count === 'number' ? payload.unread_count : computeUnread(list));
        }
      } catch {
        // ignore parse errors
      }
    };

    es.addEventListener('error', () => {
      // keep quiet; periodic polling still runs
    });

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [base, pageSize]);

  const markAllAsRead = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : undefined;
    if (!token) return;
    await fetch(`${base}/api/v1/notifications/mark-all-clicked`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchLatest();
  };

  const markOneAsRead = async (id: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : undefined;
    if (!token) return;
    await fetch(`${base}/api/v1/notifications/${id}/clicked`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchLatest();
  };

  return { items, unreadCount, totalCount, showingCount, loading, loadingMore, hasMore, refresh: fetchLatest, loadMore, markAllAsRead, markOneAsRead };
}
