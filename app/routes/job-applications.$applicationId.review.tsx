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

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const applicationId = params.applicationId;
  if (!applicationId) {
    throw new Response("Application ID is required", { status: 400 });
  }
  const cookie = request.headers.get("cookie") || "";
  const res = await fetch(`http://localhost:8080/job-applications/${applicationId}`, {
    headers: { "cookie": cookie },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Response("Failed to fetch job application details", { status: res.status });
  }
  const application = await res.json();
  return json({ application });
};

export default function JobApplicationReviewPage() {
  const { application } = useLoaderData<typeof loader>();

  if (!application) {
    return <Error message="Job application not found." />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Review Job Application</h1>
          <div className="space-y-4">
            <div>
              <span className="block text-sm text-slate-500">Job Title</span>
              <span className="block text-lg text-slate-900">{application.jobTitle}</span>
            </div>
            <div>
              <span className="block text-sm text-slate-500">Status</span>
              <span className="block text-lg text-slate-900">{application.status}</span>
            </div>
            <div>
              <span className="block text-sm text-slate-500">Date</span>
              <span className="block text-lg text-slate-900">{new Date(application.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 