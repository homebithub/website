import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '~/contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function ThemeToggle({ 
  className = '', 
  size = 'md',
  showLabel = false 
}: ThemeToggleProps) {
  // Safely handle theme context - return null if not available
  let theme: 'light' | 'dark' = 'dark';
  let toggleTheme: () => void = () => {};
  
  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
    toggleTheme = themeContext.toggleTheme;
  } catch (error) {
    // ThemeProvider not available yet (SSR or hydration)
    // Return null to prevent rendering until provider is ready
    return null;
  }

  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const buttonSizes = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${buttonSizes[size]}
        rounded-full
        bg-purple-100 dark:bg-gray-700
        text-purple-600 dark:text-purple-400
        hover:bg-purple-200 dark:hover:bg-gray-600
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-900
        ${className}
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="flex items-center space-x-2">
        {theme === 'light' ? (
          <MoonIcon className={sizeClasses[size]} />
        ) : (
          <SunIcon className={sizeClasses[size]} />
        )}
        {showLabel && (
          <span className="text-sm font-medium">
            {theme === 'light' ? 'Dark' : 'Light'}
          </span>
        )}
      </div>
    </button>
  );
}

// Animated toggle switch variant
export function ThemeToggleSwitch({ className = '' }: { className?: string }) {
  // Safely handle theme context - return null if not available
  let theme: 'light' | 'dark' = 'dark';
  let toggleTheme: () => void = () => {};
  
  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
    toggleTheme = themeContext.toggleTheme;
  } catch (error) {
    // ThemeProvider not available yet (SSR or hydration)
    return null;
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex h-8 w-14 items-center rounded-full
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500
        ${theme === 'dark' ? 'bg-purple-600' : 'bg-gray-300'}
        ${className}
      `}
      role="switch"
      aria-checked={theme === 'dark'}
      aria-label="Toggle dark mode"
    >
      <span
        className={`
          inline-block h-6 w-6 transform rounded-full bg-white shadow-lg
          transition-transform duration-200 ease-in-out
          ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}
        `}
      >
        {theme === 'dark' ? (
          <MoonIcon className="h-6 w-6 p-1 text-purple-600" />
        ) : (
          <SunIcon className="h-6 w-6 p-1 text-yellow-500" />
        )}
      </span>
    </button>
  );
}

