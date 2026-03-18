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
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        Write a Review for {revieweeName}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Review Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            maxLength={100}
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            {title.length}/100 characters
          </p>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share details about your experience..."
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            maxLength={1000}
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            {content.length}/1000 characters
          </p>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {images.length < 5 && (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                <div className="flex flex-col items-center">
                  <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
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
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
