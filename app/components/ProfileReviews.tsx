import { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { reviewService } from '~/services/grpc/review.service';

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
  }, [profileId, profileType, isOwnProfile, currentPage]);

  const loadReviewStats = async () => {
    try {
      const data = await reviewService.getReviewStats(profileId);
      setStats(data);
    } catch (err) {
      console.error('Error loading review stats:', err);
    }
  };

  const loadReviews = async (page: number) => {
    setIsLoading(true);
    setError('');

    try {
      const data = await reviewService.getPublicReviews(profileId, undefined, page, reviewsPerPage);
      setReviews(data.reviews || []);
      setTotalReviews(data.total || 0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load reviews';
      if (profileType === 'household' && !isOwnProfile && /private|permission|forbidden/i.test(message)) {
        setError('Household reviews are private');
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await reviewService.markReviewHelpful(reviewId);
      await loadReviews(currentPage);
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
      <div className="bg-purple-50 dark:bg-purple-900/10 rounded-3xl border-2 border-purple-200 dark:border-purple-500/30 p-8 text-center">
        <p className="text-gray-700 dark:text-gray-300 font-medium">Household reviews are private</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Statistics */}
      {stats && stats.total_reviews > 0 && (
        <div className="bg-white dark:bg-[#13131a] rounded-3xl shadow-2xl border-2 border-purple-200 dark:border-purple-500/30 p-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Review Summary</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl shadow-xl mb-4">
                <div className="text-4xl font-bold text-white">
                  {stats.average_rating.toFixed(1)}
                </div>
              </div>
              <div className="flex justify-center mb-3">
                {renderStars(Math.round(stats.average_rating), 'lg')}
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Based on {stats.total_reviews} {stats.total_reviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* Rating Breakdown */}
            <div className="space-y-3">
              {getRatingBreakdown().map((item) => (
                <div key={item.stars} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-14">{item.stars} star</span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 w-12 text-right">
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
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent" />
            <p className="text-gray-600 dark:text-gray-400 mt-4 font-medium">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-purple-50 dark:bg-purple-900/10 rounded-3xl border-2 border-purple-200 dark:border-purple-500/30 p-12 text-center">
            <Star className="w-16 h-16 text-purple-300 dark:text-purple-600 mx-auto mb-4" />
            <p className="text-gray-700 dark:text-gray-300 font-semibold text-base">No reviews yet</p>
            <p className="text-gray-600 dark:text-gray-400 text-xs mt-2">Be the first to leave a review!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-[#13131a] rounded-3xl shadow-xl border-2 border-purple-200 dark:border-purple-500/30 p-6 hover:shadow-2xl transition-all duration-200">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {review.reviewer_profile && (
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-base">
                            {review.reviewer_profile.first_name[0]}
                            {review.reviewer_profile.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {review.reviewer_profile.first_name} {review.reviewer_profile.last_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(review.created_at).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  {renderStars(review.rating)}
                </div>
              </div>

              {/* Review Content */}
              <h4 className="font-bold text-base text-gray-900 dark:text-white mb-3">{review.title}</h4>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{review.content}</p>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {review.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.image_url}
                      alt={img.caption || `Review image ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-2xl border-2 border-purple-200 dark:border-purple-500/30 hover:scale-105 transition-transform duration-200 cursor-pointer"
                    />
                  ))}
                </div>
              )}

              {/* Response */}
              {review.response && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-5 mt-4 border-l-4 border-purple-500">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="font-bold text-xs text-purple-700 dark:text-purple-300">Response from owner</span>
                    {review.response_at && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(review.response_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{review.response}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 mt-6 pt-4 border-t-2 border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => handleMarkHelpful(review.id)}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
                >
                  <ThumbsUp className="w-5 h-5" />
                  <span className="text-xs">
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
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-3 rounded-2xl border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] hover:bg-purple-50 dark:hover:bg-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <ChevronLeft className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </button>
          
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 px-4">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-3 rounded-2xl border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] hover:bg-purple-50 dark:hover:bg-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <ChevronRight className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </button>
        </div>
      )}
    </div>
  );
}
