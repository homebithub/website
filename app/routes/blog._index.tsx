import { useLoaderData, useSearchParams, Form, Link } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useState, useEffect } from "react";
import { Search, Filter, Calendar, TrendingUp, BookOpen, Heart } from "lucide-react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { BlogSubscribeForm } from "~/components/blog/BlogSubscribeForm";
import { useAuth } from "~/contexts/useAuth";

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
  total_likes?: number;
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
    const apiUrl = process.env.GATEWAY_API_BASE_URL || process.env.AUTH_API_BASE_URL || "http://localhost:3005";
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
  const { user } = useAuth();
  const userEmail: string = (user as any)?.user?.email ?? "";
  const userName: string = (user as any)?.user?.first_name ?? "";

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
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="gradient" bubbles={false} className="flex-1">
        <main className="flex-1">
          {/* Hero Header */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-8 sm:pb-12">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 mb-6">
                <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">Our Blog</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold mb-4">
                <span className="text-gray-900 dark:text-white">Homebit </span>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Blog</span>
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Insights, tips, and stories about household management and hiring help
              </p>
            </div>
          </section>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
            {/* Search and Filters */}
            <div className="mb-10 space-y-4">
              {/* Search Bar */}
              <Form onSubmit={handleSearch} className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search articles..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-purple-200 dark:border-purple-500/20 rounded-xl bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-sm text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 transition-all duration-200"
                >
                  Search
                </button>
              </Form>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Filter:</span>
                </div>

                {/* Category Filter */}
                <select
                  value={searchParams.get("category") || ""}
                  onChange={(e) => handleCategoryFilter(e.target.value)}
                  className="px-4 py-2 border-2 border-purple-200 dark:border-purple-500/20 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer"
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
                  <TrendingUp className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                  <select
                    value={searchParams.get("sort") || "newest"}
                    onChange={(e) => handleSort(e.target.value)}
                    className="px-4 py-2 border-2 border-purple-200 dark:border-purple-500/20 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Blog Posts Grid */}
            {posts.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-500/10 mb-6">
                  <BookOpen className="w-8 h-8 text-purple-500 dark:text-purple-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  No blog posts found. Check back soon!
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {posts.map((post) => (
                    <article
                      key={post.id}
                      className="group bg-white dark:bg-white/5 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 overflow-hidden border-2 border-purple-100 dark:border-purple-500/10 hover:border-purple-300 dark:hover:border-purple-500/30 hover:-translate-y-1"
                    >
                      <Link to={`/blog/${post.slug}`} className="block">
                        {post.featured_image ? (
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center group-hover:from-purple-700 group-hover:to-pink-700 transition-all duration-300">
                            <span className="text-white text-xl font-bold drop-shadow-lg">
                              {post.title.charAt(0)}
                            </span>
                          </div>
                        )}

                        <div className="p-6">
                          {/* Category Badge */}
                          {post.category && (
                            <span className="inline-block px-3 py-1 bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-300 text-xs font-semibold rounded-full mb-3 border border-purple-200 dark:border-purple-500/20">
                              {post.category}
                            </span>
                          )}

                          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                            {post.title}
                          </h2>

                          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 text-xs">
                            {post.excerpt}
                          </p>

                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
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
                            <div className="flex items-center gap-3">
                              {post.total_likes != null && post.total_likes > 0 && (
                                <span className="flex items-center gap-1 text-pink-500">
                                  <Heart className="w-3.5 h-3.5 fill-current" />
                                  {post.total_likes}
                                </span>
                              )}
                              {post.total_views != null && post.total_views > 0 && (
                                <span>{post.total_views} views</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-3">
                    <button
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set("page", String(currentPage - 1));
                        setSearchParams(params);
                      }}
                      disabled={currentPage === 1}
                      className="px-5 py-2.5 border-2 border-purple-200 dark:border-purple-500/20 rounded-xl bg-white dark:bg-white/5 text-sm text-gray-700 dark:text-gray-300 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:border-purple-300 dark:hover:border-purple-500/30 transition-all"
                    >
                      Previous
                    </button>

                    <span className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set("page", String(currentPage + 1));
                        setSearchParams(params);
                      }}
                      disabled={currentPage === totalPages}
                      className="px-5 py-2.5 border-2 border-purple-200 dark:border-purple-500/20 rounded-xl bg-white dark:bg-white/5 text-sm text-gray-700 dark:text-gray-300 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:border-purple-300 dark:hover:border-purple-500/30 transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          {/* Subscribe Banner */}
          <div className="mt-12">
            <BlogSubscribeForm variant="banner" defaultEmail={userEmail} defaultName={userName} />
          </div>
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}
