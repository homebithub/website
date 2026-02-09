import React, { useState, useEffect } from 'react';
import { TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { API_BASE_URL, getAuthHeaders } from '~/config/api';

export interface ImageDocument {
  id: string;
  file_name: string;
  url: string;
  content_type: string;
  size: number;
  document_type: string;
  uploaded_at: string;
  is_public: boolean;
}

interface ImageGalleryProps {
  documentType?: string;
  onImageClick?: (image: ImageDocument) => void;
  onDelete?: (imageId: string) => void;
  className?: string;
  columns?: 2 | 3 | 4;
}

export default function ImageGallery({
  documentType = 'profile_photo',
  onImageClick,
  onDelete,
  className = '',
  columns = 3,
}: ImageGalleryProps) {
  const [images, setImages] = useState<ImageDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageDocument | null>(null);

  useEffect(() => {
    loadImages();
  }, [documentType]);

  const loadImages = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const url = `${API_BASE_URL}/api/v1/documents?document_type=${documentType}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        throw new Error('Failed to load images');
      }

      const data = await response.json();
      
      // Filter only images
      const imageFiles = (data.documents || []).filter((doc: ImageDocument) =>
        doc.content_type?.startsWith('image/')
      );
      
      setImages(imageFiles);
    } catch (err: any) {
      console.error('Error loading images:', err);
      setError(err.message || 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(
        `${API_BASE_URL}/api/v1/documents/${imageId}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(token),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      // Remove from local state
      setImages(prev => prev.filter(img => img.id !== imageId));
      onDelete?.(imageId);
    } catch (err: any) {
      console.error('Error deleting image:', err);
      alert(err.message || 'Failed to delete image');
    }
  };

  const handleImageClick = (image: ImageDocument) => {
    setSelectedImage(image);
    onImageClick?.(image);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-12 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl ${className}`}>
        <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        <button
          onClick={loadImages}
          className="mt-2 text-sm text-red-700 dark:text-red-300 underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className={`text-center p-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">No images uploaded yet</p>
      </div>
    );
  }

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={className}>
      <div className={`grid ${gridCols[columns]} gap-4`}>
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
          >
            {/* Image */}
            <img
              src={image.url}
              alt={image.file_name}
              className="w-full h-full object-cover"
              loading="lazy"
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 dark:group-hover:bg-opacity-60 transition-all duration-200 flex items-center justify-center space-x-3 opacity-0 group-hover:opacity-100">
              <button
                onClick={() => handleImageClick(image)}
                className="p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="View"
              >
                <EyeIcon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
              </button>
              
              <button
                onClick={() => handleDelete(image.id)}
                className="p-2 bg-white dark:bg-gray-800 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                title="Delete"
              >
                <TrashIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
              </button>
            </div>

            {/* Image info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-sm font-medium truncate">
                {image.file_name}
              </p>
              <p className="text-white text-xs opacity-75">
                {formatFileSize(image.size)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Image modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 dark:bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full">
            <img
              src={selectedImage.url}
              alt={selectedImage.file_name}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-4 text-center">
              <p className="text-white font-medium">{selectedImage.file_name}</p>
              <button
                onClick={() => setSelectedImage(null)}
                className="mt-2 px-4 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

