import { useEffect, useMemo, useRef, useState } from "react";
import { API_BASE_URL, NOTIFICATIONS_API_BASE_URL } from "~/config/api";

export interface NotificationItem {
  id: string;
  title?: string;
  message?: string;
  created_at?: string;
  clicked?: boolean;
  status?: string;
  [key: string]: any;
}

interface UseNotificationsOptions {
  pollingMs?: number;
  pageSize?: number;
}

export function useNotifications({ pollingMs = 15000, pageSize = 20 }: UseNotificationsOptions = {}) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  const base = useMemo(() => NOTIFICATIONS_API_BASE_URL || API_BASE_URL, []);

  const computeUnread = (list: NotificationItem[]) => list.filter(n => !n.clicked && (n.status?.toLowerCase?.() !== "read")).length;

  const fetchLatest = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : undefined;
      if (!token) {
        setItems([]);
        setUnreadCount(0);
        return;
      }
      const res = await fetch(`${base}/api/v1/notifications?limit=${pageSize}&offset=0`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const list: NotificationItem[] = data.notifications || data.data?.notifications || [];
      setItems(list);
      setUnreadCount(typeof data.unread_count === 'number' ? data.unread_count : computeUnread(list));
    } catch (e) {
      // swallow for now
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatest();
    const id = setInterval(fetchLatest, pollingMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, pageSize, pollingMs]);

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

    es.addEventListener('notifications', (ev) => {
      try {
        const payload = JSON.parse((ev as MessageEvent).data);
        const list: NotificationItem[] = payload.notifications || payload.data?.notifications || [];
        if (Array.isArray(list) && list.length) {
          setItems(list);
          setUnreadCount(typeof payload.unread_count === 'number' ? payload.unread_count : computeUnread(list));
        }
      } catch {
        // ignore parse errors
      }
    });

    es.addEventListener('error', () => {
      // keep quiet; periodic polling still runs
    });

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [base]);

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

  return { items, unreadCount, loading, refresh: fetchLatest, markAllAsRead, markOneAsRead };
}
