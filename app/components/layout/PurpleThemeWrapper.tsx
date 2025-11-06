import React from 'react';
import type { ReactNode } from 'react';
import FloatingBubbles from '../ui/FloatingBubbles';

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
  bubbles = true,
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
      {/* Radial gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-purple-500/5 via-transparent to-transparent dark:from-purple-500/10 pointer-events-none" />
      
      {bubbles && <FloatingBubbles density={bubbleDensity} variant="mixed" />}
      
      {/* Animated gradient orbs for dark mode */}
      <div className="hidden dark:block absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" />
      <div className="hidden dark:block absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default PurpleThemeWrapper;
