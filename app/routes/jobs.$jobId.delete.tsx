import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import React from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { Error } from "~/components/Error";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: number;
  currency: string;
  status: string;
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

export default function DeleteJobPage() {
  const { job } = useLoaderData<typeof loader>();

  if (!job) {
    return <Error message="Job not found." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Delete Job</h1>
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow p-8">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">{job.title}</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{job.description}</p>
          <div className="space-y-4">
            <div>
              <span className="block text-sm text-slate-500 dark:text-slate-400">Location</span>
              <span className="block text-lg text-slate-900 dark:text-white">{job.location}</span>
            </div>
            <div>
              <span className="block text-sm text-slate-500 dark:text-slate-400">Salary</span>
              <span className="block text-lg text-slate-900 dark:text-white">{new Intl.NumberFormat('en-US', { style: 'currency', currency: job.currency }).format(job.salary)}</span>
            </div>
            <div>
              <span className="block text-sm text-slate-500 dark:text-slate-400">Status</span>
              <span className="block text-lg text-slate-900 dark:text-white">{job.status}</span>
            </div>
            <div>
              <span className="block text-sm text-slate-500 dark:text-slate-400">Posted</span>
              <span className="block text-lg text-slate-900 dark:text-white">{new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <Form method="post" className="mt-8">
            <button
              type="submit"
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-slate-800"
            >
              Delete Job
            </button>
          </Form>
        </div>
      </main>
      <Footer />
    </div>
  );
} 