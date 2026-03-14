import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Navigation } from '~/components/Navigation';
import { Footer } from '~/components/Footer';
import { handleApiError } from '~/utils/errorMessages';
import { normalizeKenyanPhoneNumber } from '~/utils/validation';
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { PurpleCard } from '~/components/ui/PurpleCard';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SafaricomDisclaimer } from '~/components/ui/SafaricomDisclaimer';

export const meta = () => [
  { title: "Add Phone Number — Homebit" },
  { name: "description", content: "Add your phone number to your Homebit account for verification." },
];

export default function AddPhone() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state || {}) as {
    user_id?: string;
    redirectTo?: string;
    profileType?: string;
  };

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Get user_id from state or localStorage
  const getUserId = (): string => {
    if (locationState.user_id) return locationState.user_id;
    try {
      const userObj = JSON.parse(localStorage.getItem('user_object') || '{}');
      return userObj.user_id || userObj.id || '';
    } catch {
      return '';
    }
  };

  const userId = getUserId();

  // Redirect to login if no user context
  useEffect(() => {
    if (!userId) {
      console.warn('[add-phone] No user_id found, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [userId, navigate]);

  // Simple Kenyan phone validation
  const phoneRegex = /^(?:0[17]\d{8}|\+?254[17]\d{8})$/;
  const isPhoneValid = phoneRegex.test(phone.replace(/\s/g, ''));

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhone(value);
    if (error) setError(null);

    if (value && value.length >= 10 && !phoneRegex.test(value.replace(/\s/g, ''))) {
      setPhoneError('Please enter a valid Kenyan phone number (e.g. 0712345678)');
    } else {
      setPhoneError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const normalizedPhone = normalizeKenyanPhoneNumber(phone);
      const { default: authService } = await import('~/services/grpc/auth.service');
      const response = await authService.updatePhone(userId, normalizedPhone);

      const verificationProto = response.getVerification();
      if (verificationProto) {
        const verification = {
          id: verificationProto.getId(),
          user_id: verificationProto.getUserId(),
          type: verificationProto.getType(),
          status: verificationProto.getStatus(),
          target: verificationProto.getTarget(),
          expires_at: verificationProto.getExpiresAt()?.toDate?.().toISOString() || '',
          max_attempts: verificationProto.getMaxAttempts(),
          attempts: verificationProto.getAttempts(),
          next_resend_at: verificationProto.getNextResendAt()?.toDate?.().toISOString() || '',
        };

        navigate('/verify-otp', {
          state: {
            verification,
            afterAddPhone: true,
            redirectTo: locationState.redirectTo,
            profileType: locationState.profileType,
          },
        });
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'phone');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={false} bubbleDensity="low" className="flex-1">
        <main className="flex-1 flex flex-col justify-center items-center px-4 py-8">
          <PurpleCard hover={false} glow={true} className="w-full max-w-md p-8 sm:p-10">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 text-center">
              Add Your Phone Number
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
              We need your phone number to verify your account and keep it secure.
            </p>

            <SafaricomDisclaimer className="mb-5" />

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={phone}
                  onChange={handlePhoneChange}
                  className={`w-full h-12 text-base px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
                    phoneError
                      ? 'border-red-300 dark:border-red-500'
                      : isPhoneValid
                      ? 'border-green-300 dark:border-green-500'
                      : 'border-purple-200 dark:border-purple-500/30'
                  }`}
                  placeholder="0712345678"
                  disabled={loading}
                />
                {phoneError && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{phoneError}</p>
                )}
                {isPhoneValid && !phoneError && (
                  <p className="text-green-600 dark:text-green-400 text-sm mt-1">✓ Valid phone number</p>
                )}
              </div>

              {error && <ErrorAlert message={error} />}

              <button
                type="submit"
                className="w-full px-8 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={loading || !isPhoneValid || !!phoneError}
              >
                {loading ? '✨ Sending OTP...' : '🚀 Continue'}
              </button>
            </form>
          </PurpleCard>
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}

export { ErrorBoundary } from "~/components/ErrorBoundary";
