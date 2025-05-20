import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { Error } from "~/components/Error";
import { Link } from "@remix-run/react";

interface Category {
  id: string;
  name: string;
  description: string;
  jobCount: number;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const cookie = request.headers.get("cookie") || "";
  const res = await fetch("http://localhost:8080/jobs/categories", {
    headers: { "cookie": cookie },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Response("Failed to fetch job categories", { status: res.status });
  }
  const categories = await res.json();
  return json({ categories });
};

export default function JobCategoriesPage() {
  const { categories } = useLoaderData<typeof loader>();

  if (!categories || categories.length === 0) {
    return <Error message="No job categories found." />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Job Categories</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/jobs/categories/${category.id}`}
              className="bg-white shadow rounded-lg overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-lg font-medium text-slate-900">
                  {category.name}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {category.description}
                </p>
                <div className="mt-4">
                  <span className="text-sm text-slate-500">
                    {category.jobCount} jobs available
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
} 