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
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8 animate-fadeIn">
        <div className="card w-full max-w-2xl">
          <h1 className="text-3xl font-extrabold text-primary mb-8 text-center">Profile</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="mb-4">
                <span className="block text-sm text-primary font-medium mb-1">Name</span>
                <span className="block text-lg font-semibold text-text">{profile.name}</span>
              </div>
              <div className="mb-4">
                <span className="block text-sm text-primary font-medium mb-1">Email</span>
                <span className="block text-lg font-semibold text-text">{profile.email}</span>
              </div>
              <div className="mb-4">
                <span className="block text-sm text-primary font-medium mb-1">Phone</span>
                <span className="block text-lg font-semibold text-text">{profile.phone}</span>
              </div>
              <div className="mb-4">
                <span className="block text-sm text-primary font-medium mb-1">Address</span>
                <span className="block text-lg font-semibold text-text">{profile.address}</span>
              </div>
            </div>
            <div>
              <span className="block text-sm text-primary font-medium mb-1">Bio</span>
              <span className="block text-base text-text">{profile.bio}</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 