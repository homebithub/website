import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, Form } from "react-router";
import React, { useState, useEffect } from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { Error as ErrorDisplay } from "~/components/Error";
import { changePasswordSchema, validateForm, validateField } from '~/utils/validation';
import { useAuth } from "~/contexts/useAuth";
import { useNavigate, useLocation } from "react-router";
import { Loading } from "~/components/Loading";
import { API_BASE_URL } from '~/config/api';
import { extractErrorMessage } from '~/utils/errorMessages';
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { PurpleCard } from '~/components/ui/PurpleCard';
import { ErrorAlert } from '~/components/ui/ErrorAlert';

interface User {
  id: string;
  email: string;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookie = request.headers.get("cookie") || "";
  const res = await fetch(`${API_BASE_URL}/users/me`, {
    headers: { "cookie": cookie },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Response("Failed to fetch user data", { status: res.status });
  }
  const user = await res.json();
  return { user };
};

export default function ChangePasswordPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      const returnUrl = encodeURIComponent(location.pathname);
      navigate(`/login?redirect=${returnUrl}`);
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
      // Add your password change API call here
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(extractErrorMessage(err) || "Failed to change password");
      }
      
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
        <PurpleCard hover={false} glow={true} className="w-full max-w-2xl p-8 sm:p-10">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">Change Password 🔐</h1>
          <p className="text-base text-gray-600 dark:text-gray-300 mb-8">Update your password and manage security settings.</p>
          
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
        </PurpleCard>
      </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
} 
// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
