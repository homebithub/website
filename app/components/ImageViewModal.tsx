import React from 'react';
import { XMarkIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

interface ImageViewModalProps {
  imageUrl: string;
  altText?: string;
  onClose: () => void;
}

export default function ImageViewModal({ imageUrl, altText = 'Image', onClose }: ImageViewModalProps) {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleOpenInNewTab = () => {
    window.open(imageUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-6xl max-h-[90vh] w-full flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white hover:text-purple-300 transition-colors"
          aria-label="Close modal"
        >
          <XMarkIcon className="h-8 w-8" />
        </button>

        {/* Image container */}
        <div className="relative bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
          <img
            src={imageUrl}
            alt={altText}
            className="w-full h-full max-h-[80vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={handleOpenInNewTab}
            className="flex items-center gap-2 px-6 py-1.5 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 rounded-xl font-semibold hover:bg-purple-50 dark:hover:bg-gray-700 transition-all shadow-lg hover:scale-105"
          >
            <ArrowTopRightOnSquareIcon className="h-5 w-5" />
            Open in New Tab
          </button>
          <button
            onClick={onClose}
            className="px-6 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
