import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Form } from "react-router";
import { useAuth } from "~/contexts/useAuth";
import { Error as ErrorComponent } from "~/components/Error";
import { Loading } from "~/components/Loading";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { FcGoogle } from 'react-icons/fc';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { loginSchema, validateForm, validateField } from '~/utils/validation';
import { handleApiError } from '~/utils/errorMessages';
import { API_BASE_URL, API_ENDPOINTS } from '~/config/api';
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { PurpleCard } from '~/components/ui/PurpleCard';
import { ErrorAlert } from '~/components/ui/ErrorAlert';

export const meta = () => [
    { title: "Log In — Homebit" },
    { name: "description", content: "Log in to your Homebit account to manage your home services, view your househelp shortlist, and more." },
    { property: "og:title", content: "Log In — Homebit" },
    { property: "og:url", content: "https://homebit.co.ke/login" },
];

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
  // Flattened fields — present when AuthContext reconstructs the object
  // from /auth/me or localStorage
  id?: string;
  role?: string;
  phone?: string;
  email?: string;
};

export type LoginErrorResponse = {
  message: string;
};

export default function LoginPage() {
  const { login, loading, user, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  // Validation state
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({});
  const [loginError, setLoginError] = useState<string | null>(null);
  const [processingGoogleLogin, setProcessingGoogleLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Get redirect URL from query params
  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect');

  // Handle return from Google OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const googleLogin = params.get('google_login');
    const token = params.get('token');
    const errorParam = params.get('error');

    if (errorParam && !loginError) {
      setLoginError('Google login failed. Please try again or use phone and password.');
    }

    if (googleLogin === 'success' && token && !processingGoogleLogin) {
      setProcessingGoogleLogin(true);
      (async () => {
        try {
          // Store token immediately so subsequent API calls are authenticated
          localStorage.setItem('token', token);

          // Fetch user profile using the provided token
          const meResp = await fetch(API_ENDPOINTS.auth.me, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!meResp.ok) {
            throw new Error('Failed to fetch user after Google login');
          }

          const userData: any = await meResp.json();
          localStorage.setItem('user_object', JSON.stringify(userData));
          const profileType: string = userData.profile_type || '';
          localStorage.setItem('profile_type', profileType);
          try { localStorage.setItem('userType', profileType || ''); } catch {}

          // Mirror the profile-setup redirect logic used in AuthContext.login
          if (profileType === 'household' || profileType === 'househelp') {
            try {
              const setupResponse = await fetch(`${API_BASE_URL}/api/v1/profile-setup-steps`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (setupResponse.ok) {
                const setupData = await setupResponse.json();
                const isComplete = setupData.is_complete || false;
                const lastStep = setupData.last_completed_step || 0;

                if (!isComplete) {
                  const setupRoute = profileType === 'household'
                    ? `/profile-setup/household?step=${lastStep + 1}`
                    : `/profile-setup/househelp?step=${lastStep + 1}`;
                  navigate(setupRoute, { replace: true });
                  return;
                }
              } else if (setupResponse.status === 404) {
                // No profile setup record exists - user hasn't started setup
                console.log("No profile setup record found, starting from step 1");
                const setupRoute = profileType === 'household'
                  ? `/profile-setup/household?step=1`
                  : `/profile-setup/househelp?step=1`;
                navigate(setupRoute, { replace: true });
                return;
              }
            } catch (err) {
              console.error('Failed to check profile setup status after Google login:', err);
              // If this fails, fall through to default redirect below
            }
          }

          // If profile is complete or setup check failed, redirect
          if (redirectUrl) {
            navigate(redirectUrl, { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        } catch (err) {
          console.error('Google login completion error:', err);
          setLoginError('Google login failed. Please try again or use phone and password.');
        } finally {
          setProcessingGoogleLogin(false);
        }
      })();
    }
  }, [location.search, redirectUrl, loginError, navigate, processingGoogleLogin]);

  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear login error when user starts typing
    if (loginError) {
      setLoginError(null);
    }
    
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
    
    // Clear previous login error
    setLoginError(null);
    
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
      // Capture login error and display it
      const errorMessage = error instanceof Error ? error.message : 'Invalid phone number or password. Please try again.';
      setLoginError(errorMessage);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const res = await fetch(`${API_ENDPOINTS.auth.googleUrl}?flow=auth`);
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url as string;
      }
    } catch (e) {
      /* no-op */
    }
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
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={false} bubbleDensity="low" className="flex-1">
        <main className="flex-1 flex flex-col justify-center items-center px-4 py-8">
          <PurpleCard hover={false} glow={true} className="w-full max-w-md p-8 sm:p-10">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-8 text-center">Welcome Back! 👋</h1>
          
          {/* Login Error Alert */}
          {loginError && (
            <ErrorAlert title="Login Failed" message={loginError} />
          )}

          {loading && (
            <div className="mb-6 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 p-4 shadow-md">
              <div className="flex items-center justify-center">
                <span className="text-2xl mr-3">✨</span>
                <p className="text-base font-semibold text-purple-700">Logging you in...</p>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-purple-700 mb-2">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                className={`w-full h-12 text-base px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white border-purple-200 dark:border-purple-500/30 shadow-sm dark:shadow-inner-glow focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
                    getFieldError('phone') 
                        ? 'border-red-300' 
                        : isFieldValid('phone')
                        ? 'border-green-300'
                        : 'border-purple-200'
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
              <label htmlFor="password" className="block text-sm font-semibold text-purple-700 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  className={`w-full h-12 text-base px-4 py-3 pr-12 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white border-purple-200 dark:border-purple-500/30 shadow-sm dark:shadow-inner-glow focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
                      getFieldError('password') 
                          ? 'border-red-300' 
                          : isFieldValid('password')
                          ? 'border-green-300'
                          : 'border-purple-200'
                  }`}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {getFieldError('password') && (
                <p className="text-red-600 text-sm mt-1">{getFieldError('password')}</p>
              )}
            </div>
            <div className="flex justify-end mb-2">
              <Link to="/forgot-password" className="text-sm font-semibold text-purple-600 hover:text-purple-700 hover:underline transition-colors">Forgot password?</Link>
            </div>
          
          <button
            type="submit"
            className="w-full px-8 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={loading || !formData.phone.trim() || !formData.password.trim()}
          >
            {loading ? "✨ Logging in..." : "🚀 Login"}
          </button>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-purple-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-[#13131a] text-purple-600 dark:text-purple-400 font-medium">Or continue with</span>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full inline-flex justify-center items-center px-6 py-1.5 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl shadow-md dark:shadow-glow-sm bg-white dark:bg-[#13131a] text-base font-semibold text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-500/50 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <FcGoogle className="h-5 w-5 mr-2" />
                Google
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <span className="text-base text-gray-600 dark:text-gray-300 font-medium">Don't have an account?</span>
            <Link to="/signup" className="ml-1 text-base font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline transition-colors">
              Sign up
            </Link>
          </div>
          </form>
          </PurpleCard>
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
