import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { Error } from "~/components/Error";

interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  status: string;
  createdAt: string;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookie = request.headers.get("cookie") || "";
  const res = await fetch("http://localhost:8080/job-applications", {
    headers: { "cookie": cookie },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Response("Failed to fetch job applications", { status: res.status });
  }
  const applications = await res.json();
  return json({ applications });
};

export default function JobApplicationsPage() {
  const { applications } = useLoaderData<typeof loader>();

  if (!applications || applications.length === 0) {
    return <Error message="No job applications found." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Job Applications</h1>
          <div className="space-y-4">
            {applications.map((application: JobApplication) => (
              <div key={application.id} className="border-b border-slate-200 dark:border-slate-700 pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="block text-sm text-slate-500 dark:text-slate-400">Job Title</span>
                    <span className="block text-lg text-slate-900 dark:text-white">{application.jobTitle}</span>
                  </div>
                  <div>
                    <span className="block text-sm text-slate-500 dark:text-slate-400">Status</span>
                    <span className="block text-lg text-slate-900 dark:text-white">{application.status}</span>
                  </div>
                  <div>
                    <span className="block text-sm text-slate-500 dark:text-slate-400">Date</span>
                    <span className="block text-lg text-slate-900 dark:text-white">{new Date(application.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 