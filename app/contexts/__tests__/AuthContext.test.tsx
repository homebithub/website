import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { AuthProvider } from '../AuthContext';
import { useAuth } from '../useAuth';
import type { LoginResponse } from '~/routes/login';

// Mock react-router
const mockNavigate = vi.fn();
const mockLocation = { pathname: '/', search: '', hash: '', state: null, key: 'default' };

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

// Mock API modules
vi.mock('~/utils/preferencesApi', () => ({
  migratePreferences: vi.fn(() => Promise.resolve(undefined)),
}));

vi.mock('~/utils/deviceFingerprint', () => ({
  prepareDeviceRegistration: vi.fn(() => Promise.resolve({})),
}));

vi.mock('~/utils/api/devices', () => ({
  registerDevice: vi.fn(() => Promise.resolve({ requires_confirmation: false })),
}));

describe('AuthContext', () => {
  const mockUser: LoginResponse = {
    token: 'test-token-123',
    user: {
      user_id: 'user-123',
      first_name: 'John',
      last_name: 'Doe',
      phone: '+254712345678',
      profile_type: 'household',
      email: 'john@example.com',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = vi.fn();
    mockLocation.pathname = '/'; // Reset to root path
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  );

  describe('Initial State', () => {
    it('should initialize with null user and complete loading', async () => {
      mockLocation.pathname = '/'; // Public route - no server check
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should provide login, signup, and logout functions', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.signup).toBe('function');
      expect(typeof result.current.logout).toBe('function');
    });
  });

  describe('checkAuth', () => {

    it('should clear user data if token verification fails', async () => {
      mockLocation.pathname = '/dashboard';
      localStorage.setItem('token', 'invalid-token');
      localStorage.setItem('user_object', JSON.stringify(mockUser.user));

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('token')).toBeUndefined();
      expect(localStorage.getItem('user_object')).toBeUndefined();
    });

    it('should handle malformed user_object in localStorage', async () => {
      localStorage.setItem('token', mockUser.token);
      localStorage.setItem('user_object', 'invalid-json');

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockUser }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.login('0712345678', 'password123');

      await waitFor(() => {
        expect(result.current.user).toBeTruthy();
        expect(result.current.user?.token).toBe(mockUser.token);
      });
    });

    it('should normalize phone number before login', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockUser }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.login('0712345678', 'password123');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/auth/login'),
        expect.objectContaining({
          body: expect.stringContaining('+254712345678'),
        })
      );
    });

    it('should handle login error with custom message', async () => {
      const errorMessage = 'Invalid credentials';
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: errorMessage }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(result.current.login('0712345678', 'wrong')).rejects.toThrow();

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });

    it('should redirect bureau users to home', async () => {
      const bureauUser = {
        ...mockUser,
        user: { ...mockUser.user, profile_type: 'bureau' },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: bureauUser }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.login('0712345678', 'password123');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should redirect to profile setup if incomplete', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockUser }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              last_completed_step: 2,
              total_steps: 5,
              status: 'in_progress',
            },
          }),
        });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.login('0712345678', 'password123');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/profile-setup/household?step=3');
      });
    });

    it('should redirect household users to choice page if setup not started', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockUser }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              last_completed_step: 0,
              total_steps: 5,
              status: 'not_started',
            },
          }),
        });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.login('0712345678', 'password123');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/household-choice');
      });
    });

    it('should redirect to home if profile setup is complete', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockUser }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              last_completed_step: 5,
              total_steps: 5,
              status: 'completed',
            },
          }),
        });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.login('0712345678', 'password123');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should handle 404 from profile setup check for household', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockUser }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
        });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.login('0712345678', 'password123');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/household-choice');
      });
    });

    it('should handle 404 from profile setup check for househelp', async () => {
      const househelpUser = {
        ...mockUser,
        user: { ...mockUser.user, profile_type: 'househelp' },
      };

      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: househelpUser }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
        });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.login('0712345678', 'password123');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/profile-setup/househelp?step=1');
      });
    });

    it('should continue to home if profile setup check fails', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockUser }),
        })
        .mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.login('0712345678', 'password123');

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should set loading state during login', async () => {
      (global.fetch as any).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ data: mockUser }),
                }),
              100
            )
          )
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const loginPromise = result.current.login('0712345678', 'password123');

      // Should be loading during login
      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      await loginPromise;

      // Should not be loading after login
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('signup', () => {
    it('should successfully signup with valid data', async () => {
      const signupData = {
        token: 'new-token-456',
        user: {
          user_id: 'user-456',
          first_name: 'Jane',
          last_name: 'Smith',
          phone: '+254723456789',
          profile_type: 'househelp',
          email: 'jane@example.com',
        },
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: signupData }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.signup('jane@example.com', 'password123', 'Jane', 'Smith');

      await waitFor(() => {
        expect(result.current.user).toBeTruthy();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should handle signup error', async () => {
      const errorMessage = 'Email already exists';
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: errorMessage }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        result.current.signup('jane@example.com', 'password123', 'Jane', 'Smith')
      ).rejects.toThrow();

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });

    it('should set loading state during signup', async () => {
      (global.fetch as any).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    data: {
                      token: 'token',
                      user: mockUser.user,
                    },
                  }),
                }),
              100
            )
          )
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const signupPromise = result.current.signup(
        'jane@example.com',
        'password123',
        'Jane',
        'Smith'
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      await signupPromise;

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
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
      '/about',
      '/services',
      '/contact',
      '/pricing',
      '/terms',
      '/privacy',
      '/cookies',
      '/',
    ];

    publicRoutes.forEach((route) => {
      it(`should skip auth check on ${route}`, async () => {
        mockLocation.pathname = route;

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(global.fetch).not.toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors during auth check', async () => {
      mockLocation.pathname = '/dashboard';
      localStorage.setItem('token', mockUser.token);

      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should not crash, just set loading to false
      expect(result.current.loading).toBe(false);
    });

    it('should clear error state on successful login', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: async () => ({ error: 'Invalid credentials' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockUser }),
        });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // First login fails
      await expect(result.current.login('0712345678', 'wrong')).rejects.toThrow();
      
      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Second login succeeds
      await result.current.login('0712345678', 'password123');

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });
});
