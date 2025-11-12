import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { API_BASE_URL } from "~/config/api";
import { apiClient } from "~/utils/apiClient";

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at?: string | null;
  created_at: string;
};

export default function ConversationDetailPage() {
  const { conversation_id } = useParams();
  const API_BASE = useMemo(
    () => (typeof window !== 'undefined' && (window as any).ENV?.AUTH_API_BASE_URL) || API_BASE_URL,
    []
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const limit = 50;

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

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load messages
  useEffect(() => {
    if (!conversation_id) return;
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.auth(
          `${API_BASE}/api/v1/inbox/conversations/${conversation_id}/messages?offset=${offset}&limit=${limit}`
        );
        if (!res.ok) throw new Error("Failed to load messages");
        const data = await apiClient.json<Message[]>(res);
        if (cancelled) return;
        setMessages((prev) => (offset === 0 ? data : [...prev, ...data]));
        setHasMore(data.length === limit);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load messages");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [API_BASE, conversation_id, offset]);

  // Mark conversation read on mount and when messages change
  useEffect(() => {
    if (!conversation_id) return;
    async function markRead() {
      try {
        await apiClient.auth(`${API_BASE}/api/v1/inbox/conversations/${conversation_id}/read`, {
          method: "POST",
        });
      } catch {}
    }
    markRead();
  }, [API_BASE, conversation_id, messages.length]);

  // Auto scroll on initial load and when sending
  useEffect(() => {
    if (offset === 0 && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, offset]);

  // Polling: refresh messages periodically and mark read
  useEffect(() => {
    if (!conversation_id) return;
    const id = setInterval(async () => {
      try {
        const count = messages.length > 0 ? messages.length + 10 : limit;
        const res = await apiClient.auth(
          `${API_BASE}/api/v1/inbox/conversations/${conversation_id}/messages?offset=0&limit=${count}`
        );
        if (!res.ok) return;
        const data = await apiClient.json<Message[]>(res);
        if (data.length !== messages.length) {
          setMessages(data);
          setTimeout(scrollToBottom, 50);
        }
        // Mark as read again to update read receipts for sender
        try { await apiClient.auth(`${API_BASE}/api/v1/inbox/conversations/${conversation_id}/read`, { method: "POST" }); } catch {}
      } catch {}
    }, 12000);
    return () => clearInterval(id);
  }, [API_BASE, conversation_id, messages.length]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const io = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !loading && hasMore) {
        setOffset((o) => o + limit);
      }
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [loading, hasMore]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = input.trim();
    if (!body || !conversation_id) return;
    try {
      const res = await apiClient.auth(`${API_BASE}/api/v1/inbox/conversations/${conversation_id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      const msg = await apiClient.json<Message>(res);
      setMessages((prev) => [...prev, msg]);
      setInput("");
      setTimeout(scrollToBottom, 50);
    } catch (e: any) {
      setError(e?.message || "Failed to send message");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="gradient" bubbles={true} bubbleDensity="low">
        <main className="flex-1 py-6">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4">Conversation</h1>

            <div className="rounded-2xl border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] p-4 sm:p-6 shadow-light-glow-sm dark:shadow-glow-sm min-h-[60vh] flex flex-col">
              {/* Messages list */}
              <div className="flex-1 overflow-y-auto pr-1">
                <div ref={sentinelRef} />
                {messages.length === 0 && !loading && !error && (
                  <div className="text-center text-gray-500 dark:text-gray-300 py-12">No messages yet.</div>
                )}
                {error && (
                  <div className="mb-3 rounded-md border border-red-300 bg-red-50 dark:bg-red-900/20 p-3 text-red-700 dark:text-red-300">{error}</div>
                )}
                {messages.map((m) => {
                  const mine = currentUserId && m.sender_id === currentUserId;
                  return (
                    <div key={m.id} className={`my-2 flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow ${mine ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100'}`}>
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

              {/* Composer */}
              <form onSubmit={handleSend} className="mt-3 flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#0f0f14] px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold px-4 py-3 shadow hover:from-purple-700 hover:to-pink-700"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}

export { ErrorBoundary } from "~/components/ErrorBoundary";
