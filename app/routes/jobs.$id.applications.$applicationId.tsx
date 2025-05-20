import React from "react";
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import { Navigation } from "~/components/Navigation";
import { formatCurrency } from "~/utils/format";

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

interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  coverLetter: string;
  resume: string;
  expectedSalary: number;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const [jobResponse, applicationResponse] = await Promise.all([
    fetch(`http://localhost:8080/jobs/${params.id}`, {
      headers: {
        "Authorization": `Bearer ${request.headers.get("Authorization")}`,
      },
    }),
    fetch(`http://localhost:8080/jobs/${params.id}/applications/${params.applicationId}`, {
      headers: {
        "Authorization": `Bearer ${request.headers.get("Authorization")}`,
      },
    }),
  ]);

  if (!jobResponse.ok || !applicationResponse.ok) {
    throw new Error("Failed to fetch data");
  }

  const [job, application] = await Promise.all([
    jobResponse.json(),
    applicationResponse.json(),
  ]);

  return json({ job, application });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const action = formData.get("action");
  const status = formData.get("status");

  if (action === "update") {
    const response = await fetch(
      `http://localhost:8080/jobs/${params.id}/applications/${params.applicationId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${request.headers.get("Authorization")}`,
        },
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update application");
    }

    return json({ success: true });
  }

  return json({ success: false });
}

export default function ApplicationDetails() {
  const { job, application } = useLoaderData<{ job: Job; application: Application }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              Application for {job.title}
            </h1>
            <p className="mt-2 text-slate-600">
              Review application details
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-slate-900">
                  Applicant Information
                </h2>
                <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-slate-500">
                      Applicant ID
                    </dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      {application.applicantId}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">
                      Expected Salary
                    </dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      {formatCurrency(application.expectedSalary, application.currency)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">
                      Status
                    </dt>
                    <dd className="mt-1">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          application.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : application.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {application.status}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">
                      Applied
                    </dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h2 className="text-lg font-medium text-slate-900">
                  Cover Letter
                </h2>
                <div className="mt-4 prose max-w-none">
                  <p>{application.coverLetter}</p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium text-slate-900">
                  Resume
                </h2>
                <div className="mt-4 prose max-w-none">
                  <p>{application.resume}</p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <Form method="post" className="flex justify-end space-x-4">
                  <input type="hidden" name="action" value="update" />
                  <select
                    name="status"
                    defaultValue={application.status}
                    className="rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="accepted">Accept</option>
                    <option value="rejected">Reject</option>
                  </select>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    Update Status
                  </button>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 