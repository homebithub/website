import type { LoaderFunctionArgs } from "react-router";
import { json } from "react-router";
import { useLoaderData, Form } from "react-router";
import React, { useState, useEffect } from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { Error } from "~/components/Error";
import { changePasswordSchema, validateForm, validateField } from '~/utils/validation';
import { useAuth } from "~/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router";
import { Loading } from "~/components/Loading";
import { API_BASE_URL } from '~/config/api';
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { PurpleCard } from '~/components/ui/PurpleCard';

interface User {
  id: string;
  email: string;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookie = request.headers.get("cookie") || "";
  const res = await fetch(API_BASE_URL/users/me", {
    headers: { "cookie": cookie },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Response("Failed to fetch user data", { status: res.status });
  }
  const user = await res.json();
  return json({ user });
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
        throw new Error(err.message || "Failed to change password");
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
    <div className="min-h-screen flex flex-col bg-background bg-white dark:bg-slate-900">
      <Navigation />
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8 animate-fadeIn">
        <div className="card w-full max-w-2xl text-center bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700">
          <h1 className="text-4xl font-extrabold text-primary mb-6 dark:text-primary-400">Change Password</h1>
          <p className="text-lg text-text mb-8 dark:text-primary-200">Update your password and manage security settings.</p>
          
          {error && (
            <div className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700 text-center">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 rounded bg-green-100 text-green-700 border border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700 text-center">
              Password changed successfully!
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow p-8">
            <div className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-800 dark:text-white ${
                    getFieldError('currentPassword') 
                      ? 'border-red-300 dark:border-red-600' 
                      : isFieldValid('currentPassword')
                      ? 'border-green-300 dark:border-green-600'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
                {getFieldError('currentPassword') && (
                  <p className="text-red-600 text-sm mt-1">{getFieldError('currentPassword')}</p>
                )}
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-800 dark:text-white ${
                    getFieldError('newPassword') 
                      ? 'border-red-300 dark:border-red-600' 
                      : isFieldValid('newPassword')
                      ? 'border-green-300 dark:border-green-600'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
                {getFieldError('newPassword') && (
                  <p className="text-red-600 text-sm mt-1">{getFieldError('newPassword')}</p>
                )}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-800 dark:text-white ${
                    getFieldError('confirmPassword') 
                      ? 'border-red-300 dark:border-red-600' 
                      : isFieldValid('confirmPassword')
                      ? 'border-green-300 dark:border-green-600'
                      : 'border-slate-300 dark:border-slate-700'
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
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-slate-800 disabled:opacity-60"
                >
                  {formLoading ? "Changing Password..." : "Change Password"}
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
        </div>
      </main>
      <Footer />
    </div>
  );
} 