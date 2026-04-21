import React from "react";
import { Navigation } from "~/components/Navigation";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { Footer } from "~/components/Footer";
import { useAuth } from "~/contexts/useAuth";
import { useNavigate, useLocation } from "react-router";
import { Loading } from "~/components/Loading";
import { getAccessTokenFromCookies } from '~/utils/cookie';
import { authService } from '~/services/grpc/auth.service';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { Button, Input, BaseModal } from '~/components/ui';
import { cacheAuthSession, getStoredUserId } from "~/utils/authStorage";


export default function ProfilePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = React.useState<any>(null);
  const [editMode, setEditMode] = React.useState(false);
  const [form, setForm] = React.useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
  });
  const [profileLoading, setProfileLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string|null>(null);
  const [success, setSuccess] = React.useState<string|null>(null);

  // OTP Modal States
  const [showEmailModal, setShowEmailModal] = React.useState(false);
  const [showPhoneModal, setShowPhoneModal] = React.useState(false);
  const [newEmail, setNewEmail] = React.useState('');
  const [newPhone, setNewPhone] = React.useState('');
  const [otpCode, setOtpCode] = React.useState('');
  const [currentVerificationType, setCurrentVerificationType] = React.useState<'email' | 'phone' | null>(null);
  const [otpLoading, setOtpLoading] = React.useState(false);
  const [otpError, setOtpError] = React.useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = React.useState<string | null>(null);
  const [resendSeconds, setResendSeconds] = React.useState(60);
  const [canResend, setCanResend] = React.useState(false);

  const resolveCurrentUserId = React.useCallback(() => {
    return profile?.id || user?.user?.user_id || getStoredUserId();
  }, [profile?.id, user]);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      const returnUrl = encodeURIComponent(location.pathname);
      navigate(`/login?redirect=${returnUrl}`);
    }
  }, [user, loading, navigate, location.pathname]);

  React.useEffect(() => {
    const fetchProfile = async () => {
      const token = getAccessTokenFromCookies();
      if (!token) { setProfileLoading(false); return; }
      try {
        setError(null);
        setSuccess(null);
        const userData = await authService.getCurrentUser();
        const createdAtTs = userData.getCreatedAt?.();
        const createdAtDate = createdAtTs?.toDate?.() ?? (createdAtTs?.getSeconds?.() ? new Date(createdAtTs.getSeconds() * 1000) : null);
        const data = {
          id: userData.getId(),
          email: userData.getEmail(),
          first_name: userData.getFirstName(),
          last_name: userData.getLastName(),
          phone: userData.getPhone(),
          profile_type: userData.getProfileType(),
          is_verified: userData.getIsVerified(),
          profile_image: userData.getProfileImage(),
          country: 'Kenya',
          created_at: createdAtDate ? createdAtDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null,
        };

        setProfile(data);
        setForm({
          email: data.email || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setProfileLoading(false);
      }
    };
    if (user) fetchProfile();
    else setProfileLoading(false);
  }, [user]);

  // Countdown timer for OTP resend
  React.useEffect(() => {
    if (resendSeconds <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setTimeout(() => {
      setResendSeconds(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendSeconds]);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    setForm({
      email: profile?.email || '',
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      phone: profile?.phone || '',
    });
    setError(null);
    setSuccess(null);
  };

  // Handle email change - send OTP
  const handleEmailChange = async () => {
    if (!newEmail || newEmail === profile?.email) {
      setOtpError('Please enter a different email address');
      return;
    }

    setOtpLoading(true);
    setOtpError(null);
    setOtpSuccess(null);

    try {
      const result = await authService.updateEmail(resolveCurrentUserId(), newEmail);
      const verification = result.getVerification?.();

      if (verification?.getId?.()) {
        setCurrentVerificationType('email');
        const nextResendAt = verification.getNextResendAt?.()?.toDate?.()?.getTime?.() || null;
        const waitSeconds = nextResendAt ? Math.max(0, Math.ceil((nextResendAt - Date.now()) / 1000)) : 60;
        setResendSeconds(waitSeconds);
        setCanResend(waitSeconds <= 0);
        setOtpSuccess('OTP sent to your new email address');
      } else {
        await fetchProfile();
        setOtpSuccess('Email updated successfully!');
        setTimeout(() => {
          setShowEmailModal(false);
          resetOtpState();
        }, 2000);
      }
    } catch (err: any) {
      setOtpError(err.message || 'Failed to update email');
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle phone change - send OTP
  const handlePhoneChange = async () => {
    if (!newPhone || newPhone === profile?.phone) {
      setOtpError('Please enter a different phone number');
      return;
    }

    setOtpLoading(true);
    setOtpError(null);
    setOtpSuccess(null);

    try {
      const result = await authService.updatePhone(resolveCurrentUserId(), newPhone);
      const verification = result.getVerification?.();

      if (verification?.getId?.()) {
        setCurrentVerificationType('phone');
        const nextResendAt = verification.getNextResendAt?.()?.toDate?.()?.getTime?.() || null;
        const waitSeconds = nextResendAt ? Math.max(0, Math.ceil((nextResendAt - Date.now()) / 1000)) : 60;
        setResendSeconds(waitSeconds);
        setCanResend(waitSeconds <= 0);
        setOtpSuccess('OTP sent to your new phone number');
      } else {
        await fetchProfile();
        setOtpSuccess('Phone updated successfully!');
        setTimeout(() => {
          setShowPhoneModal(false);
          resetOtpState();
        }, 2000);
      }
    } catch (err: any) {
      setOtpError(err.message || 'Failed to update phone');
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP and complete email/phone change
  const handleVerifyOtp = async () => {
    if (!otpCode || !currentVerificationType) {
      setOtpError('Please enter the OTP code');
      return;
    }

    setOtpLoading(true);
    setOtpError(null);

    try {
      const verifyResponse = await authService.verifyOTP(resolveCurrentUserId(), currentVerificationType, otpCode);
      const userProto = verifyResponse?.getUser?.();
      const token = verifyResponse?.getToken?.();
      const refreshToken = verifyResponse?.getRefreshToken?.();

      if (token && userProto) {
        cacheAuthSession({
          token,
          refreshToken,
          user: {
            id: userProto.getId?.() || "",
            user_id: userProto.getId?.() || "",
            email: userProto.getEmail?.() || "",
            phone: userProto.getPhone?.() || "",
            first_name: userProto.getFirstName?.() || "",
            last_name: userProto.getLastName?.() || "",
            profile_type: userProto.getProfileType?.() || "",
            is_verified: userProto.getIsVerified?.() || false,
            profile_image: userProto.getProfileImage?.() || "",
          },
        });
      }

      await fetchProfile();
      setOtpSuccess(`${currentVerificationType === 'email' ? 'Email' : 'Phone'} updated successfully!`);

      setTimeout(() => {
        setShowEmailModal(false);
        setShowPhoneModal(false);
        resetOtpState();
      }, 2000);

    } catch (err: any) {
      setOtpError(err.message || 'Failed to verify OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!currentVerificationType) return;

    setOtpLoading(true);
    setOtpError(null);
    setOtpSuccess(null);

    try {
      const response = await authService.resendOTP(resolveCurrentUserId(), currentVerificationType);
      const verification = response?.getVerification?.();

      setOtpCode('');
      const nextResendAt = verification?.getNextResendAt?.()?.toDate?.()?.getTime?.() || null;
      const waitSeconds = nextResendAt ? Math.max(0, Math.ceil((nextResendAt - Date.now()) / 1000)) : 60;
      setResendSeconds(waitSeconds);
      setCanResend(waitSeconds <= 0);
      setOtpSuccess('OTP resent successfully');
    } catch (err: any) {
      setOtpError(err.message || 'Failed to resend OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // Reset OTP state
  const resetOtpState = () => {
    setNewEmail('');
    setNewPhone('');
    setOtpCode('');
    setCurrentVerificationType(null);
    setOtpError(null);
    setOtpSuccess(null);
    setResendSeconds(60);
    setCanResend(false);
  };

  // Refetch profile function
  const fetchProfile = async () => {
    const token = getAccessTokenFromCookies();
    if (!token) return;

    try {
      const userData = await authService.getCurrentUser();
      const createdAtTs = userData.getCreatedAt?.();
      const createdAtDate = createdAtTs?.toDate?.() ?? (createdAtTs?.getSeconds?.() ? new Date(createdAtTs.getSeconds() * 1000) : null);
      const data = {
        id: userData.getId(),
        email: userData.getEmail(),
        first_name: userData.getFirstName(),
        last_name: userData.getLastName(),
        phone: userData.getPhone(),
        profile_type: userData.getProfileType(),
        is_verified: userData.getIsVerified(),
        profile_image: userData.getProfileImage(),
        country: 'Kenya',
        created_at: createdAtDate ? createdAtDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null,
      };
      setProfile(data);
      setForm({
        email: data.email || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
      });
    } catch (err) {
      console.error('Failed to refetch profile:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const token = getAccessTokenFromCookies();
      if (!token) throw new Error('No auth token');
      await authService.updateUser('', {
        email: form.email,
        firstName: form.first_name,
        lastName: form.last_name,
        phone: form.phone,
      });
      setSuccess('Profile updated!');
      setEditMode(false);
      setProfile((p: any) => ({ ...p, ...form }));
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading || profileLoading) {
    return <Loading text="Loading profile..." />;
  }
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <PurpleThemeWrapper variant="light" bubbles={false} bubbleDensity="low" className="flex-1">
          <main className="flex-1 flex items-center justify-center px-4 py-8">
            <div className="max-w-xl w-full rounded-3xl border-2 border-red-200/60 dark:border-red-500/30 bg-white dark:bg-[#13131a] p-6 text-center shadow-xl">
              <p className="text-red-700 dark:text-red-300 font-semibold">
                Account data could not be loaded. Please refresh and try again.
              </p>
            </div>
          </main>
        </PurpleThemeWrapper>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={false} bubbleDensity="low" className="flex-1">
        <main className="flex-1 flex flex-col justify-center items-center px-4 py-8">
          <div className="w-full max-w-3xl">
            <a href="/settings" className="inline-flex items-center gap-1.5 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium mb-4 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              Back to Settings
            </a>
          </div>
          <div className="w-full max-w-3xl bg-white dark:bg-[#13131a] rounded-3xl shadow-2xl dark:shadow-glow-md border-2 border-purple-200/40 dark:border-purple-500/30 p-8 transition-colors duration-300">
            <h1 className="text-xl sm:text-2xl font-bold text-purple-700 dark:text-purple-300 mb-2 text-center">My Account</h1>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">Manage your account information. Only email, name and phone are editable.</p>

            {error && <ErrorAlert message={error} className="mb-4" />}
            {success && <div className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-emerald-950/40 dark:to-emerald-950/40 border-2 border-green-200 dark:border-emerald-500/40 p-4 shadow-md mb-4 transition-colors duration-300"><div className="flex items-center justify-center"><span className="text-xl mr-2">🎉</span><p className="text-sm font-bold text-green-800 dark:text-green-200">{success}</p></div></div>}

            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-2 text-purple-700 dark:text-purple-400">First Name</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      className="w-full h-10 px-4 py-2 rounded-xl border border-purple-200/40 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                      autoComplete="given-name"
                    />
                  ) : (
                    <div className="text-base text-gray-900 dark:text-gray-100 font-medium">
                      {form.first_name || <span className="text-gray-400">-</span>}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2 text-purple-700 dark:text-purple-400">Last Name</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      className="w-full h-10 px-4 py-2 rounded-xl border border-purple-200/40 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                      autoComplete="family-name"
                    />
                  ) : (
                    <div className="text-base text-gray-900 dark:text-gray-100 font-medium">
                      {form.last_name || <span className="text-gray-400">-</span>}
                    </div>
                  )}
                </div>
              </div>
              <div className="relative">
                <label className="block text-xs font-semibold mb-2 text-purple-700 dark:text-purple-400">Email</label>
                <div className="flex items-center">
                  <div className="flex-1 text-sm text-gray-900 dark:text-gray-100 font-medium">
                    {form.email || <span className="text-gray-500">-</span>}
                  </div>
                  <button
                    type="button"
                    className="ml-2 p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                    aria-label="Edit Email"
                    onClick={() => setShowEmailModal(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3h3z" /></svg>
                  </button>
                </div>
              </div>
              <div className="relative">
                <label className="block text-xs font-semibold mb-2 text-purple-700 dark:text-purple-400">Phone</label>
                <div className="flex items-center">
                  <div className="flex-1 text-sm text-gray-900 dark:text-gray-100 font-medium">
                    {form.phone || <span className="text-gray-500">-</span>}
                  </div>
                  <button
                    type="button"
                    className="ml-2 p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                    aria-label="Edit Phone"
                    onClick={() => setShowPhoneModal(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3h3z" /></svg>
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-purple-200/40 dark:border-purple-500/20">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-500">Profile Type</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 font-medium capitalize">{profile?.profile_type || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-500">Email Verified</span>
                    <span className={`text-sm font-medium ${profile?.is_verified ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>{profile?.is_verified ? 'Yes' : 'No'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-500">Country</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">{profile?.country || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-500">Member Since</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">{profile?.created_at || '-'}</span>
                  </div>
                </div>
              </div>
              {!editMode && (
                <Button
                  onClick={handleEdit}
                  leftIcon={<span>✏️</span>}
                >
                  Edit Profile
                </Button>
              )}
              {editMode && (
                <div className="flex gap-3">
                  <Button
                    onClick={handleSave}
                    isLoading={saving}
                    className="flex-1"
                    leftIcon={<span>🚀</span>}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </form>
          </div>
        </main>
      </PurpleThemeWrapper>

      {/* Email Change Modal */}
      <BaseModal
        isOpen={showEmailModal}
        onClose={() => {
          setShowEmailModal(false);
          resetOtpState();
        }}
        title="Change Email"
      >
        <div className="space-y-6">
          {!currentVerificationType ? (
            // Step 1: Enter new email
            <div className="space-y-4">
              <Input
                label="New Email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email address"
              />

              {otpError && <ErrorAlert message={otpError} />}
              {otpSuccess && <SuccessAlert message={otpSuccess} />}

              <div className="flex gap-3">
                <Button
                  onClick={handleEmailChange}
                  isLoading={otpLoading}
                  disabled={!newEmail}
                  className="flex-1"
                >
                  Send OTP
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowEmailModal(false);
                    resetOtpState();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            // Step 2: Enter OTP
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter the OTP sent to {newEmail}
              </p>

              <Input
                label="OTP Code"
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="text-center tracking-widest text-2xl h-14"
              />

              {otpError && <ErrorAlert message={otpError} />}
              {otpSuccess && <SuccessAlert message={otpSuccess} />}

              <div className="flex gap-3">
                <Button
                  onClick={handleVerifyOtp}
                  isLoading={otpLoading}
                  disabled={!otpCode}
                  className="flex-1"
                >
                  Verify OTP
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowEmailModal(false);
                    resetOtpState();
                  }}
                >
                  Cancel
                </Button>
              </div>

              {/* Resend OTP */}
              <div className="text-center">
                {canResend ? (
                  <button
                    onClick={handleResendOtp}
                    disabled={otpLoading}
                    className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-semibold hover:underline transition-colors"
                  >
                    Resend OTP
                  </button>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    Resend available in {resendSeconds}s
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </BaseModal>

      {/* Phone Change Modal */}
      <BaseModal
        isOpen={showPhoneModal}
        onClose={() => {
          setShowPhoneModal(false);
          resetOtpState();
        }}
        title="Change Phone"
      >
        <div className="space-y-6">
          {!currentVerificationType ? (
            // Step 1: Enter new phone
            <div className="space-y-4">
              <Input
                label="New Phone"
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="Enter new phone number"
              />

              {otpError && <ErrorAlert message={otpError} />}
              {otpSuccess && <SuccessAlert message={otpSuccess} />}

              <div className="flex gap-3">
                <Button
                  onClick={handlePhoneChange}
                  isLoading={otpLoading}
                  disabled={!newPhone}
                  className="flex-1"
                >
                  Send OTP
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowPhoneModal(false);
                    resetOtpState();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            // Step 2: Enter OTP
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter the OTP sent to {newPhone}
              </p>

              <Input
                label="OTP Code"
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="text-center tracking-widest text-2xl h-14"
              />

              {otpError && <ErrorAlert message={otpError} />}
              {otpSuccess && <SuccessAlert message={otpSuccess} />}

              <div className="flex gap-3">
                <Button
                  onClick={handleVerifyOtp}
                  isLoading={otpLoading}
                  disabled={!otpCode}
                  className="flex-1"
                >
                  Verify OTP
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowPhoneModal(false);
                    resetOtpState();
                  }}
                >
                  Cancel
                </Button>
              </div>

              {/* Resend OTP */}
              <div className="text-center">
                {canResend ? (
                  <button
                    onClick={handleResendOtp}
                    disabled={otpLoading}
                    className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-semibold hover:underline transition-colors"
                  >
                    Resend OTP
                  </button>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    Resend available in {resendSeconds}s
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </BaseModal>

      <Footer />
    </div>
  );
}
// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
