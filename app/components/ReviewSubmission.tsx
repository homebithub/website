import { useState } from 'react';
import { Star, Upload, X, Image as ImageIcon } from 'lucide-react';

interface ReviewSubmissionProps {
  hiringId: string;
  revieweeId: string;
  revieweeName: string;
  revieweeType: 'household' | 'househelp';
  onSubmit: (data: ReviewFormData) => Promise<void>;
  onCancel: () => void;
}

export interface ReviewFormData {
  hiring_id: string;
  reviewee_id: string;
  rating: number;
  title: string;
  content: string;
  images: Array<{
    image_url: string;
    s3_key: string;
    caption?: string;
  }>;
}

export default function ReviewSubmission({
  hiringId,
  revieweeId,
  revieweeName,
  revieweeType,
  onSubmit,
  onCancel,
}: ReviewSubmissionProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<Array<{ url: string; file: File }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.slice(0, 5 - images.length).map(file => ({
      url: URL.createObjectURL(file),
      file,
    }));
    setImages([...images, ...newImages]);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].url);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (title.length < 5) {
      setError('Title must be at least 5 characters');
      return;
    }

    if (content.length < 20) {
      setError('Review must be at least 20 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images first
      const uploadedImages = await Promise.all(
        images.map(async (img) => {
          const formData = new FormData();
          formData.append('file', img.file);
          formData.append('type', 'review');

          const response = await fetch('/api/v1/images/upload', {
            method: 'POST',
            body: formData,
            credentials: 'include',
          });

          if (!response.ok) throw new Error('Image upload failed');
          const data = await response.json();
          return {
            image_url: data.url,
            s3_key: data.s3_key,
          };
        })
      );

      await onSubmit({
        hiring_id: hiringId,
        reviewee_id: revieweeId,
        rating,
        title,
        content,
        images: uploadedImages,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#13131a] rounded-3xl shadow-2xl border-2 border-purple-200 dark:border-purple-500/30 p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
          <Star className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Write a Review for {revieweeName}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Share your experience to help others make informed decisions</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-purple-700 dark:text-purple-400 mb-3">
            Rating *
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 transition-all duration-200 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-purple-700 dark:text-purple-400 mb-3">
            Review Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            className="w-full px-4 py-3 border-2 border-purple-200 dark:border-purple-500/30 rounded-2xl bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
            maxLength={100}
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {title.length}/100 characters
          </p>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-semibold text-purple-700 dark:text-purple-400 mb-3">
            Your Review *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share details about your experience..."
            rows={6}
            className="w-full px-4 py-3 border-2 border-purple-200 dark:border-purple-500/30 rounded-2xl bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 resize-none"
            maxLength={1000}
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {content.length}/1000 characters
          </p>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-semibold text-purple-700 dark:text-purple-400 mb-3">
            Add Photos (Optional)
          </label>
          <div className="space-y-4">
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.url}
                      alt={`Review ${index + 1}`}
                      className="w-full h-32 object-cover rounded-2xl border-2 border-purple-200 dark:border-purple-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {images.length < 5 && (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-purple-300 dark:border-purple-500/50 rounded-2xl cursor-pointer hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all duration-200">
                <div className="flex flex-col items-center">
                  <ImageIcon className="w-8 h-8 text-purple-400 dark:text-purple-500 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Upload photos ({images.length}/5)
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-500/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-2xl font-medium">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Submitting...
              </span>
            ) : (
              'Submit Review'
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-8 py-4 border-2 border-purple-200 dark:border-purple-500/30 rounded-2xl font-bold text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 disabled:opacity-50 transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
