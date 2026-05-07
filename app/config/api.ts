/**
 * API Configuration
 *
 * Single gateway base URL resolution. All services (auth, notifications,
 * payments) are accessed through the same gateway.
 */

import { getStoredAccessToken } from '~/utils/authStorage';

const LOCAL_GATEWAY_PORT = '3005';
const PRODUCTION_GATEWAY = 'https://api.homebit.co.ke';

/**
 * Resolve the gateway base URL. Hierarchy:
 *  1. Browser localhost → http(s)://localhost:3005
 *  2. window.ENV.GATEWAY_API_BASE_URL (injected by root.tsx)
 *  3. process.env.GATEWAY_API_BASE_URL (SSR)
 *  4. Non-production SSR → http://localhost:3005
 *  5. Fallback → https://api.homebit.co.ke
 */
const getGatewayBaseUrl = (): string => {
  // Browser: force localhost when running locally
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1') {
      return `${window.location.protocol}//${window.location.hostname}:${LOCAL_GATEWAY_PORT}`;
    }

    const envGateway = (window as any).ENV?.GATEWAY_API_BASE_URL;
    if (envGateway) return normalizeUrl(envGateway);
  }

  // SSR
  if (typeof process !== 'undefined') {
    const envUrl = process.env.GATEWAY_API_BASE_URL;
    if (envUrl) return normalizeUrl(envUrl);

    if (process.env.NODE_ENV !== 'production') {
      return `http://localhost:${LOCAL_GATEWAY_PORT}`;
    }
  }

  return PRODUCTION_GATEWAY;
};

export function normalizeGatewayBaseUrl(url: string): string {
  let out = url.replace(/\/+$/, '')
    .replace(/\/(auth|payments|notifications)$/i, '')
    .replace(/\/api(?:\/v1)?$/i, '');

  try {
    const parsed = new URL(out);
    const host = parsed.hostname.toLowerCase();
    if (host === 'homebit.co.ke' || host === 'www.homebit.co.ke') {
      return `${parsed.protocol}//api.homebit.co.ke`;
    }
  } catch { /* ignore */ }

  return out;
}

const normalizeUrl = normalizeGatewayBaseUrl;

// ── Exported base URLs ──────────────────────────────────────────────────
// All point to the same gateway; separate names kept for backward compat.
export const API_BASE_URL = getGatewayBaseUrl();
export const GATEWAY_API_BASE_URL = API_BASE_URL;
export const AUTH_API_BASE_URL = API_BASE_URL;
export const NOTIFICATIONS_API_BASE_URL = API_BASE_URL;
export const PAYMENTS_API_BASE_URL = API_BASE_URL;
export const NOTIFICATIONS_WS_BASE_URL = `${API_BASE_URL}/ws`;

// ── REST endpoints still in use (file uploads, SSR loaders, etc.) ───────
export const API_ENDPOINTS = {
  auth: {
    googleUrl: `${API_BASE_URL}/api/v1/auth/google/url`,
    googleComplete: `${API_BASE_URL}/api/v1/auth/google/complete`,
  },
  shortlists: {
    base: `${API_BASE_URL}/api/v1/shortlists`,
  },
  kyc: {
    submit: `${API_BASE_URL}/api/v1/kyc`,
  },
} as const;

/**
 * Helper function to get auth headers for REST fetch calls
 */
export const getAuthHeaders = (token?: string | null): HeadersInit => {
  const authToken = token || (typeof window !== 'undefined' ? getStoredAccessToken() : null);

  return {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  };
};
