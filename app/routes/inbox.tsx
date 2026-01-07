import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Navigation } from "~/components/Navigation";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { API_BASE_URL, API_ENDPOINTS, NOTIFICATIONS_API_BASE_URL } from "~/config/api";
import { apiClient } from "~/utils/apiClient";
import { ArrowLeftIcon, PaperAirplaneIcon, FaceSmileIcon, ChevronDownIcon, XMarkIcon, EllipsisVerticalIcon, CheckCircleIcon, ExclamationTriangleIcon, CheckIcon } from '@heroicons/react/24/outline';
import EmojiPicker, { type EmojiClickData, Theme } from 'emoji-picker-react';
import ConversationHireWizard from '~/components/hiring/ConversationHireWizard';
import HireContextBanner from '~/components/hiring/HireContextBanner';
import { useWebSocketContext } from '~/contexts/WebSocketContext';
import { WSEventNewMessage, WSEventMessageRead, WSEventMessageEdited, WSEventMessageDeleted, WSEventReactionAdded, WSEventReactionRemoved } from '~/types/websocket';
import type { MessageEvent as WSMessageEvent } from '~/types/websocket';
import { formatTimeAgo } from "~/utils/timeAgo";

type Conversation = {
  id: string;
  household_id: string;
  househelp_id: string;
  household_profile_id?: string | null;
  househelp_profile_id?: string | null;
  household_profile_type?: string | null;
  househelp_profile_type?: string | null;
  last_message_at: string | null;
  unread_count?: number;
  participant_name?: string;
  participant_avatar?: string;
};

type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at?: string | null;
  created_at: string;
  _status?: MessageStatus; // Client-side status tracking
  // New fields to support actions
  deleted_at?: string | null;
  edited_at?: string | null;
  reply_to_id?: string | null;
  reactions?: Array<{ emoji: string; user_id: string }>;
};

type ToastItem = {
  id: string;
  message: string;
  type: 'success' | 'error';
};

type HireRequestSummary = {
  id: string;
  household_id: string;
  househelp_id: string;
  status: string;
};

export default function InboxPage() {
  const API_BASE = React.useMemo(() => (typeof window !== 'undefined' && (window as any).ENV?.AUTH_API_BASE_URL) || API_BASE_URL, []);
  const NOTIFICATIONS_BASE = React.useMemo(
    () => (typeof window !== 'undefined' && (window as any).ENV?.NOTIFICATIONS_API_BASE_URL) || NOTIFICATIONS_API_BASE_URL,
    []
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedConversationId = searchParams.get('conversation');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(selectedConversationId);
  
  // Conversations list state
  const [items, setItems] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  
  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [messagesOffset, setMessagesOffset] = useState(0);
  const [messagesHasMore, setMessagesHasMore] = useState(true);
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const messagesSentinelRef = useRef<HTMLDivElement | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const reactionPickerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalUrl, setProfileModalUrl] = useState<string | null>(null);
  const [profileModalLoading, setProfileModalLoading] = useState(false);
  const profileModalTimeoutId = useRef<number | null>(null);
  const [profileModalTimedOut, setProfileModalTimedOut] = useState(false);
  const [profileModalReloadKey, setProfileModalReloadKey] = useState(0);
  const [openMsgMenuId, setOpenMsgMenuId] = useState<string | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<string>("");
  const [editingSaving, setEditingSaving] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [highlightMsgId, setHighlightMsgId] = useState<string | null>(null);
  const [openReactPickerMsgId, setOpenReactPickerMsgId] = useState<string | null>(null);
  const [infoForMsgId, setInfoForMsgId] = useState<string | null>(null);
  const [deleteConfirmMsg, setDeleteConfirmMsg] = useState<Message | null>(null);
  const [msgMenuFocusIndex, setMsgMenuFocusIndex] = useState<number>(0);
  const msgMenuRef = useRef<HTMLDivElement | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const messagesLimit = 50;
  const pushToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  const [openReactionNames, setOpenReactionNames] = useState<{ msgId: string; emoji: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const deleteTimersRef = useRef<Record<string, number>>({});
  const deletedBackupRef = useRef<Record<string, { body: string }>>({});
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<string>>(new Set());
  
  // Hire wizard state
  const [showHireWizard, setShowHireWizard] = useState(false);
  const [hireRequestStatus, setHireRequestStatus] = useState<string | undefined>();
  const [hireRequestId, setHireRequestId] = useState<string | undefined>();
  const [hireActionLoading, setHireActionLoading] = useState<'accept' | 'decline' | null>(null);
  
  // Use global WebSocket connection
  const { connectionState, addEventListener } = useWebSocketContext();
  
  const currentUserId = useMemo(() => {
    try {
      const str = localStorage.getItem("user_object");
      if (!str) return null;
      const obj = JSON.parse(str);
      return obj?.id || null;
    } catch {
      return null;
    }
  }, []);

  const currentUserProfileType = useMemo(() => {
    try {
      const str = localStorage.getItem("user_object");
      if (!str) return null;
      const obj = JSON.parse(str);
      return obj?.profile_type || null;
    } catch {
      return null;
    }
  }, []);
  
  // Deduplicate conversations to prevent showing multiple conversations for the same participant pair
  const deduplicatedItems = useMemo(() => {
    const seen = new Map<string, Conversation>();
    const currentRole = currentUserProfileType?.toLowerCase();
    
    for (const conv of items) {
      // Create a unique key based on the participant pair
      const key = currentRole === 'household' 
        ? `household-${conv.household_id}-househelp-${conv.househelp_id}`
        : `househelp-${conv.househelp_id}-household-${conv.household_id}`;
      
      const existing = seen.get(key);
      if (!existing) {
        seen.set(key, conv);
      } else {
        // Keep the conversation with the most recent activity
        const existingTime = existing.last_message_at ? new Date(existing.last_message_at).getTime() : 0;
        const currentTime = conv.last_message_at ? new Date(conv.last_message_at).getTime() : 0;
        if (currentTime > existingTime) {
          seen.set(key, conv);
        }
      }
    }
    
    return Array.from(seen.values()).sort((a, b) => {
      const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      return bTime - aTime; // Most recent first
    });
  }, [items, currentUserProfileType]);
  
  useEffect(() => {
    setActiveConversationId(selectedConversationId);
  }, [selectedConversationId]);

  const selectedConversation = items.find(c => c.id === activeConversationId);
  
  // Track image loading state for avatars
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});

  // Hydrate conversations with participant profile information from the auth service
  useEffect(() => {
    const role = currentUserProfileType?.toLowerCase();
    if (!role) return;

    // Only look up conversations that don't already have a participant_name
    const missing = items.filter((c) => !c.participant_name);
    if (missing.length === 0) return;

    let cancelled = false;

    const loadProfiles = async () => {
      const updates: { id: string; participant_name?: string; participant_avatar?: string }[] = [];

      for (const conv of missing) {
        try {
          if (role === "household") {
            // Household user: other participant is a househelp
            const profileId = (conv as any).househelp_profile_id || conv.househelp_id;
            if (!profileId) continue;
            const res = await apiClient.auth(`${API_BASE}/api/v1/househelps/${encodeURIComponent(profileId)}/profile_with_user`);
            if (!res.ok) continue;
            const profileData: any = await apiClient.json(res);
            const househelp = profileData?.data?.Househelp || profileData;
            const user = profileData?.data?.User || profileData?.user;
            const firstName = (user?.first_name || househelp?.first_name || "").trim();
            const lastName = (user?.last_name || househelp?.last_name || "").trim();
            const fullName = `${firstName} ${lastName}`.trim() || "Househelp";
            const avatar = househelp?.avatar_url || (Array.isArray(househelp?.photos) && househelp.photos.length > 0 ? househelp.photos[0] : undefined);
            updates.push({ id: conv.id, participant_name: fullName, participant_avatar: avatar });
          } else if (role === "househelp") {
            // Househelp user: other participant is a household
            const householdUserId = conv.household_id;
            if (!householdUserId) continue;
            const res = await apiClient.auth(`${API_BASE}/api/v1/profile/household/${encodeURIComponent(householdUserId)}`);
            if (!res.ok) continue;
            const profileData: any = await apiClient.json(res);
            // Household profiles don't currently expose a display name; fall back to a generic label
            const name = "Household";
            const avatar = Array.isArray(profileData?.photos) && profileData.photos.length > 0 ? profileData.photos[0] : undefined;
            updates.push({ id: conv.id, participant_name: name, participant_avatar: avatar });
          }
        } catch (err) {
          // Ignore per-conversation errors to avoid breaking the whole list
          // eslint-disable-next-line no-console
          console.error("Failed to hydrate inbox participant", err);
        }
      }

      if (!cancelled && updates.length > 0) {
        setItems((prev) =>
          prev.map((c) => {
            const u = updates.find((u) => u.id === c.id);
            return u ? { ...c, ...u } : c;
          })
        );
      }
    };

    loadProfiles();

    return () => {
      cancelled = true;
    };
  }, [items, currentUserProfileType, API_BASE]);

  const fetchHireContext = useCallback(async (conversation?: Conversation) => {
    if (!conversation) {
      setHireRequestStatus(undefined);
      setHireRequestId(undefined);
      return;
    }
    try {
      const params = new URLSearchParams({ limit: "50" });
      const res = await apiClient.auth(`${API_BASE}/api/v1/hire-requests?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load hire requests');
      const payload = await apiClient.json<{ data?: HireRequestSummary[] }>(res);
      const match = payload?.data?.find(
        (req) =>
          req.household_id === conversation.household_id &&
          req.househelp_id === conversation.househelp_id
      );
      if (match) {
        setHireRequestStatus(match.status);
        setHireRequestId(match.id);
      } else {
        setHireRequestStatus(undefined);
        setHireRequestId(undefined);
      }
    } catch (err) {
      console.error('Failed to fetch hire request context', err);
      setHireRequestStatus(undefined);
      setHireRequestId(undefined);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchHireContext(selectedConversation);
  }, [selectedConversation, fetchHireContext]);

  // Load conversations list
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.auth(`${NOTIFICATIONS_BASE}/notifications/api/v1/inbox/conversations?offset=${offset}&limit=${limit}`);
        if (!res.ok) throw new Error("Failed to load conversations");
        const response = await apiClient.json<{ conversations: any[] }>(res);
        const raw = response.conversations || [];
        // Normalise field names so the rest of the UI can rely on household_id / househelp_id
        const data: Conversation[] = raw.map((c: any) => ({
          ...c,
          household_id: c.household_id || c.household_user_id || c.householdId || "",
          househelp_id: c.househelp_id || c.househelp_user_id || c.househelpId || "",
          last_message_at: c.last_message_at ?? null,
        }));
        if (cancelled) return;
        setItems((prev) => (offset === 0 ? data : [...prev, ...data]));
        setHasMore(data.length === limit);
        
        // Auto-select the first conversation if none is selected and we have conversations
        if (offset === 0 && data.length > 0 && !activeConversationId && !selectedConversationId) {
          setActiveConversationId(data[0].id);
          setSearchParams({ conversation: data[0].id }, { replace: true });
        }
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
  }, [offset, NOTIFICATIONS_BASE]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      setMessagesOffset(0);
      setMessagesHasMore(true);
      return;
    }

    let cancelled = false;
    const conversationId = activeConversationId; // Capture non-null value
    
    async function loadMessages() {
      try {
        setMessagesLoading(true);
        setMessagesError(null);
        console.log('[Inbox] Loading messages for conversation:', conversationId);
        const res = await apiClient.auth(
          `${NOTIFICATIONS_BASE}/notifications/api/v1/inbox/conversations/${encodeURIComponent(conversationId)}/messages?offset=0&limit=${messagesLimit}`
        );
        console.log('[Inbox] Messages API response status:', res.status);
        if (!res.ok) throw new Error("Failed to load messages");
        const response = await apiClient.json<{ messages: Message[] }>(res);
        console.log('[Inbox] Messages API response:', response);
        const data = response.messages || [];
        console.log('[Inbox] Parsed messages count:', data.length, 'Messages:', data);
        if (cancelled) return;
        setMessages(data);
        setMessagesOffset(data.length);
        setMessagesHasMore(data.length === messagesLimit);
        console.log('[Inbox] Messages state updated with', data.length, 'messages');
        // Scroll to bottom after loading messages
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'auto' }), 100);
      } catch (e: any) {
        console.error('[Inbox] Error loading messages:', e);
        if (!cancelled) setMessagesError(e?.message || "Failed to load messages");
      } finally {
        if (!cancelled) setMessagesLoading(false);
      }
    }
    loadMessages();
    return () => {
      cancelled = true;
    };
  }, [activeConversationId, NOTIFICATIONS_BASE, messagesLimit]);

  // Removed polling - WebSocket now handles real-time updates
  // Polling was causing unnecessary HTTP requests every 15 seconds
  // and could interfere with WebSocket-based real-time messaging

  // --- Derived helpers & handlers ---

  const handleBackToList = useCallback(() => {
    // Clear active conversation on mobile and remove query param
    setActiveConversationId(null);
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const handleViewProfile = useCallback(() => {
    if (!selectedConversation) return;
    const role = currentUserProfileType?.toLowerCase();
    if (role === 'household') {
      // Household viewing househelp profile: prefer profile ID when available
      const househelpProfileId = (selectedConversation as any).househelp_profile_id || selectedConversation.househelp_id;
      if (!househelpProfileId) return;
      const url = `/househelp/public-profile?profileId=${encodeURIComponent(househelpProfileId)}&embed=1`;
      setProfileModalLoading(true);
      setProfileModalTimedOut(false);
      if (profileModalTimeoutId.current) window.clearTimeout(profileModalTimeoutId.current);
      profileModalTimeoutId.current = window.setTimeout(() => setProfileModalTimedOut(true), 8000);
      setProfileModalReloadKey((k) => k + 1);
      setProfileModalUrl(url);
      setShowProfileModal(true);
    } else {
      // Househelp viewing household public profile: pass user_id via query
      const url = `/household/public-profile?user_id=${encodeURIComponent(selectedConversation.household_id)}&embed=1`;
      setProfileModalLoading(true);
      setProfileModalTimedOut(false);
      if (profileModalTimeoutId.current) window.clearTimeout(profileModalTimeoutId.current);
      profileModalTimeoutId.current = window.setTimeout(() => setProfileModalTimedOut(true), 8000);
      setProfileModalReloadKey((k) => k + 1);
      setProfileModalUrl(url);
      setShowProfileModal(true);
    }
  }, [selectedConversation, currentUserProfileType]);

  const handleMessagesScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
    setShowScrollToBottom(!nearBottom);
  }, []);

  // Group messages by date for rendering
  const groupedMessages = useMemo(() => {
    console.log('[Inbox] Grouping messages, total count:', messages.length, 'isArray:', Array.isArray(messages));
    if (!Array.isArray(messages) || messages.length === 0) {
      console.log('[Inbox] No messages to group, returning empty array');
      return [] as { key: string; label: string; items: Message[] }[];
    }
    const sorted = [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const groups: { key: string; label: string; items: Message[] }[] = [];
    const map = new Map<string, { label: string; items: Message[] }>();
    for (const m of sorted) {
      const d = new Date(m.created_at);
      if (Number.isNaN(d.getTime())) {
        console.warn('[Inbox] Skipping message with invalid date:', m);
        continue;
      }
      const key = d.toISOString().slice(0, 10);
      if (!map.has(key)) {
        const label = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        const entry = { label, items: [] as Message[] };
        map.set(key, entry);
        groups.push({ key, label, items: entry.items });
      }
      map.get(key)!.items.push(m);
    }
    console.log('[Inbox] Grouped messages into', groups.length, 'groups:', groups);
    return groups;
  }, [messages]);

  const messageById = useMemo(() => {
    const m = new Map<string, Message>();
    for (const msg of messages) {
      m.set(msg.id, msg);
    }
    return m;
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 10);
  }, []);

  const ensureMessageVisibleAndScroll = useCallback((id: string) => {
    const el = messageRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightMsgId(id);
      window.setTimeout(() => setHighlightMsgId(null), 1500);
    }
  }, []);

  const startLongPress = useCallback((id: string) => {
    if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = window.setTimeout(() => {
      setSelectedIds((prev) => new Set(prev).add(id));
    }, 400);
  }, []);

  const cancelLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const nameForUser = useCallback((userId: string) => {
    if (!userId) return 'User';
    if (userId === currentUserId) return 'You';
    return 'User';
  }, [currentUserId]);

  const isEditable = useCallback((m: Message) => {
    if (!currentUserId || m.sender_id !== currentUserId) return false;
    if (m.deleted_at) return false;
    const created = new Date(m.created_at).getTime();
    return Date.now() - created <= 15 * 60 * 1000;
  }, [currentUserId]);

  const isDeletable = useCallback((m: Message) => {
    return isEditable(m);
  }, [isEditable]);

  const undoDelete = useCallback((id: string) => {
    const backup = deletedBackupRef.current[id];
    if (!backup) return;
    setPendingDeleteIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, body: backup.body, deleted_at: null } : m)));
  }, []);

  const clearReply = useCallback(() => setReplyTo(null), []);

  const handleReplyMessage = useCallback((m: Message) => {
    setReplyTo(m);
  }, []);

  const cancelEditMessage = useCallback(() => {
    setEditingMessageId(null);
    setEditingDraft("");
  }, []);

  const startEditMessage = useCallback((m: Message) => {
    if (!isEditable(m)) return;
    setEditingMessageId(m.id);
    setEditingDraft(m.body);
  }, [isEditable]);

  const saveEditMessage = useCallback(async () => {
    if (!editingMessageId) return;
    const msg = messageById.get(editingMessageId);
    if (!msg) return;
    const newBody = editingDraft.trim();
    if (!newBody) return;
    try {
      setEditingSaving(true);
      const res = await apiClient.auth(
        `${NOTIFICATIONS_BASE}/notifications/api/v1/inbox/messages/${encodeURIComponent(msg.id)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: newBody }),
        },
      );
      if (!res.ok) throw new Error('Failed to edit message');
      const updated = await apiClient.json<Message>(res);
      setMessages((prev) => prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)));
      cancelEditMessage();
    } catch (err) {
      console.error(err);
      pushToast('Failed to edit message', 'error');
    } finally {
      setEditingSaving(false);
    }
  }, [editingMessageId, editingDraft, messageById, NOTIFICATIONS_BASE, cancelEditMessage, pushToast]);

  const toggleReaction = useCallback(async (m: Message, emoji: string) => {
    try {
      const res = await apiClient.auth(
        `${NOTIFICATIONS_BASE}/notifications/api/v1/inbox/messages/${encodeURIComponent(m.id)}/reactions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emoji }),
        },
      );
      if (!res.ok) return;
      const updated = await apiClient.json<Message>(res);
      setMessages((prev) => prev.map((msg) => (msg.id === updated.id ? { ...msg, ...updated } : msg)));
    } catch (err) {
      console.error(err);
    }
  }, [NOTIFICATIONS_BASE]);

  const addEmoji = useCallback((emojiData: EmojiClickData) => {
    let emoji = emojiData?.emoji as string | undefined;
    if (!emoji && (emojiData as any)?.native) {
      emoji = (emojiData as any).native;
    }
    if (!emoji && emojiData?.unified) {
      try {
        const codePoints = emojiData.unified.split('-').map((u: string) => parseInt(u, 16));
        emoji = String.fromCodePoint(...codePoints);
      } catch {}
    }
    if (!emoji) return;
    setInput((prev) => prev + emoji);
    setShowEmojiPicker(false);
  }, []);

  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversationId) return;
    const body = input.trim();
    if (!body) return;
    try {
      const tempId = `temp-${Date.now()}`;
      const optimistic: Message = {
        id: tempId,
        conversation_id: activeConversationId,
        sender_id: currentUserId || '',
        body,
        created_at: new Date().toISOString(),
        _status: 'sending',
      };
      setMessages((prev) => [...prev, optimistic]);
      setInput('');
      scrollToBottom();
      const res = await apiClient.auth(
        `${NOTIFICATIONS_BASE}/notifications/api/v1/inbox/conversations/${encodeURIComponent(activeConversationId)}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body }),
        },
      );
      if (!res.ok) throw new Error('Failed to send message');
      const saved = await apiClient.json<Message>(res);
      setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...saved, _status: 'sent' } : m)));
    } catch (err) {
      console.error(err);
      pushToast('Failed to send message', 'error');
    }
  }, [activeConversationId, input, currentUserId, NOTIFICATIONS_BASE, scrollToBottom, pushToast]);

  const handleAcceptHireRequest = useCallback(async () => {
    if (!hireRequestId) return;
    try {
      setHireActionLoading('accept');
      const res = await apiClient.auth(`${API_BASE}/api/v1/hire-requests/${encodeURIComponent(hireRequestId)}/accept`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to accept hire request');
      setHireRequestStatus('accepted');
    } catch (err) {
      console.error(err);
      pushToast('Failed to accept hire request', 'error');
    } finally {
      setHireActionLoading(null);
    }
  }, [hireRequestId, API_BASE, pushToast]);

  const handleDeclineHireRequest = useCallback(async () => {
    if (!hireRequestId) return;
    try {
      setHireActionLoading('decline');
      const res = await apiClient.auth(`${API_BASE}/api/v1/hire-requests/${encodeURIComponent(hireRequestId)}/decline`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to decline hire request');
      setHireRequestStatus('declined');
    } catch (err) {
      console.error(err);
      pushToast('Failed to decline hire request', 'error');
    } finally {
      setHireActionLoading(null);
    }
  }, [hireRequestId, API_BASE, pushToast]);

  // Basic WebSocket wiring for new incoming messages
  useEffect(() => {
    console.log('[Inbox] Setting up WebSocket event listeners');
    
    // Listen for new_message events directly
    const offNewMessage = addEventListener('new_message', (event: WSMessageEvent) => {
      console.log('[Inbox] Received new_message event:', event);
      try {
        const eventData = event as any;
        const msg = eventData.data || eventData.payload || eventData;
        
        if (!msg || !msg.id) {
          console.warn('[Inbox] Invalid message data:', msg);
          return;
        }
        
        console.log('[Inbox] Adding message to state:', msg);
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) {
            console.log('[Inbox] Message already exists, skipping');
            return prev;
          }
          console.log('[Inbox] Adding new message to chat');
          return [...prev, msg];
        });
        
        // Update conversation list to show new last message
        setItems((prev) => {
          return prev.map((conv) => {
            if (conv.id === msg.conversation_id) {
              return {
                ...conv,
                last_message_at: msg.created_at,
              };
            }
            return conv;
          });
        });
      } catch (err) {
        console.error('[Inbox] Failed to handle new_message event', err);
      }
    });
    
    // Listen for other message events
    const offMessageEdited = addEventListener('message_edited', (event: WSMessageEvent) => {
      console.log('[Inbox] Received message_edited event:', event);
      try {
        const eventData = event as any;
        const msg = eventData.data || eventData.payload || eventData;
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, ...msg } : m)));
      } catch (err) {
        console.error('[Inbox] Failed to handle message_edited event', err);
      }
    });
    
    const offMessageDeleted = addEventListener('message_deleted', (event: WSMessageEvent) => {
      console.log('[Inbox] Received message_deleted event:', event);
      try {
        const eventData = event as any;
        const msg = eventData.data || eventData.payload || eventData;
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, ...msg } : m)));
      } catch (err) {
        console.error('[Inbox] Failed to handle message_deleted event', err);
      }
    });
    
    const offReactionAdded = addEventListener('reaction_added', (event: WSMessageEvent) => {
      try {
        const eventData = event as any;
        const msg = eventData.data || eventData.payload || eventData;
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, ...msg } : m)));
      } catch (err) {
        console.error('[Inbox] Failed to handle reaction_added event', err);
      }
    });
    
    const offReactionRemoved = addEventListener('reaction_removed', (event: WSMessageEvent) => {
      try {
        const eventData = event as any;
        const msg = eventData.data || eventData.payload || eventData;
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, ...msg } : m)));
      } catch (err) {
        console.error('[Inbox] Failed to handle reaction_removed event', err);
      }
    });
    
    return () => {
      console.log('[Inbox] Cleaning up WebSocket event listeners');
      offNewMessage?.();
      offMessageEdited?.();
      offMessageDeleted?.();
      offReactionAdded?.();
      offReactionRemoved?.();
    };
  }, [addEventListener]);

  // Conversations list JSX (left sidebar)
  const conversationsList = (
    <div className="flex flex-col h-full bg-white dark:bg-[#13131a]">
      <div className="px-4 py-3 border-b border-purple-200 dark:border-purple-500/30 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Conversations</h2>
        {loading && (
          <span className="text-xs text-gray-500 dark:text-gray-400">Loading…</span>
        )}
      </div>

      {error && (
        <div className="m-3 rounded-md border border-red-300 bg-red-50 dark:bg-red-900/20 p-2 text-xs text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {deduplicatedItems.length === 0 && !loading && !error && (
          <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No conversations yet.
          </div>
        )}

        <ul className="divide-y divide-purple-100 dark:divide-purple-500/20">
          {deduplicatedItems.map((c) => {
            const isActive = c.id === activeConversationId;
            const lastAt = c.last_message_at ? new Date(c.last_message_at) : null;
            const subtitle = lastAt && !Number.isNaN(lastAt.getTime()) ? formatTimeAgo(lastAt.toISOString()) : '';
            const unread = c.unread_count || 0;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveConversationId(c.id);
                    setSearchParams({ conversation: c.id }, { replace: true });
                  }}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-purple-50 dark:hover:bg-slate-800/70 transition ${
                    isActive ? 'bg-purple-50/70 dark:bg-slate-800/80' : ''
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {(c.participant_name || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                        {c.participant_name || (currentUserProfileType?.toLowerCase() === 'househelp' ? 'Household' : 'Househelp')}
                      </p>
                      {subtitle && (
                        <span className="ml-2 text-[11px] text-gray-500 dark:text-gray-400 flex-shrink-0">{subtitle}</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">
                      {unread > 0 ? `${unread} unread message${unread === 1 ? '' : 's'}` : 'No new messages'}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <div ref={sentinelRef} />

        {hasMore && !loading && (
          <div className="py-3 flex justify-center">
            <button
              type="button"
              onClick={() => setOffset((prev) => prev + limit)}
              className="px-3 py-1.5 text-xs rounded-full border border-purple-300 dark:border-purple-500/40 text-purple-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-slate-800"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Messages view JSX
  const messagesView = !selectedConversation ? (
    <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-[#0a0a0f]">
      <div className="text-center">
        <p className="text-gray-500 dark:text-gray-400 text-lg">Select a conversation to start messaging</p>
      </div>
    </div>
  ) : (
      <div className="h-full bg-white dark:bg-[#13131a] grid grid-rows-[auto,1fr,auto] relative overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-purple-200 dark:border-purple-500/30 flex items-center gap-3">
          <button
            onClick={handleBackToList}
            className="lg:hidden p-2 hover:bg-purple-100 dark:hover:bg-slate-800 rounded-full transition"
          >
            <ArrowLeftIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          
          {/* Clickable profile header */}
          <button
            onClick={handleViewProfile}
            className="flex items-center gap-3 flex-1 hover:bg-purple-50 dark:hover:bg-slate-800/60 rounded-lg p-2 -m-2 transition-colors"
          >
            <div className="w-10 h-10 rounded-full relative overflow-hidden border-2 border-purple-300 dark:border-purple-500 flex-shrink-0">
              {selectedConversation.participant_avatar ? (
                <>
                  {/* Skeleton loader */}
                  {imageLoadingStates[`header-${selectedConversation.id}`] !== false && (
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-shimmer bg-[length:200%_100%]" />
                  )}
                  <img
                    src={selectedConversation.participant_avatar}
                    alt={selectedConversation.participant_name || 'User'}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      imageLoadingStates[`header-${selectedConversation.id}`] === false ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => {
                      setImageLoadingStates(prev => ({ ...prev, [`header-${selectedConversation.id}`]: false }));
                    }}
                    onError={(e) => {
                      setImageLoadingStates(prev => ({ ...prev, [`header-${selectedConversation.id}`]: false }));
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                  {(selectedConversation.participant_name || 'U')[0].toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="text-left">
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {selectedConversation.participant_name || (currentUserProfileType?.toLowerCase() === 'househelp' ? 'Household' : 'Househelp')}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">View profile</p>
            </div>
          </button>
        </div>

        {/* Messages - Scrollable */}
        <div ref={messagesContainerRef} onScroll={handleMessagesScroll} className="min-h-0 overflow-y-auto p-4 space-y-2">
          <div ref={messagesSentinelRef} />
          
          {/* Hire Context Banner */}
          {selectedConversation && (
            <HireContextBanner
              hireRequestStatus={hireRequestStatus}
              hireRequestId={hireRequestId}
              onViewDetails={() => {
                if (hireRequestId) {
                  if (currentUserProfileType?.toLowerCase() === 'household') {
                    navigate(`/household/hire-request/${hireRequestId}`);
                  } else {
                    navigate(`/househelp/hire-requests`);
                  }
                }
              }}
              onSendHireRequest={() => setShowHireWizard(true)}
              onAccept={currentUserProfileType?.toLowerCase() === 'househelp' && hireRequestStatus === 'pending' ? handleAcceptHireRequest : undefined}
              onDecline={currentUserProfileType?.toLowerCase() === 'househelp' && hireRequestStatus === 'pending' ? handleDeclineHireRequest : undefined}
              actionLoading={hireActionLoading}
              userRole={currentUserProfileType?.toLowerCase() as 'household' | 'househelp'}
            />
          )}
          
          {messagesLoading && messages.length === 0 && (
            <div className="flex justify-center py-8">
              <svg className="animate-spin h-8 w-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}

          {messages.length === 0 && !messagesLoading && !messagesError && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">No messages yet. Start the conversation!</div>
          )}

          {messagesError && (
            <div className="mb-3 rounded-md border border-red-300 bg-red-50 dark:bg-red-900/20 p-3 text-red-700 dark:text-red-300">{messagesError}</div>
          )}

          {groupedMessages.map(group => (
            <div key={group.key} className="space-y-3">
              <div className="flex justify-center my-3">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700 dark:bg-slate-800 dark:text-purple-200 border border-purple-200/60 dark:border-purple-500/30">
                  {group.label}
                </span>
              </div>
              {group.items.map((m) => {
                const mine = currentUserId && m.sender_id === currentUserId;
                const status = m._status || (m.read_at ? 'read' : 'delivered');
                const replyMsg = m.reply_to_id ? messageById.get(m.reply_to_id) : undefined;
                const replyFromName = replyMsg ? (replyMsg.sender_id === currentUserId ? 'You' : (selectedConversation?.participant_name || 'User')) : '';
                return (
                  <div
                    key={m.id}
                    className={`group relative flex ${mine ? 'justify-end' : 'justify-start'} ${
                      highlightMsgId === m.id 
                        ? 'animate-[highlight-blink_1.5s_ease-in-out] rounded-xl ring-2 ring-purple-400/60' 
                        : selectedIds.has(m.id) 
                        ? 'ring-2 ring-purple-400 rounded-xl' 
                        : ''
                    }`}
                    onTouchStart={() => startLongPress(m.id)}
                    onTouchEnd={cancelLongPress}
                    ref={(el) => { messageRefs.current[m.id] = el; }}
                  >
                    {selectedIds.size > 0 && (
                      <button
                        type="button"
                        className={`absolute top-1 ${mine ? '-right-8' : '-left-8'} z-10 flex items-center justify-center w-6 h-6 rounded-full border shadow ${selectedIds.has(m.id) ? 'bg-purple-600 text-white border-purple-600' : 'bg-white/80 dark:bg-[#0f0f16]/80 border-purple-200 dark:border-purple-500/30'}`}
                        onClick={(e) => { e.stopPropagation(); toggleSelect(m.id); }}
                        aria-pressed={selectedIds.has(m.id)}
                        aria-label={selectedIds.has(m.id) ? 'Deselect message' : 'Select message'}
                      >
                        {selectedIds.has(m.id) ? (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        ) : (
                          <span className="block w-3 h-3 rounded border border-gray-400 dark:border-gray-500" />
                        )}
                      </button>
                    )}
                    {/* Message bubble */}
                    <div className={`relative max-w-[75%] rounded-2xl px-4 py-2 shadow ${
                      mine 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100'
                    } ${status === 'sending' ? 'opacity-70' : ''} ${m.deleted_at ? 'opacity-60 italic' : ''}`}>
                      {/* Bubble controls (desktop): 3-dots and quick reactions anchored to bubble */}
                      <button
                        type="button"
                        className={`absolute -top-2 ${mine ? '-right-2' : '-left-2'} hidden lg:inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/80 dark:bg-[#0f0f16]/80 border border-purple-200 dark:border-purple-500/30 shadow opacity-0 group-hover:opacity-100 transition`}
                        onClick={() => setOpenMsgMenuId(openMsgMenuId === m.id ? null : m.id)}
                        aria-label="Message options"
                      >
                        <EllipsisVerticalIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                      </button>

                      {openReactPickerMsgId !== m.id && (
                        <div className={`absolute -top-8 ${mine ? 'right-0' : 'left-0'} z-40 hidden lg:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition`}>
                          {['👍','❤️','😂','😮','😢'].map(em => (
                            <button key={em} className="text-base px-1 py-0.5 rounded-full bg-white/80 dark:bg-[#0f0f16]/80 border border-purple-200 dark:border-purple-500/30" onClick={() => toggleReaction(m, em)}>{em}</button>
                          ))}
                          <button className="text-xs px-2 py-0.5 rounded-full bg-white/80 dark:bg-[#0f0f16]/80 border border-purple-200 dark:border-purple-500/30" onClick={() => setOpenReactPickerMsgId(m.id)}>+</button>
                        </div>
                      )}
                      {openReactPickerMsgId === m.id && (
                        <div ref={reactionPickerRef} className={`absolute ${mine ? 'right-0' : 'left-0'} bottom-full mb-2 z-50`}>
                          <EmojiPicker
                            onEmojiClick={(emojiData) => {
                              // Extract emoji with fallback to unified code points
                              let emoji = emojiData?.emoji as string | undefined;
                              if (!emoji && emojiData?.unified) {
                                try {
                                  const codePoints = emojiData.unified.split('-').map((u: string) => parseInt(u, 16));
                                  emoji = String.fromCodePoint(...codePoints);
                                } catch (err) {
                                  console.error('Failed to parse emoji:', err);
                                }
                              }
                              // Additional fallback: try imageUrl or native
                              if (!emoji && (emojiData as any)?.native) {
                                emoji = (emojiData as any).native;
                              }
                              if (!emoji) {
                                console.warn('Could not extract emoji from:', emojiData);
                                return;
                              }
                              toggleReaction(m, emoji);
                              setOpenReactPickerMsgId(null);
                            }}
                            theme={Theme.AUTO}
                            width={320}
                            height={380}
                            lazyLoadEmojis
                          />
                        </div>
                      )}
                      {/* Reply snippet inside bubble */}
                      {!editingMessageId && m.reply_to_id && (
                        <button
                          type="button"
                          onClick={() => ensureMessageVisibleAndScroll(m.reply_to_id!)}
                          className={`mb-2 w-full text-left text-xs rounded-lg border ${mine ? 'border-white/30 bg-white/10 text-white/90' : 'border-purple-200 dark:border-purple-500/30 bg-white/60 dark:bg-slate-900/40 text-gray-700 dark:text-gray-200'} px-3 py-2 hover:opacity-90`}
                          aria-label="Go to replied message"
                        >
                          <div className="flex gap-2 items-start">
                            <span className="font-semibold">{replyFromName}</span>
                            <span className="line-clamp-2">{replyMsg?.body || 'Original message'}</span>
                          </div>
                        </button>
                      )}

                      {editingMessageId === m.id ? (
                        <div>
                          <textarea
                            className={`w-full resize-none rounded-xl px-3 py-2 text-sm ${mine ? 'text-white placeholder-white/70 bg-white/10' : 'text-gray-900 dark:text-gray-100 bg-white/80 dark:bg-slate-900'}`}
                            rows={1}
                            value={editingDraft}
                            placeholder="Edit message"
                            onChange={(e) => {
                              const ta = e.currentTarget;
                              ta.style.height = 'auto';
                              ta.style.height = Math.min(ta.scrollHeight, 150) + 'px';
                              setEditingDraft(e.target.value);
                            }}
                            onKeyDown={(e) => {
                              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                                e.preventDefault();
                                saveEditMessage();
                              } else if (e.key === 'Escape') {
                                e.preventDefault();
                                cancelEditMessage();
                              }
                            }}
                            autoFocus
                          />
                          <div className="mt-2 flex items-center gap-2 justify-end text-xs">
                            <button
                              type="button"
                              className={`px-3 py-1 rounded-lg border ${mine ? 'border-white/40 text-white/90 hover:bg-white/10' : 'border-purple-300 text-purple-700 hover:bg-purple-50 dark:text-purple-200 dark:border-purple-500/40 dark:hover:bg-slate-800'}`}
                              onClick={cancelEditMessage}
                              disabled={editingSaving}
                            >Cancel</button>
                            <button
                              type="button"
                              className={`px-3 py-1 rounded-lg ${mine ? 'bg-white text-purple-700' : 'bg-purple-600 text-white'} hover:opacity-90 disabled:opacity-60`}
                              onClick={saveEditMessage}
                              disabled={editingSaving || editingDraft.trim().length === 0}
                            >{editingSaving ? 'Saving…' : 'Save'}</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="whitespace-pre-wrap break-words">
                            {m.deleted_at ? (
                              <span className="text-xs">
                                Message deleted
                                {pendingDeleteIds.has(m.id) && (
                                  <>
                                    {' · '}
                                    <button type="button" className="underline font-semibold" onClick={() => undoDelete(m.id)}>Undo</button>
                                  </>
                                )}
                              </span>
                            ) : (
                              m.body
                            )}
                          </div>
                          <div className={`mt-1 text-[10px] flex items-center justify-end gap-1 ${mine ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                            {m.edited_at && !m.deleted_at && <span className="mr-1 opacity-70">edited</span>}
                            <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {mine && !m.deleted_at && (
                              <span className="inline-flex items-center ml-1">
                                {status === 'sending' && (
                                  /* Single grey tick - sending */
                                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                                {status === 'delivered' && (
                                  /* Double grey ticks - saved in DB */
                                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M2 13l4 4L16 7" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M8 13l4 4L22 7" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                                {status === 'read' && (
                                  /* Double purple ticks - read */
                                  <svg className="w-4 h-4 text-purple-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M2 13l4 4L16 7" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M8 13l4 4L22 7" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </span>
                            )}
                          </div>

                          {/* Reactions chips */}
                          {m.reactions && m.reactions.length > 0 && (
                            <>
                              {(() => {
                                const reactionMap = (m.reactions || []).reduce((acc: Record<string, string[]>, r) => {
                                  const list = acc[r.emoji] || (acc[r.emoji] = []);
                                  list.push(nameForUser(r.user_id));
                                  return acc;
                                }, {} as Record<string, string[]>);
                                return (
                                  <>
                                    <div className={`mt-1 flex flex-wrap gap-1 ${mine ? 'justify-end' : 'justify-start'}`}>
                                      {Object.entries(reactionMap).map(([emoji, names]) => {
                                        const mineReact = (m.reactions || []).some(r => r.emoji === emoji && r.user_id === (currentUserId || ''));
                                        return (
                                          <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => setOpenReactionNames(openReactionNames && openReactionNames.msgId === m.id && openReactionNames.emoji === emoji ? null : { msgId: m.id, emoji })}
                                            title={names.join(', ')}
                                            className={`px-2 py-0.5 text-xs rounded-full border ${mine ? 'border-white/30 text-white/90' : 'border-purple-200 dark:border-purple-500/30 text-gray-700 dark:text-gray-200'} ${mineReact ? 'bg-emerald-500/20 ring-2 ring-emerald-400 font-semibold' : 'bg-white/20'}`}
                                          >
                                            {emoji} {names.length}
                                          </button>
                                        );
                                      })}
                                    </div>
                                    {openReactionNames && openReactionNames.msgId === m.id && (
                                      <div className={`mt-1 flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-xs text-xs rounded-md border ${mine ? 'border-white/30 bg-white/10 text-white/90' : 'border-purple-200 dark:border-purple-500/30 bg-white/90 dark:bg-slate-900/80 text-gray-800 dark:text-gray-200'} shadow px-2 py-1`}
                                        >
                                          <div className="font-semibold mb-1">{openReactionNames.emoji} reactions</div>
                                          <div className="flex flex-wrap gap-1">
                                            {(reactionMap[openReactionNames.emoji] || []).map((n, idx) => (
                                              <span key={idx} className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/10">{n}</span>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </>
                          )}
                        </>
                      )}
                      {openMsgMenuId === m.id && (() => {
                        const selected = selectedIds.has(m.id);
                        const options = [
                          { label: 'Copy text', disabled: !!m.deleted_at || !m.body, action: async () => { try { await navigator.clipboard.writeText(m.body || ''); pushToast('Copied message', 'success'); } catch { pushToast('Copy failed', 'error'); } } },
                          { label: selected ? 'Deselect' : 'Select', disabled: false, action: () => toggleSelect(m.id) },
                          { label: 'Delete', disabled: !isDeletable(m), action: () => setDeleteConfirmMsg(m), danger: true },
                          { label: 'Edit (15 min)', disabled: !isEditable(m), action: () => startEditMessage(m) },
                          { label: 'Reply', disabled: false, action: () => handleReplyMessage(m) },
                          { label: 'React', disabled: false, action: () => setOpenReactPickerMsgId(m.id) },
                          { label: 'Message info', disabled: false, action: () => { setInfoForMsgId(m.id); setOpenMsgMenuId(null); } },
                        ];
                        return (
                          <div
                            ref={msgMenuRef}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'ArrowDown') { e.preventDefault(); setMsgMenuFocusIndex((i) => Math.min(i + 1, options.length - 1)); }
                              else if (e.key === 'ArrowUp') { e.preventDefault(); setMsgMenuFocusIndex((i) => Math.max(i - 1, 0)); }
                              else if (e.key === 'Enter') { e.preventDefault(); const opt = options[msgMenuFocusIndex]; if (!opt.disabled) { opt.action(); setOpenMsgMenuId(null); } }
                              else if (e.key === 'Escape') { e.preventDefault(); setOpenMsgMenuId(null); }
                            }}
                            className={`absolute top-6 ${mine ? 'right-0' : 'left-0'} z-50 w-48 rounded-lg border border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#0f0f16] shadow-lg`}
                            onMouseLeave={() => setOpenMsgMenuId(null)}
                          >
                            {options.map((opt, idx) => (
                              <button
                                key={opt.label}
                                className={`w-full text-left px-3 py-2 text-sm ${opt.danger ? 'text-red-600' : 'text-gray-700 dark:text-gray-200'} ${opt.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-50 dark:hover:bg-slate-800'} ${msgMenuFocusIndex === idx ? 'bg-purple-50 dark:bg-slate-800' : ''}`}
                                disabled={opt.disabled}
                                onClick={() => { if (!opt.disabled) { opt.action(); setOpenMsgMenuId(null); } }}
                                onMouseEnter={() => setMsgMenuFocusIndex(idx)}
                              >{opt.label}</button>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Emoji Picker - Position based on message count */}
        {showEmojiPicker && (
          <div 
            ref={emojiPickerRef} 
            className={`absolute left-4 z-50 shadow-xl rounded-lg overflow-hidden ${
              messages.length < 10 ? 'top-20' : 'bottom-24'
            }`}
          >
            <EmojiPicker
              onEmojiClick={addEmoji}
              theme={Theme.AUTO}
              searchPlaceHolder="Search emojis..."
              width={320}
              height={400}
              searchDisabled={false}
              skinTonesDisabled={false}
              lazyLoadEmojis={true}
            />
          </div>
        )}

        {showScrollToBottom && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="fixed right-6 bottom-28 z-[60] p-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none"
            aria-label="Scroll to bottom"
          >
            <ChevronDownIcon className="w-6 h-6" />
          </button>
        )}

        {/* Input - At bottom (grid row) */}
        <div className="p-4 border-t border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a]">
          {selectedIds.size > 0 && (
            <div className="mb-2 flex items-center justify-between rounded-lg border border-purple-200 dark:border-purple-500/30 bg-purple-50/60 dark:bg-slate-800/60 px-3 py-2">
              <div className="text-xs font-semibold">{selectedIds.size} selected</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-2 py-1 rounded-lg border border-purple-300 text-purple-700 hover:bg-purple-50 dark:text-purple-200 dark:border-purple-500/40 dark:hover:bg-slate-800 text-xs"
                  onClick={async () => {
                    const ids = Array.from(selectedIds);
                    const sel = messages.filter(m => ids.includes(m.id) && !m.deleted_at && m.body).sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                    const text = sel.map(m => m.body).join('\n');
                    try { await navigator.clipboard.writeText(text); pushToast('Copied selection', 'success'); } catch { pushToast('Copy failed', 'error'); }
                  }}
                >Copy</button>
                <button
                  type="button"
                  className="px-2 py-1 rounded-lg border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 text-xs"
                  onClick={() => setSelectedIds(new Set())}
                >Cancel</button>
              </div>
            </div>
          )}
          {replyTo && (
            <div className="mb-2 flex items-start justify-between rounded-lg border border-purple-200 dark:border-purple-500/30 bg-purple-50/60 dark:bg-slate-800/60 px-3 py-2">
              <div className="text-xs">
                <div className="font-semibold text-purple-700 dark:text-purple-300">
                  Replying to {replyTo.sender_id === currentUserId ? 'You' : (selectedConversation?.participant_name || 'User')}
                </div>
                <div className="line-clamp-2 opacity-80 text-gray-700 dark:text-gray-200 max-w-[85vw] lg:max-w-[40rem]">{replyTo.body || 'Message'}</div>
                <button
                  type="button"
                  className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 dark:text-purple-300 hover:underline"
                  onClick={() => replyTo?.id && ensureMessageVisibleAndScroll(replyTo.id)}
                >
                  Go to original
                </button>
              </div>
              <button type="button" className="ml-3 p-1 rounded hover:bg-purple-100 dark:hover:bg-slate-700" aria-label="Cancel reply" onClick={clearReply}>
                <XMarkIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          )}
          
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowEmojiPicker(!showEmojiPicker);
              }}
              className="p-2 hover:bg-purple-100 dark:hover:bg-slate-800 rounded-full transition flex-shrink-0"
            >
              <FaceSmileIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
            
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Auto-resize textarea
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim()) {
                    handleSend(e as any);
                    // Reset textarea height after sending
                    if (textareaRef.current) {
                      textareaRef.current.style.height = 'auto';
                    }
                  }
                }
              }}
              placeholder="Type a message..."
              className="flex-1 rounded-2xl border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white resize-none overflow-hidden min-h-[40px] max-h-[150px]"
              autoComplete="off"
              rows={1}
            />
            
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex-shrink-0"
            >
              <PaperAirplaneIcon className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navigation />
      <PurpleThemeWrapper variant="gradient" bubbles={true} bubbleDensity="low" className="flex-1 flex flex-col overflow-hidden min-h-0">
        <main className="flex-1 flex flex-col relative pt-6 pb-4 overflow-hidden min-h-0">
          {/* Desktop: Split view */}
          <div className="hidden lg:flex flex-1 max-w-7xl mx-auto w-full mt-2 overflow-hidden min-h-0">
            <div className="w-1/3 border border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] shadow-[0_0_15px_rgba(168,85,247,0.15)] dark:shadow-[0_0_20px_rgba(168,85,247,0.3)] rounded-l-2xl overflow-hidden flex flex-col">
              {conversationsList}
            </div>
            <div className="flex-1 border border-l-0 border-purple-200 dark:border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] dark:shadow-[0_0_20px_rgba(168,85,247,0.3)] rounded-r-2xl overflow-hidden flex flex-col min-h-0">
              {messagesView}
            </div>
          </div>

          {/* Mobile: Single view */}
          <div className="lg:hidden flex-1 overflow-hidden">
            {activeConversationId ? (
              <div className="h-full border-l border-r border-b border-purple-200 dark:border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] dark:shadow-[0_0_20px_rgba(168,85,247,0.3)] rounded-b-2xl overflow-hidden flex flex-col">
                {messagesView}
              </div>
            ) : (
              <div className="h-full bg-white dark:bg-[#13131a] border-l border-r border-b border-purple-200 dark:border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] dark:shadow-[0_0_20px_rgba(168,85,247,0.3)] rounded-b-2xl overflow-hidden flex flex-col">
                {conversationsList}
              </div>
            )}
          </div>
        </main>
      </PurpleThemeWrapper>
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[80] space-y-2 pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              role={t.type === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto flex items-start gap-2 rounded-xl border p-3 shadow-lg ${t.type === 'error' ? 'border-red-300/60 bg-red-50 dark:bg-red-900/20' : 'border-emerald-300/60 bg-emerald-50 dark:bg-emerald-900/20'}`}
            >
              <div className="mt-0.5">
                {t.type === 'error' ? (
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                ) : (
                  <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <div className="text-sm text-gray-800 dark:text-gray-100">{t.message}</div>
              <button
                type="button"
                className="ml-2 p-1 rounded hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Dismiss notification"
                onClick={() => removeToast(t.id)}
              >
                <XMarkIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && profileModalUrl && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60"
          onClick={() => {
            setShowProfileModal(false);
            setProfileModalUrl(null);
            setProfileModalLoading(false);
            setProfileModalTimedOut(false);
            if (profileModalTimeoutId.current) {
              window.clearTimeout(profileModalTimeoutId.current);
              profileModalTimeoutId.current = null;
            }
          }}
        >
          <div
            className="relative w-full max-w-6xl h-[85vh] rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.35)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-3 right-3 z-[71] p-2 rounded-full bg-white/90 dark:bg-[#13131a]/90 border border-purple-200 dark:border-purple-500/30 shadow hover:scale-105 transition"
              onClick={() => {
                setShowProfileModal(false);
                setProfileModalUrl(null);
                setProfileModalLoading(false);
                setProfileModalTimedOut(false);
                if (profileModalTimeoutId.current) {
                  window.clearTimeout(profileModalTimeoutId.current);
                  profileModalTimeoutId.current = null;
                }
              }}
              aria-label="Close profile"
            >
              <XMarkIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            {profileModalLoading && (
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-purple-600/20 animate-pulse border-b border-purple-500/30 z-[71]" />
            )}
            {profileModalLoading && (
              <div className="absolute inset-0 z-[72] grid place-items-center bg-black/10">
                <svg
                  className="animate-spin h-10 w-10 text-purple-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
              </div>
            )}
            <iframe
              key={profileModalReloadKey}
              src={profileModalUrl}
              className="w-full h-full border-0 bg-white"
              onLoad={() => {
                setProfileModalLoading(false);
                if (profileModalTimeoutId.current) {
                  window.clearTimeout(profileModalTimeoutId.current);
                  profileModalTimeoutId.current = null;
                }
              }}
              title="Profile"
            />
          </div>
        </div>
      )}

      {showHireWizard && selectedConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <ConversationHireWizard
            househelpId={
              currentUserProfileType?.toLowerCase() === 'household'
                ? selectedConversation!.househelp_id
                : selectedConversation!.household_id
            }
            househelpName={selectedConversation!.participant_name || 'User'}
            onClose={() => setShowHireWizard(false)}
            onSuccess={(newHireRequestId) => {
              setShowHireWizard(false);
              setHireRequestStatus('pending');
              setHireRequestId(newHireRequestId);
              const body = `I've sent you a formal hire request. Please review and let me know if you have any questions!`;
              apiClient
                .auth(
                  `${NOTIFICATIONS_BASE}/notifications/api/v1/inbox/conversations/${activeConversationId}/messages`,
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ body }),
                  },
                )
                .then((res) => {
                  if (res.ok) {
                    return apiClient.json<Message>(res);
                  }
                })
                .then((msg) => {
                  if (msg) {
                    setMessages((prev) => [...prev, msg]);
                    setTimeout(
                      () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }),
                      50,
                    );
                  }
                })
                .catch(console.error);
            }}
          />
        </div>
      )}
    </div>
  );
}

export { ErrorBoundary } from "~/components/ErrorBoundary";
