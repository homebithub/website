/**
 * API Configuration
 * 
 * Centralized configuration for all API endpoints.
 * Update API_BASE_URL to switch between development and production.
 */

const normalizeGatewayBaseUrl = (url: string): string => {
  return url
    .replace(/\/+$/, '')
    .replace(/\/(auth|payments|notifications)$/i, '')
    .replace(/\/api(?:\/v1)?$/i, '');
};

const resolveGatewayBaseCandidate = (url?: string): string | undefined => {
  if (!url) return undefined;

  const normalized = normalizeGatewayBaseUrl(url);

  try {
    const parsed = new URL(normalized);
    const host = parsed.hostname.toLowerCase();
    if (host === 'homebit.co.ke' || host === 'www.homebit.co.ke') {
      return `${parsed.protocol}//api.homebit.co.ke`;
    }
  } catch {
    // Fall through to existing behavior for malformed URLs
  }

  if (typeof window !== 'undefined') {
    const localHostLike = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalized);
    if (localHostLike && normalized === window.location.origin) {
      const fallback = `${window.location.protocol}//${window.location.hostname}:8080`;
      console.warn('[API Config] Ignoring API base matching frontend origin in local dev; falling back to:', fallback);
      return fallback;
    }
  }

  return normalized;
};

// Get auth service base URL from environment or use default
const getAuthApiBaseUrl = (): string => {
  // Check if running in browser
  if (typeof window !== 'undefined') {
    const gatewayUrl = (window as any).ENV?.GATEWAY_API_BASE_URL;
    console.log('[API Config] Browser - window.ENV.GATEWAY_API_BASE_URL:', gatewayUrl);
    const resolvedGatewayUrl = resolveGatewayBaseCandidate(gatewayUrl);
    if (resolvedGatewayUrl) return resolvedGatewayUrl;

    // Try to get from window.ENV (set in root.tsx)
    const envUrl = (window as any).ENV?.AUTH_API_BASE_URL;
    console.log('[API Config] Browser - window.ENV.AUTH_API_BASE_URL:', envUrl);
    const resolvedEnvUrl = resolveGatewayBaseCandidate(envUrl);
    if (resolvedEnvUrl) return resolvedEnvUrl;
  }
  
  // Check environment variable
  if (typeof process !== 'undefined' && process.env.AUTH_API_BASE_URL) {
    console.log('[API Config] Server - process.env.AUTH_API_BASE_URL:', process.env.AUTH_API_BASE_URL);
    const resolved = resolveGatewayBaseCandidate(process.env.AUTH_API_BASE_URL);
    if (resolved) return resolved;
  }

  if (typeof process !== 'undefined' && process.env.GATEWAY_API_BASE_URL) {
    console.log('[API Config] Server - process.env.GATEWAY_API_BASE_URL:', process.env.GATEWAY_API_BASE_URL);
    const resolved = resolveGatewayBaseCandidate(process.env.GATEWAY_API_BASE_URL);
    if (resolved) return resolved;
  }
  
  // Default to production API host
  console.warn('[API Config] No AUTH_API_BASE_URL environment variable found, using production URL');
  return 'https://api.homebit.co.ke';
};

const normalizeNotificationsBaseUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  const trimmed = url.replace(/\/+$/, '');
  if (trimmed.includes('homebit.co.ke') && !trimmed.endsWith('/notifications')) {
    return `${trimmed}/notifications`;
  }
  return trimmed;
};

// Get notifications service base URL from environment or use default.
// This base URL should already include the /notifications prefix so that
// calling `${NOTIFICATIONS_API_BASE_URL}/api/v1/...` yields /notifications/api/v1/...
const getNotificationsApiBaseUrl = (): string => {
  // Check if running in browser
  if (typeof window !== 'undefined') {
    const gatewayUrl = (window as any).ENV?.GATEWAY_API_BASE_URL;
    console.log('[API Config] Browser - window.ENV.GATEWAY_API_BASE_URL:', gatewayUrl);
    const resolvedGatewayUrl = resolveGatewayBaseCandidate(gatewayUrl);
    if (resolvedGatewayUrl) return resolvedGatewayUrl;

    const envUrl = (window as any).ENV?.NOTIFICATIONS_API_BASE_URL;
    console.log('[API Config] Browser - window.ENV.NOTIFICATIONS_API_BASE_URL:', envUrl);
    const resolvedEnvUrl = resolveGatewayBaseCandidate(envUrl);
    if (resolvedEnvUrl) return resolvedEnvUrl;
  }

  // Check environment variable
  if (typeof process !== 'undefined' && process.env.NOTIFICATIONS_API_BASE_URL) {
    console.log('[API Config] Server - process.env.NOTIFICATIONS_API_BASE_URL:', process.env.NOTIFICATIONS_API_BASE_URL);
    const resolved = resolveGatewayBaseCandidate(process.env.NOTIFICATIONS_API_BASE_URL);
    if (resolved) return resolved;
  }

  if (typeof process !== 'undefined' && process.env.GATEWAY_API_BASE_URL) {
    console.log('[API Config] Server - process.env.GATEWAY_API_BASE_URL:', process.env.GATEWAY_API_BASE_URL);
    const resolved = resolveGatewayBaseCandidate(process.env.GATEWAY_API_BASE_URL);
    if (resolved) return resolved;
  }

  // Default to production API host
  console.warn('[API Config] No NOTIFICATIONS_API_BASE_URL environment variable found, using production /notifications URL');
  return 'https://api.homebit.co.ke';
};

const getNotificationsWsBaseUrl = (): string => {
  // Check if running in browser
  if (typeof window !== 'undefined') {
    const envUrl = (window as any).ENV?.NOTIFICATIONS_WS_BASE_URL;
    console.log('[API Config] Browser - window.ENV.NOTIFICATIONS_WS_BASE_URL:', envUrl);
    const normalizedBrowserUrl = normalizeNotificationsBaseUrl(envUrl);
    if (normalizedBrowserUrl) return normalizedBrowserUrl;
  }

  // Check environment variable
  if (typeof process !== 'undefined' && process.env.NOTIFICATIONS_WS_BASE_URL) {
    console.log('[API Config] Server - process.env.NOTIFICATIONS_WS_BASE_URL:', process.env.NOTIFICATIONS_WS_BASE_URL);
    const normalizedServerUrl = normalizeNotificationsBaseUrl(process.env.NOTIFICATIONS_WS_BASE_URL);
    if (normalizedServerUrl) return normalizedServerUrl;
  }

  // Default to direct WebSocket path for real-time chat
  console.warn('[API Config] No NOTIFICATIONS_WS_BASE_URL environment variable found, using direct WebSocket URL');
  return 'https://api.homebit.co.ke/ws';
};

// Get payments service base URL from environment or use default
const getPaymentsApiBaseUrl = (): string => {
  // Check if running in browser
  if (typeof window !== 'undefined') {
    const gatewayUrl = (window as any).ENV?.GATEWAY_API_BASE_URL;
    console.log('[API Config] Browser - window.ENV.GATEWAY_API_BASE_URL:', gatewayUrl);
    const resolvedGatewayUrl = resolveGatewayBaseCandidate(gatewayUrl);
    if (resolvedGatewayUrl) return resolvedGatewayUrl;

    const envUrl = (window as any).ENV?.PAYMENTS_API_BASE_URL;
    console.log('[API Config] Browser - window.ENV.PAYMENTS_API_BASE_URL:', envUrl);
    const resolvedEnvUrl = resolveGatewayBaseCandidate(envUrl);
    if (resolvedEnvUrl) return resolvedEnvUrl;
  }

  // Check environment variable
  if (typeof process !== 'undefined' && process.env.PAYMENTS_API_BASE_URL) {
    console.log('[API Config] Server - process.env.PAYMENTS_API_BASE_URL:', process.env.PAYMENTS_API_BASE_URL);
    const resolved = resolveGatewayBaseCandidate(process.env.PAYMENTS_API_BASE_URL);
    if (resolved) return resolved;
  }

  if (typeof process !== 'undefined' && process.env.GATEWAY_API_BASE_URL) {
    console.log('[API Config] Server - process.env.GATEWAY_API_BASE_URL:', process.env.GATEWAY_API_BASE_URL);
    const resolved = resolveGatewayBaseCandidate(process.env.GATEWAY_API_BASE_URL);
    if (resolved) return resolved;
  }

  // Default to production API host
  console.warn('[API Config] No PAYMENTS_API_BASE_URL environment variable found, using production /payments URL');
  return 'https://api.homebit.co.ke';
};

// Base URLs for each service
export const AUTH_API_BASE_URL = getAuthApiBaseUrl();
export const NOTIFICATIONS_API_BASE_URL = getNotificationsApiBaseUrl();
export const PAYMENTS_API_BASE_URL = getPaymentsApiBaseUrl();
export const NOTIFICATIONS_WS_BASE_URL = getNotificationsWsBaseUrl();

// Legacy API_BASE_URL for backward compatibility (points to auth service)
export const API_BASE_URL = AUTH_API_BASE_URL;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  auth: {
    me: `${AUTH_API_BASE_URL}/api/v1/auth/me`,
    login: `${AUTH_API_BASE_URL}/api/v1/auth/login`,
    signup: `${AUTH_API_BASE_URL}/api/v1/auth/register`,
    forgotPassword: `${AUTH_API_BASE_URL}/api/v1/auth/forgot-password`,
    resetPassword: `${AUTH_API_BASE_URL}/api/v1/auth/reset-password`,
    verifyEmail: `${AUTH_API_BASE_URL}/api/v1/auth/verify-email`,
    verifyOtp: `${AUTH_API_BASE_URL}/api/v1/verifications/verify-otp`,
    updateEmail: `${AUTH_API_BASE_URL}/api/v1/auth/update-email`,
    changePassword: `${AUTH_API_BASE_URL}/api/v1/auth/change-password`,
    googleCallback: `${AUTH_API_BASE_URL}/api/v1/auth/google/callback`,
    googleSignIn: `${AUTH_API_BASE_URL}/api/v1/auth/google/signin`,
    googleUrl: `${AUTH_API_BASE_URL}/api/v1/auth/google/url`,
    googleComplete: `${AUTH_API_BASE_URL}/api/v1/auth/google/complete`,
  },
  
  // Profile endpoints
  profile: {
    househelp: {
      me: `${AUTH_API_BASE_URL}/api/v1/profile/househelp/me`,
      update: `${AUTH_API_BASE_URL}/api/v1/househelps/me/fields`,
      byId: (id: string) => `${AUTH_API_BASE_URL}/api/v1/househelps/${id}/profile_with_user`,
    },
    household: {
      me: `${AUTH_API_BASE_URL}/api/v1/profile/household/me`,
      update: `${AUTH_API_BASE_URL}/api/v1/household/profile`,
    },
  },
  
  // Images endpoints
  images: {
    upload: `${AUTH_API_BASE_URL}/api/v1/images/upload`,
    user: `${AUTH_API_BASE_URL}/api/v1/images/user`,
    userById: (userId: string) => `${AUTH_API_BASE_URL}/api/v1/images/user/${userId}`,
    delete: (imageId: string) => `${AUTH_API_BASE_URL}/api/v1/images/${imageId}`,
  },
  
  // Shortlist endpoints
  shortlists: {
    base: `${AUTH_API_BASE_URL}/api/v1/shortlists`,
    exists: (profileId: string) => `${AUTH_API_BASE_URL}/api/v1/shortlists/exists/${profileId}`,
    byId: (profileId: string) => `${AUTH_API_BASE_URL}/api/v1/shortlists/${profileId}`,
  },
  
  // Profile view tracking
  profileView: {
    record: `${AUTH_API_BASE_URL}/api/v1/profile-view/record`,
  },
  
  // User settings
  users: {
    settings: `${AUTH_API_BASE_URL}/auth/users/settings`,
  },
  
  // Contact
  contact: `${AUTH_API_BASE_URL}/api/v1/contact`,
  
  // Waitlist
  waitlist: {
    join: `${AUTH_API_BASE_URL}/api/v1/waitlist`,
    google: `${AUTH_API_BASE_URL}/api/v1/waitlist/google`,
  },
  
  // Hiring system endpoints
  hiring: {
    requests: {
      base: `${AUTH_API_BASE_URL}/api/v1/hire-requests`,
      byId: (id: string) => `${AUTH_API_BASE_URL}/api/v1/hire-requests/${id}`,
      accept: (id: string) => `${AUTH_API_BASE_URL}/api/v1/hire-requests/${id}/accept`,
      decline: (id: string) => `${AUTH_API_BASE_URL}/api/v1/hire-requests/${id}/decline`,
      finalize: (id: string) => `${AUTH_API_BASE_URL}/api/v1/hire-requests/${id}/finalize`,
      negotiate: (id: string) => `${AUTH_API_BASE_URL}/api/v1/hire-requests/${id}/negotiate`,
      negotiations: (id: string) => `${AUTH_API_BASE_URL}/api/v1/hire-requests/${id}/negotiations`,
    },
    contracts: {
      base: `${AUTH_API_BASE_URL}/api/v1/hire-contracts`,
      byId: (id: string) => `${AUTH_API_BASE_URL}/api/v1/hire-contracts/${id}`,
      complete: (id: string) => `${AUTH_API_BASE_URL}/api/v1/hire-contracts/${id}/complete`,
      terminate: (id: string) => `${AUTH_API_BASE_URL}/api/v1/hire-contracts/${id}/terminate`,
    },
  },
  
  // Interest endpoints (househelps showing interest in households)
  interests: {
    base: `${AUTH_API_BASE_URL}/api/v1/interests`,
    byId: (id: string) => `${AUTH_API_BASE_URL}/api/v1/interests/${id}`,
    exists: (householdId: string) => `${AUTH_API_BASE_URL}/api/v1/interests/exists/${householdId}`,
    household: `${AUTH_API_BASE_URL}/api/v1/interests/household`,
    househelp: `${AUTH_API_BASE_URL}/api/v1/interests/househelp`,
    count: `${AUTH_API_BASE_URL}/api/v1/interests/count`,
    markViewed: (id: string) => `${AUTH_API_BASE_URL}/api/v1/interests/${id}/viewed`,
    accept: (id: string) => `${AUTH_API_BASE_URL}/api/v1/interests/${id}/accept`,
    decline: (id: string) => `${AUTH_API_BASE_URL}/api/v1/interests/${id}/decline`,
  },
  
  // Payments & Subscriptions endpoints (routed through gateway → gRPC)
  payments: {
    plans: `${AUTH_API_BASE_URL}/api/v1/plans`,
    planById: (id: string) => `${AUTH_API_BASE_URL}/api/v1/plans/${id}`,
    checkout: `${AUTH_API_BASE_URL}/api/v1/payments/checkout`,
    subscriptions: {
      create: `${AUTH_API_BASE_URL}/api/v1/subscriptions`,
      mine: `${AUTH_API_BASE_URL}/api/v1/subscriptions/mine`,
      list: `${AUTH_API_BASE_URL}/api/v1/subscriptions/list`,
      byId: (id: string) => `${AUTH_API_BASE_URL}/api/v1/subscriptions/${id}`,
      cancel: (id: string) => `${AUTH_API_BASE_URL}/api/v1/subscriptions/${id}/cancel`,
    },
    transactions: {
      initiate: `${AUTH_API_BASE_URL}/api/v1/payments`,
      list: `${AUTH_API_BASE_URL}/api/v1/payments`,
      byId: (id: string) => `${AUTH_API_BASE_URL}/api/v1/payments/${id}`,
      status: (id: string) => `${AUTH_API_BASE_URL}/api/v1/payments/${id}/status`,
    },
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
  PAYMENTS_BASE_URL: PAYMENTS_API_BASE_URL,
  BASE_URL: API_BASE_URL, // Legacy - points to auth service
  ENDPOINTS: API_ENDPOINTS,
  buildUrl: buildApiUrl,
  getAuthHeaders,
  fetch: apiFetch,
};
