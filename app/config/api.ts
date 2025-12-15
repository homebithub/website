/**
 * API Configuration
 * 
 * Centralized configuration for all API endpoints.
 * Update API_BASE_URL to switch between development and production.
 */

// Get auth service base URL from environment or use default
const getAuthApiBaseUrl = (): string => {
  // Check if running in browser
  if (typeof window !== 'undefined') {
    // Try to get from window.ENV (set in root.tsx)
    const envUrl = (window as any).ENV?.AUTH_API_BASE_URL;
    console.log('[API Config] Browser - window.ENV.AUTH_API_BASE_URL:', envUrl);
    if (envUrl) return envUrl;
  }
  
  // Check environment variable
  if (typeof process !== 'undefined' && process.env.AUTH_API_BASE_URL) {
    console.log('[API Config] Server - process.env.AUTH_API_BASE_URL:', process.env.AUTH_API_BASE_URL);
    return process.env.AUTH_API_BASE_URL;
  }
  
  // Default to production
  console.warn('[API Config] No AUTH_API_BASE_URL environment variable found, using production URL');
  return 'https://homebit.co.ke/auth';
};

// Get notifications service base URL from environment or use default
const getNotificationsApiBaseUrl = (): string => {
  // Check if running in browser
  if (typeof window !== 'undefined') {
    const envUrl = (window as any).ENV?.NOTIFICATIONS_API_BASE_URL;
    console.log('[API Config] Browser - window.ENV.NOTIFICATIONS_API_BASE_URL:', envUrl);
    if (envUrl) return envUrl;
  }

  // Check environment variable
  if (typeof process !== 'undefined' && process.env.NOTIFICATIONS_API_BASE_URL) {
    console.log('[API Config] Server - process.env.NOTIFICATIONS_API_BASE_URL:', process.env.NOTIFICATIONS_API_BASE_URL);
    return process.env.NOTIFICATIONS_API_BASE_URL;
  }

  // Default to production
  console.warn('[API Config] No NOTIFICATIONS_API_BASE_URL environment variable found, using production URL');
  return 'https://homebit.co.ke/notifications';
};

// Base URLs for each service
export const AUTH_API_BASE_URL = getAuthApiBaseUrl();
export const NOTIFICATIONS_API_BASE_URL = getNotificationsApiBaseUrl();

// Legacy API_BASE_URL for backward compatibility (points to auth service)
export const API_BASE_URL = AUTH_API_BASE_URL;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  auth: {
    me: `${AUTH_API_BASE_URL}/auth/api/v1/auth/me`,
    login: `${AUTH_API_BASE_URL}/auth/api/v1/auth/login`,
    signup: `${AUTH_API_BASE_URL}/auth/api/v1/auth/register`,
    forgotPassword: `${AUTH_API_BASE_URL}/auth/api/v1/auth/forgot-password`,
    resetPassword: `${AUTH_API_BASE_URL}/auth/api/v1/auth/reset-password`,
    verifyEmail: `${AUTH_API_BASE_URL}/auth/api/v1/auth/verify-email`,
    verifyOtp: `${AUTH_API_BASE_URL}/auth/api/v1/verifications/verify-otp`,
    updateEmail: `${AUTH_API_BASE_URL}/auth/api/v1/auth/update-email`,
    changePassword: `${AUTH_API_BASE_URL}/auth/api/v1/auth/change-password`,
    googleCallback: `${AUTH_API_BASE_URL}/auth/api/v1/auth/google/callback`,
    googleSignIn: `${AUTH_API_BASE_URL}/auth/api/v1/auth/google/signin`,
    googleUrl: `${AUTH_API_BASE_URL}/auth/api/v1/auth/google/url`,
    googleComplete: `${AUTH_API_BASE_URL}/auth/api/v1/auth/google/complete`,
  },
  
  // Profile endpoints
  profile: {
    househelp: {
      me: `${AUTH_API_BASE_URL}/auth/api/v1/profile/househelp/me`,
      byId: (id: string) => `${AUTH_API_BASE_URL}/auth/api/v1/househelps/${id}/profile_with_user`,
    },
    household: {
      me: `${AUTH_API_BASE_URL}/auth/api/v1/profile/household/me`,
    },
  },
  
  // Images endpoints
  images: {
    upload: `${AUTH_API_BASE_URL}/auth/api/v1/images/upload`,
    user: `${AUTH_API_BASE_URL}/auth/api/v1/images/user`,
    userById: (userId: string) => `${AUTH_API_BASE_URL}/auth/api/v1/images/user/${userId}`,
    delete: (imageId: string) => `${AUTH_API_BASE_URL}/auth/api/v1/images/${imageId}`,
  },
  
  // Shortlist endpoints
  shortlists: {
    base: `${AUTH_API_BASE_URL}/auth/api/v1/shortlists`,
    exists: (profileId: string) => `${AUTH_API_BASE_URL}/auth/api/v1/shortlists/exists/${profileId}`,
    byId: (profileId: string) => `${AUTH_API_BASE_URL}/auth/api/v1/shortlists/${profileId}`,
  },
  
  // Profile view tracking
  profileView: {
    record: `${AUTH_API_BASE_URL}/auth/api/v1/profile-view/record`,
  },
  
  // User settings
  users: {
    settings: `${AUTH_API_BASE_URL}/auth/users/settings`,
  },
  
  // Contact
  contact: `${AUTH_API_BASE_URL}/auth/contact`,
  
  // Waitlist
  waitlist: {
    join: `${AUTH_API_BASE_URL}/auth/api/v1/waitlist`,
    google: `${AUTH_API_BASE_URL}/auth/api/v1/waitlist/google`,
  },
  
  // Hiring system endpoints
  hiring: {
    requests: {
      base: `${AUTH_API_BASE_URL}/auth/api/v1/hire-requests`,
      byId: (id: string) => `${AUTH_API_BASE_URL}/auth/api/v1/hire-requests/${id}`,
      accept: (id: string) => `${AUTH_API_BASE_URL}/auth/api/v1/hire-requests/${id}/accept`,
      decline: (id: string) => `${AUTH_API_BASE_URL}/auth/api/v1/hire-requests/${id}/decline`,
      finalize: (id: string) => `${AUTH_API_BASE_URL}/auth/api/v1/hire-requests/${id}/finalize`,
      negotiate: (id: string) => `${AUTH_API_BASE_URL}/auth/api/v1/hire-requests/${id}/negotiate`,
      negotiations: (id: string) => `${AUTH_API_BASE_URL}/auth/api/v1/hire-requests/${id}/negotiations`,
    },
    contracts: {
      base: `${AUTH_API_BASE_URL}/auth/api/v1/hire-contracts`,
      byId: (id: string) => `${AUTH_API_BASE_URL}/auth/api/v1/hire-contracts/${id}`,
      complete: (id: string) => `${AUTH_API_BASE_URL}/auth/api/v1/hire-contracts/${id}/complete`,
      terminate: (id: string) => `${AUTH_API_BASE_URL}/auth/api/v1/hire-contracts/${id}/terminate`,
    },
  },
  
  // Interest endpoints (househelps showing interest in households)
  interests: {
    base: `${AUTH_API_BASE_URL}/auth/api/v1/interests`,
    byId: (id: string) => `${AUTH_API_BASE_URL}/auth/api/v1/interests/${id}`,
    exists: (householdId: string) => `${AUTH_API_BASE_URL}/auth/api/v1/interests/exists/${householdId}`,
    household: `${AUTH_API_BASE_URL}/auth/api/v1/interests/household`,
    househelp: `${AUTH_API_BASE_URL}/auth/api/v1/interests/househelp`,
    count: `${AUTH_API_BASE_URL}/auth/api/v1/interests/count`,
    markViewed: (id: string) => `${AUTH_API_BASE_URL}/auth/api/v1/interests/${id}/viewed`,
    accept: (id: string) => `${AUTH_API_BASE_URL}/auth/api/v1/interests/${id}/accept`,
    decline: (id: string) => `${AUTH_API_BASE_URL}/auth/api/v1/interests/${id}/decline`,
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
  AUTH_BASE_URL: AUTH_API_BASE_URL,
  NOTIFICATIONS_BASE_URL: NOTIFICATIONS_API_BASE_URL,
  BASE_URL: API_BASE_URL, // Legacy - points to auth service
  ENDPOINTS: API_ENDPOINTS,
  buildUrl: buildApiUrl,
  getAuthHeaders,
  fetch: apiFetch,
};
