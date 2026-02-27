import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loader } from '../google.auth.callback';

describe('Google Auth Callback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('Error Handling', () => {
    it('should redirect to login with error when code is missing', async () => {
      const request = new Request('https://example.com/google/auth/callback');
      
      const response = await loader({ request, params: {}, context: {} });
      
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toContain('/login?error=missing_code');
    });

    it('should redirect to login with error when API call fails', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({}),
        })
      ) as any;
      
      const request = new Request('https://example.com/google/auth/callback?code=test123');
      
      const response = await loader({ request, params: {}, context: {} });
      
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toContain('/login?error=signin_failed');
    });

    it('should redirect to login with error on network failure', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;
      
      const request = new Request('https://example.com/google/auth/callback?code=test123');
      
      const response = await loader({ request, params: {}, context: {} });
      
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toContain('/login?error=network_error');
    });
  });

  describe('Existing User Login', () => {
    it('should redirect to login with token for existing user', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            requires_signup: false,
            token: 'test-token-123',
            user_id: 'user123',
          }),
        })
      ) as any;
      
      const request = new Request('https://example.com/google/auth/callback?code=test123');
      
      const response = await loader({ request, params: {}, context: {} });
      
      expect(response.status).toBe(302);
      const location = response.headers.get('Location');
      expect(location).toContain('/login');
      expect(location).toContain('token=test-token-123');
      expect(location).toContain('google_login=success');
    });

    it('should handle state parameter for existing user', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            requires_signup: false,
            token: 'test-token-123',
          }),
        })
      ) as any;
      
      const state = encodeURIComponent(JSON.stringify({ profile_type: 'household' }));
      const request = new Request(`https://example.com/google/auth/callback?code=test123&state=${state}`);
      
      const response = await loader({ request, params: {}, context: {} });
      
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toContain('/login');
    });
  });

  describe('New User Signup', () => {
    it('should redirect to signup with Google data for new user', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            requires_signup: true,
            email: 'test@example.com',
            first_name: 'John',
            last_name: 'Doe',
            google_id: 'google123',
            picture: 'https://example.com/pic.jpg',
          }),
        })
      ) as any;
      
      const request = new Request('https://example.com/google/auth/callback?code=test123');
      
      const response = await loader({ request, params: {}, context: {} });
      
      expect(response.status).toBe(302);
      const location = response.headers.get('Location');
      expect(location).toContain('/signup');
      expect(location).toContain('google_signup=1');
      expect(location).toMatch(/email=test(%40|@)example\.com/);
      expect(location).toContain('first_name=John');
      expect(location).toContain('last_name=Doe');
      expect(location).toContain('google_id=google123');
    });

    it('should preserve profile_type from state', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            requires_signup: true,
            email: 'test@example.com',
            first_name: 'John',
            last_name: 'Doe',
          }),
        })
      ) as any;
      
      const state = encodeURIComponent(JSON.stringify({ profile_type: 'household' }));
      const request = new Request(`https://example.com/google/auth/callback?code=test123&state=${state}`);
      
      const response = await loader({ request, params: {}, context: {} });
      
      expect(response.status).toBe(302);
      const location = response.headers.get('Location');
      expect(location).toContain('/signup');
      expect(location).toContain('profile_type=household');
    });

    it('should preserve bureau_id from state', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            requires_signup: true,
            email: 'test@example.com',
          }),
        })
      ) as any;
      
      const state = encodeURIComponent(JSON.stringify({ 
        profile_type: 'househelp',
        bureau_id: 'bureau123' 
      }));
      const request = new Request(`https://example.com/google/auth/callback?code=test123&state=${state}`);
      
      const response = await loader({ request, params: {}, context: {} });
      
      expect(response.status).toBe(302);
      const location = response.headers.get('Location');
      expect(location).toContain('/signup');
      expect(location).toContain('bureauId=bureau123');
    });

    it('should handle missing optional fields', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            requires_signup: true,
            email: 'test@example.com',
            // Missing first_name, last_name, etc.
          }),
        })
      ) as any;
      
      const request = new Request('https://example.com/google/auth/callback?code=test123');
      
      const response = await loader({ request, params: {}, context: {} });
      
      expect(response.status).toBe(302);
      const location = response.headers.get('Location');
      expect(location).toContain('/signup');
      expect(location).toMatch(/email=test(%40|@)example\.com/);
    });

    it('should handle invalid state JSON gracefully', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            requires_signup: true,
            email: 'test@example.com',
          }),
        })
      ) as any;
      
      const request = new Request('https://example.com/google/auth/callback?code=test123&state=invalid-json');
      
      const response = await loader({ request, params: {}, context: {} });
      
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toContain('/signup');
    });
  });

  describe('Edge Cases', () => {
    it('should handle unexpected API response', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            // Neither requires_signup nor token
          }),
        })
      ) as any;
      
      const request = new Request('https://example.com/google/auth/callback?code=test123');
      
      const response = await loader({ request, params: {}, context: {} });
      
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toContain('/login?error=unexpected_response');
    });

    it('should handle empty state parameter', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            requires_signup: true,
            email: 'test@example.com',
          }),
        })
      ) as any;
      
      const request = new Request('https://example.com/google/auth/callback?code=test123&state=');
      
      const response = await loader({ request, params: {}, context: {} });
      
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toContain('/signup');
    });

    it('should handle special characters in email', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            requires_signup: true,
            email: 'test+tag@example.com',
            first_name: 'John',
          }),
        })
      ) as any;
      
      const request = new Request('https://example.com/google/auth/callback?code=test123');
      
      const response = await loader({ request, params: {}, context: {} });
      
      expect(response.status).toBe(302);
      const location = response.headers.get('Location');
      expect(location).toContain('/signup');
      // Email should be URL encoded
      expect(location).toContain('email=');
    });
  });

  describe('API Integration', () => {
    it('should call Google signin endpoint with correct parameters', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            requires_signup: false,
            token: 'test-token',
          }),
        })
      ) as any;
      global.fetch = mockFetch;
      
      const request = new Request('https://example.com/google/auth/callback?code=test123');
      
      await loader({ request, params: {}, context: {} });
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/auth/google/signin'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('test123'),
        })
      );
    });

    it('should include state in API call', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            requires_signup: false,
            token: 'test-token',
          }),
        })
      ) as any;
      global.fetch = mockFetch;
      
      const state = encodeURIComponent(JSON.stringify({ profile_type: 'household' }));
      const request = new Request(`https://example.com/google/auth/callback?code=test123&state=${state}`);
      
      await loader({ request, params: {}, context: {} });
      
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.state).toBeDefined();
      expect(callBody.flow).toBe('auth');
    });
  });
});
