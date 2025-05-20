import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { Error } from "~/components/Error";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: string;
  createdAt: string;
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const jobId = params.jobId;
  if (!jobId) {
    throw new Response("Job ID is required", { status: 400 });
  }
  const cookie = request.headers.get("cookie") || "";
  const res = await fetch(`http://localhost:8080/jobs/${jobId}`, {
    headers: { "cookie": cookie },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Response("Failed to fetch job details", { status: res.status });
  }
  const job = await res.json();
  return json({ job });
};

export default function JobApplicationPage() {
  const { job } = useLoaderData<typeof loader>();

  if (!job) {
    return <Error message="Job not found." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Apply for {job.title}</h1>
          <div className="space-y-4">
            <div>
              <span className="block text-sm text-slate-500 dark:text-slate-400">Description</span>
              <span className="block text-lg text-slate-900 dark:text-white">{job.description}</span>
            </div>
            <div>
              <span className="block text-sm text-slate-500 dark:text-slate-400">Location</span>
              <span className="block text-lg text-slate-900 dark:text-white">{job.location}</span>
            </div>
            <div>
              <span className="block text-sm text-slate-500 dark:text-slate-400">Salary</span>
              <span className="block text-lg text-slate-900 dark:text-white">{job.salary}</span>
            </div>
            <div>
              <span className="block text-sm text-slate-500 dark:text-slate-400">Posted</span>
              <span className="block text-lg text-slate-900 dark:text-white">{new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 