import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { API_BASE_URL } from "~/config/api";
import { apiClient } from "~/utils/apiClient";
import { ArrowLeftIcon, PaperAirplaneIcon, FaceSmileIcon } from '@heroicons/react/24/outline';
import EmojiPicker, { type EmojiClickData, Theme } from 'emoji-picker-react';

type Conversation = {
  id: string;
  household_id: string;
  househelp_id: string;
  last_message_at: string;
  unread_count?: number;
  participant_name?: string;
  participant_avatar?: string;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at?: string | null;
  created_at: string;
};

export default function InboxPage() {
  const API_BASE = React.useMemo(() => (typeof window !== 'undefined' && (window as any).ENV?.AUTH_API_BASE_URL) || API_BASE_URL, []);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedConversationId = searchParams.get('conversation');
  
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
  const messagesLimit = 50;
  
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
  
  const selectedConversation = items.find(c => c.id === selectedConversationId);
  
  // Track image loading state for avatars
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});

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
    if (!selectedConversationId) {
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
          `${API_BASE}/api/v1/inbox/conversations/${selectedConversationId}/messages?offset=${messagesOffset}&limit=${messagesLimit}`
        );
        if (!res.ok) throw new Error("Failed to load messages");
        const data = await apiClient.json<Message[]>(res);
        if (cancelled) return;
        setMessages((prev) => (messagesOffset === 0 ? data : [...prev, ...data]));
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
  }, [API_BASE, selectedConversationId, messagesOffset]);

  // Mark conversation as read
  useEffect(() => {
    if (!selectedConversationId) return;
    async function markRead() {
      try {
        await apiClient.auth(`${API_BASE}/api/v1/inbox/conversations/${selectedConversationId}/read`, {
          method: "POST",
        });
      } catch {}
    }
    markRead();
  }, [API_BASE, selectedConversationId, messages.length]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (messagesOffset === 0 && messages.length > 0) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [messages, messagesOffset]);

  // Polling: refresh messages
  useEffect(() => {
    if (!selectedConversationId) return;
    const id = setInterval(async () => {
      try {
        const count = messages.length > 0 ? messages.length + 10 : messagesLimit;
        const res = await apiClient.auth(
          `${API_BASE}/api/v1/inbox/conversations/${selectedConversationId}/messages?offset=0&limit=${count}`
        );
        if (!res.ok) return;
        const data = await apiClient.json<Message[]>(res);
        if (data.length !== messages.length) {
          setMessages(data);
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
        }
        // Mark as read
        try { await apiClient.auth(`${API_BASE}/api/v1/inbox/conversations/${selectedConversationId}/read`, { method: "POST" }); } catch {}
      } catch {}
    }, 12000);
    return () => clearInterval(id);
  }, [API_BASE, selectedConversationId, messages.length]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const body = input.trim();
    if (!body || !selectedConversationId) return;
    try {
      const res = await apiClient.auth(`${API_BASE}/api/v1/inbox/conversations/${selectedConversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      const msg = await apiClient.json<Message>(res);
      setMessages((prev) => [...prev, msg]);
      setInput("");
      setShowEmojiPicker(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (e: any) {
      setMessagesError(e?.message || "Failed to send message");
    }
  }, [input, selectedConversationId, API_BASE]);

  const handleConversationClick = useCallback((conversationId: string) => {
    setSearchParams({ conversation: conversationId });
    setMessagesOffset(0);
    setInput(""); // Clear input when switching conversations
    setShowEmojiPicker(false);
  }, [setSearchParams]);

  const handleBackToList = useCallback(() => {
    setSearchParams({});
    setMessages([]);
    setMessagesOffset(0);
  }, [setSearchParams]);

  const addEmoji = useCallback((emojiData: EmojiClickData) => {
    setInput(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  }, []);

  const handleViewProfile = useCallback(() => {
    if (!selectedConversation) return;
    
    // Determine which profile to view based on current user's profile type
    if (currentUserProfileType?.toLowerCase() === 'household') {
      // Household user viewing househelp profile
      navigate('/househelp/public-profile', { 
        state: { 
          profileId: selectedConversation.househelp_id,
          fromInbox: true 
        } 
      });
    } else {
      // Househelp user viewing household profile
      navigate(`/household/public-profile/${selectedConversation.household_id}`, {
        state: { fromInbox: true }
      });
    }
  }, [selectedConversation, currentUserProfileType, navigate]);

  // Conversation list component
  const ConversationsList = () => (
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
                selectedConversationId === c.id ? 'bg-purple-100 dark:bg-slate-800' : ''
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

  // Messages view component
  const MessagesView = () => {
    if (!selectedConversation) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-[#0a0a0f]">
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg">Select a conversation to start messaging</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full bg-white dark:bg-[#13131a] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-purple-200 dark:border-purple-500/30 flex items-center gap-3 flex-shrink-0">
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
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div ref={messagesSentinelRef} />
          
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

          {messages.map((m) => {
            const mine = currentUserId && m.sender_id === currentUserId;
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow ${
                  mine 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100'
                }`}>
                  <div className="whitespace-pre-wrap break-words">{m.body}</div>
                  <div className={`mt-1 text-[10px] opacity-80 ${mine ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {mine && m.read_at ? ' • Read' : ''}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input - At bottom */}
        <div className="flex-shrink-0 p-4 border-t border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a]">
          {showEmojiPicker && (
            <div ref={emojiPickerRef} className="mb-2 absolute bottom-full right-4 z-50">
              <EmojiPicker
                onEmojiClick={addEmoji}
                theme={Theme.AUTO}
                searchPlaceHolder="Search emojis..."
                width={350}
                height={450}
              />
            </div>
          )}
          
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 hover:bg-purple-100 dark:hover:bg-slate-800 rounded-full transition"
            >
              <FaceSmileIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
            
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-full border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoComplete="off"
            />
            
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <PaperAirplaneIcon className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="gradient" bubbles={true} bubbleDensity="low" className="flex-1 flex flex-col">
        <main className="flex-1 flex flex-col relative">
          {/* Desktop: Split view */}
          <div className="hidden lg:flex flex-1 max-w-7xl mx-auto w-full">
            <div className="w-1/3 border-r border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a]">
              <ConversationsList />
            </div>
            <div className="flex-1">
              <MessagesView />
            </div>
          </div>

          {/* Mobile: Single view */}
          <div className="lg:hidden flex-1">
            {selectedConversationId ? (
              <MessagesView />
            ) : (
              <div className="h-full bg-white dark:bg-[#13131a]">
                <ConversationsList />
              </div>
            )}
          </div>
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}

export { ErrorBoundary } from "~/components/ErrorBoundary";
