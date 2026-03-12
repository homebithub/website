/**
 * gRPC Configuration
 */

// Normalize Gateway Base URL
const normalizeGatewayBaseUrl = (url: string): string => {
  return url
    .replace(/\/+$/, '')
    .replace(/\/(auth|payments|notifications)$/i, '')
    .replace(/\/api(?:\/v1)?$/i, '');
};

const LOCAL_GATEWAY_PORT = '3005';

const getForcedBrowserLocalGatewayBaseUrl = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  const host = window.location.hostname.toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1') {
    return `${window.location.protocol}//${window.location.hostname}:${LOCAL_GATEWAY_PORT}`;
  }
  return undefined;
};

const resolveGatewayBaseCandidate = (url?: string): string | undefined => {
  if (!url) return undefined;
  const normalized = normalizeGatewayBaseUrl(url);

  if (typeof window !== 'undefined') {
    const localHostLike = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalized);
    if (localHostLike && normalized === window.location.origin) {
      const fallback = `${window.location.protocol}//${window.location.hostname}:8080`;
      return fallback;
    }
  }
  return normalized;
};

export const getGrpcBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const forcedLocalUrl = getForcedBrowserLocalGatewayBaseUrl();
    if (forcedLocalUrl) return forcedLocalUrl;

    const gatewayUrl = (window as any).ENV?.GATEWAY_API_BASE_URL;
    const resolved = resolveGatewayBaseCandidate(gatewayUrl);
    if (resolved) return resolved;
  }
  
  if (typeof process !== 'undefined' && process.env.GATEWAY_API_BASE_URL) {
    const resolved = resolveGatewayBaseCandidate(process.env.GATEWAY_API_BASE_URL);
    if (resolved) return resolved;
  }

  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    return `http://localhost:${LOCAL_GATEWAY_PORT}`;
  }
  
  return 'https://api.homebit.co.ke';
};
