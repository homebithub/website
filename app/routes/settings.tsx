import { API_ENDPOINTS, AUTH_API_BASE_URL, API_BASE_URL } from '~/config/api';
import type { LoaderFunctionArgs } from "react-router";
import { data, redirect } from "react-router";
import { useLoaderData, Form, useNavigate, useLocation } from "react-router";
import React, { useEffect } from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { Error } from "~/components/Error";
import { useAuth } from "~/contexts/AuthContext";
import { Loading } from "~/components/Loading";

interface UserSettings {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  notifications: boolean;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookie = request.headers.get("cookie") || "";
  const res = await fetch(API_ENDPOINTS.users.settings, {
    headers: { "cookie": cookie },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Response("Failed to fetch user settings", { status: res.status });
  }
  const settings = await res.json();
  return data({ settings });
};

export const action = async ({ request }: LoaderFunctionArgs) => {
  const cookie = request.headers.get("cookie") || "";
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const address = formData.get("address");
  const notifications = formData.get("notifications") === "on";

  // Fetch current settings to compare emails
  const resSettings = await fetch(API_ENDPOINTS.users.settings, {
    headers: { "cookie": cookie },
    credentials: "include",
  });
  if (!resSettings.ok) {
    return data({ error: "Failed to fetch user settings" }, { status: resSettings.status });
  }
  const currentSettings = await resSettings.json();
  const prevEmail = currentSettings.email;

  // If email changed, call backend to update email
  if (email && email !== prevEmail) {
    const updateRes = await fetch(`${AUTH_API_BASE_URL}/update-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "cookie": cookie,
      },
      credentials: "include",
      body: JSON.stringify({ email }),
    });
    const data = await updateRes.json();
    if (updateRes.ok && data.verification) {
      // Redirect to verify-otp with verification id and email as params
      const params = new URLSearchParams({
        verification_id: data.verification.id,
        email: data.verification.target,
        type: data.verification.type,
      });
      return redirect(`/verify-otp?${params.toString()}`);
    } else {
      return data({ error: data.message || "Failed to update email" }, { status: updateRes.status });
    }
  }

  // Otherwise, update other settings
  const updateRes = await fetch(API_ENDPOINTS.users.settings, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "cookie": cookie,
    },
    credentials: "include",
    body: JSON.stringify({ name, phone, address, notifications }),
  });
  if (!updateRes.ok) {
    const data = await updateRes.json();
    return data({ error: data.message || "Failed to update settings" }, { status: updateRes.status });
  }
  return redirect("/settings");
};

export default function SettingsPage() {
  const { settings } = useLoaderData<typeof loader>();
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

  if (!settings) {
    return <Error message="User settings not found." />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background bg-white dark:bg-slate-900">
      <Navigation />
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8 animate-fadeIn">
        <div className="card w-full max-w-2xl text-center bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700">
          <h1 className="text-4xl font-extrabold text-primary mb-6 dark:text-primary-400">Settings</h1>
          <p className="text-lg text-text mb-8 dark:text-primary-200">Manage your account settings and preferences.</p>
          
          <div className="space-y-6">
            <div className="bg-accent rounded-xl shadow-card p-6 dark:bg-slate-800">
              <div className="font-bold text-primary mb-1 dark:text-primary-300">Account Settings</div>
              <div className="text-text text-sm mb-2 dark:text-primary-200">Update your account information and preferences.</div>
              <a href="/profile" className="btn-primary">Edit Account</a>
            </div>
            
            <div className="bg-accent rounded-xl shadow-card p-6 dark:bg-slate-800">
              <div className="font-bold text-primary mb-1 dark:text-primary-300">Security Settings</div>
              <div className="text-text text-sm mb-2 dark:text-primary-200">Change your password and manage security settings.</div>
              <a href="/change-password" className="btn-primary">Change Password</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 