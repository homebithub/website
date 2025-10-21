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
  
  // Size classes
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };

  // Color classes
  const colorClasses = {
    primary: 'border-purple-500 text-purple-500 bg-purple-500',
    secondary: 'border-slate-500 text-slate-500 bg-slate-500',
    success: 'border-green-500 text-green-500 bg-green-500',
    warning: 'border-yellow-500 text-yellow-500 bg-yellow-500',
    error: 'border-red-500 text-red-500 bg-red-500'
  };

  // Animation components
  const Spinner = () => (
    <div className={`animate-spin rounded-full border-2 border-gray-200 dark:border-slate-700 ${sizeClasses[size]}`}>
      <div className={`rounded-full border-2 border-t-transparent ${colorClasses[color].split(' ')[0]} ${sizeClasses[size]}`} />
    </div>
  );

  const Dots = () => (
    <div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${colorClasses[color].split(' ')[2]} rounded-full animate-bounce`}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '1s'
          }}
        >
          <div className={`${sizeClasses[size]} rounded-full bg-current opacity-75`} />
        </div>
      ))}
    </div>
  );

  const Pulse = () => (
    <div className={`${colorClasses[color].split(' ')[2]} rounded-full animate-pulse ${sizeClasses[size]}`} />
  );

  const Wave = () => (
    <div className="flex space-x-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`${colorClasses[color].split(' ')[2]} rounded-full animate-pulse`}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: '1.2s'
          }}
        >
          <div className="h-3 w-1 bg-current opacity-75" />
        </div>
      ))}
    </div>
  );

  const Bounce = () => (
    <div className={`${colorClasses[color].split(' ')[2]} rounded-full animate-bounce ${sizeClasses[size]}`} />
  );

  const Ring = () => (
    <div className="relative">
      <div className={`${colorClasses[color].split(' ')[2]} rounded-full animate-ping ${sizeClasses[size]} opacity-75`} />
      <div className={`${colorClasses[color].split(' ')[2]} rounded-full ${sizeClasses[size]} absolute top-0 left-0`} />
    </div>
  );

  // Get the appropriate animation component
  const getAnimationComponent = () => {
    switch (variant) {
      case 'dots':
        return <Dots />;
      case 'pulse':
        return <Pulse />;
      case 'wave':
        return <Wave />;
      case 'bounce':
        return <Bounce />;
      case 'ring':
        return <Ring />;
      default:
        return <Spinner />;
    }
  };

  const containerClasses = fullScreen 
    ? "flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-[#0a0a0f] dark:via-[#13131a] dark:to-[#0a0a0f]"
    : "flex flex-col items-center justify-center p-8";

  return (
    <div className={`${containerClasses} ${className} relative overflow-hidden`}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-[#0a0a0f] dark:via-[#1a0a1f] dark:to-[#0a0a0f] animate-gradient-shift" />
      
      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-300/10 to-pink-300/10 rounded-full blur-3xl animate-pulse" />
      </div>

      {/* Sparkles */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 dark:bg-purple-300 rounded-full animate-ping" />
      <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-pink-400 dark:bg-pink-300 rounded-full animate-ping" style={{ animationDelay: '0.3s' }} />
      <div className="absolute bottom-1/3 left-1/2 w-2 h-2 bg-purple-300 dark:bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.6s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-1.5 h-1.5 bg-pink-300 dark:bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '0.9s' }} />

      {/* Main loading content */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Logo with glow effect */}
        <div className="mb-4 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 blur-2xl opacity-50 animate-pulse" />
          <div className="relative text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
            HomeBit
          </div>
        </div>

        {/* Modern spinner with orbiting dots */}
        <div className="relative w-24 h-24">
          {/* Center pulse */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" />
          </div>
          
          {/* Orbiting dots */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="absolute inset-0 animate-spin"
              style={{ 
                animationDuration: '2s',
                animationDelay: `${i * 0.2}s`
              }}
            >
              <div 
                className="absolute top-0 left-1/2 w-3 h-3 -ml-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg shadow-purple-500/50"
                style={{
                  transform: `rotate(${i * 90}deg) translateY(-40px)`
                }}
              />
            </div>
          ))}
          
          {/* Outer ring */}
          <div className="absolute inset-0 border-2 border-purple-200 dark:border-purple-800 rounded-full animate-pulse" />
        </div>

        {/* Loading text with animated gradient */}
        <div className="text-center space-y-3">
          <p className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {text}
          </p>
          
          {/* Animated dots */}
          <div className="flex items-center justify-center space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>

        {/* Progress bar with gradient */}
        <div className="w-64 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full animate-progress bg-[length:200%_100%]" />
        </div>
      </div>

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-purple-400 dark:bg-purple-300 rounded-full animate-float-particle opacity-60"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        />
      ))}
      
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(20px) translateX(-10px); }
        }
        @keyframes float-particle {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0; }
          50% { transform: translateY(-100px) translateX(50px); opacity: 1; }
        }
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 8s ease infinite;
        }
        .animate-gradient-x {
          background-size: 200% 100%;
          animation: gradient-x 3s ease infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-float-particle {
          animation: float-particle 4s ease-in-out infinite;
        }
        .animate-progress {
          animation: progress 1.5s ease-in-out infinite;
        }
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