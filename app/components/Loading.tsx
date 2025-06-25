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
    primary: 'border-primary-500 text-primary-500 bg-primary-500',
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
    ? "flex flex-col items-center justify-center min-h-screen bg-white dark:bg-slate-900"
    : "flex flex-col items-center justify-center p-8";

  return (
    <div className={`${containerClasses} ${className}`}>
      {/* Animated background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-full opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main loading content */}
      <div className="relative z-10 flex flex-col items-center space-y-6">
        {/* Logo or icon */}
        <div className="mb-4">
          <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
            HomeXpert
          </div>
        </div>

        {/* Animation */}
        <div className="flex items-center justify-center">
          {getAnimationComponent()}
        </div>

        {/* Loading text */}
        <div className="text-center">
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
            {text}
          </p>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-1 h-1 bg-slate-400 dark:bg-slate-500 rounded-full animate-pulse" />
            <div className="w-1 h-1 bg-slate-400 dark:bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-1 h-1 bg-slate-400 dark:bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-48 bg-slate-200 dark:bg-slate-700 rounded-full h-1 overflow-hidden">
          <div 
            className={`h-full ${colorClasses[color].split(' ')[2]} rounded-full animate-pulse`}
            style={{ 
              width: '60%',
              animationDuration: '2s'
            }}
          />
        </div>
      </div>

      {/* Floating elements */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary-300 dark:bg-primary-600 rounded-full animate-bounce opacity-60" />
      <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-primary-200 dark:bg-primary-700 rounded-full animate-bounce opacity-40" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-primary-400 dark:bg-primary-500 rounded-full animate-bounce opacity-50" style={{ animationDelay: '1s' }} />
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