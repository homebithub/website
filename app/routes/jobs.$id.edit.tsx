import React from "react";
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import { Navigation } from "~/components/Navigation";

interface Job {
  id: string;
  title: string;
  description: string;
  employerId: string;
  status: string;
  location: string;
  salary: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const response = await fetch(`http://localhost:8080/jobs/${params.id}`, {
    headers: {
      "Authorization": `Bearer ${request.headers.get("Authorization")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch job");
  }

  const job = await response.json();
  return json({ job });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const job = {
    title: formData.get("title"),
    description: formData.get("description"),
    location: formData.get("location"),
    salary: parseFloat(formData.get("salary") as string),
    currency: formData.get("currency"),
    status: formData.get("status"),
  };

  const response = await fetch(`http://localhost:8080/jobs/${params.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${request.headers.get("Authorization")}`,
    },
    body: JSON.stringify(job),
  });

  if (!response.ok) {
    throw new Error("Failed to update job");
  }

  return json({ success: true });
}

export default function EditJob() {
  const { job } = useLoaderData<{ job: Job }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Edit Job
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Update job listing details
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
            <Form method="post" className="space-y-6">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Job Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  defaultValue={job.title}
                  required
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={4}
                  defaultValue={job.description}
                  required
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  id="location"
                  defaultValue={job.location}
                  required
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="salary"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Salary
                  </label>
                  <input
                    type="number"
                    name="salary"
                    id="salary"
                    defaultValue={job.salary}
                    required
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="currency"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Currency
                  </label>
                  <select
                    name="currency"
                    id="currency"
                    defaultValue={job.currency}
                    required
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white sm:text-sm"
                  >
                    <option value="KES">Kenyan Shilling (KES)</option>
                    <option value="UGX">Ugandan Shilling (UGX)</option>
                    <option value="TZS">Tanzanian Shilling (TZS)</option>
                    <option value="USD">US Dollar (USD)</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Status
                </label>
                <select
                  name="status"
                  id="status"
                  defaultValue={job.status}
                  required
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white sm:text-sm"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="inline-flex justify-center py-2 px-4 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:hover:bg-slate-600 dark:focus:ring-offset-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-slate-800"
                >
                  Update Job
                </button>
              </div>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
} 