import React, { useState } from "react";
import { Link } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { forgotPasswordSchema, validateForm, validateField, normalizeKenyanPhoneNumber } from '~/utils/validation';
import { API_BASE_URL } from '~/config/api';
import { extractErrorMessage } from '~/utils/errorMessages';
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { PurpleCard } from '~/components/ui/PurpleCard';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SafaricomDisclaimer } from '~/components/ui/SafaricomDisclaimer';

export default function ForgotPasswordPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Validation state
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    
    // Clear field error when user starts typing
    if (fieldError) {
      setFieldError(null);
    }
    
    // Mark field as touched
    if (!touched) {
      setTouched(true);
    }
    
    // Real-time validation
    if (touched && value) {
      const validation = validateForm(forgotPasswordSchema, { phone: value });
      if (!validation.isValid) {
        setFieldError(Object.values(validation.errors)[0]);
      }
    }
  };

  const handleBlur = () => {
    setTouched(true);
    if (input) {
      const validation = validateForm(forgotPasswordSchema, { phone: input });
      if (!validation.isValid) {
        setFieldError(Object.values(validation.errors)[0]);
      } else {
        setFieldError(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateForm(forgotPasswordSchema, { phone: input });
    if (!validation.isValid) {
      setFieldError(Object.values(validation.errors)[0]);
      setTouched(true);
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    setFieldError(null);
    
    try {
      // Normalize phone number to international format
      const normalizedPhone = normalizeKenyanPhoneNumber(input);

      const { default: authService } = await import('~/services/grpc/auth.service');
      const response = await authService.forgotPassword(normalizedPhone);
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
        setSuccess(true);
        // Navigate to verify-otp page with verification data in state
        window.location.href = `/verify-otp?verification=${encodeURIComponent(JSON.stringify(verification))}`;
      }
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const isFieldValid = () => {
    return touched && !fieldError && input;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={false} bubbleDensity="low" className="flex-1">
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8">
        <PurpleCard hover={false} glow={true} className="w-full max-w-md p-8 sm:p-10">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 text-center">Forgot Password? 🔑</h1>
          <p className="text-gray-600 text-center mb-8 text-base">
            Enter your phone number and we'll send you a verification code to reset your password.
          </p>
          
          {error && <ErrorAlert message={error} />}
          
          {success && (
            <div className="mb-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-5 shadow-md">
              <div className="flex items-center justify-center">
                <span className="text-2xl mr-3">🎉</span>
                <p className="text-base font-bold text-green-800">OTP sent successfully! Check your phone 📱</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-purple-700 mb-2">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={input}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`w-full h-12 text-base px-4 py-3 rounded-xl border-2 bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all ${
                      fieldError 
                          ? 'border-red-300' 
                          : isFieldValid()
                          ? 'border-green-300'
                          : 'border-purple-200'
                  }`}
                  placeholder="Enter your phone number"
                />
                {fieldError && (
                  <p className="text-red-600 text-sm mt-1">{fieldError}</p>
                )}
                <SafaricomDisclaimer className="mt-2" />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !!fieldError || !input}
              className="w-full px-8 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? "✨ Sending..." : "🚀 Send OTP"}
            </button>
          </form>
          <div className="flex justify-center mt-8">
            <Link to="/login" className="text-base font-semibold text-purple-600 hover:text-purple-700 hover:underline transition-colors">← Back to Login</Link>
          </div>
        </PurpleCard>
      </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
} 
// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
