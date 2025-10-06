import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Form } from "react-router";
import { useAuth } from "~/contexts/AuthContext";
import { Error } from "~/components/Error";
import { Loading } from "~/components/Loading";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { FcGoogle } from 'react-icons/fc';
import { loginSchema, validateForm, validateField } from '~/utils/validation';
import { handleApiError } from '~/utils/errorMessages';

export type LoginRequest = {
  phone: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user: {
    user_id: string;
    first_name: string;
    last_name: string;
    phone: string;
    profile_type: string;
    email?: string;
  };
};

export type LoginErrorResponse = {
  message: string;
};

export default function LoginPage() {
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  // Validation state
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({});

  // Get redirect URL from query params
  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect');

  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Mark field as touched
    if (!touchedFields[name]) {
      setTouchedFields(prev => ({ ...prev, [name]: true }));
    }
    
    // Real-time validation for certain fields
    if (touchedFields[name] && value) {
      const fieldError = validateField(loginSchema, name, value);
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
    const fieldError = validateField(loginSchema, name, value);
    if (fieldError) {
      setFieldErrors(prev => ({ ...prev, [name]: fieldError }));
    } else {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate entire form
    const validation = validateForm(loginSchema, formData);
    
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
    
    try {
      await login(formData.phone, formData.password);
      // Login successful, redirect will be handled by useEffect
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = 'http://localhost:8080/auth/google'; // Adjust to your backend endpoint
  };

  const getFieldError = (fieldName: string) => {
    return touchedFields[fieldName] && fieldErrors[fieldName] ? fieldErrors[fieldName] : '';
  };

  const isFieldValid = (fieldName: string) => {
    return touchedFields[fieldName] && !fieldErrors[fieldName];
  };

  // Show loading if user is being redirected
  if (loading || user) {
    return <Loading text="Redirecting..." />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background bg-white" style={{backgroundColor: 'white'}}>
      <Navigation />
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8 animate-fadeIn">
        <div className="card w-full max-w-md bg-white border border-gray-100 p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-extrabold text-primary mb-6 text-center">Login to HomeXpert</h1>
          {loading && (
            <div className="mb-4 p-3 rounded bg-blue-100 text-blue-700 border border-blue-300 text-center">
              Logging in...
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-primary mb-1">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                className={`w-full h-12 text-base px-4 py-3 rounded-lg border bg-white text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 transition ${
                    getFieldError('phone') 
                        ? 'border-red-300' 
                        : isFieldValid('phone')
                        ? 'border-green-300'
                        : 'border-primary-200'
                }`}
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0712345678"
              />
              {getFieldError('phone') && (
                <p className="text-red-600 text-sm mt-1">{getFieldError('phone')}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary mb-1">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className={`w-full h-12 text-base px-4 py-3 rounded-lg border bg-white text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 transition ${
                    getFieldError('password') 
                        ? 'border-red-300' 
                        : isFieldValid('password')
                        ? 'border-green-300'
                        : 'border-primary-200'
                }`}
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
              />
              {getFieldError('password') && (
                <p className="text-red-600 text-sm mt-1">{getFieldError('password')}</p>
              )}
            </div>
            <div className="flex justify-end mb-2">
              <Link to="/forgot-password" className="link text-lg font-semibold text-primary-600 hover:underline">Forgot password?</Link>
            </div>
          
          <button
            type="submit"
            className="w-full bg-primary-700 text-white py-3 rounded-lg hover:bg-primary-800 transition-colors duration-200 font-semibold text-lg disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                <FcGoogle className="h-5 w-5 mr-2" />
                Google
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <span className="text-base text-gray-600 font-medium">Don't have an account?</span>
            <Link to="/signup" className="ml-1 text-base font-semibold text-primary-600 hover:text-primary-500">
              Sign up
            </Link>
          </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
