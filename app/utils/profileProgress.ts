export const PROFILE_PROGRESS_UPDATED_EVENT = 'homebit:profile-progress-updated';

let profileProgressRevision = 0;

export function getProfileProgressRevision() {
  return profileProgressRevision;
}

export function notifyProfileProgressChanged() {
  profileProgressRevision += 1;
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(PROFILE_PROGRESS_UPDATED_EVENT));
}
