import React from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-8 animate-fadeIn">
        <div className="card w-full max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold text-primary mb-6">Dashboard</h1>
          <p className="text-lg text-text mb-8">Welcome to your dashboard. Here you can manage your profile, settings, and more.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="bg-accent rounded-xl shadow-card p-6">
              <div className="font-bold text-primary mb-1">Profile</div>
              <div className="text-text text-sm mb-2">View and edit your profile information.</div>
              <a href="/profile" className="btn-primary">Go to Profile</a>
            </div>
            <div className="bg-accent rounded-xl shadow-card p-6">
              <div className="font-bold text-primary mb-1">Settings</div>
              <div className="text-text text-sm mb-2">Update your account settings and preferences.</div>
              <a href="/settings" className="btn-primary">Go to Settings</a>
            </div>
            <div className="bg-accent rounded-xl shadow-card p-6">
              <div className="font-bold text-primary mb-1">Logout</div>
              <div className="text-text text-sm mb-2">Sign out of your account securely.</div>
              <a href="/logout" className="btn-primary">Logout</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
