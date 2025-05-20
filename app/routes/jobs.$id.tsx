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
  const action = formData.get("action");

  if (action === "delete") {
    const response = await fetch(`http://localhost:8080/jobs/${params.id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${request.headers.get("Authorization")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete job");
    }

    return json({ success: true });
  }

  if (action === "update") {
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

  return json({ success: false });
}

export default function JobDetails() {
  const { job } = useLoaderData<{ job: Job }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              {job.title}
            </h1>
            <p className="mt-2 text-slate-600">
              {job.location} • {formatCurrency(job.salary, job.currency)}
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="prose max-w-none">
              <p>{job.description}</p>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-6">
              <h2 className="text-lg font-medium text-slate-900">
                Job Details
              </h2>
              <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-slate-500">
                    Status
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {job.status}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">
                    Posted
                  </dt>
                  <dd className="mt-1 text-sm text-slate-900">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => navigate(`/jobs/${job.id}/edit`)}
                className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Edit
              </button>
              <Form method="post">
                <input type="hidden" name="action" value="delete" />
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </Form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 