import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchPreferences,
  updatePreferences,
  migratePreferences,
  deletePreferences,
} from '../preferencesApi';

// Mock dependencies
vi.mock('~/config/api', () => ({
  API_BASE_URL: 'https://api.test.com',
  getAuthHeaders: vi.fn(() => ({
    'Content-Type': 'application/json',
    Authorization: 'Bearer test-token',
  })),
}));

vi.mock('../userTracking', () => ({
  getOrCreateSessionId: vi.fn(() => 'session-123'),
  isAuthenticated: vi.fn(() => false),
  getAuthenticatedUserId: vi.fn(() => null),
}));

import { getOrCreateSessionId, isAuthenticated, getAuthenticatedUserId } from '../userTracking';

describe('preferencesApi', () => {
  let mockFetch: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    // Mock fetch
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Mock console.error to suppress error logs in tests
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchPreferences', () => {
    describe('Authenticated Users', () => {
      beforeEach(() => {
        vi.mocked(isAuthenticated).mockReturnValue(true);
        vi.mocked(getAuthenticatedUserId).mockReturnValue('user-456');
      });

      it('fetches preferences for authenticated user', async () => {
        const mockPreferences = {
          id: 'pref-123',
          user_id: 'user-456',
          settings: {
            theme: 'dark',
            language: 'en',
            notifications: true,
          },
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-02-01T00:00:00Z',
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => mockPreferences,
        });

        const result = await fetchPreferences();

        expect(result).toEqual(mockPreferences);
        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.test.com/api/v1/preferences?user_id=user-456',
          expect.objectContaining({
            method: 'GET',
          })
        );
      });

      it('returns null when preferences not found (404)', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 404,
        });

        const result = await fetchPreferences();

        expect(result).toBeNull();
      });

      it('returns null on other errors', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        });

        const result = await fetchPreferences();

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to fetch preferences:',
          'Internal Server Error'
        );
      });

      it('handles missing user ID gracefully', async () => {
        vi.mocked(getAuthenticatedUserId).mockReturnValue(null);
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({ id: 'pref-123', settings: {} }),
        });

        await fetchPreferences();

        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.test.com/api/v1/preferences',
          expect.any(Object)
        );
      });
    });

    describe('Anonymous Users', () => {
      beforeEach(() => {
        vi.mocked(isAuthenticated).mockReturnValue(false);
        vi.mocked(getOrCreateSessionId).mockReturnValue('session-789');
      });

      it('fetches preferences for anonymous user with session ID', async () => {
        const mockPreferences = {
          id: 'pref-456',
          session_id: 'session-789',
          settings: {
            theme: 'light',
            language: 'en',
          },
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-02-01T00:00:00Z',
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => mockPreferences,
        });

        const result = await fetchPreferences();

        expect(result).toEqual(mockPreferences);
        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.test.com/api/v1/preferences?session_id=session-789',
          expect.any(Object)
        );
      });

      it('returns null when preferences not found', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 404,
        });

        const result = await fetchPreferences();

        expect(result).toBeNull();
      });
    });

    describe('Error Handling', () => {
      it('handles network errors', async () => {
        mockFetch.mockRejectedValue(new Error('Network error'));

        const result = await fetchPreferences();

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error fetching preferences:',
          expect.any(Error)
        );
      });

      it('handles JSON parsing errors', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => {
            throw new Error('Invalid JSON');
          },
        });

        const result = await fetchPreferences();

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
    });
  });

  describe('updatePreferences', () => {
    describe('Authenticated Users', () => {
      beforeEach(() => {
        vi.mocked(isAuthenticated).mockReturnValue(true);
        vi.mocked(getAuthenticatedUserId).mockReturnValue('user-456');
      });

      it('updates preferences for authenticated user', async () => {
        const mockResponse = {
          id: 'pref-123',
          user_id: 'user-456',
          settings: {
            theme: 'dark',
            notifications: false,
          },
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-02-27T00:00:00Z',
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => mockResponse,
        });

        const settings = { theme: 'dark' as const, notifications: false };
        const result = await updatePreferences(settings);

        expect(result).toEqual(mockResponse);
        
        const callArgs = mockFetch.mock.calls[0];
        const parsedBody = JSON.parse(callArgs[1].body);
        
        expect(parsedBody).toEqual({
          user_id: 'user-456',
          settings,
        });
        expect(callArgs[0]).toBe('https://api.test.com/api/v1/preferences');
        expect(callArgs[1].method).toBe('PUT');
      });

      it('updates partial preferences', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({ id: 'pref-123', settings: {} }),
        });

        await updatePreferences({ language: 'es' });

        const callArgs = mockFetch.mock.calls[0];
        const parsedBody = JSON.parse(callArgs[1].body);
        
        expect(parsedBody).toEqual({
          user_id: 'user-456',
          settings: { language: 'es' },
        });
      });

      it('updates custom preferences', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({ id: 'pref-123', settings: {} }),
        });

        await updatePreferences({
          custom: { sidebar_collapsed: true, favorite_color: 'blue' },
        });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: expect.stringContaining('sidebar_collapsed'),
          })
        );
      });

      it('returns null on update failure', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
        });

        const result = await updatePreferences({ theme: 'dark' });

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to update preferences:',
          'Bad Request'
        );
      });

      it('handles missing user ID gracefully', async () => {
        vi.mocked(getAuthenticatedUserId).mockReturnValue(null);
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({ id: 'pref-123', settings: {} }),
        });

        await updatePreferences({ theme: 'dark' });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: JSON.stringify({
              settings: { theme: 'dark' },
            }),
          })
        );
      });
    });

    describe('Anonymous Users', () => {
      beforeEach(() => {
        vi.mocked(isAuthenticated).mockReturnValue(false);
        vi.mocked(getOrCreateSessionId).mockReturnValue('session-789');
      });

      it('updates preferences for anonymous user with session ID', async () => {
        const mockResponse = {
          id: 'pref-456',
          session_id: 'session-789',
          settings: {
            theme: 'light',
          },
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-02-27T00:00:00Z',
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await updatePreferences({ theme: 'light' });

        expect(result).toEqual(mockResponse);
        
        const callArgs = mockFetch.mock.calls[0];
        const parsedBody = JSON.parse(callArgs[1].body);
        
        expect(parsedBody).toEqual({
          session_id: 'session-789',
          settings: { theme: 'light' },
        });
        expect(callArgs[0]).toBe('https://api.test.com/api/v1/preferences');
      });

      it('returns null on update failure', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 500,
          statusText: 'Server Error',
        });

        const result = await updatePreferences({ theme: 'dark' });

        expect(result).toBeNull();
      });
    });

    describe('Error Handling', () => {
      it('handles network errors', async () => {
        mockFetch.mockRejectedValue(new Error('Network error'));

        const result = await updatePreferences({ theme: 'dark' });

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error updating preferences:',
          expect.any(Error)
        );
      });

      it('handles JSON parsing errors', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => {
            throw new Error('Invalid JSON');
          },
        });

        const result = await updatePreferences({ theme: 'dark' });

        expect(result).toBeNull();
      });
    });
  });

  describe('migratePreferences', () => {
    beforeEach(() => {
      vi.mocked(getOrCreateSessionId).mockReturnValue('session-abc');
    });

    it('migrates preferences successfully', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await migratePreferences();

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/v1/preferences/migrate?session_id=session-abc',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('returns false on migration failure', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Session not found',
      });

      const result = await migratePreferences();

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to migrate preferences:',
        'Session not found'
      );
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await migratePreferences();

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error migrating preferences:',
        expect.any(Error)
      );
    });

    it('uses correct session ID', async () => {
      vi.mocked(getOrCreateSessionId).mockReturnValue('custom-session-xyz');
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await migratePreferences();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('session_id=custom-session-xyz'),
        expect.any(Object)
      );
    });
  });

  describe('deletePreferences', () => {
    describe('Authenticated Users', () => {
      beforeEach(() => {
        vi.mocked(isAuthenticated).mockReturnValue(true);
        vi.mocked(getAuthenticatedUserId).mockReturnValue('user-456');
      });

      it('deletes preferences for authenticated user', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({}),
        });

        const result = await deletePreferences();

        expect(result).toBe(true);
        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.test.com/api/v1/preferences?user_id=user-456',
          expect.objectContaining({
            method: 'DELETE',
          })
        );
      });

      it('returns false on deletion failure', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 403,
          statusText: 'Forbidden',
        });

        const result = await deletePreferences();

        expect(result).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to delete preferences:',
          'Forbidden'
        );
      });

      it('handles missing user ID gracefully', async () => {
        vi.mocked(getAuthenticatedUserId).mockReturnValue(null);
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({}),
        });

        await deletePreferences();

        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.test.com/api/v1/preferences',
          expect.any(Object)
        );
      });
    });

    describe('Anonymous Users', () => {
      beforeEach(() => {
        vi.mocked(isAuthenticated).mockReturnValue(false);
        vi.mocked(getOrCreateSessionId).mockReturnValue('session-789');
      });

      it('deletes preferences for anonymous user with session ID', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({}),
        });

        const result = await deletePreferences();

        expect(result).toBe(true);
        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.test.com/api/v1/preferences?session_id=session-789',
          expect.objectContaining({
            method: 'DELETE',
          })
        );
      });

      it('returns false on deletion failure', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        });

        const result = await deletePreferences();

        expect(result).toBe(false);
      });
    });

    describe('Error Handling', () => {
      it('handles network errors', async () => {
        mockFetch.mockRejectedValue(new Error('Network error'));

        const result = await deletePreferences();

        expect(result).toBe(false);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error deleting preferences:',
          expect.any(Error)
        );
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('handles anonymous to authenticated flow', async () => {
      // Start as anonymous
      vi.mocked(isAuthenticated).mockReturnValue(false);
      vi.mocked(getOrCreateSessionId).mockReturnValue('session-xyz');

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'pref-1', settings: { theme: 'dark' } }),
      });

      // Update preferences as anonymous
      await updatePreferences({ theme: 'dark' });

      expect(mockFetch).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('session-xyz'),
        })
      );

      // User logs in
      vi.mocked(isAuthenticated).mockReturnValue(true);
      vi.mocked(getAuthenticatedUserId).mockReturnValue('user-123');

      // Migrate preferences
      mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });
      const migrated = await migratePreferences();

      expect(migrated).toBe(true);

      // Fetch as authenticated user
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'pref-2', user_id: 'user-123', settings: {} }),
      });

      await fetchPreferences();

      expect(mockFetch).toHaveBeenLastCalledWith(
        expect.stringContaining('user_id=user-123'),
        expect.any(Object)
      );
    });

    it('handles all preference types', async () => {
      vi.mocked(isAuthenticated).mockReturnValue(true);
      vi.mocked(getAuthenticatedUserId).mockReturnValue('user-456');

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'pref-123', settings: {} }),
      });

      const allSettings = {
        theme: 'dark' as const,
        language: 'en',
        notifications: true,
        email_notifs: false,
        push_notifs: true,
        currency: 'USD',
        timezone: 'America/New_York',
        compact_view: false,
        show_onboarding: true,
        accessibility_mode: false,
        custom: { key1: 'value1', key2: 123 },
      };

      await updatePreferences(allSettings);

      const callArgs = mockFetch.mock.calls[0];
      const bodyString = callArgs[1].body;
      const parsedBody = JSON.parse(bodyString);

      expect(parsedBody).toEqual({
        user_id: 'user-456',
        settings: allSettings,
      });
    });
  });
});
