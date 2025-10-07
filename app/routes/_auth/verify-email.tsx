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
  const location = useLocation();
  const locationState = (location.state || {}) as { user_id?:string };
  const [user_id, setUserId] = useState(locationState.user_id);
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
        navigate("/verify-otp", { state: { verification: data.verification } });
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
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
      <Navigation />
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8 animate-fadeIn">
        <section className="w-full max-w-md mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-card p-8 border border-gray-100 dark:border-slate-700">
          <h1 className="text-3xl font-extrabold text-primary mb-6 text-center dark:text-primary-400">Verify Your Email</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-primary-700 mb-1 font-medium">Email address</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-12 text-base px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-gray-50 dark:bg-slate-800 text-primary-900 dark:text-primary-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-400 transition"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>
            {error && (
              <div className="text-red-700 bg-red-50 border border-red-200 rounded p-2 text-center">{error}</div>
            )}
            {success && (
              <div className="text-green-700 bg-green-50 border border-green-200 rounded p-2 text-center">Verification email sent. Please check your inbox.</div>
            )}
            <button
              type="submit"
              className="w-full bg-primary-700 text-white py-2 rounded-md hover:bg-primary-800 transition-colors duration-200 font-semibold disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
          <button
            type="button"
            className="w-full mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors duration-200 font-normal bg-transparent border-none outline-none"
            style={{ boxShadow: 'none' }}
            onClick={() => {
              const userObj = localStorage.getItem('user_object');
              let path = '/';
              if (userObj) {
                const parsed = JSON.parse(userObj);
                if (parsed.profile_type === 'household') path = '/household';
                else if (parsed.profile_type === 'househelp') path = '/househelp';
                else if (parsed.profile_type === 'bureau') path = '/bureau';
              }
              navigate(path);
            }}
          >
            Skip for now
          </button>
        </section>
      </main>
      <Footer />
    </div>
  );
}

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
