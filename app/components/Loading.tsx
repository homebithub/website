import React from "react";

interface LoadingProps {
  text?: string;
  variant?: 'spinner' | 'dots' | 'pulse' | 'wave' | 'bounce' | 'ring';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  fullScreen?: boolean;
  className?: string;
}

export function Loading({ 
  text = "Loading...", 
  variant = 'spinner',
  size = 'md',
  color = 'primary',
  fullScreen = true,
  className = ""
}: LoadingProps) {

  const containerClasses = fullScreen 
    ? "flex flex-col items-center justify-center min-h-screen"
    : "flex flex-col items-center justify-center p-8";

  return (
    <div className={`${containerClasses} ${className} relative overflow-hidden bg-[#0c0614]`}>
      {/* Subtle ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/8 rounded-full blur-[120px]" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-pink-600/5 rounded-full blur-[100px] hb-drift" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <div className="mb-10">
          <span className="text-xl font-bold tracking-tight text-white/90">
            Home<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Bit</span>
          </span>
        </div>

        {/* Spinner ring */}
        <div className="relative w-16 h-16 mb-8">
          {/* Track */}
          <div className="absolute inset-0 rounded-full border-2 border-white/[0.06]" />
          {/* Animated arc */}
          <svg className="absolute inset-0 w-16 h-16 hb-spin" viewBox="0 0 64 64">
            <circle
              cx="32" cy="32" r="30"
              fill="none"
              stroke="url(#hb-grad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="60 130"
            />
            <defs>
              <linearGradient id="hb-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          {/* Inner glow dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-purple-400/80 shadow-[0_0_12px_4px_rgba(168,85,247,0.3)] hb-pulse" />
          </div>
        </div>

        {/* Status text */}
        <p className="text-xs font-medium text-white/50 tracking-wide">
          {text}
        </p>

        {/* Minimal shimmer bar */}
        <div className="mt-6 w-48 h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
          <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-purple-500/80 to-pink-500/60 hb-shimmer" />
        </div>
      </div>

      <style>{`
        @keyframes hb-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes hb-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes hb-shimmer {
          0% { transform: translateX(-200%); }
          100% { transform: translateX(500%); }
        }
        @keyframes hb-drift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -20px); }
        }
        .hb-spin { animation: hb-spin 1.2s linear infinite; }
        .hb-pulse { animation: hb-pulse 2s ease-in-out infinite; }
        .hb-shimmer { animation: hb-shimmer 2s ease-in-out infinite; }
        .hb-drift { animation: hb-drift 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

// Export individual animation components for specific use cases
export function Spinner({ size = 'md', color = 'primary', className = "" }: Omit<LoadingProps, 'variant' | 'text' | 'fullScreen'>) {
  return <Loading variant="spinner" size={size} color={color} fullScreen={false} className={className} />;
}

export function Dots({ size = 'md', color = 'primary', className = "" }: Omit<LoadingProps, 'variant' | 'text' | 'fullScreen'>) {
  return <Loading variant="dots" size={size} color={color} fullScreen={false} className={className} />;
}

export function Pulse({ size = 'md', color = 'primary', className = "" }: Omit<LoadingProps, 'variant' | 'text' | 'fullScreen'>) {
  return <Loading variant="pulse" size={size} color={color} fullScreen={false} className={className} />;
}

export function Wave({ size = 'md', color = 'primary', className = "" }: Omit<LoadingProps, 'variant' | 'text' | 'fullScreen'>) {
  return <Loading variant="wave" size={size} color={color} fullScreen={false} className={className} />;
}

export function Bounce({ size = 'md', color = 'primary', className = "" }: Omit<LoadingProps, 'variant' | 'text' | 'fullScreen'>) {
  return <Loading variant="bounce" size={size} color={color} fullScreen={false} className={className} />;
}

export function Ring({ size = 'md', color = 'primary', className = "" }: Omit<LoadingProps, 'variant' | 'text' | 'fullScreen'>) {
  return <Loading variant="ring" size={size} color={color} fullScreen={false} className={className} />;
} 