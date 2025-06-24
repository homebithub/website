import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Form } from "@remix-run/react";
import { useAuth } from "~/contexts/AuthContext";
import { Error } from "~/components/Error";
import { Loading } from "~/components/Loading";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { FcGoogle } from 'react-icons/fc';

export type LoginRequest = {
  phone: string;
  password: string;
};

export type LoginResponse = {
  id: string;
  email: string;
  first_name: string;
  profile_type: string;
  last_name: string;
  phone: string;
  email_verified: boolean;
  country: string;
  role: string;
  status: string;
  auth_provider: string;
  created_at: string;
  updated_at: string;
  token: string;
};

export type LoginErrorResponse = {
  error: string;
};

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  useEffect(() => {
    // Access document only on the client side
    if (typeof window !== 'undefined') {
      // Your document access code here
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.phone, formData.password);
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from);
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoogleSignIn = () => {
    window.location.href = 'http://localhost:8080/auth/google'; // Adjust to your backend endpoint
  };

  if (loading) {
    return <Loading text="Logging in..." />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background bg-white dark:bg-slate-900">
      <Navigation />
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8 animate-fadeIn">
        <div className="card w-full max-w-md bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-extrabold text-primary mb-6 text-center dark:text-primary-400">Sign in to HomeXpert</h1>
          {error && (
            <div className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700 text-center">
              {error}
            </div>
          )}
          <Form method="post" className="space-y-6">
            <div className="space-y-4">
            <div>
                <label className="block text-primary-700 mb-1 font-medium">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full h-12 text-base px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-gray-50 dark:bg-slate-800 text-primary-900 dark:text-primary-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-400 transition"
                  placeholder="0712345678"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-primary mb-1">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  className="input w-full h-12 text-base px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-slate-800 text-primary-900 dark:text-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-500 dark:focus:ring-primary-600 dark:focus:border-primary-400 transition"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Link to="/forgot-password" className="link text-sm">Forgot password?</Link>
            </div>
            <button
              type="submit"
              onClick={handleSubmit}
              className="btn-primary w-full h-12 mt-2 text-base px-4 py-3 rounded-lg"
            >
              Login
            </button>
          </Form>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center w-full border border-gray-300 dark:border-slate-700 rounded-md py-3 mt-6 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <FcGoogle className="mr-2 text-2xl" />
            <span className="font-medium text-gray-700 dark:text-gray-200">Sign in with Google</span>
          </button>
          <div className="flex justify-center mt-8">
            <Link to="/signup" className="link font-semibold text-primary-700 dark:text-primary-300 text-base text-center">Don&apos;t have an account? Sign up</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
