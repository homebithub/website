import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useEffect } from "react";
import { Calendar, User, Share2, Twitter, Facebook, Linkedin, Link2, MessageCircle } from "lucide-react";

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

interface LoaderData {
  post: BlogPost | null;
  relatedPosts: BlogPost[];
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.post) {
    return [
      { title: "Post Not Found - Homebit Blog" },
      { name: "description", content: "The blog post you're looking for could not be found." },
    ];
  }

  const { post } = data;
  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt;
  const imageUrl = post.featured_image || "https://homebit.co.ke/og-image.png";

  return [
    { title: `${title} - Homebit Blog` },
    { name: "description", content: description },
    { name: "keywords", content: post.seo_keywords?.join(", ") || post.tags.join(", ") },
    
    // Open Graph
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "article" },
    { property: "og:image", content: imageUrl },
    { property: "og:url", content: `https://homebit.co.ke/blog/${post.slug}` },
    { property: "article:published_time", content: post.published_at },
    { property: "article:author", content: post.author_name },
    { property: "article:section", content: post.category },
    ...(post.tags.map(tag => ({ property: "article:tag", content: tag }))),

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
    const apiUrl = process.env.GATEWAY_API_URL || "http://localhost:3005";
    
    // Fetch the blog post
    const response = await fetch(`${apiUrl}/api/v1/blog/posts/${slug}`);
    
    if (!response.ok) {
      return json<LoaderData>({ post: null, relatedPosts: [] }, { status: 404 });
    }

    const data = await response.json();
    const post = data.post;

    // Fetch related posts (same category, limit 3)
    const relatedResponse = await fetch(
      `${apiUrl}/api/v1/blog/posts?category=${post.category}&limit=3&status=published`
    );
    const relatedData = await relatedResponse.json();
    const relatedPosts = (relatedData.posts || []).filter((p: BlogPost) => p.slug !== slug);

    return json<LoaderData>({ post, relatedPosts });
  } catch (error) {
    console.error("Error loading blog post:", error);
    return json<LoaderData>({ post: null, relatedPosts: [] }, { status: 500 });
  }
}

export default function BlogPost() {
  const { post, relatedPosts } = useLoaderData<typeof loader>();

  useEffect(() => {
    if (!post) return;

    // Track page view
    const trackView = async () => {
      try {
        const sessionId = sessionStorage.getItem("session_id") || crypto.randomUUID();
        sessionStorage.setItem("session_id", sessionId);

        await fetch("/api/v1/blog/analytics/view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            post_id: post.id,
            session_id: sessionId,
            source: document.referrer || "direct",
            device_type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? "mobile" : "desktop",
          }),
        });
      } catch (error) {
        console.error("Error tracking view:", error);
      }
    };

    trackView();
  }, [post]);

  const handleShare = async (platform: string) => {
    if (!post) return;

    try {
      await fetch("/api/v1/blog/analytics/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: post.id,
          platform,
          session_id: sessionStorage.getItem("session_id"),
        }),
      });
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Post Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/blog"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
      <div className="relative h-96 bg-gray-900">
        {post.featured_image ? (
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 opacity-80" />
        )}
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {post.category && (
              <span className="inline-block px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-full mb-4">
                {post.category}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {post.title}
            </h1>
            <div className="flex items-center justify-center gap-6 text-white/90">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{post.author_name}</span>
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-8">
          {/* Share Buttons */}
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share:
            </span>
            <button
              onClick={() => handleShare("twitter")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Share on Twitter"
            >
              <Twitter className="w-5 h-5 text-blue-400" />
            </button>
            <button
              onClick={() => handleShare("facebook")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Share on Facebook"
            >
              <Facebook className="w-5 h-5 text-blue-600" />
            </button>
            <button
              onClick={() => handleShare("linkedin")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Share on LinkedIn"
            >
              <Linkedin className="w-5 h-5 text-blue-700" />
            </button>
            <button
              onClick={() => handleShare("copy")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Copy link"
            >
              <Link2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Article Content */}
          <div 
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-purple-600 dark:prose-a:text-purple-400 prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Comments Section Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            Comments
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Comments coming soon! We're working on adding a comment system to engage with our readers.
          </p>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <article
                  key={relatedPost.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200 dark:border-gray-700"
                >
                  <Link to={`/blog/${relatedPost.slug}`}>
                    {relatedPost.featured_image ? (
                      <img
                        src={relatedPost.featured_image}
                        alt={relatedPost.title}
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white text-3xl font-bold">
                          {relatedPost.title.charAt(0)}
                        </span>
                      </div>
                    )}

                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Back to Blog Link */}
        <div className="mt-12 text-center">
          <Link
            to="/blog"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            ← Back to All Posts
          </Link>
        </div>
      </div>
    </div>
  );
}
