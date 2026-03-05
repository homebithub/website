import cookie, { type SerializeOptions } from "cookie";

/**
 * Utility for unified cookie management (client and server).
 */

const TOKEN_COOKIE_NAME = "hb_token";
const REFRESH_TOKEN_COOKIE_NAME = "hb_refresh_token";
const USER_COOKIE_NAME = "hb_user";

const IS_PROD = process.env.NODE_ENV === "production";

export const cookieOptions: SerializeOptions = {
  path: "/",
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

export const setAuthCookies = (token: string, refreshToken: string, user: any) => {
  if (typeof document !== "undefined") {
    document.cookie = cookie.serialize(TOKEN_COOKIE_NAME, token, accessTokenOptions);
    document.cookie = cookie.serialize(REFRESH_TOKEN_COOKIE_NAME, refreshToken, refreshTokenOptions);
    document.cookie = cookie.serialize(USER_COOKIE_NAME, JSON.stringify(user), cookieOptions);
  }
};

export const clearAuthCookies = () => {
  if (typeof document !== "undefined") {
    document.cookie = cookie.serialize(TOKEN_COOKIE_NAME, "", { ...accessTokenOptions, maxAge: 0 });
    document.cookie = cookie.serialize(REFRESH_TOKEN_COOKIE_NAME, "", { ...refreshTokenOptions, maxAge: 0 });
    document.cookie = cookie.serialize(USER_COOKIE_NAME, "", { ...cookieOptions, maxAge: 0 });
  }
};

export const getAuthFromCookies = (cookieHeader?: string | null) => {
  const cookies = cookie.parse(cookieHeader || (typeof document !== "undefined" ? document.cookie : ""));
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
