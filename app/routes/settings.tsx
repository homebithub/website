import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import React from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { Error } from "~/components/Error";

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
  const res = await fetch("http://localhost:8080/users/settings", {
    headers: { "cookie": cookie },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Response("Failed to fetch user settings", { status: res.status });
  }
  const settings = await res.json();
  return json({ settings });
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
  const resSettings = await fetch("http://localhost:8080/users/settings", {
    headers: { "cookie": cookie },
    credentials: "include",
  });
  if (!resSettings.ok) {
    return json({ error: "Failed to fetch user settings" }, { status: resSettings.status });
  }
  const currentSettings = await resSettings.json();
  const prevEmail = currentSettings.email;

  // If email changed, call backend to update email
  if (email && email !== prevEmail) {
    const updateRes = await fetch("http://localhost:8080/auth/update-email", {
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
      return json({ error: data.message || "Failed to update email" }, { status: updateRes.status });
    }
  }

  // Otherwise, update other settings
  const updateRes = await fetch("http://localhost:8080/users/settings", {
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
    return json({ error: data.message || "Failed to update settings" }, { status: updateRes.status });
  }
  return redirect("/settings");
};

export default function SettingsPage() {
  const { settings } = useLoaderData<typeof loader>();

  if (!settings) {
    return <Error message="User settings not found." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">User Settings</h1>
        <Form method="post" className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow p-8">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={settings.name}
                required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                defaultValue={settings.email}
                required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                defaultValue={settings.phone}
                required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
              <textarea
                id="address"
                name="address"
                defaultValue={settings.address}
                required
                rows={3}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifications"
                name="notifications"
                defaultChecked={settings.notifications}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
              />
              <label htmlFor="notifications" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                Enable notifications
              </label>
            </div>
            <div>
              <button
                type="submit"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-slate-800"
              >
                Save Settings
              </button>
            </div>
          </div>
        </Form>
      </main>
      <Footer />
    </div>
  );
} 