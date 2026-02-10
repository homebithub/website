import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Navigation } from '~/components/Navigation';
import { Footer } from '~/components/Footer';
import { handleApiError, extractErrorMessage } from '~/utils/errorMessages';
// Temporarily commented out to debug module loading issue
// import { HouseholdProfileModal } from '~/components/modals/HouseholdProfileModal';
import { otpSchema, updatePhoneSchema, updateEmailSchema, validateForm, validateField } from '~/utils/validation';
import { API_BASE_URL } from '~/config/api';
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { PurpleCard } from '~/components/ui/PurpleCard';
import { ErrorAlert } from '~/components/ui/ErrorAlert';

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
        throw new Error(extractErrorMessage(err) || 'Failed to update phone');
      }
      const data = await res.json();
      if (data.verification) {
        setVerification(data.verification);
        setShowChangePhone(false);
        setNewPhone('');
        setLocalFailedAttempts(0);
        setOtp('');
        setLastTriedOtp('');
        setResendSeconds(30);
      }
    }else{
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: newPhone,  }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(extractErrorMessage(err) || 'Failed to send OTP');
      }
      const data = await res.json();
      if (data.verification) {
        setVerification(data.verification);
        setShowChangePhone(false);
        setNewPhone('');
        setLocalFailedAttempts(0);
        setOtp('');
        setLastTriedOtp('');
        setResendSeconds(30);
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

  // Timer state for resend cooldown - always start with 30s on initial load
  const [resendSeconds, setResendSeconds] = useState<number>(() => {
    if (verification?.next_resend_at) {
      const nextResend = new Date(verification.next_resend_at).getTime();
      const now = Date.now();
      const diff = Math.floor((nextResend - now) / 1000);
      return diff > 0 ? diff : 30;
    }
    return 30;
  });

  // Reset resend timer when verification changes (e.g. after resend/change phone)
  const verificationRef = React.useRef(verification);
  React.useEffect(() => {
    // Only reset timer when verification actually changes (not on initial mount)
    if (verificationRef.current === verification) return;
    verificationRef.current = verification;
    if (verification?.next_resend_at) {
      const nextResend = new Date(verification.next_resend_at).getTime();
      const now = Date.now();
      const diff = Math.floor((nextResend - now) / 1000);
      setResendSeconds(diff > 0 ? diff : 30);
    } else {
      setResendSeconds(30);
    }
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

  // Countdown effect - simple 1-second decrement
  React.useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = setTimeout(() => {
      setResendSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendSeconds]);

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
        throw new Error(extractErrorMessage(err) || 'OTP verification failed');
      }
      const userData = await res.json();
      console.log('[VERIFY-OTP] Raw response:', JSON.stringify(userData));
      
      // Flatten user data: gateway returns { user: { id, profile_type, ... }, token }
      const userObj = userData.user || {};
      const flatUser = {
        ...userObj,
        user_id: userObj.id || userObj.user_id,
        profile_type: userObj.profile_type || localStorage.getItem('profile_type') || '',
      };
      
      // Store token and user_object in localStorage
      if (userData.token) {
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user_object', JSON.stringify(flatUser));

        // Persist profile metadata consistently with login flow
        if (flatUser.profile_type) {
          localStorage.setItem('profile_type', flatUser.profile_type);
          localStorage.setItem('userType', flatUser.profile_type);
        }
      }
      setSuccess(true);
      setLocalFailedAttempts(0); // reset on success
      setLastTriedOtp('');
      
      const profileType = flatUser.profile_type;
      const userId = flatUser.user_id;
      console.log('[VERIFY-OTP] Profile type:', profileType, 'User ID:', userId);
      
      // If bureauId is present in state, redirect to /bureau/househelps after verification
      if (locationState.bureauId) {
        navigate('/bureau/househelps');
      } else {
        // Bureau users should not verify through regular flow
        if (profileType === 'bureau') {
          console.log('[VERIFY-OTP] Bureau user detected, redirecting to home');
          navigate('/');
          return;
        }

        // Step 1: After phone OTP, go to email entry page (unless already done)
        if (!afterEmailVerification) {
          if (profileType === 'household' || profileType === 'househelp') {
            console.log('[VERIFY-OTP] Phone verified, redirecting to verify-email');
            navigate('/verify-email', {
              state: {
                user_id: userId,
                from: 'phone-verification',
              },
            });
            return;
          }
        }

        // Step 2: After email OTP, go to profile setup
        let path = '/';
        if (profileType === 'household' || profileType === 'househelp') {
          try {
            const token = localStorage.getItem('token');
            if (token) {
              const setupResponse = await fetch(`${API_BASE_URL}/api/v1/profile-setup-steps`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (setupResponse.ok) {
                const setupData = await setupResponse.json();
                const isComplete = setupData.is_complete || false;
                const lastStep = setupData.last_completed_step || 0;

                if (!isComplete) {
                  const setupRoute = profileType === 'household'
                    ? `/profile-setup/household?step=${lastStep + 1}`
                    : `/profile-setup/househelp?step=${lastStep + 1}`;
                  console.log('[VERIFY-OTP] Email verified, redirecting to profile setup:', setupRoute);
                  navigate(setupRoute);
                  return;
                }
              }
            }
          } catch (err) {
            console.error('[VERIFY-OTP] Failed to check profile setup status:', err);
          }

          // Fallback: start setup from step 1
          path = profileType === 'household' ? '/profile-setup/household?step=1' : '/profile-setup/househelp?step=1';
        }
        console.log('[VERIFY-OTP] Redirecting to:', path);
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
        throw new Error(extractErrorMessage(err) || 'Failed to resend OTP');
      }
      const data = await res.json();
      if (data.verification) {
        setVerification(data.verification);
        setLocalFailedAttempts(0);
        setOtp('');
        setLastTriedOtp('');
      }
      setResendSeconds(30);
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

  // Guard: render nothing while redirecting if verification is missing
  if (!verification) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={false} bubbleDensity="low" className="flex-1">
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8">
        <PurpleCard hover={false} glow={true} className="w-full max-w-md p-8 sm:p-10">
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 text-center">Verify Account 🔒</h2>
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
                className={`w-full h-14 px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.4)] text-center tracking-widest text-2xl bg-white dark:bg-[#13131a] text-gray-900 dark:text-white shadow-sm transition-all ${
                  otpError 
                    ? 'border-red-300 dark:border-red-600' 
                    : otpTouched && !otpError && otp.length === 6
                    ? 'border-green-300 dark:border-green-600'
                    : 'border-purple-200 dark:border-purple-500/30'
                }`}
                placeholder="Enter OTP"
              />
              {otpError && <ErrorAlert message={otpError} />}
              {error && <ErrorAlert message={error} />}
              {success && <div className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-4 shadow-md"><div className="flex items-center justify-center"><span className="text-xl mr-2">🎉</span><p className="text-sm font-bold text-green-800">OTP verified! ✔️</p></div></div>}
              <button
                type="submit"
                className="w-full px-8 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                className="text-sm transition-colors"
                onClick={() => setShowChangePhone(true)}
              >
                <span className="text-gray-400 dark:text-gray-300">
                  {verification.type === 'phone' || verification.type === 'password_reset'
                    ? 'Used the wrong phone number? Click '
                    : 'Used the wrong email? Click '}
                </span>
                <span className="text-purple-500 underline font-semibold hover:text-purple-400">here</span>
                <span className="text-gray-400 dark:text-gray-300"> to change</span>
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
                    throw new Error(extractErrorMessage(err) || 'Failed to update email');
                  }
                  const data = await res.json();
                  if (data.verification) {
                    setVerification(data.verification);
                    setShowChangePhone(false);
                    setNewPhone('');
                    setLocalFailedAttempts(0);
                    setOtp('');
                    setLastTriedOtp('');
                    setResendSeconds(30);
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
                <div className="w-full max-w-xs"><ErrorAlert message={newPhoneError} /></div>
              )}
              <button
                type="submit"
                className="w-full max-w-xs bg-primary-700 text-white py-1 rounded-xl hover:bg-primary-800 transition-colors duration-200 font-semibold disabled:opacity-60"
                disabled={
                  changePhoneLoading ||
                  !!newPhoneError ||
                  !newPhone
                }
              >
                {changePhoneLoading ? 'Submitting...' : 'Submit'}
              </button>

              {changePhoneError && (
                <div className="w-full max-w-xs"><ErrorAlert message={changePhoneError} /></div>
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
