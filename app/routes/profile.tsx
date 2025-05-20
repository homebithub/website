import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { Error } from "~/components/Error";

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
  const { profile } = useLoaderData<typeof loader>();

  if (!profile) {
    return <Error message="User profile not found." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">User Profile</h1>
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow p-8">
          <div className="space-y-4">
            <div>
              <span className="block text-sm text-slate-500 dark:text-slate-400">Name</span>
              <span className="block text-lg text-slate-900 dark:text-white">{profile.name}</span>
            </div>
            <div>
              <span className="block text-sm text-slate-500 dark:text-slate-400">Email</span>
              <span className="block text-lg text-slate-900 dark:text-white">{profile.email}</span>
            </div>
            <div>
              <span className="block text-sm text-slate-500 dark:text-slate-400">Phone</span>
              <span className="block text-lg text-slate-900 dark:text-white">{profile.phone}</span>
            </div>
            <div>
              <span className="block text-sm text-slate-500 dark:text-slate-400">Address</span>
              <span className="block text-lg text-slate-900 dark:text-white">{profile.address}</span>
            </div>
            <div>
              <span className="block text-sm text-slate-500 dark:text-slate-400">Bio</span>
              <span className="block text-lg text-slate-900 dark:text-white">{profile.bio}</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 