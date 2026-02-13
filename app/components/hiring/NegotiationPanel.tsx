import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '~/utils/apiClient';
import { API_ENDPOINTS } from '~/config/api';
import { Send, MessageCircle } from 'lucide-react';
import { ErrorAlert } from '~/components/ui/ErrorAlert';

interface Negotiation {
  id: string;
  hire_request_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

interface NegotiationPanelProps {
  hireRequestId: string;
  currentUserId: string;
}

export default function NegotiationPanel({ hireRequestId, currentUserId }: NegotiationPanelProps) {
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNegotiations();
  }, [hireRequestId]);

  useEffect(() => {
    scrollToBottom();
  }, [negotiations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchNegotiations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.auth(
        API_ENDPOINTS.hiring.requests.negotiations(hireRequestId),
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch negotiations');
      }

      const data = await response.json();
      setNegotiations(data.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    setSending(true);
    setError(null);

    try {
      const response = await apiClient.auth(
        API_ENDPOINTS.hiring.requests.negotiate(hireRequestId),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: message.trim() }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      setMessage('');
      fetchNegotiations();
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else if (diffInHours < 48) {
      return 'Yesterday ' + date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Negotiation Messages
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Discuss details and negotiate terms
        </p>
      </div>

      {/* Messages Area */}
      <div className="px-6 py-4 max-h-96 overflow-y-auto">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        )}

        {error && <ErrorAlert message={error} className="mb-4" />}

        {!loading && negotiations.length === 0 && (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              No messages yet. Start the conversation!
            </p>
          </div>
        )}

        {!loading && negotiations.length > 0 && (
          <div className="space-y-4">
            {negotiations.map((negotiation) => {
              const isCurrentUser = negotiation.sender_id === currentUserId;
              
              return (
                <div
                  key={negotiation.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-3 ${
                      isCurrentUser
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    {!isCurrentUser && negotiation.sender && (
                      <p className="text-xs font-semibold mb-1 opacity-75">
                        {negotiation.sender.first_name} {negotiation.sender.last_name}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {negotiation.message}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        isCurrentUser ? 'text-purple-200' : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {formatTime(negotiation.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            rows={2}
            disabled={sending}
            className="flex-1 px-4 py-1 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white resize-none disabled:opacity-50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={!message.trim() || sending}
            className="px-6 py-1 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
