import { useLoaderData, Link } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useEffect, useState, useCallback } from "react";
import { Calendar, User, Share2, Twitter, Facebook, Linkedin, Link2, MessageCircle, Send, Heart, X } from "lucide-react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { BlogSubscribeForm } from "~/components/blog/BlogSubscribeForm";
import { useAuth } from "~/contexts/useAuth";
import { blogService } from "~/services/grpc/blog.service";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  author_id: string;
  author_name: string;
  author_type: string;
  category: string;
  tags: string[];
  status: string;
  is_featured: boolean;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  published_at: string;
  created_at: string;
  updated_at: string;
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  content: string;
  status: string;
  created_at: string;
}

interface LoaderData {
  post: BlogPost | null;
  relatedPosts: BlogPost[];
}

export const meta: MetaFunction = ({ data }) => {
  const loaderData = data as LoaderData | undefined;
  if (!loaderData?.post) {
    return [
      { title: "Post Not Found - Homebit Blog" },
      { name: "description", content: "The blog post you're looking for could not be found." },
    ];
  }

  const post = loaderData.post!;
  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt;
  const imageUrl = post.featured_image || "https://homebit.co.ke/og-image.png";

  return [
    { title: `${title} - Homebit Blog` },
    { name: "description", content: description },
    { name: "keywords", content: post.seo_keywords?.join(", ") || (post.tags ?? []).join(", ") },
    
    // Open Graph
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "article" },
    { property: "og:image", content: imageUrl },
    { property: "og:url", content: `https://homebit.co.ke/blog/${post.slug}` },
    { property: "article:published_time", content: post.published_at },
    { property: "article:author", content: post.author_name },
    { property: "article:section", content: post.category },
    ...((post.tags ?? []).map(tag => ({ property: "article:tag", content: tag }))),

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { slug } = params;

  if (!slug) {
    throw new Response("Not Found", { status: 404 });
  }

  try {
    const apiUrl = process.env.GATEWAY_API_BASE_URL || process.env.AUTH_API_BASE_URL || "http://localhost:3005";
    
    // Fetch the blog post
    const response = await fetch(`${apiUrl}/api/v1/blog/posts/${slug}`);
    
    if (!response.ok) {
      return Response.json({ post: null, relatedPosts: [] }, { status: 404 });
    }

    const data = await response.json();
    const post = data.post;

    // Fetch related posts (same category, limit 3)
    const relatedResponse = await fetch(
      `${apiUrl}/api/v1/blog/posts?category=${post.category}&limit=3&status=published`
    );
    const relatedData = await relatedResponse.json();
    const relatedPosts = (relatedData.posts || []).filter((p: BlogPost) => p.slug !== slug);

    return Response.json({ post, relatedPosts });
  } catch (error) {
    console.error("Error loading blog post:", error);
    return Response.json({ post: null, relatedPosts: [] }, { status: 500 });
  }
}

export default function BlogPost() {
  const { post, relatedPosts } = useLoaderData() as LoaderData;
  const { user } = useAuth();
  const userEmail: string = (user as any)?.user?.email ?? "";
  const userName: string = (user as any)?.user?.first_name ?? "";
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentName, setCommentName] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Get user ID from auth context
  const getUserId = useCallback(() => {
    if (!user) return null;
    const u = user as any;
    return u.user_id || u.id || u.user?.user_id || null;
  }, [user]);

  // Load comments client-side via gRPC
  useEffect(() => {
    if (!post) return;
    blogService.listComments(post.id).then(setComments).catch(() => {});
  }, [post]);

  // Fetch like status on mount
  useEffect(() => {
    if (!post) return;
    const fetchLikeStatus = async () => {
      try {
        const userId = getUserId();
        const status = await blogService.getLikeStatus(post.id, userId || undefined);
        setLikeCount(Number(status.totalLikes) || 0);
        setLiked(!!status.liked);
      } catch (err) {
        console.error("Error fetching like status:", err);
      }
    };
    fetchLikeStatus();
  }, [post, getUserId]);

  const handleLike = async () => {
    const userId = getUserId();
    if (!userId) {
      setShowAuthModal(true);
      return;
    }
    if (likeLoading || !post) return;
    setLikeLoading(true);
    try {
      if (liked) {
        // Unlike
        await blogService.unlikePost(post.id, userId);
        setLiked(false);
        setLikeCount((c) => Math.max(0, c - 1));
      } else {
        // Like
        const response = await blogService.likePost(post.id, userId);
        setLiked(true);
        setLikeCount(Number(response.totalLikes) ?? likeCount + 1);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    } finally {
      setLikeLoading(false);
    }
  };

  useEffect(() => {
    if (!post) return;

    // Track page view
    const trackView = async () => {
      try {
        const sessionId = sessionStorage.getItem("session_id") || crypto.randomUUID();
        sessionStorage.setItem("session_id", sessionId);

        const params = new URLSearchParams(window.location.search);
        await blogService.trackView(
          post.id,
          sessionId,
          document.referrer || "direct",
          /Mobile|Android|iPhone/i.test(navigator.userAgent) ? "mobile" : "desktop",
          getUserId() || undefined,
          params.get("utm_source") || undefined,
          params.get("utm_medium") || undefined,
          params.get("utm_campaign") || undefined,
        );
      } catch (error) {
        console.error("Error tracking view:", error);
      }
    };

    trackView();
  }, [post, getUserId]);

  const handleShare = async (platform: string) => {
    if (!post) return;

    try {
      await blogService.trackShare(
        post.id,
        platform,
        sessionStorage.getItem("session_id") || ""
      );
    } catch (error) {
      console.error("Error tracking share:", error);
    }

    const url = `https://homebit.co.ke/blog/${post.slug}`;
    const text = post.title;

    switch (platform) {
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
        break;
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
        break;
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <PurpleThemeWrapper variant="gradient" bubbles={false} className="flex-1">
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                Post Not Found
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                The blog post you're looking for doesn't exist or has been removed.
              </p>
              <Link
                to="/blog"
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                Back to Blog
              </Link>
            </div>
          </div>
        </PurpleThemeWrapper>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="gradient" bubbles={false} className="flex-1">
        <main className="flex-1">
          {/* JSON-LD Structured Data for SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                headline: post.title,
                description: post.excerpt,
                image: post.featured_image,
                datePublished: post.published_at,
                dateModified: post.updated_at,
                author: {
                  "@type": "Person",
                  name: post.author_name,
                },
                publisher: {
                  "@type": "Organization",
                  name: "Homebit",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://homebit.co.ke/logo.png",
                  },
                },
                mainEntityOfPage: {
                  "@type": "WebPage",
                  "@id": `https://homebit.co.ke/blog/${post.slug}`,
                },
              }),
            }}
          />

          {/* Hero Section with Featured Image */}
          <div className="relative h-80 sm:h-96 overflow-hidden">
            {post.featured_image ? (
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            
            <div className="absolute inset-0 flex items-end">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full">
                {post.category && (
                  <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-full mb-4 shadow-lg">
                    {post.category}
                  </span>
                )}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
                  {post.title}
                </h1>
                <div className="flex items-center gap-6 text-white/90">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    <span className="font-medium">{post.author_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>
                      {new Date(post.published_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white dark:bg-white/5 rounded-2xl shadow-sm border-2 border-purple-100 dark:border-purple-500/10 p-6 sm:p-8 mb-8">
              {/* Share Buttons */}
              <div className="flex items-center gap-3 mb-8 pb-8 border-b border-purple-100 dark:border-purple-500/10">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-purple-500" />
                  Share:
                </span>
                <button
                  onClick={() => handleShare("twitter")}
                  className="p-2 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-xl transition-all"
                  aria-label="Share on Twitter"
                >
                  <Twitter className="w-5 h-5 text-blue-400" />
                </button>
                <button
                  onClick={() => handleShare("facebook")}
                  className="p-2 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-xl transition-all"
                  aria-label="Share on Facebook"
                >
                  <Facebook className="w-5 h-5 text-blue-600" />
                </button>
                <button
                  onClick={() => handleShare("linkedin")}
                  className="p-2 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-xl transition-all"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin className="w-5 h-5 text-blue-700" />
                </button>
                <button
                  onClick={() => handleShare("copy")}
                  className="p-2 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-xl transition-all"
                  aria-label="Copy link"
                >
                  <Link2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>

                {/* Like Button */}
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={handleLike}
                    disabled={likeLoading}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      liked
                        ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/30 scale-100"
                        : "border-2 border-purple-200 dark:border-purple-500/20 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:border-purple-300 dark:hover:border-purple-500/30"
                    } ${likeLoading ? "opacity-60 cursor-not-allowed" : "hover:scale-105"}`}
                    aria-label={liked ? "Unlike this post" : "Like this post"}
                  >
                    <Heart className={`w-4 h-4 transition-all ${liked ? "fill-current" : ""}`} />
                    <span>{likeCount}</span>
                  </button>
                </div>
              </div>

              {/* Article Content */}
              <div 
                className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-extrabold prose-a:text-purple-600 dark:prose-a:text-purple-400 prose-img:rounded-2xl"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t border-purple-100 dark:border-purple-500/10">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-300 text-sm font-medium rounded-full border border-purple-200 dark:border-purple-500/20"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="bg-white dark:bg-white/5 rounded-2xl shadow-sm border-2 border-purple-100 dark:border-purple-500/10 p-6 sm:p-8 mb-8">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-purple-500" />
                Comments {comments.length > 0 && `(${comments.length})`}
              </h2>

              {/* Comment Form */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!commentName.trim() || !commentContent.trim()) return;
                  setSubmittingComment(true);
                  setCommentSuccess(false);
                  try {
                    await blogService.createComment(post.id, commentName, commentContent);
                    setCommentContent("");
                    setCommentSuccess(true);
                    setTimeout(() => setCommentSuccess(false), 5000);
                  } catch (error) {
                    console.error("Error submitting comment:", error);
                  } finally {
                    setSubmittingComment(false);
                  }
                }}
                className="mb-8 space-y-4"
              >
                <input
                  type="text"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full px-4 py-3 border-2 border-purple-200 dark:border-purple-500/20 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Share your thoughts..."
                  required
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-purple-200 dark:border-purple-500/20 rounded-xl bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
                />
                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={submittingComment}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 hover:shadow-xl hover:scale-105 transition-all duration-200"
                  >
                    <Send className="w-4 h-4" />
                    {submittingComment ? "Posting..." : "Post Comment"}
                  </button>
                  {commentSuccess && (
                    <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                      Comment submitted! It will appear after moderation.
                    </span>
                  )}
                </div>
              </form>

              {/* Comments List */}
              {comments.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">
                  No comments yet. Be the first to share your thoughts!
                </p>
              ) : (
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="border-b border-purple-100 dark:border-purple-500/10 pb-6 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {comment.user_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {comment.user_name}
                          </span>
                          <span className="text-gray-500 dark:text-gray-500 text-sm ml-2">
                            {new Date(comment.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 ml-11">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">
                  Related Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <article
                      key={relatedPost.id}
                      className="group bg-white dark:bg-white/5 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 overflow-hidden border-2 border-purple-100 dark:border-purple-500/10 hover:border-purple-300 dark:hover:border-purple-500/30 hover:-translate-y-1"
                    >
                      <Link to={`/blog/${relatedPost.slug}`}>
                        {relatedPost.featured_image ? (
                          <img
                            src={relatedPost.featured_image}
                            alt={relatedPost.title}
                            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-40 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                            <span className="text-white text-3xl font-bold drop-shadow-lg">
                              {relatedPost.title.charAt(0)}
                            </span>
                          </div>
                        )}

                        <div className="p-4">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                            {relatedPost.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                            {relatedPost.excerpt}
                          </p>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* Subscribe Form */}
            <BlogSubscribeForm variant="inline" className="mt-10" defaultEmail={userEmail} defaultName={userName} />

            {/* Back to Blog Link */}
            <div className="mt-8 text-center">
              <Link
                to="/blog"
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                ← Back to All Posts
              </Link>
            </div>
          </div>
        </main>
      </PurpleThemeWrapper>
      <Footer />

      {/* Auth Modal - shown when non-logged-in user tries to like */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAuthModal(false)}
          />
          <div className="relative bg-white dark:bg-[#1a1a2e] rounded-2xl shadow-2xl border-2 border-purple-200 dark:border-purple-500/20 p-8 max-w-md w-full">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">
                Like this article?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Sign in or create an account to like posts and engage with our community.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  to="/login"
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 hover:shadow-xl hover:scale-105 transition-all duration-200 text-center"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="w-full px-6 py-3 border-2 border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-300 rounded-xl font-semibold hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:border-purple-300 dark:hover:border-purple-500/30 transition-all text-center"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
