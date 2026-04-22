import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { Navigation } from '~/components/Navigation';
import { Footer } from '~/components/Footer';
import { handleApiError, extractErrorMessage } from '~/utils/errorMessages';
import { otpSchema, updatePhoneSchema, updateEmailSchema, validateForm, validateField } from '~/utils/validation';
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { PurpleCard } from '~/components/ui/PurpleCard';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { Loading } from '~/components/Loading';
import { cacheAuthSession, getStoredProfileType, getStoredUserId } from '~/utils/authStorage';
import { resolveProfileSetupDestination } from '~/utils/profileSetupRouting';

const PENDING_VERIFICATION_KEY = 'homebit.pendingVerification';

type VerifyOtpLocationState = {
  verification?: any;
  bureauId?: string;
  afterEmailVerification?: boolean;
  isGoogleSignup?: boolean;
  afterAddPhone?: boolean;
  redirectTo?: string;
  profileType?: string;
  from?: string;
};

function readPendingVerificationState(): VerifyOtpLocationState {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.sessionStorage.getItem(PENDING_VERIFICATION_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persistPendingVerificationState(state: VerifyOtpLocationState) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(PENDING_VERIFICATION_KEY, JSON.stringify(state));
  } catch {
    // Ignore session storage failures and fall back to route state only.
  }
}

function clearPendingVerificationState() {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(PENDING_VERIFICATION_KEY);
  } catch {
    // Ignore session storage failures.
  }
}

export default function VerifyOtpPage() {
  // UI state for changing phone
  const [showChangePhone, setShowChangePhone] = React.useState(false);
  const [newPhone, setNewPhone] = React.useState('');

  // Validation state
  const [otpError, setOtpError] = React.useState<string | null>(null);
  const [newPhoneError, setNewPhoneError] = React.useState<string | null>(null);
  const [otpTouched, setOtpTouched] = React.useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const locationState = (location.state || {}) as VerifyOtpLocationState;
  const queryFlags: VerifyOtpLocationState = {
    bureauId: searchParams.get('bureauId') || undefined,
    afterEmailVerification: searchParams.has('afterEmailVerification')
      ? searchParams.get('afterEmailVerification') === '1'
      : undefined,
    isGoogleSignup: searchParams.has('isGoogleSignup')
      ? searchParams.get('isGoogleSignup') === '1'
      : undefined,
    afterAddPhone: searchParams.has('afterAddPhone')
      ? searchParams.get('afterAddPhone') === '1'
      : undefined,
    redirectTo: searchParams.get('redirectTo') || undefined,
    profileType: searchParams.get('profileType') || undefined,
    from: searchParams.get('from') || undefined,
  };
  const [verificationState, setVerificationState] = useState<VerifyOtpLocationState>(() => (
    locationState.verification
      ? { ...queryFlags, ...locationState }
      : { ...queryFlags, ...readPendingVerificationState() }
  ));
  const verification = verificationState.verification;
  const afterEmailVerification = verificationState.afterEmailVerification;
  const afterAddPhone = verificationState.afterAddPhone;
  const verificationType = verification?.type || '';
  const isPhoneUpdateFlow = verificationType === 'phone';
  const isPasswordResetFlow = verificationType === 'password_reset';
  const usesPhoneTarget = isPhoneUpdateFlow || isPasswordResetFlow;

  const verificationToState = (verificationProto: any) => ({
    id: verificationProto.getId(),
    user_id: verificationProto.getUserId(),
    type: verificationProto.getType(),
    status: verificationProto.getStatus(),
    target: verificationProto.getTarget(),
    expires_at: verificationProto.getExpiresAt()?.toDate?.().toISOString() || '',
    max_attempts: verificationProto.getMaxAttempts(),
    attempts: verificationProto.getAttempts(),
    next_resend_at: verificationProto.getNextResendAt()?.toDate?.().toISOString() || '',
  });

  const resolveVerificationUserId = () => verification?.user_id || getStoredUserId() || '';
  
  // Handler for phone change submit
  const [changePhoneError, setChangePhoneError] = React.useState<string | null>(null);
  const [changePhoneLoading, setChangePhoneLoading] = React.useState(false);
  const handleChangePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePhoneError(null);
    setChangePhoneLoading(true);
    
    // Validate new phone/email
    const schema = usesPhoneTarget
      ? updatePhoneSchema
      : updateEmailSchema;
    const validation = validateForm(schema, { 
      [usesPhoneTarget ? 'phone' : 'email']: newPhone 
    });
    
    if (!validation.isValid) {
      setChangePhoneError(Object.values(validation.errors)[0]);
      setChangePhoneLoading(false);
      return;
    }
    
    try {
      const { default: authService } = await import('~/services/grpc/auth.service');
      let verificationProto: any = null;
      const currentUserId = resolveVerificationUserId();

      if (isPhoneUpdateFlow) {
        const response = await authService.updatePhone(currentUserId, newPhone);
        verificationProto = response.getVerification();
      } else if (isPasswordResetFlow) {
        const response = await authService.forgotPassword(newPhone);
        verificationProto = response.getVerification();
      } else {
        const response = await authService.updateEmail(currentUserId, newPhone);
        verificationProto = response.getVerification();
      }

      if (verificationProto) {
        setVerificationState((prev) => ({
          ...prev,
          verification: verificationToState(verificationProto),
        }));
        setShowChangePhone(false);
        setNewPhone('');
        setLocalFailedAttempts(0);
        setOtp('');
        setLastTriedOtp('');
      }
    } catch (err: any) {
      setChangePhoneError(err.message || `Failed to update ${usesPhoneTarget ? 'phone' : 'email'}`);
    } finally {
      setChangePhoneLoading(false);
    }
  };
  
  React.useEffect(() => {
    if (locationState.verification) {
      setVerificationState((prev) => ({ ...prev, ...queryFlags, ...locationState }));
    }
  }, [locationState, queryFlags.afterAddPhone, queryFlags.afterEmailVerification, queryFlags.bureauId, queryFlags.from, queryFlags.isGoogleSignup, queryFlags.profileType, queryFlags.redirectTo]);

  React.useEffect(() => {
    setVerificationState((prev) => ({ ...prev, ...queryFlags }));
  }, [queryFlags.afterAddPhone, queryFlags.afterEmailVerification, queryFlags.bureauId, queryFlags.from, queryFlags.isGoogleSignup, queryFlags.profileType, queryFlags.redirectTo]);

  React.useEffect(() => {
    if (verificationState.verification) {
      persistPendingVerificationState(verificationState);
      return;
    }
    clearPendingVerificationState();
  }, [verificationState]);

  // Redirect to signup if no verification data (user typed URL directly)
  React.useEffect(() => {
    if (!verification) {
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

  // Timer state for resend cooldown - always start with 60s on initial load
  const [resendSeconds, setResendSeconds] = useState<number>(() => {
    if (verification?.next_resend_at) {
      const nextResend = new Date(verification.next_resend_at).getTime();
      const now = Date.now();
      const diff = Math.floor((nextResend - now) / 1000);
      return diff > 0 ? diff : 60;
    }
    return 60;
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
      setResendSeconds(diff > 0 ? diff : 60);
    } else {
      setResendSeconds(60);
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
      // Use gRPC-Web instead of REST
      const { default: authService } = await import('~/services/grpc/auth.service');
      const verifyResponse = await authService.verifyOTP(resolveVerificationUserId(), verification.type, otp);
      // Extract data from gRPC response
      const token = verifyResponse.getToken();
      const refreshToken = verifyResponse.getRefreshToken();
      const userProto = verifyResponse.getUser();
      
      // Convert proto User to plain object
      const flatUser = {
        user_id: userProto?.getId() || user_id,
        email: userProto?.getEmail() || '',
        phone: userProto?.getPhone() || '',
        first_name: userProto?.getFirstName() || '',
        last_name: userProto?.getLastName() || '',
        profile_type: userProto?.getProfileType() || getStoredProfileType() || '',
        is_verified: userProto?.getIsVerified() || false,
        profile_image: userProto?.getProfileImage() || '',
      };
      // Store token and user_object in localStorage
      if (token) {
        cacheAuthSession({
          token,
          refreshToken,
          user: flatUser,
          provider: 'password',
        });
      }
      // Register device after successful verification via gRPC-Web (non-blocking)
      try {
        const { getDeviceId, getDeviceName } = await import('~/utils/deviceFingerprint');
        const { default: deviceService } = await import('~/services/grpc/device.service');
        const devId = await getDeviceId();
        const uid = flatUser.user_id || user_id;
        if (uid) {
          const result = await deviceService.registerDevice(
            uid, devId, getDeviceName(), navigator.userAgent, ''
          );
          void result;
        }
      } catch (deviceError) {
        console.error('[Device] Registration failed:', deviceError);
      }

      setSuccess(true);
      setLocalFailedAttempts(0); // reset on success
      setLastTriedOtp('');
      clearPendingVerificationState();
      
      const profileType = flatUser.profile_type;
      const userId = flatUser.user_id;

      if (isPasswordResetFlow) {
        navigate(`/reset-password?userId=${encodeURIComponent(userId)}`, {
          replace: true,
        });
        return;
      }
      
      // If bureauId is present in state, redirect to /bureau/househelps after verification
      if (verificationState.bureauId) {
        navigate('/bureau/househelps');
      } else if (afterAddPhone) {
        // Coming from /add-phone flow (e.g. Google login user adding phone)
        // Next: email verification if no email, or profile setup / redirect
        const pt = profileType || verificationState.profileType || '';
        if (!flatUser.email && (pt === 'household' || pt === 'househelp')) {
          const params = new URLSearchParams({
            userId,
            from: 'add-phone',
          });
            navigate(`/verify-email?${params.toString()}`, {
              state: { user_id: userId, from: 'add-phone' },
            });
            return;
        }
        // If they have email already, go to profile setup or redirectTo
        const redirectTo = verificationState.redirectTo || '/';
        if (pt === 'household' || pt === 'househelp') {
          try {
            const destination = await resolveProfileSetupDestination({
              userId,
              profileType: pt,
              completedPath: redirectTo,
            });
            navigate(destination, { replace: true });
            return;
          } catch (err: any) {
          }
        }
        navigate(redirectTo, { replace: true });
      } else {
        // Bureau users should not verify through regular flow
        if (profileType === 'bureau') {
          navigate('/');
          return;
        }

        // Step 1: After phone OTP, go to email entry page (unless already done or Google signup)
        if (!afterEmailVerification && !verificationState.isGoogleSignup) {
          if (profileType === 'household' || profileType === 'househelp') {
            const params = new URLSearchParams({
              userId,
              from: 'phone-verification',
            });
            navigate(`/verify-email?${params.toString()}`, {
              state: {
                user_id: userId,
                from: 'phone-verification',
              },
            });
            return;
          }
        }

        // Step 2: After email OTP, go to next onboarding step
        let path = '/';
        if (profileType === 'household' || profileType === 'househelp') {
          try {
            const destination = await resolveProfileSetupDestination({
              userId,
              profileType,
              completedPath: '/',
            });
            navigate(destination, { replace: true });
            return;
          } catch (err: any) {
            console.error('[VERIFY-OTP] GetProgress error:', err);
            console.error('[VERIFY-OTP] Failed to check profile setup status:', err);
          }

          // Fallback
          path = profileType === 'household' ? '/household-choice' : '/profile-setup/househelp?step=1';
        }
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
      const { default: authService } = await import('~/services/grpc/auth.service');
      const response = await authService.resendOTP(resolveVerificationUserId(), verification?.type || 'phone');
      const verificationProto = response.getVerification();
      if (verificationProto) {
        setVerificationState((prev) => ({
          ...prev,
          verification: verificationToState(verificationProto),
        }));
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
      const schema = usesPhoneTarget
        ? updatePhoneSchema
        : updateEmailSchema;
      const validation = validateForm(schema, { 
        [usesPhoneTarget ? 'phone' : 'email']: newPhone 
      });
      if (!validation.isValid) {
        setNewPhoneError(Object.values(validation.errors)[0]);
      } else {
        setNewPhoneError(null);
      }
    }
  };

  // Guard: render nothing while redirecting if verification is missing
  if (!verification) {
    return <Loading text="Redirecting..." />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={false} bubbleDensity="low" className="flex-1">
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8">
        <PurpleCard hover={false} glow={true} className="w-full max-w-md p-8 sm:p-10">
          <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 text-center">Verify Account 🔒</h2>
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
                className={`w-full h-14 px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:shadow-[0_0_15px_rgba(168,85,247,0.4)] text-center tracking-widest text-xl bg-white dark:bg-[#13131a] text-gray-900 dark:text-white shadow-sm transition-all ${
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
              {success && <SuccessAlert message="OTP verified! 🎉" />}
              <button
                type="submit"
                className="w-full px-8 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-base shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                <div className="w-full mt-4 text-center text-xs text-gray-500">
                  Resend available in {resendSeconds}s
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="w-full mt-4 text-purple-600 hover:text-purple-700 font-semibold hover:underline text-sm transition-colors"
                  disabled={loading}
                >
                  Resend OTP
                </button>
              )}
              {resent && <div className="text-green-600 text-center mt-2 text-xs font-semibold">✔️ OTP resent!</div>}
            </>
          )}
          {/* Change contact section: phone or email */}
          {/* Hide change link if showChangePhone is true */}
          {!showChangePhone && (
            <div className="text-center mt-4">
              <button
                type="button"
                className="text-xs transition-colors"
                onClick={() => setShowChangePhone(true)}
              >
                <span className="text-gray-400 dark:text-gray-300">
                  {usesPhoneTarget
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
              onSubmit={handleChangePhoneSubmit}
              className="space-y-4 mt-6 flex flex-col items-center"
              style={{ width: '100%' }}
            >
              <label className="block text-primary-700 mb-1 font-medium text-center">
                {usesPhoneTarget
                  ? 'Enter new phone number'
                  : 'Enter new email address'}
              </label>
              <input
                type={usesPhoneTarget ? 'tel' : 'email'}
                name="newPhone"
                value={newPhone}
                onChange={handleNewPhoneChange}
                onBlur={handleNewPhoneBlur}
                required
                className={`w-full max-w-xs h-12 text-sm px-4 py-3 rounded-lg border bg-gray-50 dark:bg-slate-800 text-primary-900 dark:text-primary-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-400 transition ${
                  newPhoneError 
                    ? 'border-red-300 dark:border-red-600' 
                    : newPhone && !newPhoneError
                    ? 'border-green-300 dark:border-green-600'
                    : 'border-primary-200 dark:border-primary-700'
                }`}
                placeholder={usesPhoneTarget ? 'e.g. 0712345678' : 'e.g. user@email.com'}
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
                className="w-full max-w-xs mt-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold hover:underline text-xs transition-colors"
                onClick={() => setShowChangePhone(false)}
              >
                Cancel
              </button>
            </form>
          )}

        </PurpleCard>
      </main>
      </PurpleThemeWrapper>

      <Footer />
    </div>
  );
}

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
