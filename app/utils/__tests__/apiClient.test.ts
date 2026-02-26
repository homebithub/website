import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient } from '../apiClient';

// Mock dependencies
vi.mock('~/config/api', () => ({
  API_BASE_URL: 'https://api.test.com',
  getAuthHeaders: vi.fn((token: string) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  })),
}));

vi.mock('~/utils/deviceFingerprint', () => ({
  getDeviceId: vi.fn(async () => 'test-device-id'),
}));

import { getDeviceId } from '~/utils/deviceFingerprint';

describe('apiClient utility', () => {
  let mockFetch: any;
  let mockLocalStorage: any;
  let mockWindow: any;

  beforeEach(() => {
    // Mock fetch
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Mock localStorage
    mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });

    // Mock window
    mockWindow = {
      location: {
        href: '',
        pathname: '/test',
        search: '?param=value',
      },
    };
    Object.defineProperty(global, 'window', {
      value: mockWindow,
      writable: true,
      configurable: true,
    });

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('public', () => {
    it('makes request without requiring auth', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200 });
      mockLocalStorage.getItem.mockReturnValue(null);

      await apiClient.public('https://api.test.com/endpoint');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/endpoint',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('includes token if available but does not require it', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200 });
      mockLocalStorage.getItem.mockReturnValue('test-token');

      await apiClient.public('https://api.test.com/endpoint');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/endpoint',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('includes device ID in headers', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200 });
      mockLocalStorage.getItem.mockReturnValue(null);
      vi.mocked(getDeviceId).mockResolvedValue('device-123');

      await apiClient.public('https://api.test.com/endpoint');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/endpoint',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Device-ID': 'device-123',
          }),
        })
      );
    });

    it('handles device ID fetch failure gracefully', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200 });
      mockLocalStorage.getItem.mockReturnValue(null);
      vi.mocked(getDeviceId).mockRejectedValue(new Error('Device ID error'));

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await apiClient.public('https://api.test.com/endpoint');

      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to get device ID:', expect.any(Error));
      expect(mockFetch).toHaveBeenCalled();
      
      consoleWarnSpy.mockRestore();
    });

    it('supports POST method', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200 });
      mockLocalStorage.getItem.mockReturnValue(null);

      await apiClient.public('https://api.test.com/endpoint', {
        method: 'POST',
        body: JSON.stringify({ data: 'test' }),
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/endpoint',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ data: 'test' }),
        })
      );
    });

    it('merges custom headers with default headers', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200 });
      mockLocalStorage.getItem.mockReturnValue(null);

      await apiClient.public('https://api.test.com/endpoint', {
        headers: {
          'X-Custom-Header': 'custom-value',
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/endpoint',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Custom-Header': 'custom-value',
          }),
        })
      );
    });
  });

  describe('auth', () => {
    it('makes authenticated request with token', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200 });
      mockLocalStorage.getItem.mockReturnValue('auth-token');

      await apiClient.auth('https://api.test.com/protected');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/protected',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer auth-token',
          }),
        })
      );
    });

    it('throws error and redirects when token missing', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      await expect(
        apiClient.auth('https://api.test.com/protected')
      ).rejects.toThrow('Unauthorized: Missing token');

      expect(mockWindow.location.href).toBe('/login?returnTo=%2Ftest%3Fparam%3Dvalue');
    });

    it('does not redirect when handle401 is silent', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      await expect(
        apiClient.auth('https://api.test.com/protected', { handle401: 'silent' })
      ).rejects.toThrow('Unauthorized: Missing token');

      expect(mockWindow.location.href).toBe('');
    });

    it('handles 401 response by clearing token and redirecting', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 401 });
      mockLocalStorage.getItem.mockReturnValue('invalid-token');

      await apiClient.auth('https://api.test.com/protected');

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user_object');
      expect(mockWindow.location.href).toBe('/login?returnTo=%2Ftest%3Fparam%3Dvalue');
    });

    it('handles 401 response silently when specified', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 401 });
      mockLocalStorage.getItem.mockReturnValue('invalid-token');

      await apiClient.auth('https://api.test.com/protected', { handle401: 'silent' });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
      expect(mockWindow.location.href).toBe('');
    });

    it('supports different HTTP methods', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200 });
      mockLocalStorage.getItem.mockReturnValue('auth-token');

      await apiClient.auth('https://api.test.com/resource', { method: 'DELETE' });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/resource',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });

    it('includes request body for POST requests', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 201 });
      mockLocalStorage.getItem.mockReturnValue('auth-token');

      const body = JSON.stringify({ name: 'Test' });
      await apiClient.auth('https://api.test.com/create', {
        method: 'POST',
        body,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/create',
        expect.objectContaining({
          method: 'POST',
          body,
        })
      );
    });
  });

  describe('conditional', () => {
    it('includes token if available', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200 });
      mockLocalStorage.getItem.mockReturnValue('conditional-token');

      await apiClient.conditional('https://api.test.com/endpoint');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/endpoint',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer conditional-token',
          }),
        })
      );
    });

    it('works without token', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200 });
      mockLocalStorage.getItem.mockReturnValue(null);

      await apiClient.conditional('https://api.test.com/endpoint');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/endpoint',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('does not throw error when token missing', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200 });
      mockLocalStorage.getItem.mockReturnValue(null);

      await expect(
        apiClient.conditional('https://api.test.com/endpoint')
      ).resolves.toBeDefined();
    });

    it('handles 401 response without throwing', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 401 });
      mockLocalStorage.getItem.mockReturnValue('token');

      const response = await apiClient.conditional('https://api.test.com/endpoint');

      expect(response.status).toBe(401);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('json', () => {
    it('parses JSON response when ok', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn(async () => ({ data: 'test' })),
      } as any;

      const result = await apiClient.json(mockResponse);

      expect(result).toEqual({ data: 'test' });
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('throws error when response not ok', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        text: vi.fn(async () => 'Bad Request'),
      } as any;

      await expect(apiClient.json(mockResponse)).rejects.toThrow('Bad Request');
    });

    it('throws error with status when text unavailable', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        text: vi.fn(async () => ''),
      } as any;

      await expect(apiClient.json(mockResponse)).rejects.toThrow('Request failed with 500');
    });

    it('handles text parsing failure', async () => {
      const mockResponse = {
        ok: false,
        status: 503,
        text: vi.fn(() => Promise.reject(new Error('Parse error'))),
      } as any;

      await expect(apiClient.json(mockResponse)).rejects.toThrow('Request failed with 503');
    });

    it('parses complex JSON structures', async () => {
      const complexData = {
        user: { id: 1, name: 'Test' },
        items: [1, 2, 3],
        nested: { deep: { value: true } },
      };
      const mockResponse = {
        ok: true,
        json: vi.fn(async () => complexData),
      } as any;

      const result = await apiClient.json(mockResponse);

      expect(result).toEqual(complexData);
    });

    it('handles empty JSON response', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn(async () => ({})),
      } as any;

      const result = await apiClient.json(mockResponse);

      expect(result).toEqual({});
    });

    it('handles null JSON response', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn(async () => null),
      } as any;

      const result = await apiClient.json(mockResponse);

      expect(result).toBeNull();
    });
  });

  describe('error handling', () => {
    it('handles network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      mockLocalStorage.getItem.mockReturnValue('token');

      await expect(
        apiClient.auth('https://api.test.com/endpoint')
      ).rejects.toThrow('Network error');
    });

    it('handles localStorage unavailable', async () => {
      Object.defineProperty(global, 'localStorage', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      mockFetch.mockResolvedValue({ ok: true, status: 200 });

      await expect(
        apiClient.public('https://api.test.com/endpoint')
      ).resolves.toBeDefined();
    });

    it('handles window unavailable (SSR)', async () => {
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      mockFetch.mockResolvedValue({ ok: true, status: 200 });
      mockLocalStorage.getItem.mockReturnValue(null);

      await expect(
        apiClient.auth('https://api.test.com/endpoint')
      ).rejects.toThrow('Unauthorized: Missing token');

      // Should not attempt redirect
      expect(mockWindow.location.href).toBe('');
    });
  });

  describe('integration scenarios', () => {
    it('handles complete authenticated flow', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ user: 'data' }),
      });
      mockLocalStorage.getItem.mockReturnValue('valid-token');

      const response = await apiClient.auth('https://api.test.com/user');
      const data = await apiClient.json(response);

      expect(data).toEqual({ user: 'data' });
    });

    it('handles token expiration and re-authentication', async () => {
      // First request with expired token
      mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });
      mockLocalStorage.getItem.mockReturnValue('expired-token');

      await apiClient.auth('https://api.test.com/protected', { handle401: 'silent' });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user_object');
    });

    it('handles public to authenticated upgrade', async () => {
      // Public request without token
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });
      mockLocalStorage.getItem.mockReturnValue(null);

      await apiClient.public('https://api.test.com/public');

      // User logs in, token now available
      mockLocalStorage.getItem.mockReturnValue('new-token');
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });

      await apiClient.auth('https://api.test.com/protected');

      expect(mockFetch).toHaveBeenLastCalledWith(
        'https://api.test.com/protected',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer new-token',
          }),
        })
      );
    });
  });

  describe('request options', () => {
    it('passes through additional fetch options', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200 });
      mockLocalStorage.getItem.mockReturnValue('token');

      await apiClient.auth('https://api.test.com/endpoint', {
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
        credentials: 'include',
        mode: 'cors',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/endpoint',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ test: 'data' }),
          credentials: 'include',
          mode: 'cors',
        })
      );
    });

    it('preserves custom headers alongside auth headers', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200 });
      mockLocalStorage.getItem.mockReturnValue('token');

      await apiClient.auth('https://api.test.com/endpoint', {
        headers: {
          'X-Custom': 'value',
          'Accept-Language': 'en-US',
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/endpoint',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer token',
            'X-Custom': 'value',
            'Accept-Language': 'en-US',
          }),
        })
      );
    });
  });
});
