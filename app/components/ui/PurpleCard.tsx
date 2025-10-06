import React, { type ReactNode } from 'react';

interface PurpleCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  animate?: boolean;
}

export const PurpleCard: React.FC<PurpleCardProps> = ({
  children,
  className = '',
  hover = true,
  glow = false,
  animate = true,
}) => {
  const baseClasses = 'rounded-2xl bg-white/90 backdrop-blur-md shadow-lg border-2 border-purple-200';
  const hoverClasses = hover ? 'transition-transform duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-xl' : '';
  const glowClasses = glow ? 'glow-purple' : '';
  const animateClasses = animate ? 'animate-fadeIn' : '';

  return (
    <div className={`${baseClasses} ${hoverClasses} ${glowClasses} ${animateClasses} ${className}`}>
      {children}
    </div>
  );
};

export default PurpleCard;
