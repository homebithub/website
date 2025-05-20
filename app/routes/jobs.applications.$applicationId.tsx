import React, { useState } from "react";
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useNavigate, Form } from "@remix-run/react";
import { Navigation } from "~/components/Navigation";
import { formatCurrency } from "~/utils/format";

interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  jobDescription: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  status: string;
  coverLetter: string;
  resumeUrl: string;
  createdAt: string;
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const applicationId = params.applicationId;
  if (!applicationId) {
    throw new Error("Application ID is required");
  }

  const response = await fetch(`http://localhost:8080/jobs/applications/${applicationId}`, {
    headers: {
      "Authorization": `Bearer ${request.headers.get("Authorization")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch application");
  }

  const application = await response.json();
  return json({ application });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const applicationId = params.applicationId;
  if (!applicationId) {
    throw new Error("Application ID is required");
  }

  const formData = await request.formData();
  const status = formData.get("status");
  const feedback = formData.get("feedback");

  const response = await fetch(`http://localhost:8080/jobs/applications/${applicationId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${request.headers.get("Authorization")}`,
    },
    body: JSON.stringify({ status, feedback }),
  });

  if (!response.ok) {
    throw new Error("Failed to update application");
  }

  return json({ success: true });
}

export default function JobApplicationDetails() {
  const { application } = useLoaderData<{ application: JobApplication }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    setIsSubmitting(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Link
              to="/jobs/applications"
              className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
            >
              ← Back to Applications
            </Link>
            <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
              Application Details
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Review and manage job application
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Job Information
              </h2>
              <div className="mt-4 space-y-2">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                  {application.jobTitle}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {application.jobDescription}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Applicant Information
              </h2>
              <div className="mt-4 space-y-2">
                <div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Name:
                  </span>
                  <span className="ml-2 text-slate-900 dark:text-white">
                    {application.applicantName}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email:
                  </span>
                  <span className="ml-2 text-slate-900 dark:text-white">
                    {application.applicantEmail}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Applied:
                  </span>
                  <span className="ml-2 text-slate-900 dark:text-white">
                    {new Date(application.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Cover Letter
              </h2>
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <p className="text-slate-900 dark:text-white whitespace-pre-wrap">
                  {application.coverLetter}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Resume
              </h2>
              <div className="mt-4">
                <a
                  href={application.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  View Resume
                </a>
              </div>
            </div>

            <Form method="post" onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Application Status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={application.status}
                  required
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white sm:text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="feedback"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Feedback
                </label>
                <div className="mt-1">
                  <textarea
                    id="feedback"
                    name="feedback"
                    rows={4}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white sm:text-sm"
                    placeholder="Add feedback for the applicant..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Updating..." : "Update Application"}
                </button>
              </div>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
} 