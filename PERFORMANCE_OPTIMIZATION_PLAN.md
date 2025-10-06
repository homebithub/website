# Performance Optimization Plan - React Router v7

## Overview

Comprehensive plan to maximize website performance using React Router v7 (Remix) best practices including SSR, code splitting, prefetching, caching, and optimization techniques.

**Estimated Total Time:** 8-12 hours
**Priority:** High
**Impact:** Significant improvement in load times, SEO, and user experience

---

## Phase 1: Server-Side Rendering (SSR) Optimization

### Current State
- ✅ SSR enabled in `react-router.config.ts`
- ⏳ Not optimized for all pages
- ⏳ No streaming implemented
- ⏳ No deferred loading

### Goals
- Implement proper SSR for all routes
- Add streaming for faster initial page loads
- Use deferred loading for non-critical data
- Optimize data fetching in loaders

### Tasks

#### 1.1 Optimize Loader Functions (All Pages)
**Time:** 3-4 hours

**Current Problem:**
```tsx
// Bad: Client-side fetch
export default function Page() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/data').then(res => setData(res));
  }, []);
  
  return <div>{data?.title}</div>;
}
```

**Solution:**
```tsx
// Good: Server-side loader
import type { Route } from "./+types/page";

export async function loader({ request }: Route.LoaderArgs) {
  const data = await fetch('https://api.homexpert.co.ke/api/data', {
    headers: { cookie: request.headers.get('cookie') }
  });
  
  return data.json();
}

export default function Page({ loaderData }: Route.ComponentProps) {
  return <div>{loaderData.title}</div>;
}
```

**Pages to Update:**
- [ ] All auth pages (login, signup, etc.)
- [ ] All public pages (about, contact, etc.)
- [ ] Bureau dashboard pages
- [ ] Household dashboard pages
- [ ] Househelp dashboard pages
- [ ] Profile and settings pages

**Benefits:**
- ✅ Faster initial page load
- ✅ Better SEO (content available on first render)
- ✅ No loading spinners for initial data
- ✅ Works without JavaScript

---

#### 1.2 Implement Streaming SSR
**Time:** 2-3 hours

**What:** Send HTML to browser as it's generated, don't wait for all data

**Implementation:**
```tsx
// app/routes/dashboard.tsx
import { defer } from "react-router";
import { Await } from "react-router";
import { Suspense } from "react";

export async function loader() {
  // Fast data - wait for it
  const criticalData = await fetchCriticalData();
  
  // Slow data - defer it
  const slowData = fetchSlowData(); // Don't await!
  
  return defer({
    critical: criticalData,
    slow: slowData, // Promise
  });
}

export default function Dashboard({ loaderData }) {
  return (
    <div>
      {/* Renders immediately */}
      <h1>{loaderData.critical.title}</h1>
      
      {/* Streams in when ready */}
      <Suspense fallback={<Skeleton />}>
        <Await resolve={loaderData.slow}>
          {(data) => <SlowComponent data={data} />}
        </Await>
      </Suspense>
    </div>
  );
}
```

**Pages to Implement:**
- [ ] Dashboard pages (defer analytics, stats)
- [ ] Profile pages (defer activity feed)
- [ ] Bureau pages (defer househelp list)
- [ ] Household pages (defer shortlist)

**Benefits:**
- ✅ Faster Time to First Byte (TTFB)
- ✅ Progressive rendering
- ✅ Better perceived performance

---

#### 1.3 Add Resource Preloading
**Time:** 1 hour

**What:** Preload critical resources (fonts, images, CSS)

**Implementation:**
```tsx
// app/root.tsx
import type { Route } from "./+types/root";

export const links: Route.LinksFunction = () => [
  // Preload critical fonts
  {
    rel: "preload",
    href: "/fonts/inter-var.woff2",
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
  // Preload critical images
  {
    rel: "preload",
    href: "/logo.png",
    as: "image",
  },
  // Stylesheets
  { rel: "stylesheet", href: "/tailwind.css" },
];
```

**Resources to Preload:**
- [ ] Custom fonts
- [ ] Logo and hero images
- [ ] Critical CSS
- [ ] Above-the-fold images

---

## Phase 2: Code Splitting & Lazy Loading

### Goals
- Reduce initial bundle size
- Load code only when needed
- Implement route-based code splitting

### Tasks

#### 2.1 Lazy Load Heavy Components
**Time:** 2-3 hours

**Implementation:**
```tsx
// Instead of:
import { TinyMCE } from '@tinymce/tinymce-react';

// Do:
import { lazy, Suspense } from 'react';
const TinyMCE = lazy(() => import('@tinymce/tinymce-react'));

export default function Editor() {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <TinyMCE />
    </Suspense>
  );
}
```

**Components to Lazy Load:**
- [ ] TinyMCE editor
- [ ] Chart.js components
- [ ] Image upload/crop components
- [ ] PDF viewer
- [ ] Video player
- [ ] Large modals
- [ ] Calendar/date pickers

**Benefits:**
- ✅ Smaller initial bundle
- ✅ Faster page load
- ✅ Better Core Web Vitals

---

#### 2.2 Route-Based Code Splitting
**Time:** 1 hour

**Current:** Already implemented via React Router's file-based routing ✅

**Verify:**
```bash
npm run build
# Check build output for separate chunks per route
```

**Optimize Further:**
```tsx
// vite.config.ts - already done ✅
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            if (id.includes('chart.js')) {
              return 'charts';
            }
            // etc.
          }
        },
      },
    },
  },
});
```

---

#### 2.3 Dynamic Imports for Conditional Features
**Time:** 1-2 hours

**Implementation:**
```tsx
// Load Google Maps only when needed
async function loadGoogleMaps() {
  if (typeof window !== 'undefined' && !window.google) {
    await import('google-maps-script');
  }
}

// Load payment SDK only on checkout
async function loadPaymentSDK() {
  const { PaymentSDK } = await import('./payment-sdk');
  return PaymentSDK;
}
```

**Features to Dynamically Import:**
- [ ] Google Maps (location picker)
- [ ] Payment SDKs
- [ ] Social media widgets
- [ ] Analytics scripts
- [ ] Chat widgets

---

## Phase 3: Data Fetching Optimization

### Goals
- Minimize API calls
- Implement caching strategies
- Use parallel data fetching
- Avoid waterfalls

### Tasks

#### 3.1 Implement Parallel Data Fetching
**Time:** 2-3 hours

**Bad (Sequential - Waterfall):**
```tsx
export async function loader() {
  const user = await fetchUser();
  const profile = await fetchProfile(user.id); // Waits for user
  const settings = await fetchSettings(user.id); // Waits for profile
  
  return { user, profile, settings };
}
```

**Good (Parallel):**
```tsx
export async function loader() {
  const [user, profile, settings] = await Promise.all([
    fetchUser(),
    fetchProfile(),
    fetchSettings(),
  ]);
  
  return { user, profile, settings };
}
```

**Pages to Optimize:**
- [ ] Dashboard pages (multiple data sources)
- [ ] Profile pages (user + profile + images)
- [ ] Bureau pages (stats + househelps + commercials)

---

#### 3.2 Add HTTP Caching Headers
**Time:** 1-2 hours

**Implementation:**
```tsx
// app/routes/public/about.tsx
export const headers: Route.HeadersFunction = () => ({
  "Cache-Control": "public, max-age=3600, s-maxage=86400",
});

// app/routes/profile.tsx
export const headers: Route.HeadersFunction = () => ({
  "Cache-Control": "private, max-age=300",
});

// app/routes/api/data.tsx
export const headers: Route.HeadersFunction = () => ({
  "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
});
```

**Caching Strategy:**
- **Public pages:** Cache for 1 hour (browser), 1 day (CDN)
- **User pages:** Cache for 5 minutes (private)
- **API data:** Cache for 1 minute, stale-while-revalidate
- **Static assets:** Cache for 1 year with versioning

**Pages to Add Caching:**
- [ ] All public pages
- [ ] Static content pages
- [ ] API routes
- [ ] Image routes

---

#### 3.3 Implement Client-Side Caching
**Time:** 2 hours

**Implementation:**
```tsx
// app/utils/cache.ts
const cache = new Map();

export async function cachedFetch(url: string, ttl = 60000) {
  const cached = cache.get(url);
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  
  const data = await fetch(url).then(r => r.json());
  cache.set(url, { data, timestamp: Date.now() });
  
  return data;
}

// Usage in loader
export async function loader() {
  const data = await cachedFetch('/api/data', 60000); // 1 min cache
  return data;
}
```

**Or use React Router's built-in caching:**
```tsx
// React Router automatically caches loader data
// Revalidate on navigation
export const shouldRevalidate: ShouldRevalidateFunction = ({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}) => {
  // Don't revalidate if just hash changed
  if (currentUrl.pathname === nextUrl.pathname) {
    return false;
  }
  return defaultShouldRevalidate;
};
```

---

## Phase 4: Image Optimization

### Goals
- Optimize image loading
- Implement lazy loading
- Use modern formats (WebP, AVIF)
- Responsive images

### Tasks

#### 4.1 Implement Image Lazy Loading
**Time:** 1-2 hours

**Implementation:**
```tsx
// app/components/OptimizedImage.tsx
export function OptimizedImage({ src, alt, ...props }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
}
```

**Update All Images:**
- [ ] Profile pictures
- [ ] Househelp photos
- [ ] Service images
- [ ] Gallery images
- [ ] Background images

---

#### 4.2 Add Image CDN & Optimization
**Time:** 2-3 hours

**Implementation:**
```tsx
// app/utils/image.ts
export function optimizeImage(url: string, options: {
  width?: number;
  height?: number;
  format?: 'webp' | 'avif' | 'jpg';
  quality?: number;
}) {
  const params = new URLSearchParams({
    url,
    w: options.width?.toString() || '',
    h: options.height?.toString() || '',
    f: options.format || 'webp',
    q: options.quality?.toString() || '80',
  });
  
  return `/api/images/optimize?${params}`;
}

// Usage
<img 
  src={optimizeImage('/uploads/photo.jpg', { 
    width: 400, 
    format: 'webp' 
  })} 
  alt="Profile"
/>
```

**Or use a service:**
- Cloudinary
- Imgix
- Cloudflare Images
- AWS CloudFront

---

#### 4.3 Implement Responsive Images
**Time:** 1 hour

**Implementation:**
```tsx
<img
  src="/image-400.jpg"
  srcSet="
    /image-400.jpg 400w,
    /image-800.jpg 800w,
    /image-1200.jpg 1200w
  "
  sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
  alt="Responsive image"
  loading="lazy"
/>
```

---

## Phase 5: Prefetching & Link Optimization

### Goals
- Prefetch pages before user clicks
- Optimize navigation
- Reduce perceived load time

### Tasks

#### 5.1 Enable Link Prefetching
**Time:** 1 hour

**Implementation:**
```tsx
// React Router automatically prefetches on hover/focus
import { Link } from "react-router";

// Prefetch on hover (default)
<Link to="/dashboard" prefetch="intent">
  Dashboard
</Link>

// Prefetch immediately
<Link to="/important" prefetch="render">
  Important Page
</Link>

// Don't prefetch
<Link to="/heavy" prefetch="none">
  Heavy Page
</Link>
```

**Strategy:**
- **High priority pages:** `prefetch="render"` (dashboard, profile)
- **Normal pages:** `prefetch="intent"` (most links)
- **Heavy pages:** `prefetch="none"` (large data pages)

**Update Links:**
- [ ] Navigation menu links
- [ ] Dashboard links
- [ ] Call-to-action buttons
- [ ] Pagination links

---

#### 5.2 Implement Viewport Prefetching
**Time:** 1-2 hours

**Implementation:**
```tsx
// Prefetch links when they enter viewport
import { useEffect, useRef } from 'react';

export function PrefetchOnView({ to, children }) {
  const ref = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Prefetch the route
          window.fetch(to);
        }
      });
    });
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, [to]);
  
  return <div ref={ref}>{children}</div>;
}
```

---

## Phase 6: Bundle Size Optimization

### Goals
- Reduce JavaScript bundle size
- Remove unused code
- Optimize dependencies

### Tasks

#### 6.1 Analyze Bundle Size
**Time:** 30 minutes

**Tools:**
```bash
# Install bundle analyzer
npm install -D rollup-plugin-visualizer

# Add to vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    reactRouter(),
    visualizer({ open: true }),
  ],
});

# Build and analyze
npm run build
```

**Identify:**
- [ ] Largest dependencies
- [ ] Duplicate dependencies
- [ ] Unused dependencies

---

#### 6.2 Replace Heavy Dependencies
**Time:** 2-3 hours

**Common Replacements:**
```bash
# Instead of moment.js (288KB)
npm install date-fns  # 13KB

# Instead of lodash (full)
npm install lodash-es  # Tree-shakeable

# Instead of axios
# Use native fetch (already available)
```

**Dependencies to Review:**
- [ ] `moment-timezone` → `date-fns-tz`
- [ ] `lodash` → `lodash-es` or native methods
- [ ] `axios` → native `fetch`
- [ ] Heavy icon libraries → selective imports

---

#### 6.3 Tree Shaking Optimization
**Time:** 1 hour

**Implementation:**
```tsx
// Bad: Imports entire library
import _ from 'lodash';
import * as Icons from '@heroicons/react';

// Good: Import only what you need
import debounce from 'lodash/debounce';
import { UserIcon, HomeIcon } from '@heroicons/react/24/outline';
```

**Update Imports:**
- [ ] Lodash imports
- [ ] Icon imports
- [ ] Utility library imports

---

## Phase 7: Performance Monitoring

### Goals
- Track performance metrics
- Monitor Core Web Vitals
- Identify bottlenecks

### Tasks

#### 7.1 Add Web Vitals Tracking
**Time:** 1 hour

**Implementation:**
```tsx
// app/entry.client.tsx
import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics service
  console.log(metric);
}

onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onLCP(sendToAnalytics);
onFCP(sendToAnalytics);
onTTFB(sendToAnalytics);
```

**Metrics to Track:**
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- FCP (First Contentful Paint)
- TTFB (Time to First Byte)

---

#### 7.2 Add Performance Budgets
**Time:** 30 minutes

**Implementation:**
```ts
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 500, // Warn if chunk > 500KB
  },
});
```

**Set Budgets:**
- Initial JS: < 200KB
- Total JS: < 500KB
- Images: < 100KB each
- Fonts: < 50KB each

---

## Phase 8: Database & API Optimization

### Goals
- Optimize database queries
- Reduce API response times
- Implement API caching

### Tasks

#### 8.1 Optimize API Endpoints
**Time:** 3-4 hours (Backend work)

**Strategies:**
- Add database indexes
- Implement pagination
- Use SELECT only needed fields
- Add query result caching
- Use connection pooling

**Endpoints to Optimize:**
- [ ] `/api/v1/househelps` (list)
- [ ] `/api/v1/profile/*` (profile data)
- [ ] `/api/v1/shortlists` (shortlists)
- [ ] `/api/v1/images/*` (images)

---

#### 8.2 Implement API Response Caching
**Time:** 2 hours (Backend work)

**Implementation:**
```typescript
// Backend: Add Redis caching
import Redis from 'ioredis';

const redis = new Redis();

async function getCachedData(key: string, fetcher: () => Promise<any>, ttl = 60) {
  const cached = await redis.get(key);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const data = await fetcher();
  await redis.setex(key, ttl, JSON.stringify(data));
  
  return data;
}
```

---

## Implementation Schedule

### Week 1: SSR & Data Fetching
- **Day 1-2:** Phase 1 (SSR Optimization)
- **Day 3:** Phase 3 (Data Fetching)

### Week 2: Code Splitting & Images
- **Day 1:** Phase 2 (Code Splitting)
- **Day 2:** Phase 4 (Image Optimization)

### Week 3: Prefetching & Bundle
- **Day 1:** Phase 5 (Prefetching)
- **Day 2:** Phase 6 (Bundle Size)

### Week 4: Monitoring & Backend
- **Day 1:** Phase 7 (Monitoring)
- **Day 2-3:** Phase 8 (Backend Optimization)

---

## Success Metrics

### Before Optimization (Baseline)
- [ ] Measure current Lighthouse scores
- [ ] Measure current load times
- [ ] Measure current bundle sizes
- [ ] Measure current API response times

### Target Metrics
- **Lighthouse Score:** 90+ (all categories)
- **LCP:** < 2.5s
- **FID:** < 100ms
- **CLS:** < 0.1
- **TTFB:** < 600ms
- **Bundle Size:** < 500KB total
- **API Response:** < 200ms average

### After Optimization
- [ ] Re-measure all metrics
- [ ] Compare improvements
- [ ] Document wins

---

## Quick Wins (Start Tomorrow)

### High Impact, Low Effort

1. **Add Loaders to Auth Pages** (2 hours)
   - Move client-side fetches to server-side loaders
   - Immediate SSR benefit

2. **Enable Link Prefetching** (1 hour)
   - Add `prefetch="intent"` to navigation links
   - Faster page transitions

3. **Add Image Lazy Loading** (1 hour)
   - Add `loading="lazy"` to all images
   - Faster initial page load

4. **Implement HTTP Caching** (1 hour)
   - Add cache headers to public pages
   - Reduce server load

5. **Lazy Load Heavy Components** (2 hours)
   - Lazy load TinyMCE, Charts
   - Smaller initial bundle

**Total Quick Wins Time:** ~7 hours
**Expected Impact:** 30-40% performance improvement

---

## Tools & Resources

### Performance Testing
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)

### Bundle Analysis
- [rollup-plugin-visualizer](https://www.npmjs.com/package/rollup-plugin-visualizer)
- [webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)

### Monitoring
- [web-vitals](https://www.npmjs.com/package/web-vitals)
- Google Analytics
- Sentry Performance Monitoring

### React Router Docs
- [Data Loading](https://reactrouter.com/start/framework/data-loading)
- [Streaming](https://reactrouter.com/start/framework/streaming)
- [Prefetching](https://reactrouter.com/start/framework/prefetching)
- [Performance](https://reactrouter.com/start/framework/performance)

---

## Summary

- **Total Time:** 8-12 hours (spread over 2-4 weeks)
- **Phases:** 8
- **Expected Improvement:** 50-70% faster load times
- **Priority:** Start with Quick Wins, then Phase 1

**Next Session:** Begin with Quick Wins (7 hours of high-impact work)

Good luck! 🚀⚡
