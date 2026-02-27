import React from "react";
import { Navigation } from "~/components/Navigation";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { Footer } from "~/components/Footer";
import { useAuth } from "~/contexts/useAuth";
import { useNavigate, useLocation } from "react-router";
import { Loading } from "~/components/Loading";
import { API_ENDPOINTS, API_BASE_URL } from '~/config/api';
import { formatTimeAgo } from "~/utils/timeAgo";
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { Button, Input, BaseModal } from '~/components/ui';
import { extractErrorMessage } from '~/utils/errorMessages';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
}


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
  const [currentVerificationId, setCurrentVerificationId] = React.useState<string | null>(null);
  const [otpLoading, setOtpLoading] = React.useState(false);
  const [otpError, setOtpError] = React.useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = React.useState<string | null>(null);
  const [resendSeconds, setResendSeconds] = React.useState(30);
  const [canResend, setCanResend] = React.useState(false);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      const returnUrl = encodeURIComponent(location.pathname);
      navigate(`/login?redirect=${returnUrl}`);
    }
  }, [user, loading, navigate, location.pathname]);

  // Fetch profile from /api/v1/users/me which returns non-sensitive information from the users table
  React.useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        setError(null);
        setSuccess(null);
        const res = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch profile');
        const response = await res.json();
        console.log('Profile response:', response);

        // Extract profile data from nested structure
        const data = response.data || response;
        console.log('Extracted profile data:', data);

        setProfile(data);
        setForm({
          email: data.email || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      }
    };
    if (user) fetchProfile();
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
      const token = localStorage.getItem('token');
      // Use the existing update-email endpoint (this might directly update without OTP)
      // If OTP is needed, the backend should handle the OTP sending
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/update-email`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email: newEmail }),
      });

      if (!res.ok) {
        const errorResponse = await res.json();
        const errorData = errorResponse.data || errorResponse;
        throw new Error(extractErrorMessage(errorData) || 'Failed to update email');
      }

      const response = await res.json();
      const data = response.data || response;

      // If the response contains verification info, show OTP modal
      if (data.verification && data.verification.id) {
        setCurrentVerificationId(data.verification.id);
        setCurrentVerificationType('email');
        setShowEmailModal(true);
        setResendSeconds(30);
        setCanResend(false);
        setOtpSuccess('OTP sent to your new email address');
      } else {
        // Direct update succeeded
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
      const token = localStorage.getItem('token');
      // Use the existing update-phone endpoint (this might directly update without OTP)
      // If OTP is needed, the backend should handle the OTP sending
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/update-phone`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ phone: newPhone }),
      });

      if (!res.ok) {
        const errorResponse = await res.json();
        const errorData = errorResponse.data || errorResponse;
        throw new Error(extractErrorMessage(errorData) || 'Failed to update phone');
      }

      const response = await res.json();
      const data = response.data || response;

      // If the response contains verification info, show OTP modal
      if (data.verification && data.verification.id) {
        setCurrentVerificationId(data.verification.id);
        setCurrentVerificationType('phone');
        setShowPhoneModal(true);
        setResendSeconds(30);
        setCanResend(false);
        setOtpSuccess('OTP sent to your new phone number');
      } else {
        // Direct update succeeded
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
    if (!otpCode || !currentVerificationId) {
      setOtpError('Please enter the OTP code');
      return;
    }

    setOtpLoading(true);
    setOtpError(null);

    try {
      const token = localStorage.getItem('token');
      // Use the new verify-profile-otp endpoint (requires JWT)
      const res = await fetch(`${API_BASE_URL}/api/v1/verifications/verify-profile-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          verification_type: currentVerificationType,
          otp: otpCode,
        }),
      });

      if (!res.ok) {
        const errorResponse = await res.json();
        const errorData = errorResponse.data || errorResponse;
        throw new Error(extractErrorMessage(errorData) || 'Failed to verify OTP');
      }

      // Success - update profile data
      await fetchProfile();
      setOtpSuccess(`${currentVerificationType === 'email' ? 'Email' : 'Phone'} updated successfully!`);

      // Close modal and reset state
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
    if (!currentVerificationId || !currentVerificationType) return;

    setOtpLoading(true);
    setOtpError(null);
    setOtpSuccess(null);

    try {
      const token = localStorage.getItem('token');
      // Use the new resend-profile-otp endpoint (requires JWT)
      const res = await fetch(`${API_BASE_URL}/api/v1/verifications/resend-profile-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          verification_type: currentVerificationType,
        }),
      });

      if (!res.ok) {
        const errorResponse = await res.json();
        const errorData = errorResponse.data || errorResponse;
        throw new Error(extractErrorMessage(errorData) || 'Failed to resend OTP');
      }

      setOtpCode('');
      setResendSeconds(30);
      setCanResend(false);
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
    setCurrentVerificationId(null);
    setOtpError(null);
    setOtpSuccess(null);
    setResendSeconds(30);
    setCanResend(false);
  };

  // Refetch profile function
  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const res = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const response = await res.json();
      const data = response.data || response;
      setProfile(data);
      setForm({
        email: data.email || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
      });
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
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No auth token');
      const res = await fetch(API_ENDPOINTS.auth.me, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
        }),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      setSuccess('Profile updated!');
      setEditMode(false);
      setProfile((p: any) => ({ ...p, ...form }));
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading || (!profile && user)) {
    return <Loading text="Loading profile..." />;
  }
  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={false} bubbleDensity="low" className="flex-1">
        <main className="flex-1 flex flex-col justify-center items-center px-4 py-8">
          <div className="w-full max-w-3xl bg-gradient-to-br from-purple-50 to-white dark:from-[#020617] dark:to-[#020617] rounded-3xl shadow-2xl dark:shadow-glow-md border-2 border-purple-200 dark:border-purple-500/30 p-8 transition-colors duration-300">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 text-center">My Profile 👤</h1>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-6">Manage your profile information. Only email, name and phone are editable.</p>

            {error && <ErrorAlert message={error} className="mb-4" />}
            {success && <div className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-emerald-950/40 dark:to-emerald-950/40 border-2 border-green-200 dark:border-emerald-500/40 p-4 shadow-md mb-4 transition-colors duration-300"><div className="flex items-center justify-center"><span className="text-xl mr-2">🎉</span><p className="text-sm font-bold text-green-800 dark:text-green-200">{success}</p></div></div>}

            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-purple-700">First Name</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      className="w-full h-12 px-4 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-500/40 bg-white dark:bg-[#020617] text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                      autoComplete="given-name"
                    />
                  ) : (
                    <div className="text-base text-gray-900 dark:text-gray-100 font-medium">
                      {form.first_name || <span className="text-gray-400">-</span>}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-purple-700">Last Name</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      className="w-full h-12 px-4 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-500/40 bg-white dark:bg-[#020617] text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
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
                <label className="block text-sm font-semibold mb-2 text-purple-700">Email</label>
                <div className="flex items-center">
                  <div className="flex-1 text-base text-gray-900 dark:text-gray-100 font-medium">
                    {form.email || <span className="text-gray-400">-</span>}
                  </div>
                  <button
                    type="button"
                    className="ml-2 p-2 rounded hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    aria-label="Edit Email"
                    onClick={() => setShowEmailModal(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3h3z" /></svg>
                  </button>
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-semibold mb-2 text-purple-700">Phone</label>
                <div className="flex items-center">
                  <div className="flex-1 text-base text-gray-900 dark:text-gray-100 font-medium">
                    {form.phone || <span className="text-gray-400">-</span>}
                  </div>
                  <button
                    type="button"
                    className="ml-2 p-2 rounded hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    aria-label="Edit Phone"
                    onClick={() => setShowPhoneModal(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3h3z" /></svg>
                  </button>
                </div>
              </div>

              {/* Email/Phone Modals (placeholders) */}
              {showEmailModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 w-full max-w-sm">
                    <h3 className="text-lg font-semibold mb-4">Change Email</h3>
                    {/* TODO: User will advise on modal logic here */}
                    <button className="btn-secondary mt-4 w-full" onClick={() => setShowEmailModal(false)}>Close</button>
                  </div>
                </div>
              )}
              {showPhoneModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 w-full max-w-sm">
                    <h3 className="text-lg font-semibold mb-4">Change Phone</h3>
                    {/* TODO: User will advise on modal logic here */}
                    <button className="btn-secondary mt-4 w-full" onClick={() => setShowPhoneModal(false)}>Close</button>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div>
                  <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Profile Type</span>
                  <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile?.profile_type || '-'}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Status</span>
                  <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile?.status || '-'}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div>
                  <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Email Verified</span>
                  <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile?.is_verified ? 'Yes' : 'No'}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Country</span>
                  <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile?.country || '-'}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div>
                  <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Member for</span>
                  <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile?.created_at || '-'}</span>
                </div>
                <div>
                  {/* Empty div to maintain grid layout */}
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
          {!currentVerificationId ? (
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
          {!currentVerificationId ? (
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
