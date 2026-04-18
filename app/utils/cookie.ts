export interface SerializeOptions {
  path?: string;
  domain?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
  maxAge?: number;
}

const normalizeSameSite = (sameSite?: SerializeOptions["sameSite"]) => {
  if (!sameSite) return undefined;
  if (sameSite === "lax") return "Lax";
  if (sameSite === "strict") return "Strict";
  return "None";
};

export const serializeCookie = (name: string, value: string, options: SerializeOptions = {}) => {
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];

  if (typeof options.maxAge === "number") {
    parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
  }
  if (options.path) {
    parts.push(`Path=${options.path}`);
  }
  if (options.domain) {
    parts.push(`Domain=${options.domain}`);
  }
  const sameSite = normalizeSameSite(options.sameSite);
  if (sameSite) {
    parts.push(`SameSite=${sameSite}`);
  }
  if (options.secure) {
    parts.push("Secure");
  }
  if (options.httpOnly) {
    // Browsers ignore HttpOnly when set from JS, but keep for API compatibility.
    parts.push("HttpOnly");
  }

  return parts.join("; ");
};

const parseCookies = (raw: string) => {
  const parsed: Record<string, string> = {};
  if (!raw) return parsed;

  for (const segment of raw.split(";")) {
    const part = segment.trim();
    if (!part) continue;
    const separatorIndex = part.indexOf("=");
    if (separatorIndex <= 0) continue;

    const key = decodeURIComponent(part.slice(0, separatorIndex).trim());
    const value = decodeURIComponent(part.slice(separatorIndex + 1).trim());
    parsed[key] = value;
  }

  return parsed;
};

/**
 * Utility for unified cookie management (client and server).
 */

export const TOKEN_COOKIE_NAME = "hb_token";
const REFRESH_TOKEN_COOKIE_NAME = "hb_refresh_token";
const USER_COOKIE_NAME = "hb_user";

const IS_PROD = process.env.NODE_ENV === "production";

// In production, set domain so cookies are sent to api.homebit.co.ke too.
const COOKIE_DOMAIN = IS_PROD ? ".homebit.co.ke" : undefined;

export const cookieOptions: SerializeOptions = {
  path: "/",
  domain: COOKIE_DOMAIN,
  httpOnly: false, // Default to false for client-side hydration
  secure: IS_PROD,
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

/**
 * Access token cookie options. 
 * In production, we use httpOnly for the access token to prevent XSS.
 * SSR loaders can still access it.
 */
export const accessTokenOptions: SerializeOptions = {
  ...cookieOptions,
  httpOnly: IS_PROD, 
};

/**
 * Refresh token cookie options.
 * ALWAYS httpOnly for security as it is only needed by the server/proxy.
 */
export const refreshTokenOptions: SerializeOptions = {
  ...cookieOptions,
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

export const setAuthCookies = (token: string, refreshToken: string | null | undefined, user: any) => {
  if (typeof document !== "undefined") {
    document.cookie = serializeCookie(TOKEN_COOKIE_NAME, token, accessTokenOptions);
    if (refreshToken) {
      document.cookie = serializeCookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, refreshTokenOptions);
    }
    document.cookie = serializeCookie(USER_COOKIE_NAME, JSON.stringify(user), cookieOptions);
  }
};

export const clearAuthCookies = () => {
  if (typeof document !== "undefined") {
    document.cookie = serializeCookie(TOKEN_COOKIE_NAME, "", { ...accessTokenOptions, maxAge: 0 });
    document.cookie = serializeCookie(REFRESH_TOKEN_COOKIE_NAME, "", { ...refreshTokenOptions, maxAge: 0 });
    document.cookie = serializeCookie(USER_COOKIE_NAME, "", { ...cookieOptions, maxAge: 0 });
    // Also clear any old cookies that were set without domain attribute
    document.cookie = serializeCookie(TOKEN_COOKIE_NAME, "", { ...accessTokenOptions, domain: undefined, maxAge: 0 });
    document.cookie = serializeCookie(USER_COOKIE_NAME, "", { ...cookieOptions, domain: undefined, maxAge: 0 });
  }
};

export const getAuthFromCookies = (cookieHeader?: string | null) => {
  const cookies = parseCookies(cookieHeader || (typeof document !== "undefined" ? document.cookie : ""));
  const token = cookies[TOKEN_COOKIE_NAME];
  const refreshToken = cookies[REFRESH_TOKEN_COOKIE_NAME];
  const userStr = cookies[USER_COOKIE_NAME];
  let user = null;

  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e: any) {
      // Ignore
    }
  }

  return { token, refreshToken, user };
};

export const getAccessTokenFromCookies = (cookieHeader?: string | null): string | undefined => {
  const token = getAuthFromCookies(cookieHeader).token;
  if (token) return token;
  // In production the access-token cookie is httpOnly, so client JS can't read it.
  // Fall back to localStorage where login / verify-otp / Google flows persist it.
  if (!cookieHeader && typeof window !== "undefined") {
    return localStorage.getItem("token") || undefined;
  }
  return undefined;
};
