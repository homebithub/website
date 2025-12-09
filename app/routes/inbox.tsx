import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Navigation } from "~/components/Navigation";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { API_BASE_URL, API_ENDPOINTS } from "~/config/api";
import { apiClient } from "~/utils/apiClient";
import { ArrowLeftIcon, PaperAirplaneIcon, FaceSmileIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import EmojiPicker, { type EmojiClickData, Theme } from 'emoji-picker-react';
import ConversationHireWizard from '~/components/hiring/ConversationHireWizard';
import HireContextBanner from '~/components/hiring/HireContextBanner';

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
};

type HireRequestSummary = {
  id: string;
  household_id: string;
  househelp_id: string;
  status: string;
};

export default function InboxPage() {
  const API_BASE = React.useMemo(() => (typeof window !== 'undefined' && (window as any).ENV?.AUTH_API_BASE_URL) || API_BASE_URL, []);
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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileModalUrl, setProfileModalUrl] = useState<string | null>(null);
  const [profileModalLoading, setProfileModalLoading] = useState(false);
  const messagesLimit = 50;
  
  // Hire wizard state
  const [showHireWizard, setShowHireWizard] = useState(false);
  const [hireRequestStatus, setHireRequestStatus] = useState<string | undefined>();
  const [hireRequestId, setHireRequestId] = useState<string | undefined>();
  const [hireActionLoading, setHireActionLoading] = useState<'accept' | 'decline' | null>(null);
  
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
        const res = await apiClient.auth(`${API_BASE}/api/v1/inbox/conversations?offset=${offset}&limit=${limit}`);
        if (!res.ok) throw new Error("Failed to load conversations");
        const data = await apiClient.json<Conversation[]>(res);
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
  }, [offset, API_BASE]);

  // Polling refresh conversations
  useEffect(() => {
    const id = setInterval(async () => {
      if (loading) return;
      try {
        const count = items.length > 0 ? items.length : limit;
        const res = await apiClient.auth(`${API_BASE}/api/v1/inbox/conversations?offset=0&limit=${count}`);
        if (!res.ok) return;
        const data = await apiClient.json<Conversation[]>(res);
        setItems(data);
        setHasMore(data.length >= count);
      } catch {}
    }, 15000);
    return () => clearInterval(id);
  }, [API_BASE, items.length, loading]);

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
          `${API_BASE}/api/v1/inbox/conversations/${activeConversationId}/messages?offset=${messagesOffset}&limit=${messagesLimit}`
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
  }, [API_BASE, activeConversationId, messagesOffset]);

  // Mark conversation as read
  useEffect(() => {
    if (!activeConversationId) return;
    async function markRead() {
      try {
        await apiClient.auth(`${API_BASE}/api/v1/inbox/conversations/${activeConversationId}/read`, {
          method: "POST",
        });
      } catch {}
    }
    markRead();
  }, [API_BASE, activeConversationId, messages.length]);

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
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollToBottom(false);
  }, []);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (messagesOffset === 0 && messages.length > 0) {
      const el = messagesContainerRef.current;
      const atTopInitial = el ? el.scrollTop === 0 && el.scrollHeight > el.clientHeight : true;
      if (isNearBottom() || atTopInitial) {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }
  }, [messages, messagesOffset, isNearBottom]);

  // Polling: refresh messages
  useEffect(() => {
    if (!activeConversationId) return;
    const id = setInterval(async () => {
      try {
        const count = messages.length > 0 ? messages.length + 10 : messagesLimit;
        const res = await apiClient.auth(
          `${API_BASE}/api/v1/inbox/conversations/${activeConversationId}/messages?offset=0&limit=${count}`
        );
        if (!res.ok) return;
        const data = await apiClient.json<Message[]>(res);
        if (data.length !== messages.length) {
          setMessages(data);
          if (isNearBottom()) {
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
          }
        }
        // Mark as read
        try { await apiClient.auth(`${API_BASE}/api/v1/inbox/conversations/${activeConversationId}/read`, { method: "POST" }); } catch {}
      } catch {}
    }, 12000);
    return () => clearInterval(id);
  }, [API_BASE, activeConversationId, messages.length, isNearBottom]);

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
    };
    
    setMessages((prev) => [...prev, optimisticMessage]);
    setInput("");
    setShowEmojiPicker(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    
    try {
      const res = await apiClient.auth(`${API_BASE}/api/v1/inbox/conversations/${activeConversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      const msg = await apiClient.json<Message>(res);
      // Replace optimistic message with real one, mark as delivered
      setMessages((prev) => prev.map(m => 
        m.id === tempId ? { ...msg, _status: 'delivered' as MessageStatus } : m
      ));
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
      setProfileModalUrl(url);
      setShowProfileModal(true);
    } else {
      // Househelp viewing household public profile: pass user_id via query to non-param route
      const url = `/household/public-profile?user_id=${encodeURIComponent(selectedConversation.household_id)}&embed=1`;
      setProfileModalLoading(true);
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
        await apiClient.auth(`${API_BASE}/api/v1/inbox/conversations/${activeConversationId}/messages`, {
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
        await apiClient.auth(`${API_BASE}/api/v1/inbox/conversations/${activeConversationId}/messages`, {
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
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow ${
                      mine 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100'
                    } ${status === 'sending' ? 'opacity-70' : ''}`}>
                      <div className="whitespace-pre-wrap break-words">{m.body}</div>
                      <div className={`mt-1 text-[10px] flex items-center justify-end gap-1 ${mine ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                        <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {mine && (
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
      
      {/* Profile Modal */}
      {showProfileModal && profileModalUrl && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60" onClick={() => { setShowProfileModal(false); setProfileModalUrl(null); }}>
          <div className="relative w-full max-w-6xl h-[85vh] rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.35)]" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="absolute top-3 right-3 z-[71] p-2 rounded-full bg-white/90 dark:bg-[#13131a]/90 border border-purple-200 dark:border-purple-500/30 shadow hover:scale-105 transition"
              onClick={() => { setShowProfileModal(false); setProfileModalUrl(null); }}
              aria-label="Close profile"
            >
              <XMarkIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            {profileModalLoading && (
              <div className="absolute inset-0 z-[72] grid place-items-center bg-black/10">
                <svg className="animate-spin h-10 w-10 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              </div>
            )}
            <iframe src={profileModalUrl} title="Public profile" className="w-full h-full bg-white dark:bg-[#0a0a0f]" onLoad={() => setProfileModalLoading(false)} />
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
              apiClient.auth(`${API_BASE}/api/v1/inbox/conversations/${activeConversationId}/messages`, {
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
