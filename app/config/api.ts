/**
 * API Configuration
 * 
 * Centralized configuration for all API endpoints.
 * Update API_BASE_URL to switch between development and production.
 */

// Get base URL from environment or use default
const getApiBaseUrl = (): string => {
  // Check if running in browser
  if (typeof window !== 'undefined') {
    // Try to get from window.ENV (set in root.tsx)
    const envUrl = (window as any).ENV?.AUTH_API_BASE_URL;
    if (envUrl) return envUrl;
  }
  
  // Check environment variable
  if (typeof process !== 'undefined' && process.env.API_BASE_URL) {
    return process.env.API_BASE_URL;
  }
  
  // Default to production
  return 'https://api.homexpert.co.ke';
};

// Base URLs
export const API_BASE_URL = getApiBaseUrl();
export const AUTH_API_BASE_URL = `${API_BASE_URL}/auth`;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  auth: {
    me: `${API_BASE_URL}/api/v1/auth/me`,
    login: `${AUTH_API_BASE_URL}/login`,
    signup: `${AUTH_API_BASE_URL}/signup`,
    forgotPassword: `${AUTH_API_BASE_URL}/forgot-password`,
    resetPassword: `${AUTH_API_BASE_URL}/reset-password`,
    verifyEmail: `${AUTH_API_BASE_URL}/verify-email`,
    verifyOtp: `${AUTH_API_BASE_URL}/verify-otp`,
    updateEmail: `${AUTH_API_BASE_URL}/update-email`,
    changePassword: `${AUTH_API_BASE_URL}/change-password`,
    googleCallback: `${AUTH_API_BASE_URL}/google/callback`,
  },
  
  // Profile endpoints
  profile: {
    househelp: {
      me: `${API_BASE_URL}/api/v1/profile/househelp/me`,
      byId: (id: string) => `${API_BASE_URL}/api/v1/househelps/${id}/profile_with_user`,
    },
    employer: {
      me: `${API_BASE_URL}/api/v1/profile/employer/me`,
    },
  },
  
  // Images endpoints
  images: {
    upload: `${API_BASE_URL}/api/v1/images/upload`,
    user: `${API_BASE_URL}/api/v1/images/user`,
    userById: (userId: string) => `${API_BASE_URL}/api/v1/images/user/${userId}`,
    delete: (imageId: string) => `${API_BASE_URL}/api/v1/images/${imageId}`,
  },
  
  // Shortlist endpoints
  shortlists: {
    base: `${API_BASE_URL}/api/v1/shortlists`,
    exists: (profileId: string) => `${API_BASE_URL}/api/v1/shortlists/exists/${profileId}`,
    byId: (profileId: string) => `${API_BASE_URL}/api/v1/shortlists/${profileId}`,
  },
  
  // Profile view tracking
  profileView: {
    record: `${API_BASE_URL}/api/v1/profile-view/record`,
  },
  
  // User settings
  users: {
    settings: `${API_BASE_URL}/users/settings`,
  },
  
  // Contact
  contact: `${API_BASE_URL}/contact`,
  
  // Waitlist
  waitlist: {
    join: `${AUTH_API_BASE_URL}/waitlist/join`,
    google: `${AUTH_API_BASE_URL}/waitlist/google`,
  },
} as const;

/**
 * Helper function to build API URL with query parameters
 */
export const buildApiUrl = (baseUrl: string, params?: Record<string, string | number | boolean | undefined>): string => {
  if (!params) return baseUrl;
  
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

/**
 * Helper function to get auth headers
 */
export const getAuthHeaders = (token?: string | null): HeadersInit => {
  const authToken = token || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null);
  
  return {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  };
};

/**
 * Helper function for API fetch with auth
 */
export const apiFetch = async (
  url: string,
  options?: RequestInit & { token?: string }
): Promise<Response> => {
  const { token, ...fetchOptions } = options || {};
  
  const headers = {
    ...getAuthHeaders(token),
    ...fetchOptions.headers,
  };
  
  return fetch(url, {
    ...fetchOptions,
    headers,
  });
};

// Export for easy access
export default {
  BASE_URL: API_BASE_URL,
  AUTH_BASE_URL: AUTH_API_BASE_URL,
  ENDPOINTS: API_ENDPOINTS,
  buildUrl: buildApiUrl,
  getAuthHeaders,
  fetch: apiFetch,
};
