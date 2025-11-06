import React from "react";
import { API_BASE_URL } from '~/config/api';

interface ImageLightboxProps {
  images: any[];
  open: boolean;
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function ImageLightbox({ images, open, index, onClose, onPrev, onNext }: ImageLightboxProps) {
  if (!open) return null;
  const img = images[index];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <button
        className="absolute top-4 right-4 text-white text-3xl font-bold"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
      <button
        className="absolute left-8 top-1/2 -translate-y-1/2 text-white text-3xl font-bold px-2"
        onClick={onPrev}
        disabled={index === 0}
        aria-label="Previous image"
      >
        ◀
      </button>
      <img
        src={img.path ? `API_BASE_URL/images/${img.path}` : (img.url || img)}
        alt={`Image ${index + 1}`}
        className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-xl"
      />
      <button
        className="absolute right-8 top-1/2 -translate-y-1/2 text-white text-3xl font-bold px-2"
        onClick={onNext}
        disabled={index === images.length - 1}
        aria-label="Next image"
      >
        ▶
      </button>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-lg">
        {index + 1} / {images.length}
      </div>
    </div>
  );
}
