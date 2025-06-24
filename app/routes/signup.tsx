import React, {useState} from 'react';
import {Footer} from '../components/Footer';
import {Navigation} from '../components/Navigation';
import {useNavigate} from '@remix-run/react';

// Types for request and response
export type SignupRequest = {
    profile_type: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone: string;
    country: string;
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

export default function SignupPage() {
    const [form, setForm] = useState<SignupRequest>({
        profile_type: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        country: 'KE',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<SignupResponse | null>(null);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
        const res = await fetch(`${base_url}/api/v1/auth/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(form),
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Signup failed');
        }
        const data: SignupResponse = await res.json();
        // Pass verification object to the verify-otp page using navigation state
        navigate('/verify-otp', { state: { verification: data.verification } });
    } catch (err: any) {
        setError(err.message || 'Signup failed');
    } finally {
        setLoading(false);
    }
};

    return (
        <main className="min-h-screen bg-white dark:bg-slate-900 flex flex-col">
            <Navigation/>
            <section className="flex-grow flex items-center justify-center py-16 bg-gray-50 dark:bg-slate-800">
                <div
                    className="bg-white dark:bg-slate-900 rounded-lg shadow-md border border-gray-100 dark:border-slate-700 p-8 w-full max-w-md">
                    <h2 className="text-3xl font-bold text-primary-800 dark:text-primary-400 mb-6 text-center">Sign
                        Up</h2>
                    <div className="text-center mb-4">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Already have an account?</span>
                        <a href="/login"
                           className="ml-2 text-primary-700 dark:text-primary-300 font-semibold hover:underline">Sign
                            In</a>
                    </div>
                    {error && (
                        <div className="text-red-700 bg-red-50 border border-red-200 rounded p-2 text-center">
                            {error}
                        </div>
                    )}
                    {/*{success ? (*/}
                    {/*  <div className="text-green-700 bg-green-50 border border-green-200 rounded p-4 text-center mb-4">*/}
                    {/*    Signup successful!<br />*/}
                    {/*    User ID: <span className="font-mono">{success.user_id}</span>*/}
                    {/*  </div>*/}
                    {/*) : (*/}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-primary-700 mb-1 font-medium">First Name</label>
                            <input
                                type="text"
                                name="first_name"
                                value={form.first_name}
                                onChange={handleChange}
                                required
                                className="w-full h-12 text-base px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-gray-50 dark:bg-slate-800 text-primary-900 dark:text-primary-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-400 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-primary-700 mb-1 font-medium">Last Name</label>
                            <input
                                type="text"
                                name="last_name"
                                value={form.last_name}
                                onChange={handleChange}
                                required
                                className="w-full h-12 text-base px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-gray-50 dark:bg-slate-800 text-primary-900 dark:text-primary-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-400 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-primary-700 mb-1 font-medium">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="w-full h-12 text-base px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-gray-50 dark:bg-slate-800 text-primary-900 dark:text-primary-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-400 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-primary-700 mb-1 font-medium">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                className="w-full h-12 text-base px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-gray-50 dark:bg-slate-800 text-primary-900 dark:text-primary-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-400 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-primary-700 mb-1 font-medium">Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                required
                                className="w-full h-12 text-base px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-gray-50 dark:bg-slate-800 text-primary-900 dark:text-primary-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-400 transition"
                                placeholder="0712345678"
                            />
                        </div>
                        <div>
                            <label className="block text-primary-700 mb-1 font-medium">Country</label>
                            <select
                                name="country"
                                value={form.country}
                                onChange={handleChange}
                                required
                                className="w-full h-12 text-base px-4 py-3 pr-10 rounded-md border border-primary-200 dark:border-primary-700 bg-gray-50 dark:bg-slate-800 text-primary-800 dark:text-primary-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-400 transition"
                            >
                                <option value="KE">Kenya</option>
                                {/* Add more countries as needed */}
                            </select>
                        </div>
                        <div>
                            <label className="block text-primary-700 dark:text-primary-300 mb-1 font-medium"
                                   htmlFor="profile_type">Profile Type</label>
                            <div className="relative">
                                <select
                                    id="profile_type"
                                    name="profile_type"
                                    value={form.profile_type}
                                    onChange={handleChange}
                                    required
                                    className="w-full h-12 text-base px-4 py-3 pr-10 rounded-md border border-primary-200 dark:border-primary-700 bg-gray-50 dark:bg-slate-800 text-primary-800 dark:text-primary-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-400 transition"
                                >
                                    <option value="">Select profile</option>
                                    <option value="employer">Household</option>
                                    <option value="househelp">Househelp/Nanny</option>
                                    <option value="agency">Agency/Bureau</option>

                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                    <svg className="h-5 w-5 text-primary-400 dark:text-primary-300" fill="none"
                                         viewBox="0 0 20 20" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                              d="M7 7l3-3 3 3m0 6l-3 3-3-3"/>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary-700 text-white py-2 rounded-md hover:bg-primary-800 transition-colors duration-200 font-semibold disabled:opacity-60"
                            disabled={loading}
                        >
                            {loading ? 'Signing up...' : 'Sign Up'}
                        </button>
                    </form>
                    {/*)}*/}
                </div>
            </section>
            <Footer/>
        </main>
    );
}
