import { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  created_at: string;
  helpful_count: number;
  response?: string;
  response_at?: string;
  images?: Array<{
    image_url: string;
    caption?: string;
  }>;
  reviewer_profile?: {
    id: string;
    first_name: string;
    last_name: string;
    type: string;
    verified: boolean;
  };
}

interface ReviewStats {
  reviewee_id: string;
  total_reviews: number;
  average_rating: number;
  rating_1_count: number;
  rating_2_count: number;
  rating_3_count: number;
  rating_4_count: number;
  rating_5_count: number;
}

interface ProfileReviewsProps {
  profileId: string;
  profileType: 'household' | 'househelp';
  isOwnProfile: boolean;
}

export default function ProfileReviews({
  profileId,
  profileType,
  isOwnProfile,
}: ProfileReviewsProps) {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const reviewsPerPage = 10;
  const totalPages = Math.ceil(totalReviews / reviewsPerPage);

  useEffect(() => {
    loadReviewStats();
    loadReviews(currentPage);
  }, [profileId, currentPage]);

  const loadReviewStats = async () => {
    try {
      const response = await fetch(`/api/v1/reviews/stats/${profileId}`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to load review stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error loading review stats:', err);
    }
  };

  const loadReviews = async (page: number) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/v1/reviews/public?id=${profileId}&page=${page}&limit=${reviewsPerPage}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        if (response.status === 403 && profileType === 'household' && !isOwnProfile) {
          setError('Household reviews are private');
          setIsLoading(false);
          return;
        }
        throw new Error('Failed to load reviews');
      }

      const data = await response.json();
      setReviews(data.reviews || []);
      setTotalReviews(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/v1/reviews/${reviewId}/helpful`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to mark review as helpful');
      
      // Reload reviews to get updated helpful count
      loadReviews(currentPage);
    } catch (err) {
      console.error('Error marking review as helpful:', err);
    }
  };

  const getRatingBreakdown = () => {
    if (!stats) return [];
    const total = stats.total_reviews || 1;
    return [
      { stars: 5, count: stats.rating_5_count, percentage: (stats.rating_5_count / total) * 100 },
      { stars: 4, count: stats.rating_4_count, percentage: (stats.rating_4_count / total) * 100 },
      { stars: 3, count: stats.rating_3_count, percentage: (stats.rating_3_count / total) * 100 },
      { stars: 2, count: stats.rating_2_count, percentage: (stats.rating_2_count / total) * 100 },
      { stars: 1, count: stats.rating_1_count, percentage: (stats.rating_1_count / total) * 100 },
    ];
  };

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const starSize = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (error && profileType === 'household' && !isOwnProfile) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-600">Household reviews are private</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Statistics */}
      {stats && stats.total_reviews > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Review Summary</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold text-purple-600 mb-2">
                {stats.average_rating.toFixed(1)}
              </div>
              {renderStars(Math.round(stats.average_rating), 'lg')}
              <p className="text-gray-600 mt-2">
                Based on {stats.total_reviews} {stats.total_reviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* Rating Breakdown */}
            <div className="space-y-2">
              {getRatingBreakdown().map((item) => (
                <div key={item.stars} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-12">{item.stars} star</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">No reviews yet</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow p-6">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {review.reviewer_profile && (
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-semibold">
                            {review.reviewer_profile.first_name[0]}
                            {review.reviewer_profile.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">
                            {review.reviewer_profile.first_name} {review.reviewer_profile.last_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  {renderStars(review.rating)}
                </div>
              </div>

              {/* Review Content */}
              <h4 className="font-semibold text-lg mb-2">{review.title}</h4>
              <p className="text-gray-700 mb-4">{review.content}</p>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {review.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.image_url}
                      alt={img.caption || `Review image ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              {/* Response */}
              {review.response && (
                <div className="bg-gray-50 rounded-lg p-4 mt-4 border-l-4 border-purple-500">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold text-sm">Response from owner</span>
                    {review.response_at && (
                      <span className="text-xs text-gray-500">
                        {new Date(review.response_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700">{review.response}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                <button
                  onClick={() => handleMarkHelpful(review.id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm">
                    Helpful ({review.helpful_count})
                  </span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
