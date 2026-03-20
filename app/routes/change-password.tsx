import { getAccessTokenFromCookies } from '~/utils/cookie';
import React, { useState, useEffect } from "react";
import { Form } from "react-router";
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { Error as ErrorDisplay } from "~/components/Error";
import { changePasswordSchema, validateForm, validateField } from '~/utils/validation';
import { useAuth } from "~/contexts/useAuth";
import { useNavigate, useLocation } from "react-router";
import { Loading } from "~/components/Loading";
import { extractErrorMessage } from '~/utils/errorMessages';
import { authService } from '~/services/grpc/auth.service';
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { PurpleCard } from '~/components/ui/PurpleCard';
import { ErrorAlert } from '~/components/ui/ErrorAlert';

interface User {
  id: string;
  email: string;
}

export const loader = async () => {
  try {
    // For server-side loading, we need to check if user is authenticated
    // Since this is a protected route, we'll let the client-side auth handle it
    // Return null user data and let the component handle authentication
    return { user: null };
  } catch (error) {
    console.error('Loader error:', error);
    // Don't throw an error, just return null user data
    return { user: null };
  }
};

export default function ChangePasswordPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Remove loader data usage - rely only on client-side auth
  // const loaderData = useLoaderData<typeof loader>();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Validation state
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({});
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      const returnUrl = encodeURIComponent(location.pathname);
      navigate(`/login?redirect=${returnUrl}`);
    }
    // Detect Google OAuth users who don't have a password
    if (typeof window !== 'undefined') {
      setIsGoogleUser(localStorage.getItem('auth_provider') === 'google');
    }
  }, [user, loading, navigate, location.pathname]);

  // Show loading while checking authentication
  if (loading) {
    return <Loading text="Checking authentication..." />;
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Mark field as touched
    if (!touchedFields[name]) {
      setTouchedFields(prev => ({ ...prev, [name]: true }));
    }
    
    // Real-time validation for password fields
    if (touchedFields[name] && value) {
      const fieldError = validateField(changePasswordSchema, name, value);
      if (fieldError) {
        setFieldErrors(prev => ({ ...prev, [name]: fieldError }));
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Mark field as touched
    if (!touchedFields[name]) {
      setTouchedFields(prev => ({ ...prev, [name]: true }));
    }
    
    // Validate field on blur
    const fieldError = validateField(changePasswordSchema, name, value);
    if (fieldError) {
      setFieldErrors(prev => ({ ...prev, [name]: fieldError }));
    } else {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate entire form
    const validation = validateForm(changePasswordSchema, formData);
    
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      // Mark all fields as touched to show errors
      const allTouched = Object.keys(formData).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {} as { [key: string]: boolean });
      setTouchedFields(allTouched);
      return;
    }
    
    setFormLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Get authentication token
      const token = getAccessTokenFromCookies();
      if (!token) {
        throw new Error("You must be logged in to change your password");
      }
      
      await authService.changePassword('', formData.currentPassword, formData.newPassword);
      
      setSuccess(true);
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setFieldErrors({});
      setTouchedFields({});
    } catch (err: any) {
      setError(err.message || "Failed to change password");
    } finally {
      setFormLoading(false);
    }
  };

  const getFieldError = (fieldName: string) => {
    return touchedFields[fieldName] && fieldErrors[fieldName] ? fieldErrors[fieldName] : '';
  };

  const isFieldValid = (fieldName: string) => {
    return touchedFields[fieldName] && !fieldErrors[fieldName];
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={false} bubbleDensity="low" className="flex-1">
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Back link */}
          <button
            onClick={() => navigate('/settings')}
            className="inline-flex items-center gap-1.5 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium mb-6 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Settings
          </button>
        </div>
        <PurpleCard hover={false} glow={true} className="w-full max-w-2xl p-8 sm:p-10">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">Change Password 🔐</h1>
          <p className="text-base text-gray-600 dark:text-gray-300 mb-8">Update your password and manage security settings.</p>
          
          {isGoogleUser ? (
            <div className="space-y-6">
              <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border-2 border-blue-200 dark:border-blue-500/40 p-6 shadow-md">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white dark:bg-[#13131a] border-2 border-blue-200 dark:border-blue-500/30 flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200 mb-2">Signed in with Google</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                      Your account uses Google for authentication. You don't have a password to change because your login is managed securely by Google.
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-3">
                      To update your login security, manage your account directly through{' '}
                      <a
                        href="https://myaccount.google.com/security"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold underline hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                      >
                        Google Account Settings
                      </a>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-accent rounded-xl shadow-card p-6 dark:bg-slate-800">
                <div className="font-bold text-primary mb-1 dark:text-primary-300">Security Settings</div>
                <div className="text-text text-sm mb-2 dark:text-primary-200">Manage your security settings.</div>
                <a href="/settings" className="btn-primary">Security Settings</a>
              </div>
            </div>
          ) : (
          <>
          {error && <ErrorAlert message={error} />}
          
          {success && (
            <div className="mb-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-emerald-950/40 dark:to-emerald-950/40 border-2 border-green-200 dark:border-emerald-500/40 p-5 shadow-md transition-colors duration-300">
              <div className="flex items-center justify-center">
                <span className="text-2xl mr-3">🎉</span>
                <p className="text-base font-bold text-green-800 dark:text-green-200">Password changed successfully! ✔️</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-semibold text-purple-700 mb-2">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`w-full h-12 text-base px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#020617] text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all ${
                    getFieldError('currentPassword') 
                      ? 'border-red-300 dark:border-red-600' 
                      : isFieldValid('currentPassword')
                      ? 'border-green-300 dark:border-green-600'
                      : 'border-purple-200'
                  }`}
                />
                {getFieldError('currentPassword') && (
                  <p className="text-red-600 text-sm mt-1">{getFieldError('currentPassword')}</p>
                )}
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-semibold text-purple-700 mb-2">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`w-full h-12 text-base px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#020617] text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all ${
                    getFieldError('newPassword') 
                      ? 'border-red-300 dark:border-red-600' 
                      : isFieldValid('newPassword')
                      ? 'border-green-300 dark:border-green-600'
                      : 'border-purple-200'
                  }`}
                />
                {getFieldError('newPassword') && (
                  <p className="text-red-600 text-sm mt-1">{getFieldError('newPassword')}</p>
                )}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-purple-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`w-full h-12 text-base px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#020617] text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all ${
                    getFieldError('confirmPassword') 
                      ? 'border-red-300 dark:border-red-600' 
                      : isFieldValid('confirmPassword')
                      ? 'border-green-300 dark:border-green-600'
                      : 'border-purple-200'
                  }`}
                />
                {getFieldError('confirmPassword') && (
                  <p className="text-red-600 text-sm mt-1">{getFieldError('confirmPassword')}</p>
                )}
              </div>
              <div>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full px-8 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {formLoading ? "✨ Changing..." : "🚀 Change Password"}
                </button>
              </div>
            </div>
          </form>
          
          <div className="space-y-6 mt-6">
            <div className="bg-accent rounded-xl shadow-card p-6 dark:bg-slate-800">
              <div className="font-bold text-primary mb-1 dark:text-primary-300">Security Settings</div>
              <div className="text-text text-sm mb-2 dark:text-primary-200">Manage your security settings.</div>
              <a href="/settings" className="btn-primary">Security Settings</a>
            </div>
          </div>
          </>
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
