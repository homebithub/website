import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { API_BASE_URL } from "~/config/api";
import type { NotificationItem } from "~/types/notifications";
import { NotificationsServiceClient } from "~/proto/notifications/notifications.client";
import { transport, getGrpcMetadata, handleGrpcError } from "~/utils/grpcClient";
import { ListNotificationsByUserRequest, MarkNotificationAsClickedRequest, MarkAllNotificationsAsClickedRequest } from "~/proto/notifications/notifications";

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

  const client = useMemo(() => new NotificationsServiceClient(transport), []);

  const computeUnread = (list: NotificationItem[]) => list.filter(n => !n.clicked && (n.status?.toLowerCase?.() !== "read")).length;

  const mapProtoToNotification = (fields: any): NotificationItem => ({
    id: fields.id?.stringValue || "",
    userId: fields.user_id?.stringValue || "",
    title: fields.title?.stringValue || "",
    message: fields.message?.stringValue || "",
    type: fields.type?.stringValue || "",
    status: fields.status?.stringValue || "",
    clicked: fields.clicked?.boolValue || false,
    createdAt: fields.created_at?.stringValue || "",
    updatedAt: fields.updated_at?.stringValue || "",
  });

  const fetchLatest = useCallback(async (query: string = search) => {
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

      const userObj = localStorage.getItem('user_object');
      if (!userObj) return;
      const user = JSON.parse(userObj);

      const request: ListNotificationsByUserRequest = {
        userId: user.id,
        limit: pageSize,
        offset: 0,
        search: query
      };

      const { response } = await client.listNotificationsByUser(request, { metadata: getGrpcMetadata() });
      
      const data = response.data?.fields || {};
      const notifications = data.notifications?.listValue?.values || [];
      
      const list: NotificationItem[] = notifications.map((v: any) => mapProtoToNotification(v.structValue?.fields || {}));

      setItems(list);
      setHasMore(list.length >= pageSize);
      
      setTotalCount(data.total_count?.numberValue || list.length);
      setShowingCount(list.length);
      setUnreadCount(data.unread_count?.numberValue || computeUnread(list));
    } catch (e) {
      handleGrpcError(e, false);
    } finally {
      setLoading(false);
    }
  }, [client, pageSize, search]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const userObj = localStorage.getItem('user_object');
      if (!userObj) return;
      const user = JSON.parse(userObj);
      
      const request: ListNotificationsByUserRequest = {
        userId: user.id,
        limit: pageSize,
        offset: items.length,
        search: search
      };

      const { response } = await client.listNotificationsByUser(request, { metadata: getGrpcMetadata() });
      const data = response.data?.fields || {};
      const notifications = data.notifications?.listValue?.values || [];
      
      const list: NotificationItem[] = notifications.map((v: any) => mapProtoToNotification(v.structValue?.fields || {}));

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
      handleGrpcError(e, false);
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
    const token = localStorage.getItem('token');
    if (!token) return;

    const url = new URL(`${API_BASE_URL}/api/v1/notifications/stream`);
    url.searchParams.set('token', token);

    const es = new EventSource(url.toString());
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
      const userObj = localStorage.getItem('user_object');
      if (!userObj) return;
      const user = JSON.parse(userObj);
      
      const request: MarkAllNotificationsAsClickedRequest = { userId: user.id };
      await client.markAllNotificationsAsClicked(request, { metadata: getGrpcMetadata() });
      await fetchLatest();
    } catch (e) {
      handleGrpcError(e);
    }
  };

  const markOneAsRead = async (id: string) => {
    try {
      const request: MarkNotificationAsClickedRequest = { id };
      await client.markNotificationAsClicked(request, { metadata: getGrpcMetadata() });
      await fetchLatest();
    } catch (e) {
      handleGrpcError(e);
    }
  };

  return { items, unreadCount, totalCount, showingCount, loading, loadingMore, hasMore, refresh: fetchLatest, loadMore, markAllAsRead, markOneAsRead };
}
