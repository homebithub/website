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

export type PerformanceDetail = {
  name: string;
  value: number;
  rating?: string;
  from?: string;
  to?: string;
  initiatorType?: string;
};

function getWebVitalsEndpoint(): string | null {
  if (typeof window === 'undefined') return null;
  const endpoint = (window as any).ENV?.WEB_VITALS_API_URL || (window as any).ENV?.MONITORING_API_URL;
  return typeof endpoint === 'string' && endpoint.trim() ? endpoint.trim() : null;
}

function sendToAnalytics(metric: Metric) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new CustomEvent('homebit:web-vital', { detail: metric }));

  if (process.env.NODE_ENV !== 'production') return;

  const endpoint = getWebVitalsEndpoint();
  if (!endpoint) return;

  const payload = JSON.stringify({
    ...metric,
    pathname: window.location.pathname,
    href: window.location.href,
    userAgent: window.navigator.userAgent,
    timestamp: new Date().toISOString(),
  });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([payload], { type: 'application/json' }));
      return;
    }
    void fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    });
  } catch {
    // Ignore telemetry transport errors.
  }
}

/** Report route and network timings through the same optional telemetry sink. */
export function reportPerformance(detail: PerformanceDetail) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('homebit:performance', { detail }));
  if (process.env.NODE_ENV !== 'production') return;
  const endpoint = getWebVitalsEndpoint();
  if (!endpoint) return;
  const payload = JSON.stringify({
    type: 'performance',
    ...detail,
    pathname: window.location.pathname,
    timestamp: new Date().toISOString(),
  });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([payload], { type: 'application/json' }));
    } else {
      void fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      });
    }
  } catch {
    // Telemetry must never affect navigation.
  }
}

export function trackSlowResources(thresholdMs = 300) {
  if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') return;
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as PerformanceResourceTiming[]) {
        if (entry.duration < thresholdMs) continue;
        const url = new URL(entry.name, window.location.origin);
        // Drop queries because they may contain profile ids or search terms.
        reportPerformance({
          name: 'slow-resource',
          value: Math.round(entry.duration),
          to: `${url.origin}${url.pathname}`,
          initiatorType: entry.initiatorType,
        });
      }
    });
    observer.observe({ type: 'resource', buffered: true });
  } catch {
    // Older browsers can still report Core Web Vitals.
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
    trackSlowResources();
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
