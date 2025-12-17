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
import { useWebSocket } from '~/hooks/useWebSocket';
import { WSEventNewMessage, WSEventMessageRead, WSEventMessageEdited, WSEventMessageDeleted, WSEventReactionAdded, WSEventReactionRemoved } from '~/types/websocket';
import type { MessageEvent as WSMessageEvent } from '~/types/websocket';

type Conversation = {
  id: string;
  household_id: string;
  househelp_id: string;
  last_message_at: string;
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
  
  // WebSocket connection
  const token = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }, []);
  
  const wsUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const base = NOTIFICATIONS_BASE.replace(/^http/, 'ws');
    return `${base}/notifications/api/v1/inbox/ws`;
  }, [NOTIFICATIONS_BASE]);
  
  const { connectionState, addEventListener } = useWebSocket({
    url: wsUrl,
    token,
    reconnectInterval: 3000,
    maxReconnectAttempts: 10,
  });
  
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
  
  useEffect(() => {
    setActiveConversationId(selectedConversationId);
  }, [selectedConversationId]);

  const selectedConversation = items.find(c => c.id === activeConversationId);
  
  // Track image loading state for avatars
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});

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
        const response = await apiClient.json<{ conversations: Conversation[] }>(res);
        const data = response.conversations || [];
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

  // Polling refresh conversations
  useEffect(() => {
    const id = setInterval(async () => {
      if (loading) return;
      try {
        const count = items.length > 0 ? items.length : limit;
        const res = await apiClient.auth(`${NOTIFICATIONS_BASE}/notifications/api/v1/inbox/conversations?offset=0&limit=${count}`);
        if (!res.ok) return;
        const response = await apiClient.json<{ conversations: Conversation[] }>(res);
        const data = response.conversations || [];
        setItems(data);
        setHasMore(data.length >= count);
      } catch {}
    }, 15000);
    return () => clearInterval(id);
  }, [NOTIFICATIONS_BASE, items.length, loading]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      setMessagesOffset(0);
      return;
    }
    
    let cancelled = false;
    async function loadMessages() {
      try {
        setMessagesLoading(true);
        setMessagesError(null);
        const res = await apiClient.auth(
          `${NOTIFICATIONS_BASE}/notifications/api/v1/inbox/conversations/${activeConversationId}/messages?offset=${messagesOffset}&limit=${messagesLimit}`
        );
        if (!res.ok) throw new Error("Failed to load messages");
        const data = await apiClient.json<Message[]>(res);
        if (cancelled) return;
        // Mark all loaded messages as delivered (they exist in DB)
        const messagesWithStatus = data.map(m => ({ ...m, _status: 'delivered' as MessageStatus }));
        setMessages((prev) => (messagesOffset === 0 ? messagesWithStatus : [...prev, ...messagesWithStatus]));
        setMessagesHasMore(data.length === messagesLimit);
      } catch (e: any) {
        if (!cancelled) setMessagesError(e?.message || "Failed to load messages");
      } finally {
        if (!cancelled) setMessagesLoading(false);
      }
    }
    loadMessages();
    return () => {
      cancelled = true;
    };
  }, [NOTIFICATIONS_BASE, activeConversationId, messagesOffset]);

  // Mark conversation as read
  useEffect(() => {
    if (!activeConversationId) return;
    async function markRead() {
      try {
        await apiClient.auth(`${NOTIFICATIONS_BASE}/notifications/api/v1/inbox/conversations/${activeConversationId}/read`, {
          method: "POST",
        });
      } catch {}
    }
    markRead();
  }, [NOTIFICATIONS_BASE, activeConversationId, messages.length]);

  const isNearBottom = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return true;
    const threshold = 80; // px
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distance <= threshold;
  }, []);

  const handleMessagesScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollToBottom(distance > 80);
  }, []);

  const scrollToBottom = useCallback(() => {
    const el = messagesContainerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
    setShowScrollToBottom(false);
  }, []);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (messagesOffset === 0 && messages.length > 0) {
      const el = messagesContainerRef.current;
      if (!el) return;
      const atTopInitial = el.scrollTop === 0 && el.scrollHeight > el.clientHeight;
      if (isNearBottom() || atTopInitial) {
        // Scroll to bottom of the container
        setTimeout(() => {
          if (el) {
            el.scrollTop = el.scrollHeight;
          }
        }, 100);
      }
    }
  }, [messages, messagesOffset, isNearBottom]);

  // WebSocket event handlers
  useEffect(() => {
    if (!activeConversationId) return;
    
    // Handle new messages
    const unsubscribeNew = addEventListener(WSEventNewMessage, (event: WSMessageEvent) => {
      if (event.conversation_id === activeConversationId && event.message) {
        setMessages(prev => {
          // Check if message already exists (avoid duplicates)
          if (prev.some(m => m.id === event.message!.id)) {
            return prev;
          }
          return [...prev, event.message!];
        });
        
        // Auto-scroll if near bottom
        if (isNearBottom()) {
          setTimeout(() => {
            const el = messagesContainerRef.current;
            if (el) el.scrollTop = el.scrollHeight;
          }, 50);
        }
      }
    });
    
    // Handle message edits
    const unsubscribeEdit = addEventListener(WSEventMessageEdited, (event: WSMessageEvent) => {
      if (event.conversation_id === activeConversationId && event.message) {
        setMessages(prev => prev.map(m => m.id === event.message!.id ? event.message! : m));
      }
    });
    
    // Handle message deletes
    const unsubscribeDelete = addEventListener(WSEventMessageDeleted, (event: WSMessageEvent) => {
      if (event.conversation_id === activeConversationId && event.message) {
        setMessages(prev => prev.map(m => m.id === event.message!.id ? event.message! : m));
      }
    });
    
    // Handle reactions
    const unsubscribeReaction = addEventListener(WSEventReactionAdded, (event: WSMessageEvent) => {
      if (event.conversation_id === activeConversationId && event.message) {
        setMessages(prev => prev.map(m => m.id === event.message!.id ? event.message! : m));
      }
    });
    
    const unsubscribeReactionRemoved = addEventListener(WSEventReactionRemoved, (event: WSMessageEvent) => {
      if (event.conversation_id === activeConversationId && event.message) {
        setMessages(prev => prev.map(m => m.id === event.message!.id ? event.message! : m));
      }
    });
    
    return () => {
      unsubscribeNew();
      unsubscribeEdit();
      unsubscribeDelete();
      unsubscribeReaction();
      unsubscribeReactionRemoved();
    };
  }, [activeConversationId, addEventListener, isNearBottom]);
  
  // Polling: refresh messages (fallback when WebSocket disconnected, or slower interval when connected)
  // Use longer interval when WebSocket is connected (30s), shorter when disconnected (12s)
  const pollInterval = connectionState === 'connected' ? 30000 : 12000;
  
  useEffect(() => {
    if (!activeConversationId) return;
    
    const id = setInterval(async () => {
      try {
        const count = messages.length > 0 ? messages.length + 10 : messagesLimit;
        const res = await apiClient.auth(
          `${NOTIFICATIONS_BASE}/notifications/api/v1/inbox/conversations/${activeConversationId}/messages?offset=0&limit=${count}`
        );
        if (!res.ok) return;
        const data = await apiClient.json<Message[]>(res);
        if (data.length !== messages.length) {
          setMessages(data);
          if (isNearBottom()) {
            setTimeout(() => {
              const el = messagesContainerRef.current;
              if (el) el.scrollTop = el.scrollHeight;
            }, 50);
          }
        }
        // Mark as read
        try { await apiClient.auth(`${NOTIFICATIONS_BASE}/notifications/api/v1/inbox/conversations/${activeConversationId}/read`, { method: "POST" }); } catch {}
      } catch {}
    }, pollInterval);
    return () => clearInterval(id);
  }, [NOTIFICATIONS_BASE, activeConversationId, messages.length, isNearBottom, connectionState, pollInterval]);

  useEffect(() => {
    handleMessagesScroll();
  }, [messages, handleMessagesScroll]);

  // Observe bottomRef visibility inside messages container
  useEffect(() => {
    const root = messagesContainerRef.current;
    const target = bottomRef.current;
    if (!root || !target) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        // If bottom is visible, hide the button; otherwise, show it
        setShowScrollToBottom(!entry.isIntersecting);
      },
      { root, threshold: 1.0 }
    );
    io.observe(target);
    return () => io.disconnect();
  }, [activeConversationId]);

  // When emoji picker opens, focus its search input
  useEffect(() => {
    if (!showEmojiPicker) return;
    // Defer to next tick so the DOM is mounted
    const id = window.setTimeout(() => {
      const root = emojiPickerRef.current;
      if (!root) return;
      const search = (root.querySelector('input[type="search"]') || root.querySelector('input')) as HTMLInputElement | null;
      if (search) {
        try {
          search.focus();
          search.select();
        } catch {}
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, [showEmojiPicker]);

  // Message action helpers
  const isDeletable = useCallback((m: Message) => {
    const mine = currentUserId && m.sender_id === currentUserId;
    const created = new Date(m.created_at).getTime();
    const now = Date.now();
    const within15m = now - created <= 15 * 60 * 1000;
    return Boolean(mine && within15m && !m.deleted_at);
  }, [currentUserId]);

  const handleDeleteMessage = useCallback(async (msg: Message) => {
    if (!isDeletable(msg)) {
      setMessagesError('Message can be deleted only within 15 minutes of sending.');
      pushToast('Cannot delete after 15 minutes', 'error');
      return;
    }
    // Save backup for undo and set optimistic deleted
    deletedBackupRef.current[msg.id] = { body: msg.body };
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, deleted_at: new Date().toISOString(), body: '' } : m));
    setOpenMsgMenuId(null);
    setPendingDeleteIds(prev => { const next = new Set(prev); next.add(msg.id); return next; });
    // Schedule actual delete after 5s
    if (deleteTimersRef.current[msg.id]) window.clearTimeout(deleteTimersRef.current[msg.id]);
    deleteTimersRef.current[msg.id] = window.setTimeout(async () => {
      try {
        const res = await apiClient.auth(`${NOTIFICATIONS_BASE}/notifications/api/v1/inbox/messages/${msg.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete');
        pushToast('Message deleted', 'success');
      } catch (e: any) {
        setMessagesError(e?.message || 'Failed to delete message');
        setMessagesOffset(0);
        pushToast('Failed to delete message', 'error');
      } finally {
        setPendingDeleteIds(prev => { const next = new Set(prev); next.delete(msg.id); return next; });
        delete deletedBackupRef.current[msg.id];
        const t = deleteTimersRef.current[msg.id];
        if (t) window.clearTimeout(t);
        delete deleteTimersRef.current[msg.id];
      }
    }, 5000);
  }, [API_BASE, isDeletable, pushToast]);

  const undoDelete = useCallback((id: string) => {
    const t = deleteTimersRef.current[id];
    if (t) window.clearTimeout(t);
    const backup = deletedBackupRef.current[id];
    setMessages(prev => prev.map(m => m.id === id ? { ...m, deleted_at: null, body: backup?.body ?? m.body } : m));
    setPendingDeleteIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    delete deleteTimersRef.current[id];
    delete deletedBackupRef.current[id];
    pushToast('Deletion undone', 'success');
  }, [pushToast]);
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const isEditable = useCallback((m: Message) => isDeletable(m) && !m.deleted_at, [isDeletable]);

  const startEditMessage = useCallback((m: Message) => {
    if (!isEditable(m)) return;
    setEditingMessageId(m.id);
    setEditingDraft(m.body || "");
    setOpenMsgMenuId(null);
  }, [isEditable]);

  const cancelEditMessage = useCallback(() => {
    setEditingMessageId(null);
    setEditingDraft("");
  }, []);

  const saveEditMessage = useCallback(async () => {
    if (!editingMessageId) return;
    const target = messages.find(m => m.id === editingMessageId);
    if (!target) return;
    if (!isEditable(target)) {
      setMessagesError('Message can be edited only within 15 minutes of sending.');
      return;
    }
    const newBody = editingDraft.trim();
    if (!newBody) return;
    setEditingSaving(true);
    const editedAt = new Date().toISOString();
    // Optimistic update
    setMessages(prev => prev.map(m => m.id === editingMessageId ? { ...m, body: newBody, edited_at: editedAt } : m));
    try {
      const res = await apiClient.auth(`${NOTIFICATIONS_BASE}/notifications/api/v1/inbox/messages/${editingMessageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newBody }),
      });
      if (!res.ok) throw new Error('Failed to edit message');
      setEditingMessageId(null);
      setEditingDraft("");
      pushToast('Message edited', 'success');
    } catch (e: any) {
      setMessagesError(e?.message || 'Failed to edit message');
      // Fallback: refetch messages to restore original server truth
      setMessagesOffset(0);
      pushToast('Failed to edit message', 'error');
    } finally {
      setEditingSaving(false);
    }
  }, [API_BASE, editingMessageId, editingDraft, isEditable, messages, pushToast]);

  const messageById = useMemo(() => {
    const map = new Map<string, Message>();
    messages.forEach((m) => map.set(m.id, m));
    return map;
  }, [messages]);
  const infoMsg = useMemo(() => (infoForMsgId ? (messageById.get(infoForMsgId) || null) : null), [infoForMsgId, messageById]);
  const nameForUser = useCallback((uid?: string | null) => {
    if (!uid) return 'User';
    if (uid === currentUserId) return 'You';
    return selectedConversation?.participant_name || 'User';
  }, [currentUserId, selectedConversation]);

  const handleReplyMessage = useCallback((m: Message) => {
    setReplyTo(m);
    setOpenMsgMenuId(null);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }, []);

  const clearReply = useCallback(() => setReplyTo(null), []);

  const scrollToMessage = useCallback((id: string) => {
    const el = messageRefs.current[id];
    const container = messagesContainerRef.current;
    if (el && container) {
      // Calculate position to center the message in the container
      const containerRect = container.getBoundingClientRect();
      const elementRect = el.getBoundingClientRect();
      const scrollTop = container.scrollTop + (elementRect.top - containerRect.top) - (containerRect.height / 2) + (elementRect.height / 2);
      
      container.scrollTo({ top: scrollTop, behavior: 'smooth' });
      setHighlightMsgId(id);
      window.setTimeout(() => setHighlightMsgId(null), 1500);
    }
  }, []);

  // Ensure a message is loaded; if not, progressively fetch older pages and then scroll to it
  const ensureMessageVisibleAndScroll = useCallback(async (id: string) => {
    if (!activeConversationId) return;
    if (messageRefs.current[id]) { scrollToMessage(id); return; }
    try {
      let off = messages.length; // fetch older pages beyond what's loaded
      for (let i = 0; i < 20; i++) { // hard cap to avoid infinite loops
        const res = await apiClient.auth(
          `${NOTIFICATIONS_BASE}/notifications/api/v1/inbox/conversations/${activeConversationId}/messages?offset=${off}&limit=${messagesLimit}`
        );
        if (!res.ok) break;
        const data = await apiClient.json<Message[]>(res);
        if (!data || data.length === 0) break;
        const withStatus = data.map(m => ({ ...m, _status: 'delivered' as MessageStatus }));
        setMessages(prev => {
          const ids = new Set(prev.map(x => x.id));
          const merged = [...prev];
          for (const mm of withStatus) if (!ids.has(mm.id)) merged.push(mm);
          return merged;
        });
        off += data.length;
        await new Promise(r => setTimeout(r, 0));
        if (messageRefs.current[id]) { setTimeout(() => scrollToMessage(id), 50); return; }
        if (data.length < messagesLimit) break; // no more pages
      }
      // Fallback toast
      if (!messageRefs.current[id]) pushToast('Original message not found in history', 'error');
    } catch {
      pushToast('Failed to load original message', 'error');
    }
  }, [API_BASE, activeConversationId, messages.length, messagesLimit, scrollToMessage, pushToast]);

  const toggleReaction = useCallback(async (msg: Message, emoji: string) => {
    const me = currentUserId || '';
    const had = (msg.reactions || []).some(r => r.emoji === emoji && r.user_id === me);
    // Optimistic
    setMessages(prev => prev.map(m => {
      if (m.id !== msg.id) return m;
      const current = m.reactions || [];
      const next = had ? current.filter(r => !(r.emoji === emoji && r.user_id === me)) : [...current, { emoji, user_id: me }];
      return { ...m, reactions: next };
    }));
    setOpenReactPickerMsgId(null);
    try {
      // Use POST to toggle reaction; backend can interpret toggle behavior
      const res = await apiClient.auth(`${NOTIFICATIONS_BASE}/notifications/api/v1/inbox/messages/${msg.id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });
      if (!res.ok) throw new Error('Failed to update reaction');
    } catch (e: any) {
      // Revert by refetch
      setMessagesError(e?.message || 'Failed to update reaction');
      setMessagesOffset(0);
    }
  }, [API_BASE, currentUserId]);

  // Draft persistence per conversation
  useEffect(() => {
    if (!activeConversationId) return;
    try {
      const key = `inbox-draft-${activeConversationId}`;
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        setInput(saved);
        setTimeout(() => {
          const t = textareaRef.current;
          if (t) {
            t.style.height = 'auto';
            t.style.height = Math.min(t.scrollHeight, 150) + 'px';
          }
        }, 0);
      }
    } catch {}
  }, [activeConversationId]);

  useEffect(() => {
    if (!activeConversationId) return;
    try {
      const key = `inbox-draft-${activeConversationId}`;
      localStorage.setItem(key, input);
    } catch {}
  }, [input, activeConversationId]);

  useEffect(() => {
    if (openMsgMenuId) {
      setMsgMenuFocusIndex(0);
      setTimeout(() => msgMenuRef.current?.focus(), 0);
    }
  }, [openMsgMenuId]);

  // Close message reaction picker on outside click
  useEffect(() => {
    if (!openReactPickerMsgId) return;
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const node = reactionPickerRef.current;
      if (node && target && !node.contains(target)) {
        setOpenReactPickerMsgId(null);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [openReactPickerMsgId]);

  const startLongPress = (id: string) => {
    if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = window.setTimeout(() => setOpenMsgMenuId(id), 500);
  };
  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Close emoji picker when clicking outside (but keep open for clicks inside the picker root)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const wrapper = emojiPickerRef.current;
      const insideWrapper = !!(wrapper && target && wrapper.contains(target));
      const insidePicker = !!(target && typeof target.closest === 'function' && target.closest('.EmojiPickerReact'));
      if (!insideWrapper && !insidePicker) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const body = input.trim();
    if (!body || !activeConversationId) return;
    
    // Create optimistic message with 'sending' status
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      conversation_id: activeConversationId,
      sender_id: currentUserId || '',
      body,
      created_at: new Date().toISOString(),
      _status: 'sending',
      reply_to_id: replyTo?.id || null,
    };
    
    setMessages((prev) => [...prev, optimisticMessage]);
    setInput("");
    setShowEmojiPicker(false);
    setTimeout(() => {
      const el = messagesContainerRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
    
    try {
      const res = await apiClient.auth(`${NOTIFICATIONS_BASE}/notifications/api/v1/inbox/conversations/${activeConversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, reply_to_id: replyTo?.id }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      const msg = await apiClient.json<Message>(res);
      // Replace optimistic message with real one, mark as delivered
      setMessages((prev) => prev.map(m => 
        m.id === tempId ? { ...msg, _status: 'delivered' as MessageStatus } : m
      ));
      setReplyTo(null);
    } catch (e: any) {
      // Remove failed message and show error
      setMessages((prev) => prev.filter(m => m.id !== tempId));
      setMessagesError(e?.message || "Failed to send message");
    }
  }, [input, activeConversationId, currentUserId, API_BASE]);

  const handleConversationClick = useCallback((conversationId: string) => {
    // Reset messages state first to trigger fresh load
    setMessages([]);
    setMessagesOffset(0);
    setMessagesError(null);
    setInput(""); // Clear input when switching conversations
    setShowEmojiPicker(false);
    // Then set the active conversation
    setActiveConversationId(conversationId);
    setSearchParams({ conversation: conversationId });
  }, [setSearchParams]);

  const handleBackToList = useCallback(() => {
    setActiveConversationId(null);
    setSearchParams({});
    setMessages([]);
    setMessagesOffset(0);
  }, [setSearchParams]);

  const addEmoji = useCallback((emojiData: EmojiClickData) => {
    let emoji = (emojiData as any)?.emoji as string | undefined;
    if (!emoji) {
      const unified = (emojiData as any)?.unified as string | undefined;
      if (unified) {
        try {
          const codePoints = unified.split('-').map((u: string) => parseInt(u, 16));
          emoji = String.fromCodePoint(...codePoints);
        } catch {}
      }
    }
    if (!emoji) return;
    const ta = textareaRef.current;
    if (ta) {
      const prevText = ta.value ?? input;
      const start = ta.selectionStart ?? prevText.length;
      const end = ta.selectionEnd ?? prevText.length;
      const next = prevText.slice(0, start) + emoji + prevText.slice(end);
      // Immediate visual feedback
      try { ta.value = next; } catch {}
      setInput(next);
      requestAnimationFrame(() => {
        const t = textareaRef.current;
        if (!t) return;
        const caret = start + emoji.length;
        t.focus();
        try { t.setSelectionRange(caret, caret); } catch {}
        t.style.height = 'auto';
        t.style.height = Math.min(t.scrollHeight, 150) + 'px';
      });
    } else {
      setInput(prev => prev + emoji);
    }
  }, [input]);

  const handleViewProfile = useCallback(() => {
    if (!selectedConversation) return;
    const role = currentUserProfileType?.toLowerCase();
    if (role === 'household') {
      // Household viewing househelp profile (supports query param in iframe)
      const url = `/househelp/public-profile?profileId=${encodeURIComponent(selectedConversation.househelp_id)}&embed=1`;
      setProfileModalLoading(true);
      setProfileModalTimedOut(false);
      if (profileModalTimeoutId.current) window.clearTimeout(profileModalTimeoutId.current);
      profileModalTimeoutId.current = window.setTimeout(() => setProfileModalTimedOut(true), 8000);
      setProfileModalReloadKey((k) => k + 1);
      setProfileModalUrl(url);
      setShowProfileModal(true);
    } else {
      // Househelp viewing household public profile: pass user_id via query to non-param route
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

  const handleAcceptHireRequest = useCallback(async () => {
    if (!hireRequestId || !activeConversationId) return;
    setHireActionLoading('accept');
    try {
      const res = await apiClient.auth(API_ENDPOINTS.hiring.requests.accept(hireRequestId), {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to accept hire request');
      }
      setHireRequestStatus('accepted');
      await fetchHireContext(selectedConversation || undefined);
      if (activeConversationId) {
        const body = 'I have accepted your hire request. Looking forward to working with you!';
        await apiClient.auth(`${NOTIFICATIONS_BASE}/notifications/api/v1/inbox/conversations/${activeConversationId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body }),
        }).catch(() => undefined);
      }
    } catch (error: any) {
      alert(error?.message || 'Failed to accept hire request');
    } finally {
      setHireActionLoading(null);
    }
  }, [API_ENDPOINTS.hiring.requests, API_BASE, fetchHireContext, hireRequestId, selectedConversation, selectedConversationId]);

  const handleDeclineHireRequest = useCallback(async () => {
    if (!hireRequestId) return;
    const reasonInput = window.prompt('Why are you declining this hire request?', 'Currently unavailable');
    if (reasonInput === null) return;
    const reason = reasonInput.trim() || 'Unavailable';
    setHireActionLoading('decline');
    try {
      const res = await apiClient.auth(API_ENDPOINTS.hiring.requests.decline(hireRequestId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to decline hire request');
      }
      setHireRequestStatus('declined');
      await fetchHireContext(selectedConversation || undefined);
      if (activeConversationId) {
        const body = `I've declined the hire request: ${reason}.`;
        await apiClient.auth(`${NOTIFICATIONS_BASE}/notifications/api/v1/inbox/conversations/${activeConversationId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ body }),
        }).catch(() => undefined);
      }
    } catch (error: any) {
      alert(error?.message || 'Failed to decline hire request');
    } finally {
      setHireActionLoading(null);
    }
  }, [API_ENDPOINTS.hiring.requests, API_BASE, fetchHireContext, hireRequestId, selectedConversation, selectedConversationId]);

  const groupedMessages = useMemo(() => {
    const now = new Date();
    const todayKey = now.toDateString();
    const y = new Date(now);
    y.setDate(now.getDate() - 1);
    const yesterdayKey = y.toDateString();
    const formatLabel = (d: Date) => {
      const k = d.toDateString();
      if (k === todayKey) return 'Today';
      if (k === yesterdayKey) return 'Yesterday';
      return d.toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    };
    const sorted = [...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const groups: { key: string; label: string; items: Message[] }[] = [];
    const map = new Map<string, { label: string; items: Message[] }>();
    for (const m of sorted) {
      const d = new Date(m.created_at);
      const key = d.toDateString();
      let g = map.get(key);
      if (!g) {
        g = { label: formatLabel(d), items: [] };
        map.set(key, g);
        groups.push({ key, label: g.label, items: g.items });
      }
      g.items.push(m);
    }
    return groups;
  }, [messages]);

  // Conversation list JSX
  const conversationsList = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-purple-200 dark:border-purple-500/30">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chats</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {loading && items.length === 0 && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <svg className="animate-spin h-12 w-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600 dark:text-gray-400">Loading conversations...</p>
            </div>
          </div>
        )}

      {/* Delete Confirm Modal */}
      {deleteConfirmMsg && (
        <div
          className="fixed inset-0 z-[75] flex items-center justify-center p-4 bg-black/60"
          onClick={() => setDeleteConfirmMsg(null)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl overflow-hidden border-2 border-red-300/40 shadow-[0_0_30px_rgba(220,38,38,0.35)] bg-white dark:bg-[#0a0a0f]"
            onClick={(e) => e.stopPropagation()}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setDeleteConfirmMsg(null);
              if (e.key === 'Enter') { handleDeleteMessage(deleteConfirmMsg); setDeleteConfirmMsg(null); }
            }}
          >
            <button
              type="button"
              className="absolute top-3 right-3 z-[76] p-2 rounded-full bg-white/90 dark:bg-[#13131a]/90 border border-red-200/50 dark:border-red-500/30 shadow hover:scale-105 transition"
              onClick={() => setDeleteConfirmMsg(null)}
              aria-label="Close delete confirm"
            >
              <XMarkIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Delete message?</h3>
              <p className="text-sm text-gray-700 dark:text-gray-200 mb-4">
                This message will be removed for both participants. You can only delete messages within 15 minutes of sending.
              </p>
              <div className="rounded-md border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40 p-3 text-sm text-gray-800 dark:text-gray-100 mb-4">
                “{deleteConfirmMsg.body || 'Message'}”
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800"
                  onClick={() => setDeleteConfirmMsg(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow"
                  onClick={() => { handleDeleteMessage(deleteConfirmMsg); setDeleteConfirmMsg(null); }}
                >
                  Delete for everyone
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Info Modal */}
      {infoForMsgId && infoMsg && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-black/60" onClick={() => setInfoForMsgId(null)}>
          <div className="relative w-full max-w-md rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.35)] bg-white dark:bg-[#0a0a0f]" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="absolute top-3 right-3 z-[66] p-2 rounded-full bg-white/90 dark:bg-[#13131a]/90 border border-purple-200 dark:border-purple-500/30 shadow hover:scale-105 transition"
              onClick={() => setInfoForMsgId(null)}
              aria-label="Close message info"
            >
              <XMarkIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <div className="p-5">
              <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-3">Message info</h3>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
                <div className="flex justify-between"><span>Sent</span><span>{new Date(infoMsg.created_at).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Status</span><span>{(infoMsg._status || (infoMsg.read_at ? 'read' : 'delivered'))}</span></div>
                <div className="flex justify-between"><span>Read</span><span>{infoMsg.read_at ? new Date(infoMsg.read_at).toLocaleString() : 'Not read yet'}</span></div>
                <div className="flex justify-between"><span>Message ID</span><span className="truncate max-w-[14rem]" title={infoMsg.id}>{infoMsg.id}</span></div>
              </div>
              <div className="mt-4 text-xs opacity-70">Exact delivery time may be unavailable.</div>
            </div>
          </div>
        </div>
      )}

        {items.length === 0 && !loading && !error && (
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-300 text-lg">No conversations yet.</p>
          </div>
        )}

        {error && (
          <div className="m-4 rounded-xl border border-red-300 bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-300">{error}</div>
        )}

        <div className="divide-y divide-purple-100 dark:divide-purple-500/20">
          {items.map((c) => (
            <button
              key={c.id}
              onClick={() => handleConversationClick(c.id)}
              className={`w-full p-4 hover:bg-purple-50 dark:hover:bg-slate-800/60 transition-colors text-left ${
                activeConversationId === c.id ? 'bg-purple-100 dark:bg-slate-800' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full flex-shrink-0 relative overflow-hidden border-2 border-purple-300 dark:border-purple-500">
                  {c.participant_avatar ? (
                    <>
                      {/* Skeleton loader */}
                      {imageLoadingStates[c.id] !== false && (
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-shimmer bg-[length:200%_100%]" />
                      )}
                      <img
                        src={c.participant_avatar}
                        alt={c.participant_name || 'User'}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                          imageLoadingStates[c.id] === false ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => {
                          setImageLoadingStates(prev => ({ ...prev, [c.id]: false }));
                        }}
                        onError={(e) => {
                          setImageLoadingStates(prev => ({ ...prev, [c.id]: false }));
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-lg font-bold">
                      {(c.participant_name || 'U')[0].toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-900 dark:text-white truncate">
                      {c.participant_name || 'Unknown User'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                      {new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {typeof c.unread_count === 'number' && c.unread_count > 0 && (
                    <span className="inline-flex items-center justify-center rounded-full bg-purple-600 text-white text-xs font-bold min-w-[20px] h-[20px] px-1.5 mt-1">
                      {c.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
        <div ref={sentinelRef} className="h-4" />
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
                {selectedConversation.participant_name || 'Unknown User'}
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
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60" onClick={() => { setShowProfileModal(false); setProfileModalUrl(null); setProfileModalLoading(false); setProfileModalTimedOut(false); if (profileModalTimeoutId.current) { window.clearTimeout(profileModalTimeoutId.current); profileModalTimeoutId.current = null; } }}>
          <div className="relative w-full max-w-6xl h-[85vh] rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.35)]" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="absolute top-3 right-3 z-[71] p-2 rounded-full bg-white/90 dark:bg-[#13131a]/90 border border-purple-200 dark:border-purple-500/30 shadow hover:scale-105 transition"
              onClick={() => { setShowProfileModal(false); setProfileModalUrl(null); setProfileModalLoading(false); setProfileModalTimedOut(false); if (profileModalTimeoutId.current) { window.clearTimeout(profileModalTimeoutId.current); profileModalTimeoutId.current = null; } }}
              aria-label="Close profile"
            >
              <XMarkIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            {profileModalLoading && (
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-purple-600/20 animate-pulse border-b border-purple-500/30 z-[71]" />
            )}
            {profileModalLoading && (
              <div className="absolute inset-0 z-[72] grid place-items-center bg-black/10">
                <svg className="animate-spin h-10 w-10 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              </div>
            )}
            {profileModalTimedOut && (
              <div className="absolute inset-0 z-[73] flex flex-col items-center justify-center gap-3 bg-black/20 text-center px-6">
                <div className="text-white font-semibold">This is taking longer than usual…</div>
                <div className="text-white/80 text-sm">Please check your connection or try again.</div>
                <div className="mt-2 flex gap-3">
                  <button
                    className="px-4 py-2 rounded-lg bg-white text-purple-600 font-semibold shadow hover:shadow-lg"
                    onClick={(e) => {
                      e.preventDefault();
                      setProfileModalLoading(true);
                      setProfileModalTimedOut(false);
                      if (profileModalTimeoutId.current) window.clearTimeout(profileModalTimeoutId.current);
                      profileModalTimeoutId.current = window.setTimeout(() => setProfileModalTimedOut(true), 8000);
                      setProfileModalReloadKey((k) => k + 1);
                    }}
                  >
                    Retry
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold shadow hover:bg-purple-700"
                    onClick={() => { setShowProfileModal(false); setProfileModalUrl(null); setProfileModalLoading(false); setProfileModalTimedOut(false); if (profileModalTimeoutId.current) { window.clearTimeout(profileModalTimeoutId.current); profileModalTimeoutId.current = null; } }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
            <iframe key={`${profileModalUrl}-${profileModalReloadKey}`} src={profileModalUrl} title="Public profile" className="w-full h-full bg-white dark:bg-[#0a0a0f]" onLoad={() => { setProfileModalLoading(false); setProfileModalTimedOut(false); if (profileModalTimeoutId.current) { window.clearTimeout(profileModalTimeoutId.current); profileModalTimeoutId.current = null; } }} />
          </div>
        </div>
      )}

      {/* Hire Wizard Modal */}
      {showHireWizard && selectedConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <ConversationHireWizard
            househelpId={currentUserProfileType?.toLowerCase() === 'household' ? selectedConversation.househelp_id : selectedConversation.household_id}
            househelpName={selectedConversation.participant_name || 'User'}
            onClose={() => setShowHireWizard(false)}
            onSuccess={(newHireRequestId) => {
              setShowHireWizard(false);
              setHireRequestStatus('pending');
              setHireRequestId(newHireRequestId);
              // Optionally send a message about the hire request
              const body = `I've sent you a formal hire request. Please review and let me know if you have any questions!`;
              apiClient.auth(`${NOTIFICATIONS_BASE}/notifications/api/v1/inbox/conversations/${activeConversationId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ body }),
              }).then(res => {
                if (res.ok) {
                  return apiClient.json<Message>(res);
                }
              }).then(msg => {
                if (msg) {
                  setMessages((prev) => [...prev, msg]);
                  setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
                }
              }).catch(console.error);
            }}
          />
        </div>
      )}
    </div>
  );
}

export { ErrorBoundary } from "~/components/ErrorBoundary";
