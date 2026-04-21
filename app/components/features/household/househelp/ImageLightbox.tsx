import React from "react";
import { resolveHousehelpImageUrl } from './imageUrl';

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <button
        className="absolute top-4 right-4 z-10 text-white text-xl font-bold"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
      <button
        className="absolute left-8 top-1/2 -translate-y-1/2 z-10 text-white text-xl font-bold px-2"
        onClick={onPrev}
        disabled={index === 0}
        aria-label="Previous image"
      >
        ◀
      </button>
      <img
        src={resolveHousehelpImageUrl(img)}
        alt={`Image ${index + 1}`}
        className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-xl"
      />
      <button
        className="absolute right-8 top-1/2 -translate-y-1/2 z-10 text-white text-xl font-bold px-2"
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
