import React, {useState, useEffect, useRef} from 'react';
import {Footer} from '../components/Footer';
import {Navigation} from '../components/Navigation';
import {useNavigate, useLocation} from '@remix-run/react';
import { signupSchema, validateForm, validateField } from '~/utils/validation';
import { useAuth } from '~/contexts/AuthContext';
import { Loading } from '~/components/Loading';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

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

// Profile type options
const profileOptions = [
    { value: 'employer', label: 'Household' },
    { value: 'househelp', label: 'Househelp/Nanny' },
    { value: 'bureau', label: 'Agency/Bureau' }
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
    
    // Dropdown state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
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
            // Allow bureau to register househelps if bureauId is present
            if (profileType === "bureau" && bureauId) {
        
                return;
            }
            if (profileType === "household") {
                navigate("/household");
            } else if (profileType === "househelp") {
                navigate("/househelp");
            } else if (profileType === "bureau") {
                navigate("/bureau");
           // } else if (redirectUrl) {
             //   navigate(redirectUrl);
            } else {
                navigate("/");
            }
        }
    }, [user, navigate, bureauId]);

    // Click outside handler for dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
        setIsDropdownOpen(false);
        
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
            setError(err.message || 'Signup failed');
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
        <div className="min-h-screen flex flex-col bg-background bg-white dark:bg-slate-900">
            <Navigation/>
            <main className="flex-1 flex flex-col justify-center items-center px-4 py-8 animate-fadeIn">
                <div className="card w-full max-w-md bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 p-8 rounded-xl shadow-lg">
                    <h2 className="text-3xl font-bold text-primary-800 dark:text-primary-400 mb-6 text-center">Sign
                        Up</h2>
                    <div className="text-center mb-4">
                        <span className="text-base text-gray-600 dark:text-gray-300 font-medium">Already have an account?</span>
                        <a href="/login"
                           className="ml-2 text-base text-primary-700 dark:text-primary-300 font-semibold hover:underline">Login
                            </a>
                    </div>
                    {error && (
                        <div className="text-red-700 bg-red-50 border border-red-200 rounded p-2 text-center mb-4">
                            {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-primary-700 mb-1 font-medium">First Name</label>
                            <input
                                type="text"
                                name="first_name"
                                value={form.first_name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={`w-full h-12 text-base px-4 py-3 rounded-lg border bg-white dark:bg-slate-800 text-primary-900 dark:text-primary-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-400 transition ${
                                    getFieldError('first_name') 
                                        ? 'border-red-300 dark:border-red-600' 
                                        : isFieldValid('first_name')
                                        ? 'border-green-300 dark:border-green-600'
                                        : 'border-primary-200 dark:border-primary-700'
                                }`}
                            />
                            {getFieldError('first_name') && (
                                <p className="text-red-600 text-sm mt-1">{getFieldError('first_name')}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-primary-700 mb-1 font-medium">Last Name</label>
                            <input
                                type="text"
                                name="last_name"
                                value={form.last_name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={`w-full h-12 text-base px-4 py-3 rounded-lg border bg-white dark:bg-slate-800 text-primary-900 dark:text-primary-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-400 transition ${
                                    getFieldError('last_name') 
                                        ? 'border-red-300 dark:border-red-600' 
                                        : isFieldValid('last_name')
                                        ? 'border-green-300 dark:border-green-600'
                                        : 'border-primary-200 dark:border-primary-700'
                                }`}
                            />
                            {getFieldError('last_name') && (
                                <p className="text-red-600 text-sm mt-1">{getFieldError('last_name')}</p>
                            )}
                        </div>
                         
                        <div>
                            <label className="block text-primary-700 mb-1 font-medium">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={`w-full h-12 text-base px-4 py-3 rounded-lg border bg-white dark:bg-slate-800 text-primary-900 dark:text-primary-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-400 transition ${
                                    getFieldError('password') 
                                        ? 'border-red-300 dark:border-red-600' 
                                        : isFieldValid('password')
                                        ? 'border-green-300 dark:border-green-600'
                                        : 'border-primary-200 dark:border-primary-700'
                                }`}
                            />
                            {getFieldError('password') && (
                                <p className="text-red-600 text-sm mt-1">{getFieldError('password')}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-primary-700 mb-1 font-medium">Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                className={`w-full h-12 text-base px-4 py-3 rounded-lg border bg-white dark:bg-slate-800 text-primary-900 dark:text-primary-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-400 transition ${
                                    getFieldError('phone') 
                                        ? 'border-red-300 dark:border-red-600' 
                                        : isFieldValid('phone')
                                        ? 'border-green-300 dark:border-green-600'
                                        : 'border-primary-200 dark:border-primary-700'
                                }`}
                                placeholder="0712345678"
                            />
                            {getFieldError('phone') && (
                                <p className="text-red-600 text-sm mt-1">{getFieldError('phone')}</p>
                            )}
                        </div>
                        
                        <div>
                            <label className="block text-primary-700 dark:text-primary-300 mb-1 font-medium"
                                   htmlFor="profile_type">Profile Type</label>
                            <div className="relative" ref={dropdownRef}>
                                {/* Custom Dropdown Button */}
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className={`w-full h-12 text-base px-4 py-3 pr-12 rounded-lg border bg-white dark:bg-slate-800 text-left text-primary-800 dark:text-primary-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-400 transition-all duration-200 hover:shadow-md ${
                                        getFieldError('profile_type') 
                                            ? 'border-red-300 dark:border-red-600' 
                                            : isFieldValid('profile_type')
                                            ? 'border-green-300 dark:border-green-600'
                                            : 'border-primary-200 dark:border-primary-700'
                                    } ${!form.profile_type ? 'text-gray-500 dark:text-gray-400' : ''}`}
                                >
                                    {getSelectedProfileLabel()}
                                </button>
                                
                                {/* Dropdown Icon */}
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                                    <ChevronDownIcon 
                                        className={`h-5 w-5 text-primary-400 dark:text-primary-300 transition-transform duration-300 ease-in-out ${
                                            isDropdownOpen ? 'rotate-180' : ''
                                        }`} 
                                    />
                                </div>
                                
                                {/* Dropdown Options */}
                                {isDropdownOpen && (
                                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-2xl animate-in slide-in-from-top-2 duration-200">
                                        {profileOptions.map((option, index) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => handleProfileTypeSelect(option.value)}
                                                className={`w-full px-4 py-3 text-left text-base font-medium transition-all duration-200 first:rounded-t-lg last:rounded-b-lg ${
                                                    form.profile_type === option.value
                                                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-l-4 border-purple-500'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300 hover:border-l-4 hover:border-purple-300'
                                                }`}
                                                style={{
                                                    animationDelay: `${index * 50}ms`
                                                }}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {getFieldError('profile_type') && (
                                <p className="text-red-600 text-sm mt-1">{getFieldError('profile_type')}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary-700 text-white py-3 rounded-lg hover:bg-primary-800 transition-colors duration-200 font-semibold text-lg disabled:opacity-60"
                            disabled={formLoading}
                        >
                            {formLoading ? 'Signing up...' : 'Sign Up'}
                        </button>
                    </form>
                </div>
            </main>
            <Footer/>
        </div>
    );
}
