import React from "react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
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
  const [jobResponse, applicationsResponse] = await Promise.all([
    fetch(`http://localhost:8080/jobs/${params.id}`, {
      headers: {
        "Authorization": `Bearer ${request.headers.get("Authorization")}`,
      },
    }),
    fetch(`http://localhost:8080/jobs/${params.id}/applications`, {
      headers: {
        "Authorization": `Bearer ${request.headers.get("Authorization")}`,
      },
    }),
  ]);

  if (!jobResponse.ok || !applicationsResponse.ok) {
    throw new Error("Failed to fetch data");
  }

  const [job, applications] = await Promise.all([
    jobResponse.json(),
    applicationsResponse.json(),
  ]);

  return json({ job, applications });
}

export default function JobApplications() {
  const { job, applications } = useLoaderData<{ job: Job; applications: Application[] }>();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Applications for {job.title}
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              View and manage job applications
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider"
                    >
                      Applicant
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider"
                    >
                      Expected Salary
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider"
                    >
                      Applied
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                  {applications.map((application) => (
                    <tr key={application.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {application.applicantId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900 dark:text-white">
                          {formatCurrency(application.expectedSalary, application.currency)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            application.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : application.status === "accepted"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {application.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          type="button"
                          className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 