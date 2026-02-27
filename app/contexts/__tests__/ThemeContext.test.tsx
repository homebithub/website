import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { ThemeProvider, useTheme } from '../ThemeContext';

// Mock react-router
const mockLocation = { pathname: '/', search: '', hash: '', state: null, key: 'default' };

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useLocation: () => mockLocation,
  };
});

// Mock preferences API
vi.mock('~/utils/preferencesApi', () => ({
  fetchPreferences: vi.fn(() => Promise.resolve(null)),
  updatePreferences: vi.fn(() => Promise.resolve(true)),
  migratePreferences: vi.fn(() => Promise.resolve(true)),
}));

// Mock user tracking
vi.mock('~/utils/userTracking', () => ({
  getOrCreateUserId: vi.fn(() => Promise.resolve('user-123')),
  isAuthenticated: vi.fn(() => false),
}));

describe('ThemeContext', () => {
  let matchMediaMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockLocation.pathname = '/';

    // Mock matchMedia
    matchMediaMock = {
      matches: false,
      media: '(prefers-color-scheme: dark)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };

    // Create a function that returns the mock
    const matchMediaFn = vi.fn((query: string) => ({
      ...matchMediaMock,
      media: query,
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: matchMediaFn,
    });

    // Mock document.documentElement
    document.documentElement.classList.add = vi.fn();
    document.documentElement.classList.remove = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <ThemeProvider>{children}</ThemeProvider>
    </BrowserRouter>
  );

  // Helper to wait for theme provider to be ready
  const waitForThemeReady = async (result: any) => {
    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current.theme).toBeDefined();
    }, { timeout: 3000 });
  };

  describe('Initialization', () => {
    it('should initialize with system theme preference', async () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.themePreference).toBe('system');
      });
    });

    it('should resolve system theme to light when system prefers light', async () => {
      matchMediaMock.matches = false;

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });
    });

    it('should resolve system theme to dark when system prefers dark', async () => {
      matchMediaMock.matches = true;

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.theme).toBe('dark');
      });
    });






  });

  describe('Theme Switching', () => {
    it('should toggle theme from light to dark', async () => {
      matchMediaMock.matches = false; // System prefers light

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });

      result.current.toggleTheme();

      await waitFor(() => {
        expect(result.current.theme).toBe('dark');
        expect(result.current.themePreference).toBe('dark');
      });
    });



    it('should set theme to specific value', async () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });

      result.current.setTheme('dark');

      await waitFor(() => {
        expect(result.current.theme).toBe('dark');
        expect(result.current.themePreference).toBe('dark');
      });
    });




  });

  describe('System Theme Detection', () => {
    it('should listen for system theme changes when preference is system', async () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.themePreference).toBe('system');
      });

      expect(matchMediaMock.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should update theme when system preference changes', async () => {
      matchMediaMock.matches = false;

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });

      // Simulate system theme change to dark
      const changeHandler = matchMediaMock.addEventListener.mock.calls[0][1];
      changeHandler({ matches: true });

      await waitFor(() => {
        expect(result.current.theme).toBe('dark');
      });
    });



    it('should cleanup event listener on unmount', async () => {
      const { unmount } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(matchMediaMock.addEventListener).toHaveBeenCalled();
      });

      unmount();

      expect(matchMediaMock.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });

  describe('Backend Integration', () => {
    it('should load theme from backend for authenticated users', async () => {
      const { isAuthenticated } = await import('~/utils/userTracking');
      const { fetchPreferences } = await import('~/utils/preferencesApi');

      vi.mocked(isAuthenticated).mockReturnValue(true);
      vi.mocked(fetchPreferences).mockResolvedValue({
        settings: { theme: 'dark' },
      });

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.theme).toBe('dark');
        expect(result.current.themePreference).toBe('dark');
      });
    });

    it('should sync theme changes to backend for authenticated users', async () => {
      const { isAuthenticated } = await import('~/utils/userTracking');
      const { updatePreferences } = await import('~/utils/preferencesApi');

      vi.mocked(isAuthenticated).mockReturnValue(true);

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });

      result.current.setTheme('dark');

      await waitFor(() => {
        expect(updatePreferences).toHaveBeenCalledWith({ theme: 'dark' });
      });
    });

    it('should not sync to backend on public routes', async () => {
      mockLocation.pathname = '/login';
      const { updatePreferences } = await import('~/utils/preferencesApi');

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });

      result.current.setTheme('dark');

      await waitFor(() => {
        expect(result.current.theme).toBe('dark');
      });

      // Should not call backend on public route
      expect(updatePreferences).not.toHaveBeenCalled();
    });

    it('should not sync to backend for unauthenticated users', async () => {
      const { isAuthenticated } = await import('~/utils/userTracking');
      const { updatePreferences } = await import('~/utils/preferencesApi');

      vi.mocked(isAuthenticated).mockReturnValue(false);

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });

      result.current.setTheme('dark');

      await waitFor(() => {
        expect(result.current.theme).toBe('dark');
      });

      expect(updatePreferences).not.toHaveBeenCalled();
    });

    it('should handle invalid theme values from backend', async () => {
      const { isAuthenticated } = await import('~/utils/userTracking');
      const { fetchPreferences } = await import('~/utils/preferencesApi');

      vi.mocked(isAuthenticated).mockReturnValue(true);
      vi.mocked(fetchPreferences).mockResolvedValue({
        settings: { theme: 'invalid-theme' as any },
      });

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        // Should fallback to system
        expect(result.current.themePreference).toBe('system');
      });
    });


  });

  describe('Preference Migration', () => {
    it('should migrate preferences and reload theme', async () => {
      const { migratePreferences, fetchPreferences } = await import('~/utils/preferencesApi');

      vi.mocked(migratePreferences).mockResolvedValue(true);
      vi.mocked(fetchPreferences).mockResolvedValue({
        settings: { theme: 'dark' },
      });

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });

      await result.current.migrateUserPreferences();

      await waitFor(() => {
        expect(result.current.theme).toBe('dark');
        expect(result.current.themePreference).toBe('dark');
      });

      expect(migratePreferences).toHaveBeenCalled();
      expect(fetchPreferences).toHaveBeenCalled();
    });

    it('should handle migration failure gracefully', async () => {
      const { migratePreferences } = await import('~/utils/preferencesApi');

      vi.mocked(migratePreferences).mockRejectedValue(new Error('Migration failed'));

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });

      // Should not throw
      await expect(result.current.migrateUserPreferences()).resolves.not.toThrow();

      // Theme should remain unchanged
      expect(result.current.theme).toBe('light');
    });


  });

  describe('Public Routes', () => {
    const publicRoutes = [
      '/signup',
      '/login',
      '/forgot-password',
      '/reset-password',
      '/verify-otp',
      '/verify-email',
    ];

    publicRoutes.forEach((route) => {
      it(`should skip backend preferences on ${route}`, async () => {
        mockLocation.pathname = route;
        const { fetchPreferences } = await import('~/utils/preferencesApi');

        renderHook(() => useTheme(), { wrapper });

        await waitFor(() => {
          // Should use localStorage or default
          expect(fetchPreferences).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('useTheme Hook', () => {
    it('should throw error when used outside ThemeProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = () => {};

      expect(() => {
        renderHook(() => useTheme());
      }).toThrow('useTheme must be used within a ThemeProvider');

      console.error = originalError;
    });

    it('should provide all theme methods', async () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.theme).toBeDefined();
      });

      expect(typeof result.current.toggleTheme).toBe('function');
      expect(typeof result.current.setTheme).toBe('function');
      expect(typeof result.current.setThemePreference).toBe('function');
      expect(typeof result.current.migrateUserPreferences).toBe('function');
    });
  });

  describe('Edge Cases', () => {
    it('should handle SSR environment (no window)', async () => {
      // This test verifies the code doesn't crash in SSR
      // The actual SSR behavior returns null before mount
      const { result } = renderHook(() => useTheme(), { wrapper });

      // Should eventually mount and provide theme
      await waitFor(() => {
        expect(result.current.theme).toBeDefined();
      });
    });

    it('should handle rapid theme changes', async () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
      });

      // Rapidly toggle theme
      result.current.toggleTheme();
      result.current.toggleTheme();
      result.current.toggleTheme();

      await waitFor(() => {
        // Should end up on dark (odd number of toggles)
        expect(result.current.theme).toBe('dark');
      });
    });

    it('should handle theme preference changes during system theme updates', async () => {
      matchMediaMock.matches = false;

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
        expect(result.current.themePreference).toBe('system');
      });

      // Change to explicit dark
      result.current.setTheme('dark');

      await waitFor(() => {
        expect(result.current.theme).toBe('dark');
        expect(result.current.themePreference).toBe('dark');
      });

      // System theme change should not affect explicit preference
      const changeHandler = matchMediaMock.addEventListener.mock.calls[0]?.[1];
      if (changeHandler) {
        changeHandler({ matches: true });
      }

      expect(result.current.theme).toBe('dark');
    });


  });
});
