import React, { type ReactNode } from 'react';
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
        return 'bg-gradient-to-br from-purple-100 via-white to-purple-200';
      case 'light':
        return 'bg-gradient-to-br from-purple-50 via-white to-purple-100';
      case 'white':
        return 'bg-white';
      default:
        return 'bg-gradient-to-br from-purple-100 via-white to-purple-200';
    }
  };

  return (
    <div className={`relative ${getBackgroundClass()} ${className}`}>
      {bubbles && <FloatingBubbles density={bubbleDensity} variant="mixed" />}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default PurpleThemeWrapper;
