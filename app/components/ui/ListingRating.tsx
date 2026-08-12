import { Star } from "lucide-react";

type ListingRatingProps = {
  rating?: number | null;
  reviewCount?: number | null;
  className?: string;
};

export function ListingRating({ rating, reviewCount, className = "" }: ListingRatingProps) {
  const count = Number.isFinite(Number(reviewCount)) ? Number(reviewCount) : 0;
  const value = Number.isFinite(Number(rating)) ? Number(rating) : null;

  if (value == null || count < 1) {
    return <p className={`text-[11px] text-gray-500 dark:text-gray-400 ${className}`}>No ratings/reviews recorded yet</p>;
  }

  return (
    <p className={`inline-flex items-center gap-1 text-[11px] font-medium text-gray-700 dark:text-gray-200 ${className}`}>
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
      <span>{value.toFixed(1)}</span>
      <span className="text-gray-500 dark:text-gray-400">({count} {count === 1 ? "review" : "reviews"})</span>
    </p>
  );
}
