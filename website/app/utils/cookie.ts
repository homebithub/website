import cookie from "cookie";

/**
 * Utility for unified cookie management (client and server).
 */

const TOKEN_COOKIE_NAME = "hb_token";
const USER_COOKIE_NAME = "hb_user";

export const cookieOptions: cookie.CookieSerializeOptions = {
  path: "/",
  httpOnly: false, // Must be false for client-side access during hydration, but ideally true if using only server actions
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export const setAuthCookies = (token: string, user: any) => {
  if (typeof document !== "undefined") {
    document.cookie = cookie.serialize(TOKEN_COOKIE_NAME, token, cookieOptions);
    document.cookie = cookie.serialize(USER_COOKIE_NAME, JSON.stringify(user), cookieOptions);
  }
};

export const clearAuthCookies = () => {
  if (typeof document !== "undefined") {
    document.cookie = cookie.serialize(TOKEN_COOKIE_NAME, "", { ...cookieOptions, maxAge: 0 });
    document.cookie = cookie.serialize(USER_COOKIE_NAME, "", { ...cookieOptions, maxAge: 0 });
  }
};

export const getAuthFromCookies = (cookieHeader?: string | null) => {
  const cookies = cookie.parse(cookieHeader || (typeof document !== "undefined" ? document.cookie : ""));
  const token = cookies[TOKEN_COOKIE_NAME];
  const userStr = cookies[USER_COOKIE_NAME];
  let user = null;

  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      // Ignore
    }
  }

  return { token, user };
};
