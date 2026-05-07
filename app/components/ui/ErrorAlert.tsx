import React, { useEffect, useState } from 'react';

export interface ErrorAlertProps {
  message: string;
  title?: string;
  className?: string;
  onClose?: () => void;
  durationMs?: number;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  title,
  className = '',
  onClose,
  durationMs = 10000,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const timeout = window.setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, durationMs);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [message, durationMs, onClose]);

  if (!visible) return null;

  return (
    <div
      className={`mb-6 rounded-xl border border-purple-300/30 dark:border-purple-500/20 bg-purple-50 dark:bg-purple-950/30 p-4 backdrop-blur-sm ${className}`}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400 text-xs font-bold">
          !
        </span>
        <div className="flex-1 min-w-0">
          {title && (
            <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-0.5">{title}</p>
          )}
          <p className="text-xs font-medium text-red-700 dark:text-red-300">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorAlert;
