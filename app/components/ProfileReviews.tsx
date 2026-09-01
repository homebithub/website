import { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageSquare, ChevronLeft, ChevronRight, LoaderCircle, X, ImagePlus } from 'lucide-react';
import { reviewService } from '~/services/grpc/review.service';
import { getStoredUserId } from '~/utils/authStorage';
import { employmentService } from '~/services/grpc/authServices';
import { FormError } from '~/components/FormError';
import { PHOTO_ACCEPT_ATTRIBUTE, selectPhotosForUpload, uploadDocuments } from '~/utils/documentUploads';
import { useSearchParams } from 'react-router';
import { formatDisplayName } from '~/utils/displayName';
import { isServiceProviderProfileType } from '~/utils/profileType';

interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  created_at: string;
  helpful_count: number;
  is_helpful?: boolean;
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
  profileType: 'household' | 'service_provider';
  isOwnProfile: boolean;
}

export default function ProfileReviews({
  profileId,
  profileType,
  isOwnProfile,
}: ProfileReviewsProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  // A review the viewer has written about this person that is not public yet.
  //
  // Reviews are held until an admin verifies them — verified defaults false and
  // the public list only returns verified ones. Nothing told the author that, so
  // somebody who had just written one was shown "No reviews yet. Be the first to
  // leave a review!" about the review they had left.
  const [myPendingReview, setMyPendingReview] = useState<any | null>(null);
  const [busyReviewId, setBusyReviewId] = useState<string | null>(null);
  const [responseDrafts, setResponseDrafts] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{ id: string; type: 'household' | 'service_provider'; name: string } | null>(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    content: '',
  });
  const [reviewImages, setReviewImages] = useState<File[]>([]);

  const reviewsPerPage = 10;
  const totalPages = Math.ceil(totalReviews / reviewsPerPage);

  useEffect(() => {
    loadReviewStats();
    loadReviews(currentPage);
    void loadMyPendingReview();
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

  /**
   * Whether this person is someone the viewer has actually worked with.
   *
   * The server refuses a review from anybody without a shared engagement, which
   * is right — but it only says so after the form has been filled in and sent,
   * and the refusal then appeared on the page behind the modal. Asking the same
   * question up front lets the button say what it knows.
   *
   * Advisory only. The server remains the authority: this decides whether to
   * offer the button, never whether the review is allowed.
   */
  const [canReview, setCanReview] = useState<'checking' | 'yes' | 'no'>('checking');

  useEffect(() => {
    if (isOwnProfile || !profileId) return;
    const viewerId = getStoredUserId();
    if (!viewerId) {
      setCanReview('no');
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        // Whichever side the viewer is, their own engagements are the ones they
        // can read. The person being viewed is the other party in each.
        const [asHousehold, asHousehelp] = await Promise.all([
          employmentService.listByHousehold(viewerId, 100, 0).catch(() => null),
          employmentService.listByServiceProvider(viewerId, 100, 0).catch(() => null),
        ]);

        const rows = [asHousehold, asHousehelp].flatMap((raw: any) => {
          const data = raw?.data?.data ?? raw?.data ?? raw ?? [];
          return Array.isArray(data) ? data : [];
        });

        // Same statuses the server counts: work that started, however it ended.
        // A hire still being negotiated is not something to review yet.
        const worked = rows.some((row: any) => {
          const status = String(row?.status ?? '').toLowerCase();
          if (!['active', 'completed', 'terminated'].includes(status)) return false;
          return [
            row?.househelp_user_id,
            row?.household_owner_user_id,
            row?.household_user_id,
          ].some((id) => id && String(id) === String(profileId));
        });

        if (!cancelled) setCanReview(worked ? 'yes' : 'no');
      } catch {
        // Could not tell. Offer the button rather than withhold it — a refusal
        // the viewer can read beats a button that is missing for no stated
        // reason, and the server will still enforce the rule.
        if (!cancelled) setCanReview('yes');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [profileId, isOwnProfile]);

  useEffect(() => {
    if (searchParams.get('review') === '1' && canReview === 'yes' && !isOwnProfile) {
      setActionError('');
      setShowReviewForm(true);
      const next = new URLSearchParams(searchParams);
      next.delete('review');
      setSearchParams(next, { replace: true });
    }
  }, [canReview, isOwnProfile, searchParams, setSearchParams]);

  const loadMyPendingReview = async () => {
    if (!getStoredUserId() || isOwnProfile) return;
    try {
      const mine = await reviewService.getMyReviews(getStoredUserId(), 1, 50);
      const rows = (mine as any)?.data?.data ?? (mine as any)?.data ?? mine ?? [];
      const forThisProfile = (Array.isArray(rows) ? rows : []).find(
        (row: any) =>
          String(row?.reviewee_id ?? row?.reviewee_user_id ?? '') === String(profileId) &&
          !(row?.verified ?? false),
      );
      setMyPendingReview(forThisProfile || null);
    } catch {
      // Nothing to add if we cannot read them; the public list still stands.
    }
  };

  const handleMarkHelpful = async (review: Review) => {
    if (!getStoredUserId()) {
      setActionError('Sign in to mark a review as helpful.');
      return;
    }
    setBusyReviewId(review.id);
    setActionError('');
    try {
      if (review.is_helpful) {
        await reviewService.unmarkReviewHelpful(review.id);
      } else {
        await reviewService.markReviewHelpful(review.id);
      }
      await loadReviews(currentPage);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not update this review.');
    } finally {
      setBusyReviewId(null);
    }
  };

  const handleResponse = async (review: Review) => {
    const response = (responseDrafts[review.id] || '').trim();
    const userId = getStoredUserId();
    if (!userId || response.length < 2) return;
    setBusyReviewId(review.id);
    setActionError('');
    try {
      await reviewService.addReviewResponse(review.id, userId, response);
      setResponseDrafts((current) => ({ ...current, [review.id]: '' }));
      await loadReviews(currentPage);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not post your response.');
    } finally {
      setBusyReviewId(null);
    }
  };

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault();
    const userId = getStoredUserId();
    if (!userId) {
      setActionError('Sign in to leave a review.');
      return;
    }
    if (reviewForm.title.trim().length < 5 || reviewForm.content.trim().length < 20) {
      setActionError('Use a title of at least 5 characters and a review of at least 20 characters.');
      return;
    }
    setBusyReviewId('new');
    setActionError('');
    setActionSuccess('');
    try {
      let images: Array<{ image_url: string; s3_key: string }> = [];
      if (reviewImages.length > 0) {
        const uploaded = await uploadDocuments({
          files: reviewImages,
          documentType: 'review_image',
          description: 'Review image',
        });
        const documents = uploaded?.data ?? [];
        images = (Array.isArray(documents) ? documents : []).map((document: any) => ({
          image_url: document.url || document.public_url || document.signed_url || document.s3_key,
          s3_key: document.s3_key || document.key || '',
        }));
      }
      await reviewService.createReview(userId, {
        reviewee_id: reviewTarget?.id || profileId,
        rating: reviewForm.rating,
        title: reviewForm.title.trim(),
        content: reviewForm.content.trim(),
        type: reviewTarget?.type || profileType,
        service_type: 'domestic_service',
        images,
      });
      setShowReviewForm(false);
      setReviewTarget(null);
      setReviewForm({ rating: 5, title: '', content: '' });
      setReviewImages([]);
      setActionSuccess('Your review has been published.');
      void loadMyPendingReview();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not submit your review.');
    } finally {
      setBusyReviewId(null);
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
              star <= rating ? 'fill-purple-500 text-pink-500' : 'text-gray-300'
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
    <div className="space-y-4">
      {/* Only what happened on the page itself. While the review form is open
          its own failures belong inside it, next to the button that caused
          them — not out here, behind the modal, where the person cannot see
          them and the form appears to have done nothing. */}
      {!showReviewForm && <FormError message={actionError} />}
      {actionSuccess && (
        <div className="rounded-xl border border-emerald-400/40 bg-emerald-950/20 px-4 py-3 text-xs text-emerald-700 dark:text-emerald-200">
          {actionSuccess}
        </div>
      )}

      {!isOwnProfile && (
        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            disabled={canReview !== 'yes'}
            title={
              canReview === 'no'
                ? 'You can review someone once you have worked with them through HomeBit.'
                : undefined
            }
            onClick={() => {
              setActionError('');
              setReviewTarget(null);
              setShowReviewForm(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-xs font-semibold text-white shadow transition hover:from-purple-700 hover:to-pink-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:from-purple-600 disabled:hover:to-pink-600"
          >
            <Star className="h-4 w-4" />
            {canReview === 'checking' ? 'Checking…' : 'Leave a review'}
          </button>
          {canReview === 'no' && (
            <p className="text-right text-[11px] text-gray-500 dark:text-gray-400">
              You can leave a review once you have worked together through HomeBit.
            </p>
          )}
        </div>
      )}

      {showReviewForm && (
        <div className="hb-mobile-modal-viewport fixed inset-0 z-[90] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <form
            onSubmit={submitReview}
            className="w-full max-w-lg rounded-t-3xl border border-purple-500/30 bg-white p-6 shadow-2xl dark:bg-[#13131a] sm:rounded-3xl"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">{reviewTarget ? `Review ${reviewTarget.name}` : 'Leave a review'}</h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Reviews are available only where HomeBit can verify a working relationship.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="rounded-full p-2 text-gray-500 hover:bg-purple-100 dark:hover:bg-purple-500/10"
                aria-label="Close review form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <fieldset className="mb-4">
              <legend className="mb-2 text-xs font-semibold text-gray-800 dark:text-gray-200">Rating</legend>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setReviewForm((current) => ({ ...current, rating }))}
                    className="rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    aria-label={`${rating} stars`}
                  >
                    <Star
                      className={`h-7 w-7 ${
                        rating <= reviewForm.rating
                          ? 'fill-purple-500 text-pink-500'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="mb-4 block">
              <span className="mb-1.5 block text-xs font-semibold text-gray-800 dark:text-gray-200">
                Title
              </span>
              <input
                required
                minLength={5}
                maxLength={100}
                value={reviewForm.title}
                onChange={(event) =>
                  setReviewForm((current) => ({ ...current, title: event.target.value }))
                }
                className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-purple-500/30 dark:bg-[#0f0f16] dark:text-white"
                placeholder="A clear summary of your experience"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-gray-800 dark:text-gray-200">
                Review
              </span>
              <textarea
                required
                minLength={20}
                maxLength={1000}
                rows={5}
                value={reviewForm.content}
                onChange={(event) =>
                  setReviewForm((current) => ({ ...current, content: event.target.value }))
                }
                className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-purple-500/30 dark:bg-[#0f0f16] dark:text-white"
                placeholder="Share specific, respectful feedback..."
              />
              <span className="mt-1 block text-right text-[11px] text-gray-400">
                {reviewForm.content.length}/1000
              </span>
            </label>

            <div className="mt-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">Photos (optional)</span>
                <span className="text-[11px] text-gray-400">{reviewImages.length}/5 · max 5MB each</span>
              </div>
              <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-purple-300 px-4 py-3 text-xs font-semibold text-purple-700 hover:bg-purple-50 dark:border-purple-500/40 dark:text-purple-200 dark:hover:bg-purple-500/10">
                <ImagePlus className="h-4 w-4" /> Add images
                <input
                  className="sr-only"
                  type="file"
                  accept={PHOTO_ACCEPT_ATTRIBUTE}
                  multiple
                  onChange={(event) => {
                    const selection = selectPhotosForUpload(event.target.files, reviewImages.length, 5);
                    if (selection.error) setActionError(selection.error);
                    else {
                      setActionError('');
                      setReviewImages((current) => [...current, ...selection.files]);
                    }
                    event.target.value = '';
                  }}
                />
              </label>
              {reviewImages.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {reviewImages.map((file, index) => (
                    <button key={`${file.name}-${index}`} type="button" onClick={() => setReviewImages((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="rounded-full bg-purple-100 px-3 py-1 text-[11px] text-purple-800 dark:bg-purple-500/20 dark:text-purple-100" title="Remove image">
                      {file.name} ×
                    </button>
                  ))}
                </div>
              )}
            </div>

            <FormError message={actionError} className="mt-5" />

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="rounded-xl border border-purple-300 px-4 py-2 text-xs font-semibold text-purple-700 dark:border-purple-500/40 dark:text-purple-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busyReviewId === 'new'}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
              >
                {busyReviewId === 'new' && <LoaderCircle className="h-4 w-4 animate-spin" />}
                Submit review
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Review Statistics */}
      {stats && stats.total_reviews > 0 && (
        <div className="rounded-2xl border border-purple-200 bg-white p-4 shadow-lg dark:border-purple-500/30 dark:bg-[#13131a] sm:p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Review Summary</h3>
          
          <div className="grid items-center gap-4 md:grid-cols-[0.55fr_1.45fr]">
            {/* Overall Rating */}
            <div className="text-left">
              <div className="mb-2 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                <div className="text-2xl font-bold text-white">
                  {stats.average_rating.toFixed(1)}
                </div>
              </div>
              <div className="mb-2 flex justify-start">
                {renderStars(Math.round(stats.average_rating))}
              </div>
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Based on {stats.total_reviews} {stats.total_reviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>

            {/* Rating Breakdown */}
            <div className="space-y-2">
              {getRatingBreakdown().map((item) => (
                <div key={item.stars} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-14">{item.stars} star</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 shadow-sm"
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
            <p className="text-gray-700 dark:text-gray-300 font-semibold text-base">
              {myPendingReview ? 'No public reviews yet' : 'No reviews yet'}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-xs mt-2">Be the first to leave a review!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="rounded-2xl border border-purple-200 bg-white p-4 shadow-lg transition-all duration-200 hover:shadow-xl dark:border-purple-500/30 dark:bg-[#13131a] sm:p-5">
              {/* Review Header */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {review.reviewer_profile && (
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-md">
                          <span className="text-xs font-bold text-white">
                            {review.reviewer_profile.first_name[0]}
                            {review.reviewer_profile.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {formatDisplayName(review.reviewer_profile, undefined, 'Homebit user')}
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
              <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">{review.title}</h4>
              <p className="mb-3 text-sm leading-6 text-gray-700 dark:text-gray-300">{review.content}</p>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="mb-3 grid grid-cols-3 gap-2">
                  {review.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.image_url}
                      alt={img.caption || `Review image ${idx + 1}`}
                      className="h-24 w-full cursor-pointer rounded-xl border border-purple-200 object-cover transition-transform duration-200 hover:scale-[1.02] dark:border-purple-500/30"
                    />
                  ))}
                </div>
              )}

              {/* Response */}
              {review.response && (
                <div className="mt-3 rounded-xl border-l-4 border-purple-500 bg-purple-50 p-3 dark:bg-purple-900/20">
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

              {isOwnProfile && !review.response && (
                <div className="mt-4 rounded-2xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-500/30 dark:bg-purple-900/10">
                  <label
                    htmlFor={`review-response-${review.id}`}
                    className="mb-2 block text-xs font-semibold text-purple-700 dark:text-purple-300"
                  >
                    Respond as the profile owner
                  </label>
                  <textarea
                    id={`review-response-${review.id}`}
                    rows={3}
                    maxLength={1000}
                    value={responseDrafts[review.id] || ''}
                    onChange={(event) =>
                      setResponseDrafts((current) => ({
                        ...current,
                        [review.id]: event.target.value,
                      }))
                    }
                    placeholder="Thank the reviewer or add helpful context..."
                    className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-xs text-gray-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-purple-500/30 dark:bg-[#0f0f16] dark:text-white"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => void handleResponse(review)}
                      disabled={
                        busyReviewId === review.id ||
                        (responseDrafts[review.id] || '').trim().length < 2
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      {busyReviewId === review.id && <LoaderCircle className="h-4 w-4 animate-spin" />}
                      Post response
                    </button>
                  </div>
                </div>
              )}

              {isOwnProfile && review.reviewer_profile?.id && (
                <button
                  type="button"
                  onClick={() => {
                    const targetType = isServiceProviderProfileType(review.reviewer_profile?.type)
                      ? 'service_provider'
                      : 'household';
                    setReviewTarget({
                      id: review.reviewer_profile!.id,
                      type: targetType,
                      name: formatDisplayName(review.reviewer_profile, undefined, 'this person'),
                    });
                    setActionError('');
                    setShowReviewForm(true);
                  }}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl border border-purple-300 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-50 dark:border-purple-500/50 dark:text-purple-200 dark:hover:bg-purple-500/10"
                >
                  <Star className="h-4 w-4" /> Review back
                </button>
              )}

              {/* Actions */}
              <div className="mt-4 flex items-center gap-4 border-t border-gray-100 pt-3 dark:border-gray-800">
                <button
                  onClick={() => void handleMarkHelpful(review)}
                  disabled={busyReviewId === review.id}
                  aria-pressed={Boolean(review.is_helpful)}
                  className={`flex items-center gap-2 transition-colors font-medium disabled:opacity-50 ${
                    review.is_helpful
                      ? 'text-purple-600 dark:text-purple-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
                  }`}
                >
                  {busyReviewId === review.id ? (
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                  ) : (
                    <ThumbsUp className={`h-5 w-5 ${review.is_helpful ? 'fill-current' : ''}`} />
                  )}
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
