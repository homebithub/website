import { useEffect, useRef, useState, useCallback } from "react";
import { API_BASE_URL } from "~/config/api";
import type { NotificationItem } from "~/types/notifications";
import { notificationsService } from "~/services/grpc/notifications.service";
import { getAccessTokenFromCookies, getAuthFromCookies } from "~/utils/cookie";

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

  const getCurrentUserId = useCallback((): string | null => {
    const { user } = getAuthFromCookies();
    if (user?.id) return user.id;

    const userObj = localStorage.getItem('user_object');
    if (!userObj) return null;

    try {
      const parsed = JSON.parse(userObj);
      return parsed?.id || null;
    } catch {
      return null;
    }
  }, []);

  const computeUnread = (list: NotificationItem[]) => list.filter(n => !n.clicked && (n.status?.toLowerCase?.() !== "read")).length;

  const mapToNotification = (n: any): NotificationItem => ({
    id: n.id || "",
    userId: n.user_id || "",
    title: n.title || "",
    message: n.message || "",
    type: n.type || "",
    status: n.status || "",
    clicked: n.clicked || false,
    createdAt: n.created_at || "",
    updatedAt: n.updated_at || "",
  });

  const fetchLatest = useCallback(async (query: string = search) => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? getAccessTokenFromCookies() : undefined;
      if (!token) {
        setItems([]);
        setUnreadCount(0);
        setTotalCount(0);
        setShowingCount(0);
        setHasMore(false);
        return;
      }

      const userID = getCurrentUserId();
      if (!userID) return;

      const data = await notificationsService.listNotificationsByUser(userID, pageSize, 0);
      const notifications = data?.notifications || [];
      
      const list: NotificationItem[] = notifications.map((n: any) => mapToNotification(n));

      setItems(list);
      setHasMore(list.length >= pageSize);
      
      setTotalCount(data?.total_count || list.length);
      setShowingCount(list.length);
      setUnreadCount(data?.unread_count || computeUnread(list));
    } catch (e) {
      console.error('[useNotifications] Error:', e);
    } finally {
      setLoading(false);
    }
  }, [getCurrentUserId, pageSize, search]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const userID = getCurrentUserId();
      if (!userID) return;

      const data = await notificationsService.listNotificationsByUser(userID, pageSize, items.length);
      const notifications = data?.notifications || [];
      
      const list: NotificationItem[] = notifications.map((n: any) => mapToNotification(n));

      if (list.length > 0) {
        setItems(prev => {
          const seen = new Set(prev.map(i => i.id));
          const merged = [...prev];
          for (const it of list) {
            if (!seen.has(it.id)) merged.push(it);
          }
          return merged;
        });
        setHasMore(list.length >= pageSize);
        setShowingCount(prev => prev + list.length);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error('[useNotifications] loadMore error:', e);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchLatest(search);
    const id = setInterval(() => fetchLatest(search), pollingMs);
    return () => clearInterval(id);
  }, [fetchLatest, pollingMs, search]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = getAccessTokenFromCookies();
    if (!token) return;

    const es = new EventSource(`${API_BASE_URL}/api/v1/notifications/stream?token=${encodeURIComponent(token)}`, { withCredentials: true });
    esRef.current = es;

    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        const notifications = payload.notifications || payload.data?.notifications || [];
        if (Array.isArray(notifications) && notifications.length) {
          const list: NotificationItem[] = notifications.map((n: any) => ({
            id: n.id,
            userId: n.user_id,
            title: n.title,
            message: n.message,
            type: n.type,
            status: n.status,
            clicked: n.clicked,
            createdAt: n.created_at,
            updatedAt: n.updated_at,
          }));
          
          setItems(list);
          setHasMore(list.length === pageSize);
          setUnreadCount(typeof payload.unread_count === 'number' ? payload.unread_count : computeUnread(list));
        }
      } catch {
        // ignore
      }
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [pageSize]);

  const markAllAsRead = async () => {
    try {
      const userID = getCurrentUserId();
      if (!userID) return;
      await notificationsService.markAllNotificationsAsClicked(userID);
      await fetchLatest();
    } catch (e) {
      console.error('[useNotifications] markAllAsRead error:', e);
    }
  };

  const markOneAsRead = async (id: string) => {
    try {
      await notificationsService.markNotificationAsClicked(id, '');
      await fetchLatest();
    } catch (e) {
      console.error('[useNotifications] markOneAsRead error:', e);
    }
  };

  return { items, unreadCount, totalCount, showingCount, loading, loadingMore, hasMore, refresh: fetchLatest, loadMore, markAllAsRead, markOneAsRead };
}
