import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProfileSetupStatus } from '../useProfileSetupStatus';

// Mock dependencies
vi.mock('react-router', () => ({
  useLocation: vi.fn(() => ({ pathname: '/' })),
}));

vi.mock('~/config/api', () => ({
  API_BASE_URL: 'https://api.test.com',
}));

import { useLocation } from 'react-router';

describe('useProfileSetupStatus', () => {
  let mockFetch: any;
  let mockLocalStorage: any;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('starts with complete status (fail open)', () => {
      vi.mocked(useLocation).mockReturnValue({ pathname: '/' } as any);
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useProfileSetupStatus());

      expect(result.current.isComplete).toBe(true);
      expect(result.current.isInSetupMode).toBe(false);
    });

    it('does not check status when no token', async () => {
      vi.mocked(useLocation).mockReturnValue({ pathname: '/' } as any);
      mockLocalStorage.getItem.mockReturnValue(null);

      renderHook(() => useProfileSetupStatus());

      await waitFor(() => {
        expect(mockFetch).not.toHaveBeenCalled();
      });
    });
  });

  describe('Household Profile', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'token') return 'test-token';
        if (key === 'profile_type') return 'household';
        return null;
      });
    });

    it('checks status for household profile', async () => {
      vi.mocked(useLocation).mockReturnValue({ pathname: '/profile-setup/household' } as any);
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            status: 'completed',
            total_steps: 5,
            last_completed_step: 5,
          },
        }),
      });

      const { result } = renderHook(() => useProfileSetupStatus());

      await waitFor(() => {
        expect(result.current.isComplete).toBe(true);
      });

      expect(result.current.profileType).toBe('household');
    });

    it('detects incomplete setup', async () => {
      vi.mocked(useLocation).mockReturnValue({ pathname: '/profile-setup/household' } as any);
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            status: 'in_progress',
            total_steps: 5,
            last_completed_step: 2,
          },
        }),
      });

      const { result } = renderHook(() => useProfileSetupStatus());

      await waitFor(() => {
        expect(result.current.isComplete).toBe(false);
      });

      expect(result.current.lastStep).toBe(2);
      expect(result.current.isInSetupMode).toBe(true);
    });

    it('marks complete when all steps done', async () => {
      vi.mocked(useLocation).mockReturnValue({ pathname: '/profile-setup/household' } as any);
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            status: 'in_progress',
            total_steps: 5,
            last_completed_step: 5,
          },
        }),
      });

      const { result } = renderHook(() => useProfileSetupStatus());

      await waitFor(() => {
        expect(result.current.isComplete).toBe(true);
      });
    });
  });

  describe('Househelp Profile', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'token') return 'test-token';
        if (key === 'profile_type') return 'househelp';
        return null;
      });
    });

    it('checks status for househelp profile', async () => {
      vi.mocked(useLocation).mockReturnValue({ pathname: '/profile-setup/househelp' } as any);
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            status: 'completed',
            total_steps: 7,
            last_completed_step: 7,
          },
        }),
      });

      const { result } = renderHook(() => useProfileSetupStatus());

      await waitFor(() => {
        expect(result.current.isComplete).toBe(true);
      });

      expect(result.current.profileType).toBe('househelp');
    });

    it('detects incomplete househelp setup', async () => {
      vi.mocked(useLocation).mockReturnValue({ pathname: '/profile-setup/househelp' } as any);
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            status: 'in_progress',
            total_steps: 7,
            last_completed_step: 3,
          },
        }),
      });

      const { result } = renderHook(() => useProfileSetupStatus());

      await waitFor(() => {
        expect(result.current.isComplete).toBe(false);
      });

      expect(result.current.lastStep).toBe(3);
    });
  });

  describe('Setup Routes', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'token') return 'test-token';
        if (key === 'profile_type') return 'household';
        return null;
      });
    });

    it('detects /profile-setup/household route', async () => {
      vi.mocked(useLocation).mockReturnValue({ pathname: '/profile-setup/household' } as any);
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: { status: 'in_progress', total_steps: 5, last_completed_step: 2 } }),
      });

      const { result } = renderHook(() => useProfileSetupStatus());

      await waitFor(() => {
        expect(result.current.isInSetupMode).toBe(true);
      });
    });

    it('detects /profile-setup/househelp route', async () => {
      vi.mocked(useLocation).mockReturnValue({ pathname: '/profile-setup/househelp' } as any);
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'token') return 'test-token';
        if (key === 'profile_type') return 'househelp';
        return null;
      });
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: { status: 'in_progress', total_steps: 7, last_completed_step: 1 } }),
      });

      const { result } = renderHook(() => useProfileSetupStatus());

      await waitFor(() => {
        expect(result.current.isInSetupMode).toBe(true);
      });
    });

    it('detects /household-choice route', async () => {
      vi.mocked(useLocation).mockReturnValue({ pathname: '/household-choice' } as any);
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: { status: 'in_progress', total_steps: 5, last_completed_step: 0 } }),
      });

      const { result } = renderHook(() => useProfileSetupStatus());

      await waitFor(() => {
        expect(result.current.isInSetupMode).toBe(true);
      });
    });

    it('detects /join-household route', async () => {
      vi.mocked(useLocation).mockReturnValue({ pathname: '/join-household' } as any);
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: { status: 'in_progress', total_steps: 5, last_completed_step: 0 } }),
      });

      const { result } = renderHook(() => useProfileSetupStatus());

      await waitFor(() => {
        expect(result.current.isInSetupMode).toBe(true);
      });
    });

    it('not in setup mode on regular routes', async () => {
      vi.mocked(useLocation).mockReturnValue({ pathname: '/dashboard' } as any);
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: { status: 'completed', total_steps: 5, last_completed_step: 5 } }),
      });

      const { result } = renderHook(() => useProfileSetupStatus());

      await waitFor(() => {
        expect(result.current.isInSetupMode).toBe(false);
      });
    });
  });

  describe('404 Response', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'token') return 'test-token';
        if (key === 'profile_type') return 'household';
        return null;
      });
    });

    it('treats 404 as incomplete setup', async () => {
      vi.mocked(useLocation).mockReturnValue({ pathname: '/profile-setup/household' } as any);
      
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      const { result } = renderHook(() => useProfileSetupStatus());

      await waitFor(() => {
        expect(result.current.isComplete).toBe(false);
      });

      expect(result.current.lastStep).toBe(0);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'token') return 'test-token';
        if (key === 'profile_type') return 'household';
        return null;
      });
    });

    it('fails open on API error', async () => {
      vi.mocked(useLocation).mockReturnValue({ pathname: '/profile-setup/household' } as any);
      
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      });

      const { result } = renderHook(() => useProfileSetupStatus());

      await waitFor(() => {
        expect(result.current.isComplete).toBe(true);
      });
    });

    it('fails open on network error', async () => {
      vi.mocked(useLocation).mockReturnValue({ pathname: '/profile-setup/household' } as any);
      
      mockFetch.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useProfileSetupStatus());

      await waitFor(() => {
        expect(result.current.isComplete).toBe(true);
      });
    });
  });

  describe('Non-Profile Types', () => {
    it('treats admin as complete', async () => {
      vi.mocked(useLocation).mockReturnValue({ pathname: '/' } as any);
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'token') return 'test-token';
        if (key === 'profile_type') return 'admin';
        return null;
      });

      const { result } = renderHook(() => useProfileSetupStatus());

      await waitFor(() => {
        expect(result.current.isComplete).toBe(true);
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('treats unknown profile type as complete', async () => {
      vi.mocked(useLocation).mockReturnValue({ pathname: '/' } as any);
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'token') return 'test-token';
        if (key === 'profile_type') return 'unknown';
        return null;
      });

      const { result } = renderHook(() => useProfileSetupStatus());

      await waitFor(() => {
        expect(result.current.isComplete).toBe(true);
      });
    });
  });

  describe('Route Changes', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'token') return 'test-token';
        if (key === 'profile_type') return 'household';
        return null;
      });
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: { status: 'completed', total_steps: 5, last_completed_step: 5 } }),
      });
    });

    it('checks status on setup routes', async () => {
      vi.mocked(useLocation).mockReturnValue({ pathname: '/profile-setup/household' } as any);

      renderHook(() => useProfileSetupStatus());

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });

    it('checks status on regular routes', async () => {
      vi.mocked(useLocation).mockReturnValue({ pathname: '/dashboard' } as any);

      renderHook(() => useProfileSetupStatus());

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });
  });
});
