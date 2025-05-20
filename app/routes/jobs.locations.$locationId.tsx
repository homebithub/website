import React from "react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Navigation } from "~/components/Navigation";
import { formatCurrency } from "~/utils/format";

interface Location {
  id: string;
  name: string;
  country: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  employerId: string;
  status: string;
  location: string;
  locationId: string;
  salary: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const locationId = params.locationId;

  const [locationResponse, jobsResponse] = await Promise.all([
    fetch(`http://localhost:8080/jobs/locations/${locationId}`, {
      headers: {
        "Authorization": `Bearer ${request.headers.get("Authorization")}`,
      },
    }),
    fetch(`http://localhost:8080/jobs?locationId=${locationId}`, {
      headers: {
        "Authorization": `Bearer ${request.headers.get("Authorization")}`,
      },
    }),
  ]);

  if (!locationResponse.ok || !jobsResponse.ok) {
    throw new Error("Failed to fetch data");
  }

  const [location, jobs] = await Promise.all([
    locationResponse.json(),
    jobsResponse.json(),
  ]);

  return json({ location, jobs });
}

export default function JobLocationDetails() {
  const { location, jobs } = useLoaderData<{ location: Location; jobs: Job[] }>();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Link
              to="/jobs/locations"
              className="text-teal-600 hover:text-teal-700"
            >
              ← Back to Locations
            </Link>
            <h1 className="mt-4 text-3xl font-bold text-slate-900">
              Jobs in {location.name}
            </h1>
            <p className="mt-2 text-slate-600">
              {location.country}
            </p>
          </div>

          <div className="grid gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white shadow rounded-lg p-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {job.title}
                    </h2>
                    <p className="mt-2 text-slate-600">
                      {job.description}
                    </p>
                    <div className="mt-4 flex items-center space-x-4">
                      <span className="text-teal-600 font-medium">
                        {formatCurrency(job.salary, job.currency)}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {job.status}
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/jobs/${job.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}

            {jobs.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-slate-900">
                  No jobs found in this location
                </h3>
                <p className="mt-2 text-slate-600">
                  Check back later for new job opportunities
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 