/**
 * Local preferences store.
 *
 * The old auth.PreferencesService RPCs are deprecated. Keep the same small API
 * surface for existing UI code, but persist preferences locally so no
 * GetPreferences/UpdatePreferences calls are made from the frontend.
 */

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  notifications?: boolean;
  email_notifs?: boolean;
  push_notifs?: boolean;
  currency?: string;
  timezone?: string;
  compact_view?: boolean;
  show_onboarding?: boolean;
  accessibility_mode?: boolean;
  custom?: Record<string, any>;
}

export interface PreferencesResponse {
  id: string;
  user_id?: string;
  session_id?: string;
  settings: UserPreferences;
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = 'homebit_preferences';

const isBrowser = () => typeof window !== 'undefined';

const defaultPreferences = (): UserPreferences => ({
  theme: 'system',
  email_notifs: false,
  show_onboarding: false,
  compact_view: false,
  accessibility_mode: false,
});

const readStoredPreferences = (): UserPreferences => {
  if (!isBrowser()) return defaultPreferences();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPreferences();
    const parsed = JSON.parse(raw);
    return { ...defaultPreferences(), ...(parsed && typeof parsed === 'object' ? parsed : {}) };
  } catch {
    return defaultPreferences();
  }
};

const writeStoredPreferences = (settings: UserPreferences) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

const toResponse = (settings: UserPreferences): PreferencesResponse => {
  const now = new Date().toISOString();
  return {
    id: 'local-preferences',
    settings,
    created_at: now,
    updated_at: now,
  };
};

export const fetchPreferences = async (): Promise<PreferencesResponse | null> => {
  return toResponse(readStoredPreferences());
};

export const updatePreferences = async (
  settings: Partial<UserPreferences>
): Promise<PreferencesResponse | null> => {
  const next = { ...readStoredPreferences(), ...settings };
  writeStoredPreferences(next);
  return toResponse(next);
};

export const migratePreferences = async (): Promise<boolean> => {
  return true;
};

export const deletePreferences = async (): Promise<boolean> => {
  if (isBrowser()) window.localStorage.removeItem(STORAGE_KEY);
  return true;
};
