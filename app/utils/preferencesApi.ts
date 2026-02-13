/**
 * Preferences API Client
 * 
 * Handles all interactions with the user preferences backend API
 */

import { API_BASE_URL, getAuthHeaders } from '~/config/api';
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

const PREFERENCES_ENDPOINTS = {
  get: `${API_BASE_URL}/api/v1/preferences`,
  update: `${API_BASE_URL}/api/v1/preferences`,
  migrate: `${API_BASE_URL}/api/v1/preferences/migrate`,
  delete: `${API_BASE_URL}/api/v1/preferences`,
};

/**
 * Fetch user preferences
 */
export const fetchPreferences = async (): Promise<PreferencesResponse | null> => {
  try {
    const authenticated = isAuthenticated();
    const headers = getAuthHeaders();

    let url = PREFERENCES_ENDPOINTS.get;
    
    // Add user_id for authenticated users, session_id for anonymous users
    if (authenticated) {
      const userId = getAuthenticatedUserId();
      if (userId) {
        url = `${url}?user_id=${userId}`;
      }
    } else {
      const sessionId = getOrCreateSessionId();
      url = `${url}?session_id=${sessionId}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      console.error('Failed to fetch preferences:', response.statusText);
      return null;
    }

    return await response.json();
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
    const headers = getAuthHeaders();

    const body: any = {
      settings,
    };

    // Add user_id for authenticated users, session_id for anonymous users
    if (authenticated) {
      const userId = getAuthenticatedUserId();
      if (userId) {
        body.user_id = userId;
      }
    } else {
      body.session_id = getOrCreateSessionId();
    }

    const response = await fetch(PREFERENCES_ENDPOINTS.update, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('Failed to update preferences:', response.statusText);
      return null;
    }

    return await response.json();
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
    const headers = getAuthHeaders();

    const response = await fetch(
      `${PREFERENCES_ENDPOINTS.migrate}?session_id=${sessionId}`,
      {
        method: 'POST',
        headers,
      }
    );

    if (!response.ok) {
      console.error('Failed to migrate preferences:', response.statusText);
      return false;
    }

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
    const headers = getAuthHeaders();

    let url = PREFERENCES_ENDPOINTS.delete;
    
    // Add user_id for authenticated users, session_id for anonymous users
    if (authenticated) {
      const userId = getAuthenticatedUserId();
      if (userId) {
        url = `${url}?user_id=${userId}`;
      }
    } else {
      const sessionId = getOrCreateSessionId();
      url = `${url}?session_id=${sessionId}`;
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      console.error('Failed to delete preferences:', response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting preferences:', error);
    return false;
  }
};
