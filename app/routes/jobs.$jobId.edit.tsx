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
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const jobId = params.jobId;
  if (!jobId) {
    throw new Response("Job ID is required", { status: 400 });
  }
  const cookie = request.headers.get("cookie") || "";
  const [jobRes, categoriesRes] = await Promise.all([
    fetch(`http://localhost:8080/jobs/${jobId}`, {
      headers: { "cookie": cookie },
      credentials: "include",
    }),
    fetch("http://localhost:8080/jobs/categories", {
      headers: { "cookie": cookie },
      credentials: "include",
    })
  ]);
  if (!jobRes.ok) {
    throw new Response("Failed to fetch job details", { status: jobRes.status });
  }
  if (!categoriesRes.ok) {
    throw new Response("Failed to fetch categories", { status: categoriesRes.status });
  }
  const job = await jobRes.json();
  const categories = await categoriesRes.json();
  return json({ job, categories });
};

export default function EditJobPage() {
  const { job, categories } = useLoaderData<typeof loader>();

  if (!job) {
    return <Error message="Job not found." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Edit Job</h1>
        <Form method="post" className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow p-8">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Job Title</label>
              <input
                type="text"
                id="title"
                name="title"
                defaultValue={job.title}
                required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                id="description"
                name="description"
                defaultValue={job.description}
                required
                rows={4}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                defaultValue={job.location}
                required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="salary" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Salary</label>
              <input
                type="number"
                id="salary"
                name="salary"
                defaultValue={job.salary}
                required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Currency</label>
              <input
                type="text"
                id="currency"
                name="currency"
                defaultValue={job.currency}
                required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
              <select
                id="categoryId"
                name="categoryId"
                defaultValue={job.categoryId}
                required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              >
                <option value="">Select a category</option>
                {categories.map((category: Category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <button
                type="submit"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-slate-800"
              >
                Update Job
              </button>
            </div>
          </div>
        </Form>
      </main>
      <Footer />
    </div>
  );
} 