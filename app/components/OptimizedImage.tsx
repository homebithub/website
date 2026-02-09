import type { ImgHTMLAttributes } from 'react';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean; // For above-the-fold images
}

/**
 * Optimized Image Component
 * 
 * Features:
 * - Lazy loading by default
 * - Priority loading for above-the-fold images
 * - Responsive images support
 * - Automatic decoding
 * 
 * Usage:
 * <OptimizedImage src="/image.jpg" alt="Description" />
 * <OptimizedImage src="/hero.jpg" alt="Hero" priority /> // For above-the-fold
 */
export function OptimizedImage({
  src,
  alt,
  className = '',
  priority = false,
  ...props
}: OptimizedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...props}
    />
  );
}
