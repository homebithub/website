/**
 * Preferences API Client
 * 
 * Handles all interactions with the user preferences backend API
 */

import { preferencesService } from '~/services/grpc/authServices';
import { getOrCreateSessionId, isAuthenticated, getAuthenticatedUserId } from './userTracking';

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

/**
 * Fetch user preferences
 */
export const fetchPreferences = async (): Promise<PreferencesResponse | null> => {
  try {
    const authenticated = isAuthenticated();
    const userId = authenticated ? (getAuthenticatedUserId() || '') : '';
    const sessionId = authenticated ? undefined : getOrCreateSessionId();

    const data = await preferencesService.getPreferences(userId, sessionId);
    return data;
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return null;
  }
};

/**
 * Update user preferences
 */
export const updatePreferences = async (
  settings: Partial<UserPreferences>
): Promise<PreferencesResponse | null> => {
  try {
    const authenticated = isAuthenticated();
    const userId = authenticated ? (getAuthenticatedUserId() || '') : '';
    const sessionId = authenticated ? undefined : getOrCreateSessionId();

    const data = await preferencesService.updatePreferences(userId, {
      settings,
      ...(sessionId ? { session_id: sessionId } : {}),
    });
    return data;
  } catch (error) {
    console.error('Error updating preferences:', error);
    return null;
  }
};

/**
 * Migrate anonymous preferences to authenticated user
 * Call this after successful login/signup
 */
export const migratePreferences = async (): Promise<boolean> => {
  try {
    const sessionId = getOrCreateSessionId();
    const userId = getAuthenticatedUserId() || '';
    await preferencesService.migrateAnonymousToUser(userId, sessionId);
    return true;
  } catch (error) {
    console.error('Error migrating preferences:', error);
    return false;
  }
};

/**
 * Delete user preferences
 */
export const deletePreferences = async (): Promise<boolean> => {
  try {
    const authenticated = isAuthenticated();
    const userId = authenticated ? (getAuthenticatedUserId() || '') : '';
    const sessionId = authenticated ? undefined : getOrCreateSessionId();
    await preferencesService.deletePreferences(userId, sessionId);
    return true;
  } catch (error) {
    console.error('Error deleting preferences:', error);
    return false;
  }
};
