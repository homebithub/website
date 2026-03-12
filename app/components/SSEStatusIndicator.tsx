import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export interface SSEStatusIndicatorProps {
  isConnected: boolean;
  reconnecting?: boolean;
  onReconnect?: () => void;
  showLabel?: boolean;
  className?: string;
}

export function SSEStatusIndicator({
  isConnected,
  reconnecting = false,
  onReconnect,
  showLabel = false,
  className = ''
}: SSEStatusIndicatorProps) {
  if (isConnected && !reconnecting) {
    return showLabel ? (
      <div className={`flex items-center gap-2 text-green-600 dark:text-green-400 ${className}`}>
        <Wifi className="w-4 h-4" />
        <span className="text-xs font-medium">Live</span>
      </div>
    ) : (
      <div className={`relative ${className}`} title="Real-time updates active">
        <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
      </div>
    );
  }

  if (reconnecting) {
    return (
      <div className={`flex items-center gap-2 text-yellow-600 dark:text-yellow-400 ${className}`}>
        <RefreshCw className="w-4 h-4 animate-spin" />
        {showLabel && <span className="text-xs font-medium">Reconnecting...</span>}
      </div>
    );
  }

  return (
    <button
      onClick={onReconnect}
      className={`flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors ${className}`}
      title="Real-time updates disconnected. Click to reconnect."
    >
      <WifiOff className="w-4 h-4" />
      {showLabel && <span className="text-xs font-medium">Offline</span>}
    </button>
  );
}

export default SSEStatusIndicator;
