import React, { createContext, useContext, useMemo, useCallback, useState, useEffect } from 'react';
import { useWebSocket } from '~/hooks/useWebSocket';
import { NOTIFICATIONS_WS_BASE_URL } from '~/config/api';
import { useAuth } from '~/contexts/useAuth';
import { getAccessTokenFromCookies } from '~/utils/cookie';
import type { MessageEvent as WSMessageEvent } from '~/types/websocket';

type WebSocketContextType = {
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
  addEventListener: (type: string, handler: (event: WSMessageEvent) => void) => () => void;
  unreadCount: number;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
  resetUnreadCount: () => void;
};

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const currentUserId = (user as any)?.user?.id || (user as any)?.id || null;

  const wsUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const base = ((typeof window !== 'undefined' && (window as any).ENV?.NOTIFICATIONS_WS_BASE_URL) || NOTIFICATIONS_WS_BASE_URL).replace(/^http/, 'ws');
    return `${base}`;
  }, []);

  const token = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return getAccessTokenFromCookies() || localStorage.getItem('token') || null;
  }, []);

  const { connectionState, addEventListener } = useWebSocket({
    url: wsUrl,
    token,
    enabled: !!currentUserId,
    reconnectInterval: 3000,
    maxReconnectAttempts: 10,
  });

  const incrementUnreadCount = useCallback(() => {
    setUnreadCount(prev => prev + 1);
  }, []);

  const decrementUnreadCount = useCallback(() => {
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const resetUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    if (!currentUserId) {
      setUnreadCount(0);
    }
  }, [currentUserId]);

  // Listen for new messages to update unread count
  useEffect(() => {
    const unsubscribe = addEventListener('new_message', (event) => {
      const eventUserId = currentUserId || (() => {
        try {
          const str = localStorage.getItem("user_object");
          if (!str) return null;
          const obj = JSON.parse(str);
          return obj?.id || null;
        } catch {
          return null;
        }
      })();

      // Only increment if the message is not from the current user
      const eventData = event as any;
      if (eventData.data?.user_id && eventData.data.user_id !== eventUserId) {
        incrementUnreadCount();
      }
    });

    return unsubscribe;
  }, [addEventListener, currentUserId, incrementUnreadCount]);

  const value = useMemo(
    () => ({
      connectionState,
      addEventListener,
      unreadCount,
      incrementUnreadCount,
      decrementUnreadCount,
      resetUnreadCount,
    }),
    [connectionState, addEventListener, unreadCount, incrementUnreadCount, decrementUnreadCount, resetUnreadCount]
  );

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}
