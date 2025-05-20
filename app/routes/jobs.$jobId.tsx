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

export default function JobDetailsPage() {
  const { job } = useLoaderData<typeof loader>();

  if (!job) {
    return <Error message="Job not found." />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">{job.title}</h1>
          <div className="space-y-4">
            <div>
              <span className="block text-sm text-slate-500">Description</span>
              <span className="block text-lg text-slate-900">{job.description}</span>
            </div>
            <div>
              <span className="block text-sm text-slate-500">Location</span>
              <span className="block text-lg text-slate-900">{job.location}</span>
            </div>
            <div>
              <span className="block text-sm text-slate-500">Salary</span>
              <span className="block text-lg text-slate-900">{job.salary}</span>
            </div>
            <div>
              <span className="block text-sm text-slate-500">Posted</span>
              <span className="block text-lg text-slate-900">{new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 