import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React, { useEffect } from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { Error } from "~/components/Error";
import { useAuth } from "~/contexts/AuthContext";
import { useNavigate, useLocation } from "@remix-run/react";
import { Loading } from "~/components/Loading";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookie = request.headers.get("cookie") || "";
  const res = await fetch("http://localhost:8080/users/profile", {
    headers: { "cookie": cookie },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Response("Failed to fetch user profile", { status: res.status });
  }
  const profile = await res.json();
  return json({ profile });
};

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      const returnUrl = encodeURIComponent(location.pathname);
      navigate(`/login?redirect=${returnUrl}`);
    }
  }, [user, loading, navigate, location.pathname]);

  // Show loading while checking authentication
  if (loading) {
    return <Loading text="Checking authentication..." />;
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background bg-white dark:bg-slate-900">
      <Navigation />
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8 animate-fadeIn">
        <div className="card w-full max-w-2xl text-center bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700">
          <h1 className="text-4xl font-extrabold text-primary mb-6 dark:text-primary-400">Profile</h1>
          <p className="text-lg text-text mb-8 dark:text-primary-200">Manage your profile information and preferences.</p>
          
          <div className="space-y-6">
            <div className="bg-accent rounded-xl shadow-card p-6 dark:bg-slate-800">
              <div className="font-bold text-primary mb-1 dark:text-primary-300">Personal Information</div>
              <div className="text-text text-sm mb-2 dark:text-primary-200">Update your personal details and contact information.</div>
              <a href="/settings" className="btn-primary">Edit Profile</a>
            </div>
            
            <div className="bg-accent rounded-xl shadow-card p-6 dark:bg-slate-800">
              <div className="font-bold text-primary mb-1 dark:text-primary-300">Security</div>
              <div className="text-text text-sm mb-2 dark:text-primary-200">Change your password and manage security settings.</div>
              <a href="/change-password" className="btn-primary">Change Password</a>
            </div>
            
            <div className="bg-accent rounded-xl shadow-card p-6 dark:bg-slate-800">
              <div className="font-bold text-primary mb-1 dark:text-primary-300">Back to Dashboard</div>
              <div className="text-text text-sm mb-2 dark:text-primary-200">Return to your main dashboard.</div>
              <a href="/dashboard" className="btn-primary">Go to Dashboard</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 