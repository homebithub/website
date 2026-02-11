import React from 'react';

interface SuccessAlertProps {
  message: string;
  title?: string;
  className?: string;
}

export const SuccessAlert: React.FC<SuccessAlertProps> = ({
  message,
  title,
  className = '',
}) => {
  return (
    <div
      className={`mb-6 rounded-xl border border-green-300/30 dark:border-green-500/20 bg-green-50 dark:bg-green-950/30 p-4 backdrop-blur-sm ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/15 text-green-600 dark:text-green-400 text-xs font-bold">
          ✓
        </span>
        <div className="flex-1 min-w-0">
          {title && (
            <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-0.5">{title}</p>
          )}
          <p className="text-sm font-medium text-green-700 dark:text-green-300">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default SuccessAlert;
