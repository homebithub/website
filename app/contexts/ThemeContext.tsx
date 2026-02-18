import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router';
import { fetchPreferences, updatePreferences, migratePreferences } from '~/utils/preferencesApi';
import { getOrCreateUserId, isAuthenticated } from '~/utils/userTracking';

type Theme = 'light' | 'dark';
type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  themePreference: ThemePreference;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setThemePreference: (preference: ThemePreference) => void;
  migrateUserPreferences: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

// Resolve the actual theme from a preference value
const getSystemTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const resolveTheme = (preference: ThemePreference): Theme => {
  if (preference === 'system') return getSystemTheme();
  return preference;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const location = useLocation();
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');
  const [theme, setThemeState] = useState<Theme>(() => resolveTheme('system'));
  const [mounted, setMounted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Public routes that don't need backend preferences
  const isPublicRoute = () => {
    const publicPaths = ['/signup', '/login', '/forgot-password', '/reset-password', '/verify-otp', '/verify-email'];
    return publicPaths.some(path => location.pathname.startsWith(path));
  };

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  // Listen for system theme changes when preference is 'system'
  useEffect(() => {
    if (themePreference !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const resolved = e.matches ? 'dark' : 'light';
      setThemeState(resolved);
      applyTheme(resolved);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themePreference]);

  // Initialize user tracking and load preferences
  useEffect(() => {
    const initializeTheme = async () => {
      setMounted(true);

      // Initialize user tracking (generates fingerprint if needed)
      await getOrCreateUserId();

      // Skip backend preferences on public routes or if not authenticated
      if (isPublicRoute() || !isAuthenticated()) {
        // Use localStorage preference or default to system
        const savedPref = localStorage.getItem('themePreference') as ThemePreference | null;
        const preference = savedPref || 'system';
        const resolved = resolveTheme(preference);

        setThemePreferenceState(preference);
        setThemeState(resolved);
        applyTheme(resolved);
        setIsInitialized(true);
        return;
      }

      // Try to load preferences from backend (only for authenticated users)
      const preferences = await fetchPreferences();

      if (preferences?.settings?.theme) {
        const backendPref = preferences.settings.theme as ThemePreference;
        // Treat any value not in our set as 'system'
        const preference: ThemePreference = ['system', 'light', 'dark'].includes(backendPref) ? backendPref : 'system';
        const resolved = resolveTheme(preference);

        setThemePreferenceState(preference);
        setThemeState(resolved);
        applyTheme(resolved);
      } else {
        // Fallback to localStorage or default to system
        const savedPref = localStorage.getItem('themePreference') as ThemePreference | null;
        const preference = savedPref || 'system';
        const resolved = resolveTheme(preference);

        setThemePreferenceState(preference);
        setThemeState(resolved);
        applyTheme(resolved);
        // Sync to backend
        updatePreferences({ theme: preference }).catch(console.error);
      }

      setIsInitialized(true);
    };

    initializeTheme();
  }, [location.pathname]); // Re-run when route changes

  const setThemePreference = useCallback((preference: ThemePreference) => {
    const resolved = resolveTheme(preference);

    setThemePreferenceState(preference);
    setThemeState(resolved);
    localStorage.setItem('themePreference', preference);
    applyTheme(resolved);

    // Sync to backend (fire and forget) - only if authenticated
    if (isInitialized && !isPublicRoute() && isAuthenticated()) {
      updatePreferences({ theme: preference }).catch(console.error);
    }
  }, [isInitialized, location.pathname]);

  const setTheme = useCallback((newTheme: Theme) => {
    // Setting an explicit theme switches preference away from system
    setThemePreference(newTheme);
  }, [setThemePreference]);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemePreference(newTheme);
  }, [theme, setThemePreference]);

  const migrateUserPreferences = useCallback(async () => {
    try {
      const success = await migratePreferences();
      if (success) {
        // Reload preferences after migration
        const preferences = await fetchPreferences();
        if (preferences?.settings?.theme) {
          const backendPref = preferences.settings.theme as ThemePreference;
          const preference: ThemePreference = ['system', 'light', 'dark'].includes(backendPref) ? backendPref : 'system';
          const resolved = resolveTheme(preference);

          setThemePreferenceState(preference);
          setThemeState(resolved);
          applyTheme(resolved);
          localStorage.setItem('themePreference', preference);
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
    <ThemeContext.Provider value={{ theme, themePreference, toggleTheme, setTheme, setThemePreference, migrateUserPreferences }}>
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

