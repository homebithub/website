import { useCallback, useEffect, useRef, useState } from "react";
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
  enabled?: boolean;
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

function mapToNotification(notification: NotificationApiItem): NotificationItem {
  return {
    id: asString(notification.id),
    userId: asString(notification.user_id),
    channel: asString(notification.channel),
    title: asString(notification.title || notification.rendered_subject),
    message: asString(notification.message || notification.rendered_content),
    type: asString(notification.type),
    status: asString(notification.status),
    clicked: Boolean(notification.clicked || notification.clicked_at),
    createdAt: asString(notification.created_at),
    updatedAt: asString(notification.updated_at),
    created_at: asString(notification.created_at),
    updated_at: asString(notification.updated_at),
    rendered_subject: asString(notification.rendered_subject),
    rendered_content: asString(notification.rendered_content),
    clicked_at: asString(notification.clicked_at),
  };
}

function responsePayload(response: any): any {
  return response?.data?.data ?? response?.data ?? response ?? {};
}

export function useNotifications({
  pollingMs = 15_000,
  pageSize = 20,
  search = "",
  enabled = true,
}: UseNotificationsOptions = {}) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showingCount, setShowingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const unavailableUntilRef = useRef(0);
  const sourceIdRef = useRef(`notifications-${Math.random().toString(36).slice(2)}`);

  const getCurrentUserId = useCallback((): string | null => {
    const user = getStoredUser();
    const userId = user?.user_id || user?.id || getStoredUserId();
    return userId || null;
  }, []);

  const filterSearch = useCallback((list: NotificationItem[]) => {
    const query = search.trim().toLowerCase();
    if (!query) return list;
    return list.filter((item) =>
      `${item.title || ""} ${item.message || ""} ${item.type || ""}`.toLowerCase().includes(query)
    );
  }, [search]);

  const fetchLatest = useCallback(async () => {
    if (!enabled) {
      setItems([]);
      setUnreadCount(0);
      setTotalCount(0);
      setShowingCount(0);
      setHasMore(false);
      return;
    }
    if (Date.now() < unavailableUntilRef.current) return;

    try {
      setLoading(true);
      if (!getStoredAccessToken()) {
        setItems([]);
        setUnreadCount(0);
        setTotalCount(0);
        setShowingCount(0);
        setHasMore(false);
        return;
      }

      const userId = getCurrentUserId();
      if (!userId) return;

      const response = responsePayload(
        await notificationsService.listNotificationsByUser(userId, pageSize, 0)
      );
      const rawItems: NotificationApiItem[] = Array.isArray(response?.notifications)
        ? response.notifications
        : [];
      const mapped = rawItems.map(mapToNotification);
      const visible = filterSearch(mapped);

      setItems(visible);
      setTotalCount(Number(response?.total_count ?? mapped.length));
      setShowingCount(visible.length);
      setUnreadCount(Number(
        response?.unread_count ??
        mapped.filter((item) => !item.clicked && item.status?.toLowerCase() !== "read").length
      ));
      setHasMore(rawItems.length >= pageSize);
    } catch (fetchError) {
      if (shouldSilenceGatewayError(fetchError)) {
        unavailableUntilRef.current = Date.now() + 60_000;
        return;
      }
      console.error("[useNotifications] Failed to load notifications", fetchError);
    } finally {
      setLoading(false);
    }
  }, [enabled, filterSearch, getCurrentUserId, pageSize]);

  const loadMore = useCallback(async () => {
    if (!enabled || loadingMore || !hasMore || Date.now() < unavailableUntilRef.current) return;
    try {
      setLoadingMore(true);
      const userId = getCurrentUserId();
      if (!userId) return;

      const response = responsePayload(
        await notificationsService.listNotificationsByUser(userId, pageSize, items.length)
      );
      const rawItems: NotificationApiItem[] = Array.isArray(response?.notifications)
        ? response.notifications
        : [];
      const mapped = filterSearch(rawItems.map(mapToNotification));

      setItems((previous) => {
        const seen = new Set(previous.map((item) => item.id));
        return [...previous, ...mapped.filter((item) => item.id && !seen.has(item.id))];
      });
      setShowingCount((previous) => previous + mapped.length);
      setTotalCount(Number(response?.total_count ?? totalCount));
      setHasMore(rawItems.length >= pageSize);
    } catch (loadError) {
      if (shouldSilenceGatewayError(loadError)) {
        unavailableUntilRef.current = Date.now() + 60_000;
        return;
      }
      console.error("[useNotifications] Failed to load more notifications", loadError);
    } finally {
      setLoadingMore(false);
    }
  }, [enabled, filterSearch, getCurrentUserId, hasMore, items.length, loadingMore, pageSize, totalCount]);

  useEffect(() => {
    void fetchLatest();
    if (!enabled) return;
    const interval = window.setInterval(() => void fetchLatest(), pollingMs);
    return () => window.clearInterval(interval);
  }, [enabled, fetchLatest, pollingMs]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleUpdated = (event: Event) => {
      const detail = (event as CustomEvent<NotificationsUpdatedDetail>).detail;
      if (detail?.source === sourceIdRef.current) return;
      unavailableUntilRef.current = 0;
      if (detail?.action === "mark-all-read") {
        setItems((previous) => previous.map((item) => ({ ...item, clicked: true, status: "read" })));
      } else if (detail?.action === "mark-one-read" && detail.notificationId) {
        setItems((previous) => previous.map((item) =>
          item.id === detail.notificationId ? { ...item, clicked: true, status: "read" } : item
        ));
      }
      if (typeof detail?.unreadCount === "number") setUnreadCount(detail.unreadCount);
      void fetchLatest();
    };
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleUpdated);
    return () => window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handleUpdated);
  }, [fetchLatest]);

  const refreshFromRealtime = useCallback(() => {
    if (!enabled) return;
    unavailableUntilRef.current = 0;
    void fetchLatest();
  }, [enabled, fetchLatest]);

  useSSESubscription("notifications.snapshot", refreshFromRealtime);
  useSSESubscription("notifications.created", refreshFromRealtime);
  useSSESubscription("notifications.blast", refreshFromRealtime);
  useSSESubscription("notifications.system.alert", refreshFromRealtime);

  const markAllAsRead = useCallback(async () => {
    const userId = getCurrentUserId();
    if (!userId) return;
    try {
      await notificationsService.markAllNotificationsAsClicked(userId);
      unavailableUntilRef.current = 0;
      setUnreadCount(0);
      setItems((previous) => previous.map((item) => ({ ...item, clicked: true, status: "read" })));
      dispatchNotificationsUpdated({
        action: "mark-all-read",
        unreadCount: 0,
        source: sourceIdRef.current,
      });
    } catch (markError) {
      if (!shouldSilenceGatewayError(markError)) {
        console.error("[useNotifications] Failed to mark all as read", markError);
      }
    }
  }, [getCurrentUserId]);

  const markOneAsRead = useCallback(async (id: string) => {
    try {
      await notificationsService.markNotificationAsClicked(id, "");
      unavailableUntilRef.current = 0;
      setUnreadCount((previous) => Math.max(0, previous - 1));
      setItems((previous) => previous.map((item) =>
        item.id === id ? { ...item, clicked: true, status: "read" } : item
      ));
      dispatchNotificationsUpdated({
        action: "mark-one-read",
        notificationId: id,
        source: sourceIdRef.current,
      });
    } catch (markError) {
      if (!shouldSilenceGatewayError(markError)) {
        console.error("[useNotifications] Failed to mark notification as read", markError);
      }
    }
  }, []);

  return {
    items,
    unreadCount,
    totalCount,
    showingCount,
    loading,
    loadingMore,
    hasMore,
    refresh: fetchLatest,
    loadMore,
    markAllAsRead,
    markOneAsRead,
  };
}
