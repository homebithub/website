import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Navigation } from '~/components/Navigation';
import { Footer } from '~/components/Footer';
import { handleApiError } from '~/utils/errorMessages';
// Temporarily commented out to debug module loading issue
// import { HouseholdProfileModal } from '~/components/modals/HouseholdProfileModal';
import { otpSchema, updatePhoneSchema, updateEmailSchema, validateForm, validateField } from '~/utils/validation';
import { API_BASE_URL } from '~/config/api';
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { PurpleCard } from '~/components/ui/PurpleCard';

export default function VerifyOtpPage() {
  // UI state for changing phone
  const [showChangePhone, setShowChangePhone] = React.useState(false);
  const [newPhone, setNewPhone] = React.useState('');
  
  // Household profile modal state
  const [showProfileModal, setShowProfileModal] = React.useState(false);
  const [profileData, setProfileData] = React.useState(null);

  // Validation state
  const [otpError, setOtpError] = React.useState<string | null>(null);
  const [newPhoneError, setNewPhoneError] = React.useState<string | null>(null);
  const [otpTouched, setOtpTouched] = React.useState(false);

  // Handler for phone change submit
  const [changePhoneError, setChangePhoneError] = React.useState<string | null>(null);
  const [changePhoneLoading, setChangePhoneLoading] = React.useState(false);
  const handleChangePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePhoneError(null);
    setChangePhoneLoading(true);
    
    // Validate new phone/email
    const schema = verification.type === 'phone' || verification.type === 'password_reset' 
      ? updatePhoneSchema 
      : updateEmailSchema;
    const validation = validateForm(schema, { 
      [verification.type === 'phone' || verification.type === 'password_reset' ? 'phone' : 'email']: newPhone 
    });
    
    if (!validation.isValid) {
      setChangePhoneError(Object.values(validation.errors)[0]);
      setChangePhoneLoading(false);
      return;
    }
    
    try {
      if(verification.type === 'phone'){
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/update-phone`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: newPhone, user_id: verification?.user_id }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update phone');
      }
      const data = await res.json();
      if (data.verification) {
        setVerification(data.verification);
        setShowChangePhone(false);
        setNewPhone('');
        setLocalFailedAttempts(0);
        setOtp('');
        setLastTriedOtp('');
      }
    }else{
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: newPhone,  }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to send OTP');
      }
      const data = await res.json();
      if (data.verification) {
        setVerification(data.verification);
        setShowChangePhone(false);
        setNewPhone('');
        setLocalFailedAttempts(0);
        setOtp('');
        setLastTriedOtp('');
      }
    }
    } catch (err: any) {
      setChangePhoneError(err.message || 'Failed to update phone');
    } finally {
      setChangePhoneLoading(false);
    }
  };

  const location = useLocation();
  const navigate = useNavigate();
  // Check if state exists
  const locationState = (location.state || {}) as { verification?: any, bureauId?: string, afterEmailVerification?: boolean };
  const [verification, setVerification] = useState(locationState.verification);
  const afterEmailVerification = locationState.afterEmailVerification;
  
  // Debug logging
  React.useEffect(() => {
    console.log('verify-otp mounted');
    console.log('Location state:', locationState);
    console.log('Verification:', verification);
    console.log('After email verification:', afterEmailVerification);
  }, []);
  
  // Redirect to signup if no verification data (user typed URL directly)
  React.useEffect(() => {
    if (!verification) {
      console.warn('No verification data - redirecting to signup');
      console.warn('Location state was:', locationState);
      navigate('/signup', { replace: true });
    }
  }, [verification, navigate]);
  // const [searchParams] = useSearchParams();
  // const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resent, setResent] = useState(false);

  // Timer state for resend cooldown
  const [resendSeconds, setResendSeconds] = useState<number>(() => {
    if (!verification?.next_resend_at) return 0;
    const nextResend = new Date(verification.next_resend_at).getTime(); // UTC
    const now = Date.now(); // User's local device time (ms since epoch)
    const diff = Math.floor((nextResend - now) / 1000);
    return diff > 0 ? diff : 0;
  });

  // Reset resend timer and attempts when verification changes
  React.useEffect(() => {
    if (!verification?.next_resend_at) return;
    const nextResend = new Date(verification.next_resend_at).getTime();
    const now = Date.now();
    const diff = Math.floor((nextResend - now) / 1000);
    setResendSeconds(diff > 0 ? diff : 0);
  }, [verification]);

  // Helper to get user_id and phone from verification
  const user_id = verification?.user_id;
  const phone = verification?.target;

  // Track local failed attempts
  const [localFailedAttempts, setLocalFailedAttempts] = useState(0);
  // Last attempted OTP (for checking if user typed a new value)
  const [lastTriedOtp, setLastTriedOtp] = useState('');

  // Attempts left (never negative)
  const attemptsLeft = verification?.max_attempts && verification?.attempts != null
    ? Math.max(0, verification.max_attempts - (verification.attempts + localFailedAttempts))
    : null;

  // Countdown effect
  React.useEffect(() => {
    if (resendSeconds <= 0) return;
    const interval = setInterval(() => {
      if (!verification?.next_resend_at) return;
      const nextResend = new Date(verification.next_resend_at).getTime(); // UTC
      const now = Date.now(); // User's local device time
      const diff = Math.floor((nextResend - now) / 1000);
      setResendSeconds(diff > 0 ? diff : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendSeconds, verification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate OTP
    const validation = validateForm(otpSchema, { otp });
    if (!validation.isValid) {
      setOtpError(Object.values(validation.errors)[0]);
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    setOtpError(null);
    try {
      // Call your backend OTP verification endpoint here
      const res = await fetch(`${API_BASE_URL}/api/v1/verifications/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({  user_id, verification_type: verification.type, otp }),
      });
      if (!res.ok) {
        const err = await res.json();
        console.log(err)
        throw new Error(err.message || 'OTP verification failed');
      }
      const userData = await res.json();
      // Store token and user_object in localStorage
      if (userData.token) {
        localStorage.setItem('token', userData.token);
        // Remove token from user object before storing
        const { token, ...userObj } = userData;
        localStorage.setItem('user_object', JSON.stringify(userObj));
      }
      setSuccess(true);
      setLocalFailedAttempts(0); // reset on success
      setLastTriedOtp('');
      // If bureauId is present in state, redirect to /bureau/househelps after verification
      if (locationState.bureauId) {
        navigate('/bureau/househelps');
      } else {
        const userObj = localStorage.getItem('user_object');
        let path = '/';
        if (userObj) {
          const parsed = JSON.parse(userObj);
          console.log('User object after OTP verification:', parsed);
          console.log('Profile type:', parsed.profile_type);
          
          // Bureau users should not verify through regular flow
          if (parsed.profile_type === 'bureau') {
            console.log('Bureau user detected, redirecting to home');
            navigate('/');
            return;
          }
          
          // Handle both 'household' and 'household' profile types
          if (parsed.profile_type === 'household' || parsed.profile_type === 'household') {
            // If this is after email verification, go to household setup
            if (afterEmailVerification) {
              path = '/household/setup';
            } else {
              // Otherwise, redirect to email verification first
              navigate('/verify-email', { 
                state: { 
                  user_id: parsed.user_id || parsed.id,
                  from: 'phone-verification'
                } 
              });
              return;
            }
          } else if (parsed.profile_type === 'househelp') {
            path = '/househelp';
          }
        }
        console.log('Redirecting to:', path);
        navigate(path);
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'otp');
      setError(errorMessage);
      setLocalFailedAttempts((prev) => prev + 1);
      setLastTriedOtp(otp);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResent(false);
    setLoading(true);
    setError(null);
    try {
      // Call your backend resend OTP endpoint here
      const res = await fetch(`${API_BASE_URL}/api/v1/verifications/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verification_id: verification?.id, user_id, verification_type: "phone" }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to resend OTP');
      }
      const data = await res.json();
      if (data.verification) {
        setVerification(data.verification);
        setLocalFailedAttempts(0);
        setOtp('');
        setLastTriedOtp('');
      }
      setResent(true);
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'otp');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d{0,6}$/.test(val)) {
      setOtp(val);
      if (error && val !== lastTriedOtp) setError(null);
      if (otpError) setOtpError(null);
    }
  };

  const handleOtpBlur = () => {
    setOtpTouched(true);
    if (otp) {
      const validation = validateForm(otpSchema, { otp });
      if (!validation.isValid) {
        setOtpError(Object.values(validation.errors)[0]);
      } else {
        setOtpError(null);
      }
    }
  };

  const handleNewPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPhone(value);
    if (newPhoneError) setNewPhoneError(null);
  };

  const handleNewPhoneBlur = () => {
    if (newPhone) {
      const schema = verification.type === 'phone' || verification.type === 'password_reset' 
        ? updatePhoneSchema 
        : updateEmailSchema;
      const validation = validateForm(schema, { 
        [verification.type === 'phone' || verification.type === 'password_reset' ? 'phone' : 'email']: newPhone 
      });
      if (!validation.isValid) {
        setNewPhoneError(Object.values(validation.errors)[0]);
      } else {
        setNewPhoneError(null);
      }
    }
  };

  // Handle profile completion
  const handleProfileComplete = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      
      // Save profile data to backend
      const res = await fetch(`${API_BASE_URL}/api/v1/profile/household/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        throw new Error('Failed to save profile data');
      }
      
      setProfileData(data);
      setShowProfileModal(false);
      
      // Redirect to household dashboard
      navigate('/household/profile');
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      // Still redirect even if save fails
      setShowProfileModal(false);
      navigate('/household/profile');
    }
  };

  const handleProfileModalClose = () => {
    setShowProfileModal(false);
    // Redirect to household profile page
    navigate('/household/profile');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={true} bubbleDensity="low" className="flex-1">
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8">
        <PurpleCard hover={false} glow={true} className="w-full max-w-md p-8 sm:p-10">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 text-center">Verify Account 🔒</h2>
          {/* Hide all OTP UI if showChangePhone is true */}
          {!showChangePhone && (
            <>
              {error === 'OTP has expired' ? (
                <div className="mb-4 text-center text-gray-700 dark:text-gray-300">
                  Your OTP has expired. Please click Resend OTP to get a new code.
                </div>
              ) : (
                <p className="mb-4 text-center text-gray-700 dark:text-gray-300">Enter the OTP sent to <span className="font-semibold">{phone || ''}</span></p>
              )}
            </>
          )}
          {/* Hide OTP form if showChangePhone is true */}
          {!showChangePhone && error !== 'OTP has expired' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="otp"
                value={otp}
                onChange={handleOtpChange}
                onBlur={handleOtpBlur}
                required
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                className={`w-full h-14 px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-center tracking-widest text-2xl bg-white dark:bg-[#13131a] text-gray-900 dark:text-white shadow-sm transition-all ${
                  otpError 
                    ? 'border-red-300 dark:border-red-600' 
                    : otpTouched && !otpError && otp.length === 6
                    ? 'border-green-300 dark:border-green-600'
                    : 'border-purple-200 dark:border-purple-500/30'
                }`}
                placeholder="Enter OTP"
              />
              {otpError && <div className="rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 p-4 shadow-md"><div className="flex items-center justify-center"><span className="text-xl mr-2">⚠️</span><p className="text-sm font-semibold text-red-800">{otpError}</p></div></div>}
              {error && <div className="rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 p-4 shadow-md"><div className="flex items-center justify-center"><span className="text-xl mr-2">⚠️</span><p className="text-sm font-semibold text-red-800">{error}</p></div></div>}
              {success && <div className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-4 shadow-md"><div className="flex items-center justify-center"><span className="text-xl mr-2">🎉</span><p className="text-sm font-bold text-green-800">OTP verified! ✔️</p></div></div>}
              <button
                type="submit"
                className="w-full px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={
                  loading ||
                  otp.length !== 6 ||
                  !/^\d{6}$/.test(otp) ||
                  (error && otp === lastTriedOtp) ||
                  attemptsLeft === 0 ||
                  !!otpError
                }
              >
                {loading ? '✨ Verifying...' : '🚀 Verify OTP'}
              </button>
            </form>
          )}
          {/* Hide resend if showChangePhone is true */}
          {!showChangePhone && (
            <>
              {resendSeconds > 0 ? (
                <div className="w-full mt-4 text-center text-sm text-gray-500">
                  Resend available in {resendSeconds}s
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="w-full mt-4 text-purple-600 hover:text-purple-700 font-semibold hover:underline text-base transition-colors"
                  disabled={loading}
                >
                  Resend OTP
                </button>
              )}
              {resent && <div className="text-green-600 text-center mt-2 text-sm font-semibold">✔️ OTP resent!</div>}
            </>
          )}
          {/* Change contact section: phone or email */}
          {/* Hide change link if showChangePhone is true */}
          {!showChangePhone && (
            <div className="text-center mt-4">
              <button
                type="button"
                className="text-purple-600 hover:text-purple-700 font-semibold hover:underline text-sm transition-colors"
                onClick={() => setShowChangePhone(true)}
              >
                {verification.type === 'phone' || verification.type === 'password_reset'
                  ? 'Used the wrong phone number? Click here to change'
                  : 'Used the wrong email? Click here to change'}
              </button>
            </div>
          )}
          {/* Hide attempts left if showChangePhone is true */}
          {!showChangePhone && error !== 'OTP has expired' && attemptsLeft !== null && (
            <div className="text-center text-xs text-gray-500 mt-2">
              Attempts left: {attemptsLeft}
            </div>
          )}
          {showChangePhone && (
            <form
              onSubmit={verification.type === 'phone' || verification.type === 'password_reset' ? handleChangePhoneSubmit : async (e) => {
                e.preventDefault();
                setChangePhoneError(null);
                setChangePhoneLoading(true);
                try {
                  const res = await fetch(`${API_BASE_URL}/api/v1/auth/update-email`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: newPhone, user_id }),
                  });
                  if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.message || 'Failed to update email');
                  }
                  const data = await res.json();
                  if (data.verification) {
                    setVerification(data.verification);
                    setShowChangePhone(false);
                    setNewPhone('');
                    setLocalFailedAttempts(0);
                    setOtp('');
                    setLastTriedOtp('');
                  }
                } catch (err: any) {
                  setChangePhoneError(err.message || 'Failed to update email');
                } finally {
                  setChangePhoneLoading(false);
                }
              }}
              className="space-y-4 mt-6 flex flex-col items-center"
              style={{ width: '100%' }}
            >
              <label className="block text-primary-700 mb-1 font-medium text-center">
                {verification.type === 'phone' || verification.type === 'password_reset'
                  ? 'Enter new phone number'
                  : 'Enter new email address'}
              </label>
              <input
                type={verification.type === 'phone' || verification.type === 'password_reset' ? 'tel' : 'email'}
                name="newPhone"
                value={newPhone}
                onChange={handleNewPhoneChange}
                onBlur={handleNewPhoneBlur}
                required
                className={`w-full max-w-xs h-12 text-base px-4 py-3 rounded-lg border bg-gray-50 dark:bg-slate-800 text-primary-900 dark:text-primary-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-400 transition ${
                  newPhoneError 
                    ? 'border-red-300 dark:border-red-600' 
                    : newPhone && !newPhoneError
                    ? 'border-green-300 dark:border-green-600'
                    : 'border-primary-200 dark:border-primary-700'
                }`}
                placeholder={verification.type === 'phone' || verification.type === 'password_reset' ? 'e.g. 0712345678' : 'e.g. user@email.com'}
              />
              {newPhoneError && (
                <div className="text-red-700 bg-red-50 border border-red-200 rounded p-2 text-center w-full max-w-xs">{newPhoneError}</div>
              )}
              <button
                type="submit"
                className="w-full max-w-xs bg-primary-700 text-white py-2 rounded-md hover:bg-primary-800 transition-colors duration-200 font-semibold disabled:opacity-60"
                disabled={
                  changePhoneLoading ||
                  !!newPhoneError ||
                  !newPhone
                }
              >
                {changePhoneLoading ? 'Submitting...' : 'Submit'}
              </button>

              {changePhoneError && (
                <div className="text-red-700 bg-red-50 border border-red-200 rounded p-2 text-center w-full max-w-xs">{changePhoneError}</div>
              )}
              <button
                type="button"
                className="w-full max-w-xs mt-2 text-gray-500 hover:underline text-xs"
                onClick={() => setShowChangePhone(false)}
              >
                Cancel
              </button>
            </form>
          )}

        </PurpleCard>
      </main>
      </PurpleThemeWrapper>
      
      {/* Household Profile Modal - Temporarily commented out to debug */}
      {/* <HouseholdProfileModal
        isOpen={showProfileModal}
        onClose={handleProfileModalClose}
        onComplete={handleProfileComplete}
      /> */}
      
      <Footer />
    </div>
  );
}

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
