import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/20/solid';
import {
  cacheAuthSession,
  getStoredCanonicalProfileType,
  getStoredUserProfileId,
} from '~/utils/authStorage';
import { clearRequestCache } from '~/utils/requestCache';

type AccountProfile = {
  user_profile_id: string;
  profile_id: string;
  profile_type: 'household' | 'service_provider' | string;
  profile_name?: string;
  is_complete?: boolean;
};

const labelFor = (profileType: string) => profileType === 'household' ? 'Household' : 'Service provider';

export default function AccountProfileSwitcher({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [profiles, setProfiles] = useState<AccountProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState('');
  const [error, setError] = useState('');
  const activeProfileID = getStoredUserProfileId();
  const activeProfileType = getStoredCanonicalProfileType();

  const loadProfiles = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/account-profiles', { credentials: 'include', cache: 'no-store' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || 'Unable to load profiles');
      setProfiles(Array.isArray(payload.profiles) ? payload.profiles : []);
    } catch (loadError: any) {
      setError(loadError?.message || 'Unable to load profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) void loadProfiles();
  }, [open]);

  if (!open) return null;

  const switchTo = async (userProfileID: string) => {
    if (!userProfileID || userProfileID === activeProfileID) return;
    setWorking(userProfileID);
    setError('');
    try {
      const response = await fetch('/api/account-profiles', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'switch', user_profile_id: userProfileID }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || 'Unable to switch profile');
      clearRequestCache();
      cacheAuthSession({ token: payload.token, user: payload.user });
      window.localStorage.setItem('profile_id', String(payload.user.profile_id || ''));
      window.localStorage.setItem('user_profile_id', String(payload.user.user_profile_id || ''));
      window.location.assign('/');
    } catch (switchError: any) {
      setError(switchError?.message || 'Unable to switch profile');
      setWorking('');
    }
  };

  const addAndSwitch = async (profileType: 'household' | 'service_provider') => {
    setWorking(profileType);
    setError('');
    try {
      const response = await fetch('/api/account-profiles', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', profile_type: profileType }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || 'Unable to add profile');
      const createdID = String(payload.profile?.user_profile_id || '');
      if (!createdID) throw new Error('The new profile could not be opened');
      await switchTo(createdID);
    } catch (addError: any) {
      setError(addError?.message || 'Unable to add profile');
      setWorking('');
    }
  };

  const existingTypes = new Set(profiles.map((profile) => profile.profile_type));
  const missingType = (['household', 'service_provider'] as const).find((type) => !existingTypes.has(type));

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 px-4" role="dialog" aria-modal="true" aria-labelledby="profile-switcher-title">
      <div className="w-full max-w-md rounded-2xl border border-purple-500/40 bg-white p-5 shadow-2xl dark:bg-[#13131a]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="profile-switcher-title" className="text-lg font-bold text-gray-950 dark:text-white">Choose how you’re using HomeBit</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Your account stays the same. Each profile keeps its own setup, saved items and hiring activity.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-gray-500 hover:bg-purple-100 dark:hover:bg-purple-900/30">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {error && <div className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">{error}</div>}
        <div className="mt-5 space-y-3">
          {loading ? (
            <div className="py-8 text-center text-sm text-gray-500">Loading your profiles…</div>
          ) : profiles.map((profile) => {
            const active = profile.user_profile_id === activeProfileID || (!activeProfileID && profile.profile_type === activeProfileType);
            return (
              <button
                type="button"
                key={profile.user_profile_id}
                disabled={active || Boolean(working)}
                onClick={() => void switchTo(profile.user_profile_id)}
                className="flex w-full items-center justify-between rounded-xl border border-purple-300/60 px-4 py-3 text-left transition hover:border-purple-500 hover:bg-purple-50 disabled:cursor-default disabled:opacity-70 dark:border-purple-500/30 dark:hover:bg-purple-900/20"
              >
                <span>
                  <span className="block font-semibold text-gray-950 dark:text-white">{labelFor(profile.profile_type)}</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">{profile.is_complete ? 'Profile setup complete' : 'Profile setup still needs attention'}</span>
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${active ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300' : 'bg-purple-500/15 text-purple-700 dark:text-purple-300'}`}>
                  {active ? 'Current' : working === profile.user_profile_id ? 'Switching…' : 'Use profile'}
                </span>
              </button>
            );
          })}
        </div>

        {!loading && missingType && (
          <div className="mt-4 rounded-xl border border-purple-300/60 bg-purple-50/70 p-3 dark:border-purple-500/30 dark:bg-purple-950/20">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Need a {labelFor(missingType).toLowerCase()} profile? It will use this account’s phone number and login, while keeping its own setup and activity.
            </p>
            <button
              type="button"
              disabled={Boolean(working)}
              onClick={() => void addAndSwitch(missingType)}
              className="mt-3 w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-sm font-bold text-white shadow-lg disabled:opacity-60"
            >
              {working === missingType ? 'Creating profile…' : `Create ${labelFor(missingType).toLowerCase()} profile`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
