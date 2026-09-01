import {
  clearAuthCookies,
  getAccessTokenFromCookies,
  getAuthFromCookies,
  setAuthCookies,
} from "~/utils/cookie";
import { normalizeProfileType } from "~/utils/profileType";

export { isServiceProviderProfileType, normalizeProfileType, profileTypesMatch } from "~/utils/profileType";

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

export const getStoredUserProfileId = (): string => {
  const user = getStoredUser();
  if (user?.user_profile_id || user?.userProfileId) {
    return user.user_profile_id || user.userProfileId;
  }

  return safeGet("user_profile_id") || "";
};

export const getStoredProfileType = (): string => {
  const user = getStoredUser();
  if (typeof user?.profile_type === "string" && user.profile_type) {
    return user.profile_type;
  }

  return safeGet("profile_type") || safeGet("userType") || "";
};

export const getStoredCanonicalProfileType = (): string => normalizeProfileType(getStoredProfileType());

export const setStoredProfileType = (profileType: string | null | undefined) => {
  if (profileType) {
    safeSet("profile_type", profileType);
    safeSet("userType", profileType);
    return;
  }

  safeRemove("profile_type");
  safeRemove("userType");
};

export const setStoredActiveUserProfileId = (userProfileId: string) => {
  const normalized = String(userProfileId || "").trim();
  if (!normalized) return;

  safeSet("user_profile_id", normalized);
  safeSet("household_id", normalized);

  const { token, refreshToken, user } = getAuthFromCookies();
  const storedUser = user ?? getStoredUser();
  if (!storedUser) return;

  const nextUser = {
    ...storedUser,
    user_profile_id: normalized,
    userProfileId: normalized,
    household_id: normalized,
  };
  safeSet("user_object", JSON.stringify(nextUser));
  if (token) {
    setAuthCookies(token, refreshToken ?? null, nextUser);
  }
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
  const sourceUser = user ?? getStoredUser() ?? {};
  const canonicalProfileType = normalizeProfileType(sourceUser.profile_type || sourceUser.profileType || "");
  const cookieUser = canonicalProfileType
    ? { ...sourceUser, profile_type: canonicalProfileType }
    : sourceUser;

  setAuthCookies(token, refreshToken ?? null, cookieUser);
  safeSet("token", token);

  if (user) {
    safeSet("user_object", JSON.stringify(cookieUser));
    const userId = cookieUser.user_id || cookieUser.id;
    if (userId) {
      safeSet("user_id", userId);
    }
    setStoredProfileType(canonicalProfileType || null);
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
