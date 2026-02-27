import React, { useMemo } from 'react';
import { API_BASE_URL } from '~/config/api';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  path: string;
  thumbnailPath?: string;
  mediumPath?: string;
  alt: string;
  className?: string;
}

/**
 * Responsive image component that uses srcset to serve the most appropriate
 * image size based on device screen density and width.
 * 
 * Sizes:
 * - Thumbnail: 200px
 * - Medium: 600px
 * - Large: 1200px (Default)
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  path,
  thumbnailPath,
  mediumPath,
  alt,
  className,
  ...props
}) => {
  const imageUrls = useMemo(() => {
    // If it's a full URL (external), return as is
    if (path.startsWith('http')) {
      return { src: path, srcset: '' };
    }

    const base = `${API_BASE_URL}/images/`;
    const large = `${base}${path}`;
    const medium = mediumPath ? `${base}${mediumPath}` : '';
    const thumb = thumbnailPath ? `${base}${thumbnailPath}` : '';

    let srcset = '';
    if (thumb) srcset += `${thumb} 200w`;
    if (medium) srcset += (srcset ? ', ' : '') + `${medium} 600w`;
    if (large) srcset += (srcset ? ', ' : '') + `${large} 1200w`;

    return { src: large, srcset };
  }, [path, mediumPath, thumbnailPath]);

  return (
    <img
      src={imageUrls.src}
      srcSet={imageUrls.srcset}
      sizes="(max-width: 600px) 200px, (max-width: 1200px) 600px, 1200px"
      alt={alt}
      className={className}
      loading="lazy"
      {...props}
    />
  );
};
