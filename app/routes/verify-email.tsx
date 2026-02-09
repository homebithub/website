import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router';
import { Navigation } from '~/components/Navigation';
import { Footer } from '~/components/Footer';
import { handleApiError } from '~/utils/errorMessages';
import { API_BASE_URL } from '~/config/api';
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { PurpleCard } from '~/components/ui/PurpleCard';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const location = useLocation();
  const locationState = (location.state || {}) as { user_id?:string, from?: string };
  const [user_id, setUserId] = useState(locationState.user_id);
  
  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Check if email is valid
  const isEmailValid = emailRegex.test(email);
  
  // Validate email on change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (value && !emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError(null);
    }
  };
  
  // Redirect to signup if no user_id (user typed URL directly)
  React.useEffect(() => {
    if (!user_id) {
      console.warn('No user_id - redirecting to signup');
      navigate('/signup', { replace: true });
    }
  }, [user_id, navigate]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/update-email`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email,user_id }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to request email verification");
      }
      if (data.verification) {
        // Navigate to verify-otp page with verification object in state
        // After email OTP verification, it will redirect to household setup
        navigate("/verify-otp", { 
          state: { 
            verification: data.verification,
            afterEmailVerification: true 
          } 
        });
        setSuccess(true);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      const errorMessage = handleApiError(err, 'email');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
console.log(user_id,"user_id");
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={false} bubbleDensity="low" className="flex-1">
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8">
        <PurpleCard hover={false} glow={true} className="w-full max-w-md p-8 sm:p-10">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 text-center">Verify Your Email 📧</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">Email address</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={email}
                onChange={handleEmailChange}
                className={`w-full h-12 text-base px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                  emailError 
                    ? 'border-red-300 dark:border-red-500' 
                    : isEmailValid 
                    ? 'border-green-300 dark:border-green-500' 
                    : 'border-purple-200 dark:border-purple-500/30'
                }`}
                placeholder="Enter your email"
                disabled={loading}
              />
              {emailError && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">{emailError}</p>
              )}
              {isEmailValid && !emailError && (
                <p className="text-green-600 dark:text-green-400 text-sm mt-1">✓ Valid email</p>
              )}
            </div>
            {error && (
              <div className="rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 p-5 shadow-md">
                <div className="flex items-center justify-center">
                  <span className="text-2xl mr-3">⚠️</span>
                  <p className="text-base font-semibold text-red-800">{error}</p>
                </div>
              </div>
            )}
            {success && (
              <div className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-5 shadow-md">
                <div className="flex items-center justify-center">
                  <span className="text-2xl mr-3">🎉</span>
                  <p className="text-base font-bold text-green-800">Verification email sent! Check your inbox 📧</p>
                </div>
              </div>
            )}
            <button
              type="submit"
              className="w-full px-8 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              disabled={loading || !isEmailValid || !!emailError}
            >
              {loading ? '✨ Sending...' : '🚀 Send Verification'}
            </button>
            {!isEmailValid && email && (
              <p className="text-amber-600 dark:text-amber-400 text-sm text-center">
                Please enter a valid email address to continue
              </p>
            )}
          </form>
          <button
            type="button"
            className="w-full mt-6 text-base text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-colors bg-transparent border-none outline-none"
            style={{ boxShadow: 'none' }}
            onClick={() => {
              const userObj = localStorage.getItem('user_object');
              let path = '/';
              if (userObj) {
                const parsed = JSON.parse(userObj);
                if (parsed.profile_type === 'household' || parsed.profile_type === 'household') {
                  path = '/household/setup';
                } else if (parsed.profile_type === 'househelp') {
                  path = '/profile-setup/househelp';
                } else if (parsed.profile_type === 'bureau') {
                  path = '/bureau';
                }
              }
              navigate(path);
            }}
          >
            Skip for now
          </button>
        </PurpleCard>
      </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
