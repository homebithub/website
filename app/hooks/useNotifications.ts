import { useCallback, useState } from "react";
import type { NotificationItem } from "~/types/notifications";

interface UseNotificationsOptions {
  pollingMs?: number;
  pageSize?: number;
  search?: string;
  enabled?: boolean;
}

export function useNotifications(_options: UseNotificationsOptions = {}) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    setItems([]);
    setUnreadCount(0);
  }, []);

  const loadMore = useCallback(async () => {
    return;
  }, []);

  const markAllAsRead = useCallback(async () => {
    setUnreadCount(0);
    setItems((prev) => prev.map((item) => ({ ...item, clicked: true, status: "read" })));
  }, []);

  const markOneAsRead = useCallback(async (id: string) => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, clicked: true, status: "read" } : item));
  }, []);

  return {
    items,
    unreadCount,
    totalCount: items.length,
    showingCount: items.length,
    loading: false,
    loadingMore: false,
    hasMore: false,
    refresh,
    loadMore,
    markAllAsRead,
    markOneAsRead,
  };
}
