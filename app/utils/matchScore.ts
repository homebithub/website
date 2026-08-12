/** A single, non-overlapping colour scale for marketplace match badges. */
export function matchScoreClasses(score: number): string {
  const normalized = Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 0;

  if (normalized <= 25) {
    return "border-gray-300 bg-gray-100 text-gray-700 dark:border-white/15 dark:bg-white/10 dark:text-gray-200";
  }
  if (normalized <= 50) {
    return "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-200";
  }
  if (normalized <= 75) {
    return "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-200";
  }
  return "border-transparent bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm";
}
