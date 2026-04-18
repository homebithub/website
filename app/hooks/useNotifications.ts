import { useEffect, useState, useCallback } from "react";
import type { NotificationItem } from "~/types/notifications";
import { notificationsService } from "~/services/grpc/notifications.service";
import { useSSESubscription } from "~/hooks/useSSESubscription";
import {
  getStoredAccessToken,
  getStoredUser,
  getStoredUserId,
} from "~/utils/authStorage";

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

  const getCurrentUserId = useCallback((): string | null => {
    const user = getStoredUser();
    if (user?.id) return user.id;

    const userId = getStoredUserId();
    return userId || null;
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
      const token = typeof window !== 'undefined' ? getStoredAccessToken() : undefined;
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

  const refreshFromRealtime = useCallback(() => {
    void fetchLatest(search);
  }, [fetchLatest, search]);

  useSSESubscription('notifications.snapshot', refreshFromRealtime);
  useSSESubscription('notifications.created', refreshFromRealtime);
  useSSESubscription('notifications.blast', refreshFromRealtime);
  useSSESubscription('notifications.system.alert', refreshFromRealtime);

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
