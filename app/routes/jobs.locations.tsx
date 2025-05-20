import React from "react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { Navigation } from "~/components/Navigation";

interface Location {
  id: string;
  name: string;
  country: string;
  jobCount: number;
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

export async function loader({ request }: LoaderFunctionArgs) {
  const [locationsResponse, jobsResponse] = await Promise.all([
    fetch("http://localhost:8080/jobs/locations", {
      headers: {
        "Authorization": `Bearer ${request.headers.get("Authorization")}`,
      },
    }),
    fetch("http://localhost:8080/jobs", {
      headers: {
        "Authorization": `Bearer ${request.headers.get("Authorization")}`,
      },
    }),
  ]);

  if (!locationsResponse.ok || !jobsResponse.ok) {
    throw new Error("Failed to fetch data");
  }

  const [locations, jobs] = await Promise.all([
    locationsResponse.json(),
    jobsResponse.json(),
  ]);

  // Count jobs per location
  const locationsWithCount = locations.map((location: Location) => ({
    ...location,
    jobCount: jobs.filter((job: Job) => job.locationId === location.id).length,
  }));

  return json({ locations: locationsWithCount });
}

export default function JobLocations() {
  const { locations } = useLoaderData<{ locations: Location[] }>();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Job Locations
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Browse jobs by location
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {locations.map((location) => (
              <Link
                key={location.id}
                to={`/jobs/locations/${location.id}`}
                className="block bg-white dark:bg-slate-800 shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                      {location.name}
                    </h2>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">
                      {location.country}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200">
                    {location.jobCount} jobs
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {locations.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                No locations found
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Check back later for new job locations
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 