import React from 'react';
import type { ReactNode } from 'react';
interface PurpleThemeWrapperProps {
  children: ReactNode;
  variant?: 'gradient' | 'light' | 'white';
  bubbles?: boolean;
  bubbleDensity?: 'low' | 'medium' | 'high';
  className?: string;
}

export const PurpleThemeWrapper: React.FC<PurpleThemeWrapperProps> = ({
  children,
  variant = 'gradient',
  bubbles = false,
  bubbleDensity = 'medium',
  className = '',
}) => {
  const getBackgroundClass = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-br from-purple-100 via-white to-purple-200 dark:from-[#0a0a0f] dark:via-[#13131a] dark:to-[#0a0a0f]';
      case 'light':
        return 'bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-[#0a0a0f] dark:via-[#0a0a0f] dark:to-[#13131a]';
      case 'white':
        return 'bg-white dark:bg-[#0a0a0f]';
      default:
        return 'bg-gradient-to-br from-purple-100 via-white to-purple-200 dark:from-[#0a0a0f] dark:via-[#13131a] dark:to-[#0a0a0f]';
    }
  };

  return (
    <div className={`relative ${getBackgroundClass()} transition-colors duration-300 ${className}`}>
      <div className="relative z-10 h-full min-h-0 flex flex-col">
        {children}
      </div>
    </div>
  );
};

export default PurpleThemeWrapper;
