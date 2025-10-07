import { lazy, Suspense } from 'react';
import type { ComponentType } from 'react';

/**
 * Lazy Load Utility
 * 
 * Wrapper for React.lazy with built-in Suspense and loading fallback
 * 
 * Usage:
 * const HeavyComponent = lazyLoad(() => import('./HeavyComponent'));
 * 
 * // In your component:
 * <HeavyComponent />
 */

interface LazyLoadOptions {
  fallback?: React.ReactNode;
}

/**
 * Create a lazy-loaded component with Suspense wrapper
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
) {
  const LazyComponent = lazy(importFunc);
  
  const fallback = options.fallback || (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
    </div>
  );

  return function LazyLoadedComponent(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Loading Spinner Component
 * Use as fallback for lazy-loaded components
 */
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div className={`animate-spin rounded-full border-b-2 border-purple-600 ${sizeClasses[size]}`}></div>
    </div>
  );
}

/**
 * Skeleton Loader Component
 * Better UX than spinner for content-heavy components
 */
export function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-32 bg-gray-200 rounded"></div>
    </div>
  );
}

/**
 * Example Usage:
 * 
 * // Heavy chart component
 * const ChartComponent = lazyLoad(
 *   () => import('~/components/HeavyChart'),
 *   { fallback: <SkeletonLoader /> }
 * );
 * 
 * // Heavy editor component
 * const RichTextEditor = lazyLoad(
 *   () => import('~/components/RichTextEditor'),
 *   { fallback: <LoadingSpinner size="lg" /> }
 * );
 * 
 * // In your route component:
 * export default function Dashboard() {
 *   return (
 *     <div>
 *       <h1>Dashboard</h1>
 *       <ChartComponent data={data} />
 *       <RichTextEditor />
 *     </div>
 *   );
 * }
 */
