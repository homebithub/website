import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router';
import { fetchPreferences, updatePreferences, migratePreferences } from '~/utils/preferencesApi';
import { getStoredUserId } from '~/utils/authStorage';
import { normalizeAppearance, type Appearance, type ThemeCollection, type ThemePreference } from '~/utils/appearance';

type Theme = 'light' | 'dark';
type SyncStatus = 'local' | 'saving' | 'saved' | 'error';
interface ThemeContextType {
  theme: Theme;
  themePreference: ThemePreference;
  themeCollection: ThemeCollection;
  appearanceSyncStatus: SyncStatus;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setThemePreference: (preference: ThemePreference) => void;
  setThemeCollection: (collection: ThemeCollection) => void;
  retryAppearanceSync: () => void;
  migrateUserPreferences: () => Promise<void>;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const resolveTheme = (preference: ThemePreference): Theme => preference === 'system'
  ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : preference;

export function ThemeProvider({ children, persistToAccount = true }: { children: React.ReactNode; persistToAccount?: boolean }) {
  const location = useLocation();
  const [appearance, setAppearance] = useState<Appearance>(normalizeAppearance());
  const [theme, setThemeState] = useState<Theme>('dark');
  const [appearanceSyncStatus, setSyncStatus] = useState<SyncStatus>('local');
  const current = useRef(appearance);
  const revision = useRef(0);
  const pending = useRef(0);
  const writes = useRef<Promise<unknown>>(Promise.resolve());
  const alive = useRef(true);

  const apply = useCallback((next: Appearance) => {
    current.current = next;
    setAppearance(next);
    const resolved = resolveTheme(next.theme);
    setThemeState(resolved);
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    document.documentElement.dataset.themeCollection = next.theme_collection;
    try {
      localStorage.setItem('themePreference', next.theme);
      localStorage.setItem('themeCollection', next.theme_collection);
    } catch { /* Account preference still works when browser storage is blocked. */ }
  }, []);

  const refresh = useCallback(async () => {
    if (!persistToAccount || pending.current) return;
    const userId = getStoredUserId();
    if (!userId) return;
    const started = ++revision.current;
    try {
      const response = await fetchPreferences();
      if (!alive.current || started !== revision.current || userId !== getStoredUserId()) return;
      apply(normalizeAppearance(response?.settings));
      setSyncStatus('saved');
    } catch {
      if (alive.current && started === revision.current) setSyncStatus('error');
    }
  }, [apply, persistToAccount]);

  useEffect(() => {
    alive.current = true;
    try {
      apply(normalizeAppearance({
        theme: localStorage.getItem('themePreference') as ThemePreference,
        theme_collection: localStorage.getItem('themeCollection') as ThemeCollection,
      }));
    } catch { apply(normalizeAppearance()); }
    return () => { alive.current = false; revision.current++; };
  }, [apply]);

  // Account settings win on sign-in/navigation and when returning from another device.
  useEffect(() => { void refresh(); }, [location.pathname, refresh]);
  useEffect(() => {
    const onFocus = () => { void refresh(); };
    const onVisible = () => { if (document.visibilityState === 'visible') void refresh(); };
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'themePreference' || event.key === 'themeCollection') {
        apply(normalizeAppearance({ theme: localStorage.getItem('themePreference') as ThemePreference,
          theme_collection: localStorage.getItem('themeCollection') as ThemeCollection }));
      }
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('storage', onStorage);
    };
  }, [apply, refresh]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => { if (current.current.theme === 'system') apply(current.current); };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [apply]);

  const save = useCallback((patch: Partial<Appearance>) => {
    const next = normalizeAppearance({ ...current.current, ...patch });
    apply(next);
    const userId = getStoredUserId();
    const started = ++revision.current;
    if (!persistToAccount || !userId) { setSyncStatus('local'); return; }
    setSyncStatus('saving');
    pending.current++;
    // Serialize writes so rapidly changing collection/mode cannot save out of order.
    writes.current = writes.current.catch(() => {}).then(async () => {
      try {
        if (getStoredUserId() !== userId) return;
        await updatePreferences(next);
        if (alive.current && started === revision.current) setSyncStatus('saved');
      } catch {
        if (alive.current && started === revision.current) setSyncStatus('error');
      } finally { pending.current--; }
    });
  }, [apply, persistToAccount]);
  const setThemePreference = useCallback((value: ThemePreference) => save({ theme: value }), [save]);
  const setThemeCollection = useCallback((value: ThemeCollection) => save({ theme_collection: value }), [save]);
  const toggleTheme = useCallback(() => setThemePreference(theme === 'dark' ? 'light' : 'dark'), [theme, setThemePreference]);
  const retryAppearanceSync = useCallback(() => save(current.current), [save]);
  const migrateUserPreferences = useCallback(async () => { await migratePreferences(); await refresh(); }, [refresh]);

  return <ThemeContext.Provider value={{ theme, themePreference: appearance.theme,
    themeCollection: appearance.theme_collection, appearanceSyncStatus, setThemeCollection,
    toggleTheme, setTheme: setThemePreference, setThemePreference, retryAppearanceSync, migrateUserPreferences }}>
    {children}
  </ThemeContext.Provider>;
}
export const useTheme = () => {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used within a ThemeProvider');
  return value;
};
