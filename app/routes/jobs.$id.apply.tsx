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
  const application = {
    jobId: params.id,
    coverLetter: formData.get("coverLetter"),
    resume: formData.get("resume"),
    expectedSalary: parseFloat(formData.get("expectedSalary") as string),
    currency: formData.get("currency"),
  };

  const response = await fetch(`http://localhost:8080/jobs/${params.id}/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${request.headers.get("Authorization")}`,
    },
    body: JSON.stringify(application),
  });

  if (!response.ok) {
    throw new Error("Failed to submit application");
  }

  return json({ success: true });
}

export default function ApplyJob() {
  const { job } = useLoaderData<{ job: Job }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              Apply for {job.title}
            </h1>
            <p className="mt-2 text-slate-600">
              Submit your application
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <Form method="post" className="space-y-6">
              <div>
                <label
                  htmlFor="coverLetter"
                  className="block text-sm font-medium text-slate-700"
                >
                  Cover Letter
                </label>
                <textarea
                  name="coverLetter"
                  id="coverLetter"
                  rows={6}
                  required
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  placeholder="Tell us why you're interested in this position and what makes you a great fit..."
                />
              </div>

              <div>
                <label
                  htmlFor="resume"
                  className="block text-sm font-medium text-slate-700"
                >
                  Resume
                </label>
                <textarea
                  name="resume"
                  id="resume"
                  rows={4}
                  required
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  placeholder="Paste your resume here..."
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="expectedSalary"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Expected Salary
                  </label>
                  <input
                    type="number"
                    name="expectedSalary"
                    id="expectedSalary"
                    required
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="currency"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Currency
                  </label>
                  <select
                    name="currency"
                    id="currency"
                    defaultValue={job.currency}
                    required
                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  >
                    <option value="KES">Kenyan Shilling (KES)</option>
                    <option value="UGX">Ugandan Shilling (UGX)</option>
                    <option value="TZS">Tanzanian Shilling (TZS)</option>
                    <option value="USD">US Dollar (USD)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="inline-flex justify-center py-2 px-4 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Submit Application
                </button>
              </div>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
} 