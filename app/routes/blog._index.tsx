import { useLoaderData, useSearchParams, Form } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useState, useEffect } from "react";
import { Search, Filter, Calendar, TrendingUp } from "lucide-react";

export const meta: MetaFunction = () => {
  return [
    { title: "Blog - Homebit" },
    { name: "description", content: "Read the latest articles and insights from Homebit about household management, hiring help, and more." },
    { property: "og:title", content: "Blog - Homebit" },
    { property: "og:description", content: "Read the latest articles and insights from Homebit" },
    { property: "og:type", content: "website" },
  ];
};

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image?: string;
  author_name: string;
  category: string;
  tags: string[];
  published_at: string;
  total_views?: number;
}

interface LoaderData {
  posts: BlogPost[];
  total: number;
  limit: number;
  offset: number;
  categories: string[];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const category = url.searchParams.get("category") || "";
  const sort = url.searchParams.get("sort") || "newest";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 12;
  const offset = (page - 1) * limit;

  try {
    // Call gateway API
    const apiUrl = process.env.GATEWAY_API_URL || "http://localhost:3005";
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      status: "published",
    });

    if (search) params.append("search", search);
    if (category) params.append("category", category);
    if (sort === "popular") params.append("sort_by", "total_views");
    if (sort === "newest") params.append("sort_by", "published_at");

    const response = await fetch(`${apiUrl}/api/v1/blog/posts?${params}`);
    const data = await response.json();

    // Get categories
    const categoriesResponse = await fetch(`${apiUrl}/api/v1/blog/categories`);
    const categoriesData = await categoriesResponse.json();

    return Response.json({
      posts: data.posts || [],
      total: data.total || 0,
      limit: data.limit || limit,
      offset: data.offset || offset,
      categories: categoriesData.categories?.map((c: any) => c.name) || [],
    });
  } catch (error) {
    console.error("Error loading blog posts:", error);
    return Response.json({
      posts: [],
      total: 0,
      limit,
      offset,
      categories: [],
    });
  }
}

export default function BlogIndex() {
  const { posts, total, limit, offset, categories } = useLoaderData() as LoaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    // Ensure session ID is set for analytics tracking on post pages
    if (!sessionStorage.getItem("session_id")) {
      sessionStorage.setItem("session_id", crypto.randomUUID());
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }
    params.delete("page"); // Reset to first page
    setSearchParams(params);
  };

  const handleCategoryFilter = (category: string) => {
    const params = new URLSearchParams(searchParams);
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    params.delete("page");
    setSearchParams(params);
  };

  const handleSort = (sort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", sort);
    params.delete("page");
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Homebit Blog
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Insights, tips, and stories about household management and hiring help
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <Form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Search
            </button>
          </Form>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
            </div>

            {/* Category Filter */}
            <select
              value={searchParams.get("category") || ""}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Sort */}
            <div className="flex items-center gap-2 ml-auto">
              <TrendingUp className="w-5 h-5 text-gray-500" />
              <select
                value={searchParams.get("sort") || "newest"}
                onChange={(e) => handleSort(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No blog posts found. Check back soon!
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200 dark:border-gray-700"
                >
                  <a href={`/blog/${post.slug}`} className="block">
                    {post.featured_image ? (
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white text-4xl font-bold">
                          {post.title.charAt(0)}
                        </span>
                      </div>
                    )}

                    <div className="p-6">
                      {/* Category Badge */}
                      {post.category && (
                        <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 text-xs font-medium rounded-full mb-3">
                          {post.category}
                        </span>
                      )}

                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {post.title}
                      </h2>

                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(post.published_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        {post.total_views && post.total_views > 0 && (
                          <span>{post.total_views} views</span>
                        )}
                      </div>
                    </div>
                  </a>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set("page", String(currentPage - 1));
                    setSearchParams(params);
                  }}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Previous
                </button>

                <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set("page", String(currentPage + 1));
                    setSearchParams(params);
                  }}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
