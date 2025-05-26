import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Form } from "@remix-run/react";
import { useAuth } from "~/contexts/AuthContext";
import { Error } from "~/components/Error";
import { Loading } from "~/components/Loading";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: "",
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
      await login(formData.email, formData.password);
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

  if (loading) {
    return <Loading text="Logging in..." />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8 animate-fadeIn">
        <div className="card w-full max-w-md">
          <h1 className="text-3xl font-extrabold text-primary mb-6 text-center">Sign in to HomeXpert</h1>
          <Form method="post" className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary mb-1">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="input w-full"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary mb-1">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="input w-full"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>
            <div className="flex items-center justify-between">
              <Link to="/forgot-password" className="link text-sm">Forgot password?</Link>
            </div>
            <button
              type="submit"
              className="btn-primary w-full mt-2"
            >
              Login
            </button>
          </Form>
          <div className="text-center mt-6 text-sm">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="link font-semibold">Sign up</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 