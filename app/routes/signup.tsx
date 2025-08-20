import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from '@remix-run/react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Navigation } from '~/components/Navigation';
import { Footer } from '~/components/Footer';
import { signupSchema, validateForm, validateField } from '~/utils/validation';
import { handleApiError } from '~/utils/errorMessages';
import { useAuth } from '~/contexts/AuthContext';
import { Loading } from '~/components/Loading';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { FcGoogle } from 'react-icons/fc';
import { Modal } from '~/components/Modal';

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
    user: {
        user_id: string;
    };
    verification: {
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

const base_url = 'http://localhost:8080';

// Profile type options - Bureau removed as they should not sign up through regular flow
const profileOptions = [
    { value: 'employer', label: 'Household' },
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
            if (profileType === "employer" || profileType === "household") {
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
        
        // Validate entire form
        const validation = validateForm(signupSchema, form);
        
        if (!validation.isValid) {
            setFieldErrors(validation.errors);
            // Mark all fields as touched to show errors
            const allTouched = Object.keys(form).reduce((acc, key) => {
                acc[key] = true;
                return acc;
            }, {} as { [key: string]: boolean });
            setTouchedFields(allTouched);
            return;
        }
        
        setFormLoading(true);
        setError(null);
        setSuccess(null);
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
                throw new Error(err.message || 'Signup failed');
            }
            const data: SignupResponse = await res.json();
            // Pass verification object to the verify-otp page using navigation state
            navigate('/verify-otp', { state: { verification: data.verification, bureauId } });
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
        <div className="min-h-screen flex flex-col bg-background bg-white" style={{backgroundColor: 'white'}}>
        <Navigation/>
        <main className="flex-1 flex flex-col justify-center items-center px-4 py-8 animate-fadeIn">
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
                    <h3 className="text-xl font-semibold text-gray-900 mb-8 text-center">Choose your account type</h3>
                    <div className="flex flex-col gap-5">
                        {profileOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleProfileTypeSelect(option.value)}
                                className={`group relative p-6 border-2 rounded-2xl text-left transition-all duration-300 transform hover:scale-[1.02] ${
                                    form.profile_type === option.value 
                                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg' 
                                        : 'border-gray-200 hover:border-purple-300 hover:bg-gradient-to-br hover:from-purple-50/50 hover:to-purple-100/50 hover:shadow-md'
                                }`}
                            > 
                                <div className="flex items-center">
                                    <div className={`flex items-center justify-center w-6 h-6 border-2 rounded-full mr-4 transition-all duration-200 ${
                                        form.profile_type === option.value 
                                            ? 'bg-purple-600 border-purple-600' 
                                            : 'border-gray-300 group-hover:border-purple-400'
                                    }`}>
                                        {form.profile_type === option.value && (
                                            <div className="w-3 h-3 bg-white rounded-full"></div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-lg font-bold text-gray-900 mb-1">{option.label}</h4>
                                        <p className="text-sm text-gray-600">
                                            {option.value === 'employer' 
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
                                className="px-8 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors duration-200 shadow-md hover:shadow-lg"
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
                            className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>
            
            <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8 justify-center items-stretch">
            {/* Right: Signup form card */}
            <div className="card flex-1 bg-white border border-gray-100 p-8 rounded-xl shadow-lg w-full max-w-md">
      <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-black text-center flex-1">Sign Up</h2>
                {form.profile_type && (
                    <button 
                        type="button" 
                        onClick={() => setIsProfileModalOpen(true)}
                        className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
                    >
                        <span className="mr-1">Change profile: </span>
                        <span className="font-medium">{getSelectedProfileLabel()}</span>
                    </button>
                )}
            </div>
      <div className="text-center mb-4">
        <span className="text-base text-gray-600 font-medium">Already have an account?</span>
        <a href="/login"
          className="ml-2 text-base text-primary-600 font-semibold hover:underline">Login</a>
      </div>
      {error && (
        <div className="text-red-700 bg-red-50 border border-red-200 rounded p-2 text-center mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-slate-900 mb-1 font-medium">First Name</label>
                            <input
                                type="text"
                                name="first_name"
                                value={form.first_name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={`w-full h-12 text-base px-4 py-3 rounded-lg border bg-white text-primary-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 transition ${
                                    getFieldError('first_name') 
                                        ? 'border-red-300' 
                                        : isFieldValid('first_name')
                                        ? 'border-green-300'
                                        : 'border-primary-200'
                                }`}
                            />
                            {getFieldError('first_name') && (
                                <p className="text-red-600 text-sm mt-1">{getFieldError('first_name')}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-slate-900 mb-1 font-medium">Last Name</label>
                            <input
                                type="text"
                                name="last_name"
                                value={form.last_name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={`w-full h-12 text-base px-4 py-3 rounded-lg border bg-white text-primary-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 transition ${
                                    getFieldError('last_name') 
                                        ? 'border-red-300' 
                                        : isFieldValid('last_name')
                                        ? 'border-green-300'
                                        : 'border-primary-200'
                                }`}
                            />
                            {getFieldError('last_name') && (
                                <p className="text-red-600 text-sm mt-1">{getFieldError('last_name')}</p>
                            )}
                        </div>
                         
                        <div>
                            <label className="block text-slate-900 mb-1 font-medium">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={`w-full h-12 text-base px-4 py-3 rounded-lg border bg-white text-primary-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 transition ${
                                    getFieldError('password') 
                                        ? 'border-red-300' 
                                        : isFieldValid('password')
                                        ? 'border-green-300'
                                        : 'border-primary-200'
                                }`}
                            />
                            {getFieldError('password') && (
                                <p className="text-red-600 text-sm mt-1">{getFieldError('password')}</p>
                            )}
                        </div>
                        <div>
    <label className="block text-slate-900 mb-1 font-medium">Phone</label>
    <input
        type="tel"
        name="phone"
        value={form.phone}
        onChange={handleChange}
        onBlur={handleBlur}
        required
        className={`w-full h-12 text-base px-4 py-3 rounded-lg border bg-white text-primary-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 transition ${
            getFieldError('phone') 
                ? 'border-red-300' 
                : isFieldValid('phone')
                ? 'border-green-300'
                : 'border-primary-200'
        }`}
        placeholder="0712345678"
    />
    {getFieldError('phone') && (
        <p className="text-red-600 text-sm mt-1">{getFieldError('phone')}</p>
    )}
</div>

<button
    type="submit"
    className="w-full bg-primary-700 text-white py-3 rounded-lg hover:bg-primary-800 transition-colors duration-200 font-semibold text-lg disabled:opacity-60"
    disabled={formLoading || !form.profile_type}
>
    {formLoading ? 'Signing up...' : 'Sign Up'}
</button>
{!form.profile_type && (
    <p className="text-amber-600 text-sm mt-2 text-center">
        Please select a profile type to continue
    </p>
)}

<div className="relative my-6">
    <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300"></div>
    </div>
    <div className="relative flex justify-center text-sm">
        <span className="px-2 bg-white text-gray-500">Or continue with</span>
    </div>
</div>

<div className="mt-6 flex flex-col gap-3">
    <button
        type="button"
        onClick={() => window.location.href = 'http://localhost:8080/auth/google'}
        className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
    >
        <FcGoogle className="h-5 w-5 mr-2" />
        Sign in with Google
    </button>
</div>
</form>
</div>
</div>
</main>
<Footer/>
</div>
    );
}
