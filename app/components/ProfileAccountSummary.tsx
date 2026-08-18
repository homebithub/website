import { useEffect, useState, type FormEvent } from 'react';
import { Mail, Pencil, Phone, UserRound, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { getStoredUser } from '~/utils/authStorage';
import { useOnboardingProgress } from '~/hooks/useOnboardingProgress';
import authService from '~/services/grpc/auth.service';
import { handleApiError } from '~/utils/errorMessages';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { RequiredLegend, RequiredMark } from '~/components/ui/formStyles';

type UnknownRecord = Record<string, unknown>;

type ProfileAccountSummaryProps = {
  profile: UnknownRecord;
  fallbackProfileId: string;
  fallbackProfileType: 'househelp' | 'household';
};

const PROFILE_TYPES: Record<string, string> = {
  '6dbd5104-d314-4ef1-a7d3-37d7eb26ddff': 'HouseHelp',
  '11d1c188-33fa-4eef-b1e7-2e09a2e8d2f1': 'Household',
  househelp: 'HouseHelp',
  household: 'Household',
};

function getStoredValue(key: string) {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(key) || '';
}

function getString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function getNestedRecord(value: unknown): UnknownRecord {
  return value && typeof value === 'object' ? value as UnknownRecord : {};
}

function getNestedUser(profile: UnknownRecord) {
  return getNestedRecord(profile.user);
}

function resolveProfileId(profile: UnknownRecord, fallbackProfileId: string) {
  const profileRecord = getNestedRecord(profile.profile);
  return String(
    profile.profile_id ||
    profile.profileId ||
    profileRecord.id ||
    getStoredValue('profile_id') ||
    fallbackProfileId ||
    '',
  );
}

function formatProfileType(profileId: string, fallbackProfileType: string) {
  return PROFILE_TYPES[profileId] || PROFILE_TYPES[fallbackProfileType] || fallbackProfileType;
}

function formatDate(value: unknown) {
  if (!value) return 'Not available';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function verificationToState(verification: any) {
  return {
    id: verification?.getId?.() || '',
    user_id: verification?.getUserId?.() || '',
    type: verification?.getType?.() || '',
    status: verification?.getStatus?.() || '',
    target: verification?.getTarget?.() || '',
    expires_at: verification?.getExpiresAt?.()?.toDate?.()?.toISOString?.() || '',
    next_resend_at: verification?.getNextResendAt?.()?.toDate?.()?.toISOString?.() || '',
    attempts: verification?.getAttempts?.() || 0,
    max_attempts: verification?.getMaxAttempts?.() || 3,
    resends: verification?.getResends?.() || 0,
    max_resends: verification?.getMaxResends?.() || 3,
  };
}

export function ProfileAccountSummary({
  profile,
  fallbackProfileId,
  fallbackProfileType,
}: ProfileAccountSummaryProps) {
  const navigate = useNavigate();
  const storedUser = getStoredUser() || {};
  const user = getNestedUser(profile);
  const profileId = resolveProfileId(profile, fallbackProfileId);
  const userProfile = getNestedRecord(profile.user_profile);
  const currentUserId = String(
    storedUser.user_id ||
    storedUser.id ||
    profile.current_user_id ||
    profile.user_id ||
    user.user_id ||
    user.id ||
    '',
  );
  const resolvedFirstName = getString(user.first_name) || getString(user.firstName) || getString(profile.first_name) || getString(storedUser.first_name);
  const resolvedLastName = getString(user.last_name) || getString(user.lastName) || getString(profile.last_name) || getString(storedUser.last_name);
  const resolvedEmail = getString(user.email) || getString(profile.email) || getString(storedUser.email);
  const resolvedPhone = getString(user.phone) || getString(user.phone_number) || getString(profile.phone) || getString(storedUser.phone);
  const [account, setAccount] = useState({
    firstName: resolvedFirstName,
    lastName: resolvedLastName,
    email: resolvedEmail,
    phone: resolvedPhone,
  });
  const [form, setForm] = useState(account);
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const isHousehold = fallbackProfileType === 'household';

  useEffect(() => {
    if (showEditor) return;
    const nextAccount = {
      firstName: resolvedFirstName,
      lastName: resolvedLastName,
      email: resolvedEmail,
      phone: resolvedPhone,
    };
    setAccount(nextAccount);
    setForm(nextAccount);
  }, [resolvedEmail, resolvedFirstName, resolvedLastName, resolvedPhone, showEditor]);

  const firstName = account.firstName;
  const lastName = account.lastName;
  const email = account.email || 'Not available';
  const phone = account.phone || 'Not available';
  const memberSince = formatDate(
    userProfile.created_at ||
    profile.user_profile_created_at ||
    profile.userProfileCreatedAt ||
    profile.created_at ||
    profile.createdAt,
  );
  const profileType = formatProfileType(profileId, fallbackProfileType);
  const {
    progress,
    loading: completionLoading,
    error: completionError,
  } = useOnboardingProgress(
    currentUserId,
    fallbackProfileType,
  );
  const completedItems = Math.max(Number(progress?.completed_items || 0), 0);
  const totalItems = Math.max(Number(progress?.total_items || 0), 0);
  const completionPercent = Math.min(
    100,
    Math.max(
      0,
      Number(
        progress?.completion_percentage ??
        (totalItems ? Math.round((completedItems / totalItems) * 100) : 0),
      ),
    ),
  );

  const details = [
    { label: 'First name', value: firstName || 'Not available' },
    { label: 'Last name', value: lastName || 'Not available' },
    { label: 'Email', value: email, icon: Mail },
    { label: 'Phone', value: phone, icon: Phone },
    { label: 'Profile type', value: profileType },
    { label: 'Member since', value: memberSince },
  ];

  const openEditor = () => {
    setForm(account);
    setSaveError(null);
    setSaveMessage(null);
    setShowEditor(true);
  };

  const closeEditor = () => {
    if (saving) return;
    setShowEditor(false);
    setSaveError(null);
  };

  const saveAccount = async (event: FormEvent) => {
    event.preventDefault();
    setSaveError(null);
    setSaveMessage(null);

    const next = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
    };
    if (isHousehold && (!next.firstName || !next.lastName)) {
      setSaveError('Please enter both your first and last name.');
      return;
    }
    if (next.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)) {
      setSaveError('Please enter a valid email address.');
      return;
    }
    if (!next.phone) {
      setSaveError('Please enter a phone number.');
      return;
    }

    const emailChanged = next.email !== account.email;
    const phoneChanged = next.phone !== account.phone;
    const namesChanged = isHousehold && (
      next.firstName !== account.firstName ||
      next.lastName !== account.lastName
    );
    if (emailChanged && phoneChanged) {
      setSaveError('Please change one contact method at a time so each one can be verified.');
      return;
    }
    if (!emailChanged && !phoneChanged && !namesChanged) {
      setShowEditor(false);
      return;
    }

    setSaving(true);
    try {
      let savedNames = account;
      if (namesChanged) {
        const updated = await authService.updateUser(currentUserId, {
          firstName: next.firstName,
          lastName: next.lastName,
        });
        savedNames = {
          ...account,
          firstName: updated?.getFirstName?.() || next.firstName,
          lastName: updated?.getLastName?.() || next.lastName,
        };
        setAccount(savedNames);
      }

      if (emailChanged || phoneChanged) {
        const response = emailChanged
          ? await authService.updateEmail(currentUserId, next.email)
          : await authService.updatePhone(currentUserId, next.phone);
        const verification = response?.getVerification?.();
        if (!verification) {
          setAccount({
            ...savedNames,
            email: emailChanged ? next.email : savedNames.email,
            phone: phoneChanged ? next.phone : savedNames.phone,
          });
          setSaveMessage('Account details updated.');
          setShowEditor(false);
          return;
        }

        const redirectTo = fallbackProfileType === 'household'
          ? '/household/profile'
          : '/househelp/profile';
        const params = new URLSearchParams({
          userId: currentUserId,
          afterEmailVerification: '1',
          redirectTo,
          from: 'account-settings',
        });
        navigate(`/verify-otp?${params.toString()}`, {
          state: {
            verification: verificationToState(verification),
            afterEmailVerification: true,
            redirectTo,
            from: 'account-settings',
            profileType: fallbackProfileType,
          },
        });
        return;
      }

      setForm(savedNames);
      setSaveMessage('Account details updated.');
      setShowEditor(false);
    } catch (error) {
      setSaveError(handleApiError(error, 'profile'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="relative rounded-2xl bg-white dark:bg-[#13131a] p-4 sm:p-6 border border-purple-200/40 dark:border-purple-500/30 mb-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-200">
            <UserRound className="h-5 w-5" />
          </div>
          <div className="pr-0 lg:pr-28">
            <p className="text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-300">My Account</p>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {[firstName, lastName].filter(Boolean).join(' ') || 'Account details'}
            </h2>
          </div>
        </div>

        {(!progress || completionPercent < 100) && <div className="min-w-[220px] lg:mt-8">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-purple-700 dark:text-purple-300">
            <span>Profile completion</span>
            <span>
              {completionLoading ? '...' : progress ? `${completionPercent}%` : '—'}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-purple-100 dark:bg-purple-950">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {completionError && !progress
              ? 'Profile completion is temporarily unavailable'
              : `${completedItems} of ${totalItems} profile requirements complete`}
          </p>
        </div>}
      </div>

      <button
        type="button"
        onClick={openEditor}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 transition-colors hover:text-pink-600 dark:text-purple-300 dark:hover:text-pink-300 lg:absolute lg:right-6 lg:top-5 lg:mt-0"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit account
      </button>

      {saveMessage ? (
        <p className="mt-4 text-xs font-medium text-emerald-700 dark:text-emerald-300">{saveMessage}</p>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {details.map((detail) => {
          const Icon = detail.icon;
          return (
            <div key={detail.label} className="rounded-xl border border-purple-100 bg-purple-50/60 p-3 dark:border-purple-500/20 dark:bg-purple-950/20">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-300">
                {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
                {detail.label}
              </div>
              <p className="break-words text-sm font-semibold text-gray-900 dark:text-white">{detail.value}</p>
            </div>
          );
        })}
      </div>

      {showEditor ? (
        <div
          className="hb-mobile-modal-viewport fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="account-editor-title"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) closeEditor();
          }}
        >
          <div className="hb-mobile-modal-panel w-full max-w-xl overflow-y-auto rounded-2xl border border-purple-300/40 bg-white p-5 shadow-2xl dark:border-purple-500/30 dark:bg-[#17151f] sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 id="account-editor-title" className="text-lg font-bold text-gray-900 dark:text-white">
                  Edit account details
                </h3>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Phone and email changes require a one-time verification code.
                </p>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                disabled={saving}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-purple-50 hover:text-purple-700 disabled:opacity-50 dark:hover:bg-purple-950/50 dark:hover:text-purple-300"
                aria-label="Close account editor"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={saveAccount} className="space-y-4">
              <RequiredLegend />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
                  <span>First name{isHousehold && <RequiredMark />}</span>
                  <input
                    value={form.firstName}
                    onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
                    disabled={!isHousehold || saving}
                    required={isHousehold}
                    className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2.5 text-sm font-normal text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:border-purple-500/30 dark:bg-[#111118] dark:text-white dark:disabled:bg-slate-900"
                  />
                </label>
                <label className="space-y-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
                  <span>Last name{isHousehold && <RequiredMark />}</span>
                  <input
                    value={form.lastName}
                    onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
                    disabled={!isHousehold || saving}
                    required={isHousehold}
                    className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2.5 text-sm font-normal text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:border-purple-500/30 dark:bg-[#111118] dark:text-white dark:disabled:bg-slate-900"
                  />
                </label>
              </div>

              {!isHousehold ? (
                <p className="rounded-xl border border-purple-200/70 bg-purple-50 px-3 py-2.5 text-xs text-purple-800 dark:border-purple-500/20 dark:bg-purple-950/30 dark:text-purple-200">
                  Your name is locked to the name on your verified ID document.
                </p>
              ) : null}

              <label className="block space-y-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
                Email address
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  disabled={saving}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2.5 text-sm font-normal text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-60 dark:border-purple-500/30 dark:bg-[#111118] dark:text-white"
                />
              </label>

              <label className="block space-y-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300">
                Phone number
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  disabled={saving}
                  inputMode="tel"
                  className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2.5 text-sm font-normal text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-60 dark:border-purple-500/30 dark:bg-[#111118] dark:text-white"
                />
              </label>

              {saveError ? <ErrorAlert message={saveError} className="mb-0" /> : null}

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEditor}
                  disabled={saving}
                  className="rounded-xl border border-purple-200 px-4 py-2.5 text-sm font-semibold text-purple-700 transition hover:bg-purple-50 disabled:opacity-50 dark:border-purple-500/30 dark:text-purple-200 dark:hover:bg-purple-950/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:from-purple-700 hover:to-pink-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default ProfileAccountSummary;
