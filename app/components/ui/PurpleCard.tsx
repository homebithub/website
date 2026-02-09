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
  const baseClasses = 'rounded-2xl bg-white dark:bg-[#13131a] shadow-light-glow-md dark:shadow-glow-md border-2 border-purple-200 dark:border-purple-500/30 transition-colors duration-300';
  const hoverClasses = hover ? 'transition-transform duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-light-glow-lg dark:hover:shadow-glow-lg' : '';
  const glowClasses = glow ? 'glow-purple shadow-light-glow-sm dark:shadow-glow-sm' : '';
  const animateClasses = animate ? 'animate-fadeIn' : '';

  return (
    <div className={`${baseClasses} ${hoverClasses} ${glowClasses} ${animateClasses} ${className}`}>
      {children}
    </div>
  );
};

export default PurpleCard;
