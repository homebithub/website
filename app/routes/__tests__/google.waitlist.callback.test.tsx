import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loader } from '../google.waitlist.callback';

describe('Google Waitlist Callback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('Error Handling', () => {
    it('should redirect to homepage with error when code is missing', async () => {
      const request = new Request('https://example.com/google/waitlist/callback');
      
      const response = await loader({ request, params: {}, context: {} });
      
      expect(response.status).toBe(302);
      const location = response.headers.get('Location');
      expect(location).toContain('/?waitlist=1');
      expect(location).toContain('error=missing_code');
    });

    it('should redirect with error when API call fails', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({}),
        })
      ) as any;
      
      const request = new Request('https://example.com/google/waitlist/callback?code=test123');
      
      const response = await loader({ request, params: {}, context: {} });
      
      expect(response.status).toBe(302);
      const location = response.headers.get('Location');
      expect(location).toContain('/?waitlist=1');
      expect(location).toContain('error=signin_failed');
    });

    it('should redirect with error on network failure', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any;
      
      const request = new Request('https://example.com/google/waitlist/callback?code=test123');
      
      const response = await loader({ request, params: {}, context: {} });
      
      expect(response.status).toBe(302);
      const location = response.headers.get('Location');
      expect(location).toContain('/?waitlist=1');
      expect(location).toContain('error=network_error');
    });
  });

  describe('Waitlist Creation with Complete Data', () => {
    it('should auto-create waitlist entry when all data is available', async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            email: 'test@example.com',
            first_name: 'John',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      global.fetch = mockFetch as any;
      
      const state = encodeURIComponent(JSON.stringify({ 
        phone: '0712345678',
        message: 'Interested in service' 
      }));
      const request = new Request(`https://example.com/google/waitlist/callback?code=test123&state=${state}`);
      
      const response = await loader({ request, params: {}, context: {} });
      
      expect(response.status).toBe(302);
      const location = response.headers.get('Location');
      expect(location).toContain('/?');
      expect(location).toContain('success=1');
      
      // Verify waitlist creation was called
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch.mock.calls[1][0]).toContain('/api/v1/waitlist');
    });

    it('should include message in waitlist creation', async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            email: 'test@example.com',
            first_name: 'John',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      global.fetch = mockFetch as any;
      
      const state = encodeURIComponent(JSON.stringify({ 
        phone: '0712345678',
        message: 'Looking for househelp' 
      }));
      const request = new Request(`https://example.com/google/waitlist/callback?code=test123&state=${state}`);
      
      await loader({ request, params: {}, context: {} });
      
      const waitlistCall = mockFetch.mock.calls[1];
      const body = JSON.parse(waitlistCall[1].body);
      expect(body.message).toBe('Looking for househelp');
    });

    it('should handle waitlist creation failure', async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            email: 'test@example.com',
            first_name: 'John',
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ 
            error: 'Phone number already exists' 
          }),
        });
      global.fetch = mockFetch as any;
      
      const state = encodeURIComponent(JSON.stringify({ phone: '0712345678' }));
      const request = new Request(`https://example.com/google/waitlist/callback?code=test123&state=${state}`);
      
      const response = await loader({ request, params: {}, context: {} });
      
      expect(response.status).toBe(302);
      const location = response.headers.get('Location');
      expect(location).toContain('error=');
    });
  });

  describe('Partial Data Handling', () => {
    it('should redirect with prefilled data when phone is missing', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            email: 'test@example.com',
            first_name: 'John',
          }),
        })
      ) as any;
      
      const request = new Request('https://example.com/google/waitlist/callback?code=test123');
      
      const response = await loader({ request, params: {}, context: {} });
      
      expect(response.status).toBe(302);
      const location = response.headers.get('Location');
      expect(location).toContain('/?');
      expect(location).toContain('waitlist=1');
      expect(location).toMatch(/email=test(%40|@)example\.com/);
      expect(location).toContain('first_name=John');
      expect(location).not.toContain('success=1');
    });

    it('should handle missing email', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            first_name: 'John',
          }),
        })
      ) as any;
      
      const state = encodeURIComponent(JSON.stringify({ phone: '0712345678' }));
      const request = new Request(`https://example.com/google/waitlist/callback?code=test123&state=${state}`);
      
      const response = await loader({ request, params: {}, context: {} });
      
      expect(response.status).toBe(302);
      const location = response.headers.get('Location');
      expect(location).toContain('/?waitlist=1');
      expect(location).not.toContain('success=1');
    });

    it('should handle missing first name', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            email: 'test@example.com',
          }),
        })
      ) as any;
      
      const state = encodeURIComponent(JSON.stringify({ phone: '0712345678' }));
      const request = new Request(`https://example.com/google/waitlist/callback?code=test123&state=${state}`);
      
      const response = await loader({ request, params: {}, context: {} });
      
      expect(response.status).toBe(302);
      const location = response.headers.get('Location');
      expect(location).toContain('/?waitlist=1');
      expect(location).not.toContain('success=1');
    });
  });

  describe('Field Name Variations', () => {
    it('should handle Email field (capitalized)', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            Email: 'test@example.com',
            FirstName: 'John',
          }),
        })
      ) as any;
      
      const request = new Request('https://example.com/google/waitlist/callback?code=test123');
      
      const response = await loader({ request, params: {}, context: {} });
      
      expect(response.status).toBe(302);
      const location = response.headers.get('Location');
      expect(location).toMatch(/email=test(%40|@)example\.com/);
      expect(location).toContain('first_name=John');
    });

    it('should handle firstName field (camelCase)', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            email: 'test@example.com',
            firstName: 'John',
          }),
        })
      ) as any;
      
      const request = new Request('https://example.com/google/waitlist/callback?code=test123');
      
      const response = await loader({ request, params: {}, context: {} });
      
      expect(response.status).toBe(302);
      const location = response.headers.get('Location');
      expect(location).toContain('first_name=John');
    });

    it('should prioritize Email over email', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            Email: 'priority@example.com',
            email: 'fallback@example.com',
            FirstName: 'John',
          }),
        })
      ) as any;
      
      const request = new Request('https://example.com/google/waitlist/callback?code=test123');
      
      const response = await loader({ request, params: {}, context: {} });
      
      expect(response.status).toBe(302);
      const location = response.headers.get('Location');
      expect(location).toMatch(/email=priority(%40|@)example\.com/);
    });
  });

  describe('State Parsing', () => {
    it('should handle invalid state JSON gracefully', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            email: 'test@example.com',
            first_name: 'John',
          }),
        })
      ) as any;
      
      const request = new Request('https://example.com/google/waitlist/callback?code=test123&state=invalid-json');
      
      const response = await loader({ request, params: {}, context: {} });
      
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toContain('/?waitlist=1');
    });

    it('should handle empty state', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            email: 'test@example.com',
            first_name: 'John',
          }),
        })
      ) as any;
      
      const request = new Request('https://example.com/google/waitlist/callback?code=test123&state=');
      
      const response = await loader({ request, params: {}, context: {} });
      
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toContain('/?waitlist=1');
    });

    it('should handle state with special characters', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            email: 'test@example.com',
            first_name: 'John',
          }),
        })
      ) as any;
      
      const state = encodeURIComponent(JSON.stringify({ 
        phone: '+254712345678',
        message: 'Hello & welcome!' 
      }));
      const request = new Request(`https://example.com/google/waitlist/callback?code=test123&state=${state}`);
      
      const response = await loader({ request, params: {}, context: {} });
      
      expect(response.status).toBe(302);
    });
  });

  describe('API Integration', () => {
    it('should call Google signin endpoint with waitlist flow', async () => {
      const mockFetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            email: 'test@example.com',
            first_name: 'John',
          }),
        })
      ) as any;
      global.fetch = mockFetch;
      
      const request = new Request('https://example.com/google/waitlist/callback?code=test123');
      
      await loader({ request, params: {}, context: {} });
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/auth/google/signin'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.flow).toBe('waitlist');
      expect(callBody.code).toBe('test123');
    });

    it('should call waitlist creation endpoint with correct data', async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            email: 'test@example.com',
            first_name: 'John',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      global.fetch = mockFetch as any;
      
      const state = encodeURIComponent(JSON.stringify({ 
        phone: '0712345678',
        message: 'Test message' 
      }));
      const request = new Request(`https://example.com/google/waitlist/callback?code=test123&state=${state}`);
      
      await loader({ request, params: {}, context: {} });
      
      expect(mockFetch).toHaveBeenCalledTimes(2);
      const waitlistCall = mockFetch.mock.calls[1];
      expect(waitlistCall[0]).toContain('/api/v1/waitlist');
      
      const body = JSON.parse(waitlistCall[1].body);
      expect(body.phone).toBe('0712345678');
      expect(body.email).toBe('test@example.com');
      expect(body.first_name).toBe('John');
      expect(body.message).toBe('Test message');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty message in state', async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            email: 'test@example.com',
            first_name: 'John',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      global.fetch = mockFetch as any;
      
      const state = encodeURIComponent(JSON.stringify({ phone: '0712345678' }));
      const request = new Request(`https://example.com/google/waitlist/callback?code=test123&state=${state}`);
      
      await loader({ request, params: {}, context: {} });
      
      const body = JSON.parse(mockFetch.mock.calls[1][1].body);
      expect(body.message).toBe('');
    });

    it('should handle waitlist creation with validation errors', async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            email: 'test@example.com',
            first_name: 'John',
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ 
            errors: { 
              phone: 'Invalid phone number',
              email: 'Email already exists' 
            } 
          }),
        });
      global.fetch = mockFetch as any;
      
      const state = encodeURIComponent(JSON.stringify({ phone: 'invalid' }));
      const request = new Request(`https://example.com/google/waitlist/callback?code=test123&state=${state}`);
      
      const response = await loader({ request, params: {}, context: {} });
      
      expect(response.status).toBe(302);
      const location = response.headers.get('Location');
      expect(location).toContain('error=');
    });

    it('should handle special characters in names', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            email: 'test@example.com',
            first_name: "O'Brien",
          }),
        })
      ) as any;
      
      const request = new Request('https://example.com/google/waitlist/callback?code=test123');
      
      const response = await loader({ request, params: {}, context: {} });
      
      expect(response.status).toBe(302);
      const location = response.headers.get('Location');
      expect(location).toContain('first_name=');
    });
  });
});
