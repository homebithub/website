import React, { useState, useRef, useEffect } from 'react';
import { SunIcon, MoonIcon, ComputerDesktopIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useTheme } from '~/contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const themeOptions = [
  { value: 'system' as const, label: 'System', Icon: ComputerDesktopIcon },
  { value: 'dark' as const, label: 'Dark', Icon: MoonIcon },
  { value: 'light' as const, label: 'Light', Icon: SunIcon },
];

export default function ThemeToggle({ 
  className = '', 
  size = 'md',
  showLabel = false 
}: ThemeToggleProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Safely handle theme context - return null if not available
  let themePreference: 'system' | 'light' | 'dark' = 'system';
  let theme: 'light' | 'dark' = 'dark';
  let setThemePreference: (pref: 'system' | 'light' | 'dark') => void = () => {};

  try {
    const themeContext = useTheme();
    themePreference = themeContext.themePreference;
    theme = themeContext.theme;
    setThemePreference = themeContext.setThemePreference;
  } catch (error) {
    return null;
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = themeOptions.find(o => o.value === themePreference) || themeOptions[0];
  const CurrentIcon = current.Icon;

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const buttonPadding = {
    sm: 'px-2 py-1',
    md: 'px-2.5 py-1.5',
    lg: 'px-3 py-2',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className={`
          ${buttonPadding[size]}
          inline-flex items-center gap-1.5
          rounded-lg
          bg-purple-100 dark:bg-gray-700
          text-purple-600 dark:text-purple-400
          hover:bg-purple-200 dark:hover:bg-gray-600
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
          dark:focus:ring-offset-gray-900
        `}
        aria-label="Theme settings"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <CurrentIcon className={iconSizes[size]} />
        {showLabel && (
          <span className={`font-medium ${textSizes[size]}`}>{current.label}</span>
        )}
        <ChevronDownIcon className={`${size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1.5 w-44 origin-top-right rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="p-1" role="listbox" aria-label="Select theme">
            {themeOptions.map(({ value, label, Icon }) => {
              const isSelected = themePreference === value;
              return (
                <button
                  key={value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    setThemePreference(value);
                    setOpen(false);
                  }}
                  className={`
                    flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors
                    ${isSelected
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}
                  `}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium">{label}</span>
                  {isSelected && (
                    <svg className="ml-auto h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
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

