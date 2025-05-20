import React, { useState } from "react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { Navigation } from "~/components/Navigation";
import { formatCurrency } from "~/utils/format";

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

interface Category {
  id: string;
  name: string;
}

interface Location {
  id: string;
  name: string;
  country: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);

  const [jobsResponse, categoriesResponse, locationsResponse] = await Promise.all([
    fetch(`http://localhost:8080/jobs/search?${searchParams.toString()}`, {
      headers: {
        "Authorization": `Bearer ${request.headers.get("Authorization")}`,
      },
    }),
    fetch("http://localhost:8080/jobs/categories", {
      headers: {
        "Authorization": `Bearer ${request.headers.get("Authorization")}`,
      },
    }),
    fetch("http://localhost:8080/jobs/locations", {
      headers: {
        "Authorization": `Bearer ${request.headers.get("Authorization")}`,
      },
    }),
  ]);

  if (!jobsResponse.ok || !categoriesResponse.ok || !locationsResponse.ok) {
    throw new Error("Failed to fetch data");
  }

  const [jobs, categories, locations] = await Promise.all([
    jobsResponse.json(),
    categoriesResponse.json(),
    locationsResponse.json(),
  ]);

  return json({ jobs, categories, locations });
}

export default function JobSearch() {
  const { jobs, categories, locations } = useLoaderData<{
    jobs: Job[];
    categories: Category[];
    locations: Location[];
  }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    query: searchParams.get("query") || "",
    category: searchParams.get("category") || "",
    location: searchParams.get("location") || "",
    minSalary: searchParams.get("minSalary") || "",
    maxSalary: searchParams.get("maxSalary") || "",
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              Search Jobs
            </h1>
            <p className="mt-2 text-slate-600">
              Find your next opportunity
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mb-8 bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="query" className="block text-sm font-medium text-slate-700">
                  Search
                </label>
                <input
                  type="text"
                  name="query"
                  id="query"
                  value={filters.query}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  placeholder="Job title, keywords, or company"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-700">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-slate-700">
                  Location
                </label>
                <select
                  id="location"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                >
                  <option value="">All Locations</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="minSalary" className="block text-sm font-medium text-slate-700">
                  Minimum Salary
                </label>
                <input
                  type="number"
                  name="minSalary"
                  id="minSalary"
                  value={filters.minSalary}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  placeholder="Enter minimum salary"
                />
              </div>

              <div>
                <label htmlFor="maxSalary" className="block text-sm font-medium text-slate-700">
                  Maximum Salary
                </label>
                <input
                  type="number"
                  name="maxSalary"
                  id="maxSalary"
                  value={filters.maxSalary}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  placeholder="Enter maximum salary"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Search Jobs
              </button>
            </div>
          </form>

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
                      <span className="text-slate-600">
                        {job.location}
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
                  No jobs found
                </h3>
                <p className="mt-2 text-slate-600">
                  Try adjusting your search criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 