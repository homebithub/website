import React from "react";
import { API_BASE_URL } from '~/config/api';

interface ExpandedImageModalProps {
  images: any[];
  currentIdx: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function ExpandedImageModal({
  images,
  currentIdx,
  onClose,
  onPrev,
  onNext
}: ExpandedImageModalProps) {
  if (!images || images.length === 0) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <button
        className="absolute top-4 right-4 text-white bg-black bg-opacity-60 rounded-full p-2 text-2xl"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
      <div className="relative w-full max-w-2xl h-[70vh] flex items-center justify-center">
        <img
          src={API_BASE_URL/images/" + images[currentIdx].path.replace(/^src\//, '/')}
          alt={`User image ${currentIdx + 1}`}
          className="object-contain w-full h-full rounded-xl shadow border dark:border-slate-700 bg-white dark:bg-slate-900"
        />
        {images.length > 1 && (
          <>
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-700/80 rounded-full p-2 shadow hover:bg-primary-100 dark:hover:bg-primary-800"
              onClick={onPrev}
              aria-label="Previous image"
            >&lt;</button>
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-700/80 rounded-full p-2 shadow hover:bg-primary-100 dark:hover:bg-primary-800"
              onClick={onNext}
              aria-label="Next image"
            >&gt;</button>
          </>
        )}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, i) => (
            <span
              key={i}
              className={`inline-block w-2 h-2 rounded-full ${i === currentIdx ? 'bg-primary-500' : 'bg-gray-300 dark:bg-slate-700'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
