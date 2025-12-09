import React, { useMemo } from 'react';

interface FloatingBubblesProps {
  variant?: 'light' | 'dark' | 'mixed';
  density?: 'low' | 'medium' | 'high';
}

export const FloatingBubbles: React.FC<FloatingBubblesProps> = ({ 
  variant = 'mixed',
  density = 'medium' 
}) => {
  const bubbleCount = density === 'low' ? 2 : density === 'medium' ? 4 : 6;
  
  const getBubbleColor = (index: number) => {
    if (variant === 'light') return '#e9d5ff'; // purple-200
    if (variant === 'dark') return '#a855f7'; // purple-500
    // Mixed: alternate between light and dark
    return index % 2 === 0 ? '#c084fc' : '#a855f7'; // purple-400 and purple-500
  };

  const bubbles = useMemo(() => {
    return Array.from({ length: bubbleCount }, (_, i) => ({
      id: i,
      size: Math.random() * 200 + 100, // 100-300px
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 2000,
      duration: Math.random() * 3000 + 4000, // 4-7s
      shape: i % 3 === 0 ? 'circle' : i % 3 === 1 ? 'ellipse' : 'rounded-rect',
      color: getBubbleColor(i),
    }));
  }, [bubbleCount, variant]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((bubble) => (
        <svg
          key={bubble.id}
          className="absolute opacity-10 animate-float"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            top: `${bubble.top}%`,
            left: `${bubble.left}%`,
            animationDelay: `${bubble.delay}ms`,
            animationDuration: `${bubble.duration}ms`,
          }}
          viewBox="0 0 200 200"
          fill="none"
        >
          {bubble.shape === 'circle' && (
            <circle cx="100" cy="100" r="100" fill={getBubbleColor(bubble.id)} />
          )}
          {bubble.shape === 'ellipse' && (
            <ellipse cx="100" cy="100" rx="100" ry="80" fill={getBubbleColor(bubble.id)} />
          )}
          {bubble.shape === 'rounded-rect' && (
            <rect width="200" height="200" rx="70" fill={getBubbleColor(bubble.id)} />
          )}
        </svg>
      ))}
    </div>
  );
};

export default FloatingBubbles;
