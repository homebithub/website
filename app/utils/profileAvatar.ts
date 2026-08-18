export const PROFILE_AVATAR_UPDATED_EVENT = 'homebit:profile-avatar-updated';

const storageKey = (userId: string) => `homebit:profile-avatar:${userId}`;

export function getStoredProfileAvatar(userId?: string | null): string {
  if (typeof window === 'undefined' || !userId) return '';
  try {
    return window.localStorage.getItem(storageKey(userId)) || '';
  } catch {
    return '';
  }
}

export function setStoredProfileAvatar(userId: string | undefined, url: string): void {
  if (typeof window === 'undefined' || !userId) return;
  try {
    if (url) window.localStorage.setItem(storageKey(userId), url);
    else window.localStorage.removeItem(storageKey(userId));
  } catch {
    // Storage can be unavailable in private browsing; the profile API remains the source of truth.
  }
}

export function notifyProfileAvatarUpdated(userId: string | undefined, url: string): void {
  setStoredProfileAvatar(userId, url);
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(PROFILE_AVATAR_UPDATED_EVENT, {
    detail: { userId, url },
  }));
}

export function firstProfileAvatar(...values: unknown[]): string {
  return values.find((value): value is string => typeof value === 'string' && value.trim().length > 0)?.trim() || '';
}
