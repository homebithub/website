import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { AuthContext } from '../AuthContextCore';
import type { AuthContextType } from '../AuthContextCore';

describe('useAuth', () => {
  it('should throw error when used outside AuthProvider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    console.error = originalError;
  });

  it('should return context value when used within AuthProvider', () => {
    const mockContextValue: AuthContextType = {
      user: null,
      loading: false,
      error: null,
      login: async () => {},
      signup: async () => {},
      logout: async () => {},
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={mockContextValue}>{children}</AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toBe(mockContextValue);
  });

  it('should return user when authenticated', () => {
    const mockUser = {
      token: 'test-token',
      user: {
        user_id: 'user-123',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+254712345678',
        profile_type: 'household',
        email: 'john@example.com',
      },
    };

    const mockContextValue: AuthContextType = {
      user: mockUser,
      loading: false,
      error: null,
      login: async () => {},
      signup: async () => {},
      logout: async () => {},
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={mockContextValue}>{children}</AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toEqual(mockUser);
  });

  it('should return error when present', () => {
    const mockContextValue: AuthContextType = {
      user: null,
      loading: false,
      error: 'Authentication failed',
      login: async () => {},
      signup: async () => {},
      logout: async () => {},
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={mockContextValue}>{children}</AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.error).toBe('Authentication failed');
  });

  it('should return loading state', () => {
    const mockContextValue: AuthContextType = {
      user: null,
      loading: true,
      error: null,
      login: async () => {},
      signup: async () => {},
      logout: async () => {},
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={mockContextValue}>{children}</AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.loading).toBe(true);
  });

  it('should provide all auth methods', () => {
    const mockLogin = async () => {};
    const mockSignup = async () => {};
    const mockLogout = async () => {};

    const mockContextValue: AuthContextType = {
      user: null,
      loading: false,
      error: null,
      login: mockLogin,
      signup: mockSignup,
      logout: mockLogout,
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={mockContextValue}>{children}</AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.login).toBe(mockLogin);
    expect(result.current.signup).toBe(mockSignup);
    expect(result.current.logout).toBe(mockLogout);
  });
});
