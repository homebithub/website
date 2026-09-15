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

  // flex-1 is a default rather than something each page passes.
  //
  // Pages put this between a Navigation and a Footer inside a `min-h-screen
  // flex flex-col` column, and hang flex-1 off the <main> inside here. But main
  // is not a child of that column — this wrapper is — so unless the wrapper
  // grows, nothing claims the spare height and the footer stops where the
  // content happens to end. Short pages, and any page mid-shimmer, floated it
  // up the screen at a different place on every route.
  //
  // Most call sites already passed flex-1 by hand, which is why some pages
  // looked right and others did not. Outside a flex column the class is inert,
  // so it is safe everywhere.
  return (
    <div className={`relative flex flex-1 flex-col ${getBackgroundClass()} transition-colors duration-300 ${className}`}>
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        {children}
      </div>
    </div>
  );
};

export default PurpleThemeWrapper;
