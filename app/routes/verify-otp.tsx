import React, { useState } from 'react';
import { useLocation, useNavigate } from '@remix-run/react';
import { Footer } from '~/components/Footer';
import { Navigation } from '~/components/Navigation';

export default function VerifyOtpPage() {

  const location = useLocation();
  const navigate = useNavigate();
  // Check if state exists
  const { verification } = (location.state || {}) as { verification?: any };
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

  // Helper to get user_id and phone from verification
  const user_id = verification?.user_id;
  const phone = verification?.target;

  // Attempts left
  const attemptsLeft = verification?.max_attempts && verification?.attempts != null
    ? verification.max_attempts - verification.attempts
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
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
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
          <p className="mb-4 text-center text-gray-700 dark:text-gray-300">Enter the OTP sent to <span className="font-semibold">{phone || ''}</span></p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="otp"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              required
              maxLength={6}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 text-center tracking-widest text-lg"
              placeholder="Enter OTP"
            />
            {error && <div className="text-red-700 bg-red-50 border border-red-200 rounded p-2 text-center">{error}</div>}
            {success && <div className="text-green-700 bg-green-50 border border-green-200 rounded p-2 text-center">OTP verified successfully!</div>}
            <button
              type="submit"
              className="w-full bg-primary-700 text-white py-2 rounded-md hover:bg-primary-800 transition-colors duration-200 font-semibold disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
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
          {attemptsLeft !== null && (
            <div className="text-center text-xs text-gray-500 mt-2">
              Attempts left: {attemptsLeft}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
