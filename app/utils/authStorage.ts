import {
  clearAuthCookies,
  getAccessTokenFromCookies,
  getAuthFromCookies,
  setAuthCookies,
} from "~/utils/cookie";

type StoredUser = Record<string, any> | null;

const getStorage = (): Storage | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage;
};

const safeGet = (key: string): string | null => {
  try {
    return getStorage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

const safeSet = (key: string, value: string) => {
  try {
    getStorage()?.setItem(key, value);
  } catch {
    // Ignore unavailable storage.
  }
};

const safeRemove = (key: string) => {
  try {
    getStorage()?.removeItem(key);
  } catch {
    // Ignore unavailable storage.
  }
};

export const getStoredAccessToken = (): string | undefined => {
  const token = getAccessTokenFromCookies();
  if (token) return token;

  const storedToken = safeGet("token");
  return storedToken || undefined;
};

export const getStoredUser = (): StoredUser => {
  const { user } = getAuthFromCookies();
  if (user) return user;

  const rawUser = safeGet("user_object");
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
};

export const getStoredUserId = (): string => {
  const user = getStoredUser();
  if (user?.user_id || user?.id) {
    return user.user_id || user.id;
  }

  return safeGet("user_id") || "";
};

export const getStoredProfileType = (): string => {
  const user = getStoredUser();
  if (typeof user?.profile_type === "string" && user.profile_type) {
    return user.profile_type;
  }

  return safeGet("profile_type") || safeGet("userType") || "";
};

export const setStoredProfileType = (profileType: string | null | undefined) => {
  if (profileType) {
    safeSet("profile_type", profileType);
    safeSet("userType", profileType);
    return;
  }

  safeRemove("profile_type");
  safeRemove("userType");
};

export const cacheAuthSession = ({
  token,
  refreshToken,
  user,
  provider,
}: {
  token: string;
  refreshToken?: string | null;
  user?: Record<string, any> | null;
  provider?: string | null;
}) => {
  const cookieUser = user ?? getStoredUser() ?? {};

  setAuthCookies(token, refreshToken ?? null, cookieUser);
  safeSet("token", token);

  if (user) {
    safeSet("user_object", JSON.stringify(user));
    const userId = user.user_id || user.id;
    if (userId) {
      safeSet("user_id", userId);
    }
    setStoredProfileType(user.profile_type || null);
  }

  if (provider) {
    safeSet("auth_provider", provider);
  }
};

export const clearStoredAuthSession = () => {
  clearAuthCookies();
  safeRemove("token");
  safeRemove("user_object");
  safeRemove("user_id");
  safeRemove("profile_type");
  safeRemove("userType");
  safeRemove("auth_provider");
};
