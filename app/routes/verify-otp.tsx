import React, { useState } from 'react';
import { useLocation, useNavigate } from '@remix-run/react';
import { Footer } from '~/components/Footer';
import { Navigation } from '~/components/Navigation';

export default function VerifyOtpPage() {
  // UI state for changing phone
  const [showChangePhone, setShowChangePhone] = React.useState(false);
  const [newPhone, setNewPhone] = React.useState('');

  // Handler for phone change submit
  const [changePhoneError, setChangePhoneError] = React.useState<string | null>(null);
  const [changePhoneLoading, setChangePhoneLoading] = React.useState(false);
  const handleChangePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePhoneError(null);
    setChangePhoneLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/v1/auth/update-phone', {
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
    } catch (err: any) {
      setChangePhoneError(err.message || 'Failed to update phone');
    } finally {
      setChangePhoneLoading(false);
    }
  };



  const location = useLocation();
  const navigate = useNavigate();
  // Check if state exists
  const locationState = (location.state || {}) as { verification?: any };
  const [verification, setVerification] = useState(locationState.verification);
  React.useEffect(() => {
    if (!verification) {
      // Optionally, redirect to signup if state is missing
      navigate('/signup');
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
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      // Call your backend OTP verification endpoint here
      const res = await fetch('http://localhost:8080/api/v1/verifications/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({  user_id, verification_type: "phone", otp }),
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
      // Navigate to update-email page
      navigate('/update-email');
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
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
      const res = await fetch('http://localhost:8080/api/v1/verifications/resend-otp', {
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
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-900 flex flex-col">
      <Navigation />
      <section className="flex-grow flex items-center justify-center py-16 bg-gray-50 dark:bg-slate-800">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md border border-gray-100 dark:border-slate-700 p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-primary-800 dark:text-primary-400 mb-6 text-center">Verify Your Account</h2>
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
                onChange={e => {
                  const val = e.target.value;
                  // Only allow numbers
                  if (/^\d{0,6}$/.test(val)) {
                    setOtp(val);
                    // Reset error if user types a new value after a failed attempt
                    if (error && val !== lastTriedOtp) setError(null);
                  }
                }}
                required
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 text-center tracking-widest text-lg"
                placeholder="Enter OTP"
              />
              {error && <div className="text-red-700 bg-red-50 border border-red-200 rounded p-2 text-center">{error}</div>}
              {success && <div className="text-green-700 bg-green-50 border border-green-200 rounded p-2 text-center">OTP verified successfully!</div>}
              <button
                type="submit"
                className="w-full bg-primary-700 text-white py-2 rounded-md hover:bg-primary-800 transition-colors duration-200 font-semibold disabled:opacity-60"
                disabled={
                  loading ||
                  otp.length !== 6 ||
                  !/^\d{6}$/.test(otp) ||
                  (error && otp === lastTriedOtp) ||
                  attemptsLeft === 0
                }
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
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
                  className="w-full mt-4 text-primary-700 hover:underline text-sm"
                  disabled={loading}
                >
                  Resend OTP
                </button>
              )}
              {resent && <div className="text-green-600 text-center mt-2 text-sm">OTP resent!</div>}
            </>
          )}
          {/* Change phone number section */}
          {/* Hide change phone link if showChangePhone is true */}
          {!showChangePhone && (
            <div className="text-center mt-4">
              <button
                type="button"
                className="text-primary-700 hover:underline text-xs"
                onClick={() => setShowChangePhone(true)}
              >
                Used the wrong phone number? Click here to change
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
              <label className="block text-primary-700 mb-1 font-medium text-center">Enter new phone number</label>
              <input
                type="tel"
                name="newPhone"
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
                required
                className="w-full max-w-xs h-12 text-base px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-gray-50 dark:bg-slate-800 text-primary-900 dark:text-primary-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-400 transition"
                placeholder="e.g. 0712345678"
              />
              <button
                type="submit"
                className="w-full max-w-xs bg-primary-700 text-white py-2 rounded-md hover:bg-primary-800 transition-colors duration-200 font-semibold disabled:opacity-60"
                disabled={!/^\+?\d{9,15}$/.test(newPhone) || changePhoneLoading}
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

        </div>
      </section>
      <Footer />
    </main>
  );
}
