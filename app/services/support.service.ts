import { API_BASE_URL } from '~/config/api';

const base = () => (typeof window !== 'undefined' && (window as any).ENV?.NOTIFICATIONS_API_BASE_URL) || API_BASE_URL;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${base()}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data?.error === 'string'
      ? data.error
      : data?.error?.message || data?.message;
    throw new Error(message || 'Support is temporarily unavailable. Please try again.');
  }
  return data as T;
}

export type SupportMessage = {
  id: string; chat_id: string; sender_type: 'customer' | 'agent' | 'system'; body: string;
  reply_to_id?: string; attachment_url?: string; attachment_name?: string; attachment_type?: string;
  attachment_size?: number; reactions?: Record<string, string>; read_at?: string; created_at: string;
};
export type SupportChat = { id: string; ticket_number: number; access_token: string; status: 'open'|'pending'|'closed' };

export const supportService = {
  create: (payload: { name: string; email?: string; subject?: string; message: string; sourceURL: string }) =>
    request<SupportChat>('/api/v1/support/chats', { method: 'POST', body: JSON.stringify(payload) }),
  messages: (id: string, token: string) => request<{chat: SupportChat; messages: SupportMessage[]}>(`/api/v1/support/chats/${id}/messages?access_token=${encodeURIComponent(token)}`),
  send: (id: string, token: string, payload: Record<string, unknown>) => request<SupportMessage>(`/api/v1/support/chats/${id}/messages`, { method: 'POST', headers: { 'X-Support-Token': token }, body: JSON.stringify(payload) }),
  react: (messageId: string, token: string, emoji: string) => request<SupportMessage>(`/api/v1/support/messages/${messageId}/reactions`, { method: 'POST', headers: { 'X-Support-Token': token }, body: JSON.stringify({ emoji }) }),
};
