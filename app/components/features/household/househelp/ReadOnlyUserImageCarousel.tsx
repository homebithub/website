import React from "react";
import { API_BASE_URL } from '~/config/api';

interface ReadOnlyUserImageCarouselProps {
  images: any[];
  carouselIdx: number;
  setCarouselIdx: (idx: number) => void;
  onExpand?: (idx: number) => void;
}

export default function ReadOnlyUserImageCarousel({ images, carouselIdx, setCarouselIdx, onExpand }: ReadOnlyUserImageCarouselProps) {
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-lg">
        <span className="text-gray-500 dark:text-gray-300">No images available.</span>
      </div>
    );
  }

  const handlePrev = () => {
    if (carouselIdx > 0) setCarouselIdx(carouselIdx - 1);
  };
  const handleNext = () => {
    if (carouselIdx < images.length - 1) setCarouselIdx(carouselIdx + 1);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full h-48 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-lg mb-2">
        <img
          src={images[carouselIdx]?.path ? `API_BASE_URL/images/${images[carouselIdx].path}` : (images[carouselIdx]?.url || images[carouselIdx])}
          alt={`User image ${carouselIdx + 1}`}
          className="object-contain max-h-48 max-w-full rounded-lg cursor-pointer hover:opacity-90 transition"
          onClick={() => onExpand && onExpand(carouselIdx)}
          style={{ cursor: onExpand ? 'pointer' : undefined }}
        />
        <button
          aria-label="Previous image"
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-700 rounded-full p-1 shadow hover:bg-gray-200 disabled:opacity-50"
          onClick={handlePrev}
          disabled={carouselIdx === 0}
        >
          ◀
        </button>
        <button
          aria-label="Next image"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-700 rounded-full p-1 shadow hover:bg-gray-200 disabled:opacity-50"
          onClick={handleNext}
          disabled={carouselIdx === images.length - 1}
        >
          ▶
        </button>
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 mt-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCarouselIdx(idx)}
              className={`w-10 h-10 rounded border-2 ${carouselIdx === idx ? 'border-primary-500' : 'border-gray-300'} overflow-hidden focus:outline-none`}
              aria-label={`Go to image ${idx + 1}`}
            >
              <img
                src={img.path ? `API_BASE_URL/images/${img.path}` : (img.url || img)}
                alt={`Thumbnail ${idx + 1}`}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {carouselIdx + 1} / {images.length}
      </div>
    </div>
  );
}
