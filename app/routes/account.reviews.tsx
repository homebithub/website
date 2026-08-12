import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronLeft, ChevronRight, MessageSquare, Star } from "lucide-react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { Loading } from "~/components/Loading";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { PurpleCard } from "~/components/ui/PurpleCard";
import { useAuth } from "~/contexts/useAuth";
import { reviewService, type Review } from "~/services/grpc/review.service";

export const meta = () => [
  { title: "My Reviews - HomeBit" },
  { name: "description", content: "Review feedback you have submitted on HomeBit." },
];

export default function AccountReviewsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const currentUser = ((user as any)?.user || user) as any;
  const userId = currentUser?.id || currentUser?.user_id || "";
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const limit = 10;

  useEffect(() => {
    if (!authLoading && !user) navigate("/login?redirect=%2Faccount%2Freviews");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    reviewService
      .getMyReviews(userId, page, limit)
      .then((result) => {
        if (!cancelled) {
          setReviews(result.reviews || []);
          setTotal(result.total || 0);
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          console.error("Could not load submitted reviews", loadError);
          setError("We could not load your reviews right now. Please try again.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, page]);

  if (authLoading) return <Loading text="Checking authentication..." />;
  if (!user) return <Loading text="Redirecting to login..." />;

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={false} className="flex-1">
        <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
          <Link to="/settings" className="text-xs font-medium text-purple-500 hover:text-purple-400">
            ← Back to settings
          </Link>
          <div className="mb-6 mt-3">
            <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
              <MessageSquare className="h-6 w-6 text-purple-500" />
              My reviews
            </h1>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Reviews you have submitted after a verified HomeBit engagement.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-400/40 bg-red-950/20 px-4 py-3 text-xs text-red-700 dark:text-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <Loading text="Loading reviews..." />
          ) : reviews.length === 0 ? (
            <PurpleCard hover={false} glow className="p-10 text-center">
              <Star className="mx-auto mb-3 h-10 w-10 text-purple-400" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                You have not written a review yet
              </h2>
              <p className="mx-auto mt-2 max-w-md text-xs text-gray-500 dark:text-gray-400">
                Open a former household or househelp profile after an engagement, then choose
                “Leave a review”.
              </p>
            </PurpleCard>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <PurpleCard key={review.id} hover={false} className="p-5">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <div className="mb-2 flex gap-1">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <Star
                            key={value}
                            className={`h-4 w-4 ${
                              value <= review.rating
                                ? "fill-purple-500 text-pink-500"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                      <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {review.title}
                      </h2>
                      <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                        {review.content}
                      </p>
                    </div>
                    <div className="shrink-0 text-right text-[11px] text-gray-500 dark:text-gray-400">
                      <div className="capitalize">{review.type}</div>
                      <div>{new Date(review.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  {review.response && (
                    <div className="mt-4 rounded-xl border-l-4 border-purple-500 bg-purple-50 p-3 text-xs text-gray-700 dark:bg-purple-500/10 dark:text-gray-300">
                      <span className="font-semibold text-purple-700 dark:text-purple-300">
                        Owner response:
                      </span>{" "}
                      {review.response}
                    </div>
                  )}
                </PurpleCard>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="rounded-xl border border-purple-300 p-2 text-purple-600 disabled:opacity-40 dark:border-purple-500/40 dark:text-purple-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-gray-600 dark:text-gray-300">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page === totalPages}
                className="rounded-xl border border-purple-300 p-2 text-purple-600 disabled:opacity-40 dark:border-purple-500/40 dark:text-purple-300"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}

export { ErrorBoundary } from "~/components/ErrorBoundary";
