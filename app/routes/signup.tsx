import React, { useState } from 'react';
import { Footer } from '../components/Footer';
import { Navigation } from '../components/Navigation';

// Types for request and response
export type SignupRequest = {
  profile_type: 'employer';
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  country: string;
};

export type SignupResponse = {
  user_id: string;
  token: string;
};

const base_url = 'http://localhost:8080';

export default function SignupPage() {
  const [form, setForm] = useState<SignupRequest>({
    profile_type: 'employer',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${base_url}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Signup failed');
      }
      const data: SignupResponse = await res.json();
      setSuccess(data);
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navigation />
      <section className="flex-grow flex items-center justify-center py-16 bg-gray-50">
        <div className="bg-white rounded-lg shadow-md border border-gray-100 p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-primary-800 mb-6 text-center">Sign Up</h2>
          {success ? (
            <div className="text-green-700 bg-green-50 border border-green-200 rounded p-4 text-center mb-4">
              Signup successful!<br />
              User ID: <span className="font-mono">{success.user_id}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-primary-700 mb-1 font-medium">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200"
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
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200"
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
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200"
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
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200"
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
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200"
                  placeholder="+254712345678"
                />
              </div>
              <div>
                <label className="block text-primary-700 mb-1 font-medium">Country</label>
                <select
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200"
                >
                  <option value="KE">Kenya</option>
                  {/* Add more countries as needed */}
                </select>
              </div>
              {error && (
                <div className="text-red-700 bg-red-50 border border-red-200 rounded p-2 text-center">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-primary-700 text-white py-2 rounded-md hover:bg-primary-800 transition-colors duration-200 font-semibold disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Signing up...' : 'Sign Up'}
              </button>
            </form>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
} 