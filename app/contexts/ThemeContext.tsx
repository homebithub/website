import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router';
import { fetchPreferences, updatePreferences, migratePreferences } from '~/utils/preferencesApi';
import { getOrCreateUserId } from '~/utils/userTracking';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  migrateUserPreferences: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const location = useLocation();
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Public routes that don't need backend preferences
  const isPublicRoute = () => {
    const publicPaths = ['/signup', '/login', '/forgot-password', '/reset-password', '/verify-otp', '/verify-email'];
    return publicPaths.some(path => location.pathname.startsWith(path));
  };

  // Initialize user tracking and load preferences
  useEffect(() => {
    const initializeTheme = async () => {
      setMounted(true);

      // Initialize user tracking (generates fingerprint if needed)
      await getOrCreateUserId();

      // Skip backend preferences on public routes
      if (isPublicRoute()) {
        // Use localStorage or system preference only
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        
        if (savedTheme) {
          setThemeState(savedTheme);
          applyTheme(savedTheme);
        } else {
          // Default to dark theme for new/public users
          const defaultTheme: Theme = 'dark';
          setThemeState(defaultTheme);
          applyTheme(defaultTheme);
        }
        setIsInitialized(true);
        return;
      }

      // Try to load preferences from backend (for authenticated routes)
      const preferences = await fetchPreferences();

      if (preferences?.settings?.theme) {
        // Use backend preference
        const backendTheme = preferences.settings.theme === 'system' 
          ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : preferences.settings.theme;
        setThemeState(backendTheme);
        applyTheme(backendTheme);
      } else {
        // Fallback to localStorage or system preference
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        
        if (savedTheme) {
          setThemeState(savedTheme);
          applyTheme(savedTheme);
          // Sync to backend
          updatePreferences({ theme: savedTheme }).catch(console.error);
        } else {
          // Default to dark theme when no preference exists
          const defaultTheme: Theme = 'dark';
          setThemeState(defaultTheme);
          applyTheme(defaultTheme);
          // Save to backend
          updatePreferences({ theme: defaultTheme }).catch(console.error);
        }
      }

      setIsInitialized(true);
    };

    initializeTheme();
  }, [location.pathname]); // Re-run when route changes

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const setTheme = useCallback(async (newTheme: Theme) => {
    // Optimistic update
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);

    // Sync to backend (fire and forget) - skip on public routes
    if (isInitialized && !isPublicRoute()) {
      updatePreferences({ theme: newTheme }).catch(console.error);
    }
  }, [isInitialized, location.pathname]);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [theme, setTheme]);

  const migrateUserPreferences = useCallback(async () => {
    try {
      const success = await migratePreferences();
      if (success) {
        // Reload preferences after migration
        const preferences = await fetchPreferences();
        if (preferences?.settings?.theme) {
          const migratedTheme = preferences.settings.theme === 'system'
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : preferences.settings.theme;
          setThemeState(migratedTheme);
          applyTheme(migratedTheme);
          localStorage.setItem('theme', migratedTheme);
        }
      }
    } catch (error) {
      console.error('Failed to migrate preferences:', error);
    }
  }, []);

  // Prevent flash of incorrect theme
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, migrateUserPreferences }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

