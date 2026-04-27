import { useEffect, useState, useCallback, useRef } from "react";
import type { NotificationItem } from "~/types/notifications";
import { notificationsService } from "~/services/grpc/notifications.service";
import { useSSESubscription } from "~/hooks/useSSESubscription";
import { shouldSilenceGatewayError } from "~/services/grpc/client";
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

type NotificationsUpdatedDetail = {
  action?: "mark-all-read" | "mark-one-read";
  notificationId?: string;
  unreadCount?: number;
  source?: string;
};

type NotificationApiItem = Record<string, unknown>;

const NOTIFICATIONS_UPDATED_EVENT = "notifications-updated";

function dispatchNotificationsUpdated(detail: NotificationsUpdatedDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<NotificationsUpdatedDetail>(NOTIFICATIONS_UPDATED_EVENT, { detail }));
}

function asString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return typeof value === "string" ? value : String(value);
}

function mapToNotification(n: NotificationApiItem): NotificationItem {
  return {
    id: asString(n.id),
    userId: asString(n.user_id),
    title: asString(n.title || n.rendered_subject),
    message: asString(n.message || n.rendered_content),
    type: asString(n.type),
    status: asString(n.status),
    clicked: Boolean(n.clicked || n.clicked_at),
    createdAt: asString(n.created_at),
    updatedAt: asString(n.updated_at),
    created_at: asString(n.created_at),
    updated_at: asString(n.updated_at),
    rendered_subject: asString(n.rendered_subject),
    rendered_content: asString(n.rendered_content),
    clicked_at: asString(n.clicked_at),
  };
}

export function useNotifications({ pollingMs = 15000, pageSize = 20, search = "" }: UseNotificationsOptions = {}) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showingCount, setShowingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const unavailableUntilRef = useRef(0);
  const sourceIdRef = useRef(`notifications-${Math.random().toString(36).slice(2)}`);

  const getCurrentUserId = useCallback((): string | null => {
    const user = getStoredUser();
    if (user?.id) return user.id;

    const userId = getStoredUserId();
    return userId || null;
  }, []);

  const computeUnread = (list: NotificationItem[]) => list.filter(n => !n.clicked && (n.status?.toLowerCase?.() !== "read")).length;

  const fetchLatest = useCallback(async () => {
    try {
      if (Date.now() < unavailableUntilRef.current) return;
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
      const notifications: NotificationApiItem[] = Array.isArray(data?.notifications) ? data.notifications : [];
      
      const list: NotificationItem[] = notifications.map((n) => mapToNotification(n));

      setItems(list);
      setHasMore(list.length >= pageSize);
      
      setTotalCount(data?.total_count ?? list.length);
      setShowingCount(list.length);
      setUnreadCount(data?.unread_count ?? computeUnread(list));
    } catch (e) {
      if (shouldSilenceGatewayError(e)) {
        unavailableUntilRef.current = Date.now() + 60_000;
        return;
      }
      console.error('[useNotifications] Error:', e);
    } finally {
      setLoading(false);
    }
  }, [getCurrentUserId, pageSize]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    try {
      if (Date.now() < unavailableUntilRef.current) return;
      setLoadingMore(true);
      const userID = getCurrentUserId();
      if (!userID) return;

      const data = await notificationsService.listNotificationsByUser(userID, pageSize, items.length);
      const notifications: NotificationApiItem[] = Array.isArray(data?.notifications) ? data.notifications : [];
      
      const list: NotificationItem[] = notifications.map((n) => mapToNotification(n));

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
      if (shouldSilenceGatewayError(e)) {
        unavailableUntilRef.current = Date.now() + 60_000;
        return;
      }
      console.error('[useNotifications] loadMore error:', e);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchLatest();
    const id = setInterval(() => fetchLatest(), pollingMs);
    return () => clearInterval(id);
  }, [fetchLatest, pollingMs, search]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleNotificationsUpdated = (event: Event) => {
      const detail = (event as CustomEvent<NotificationsUpdatedDetail>).detail;
      if (detail?.source === sourceIdRef.current) return;

      unavailableUntilRef.current = 0;

      if (typeof detail?.unreadCount === "number") {
        setUnreadCount(detail.unreadCount);
      }

      if (detail?.action === "mark-all-read") {
        setItems(prev => prev.map(item => ({ ...item, clicked: true, status: "read" })));
      }

      if (detail?.action === "mark-one-read" && detail.notificationId) {
        setItems(prev => prev.map(item => item.id === detail.notificationId ? { ...item, clicked: true, status: "read" } : item));
      }

      void fetchLatest();
    };

    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleNotificationsUpdated);
    return () => window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handleNotificationsUpdated);
  }, [fetchLatest]);

  const refreshFromRealtime = useCallback(() => {
    unavailableUntilRef.current = 0;
    void fetchLatest();
  }, [fetchLatest]);

  useSSESubscription('notifications.snapshot', refreshFromRealtime);
  useSSESubscription('notifications.created', refreshFromRealtime);
  useSSESubscription('notifications.blast', refreshFromRealtime);
  useSSESubscription('notifications.system.alert', refreshFromRealtime);

  const markAllAsRead = async () => {
    try {
      const userID = getCurrentUserId();
      if (!userID) return;
      await notificationsService.markAllNotificationsAsClicked(userID);
      unavailableUntilRef.current = 0;
      setUnreadCount(0);
      setItems(prev => prev.map(item => ({ ...item, clicked: true, status: "read" })));
      dispatchNotificationsUpdated({ action: "mark-all-read", unreadCount: 0, source: sourceIdRef.current });
      await fetchLatest();
    } catch (e) {
      if (!shouldSilenceGatewayError(e)) {
        console.error('[useNotifications] markAllAsRead error:', e);
      }
    }
  };

  const markOneAsRead = async (id: string) => {
    try {
      await notificationsService.markNotificationAsClicked(id, '');
      unavailableUntilRef.current = 0;
      setUnreadCount(prev => Math.max(0, prev - 1));
      setItems(prev => prev.map(item => item.id === id ? { ...item, clicked: true, status: "read" } : item));
      dispatchNotificationsUpdated({ action: "mark-one-read", notificationId: id, source: sourceIdRef.current });
      await fetchLatest();
    } catch (e) {
      if (!shouldSilenceGatewayError(e)) {
        console.error('[useNotifications] markOneAsRead error:', e);
      }
    }
  };

  return { items, unreadCount, totalCount, showingCount, loading, loadingMore, hasMore, refresh: fetchLatest, loadMore, markAllAsRead, markOneAsRead };
}
