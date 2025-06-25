import React, { useEffect } from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { useAuth } from "~/contexts/AuthContext";
import { useNavigate, useLocation } from "@remix-run/react";
import { Loading } from "~/components/Loading";

export default function DashboardPage() {
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
        <div className="card w-full max-w-3xl text-center bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700">
          <h1 className="text-4xl font-extrabold text-primary mb-6 dark:text-primary-400">Dashboard</h1>
          <p className="text-lg text-text mb-8 dark:text-primary-200">Welcome to your dashboard. Here you can manage your profile, settings, and more.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-accent rounded-xl shadow-card p-6 dark:bg-slate-800">
              <div className="font-bold text-primary mb-1 dark:text-primary-300">Profile</div>
              <div className="text-text text-sm mb-2 dark:text-primary-200">View and edit your profile information.</div>
              <a href="/profile" className="btn-primary">Go to Profile</a>
            </div>
            <div className="bg-accent rounded-xl shadow-card p-6 dark:bg-slate-800">
              <div className="font-bold text-primary mb-1 dark:text-primary-300">Settings</div>
              <div className="text-text text-sm mb-2 dark:text-primary-200">Update your account settings and preferences.</div>
              <a href="/settings" className="btn-primary">Go to Settings</a>
            </div>
            <div className="bg-accent rounded-xl shadow-card p-6 dark:bg-slate-800">
              <div className="font-bold text-primary mb-1 dark:text-primary-300">Logout</div>
              <div className="text-text text-sm mb-2 dark:text-primary-200">Sign out of your account securely.</div>
              <a href="/logout" className="btn-primary">Logout</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
