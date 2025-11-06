import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Navigation } from '~/components/Navigation';
import { Footer } from '~/components/Footer';
import { signupSchema, validateForm, validateField } from '~/utils/validation';
import { handleApiError } from '~/utils/errorMessages';
import { useAuth } from '~/contexts/AuthContext';
import { Loading } from '~/components/Loading';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { FcGoogle } from 'react-icons/fc';
import { Modal } from '~/components/features/Modal';
import { API_BASE_URL } from '~/config/api';
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { PurpleCard } from '~/components/ui/PurpleCard';

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

const base_url = API_BASE_URL;

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
    
    const [form, setForm] = useState<SignupRequest>({
        profile_type: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
    });
    
    // Validation state
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
    const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({});
    
    // Modal state
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(true);
    
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<SignupResponse | null>(null);

    // Get redirect URL and bureauId from query params
    const searchParams = new URLSearchParams(location.search);
    //const redirectUrl = searchParams.get('redirect');
    const bureauId = searchParams.get('bureauId');

    useEffect(() => {
        // If user is already authenticated, redirect them
        if (user) {
            const profileType = user.profile_type;
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
    }, [user, navigate, bureauId]);

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
        setIsProfileModalOpen(false);
        
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
            // Prepare payload
            let payload = { ...form };
            if (form.profile_type === 'househelp' && bureauId) {
                payload = { ...payload, bureau_id: bureauId };
            }
            const res = await fetch(`${base_url}/api/v1/auth/register`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json();
                console.log('[SIGNUP] Backend error response:', err);
                
                // Check if backend returned field-specific errors
                if (err.errors && typeof err.errors === 'object') {
                    // Map backend field names to frontend field names
                    const backendErrors: { [key: string]: string } = {};
                    Object.keys(err.errors).forEach(key => {
                        backendErrors[key] = err.errors[key];
                    });
                    
                    setFieldErrors(backendErrors);
                    
                    // Mark all error fields as touched
                    const touchedErrorFields = Object.keys(backendErrors).reduce((acc, key) => {
                        acc[key] = true;
                        return acc;
                    }, {} as { [key: string]: boolean });
                    setTouchedFields(prev => ({ ...prev, ...touchedErrorFields }));
                    
                    // Set a general error message
                    const errorCount = Object.keys(backendErrors).length;
                    setError(`Please fix ${errorCount} error${errorCount > 1 ? 's' : ''} in the form`);
                    return; // Don't throw, just return to show the errors
                }
                
                // Handle conflict errors (e.g., duplicate phone number)
                if (res.status === 409 && err.message) {
                    // Show conflict error on the phone field
                    if (err.message.toLowerCase().includes('phone')) {
                        setFieldErrors({ phone: err.message });
                        setTouchedFields(prev => ({ ...prev, phone: true }));
                    }
                    setError(err.message);
                    return;
                }
                
                // If no field-specific errors, throw with the general message
                throw new Error(err.message || 'Signup failed');
            }
            const data: SignupResponse = await res.json();
            
            console.log('Signup response:', data);
            console.log('Verification data:', data.verification);
            
            // Store user data temporarily (before verification)
            localStorage.setItem('user_id', data.user.user_id);
            localStorage.setItem('profile_type', data.user.profile_type || form.profile_type);
            
            // DO NOT store token yet - wait until after OTP verification
            // The token will be stored after successful OTP verification in verify-otp.tsx
            
            // Redirect to OTP verification with verification data
            // The OTP page will handle the rest of the flow
            if (data.verification) {
                console.log('Redirecting to verify-otp with verification:', data.verification);
                navigate('/verify-otp', { 
                    state: { 
                        verification: data.verification,
                        profileType: form.profile_type 
                    } 
                });
            } else {
                // Fallback if no verification required (shouldn't happen)
                console.error('No verification data in signup response!', data);
                alert('Signup successful but verification data is missing. Please contact support.');
                if (data.token) {
                    localStorage.setItem('token', data.token);
                }
                navigate('/');
            }
        } catch (err: any) {
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

    // If auth is loading and it's not a bureau registering a househelp, show loader
    if (authLoading && !bureauId) {
        return <Loading text="Redirecting..." />;
    }

    return (
        <div className="min-h-screen flex flex-col">
        <Navigation/>
        <PurpleThemeWrapper variant="light" bubbles={true} bubbleDensity="low" className="flex-1">
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
                    
                    <div className="mt-8 flex flex-col gap-3">
                        {form.profile_type && (
                            <button
                                type="button"
                                onClick={() => setIsProfileModalOpen(false)}
                                className="glow-button px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg dark:shadow-glow-md hover:from-purple-700 hover:to-pink-700 dark:hover:shadow-glow-lg hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                Continue as {profileOptions.find(opt => opt.value === form.profile_type)?.label}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => {
                                setIsProfileModalOpen(false);
                                navigate('/');
                            }}
                            className="px-8 py-3.5 bg-gray-700/80 dark:bg-gray-800/80 text-gray-200 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-600 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-600 dark:border-gray-700"
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
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-center flex-1">Join Us! 🎉</h2>
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
      {error && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 p-5 shadow-md">
          <div className="flex items-center justify-center">
            <span className="text-2xl mr-3">⚠️</span>
            <p className="text-base font-semibold text-red-800">{error}</p>
          </div>
        </div>
      )}
      
      {/* Google Sign Up - Primary Option */}
      <div className="mb-6">
    <button
        type="button"
        onClick={() => window.location.href = `${API_BASE_URL}/google`}
        className="w-full inline-flex justify-center items-center px-6 py-4 border-2 border-purple-300 dark:border-purple-500/50 rounded-xl shadow-lg dark:shadow-glow bg-white dark:bg-[#13131a] text-base font-bold text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:border-purple-400 dark:hover:border-purple-500/70 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
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

      <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-primary-600 dark:text-purple-400 mb-2">First Name</label>
                            <input
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
                            <label className="block text-sm font-semibold text-primary-600 dark:text-purple-400 mb-2">Last Name</label>
                            <input
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
                         
                        <div>
                            <label className="block text-sm font-semibold text-primary-600 dark:text-purple-400 mb-2">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={`w-full h-12 text-base px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white border-purple-200 dark:border-purple-500/30 shadow-sm dark:shadow-inner-glow focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 ${
                                    getFieldError('password') 
                                        ? 'border-red-300' 
                                        : isFieldValid('password')
                                        ? 'border-green-300'
                                        : 'border-purple-200'
                                }`}
                            />
                            {getFieldError('password') && (
                                <p className="text-red-600 text-sm mt-1">{getFieldError('password')}</p>
                            )}
                        </div>
                        <div>
    <label className="block text-sm font-semibold text-primary-600 dark:text-purple-400 mb-2">Phone</label>
    <input
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
</div>

<button
    type="submit"
    className="w-full px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
    disabled={formLoading || !form.profile_type || Object.keys(fieldErrors).some(key => fieldErrors[key]) || !form.first_name || !form.last_name || !form.password || !form.phone}
>
    {formLoading ? '✨ Signing up...' : '🚀 Sign Up'}
</button>
{(!form.profile_type || !form.first_name || !form.last_name || !form.password || !form.phone) && (
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
