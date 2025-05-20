import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { Error } from "~/components/Error";

interface Notification {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookie = request.headers.get("cookie") || "";
  const res = await fetch("http://localhost:8080/notifications", {
    headers: { "cookie": cookie },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Response("Failed to fetch notifications", { status: res.status });
  }
  const notifications = await res.json();
  return json({ notifications });
};

export default function NotificationsPage() {
  const { notifications } = useLoaderData<typeof loader>();

  if (!notifications || notifications.length === 0) {
    return <Error message="No notifications found." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Notifications</h1>
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow p-8">
          <ul className="space-y-4">
            {notifications.map((notification: Notification) => (
              <li key={notification.id} className="border-b border-slate-200 dark:border-slate-700 pb-4">
                <p className="text-slate-900 dark:text-white">{notification.message}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{new Date(notification.createdAt).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
} 