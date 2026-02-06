/**
 * Web Vitals Tracking
 * 
 * Tracks Core Web Vitals:
 * - LCP (Largest Contentful Paint) - Loading performance
 * - FID (First Input Delay) - Interactivity
 * - CLS (Cumulative Layout Shift) - Visual stability
 * 
 * Usage:
 * Import in entry.client.tsx to start tracking
 */

type Metric = {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
};

function sendToAnalytics(metric: Metric) {
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: `${Math.round(metric.value)}ms`,
      rating: metric.rating,
      id: metric.id,
    });
  }

  // In production, send to your analytics service
  // Example: Google Analytics, custom analytics endpoint, etc.
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to analytics service
    // Example with Google Analytics:
    // window.gtag?.('event', metric.name, {
    //   value: Math.round(metric.value),
    //   metric_id: metric.id,
    //   metric_value: metric.value,
    //   metric_delta: metric.delta,
    //   metric_rating: metric.rating,
    // });
  }
}

export function trackWebVitals() {
  // Dynamically import web-vitals to avoid bundling in SSR
  if (typeof window !== 'undefined') {
    import('web-vitals').then((webVitals) => {
      const { onCLS, onLCP, onFCP, onTTFB, onINP } = webVitals;
      // Note: onFID is deprecated in web-vitals v4+, use onINP instead
      onCLS(sendToAnalytics);
      onLCP(sendToAnalytics);
      onFCP(sendToAnalytics);
      onTTFB(sendToAnalytics);
      onINP(sendToAnalytics);
    }).catch((error) => {
      console.error('Failed to load web-vitals:', error);
    });
  }
}

/**
 * Performance Thresholds
 * 
 * Good:
 * - LCP: < 2.5s
 * - FID: < 100ms
 * - CLS: < 0.1
 * - FCP: < 1.8s
 * - TTFB: < 600ms
 * - INP: < 200ms
 * 
 * Needs Improvement:
 * - LCP: 2.5s - 4s
 * - FID: 100ms - 300ms
 * - CLS: 0.1 - 0.25
 * - FCP: 1.8s - 3s
 * - TTFB: 600ms - 1.8s
 * - INP: 200ms - 500ms
 * 
 * Poor:
 * - LCP: > 4s
 * - FID: > 300ms
 * - CLS: > 0.25
 * - FCP: > 3s
 * - TTFB: > 1.8s
 * - INP: > 500ms
 */
