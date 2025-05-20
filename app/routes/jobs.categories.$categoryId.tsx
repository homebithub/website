import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import React from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { Error } from "~/components/Error";

interface Category {
  id: string;
  name: string;
  description: string;
}

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

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const categoryId = params.categoryId;
  if (!categoryId) {
    throw new Response("Category ID is required", { status: 400 });
  }
  const cookie = request.headers.get("cookie") || "";
  const [catRes, jobsRes] = await Promise.all([
    fetch(`http://localhost:8080/jobs/categories/${categoryId}`, {
      headers: { "cookie": cookie },
      credentials: "include",
    }),
    fetch(`http://localhost:8080/jobs?categoryId=${categoryId}`, {
      headers: { "cookie": cookie },
      credentials: "include",
    })
  ]);
  if (!catRes.ok) {
    throw new Response("Failed to fetch category", { status: catRes.status });
  }
  if (!jobsRes.ok) {
    throw new Response("Failed to fetch jobs", { status: jobsRes.status });
  }
  const category = await catRes.json();
  const jobs = await jobsRes.json();
  return json({ category, jobs });
};

export default function JobCategoryDetailsPage() {
  const { category, jobs } = useLoaderData<typeof loader>();

  if (!category) {
    return <Error message="Category not found." />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Link to="/jobs/categories" className="text-teal-600 hover:underline mb-4 inline-block">&larr; Back to Categories</Link>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{category.name}</h1>
        <p className="mb-6 text-slate-600">{category.description}</p>
        {(!jobs || jobs.length === 0) ? (
          <Error message="No jobs found in this category." />
        ) : (
          <div className="grid gap-6">
            {jobs.map((job: Job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="bg-white shadow rounded-lg overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-lg font-medium text-slate-900">
                    {job.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {job.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm text-slate-500">
                        {job.location}
                      </span>
                      <span className="mx-2 text-slate-300">•</span>
                      <span className="text-sm font-medium text-teal-600">
                        {formatCurrency(job.salary, job.currency)}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        job.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
} 