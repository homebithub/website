import { useState, useEffect, useCallback } from 'react';

export interface SSEConnectionStatus {
  inbox: boolean;
  subscription: boolean;
  payment: boolean;
  hiring: boolean;
  notifications: boolean;
}

export interface UseSSEStatusResult {
  isAnyConnected: boolean;
  isAllConnected: boolean;
  connectionStatus: SSEConnectionStatus;
  connectionCount: number;
  totalConnections: number;
  connectionPercentage: number;
}

/**
 * Aggregates SSE connection status from multiple hooks
 * 
 * @param connections - Object with connection states from various SSE hooks
 * @returns Aggregated connection status and statistics
 */
export function useSSEStatus(connections: Partial<SSEConnectionStatus>): UseSSEStatusResult {
  const [connectionStatus, setConnectionStatus] = useState<SSEConnectionStatus>({
    inbox: false,
    subscription: false,
    payment: false,
    hiring: false,
    notifications: false,
  });

  useEffect(() => {
    setConnectionStatus({
      inbox: connections.inbox ?? false,
      subscription: connections.subscription ?? false,
      payment: connections.payment ?? false,
      hiring: connections.hiring ?? false,
      notifications: connections.notifications ?? false,
    });
  }, [
    connections.inbox,
    connections.subscription,
    connections.payment,
    connections.hiring,
    connections.notifications,
  ]);

  const connectionCount = Object.values(connectionStatus).filter(Boolean).length;
  const totalConnections = Object.keys(connectionStatus).length;
  const connectionPercentage = totalConnections > 0 
    ? Math.round((connectionCount / totalConnections) * 100)
    : 0;

  const isAnyConnected = connectionCount > 0;
  const isAllConnected = connectionCount === totalConnections;

  return {
    isAnyConnected,
    isAllConnected,
    connectionStatus,
    connectionCount,
    totalConnections,
    connectionPercentage,
  };
}

export default useSSEStatus;
