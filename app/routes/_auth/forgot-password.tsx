import React, { useState } from "react";
import { Link } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { forgotPasswordSchema, validateForm, validateField } from '~/utils/validation';
import { API_BASE_URL } from '~/config/api';

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
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: input }),
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to send OTP");
      }
      
      const data = await res.json();
      if (data.verification) {
        setSuccess(true);
        // Navigate to verify-otp page with verification data
        window.location.href = `/verify-otp?verification=${encodeURIComponent(JSON.stringify(data.verification))}`;
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
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900">
      <Navigation />
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-extrabold text-primary-800 dark:text-primary-400 mb-6 text-center">Forgot Password</h1>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            Enter your phone number and we'll send you a verification code to reset your password.
          </p>
          
          {error && (
            <div className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700 text-center">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 rounded bg-green-100 text-green-700 border border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700 text-center">
              OTP sent successfully! Please check your phone.
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-primary-700 mb-1 font-medium">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={input}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`w-full h-12 text-base px-4 py-3 rounded-lg border bg-gray-50 dark:bg-slate-800 text-primary-900 dark:text-primary-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-400 transition ${
                      fieldError 
                          ? 'border-red-300 dark:border-red-600' 
                          : isFieldValid()
                          ? 'border-green-300 dark:border-green-600'
                          : 'border-primary-200 dark:border-primary-700'
                  }`}
                  placeholder="Enter your phone number"
                />
                {fieldError && (
                  <p className="text-red-600 text-sm mt-1">{fieldError}</p>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !!fieldError || !input}
              className="btn-primary w-full h-12 mt-2 text-base px-4 py-3 rounded-lg flex items-center justify-center disabled:opacity-60 bg-primary-700 text-white hover:bg-primary-800 transition-colors duration-200 font-semibold"
            >
              <span className="w-full text-center">{loading ? "Sending..." : "Send OTP"}</span>
            </button>
          </form>
          <div className="flex justify-center mt-8">
            <Link to="/login" className="link font-semibold text-primary-700 dark:text-primary-300 text-base text-center">Back to Login</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 