import { preferencesService } from '~/services/grpc/authServices';
import { getStoredUserId } from '~/utils/authStorage';

/**
 * Application preferences use auth.PreferencesService for signed-in users.
 * The local copy remains an immediate cache and anonymous fallback.
 * Delivery-channel preferences live separately in Notifications.
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
  const cached = readStoredPreferences();
  const userId = getStoredUserId();
  if (!userId) return toResponse(cached);

  const remote = await preferencesService.getPreferences(userId);
  const settings = {
    ...cached,
    ...(remote?.preferences || remote?.data || {}),
  };
  writeStoredPreferences(settings);
  return {
    ...toResponse(settings),
    id: remote?.id || 'user-preferences',
    user_id: userId,
  };
};

export const updatePreferences = async (
  settings: Partial<UserPreferences>
): Promise<PreferencesResponse | null> => {
  const next = { ...readStoredPreferences(), ...settings };
  writeStoredPreferences(next);
  const userId = getStoredUserId();
  if (!userId) return toResponse(next);

  const remote = await preferencesService.updatePreferences(userId, settings);
  const saved = {
    ...next,
    ...(remote?.preferences || remote?.data || {}),
  };
  writeStoredPreferences(saved);
  return {
    ...toResponse(saved),
    id: remote?.id || 'user-preferences',
    user_id: userId,
  };
};

export const migratePreferences = async (): Promise<boolean> => {
  const userId = getStoredUserId();
  if (!userId || !isBrowser()) return false;
  const sessionId = window.localStorage.getItem('homebit_session_id');
  if (!sessionId) return true;
  await preferencesService.migrateAnonymousToUser(userId, sessionId);
  return true;
};

export const deletePreferences = async (): Promise<boolean> => {
  const userId = getStoredUserId();
  if (userId) await preferencesService.deletePreferences(userId);
  if (isBrowser()) window.localStorage.removeItem(STORAGE_KEY);
  return true;
};
