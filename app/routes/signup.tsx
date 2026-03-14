import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Navigation } from '~/components/Navigation';
import { Footer } from '~/components/Footer';
import { signupSchema, validateForm, validateField, normalizeKenyanPhoneNumber } from '~/utils/validation';
import { handleApiError, extractErrorMessage } from '~/utils/errorMessages';
import { useAuth } from '~/contexts/useAuth';
import { Loading } from '~/components/Loading';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { FcGoogle } from 'react-icons/fc';
import { Modal } from '~/components/features/Modal';
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { PurpleCard } from '~/components/ui/PurpleCard';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SafaricomDisclaimer } from '~/components/ui/SafaricomDisclaimer';

export const meta = () => [
    { title: "Sign Up — Homebit" },
    { name: "description", content: "Create your free Homebit account. Join as a household looking for help or as a househelp offering your services across Kenya." },
    { property: "og:title", content: "Sign Up — Homebit" },
    { property: "og:url", content: "https://homebit.co.ke/signup" },
];
import type { LoginResponse as AuthLoginResponse } from "~/routes/login";

// Types for request and response
export type SignupRequest = {
    profile_type: string;
    password: string;
    first_name: string;
    last_name: string;
    phone: string;
    bureau_id?: string;
};

export type SignupResponse = {
    token?: string; // JWT token from backend
    user: {
        user_id: string;
        first_name?: string;
        last_name?: string;
        phone?: string;
        email?: string;
        profile_type?: string;
    };
    verification?: {
        id: string;
        user_id: string;
        type: string;
        status: string;
        target: string;
        expires_at: string;
        next_resend_at: string;
        attempts: number;
        max_attempts: number;
        resends: number;
        max_resends: number;
        created_at: string;
        updated_at: string;
    };
};


// Profile type options - Bureau removed as they should not sign up through regular flow
const profileOptions = [
    { value: 'household', label: 'Household' },
    { value: 'househelp', label: 'Househelp/Nanny' }
];

export default function SignupPage() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // Get redirect URL and bureauId from query params - must be before state initialization
    const searchParams = new URLSearchParams(location.search);
    //const redirectUrl = searchParams.get('redirect');
    const bureauId = searchParams.get('bureauId');
    const googleProfileType = searchParams.get('profile_type');
    const isGoogleSignup = searchParams.get('google_signup') === '1';
    const googleEmail = searchParams.get('email') || '';
    const googleFirstName = searchParams.get('first_name') || '';
    const googleLastName = searchParams.get('last_name') || '';
    const googleId = searchParams.get('google_id') || '';
    const googlePicture = searchParams.get('picture') || '';
    
    const [form, setForm] = useState<SignupRequest>({
        profile_type: googleProfileType || '',
        // For Google signups we don't actually use the password field,
        // but the shared validation schema expects a non-empty value.
        // Use a dummy value so validation and UI enablement pass while
        // the backend relies solely on Google auth.
        password: isGoogleSignup ? 'GOOGLE' : '',
        first_name: googleFirstName,
        last_name: googleLastName,
        phone: '',
    });
    
    const [googleData, setGoogleData] = useState<{
        email: string;
        google_id: string;
        picture: string;
    } | null>(isGoogleSignup ? {
        email: googleEmail,
        google_id: googleId,
        picture: googlePicture
    } : null);
    
    // Validation state
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
    const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({});
    const [showPassword, setShowPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    
    // Modal state - check if profile_type is in URL params from Google callback
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(!googleProfileType);
    
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<SignupResponse | null>(null);

    useEffect(() => {
        // If user is already authenticated, redirect them
        if (user) {
            const profileType = user.user?.profile_type;
            // Bureau users should not access regular signup flow
            if (profileType === "bureau") {
                navigate("/");
                return;
            }
            if (profileType === "household" || profileType === "household") {
                navigate("/household/profile");
            } else if (profileType === "househelp") {
                navigate("/househelp");
            } else {
                navigate("/");
            }
        }
    }, [user, navigate]);

    // No longer needed since we're using a modal instead of dropdown
    // useEffect(() => {
    //     const handleClickOutside = (event: MouseEvent) => {
    //         if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
    //             setIsDropdownOpen(false);
    //         }
    //     };

    //     document.addEventListener('mousedown', handleClickOutside);
    //     return () => {
    //         document.removeEventListener('mousedown', handleClickOutside);
    //     };
    // }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm({...form, [name]: value});
        
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
            const fieldError = validateField(signupSchema, name, value);
            if (fieldError) {
                setFieldErrors(prev => ({ ...prev, [name]: fieldError }));
            }
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // Mark field as touched
        if (!touchedFields[name]) {
            setTouchedFields(prev => ({ ...prev, [name]: true }));
        }
        
        // Validate field on blur
        const fieldError = validateField(signupSchema, name, value);
        if (fieldError) {
            setFieldErrors(prev => ({ ...prev, [name]: fieldError }));
        } else {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleProfileTypeSelect = (value: string) => {
        setForm({...form, profile_type: value});
        // Don't auto-close modal - user must click Continue button after accepting terms
        
        // Clear field error when user selects an option
        if (fieldErrors.profile_type) {
            setFieldErrors(prev => ({ ...prev, profile_type: '' }));
        }
        
        // Mark field as touched
        if (!touchedFields.profile_type) {
            setTouchedFields(prev => ({ ...prev, profile_type: true }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        console.log('[SIGNUP] Form submitted', form);
        console.log('[SIGNUP] Current field errors:', fieldErrors);
        console.log('[SIGNUP] Button disabled state:', {
            formLoading,
            hasProfileType: !!form.profile_type.trim(),
            hasFieldErrors: Object.keys(fieldErrors).some(key => fieldErrors[key]),
            hasFirstName: !!form.first_name.trim(),
            hasLastName: !!form.last_name.trim(),
            hasPassword: !!form.password.trim(),
            hasPhone: !!form.phone.trim()
        });
        
        // Validate entire form
        const validation = validateForm(signupSchema, form);
        
        if (!validation.isValid) {
            console.log('[SIGNUP] Validation failed:', validation.errors);
            setFieldErrors(validation.errors);
            setError('Please fix the errors in the form');
            // Mark all fields as touched to show errors
            const allTouched = Object.keys(form).reduce((acc, key) => {
                acc[key] = true;
                return acc;
            }, {} as { [key: string]: boolean });
            setTouchedFields(allTouched);
            return;
        }
        
        console.log('[SIGNUP] Validation passed, making API call...');
        
        setFormLoading(true);
        setError(null);
        setSuccess(null);
        
        // Clear any existing auth data before signup
        localStorage.removeItem('token');
        localStorage.removeItem('user_object');
        localStorage.removeItem('user_id');
        localStorage.removeItem('profile_type');
        
        try {
            // Check if this is a Google signup completion
            if (googleData) {
                // Complete Google signup with phone number
                const googlePayload = {
                    google_id: googleData.google_id,
                    email: googleData.email,
                    first_name: form.first_name,
                    last_name: form.last_name,
                    phone: form.phone,
                    profile_type: form.profile_type,
                    ...(form.profile_type === 'househelp' && bureauId ? { bureau_id: bureauId } : {})
                };

                const { default: authSvc } = await import('~/services/grpc/auth.service');
                let data: any;
                try {
                    const response = await authSvc.completeGoogleSignup(
                        googlePayload.google_id,
                        googlePayload.email,
                        googlePayload.first_name,
                        googlePayload.last_name,
                        googlePayload.phone,
                        googlePayload.profile_type,
                        googlePayload.bureau_id
                    );
                    const userId = response?.getUserId?.() || '';
                    const verificationProto = response?.getVerification?.();
                    data = {
                        user: { user_id: userId, profile_type: form.profile_type },
                        verification: verificationProto ? {
                            id: verificationProto.getId(),
                            user_id: verificationProto.getUserId(),
                            type: verificationProto.getType(),
                            status: verificationProto.getStatus(),
                            target: verificationProto.getTarget(),
                            expires_at: verificationProto.getExpiresAt()?.toDate().toISOString() || '',
                            next_resend_at: verificationProto.getNextResendAt()?.toDate().toISOString() || '',
                            attempts: verificationProto.getAttempts(),
                            max_attempts: verificationProto.getMaxAttempts(),
                            resends: verificationProto.getResends(),
                            max_resends: verificationProto.getMaxResends(),
                            created_at: verificationProto.getCreatedAt()?.toDate().toISOString() || '',
                            updated_at: verificationProto.getUpdatedAt()?.toDate().toISOString() || '',
                        } : undefined,
                    };
                } catch (err: any) {
                    const errorMsg = err.message || 'Google signup completion failed';
                    const lowerMsg = errorMsg.toLowerCase();
                    if (err.grpcCode === 'ALREADY_EXISTS' || lowerMsg.includes('already')) {
                        const friendlyMsg = handleApiError({ message: errorMsg }, 'signup');
                        if (lowerMsg.includes('phone')) {
                            setFieldErrors({ phone: friendlyMsg });
                            setTouchedFields(prev => ({ ...prev, phone: true }));
                        }
                        setError(friendlyMsg);
                        setFormLoading(false);
                        return;
                    }
                    throw new Error(errorMsg);
                }
                
                const userId = data.user?.user_id;
                const profileType = data.user?.profile_type || form.profile_type;
                
                if (!userId) {
                    console.error('[SIGNUP] No user_id in Google signup response:', data);
                    setError('Signup succeeded but response was unexpected. Please try logging in.');
                    return;
                }
                
                // Store user data temporarily (before verification)
                localStorage.setItem('user_id', userId);
                localStorage.setItem('profile_type', profileType);
                
                // Redirect to OTP verification (same as regular signup)
                if (data.verification) {
                    console.log('[SIGNUP] Google signup complete, redirecting to verify-otp with verification:', data.verification);
                    navigate('/verify-otp', { 
                        state: { 
                            verification: data.verification,
                            profileType: profileType,
                            isGoogleSignup: true 
                        } 
                    });
                } else {
                    console.warn('[SIGNUP] No verification data in Google signup response, navigating to verify-otp anyway');
                    navigate('/verify-otp', {
                        state: {
                            userId: userId,
                            profileType: profileType,
                            isGoogleSignup: true
                        }
                    });
                }
                return;
            }
            
            // Regular signup flow - use gRPC-Web
            const normalizedPhone = normalizeKenyanPhoneNumber(form.phone);
            
            let data: any;
            try {
                // Use gRPC-Web instead of REST
                const { default: authService } = await import('~/services/grpc/auth.service');
                const signupResponse = await authService.signup(
                    normalizedPhone,
                    form.password,
                    form.first_name,
                    form.last_name,
                    form.profile_type,
                    form.profile_type === 'househelp' && bureauId ? bureauId : undefined
                );
                
                // Extract data from gRPC response
                const userId = signupResponse.getUserId();
                const token = signupResponse.getToken();
                const verificationProto = signupResponse.getVerification();
                
                console.log('[SIGNUP] gRPC response:', { userId, token, hasVerification: !!verificationProto });
                
                data = {
                    user: {
                        user_id: userId,
                        profile_type: form.profile_type,
                    },
                    token: token,
                    verification: verificationProto ? {
                        id: verificationProto.getId(),
                        user_id: verificationProto.getUserId(),
                        type: verificationProto.getType(),
                        status: verificationProto.getStatus(),
                        target: verificationProto.getTarget(),
                        expires_at: verificationProto.getExpiresAt()?.toDate().toISOString() || '',
                        next_resend_at: verificationProto.getNextResendAt()?.toDate().toISOString() || '',
                        attempts: verificationProto.getAttempts(),
                        max_attempts: verificationProto.getMaxAttempts(),
                        resends: verificationProto.getResends(),
                        max_resends: verificationProto.getMaxResends(),
                        created_at: verificationProto.getCreatedAt()?.toDate().toISOString() || '',
                        updated_at: verificationProto.getUpdatedAt()?.toDate().toISOString() || '',
                    } : undefined,
                };
            } catch (err: any) {
                console.error('[SIGNUP] gRPC error:', err);
                
                const errorMsg = err.message || 'Signup failed';
                const grpcCode = err.grpcCode || '';
                const lowerMsg = errorMsg.toLowerCase();
                
                // Handle duplicate phone/email errors
                if (grpcCode === 'ALREADY_EXISTS' || lowerMsg.includes('already')) {
                    if (lowerMsg.includes('phone')) {
                        setFieldErrors({ phone: 'This phone number is already registered' });
                        setTouchedFields(prev => ({ ...prev, phone: true }));
                        setError('This phone number is already registered');
                    } else if (lowerMsg.includes('email')) {
                        setFieldErrors({ email: 'This email is already registered' });
                        setTouchedFields(prev => ({ ...prev, email: true }));
                        setError('This email is already registered');
                    } else {
                        setError('Account already exists');
                    }
                    setFormLoading(false);
                    return;
                }
                
                // Handle validation errors
                if (grpcCode === 'INVALID_ARGUMENT') {
                    setError(errorMsg);
                    setFormLoading(false);
                    return;
                }
                
                // For all other errors
                setError(errorMsg);
                setFormLoading(false);
                return;
            }
            
            console.log('[SIGNUP] Full response:', JSON.stringify(data));
            
            // Extract user_id from either { user: { user_id } } or { user_id } shape
            const userId = data.user?.user_id || data.user_id;
            const profileType = data.user?.profile_type || form.profile_type;
            
            if (!userId) {
                console.error('[SIGNUP] No user_id in response:', data);
                setError('Signup succeeded but response was unexpected. Please try logging in.');
                return;
            }
            
            // Store user data temporarily (before verification)
            localStorage.setItem('user_id', userId);
            localStorage.setItem('profile_type', profileType);
            
            // DO NOT store token yet - wait until after OTP verification
            // The token will be stored after successful OTP verification in verify-otp.tsx
            
            // Redirect to OTP verification with verification data
            // The OTP page will handle the rest of the flow
            if (data.verification) {
                console.log('[SIGNUP] Redirecting to verify-otp with verification:', data.verification);
                navigate('/verify-otp', { 
                    state: { 
                        verification: data.verification,
                        profileType: profileType 
                    } 
                });
            } else {
                // Fallback if no verification data - still navigate to verify-otp
                // The OTP page can request a new code using the user_id
                console.warn('[SIGNUP] No verification data in response, navigating to verify-otp anyway');
                navigate('/verify-otp', {
                    state: {
                        userId: userId,
                        profileType: profileType
                    }
                });
            }
        } catch (err: any) {
            console.error('[SIGNUP] Error in signup flow:', err);
            const errorMessage = handleApiError(err, 'signup');
            setError(errorMessage);
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

    const getSelectedProfileLabel = () => {
        const selected = profileOptions.find(option => option.value === form.profile_type);
        return selected ? selected.label : 'Select profile type';
    };

    const startGoogle = async (flow: 'auth' | 'signup' = 'auth') => {
        try {
            // Pass profile_type in state to preserve it through OAuth redirect
            const statePayload = {
                profile_type: form.profile_type,
                bureau_id: bureauId || undefined
            };
            const state = encodeURIComponent(JSON.stringify(statePayload));
            console.log('[GOOGLE_AUTH] Requesting OAuth URL with state:', statePayload);
            const { default: authSvc } = await import('~/services/grpc/auth.service');
            const response = await authSvc.getGoogleAuthURL(flow, state);
            const url = response?.getUrl?.() || response?.url;
            console.log('[GOOGLE_AUTH] Received response, url:', url);
            if (url) {
                console.log('[GOOGLE_AUTH] Redirecting to:', url);
                window.location.href = url as string;
            } else {
                console.error('[GOOGLE_AUTH] No URL in response');
                setError('Failed to start Google sign-in. Please try again.');
            }
        } catch (err) {
            console.error('[GOOGLE_AUTH] Error:', err);
            setError('Network error. Please try again.');
        }
    };

    // If auth is loading and it's not a bureau registering a househelp, show loader
    if (authLoading && !bureauId) {
        return <Loading text="Redirecting..." />;
    }

    return (
        <div className="min-h-screen flex flex-col">
        <Navigation/>
        <PurpleThemeWrapper variant="light" bubbles={false} bubbleDensity="low" className="flex-1">
        <main className="flex-1 flex flex-col justify-center items-center px-4 py-8">
            {/* Profile Selection Modal */}
            <Modal 
                isOpen={isProfileModalOpen} 
                onClose={() => {
                    setIsProfileModalOpen(false);
                    navigate('/');
                }}
                title="Sign Up"
            >
                <div className="px-2 py-2">
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-pink-400 mb-8 text-center">Choose your account type</h3>
                    <div className="flex flex-col gap-4">
                        {profileOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleProfileTypeSelect(option.value)}
                                className={`group relative p-5 border-2 rounded-2xl text-left transition-all duration-300 transform hover:scale-[1.02] ${
                                    form.profile_type === option.value 
                                        ? 'border-purple-500 dark:border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/40 dark:to-pink-900/40 shadow-lg dark:shadow-glow-md' 
                                        : 'border-gray-300 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-gradient-to-br hover:from-purple-50/50 hover:to-pink-50/50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 hover:shadow-md dark:hover:shadow-glow-sm bg-gray-50/50 dark:bg-gray-800/30'
                                }`}
                            > 
                                <div className="flex items-start gap-4">
                                    <div className={`flex-shrink-0 flex items-center justify-center w-6 h-6 border-2 rounded-full mt-0.5 transition-all duration-200 ${
                                        form.profile_type === option.value 
                                            ? 'bg-gradient-to-br from-purple-600 to-pink-600 border-purple-600 dark:border-purple-500 shadow-md' 
                                            : 'border-gray-400 dark:border-gray-500 group-hover:border-purple-500 dark:group-hover:border-purple-400'
                                    }`}>
                                        {form.profile_type === option.value && (
                                            <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5">{option.label}</h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                            {option.value === 'household' 
                                                ? 'I need to hire help for my home and family needs' 
                                                : 'I\'m looking for work opportunities and want to offer my services'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                    
                    {/* Terms Acceptance Checkbox */}
                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-500/30">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                className="mt-1 w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500 cursor-pointer"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                I agree to the{' '}
                                <Link to="/terms" target="_blank" className="text-purple-600 dark:text-purple-400 hover:underline font-semibold">
                                    Terms and Conditions
                                </Link>
                                {' '}and{' '}
                                <Link to="/privacy" target="_blank" className="text-purple-600 dark:text-purple-400 hover:underline font-semibold">
                                    Privacy Policy
                                </Link>
                            </span>
                        </label>
                    </div>
                    
                    <div className="mt-6 flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={() => setIsProfileModalOpen(false)}
                            disabled={!form.profile_type || !acceptedTerms}
                            className="glow-button px-8 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg dark:shadow-glow-md hover:from-purple-700 hover:to-pink-700 dark:hover:shadow-glow-lg hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            Continue as {profileOptions.find(opt => opt.value === form.profile_type)?.label || 'User'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsProfileModalOpen(false);
                                navigate('/');
                            }}
                            className="px-8 py-1.5 bg-gray-700/80 dark:bg-gray-800/80 text-gray-200 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-600 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-600 dark:border-gray-700"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>
            
            <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8 justify-center items-stretch">
            {/* Right: Signup form card */}
            <PurpleCard hover={false} glow={true} className="flex-1 p-8 sm:p-10 w-full max-w-md">
      <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-center flex-1">Join Us! 🎉</h2>
                {form.profile_type && (
                    <button 
                        type="button" 
                        onClick={() => setIsProfileModalOpen(true)}
                        className="text-sm text-primary-600 dark:text-purple-400 hover:text-primary-700 dark:hover:text-purple-300 font-semibold hover:underline transition-colors flex items-center"
                    >
                        <span className="mr-1">Change profile: </span>
                        <span className="font-medium">{getSelectedProfileLabel()}</span>
                    </button>
                )}
            </div>
      <div className="text-center mb-4">
        <span className="text-base text-gray-600 dark:text-gray-300 font-medium">Already have an account?</span>
        <a href="/login"
          className="ml-2 text-base text-primary-600 dark:text-purple-400 font-bold hover:text-primary-700 dark:hover:text-purple-300 hover:underline transition-colors">Login</a>
      </div>
      {/* Google Sign Up - Primary Option (hide if already signed in with Google) */}
      {!googleData && (
        <>
          <div className="mb-6">
            <button
                type="button"
                onClick={() => startGoogle('auth')}
                className="w-full inline-flex justify-center items-center px-6 py-1 border-2 border-purple-300 dark:border-purple-500/50 rounded-xl shadow-lg dark:shadow-glow bg-white dark:bg-[#13131a] text-base font-bold text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-purple-400 dark:hover:border-purple-500/70 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
                <FcGoogle className="h-6 w-6 mr-3" />
                Continue with Google
            </button>
          </div>

          <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-purple-200 dark:border-purple-500/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-[#13131a] text-gray-500 dark:text-gray-400 font-medium">Or sign up with phone</span>
              </div>
          </div>
        </>
      )}
      
      {/* Show Google account info if signed in with Google */}
      {googleData && (
        <div className="mb-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-500/30 p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {googleData.picture && (
                <img src={googleData.picture} alt="Google profile" className="w-12 h-12 rounded-full border-2 border-green-300" />
              )}
              <div>
                <p className="text-sm font-semibold text-green-800 dark:text-green-300">Signed in with Google</p>
                <p className="text-xs text-green-700 dark:text-green-400">{googleData.email}</p>
              </div>
            </div>
            <FcGoogle className="h-6 w-6" />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Only show name fields for non-Google signups; for Google we use the
                            values returned by Google but don't ask the user to edit them. */}
                        {!googleData && (
                          <>
                            <div>
                                <label htmlFor="first_name" className="block text-sm font-semibold text-primary-600 dark:text-purple-400 mb-2">First Name</label>
                                <input
                                    id="first_name"
                                    type="text"
                                    name="first_name"
                                    value={form.first_name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
                                    className={`w-full h-12 text-base px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white border-purple-200 dark:border-purple-500/30 shadow-sm dark:shadow-inner-glow focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
                                        getFieldError('first_name') 
                                            ? 'border-red-300' 
                                            : isFieldValid('first_name')
                                            ? 'border-green-300'
                                            : 'border-purple-200'
                                    }`}
                                />
                                {getFieldError('first_name') && (
                                    <p className="text-red-600 text-sm mt-1">{getFieldError('first_name')}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="last_name" className="block text-sm font-semibold text-primary-600 dark:text-purple-400 mb-2">Last Name</label>
                                <input
                                    id="last_name"
                                    type="text"
                                    name="last_name"
                                    value={form.last_name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    required
                                    className={`w-full h-12 text-base px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white border-purple-200 dark:border-purple-500/30 shadow-sm dark:shadow-inner-glow focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
                                        getFieldError('last_name') 
                                            ? 'border-red-300' 
                                            : isFieldValid('last_name')
                                            ? 'border-green-300'
                                            : 'border-purple-200'
                                    }`}
                                />
                                {getFieldError('last_name') && (
                                    <p className="text-red-600 text-sm mt-1">{getFieldError('last_name')}</p>
                                )}
                            </div>
                          </>
                        )}
                         
                        {/* Only show password field for non-Google signups */}
                        {!googleData && (
                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-primary-600 dark:text-purple-400 mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        required
                                        className={`w-full h-12 text-base px-4 py-3 pr-12 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white border-purple-200 dark:border-purple-500/30 shadow-sm dark:shadow-inner-glow focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
                                            getFieldError('password') 
                                                ? 'border-red-300' 
                                                : isFieldValid('password')
                                                ? 'border-green-300'
                                                : 'border-purple-200'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors focus:outline-none"
                                        tabIndex={-1}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
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
                        )}
                        <div>
    <label htmlFor="phone" className="block text-sm font-semibold text-primary-600 dark:text-purple-400 mb-2">Phone</label>
    <input
        id="phone"
        type="tel"
        name="phone"
        value={form.phone}
        onChange={handleChange}
        onBlur={handleBlur}
        required
        className={`w-full h-12 text-base px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white border-purple-200 dark:border-purple-500/30 shadow-sm dark:shadow-inner-glow focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
            getFieldError('phone') 
                ? 'border-red-300' 
                : isFieldValid('phone')
                ? 'border-green-300'
                : 'border-purple-200'
        }`}
        placeholder="0712345678"
    />
    {getFieldError('phone') && (
        <p className="text-red-600 text-sm mt-1">{getFieldError('phone')}</p>
    )}
    <SafaricomDisclaimer className="mt-2" />
</div>

{error && <ErrorAlert message={error} onClose={() => setError(null)} />}

<button
    type="submit"
    className="w-full px-8 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
    disabled={
        formLoading ||
        !form.profile_type.trim() ||
        Object.keys(fieldErrors).some(key => fieldErrors[key]) ||
        !form.first_name.trim() ||
        !form.last_name.trim() ||
        // For Google signups, password is handled by Google so we
        // don't require a local password field.
        (!googleData && !form.password.trim()) ||
        !form.phone.trim()
    }
>
    {formLoading ? '✨ Signing up...' : '🚀 Sign Up'}
</button>
{(
    !form.profile_type ||
    !form.first_name ||
    !form.last_name ||
    (!googleData && !form.password) ||
    !form.phone
) && (
    <p className="text-amber-600 text-sm mt-2 text-center">
        Please fill in all required fields to continue
    </p>
)}
</form>
</PurpleCard>
</div>
</main>
</PurpleThemeWrapper>
<Footer/>
</div>
    );
}

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
