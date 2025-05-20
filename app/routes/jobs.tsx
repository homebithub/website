import React from "react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { Navigation } from "~/components/Navigation";
import { Link } from "@remix-run/react";
import { Footer } from "~/components/Footer";
import { Error } from "~/components/Error";

interface Job {
  id: string;
  title: string;
  description: string;
  employerId: string;
  status: "open" | "closed";
  location: string;
  salary: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookie = request.headers.get("cookie") || "";
  const res = await fetch("http://localhost:8080/jobs", {
    headers: { "cookie": cookie },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Response("Failed to fetch jobs", { status: res.status });
  }
  const jobs = await res.json();
  return json({ jobs });
};

export default function JobsPage() {
  const { jobs } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const handleApply = (jobId: string) => {
    submit(
      { jobId },
      { method: "post", action: `/jobs/${jobId}/apply` }
    );
  };

  if (!jobs || jobs.length === 0) {
    return <Error message="No jobs found." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Jobs
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Browse available job opportunities
            </p>
          </div>
          <Link
            to="/jobs/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-slate-800"
          >
            Post a Job
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job: Job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-slate-800 shadow rounded-lg overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                  {job.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {job.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {job.location}
                    </span>
                    <span className="mx-2 text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-sm font-medium text-teal-600 dark:text-teal-400">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: job.currency,
                      }).format(job.salary)}
                    </span>
                  </div>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      job.status === "open"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
                <div className="mt-6">
                  {job.status === "open" && (
                    <button
                      onClick={() => handleApply(job.id)}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-slate-800"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
} 