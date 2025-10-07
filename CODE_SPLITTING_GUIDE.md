# Code Splitting Guide

## Overview

Code splitting reduces initial bundle size by loading code only when needed. This guide shows how to implement it in your React Router v7 app.

---

## Quick Start

### 1. Lazy Load Heavy Components

```tsx
import { lazyLoad } from '~/utils/lazyLoad';

// Heavy chart library
const ChartComponent = lazyLoad(() => import('~/components/charts/AnalyticsChart'));

// Rich text editor
const RichTextEditor = lazyLoad(() => import('~/components/RichTextEditor'));

// Use in your component
export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <ChartComponent data={data} />
      <RichTextEditor content={content} />
    </div>
  );
}
```

### 2. Add Prefetching to Links

```tsx
import { Link } from 'react-router';

// Prefetch on hover (intent)
<Link to="/dashboard" prefetch="intent">
  Dashboard
</Link>

// Prefetch immediately
<Link to="/profile" prefetch="render">
  Profile
</Link>

// Prefetch when in viewport
<Link to="/settings" prefetch="viewport">
  Settings
</Link>
```

---

## Components to Lazy Load

### High Priority (Large Impact)

1. **Chart Libraries** (chart.js, recharts)
   ```tsx
   const AnalyticsChart = lazyLoad(() => import('~/components/charts/AnalyticsChart'));
   ```

2. **Rich Text Editors** (TinyMCE, Quill)
   ```tsx
   const RichTextEditor = lazyLoad(() => import('@tinymce/tinymce-react'));
   ```

3. **QR Code Generator**
   ```tsx
   const QRCode = lazyLoad(() => import('qrcode.react'));
   ```

4. **Canvas/Animation Libraries** (canvas-confetti, framer-motion heavy components)
   ```tsx
   const ConfettiAnimation = lazyLoad(() => import('~/components/ConfettiAnimation'));
   ```

5. **File Upload Components** (react-dropzone)
   ```tsx
   const FileUploader = lazyLoad(() => import('~/components/FileUploader'));
   ```

### Medium Priority

1. **Modal Dialogs** (only loaded when opened)
   ```tsx
   const ProfileModal = lazyLoad(() => import('~/components/modals/ProfileModal'));
   ```

2. **Complex Forms** (multi-step forms)
   ```tsx
   const MultiStepForm = lazyLoad(() => import('~/components/forms/MultiStepForm'));
   ```

3. **Data Tables** (large tables with sorting/filtering)
   ```tsx
   const DataTable = lazyLoad(() => import('~/components/DataTable'));
   ```

### Low Priority

1. **Icons** (if using large icon libraries)
   ```tsx
   // Instead of importing all icons
   import * as Icons from 'react-icons/fa'; // ❌ Large bundle
   
   // Import only what you need
   import { FaUser, FaHome } from 'react-icons/fa'; // ✅ Smaller bundle
   ```

---

## Prefetching Strategies

### 1. Intent-based Prefetching (Recommended)

Prefetches when user hovers over link (best balance):

```tsx
<Link to="/dashboard" prefetch="intent">
  Dashboard
</Link>
```

**When to use:** Navigation links, frequently accessed pages

### 2. Render-based Prefetching

Prefetches as soon as link is rendered:

```tsx
<Link to="/profile" prefetch="render">
  Profile
</Link>
```

**When to use:** High-probability next pages (e.g., next step in a flow)

### 3. Viewport-based Prefetching

Prefetches when link enters viewport:

```tsx
<Link to="/settings" prefetch="viewport">
  Settings
</Link>
```

**When to use:** Links below the fold, footer links

### 4. No Prefetching

Don't prefetch (default):

```tsx
<Link to="/rarely-used" prefetch="none">
  Rarely Used Page
</Link>
```

**When to use:** Rarely accessed pages, large pages

---

## Loading States

### Spinner (Simple)

```tsx
import { LoadingSpinner } from '~/utils/lazyLoad';

const HeavyComponent = lazyLoad(
  () => import('~/components/HeavyComponent'),
  { fallback: <LoadingSpinner size="lg" /> }
);
```

### Skeleton Loader (Better UX)

```tsx
import { SkeletonLoader } from '~/utils/lazyLoad';

const ContentComponent = lazyLoad(
  () => import('~/components/ContentComponent'),
  { fallback: <SkeletonLoader /> }
);
```

### Custom Fallback

```tsx
const CustomFallback = (
  <div className="p-8 text-center">
    <p className="text-gray-600">Loading chart...</p>
  </div>
);

const Chart = lazyLoad(
  () => import('~/components/Chart'),
  { fallback: CustomFallback }
);
```

---

## Real-World Examples

### Example 1: Dashboard with Charts

```tsx
import { lazyLoad, SkeletonLoader } from '~/utils/lazyLoad';

// Lazy load heavy chart component
const AnalyticsChart = lazyLoad(
  () => import('~/components/charts/AnalyticsChart'),
  { fallback: <SkeletonLoader /> }
);

export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Chart loads only when needed */}
      <AnalyticsChart data={analyticsData} />
    </div>
  );
}
```

### Example 2: Profile with Image Upload

```tsx
import { lazyLoad, LoadingSpinner } from '~/utils/lazyLoad';

// Lazy load file upload component
const ImageUploader = lazyLoad(
  () => import('~/components/ImageUploader'),
  { fallback: <LoadingSpinner /> }
);

export default function Profile() {
  const [showUploader, setShowUploader] = useState(false);
  
  return (
    <div>
      <h1>Profile</h1>
      
      <button onClick={() => setShowUploader(true)}>
        Upload Photo
      </button>
      
      {/* Only loads when user clicks upload */}
      {showUploader && <ImageUploader />}
    </div>
  );
}
```

### Example 3: Navigation with Prefetching

```tsx
import { Link } from 'react-router';

export function Navigation() {
  return (
    <nav>
      {/* Prefetch on hover - instant navigation */}
      <Link to="/dashboard" prefetch="intent">
        Dashboard
      </Link>
      
      <Link to="/profile" prefetch="intent">
        Profile
      </Link>
      
      {/* Don't prefetch rarely used pages */}
      <Link to="/admin" prefetch="none">
        Admin
      </Link>
    </nav>
  );
}
```

---

## Bundle Analysis

### Run Analysis

```bash
chmod +x analyze_bundle.sh
./analyze_bundle.sh
```

### What to Look For

1. **Large bundles** (>500KB) - candidates for splitting
2. **Duplicate code** - shared dependencies
3. **Unused dependencies** - remove from package.json

### Optimization Checklist

- [ ] Chart libraries lazy loaded
- [ ] Rich text editors lazy loaded
- [ ] QR code generator lazy loaded
- [ ] File upload components lazy loaded
- [ ] Navigation links have prefetch="intent"
- [ ] Modal dialogs lazy loaded
- [ ] Large icon libraries tree-shaken
- [ ] Unused dependencies removed

---

## Performance Impact

### Before Code Splitting

- **Initial Bundle:** 1.5MB
- **Time to Interactive:** 3-4s
- **First Load:** Slow

### After Code Splitting

- **Initial Bundle:** 500KB (67% smaller)
- **Time to Interactive:** 1-1.5s (2-3x faster)
- **First Load:** Fast
- **Navigation:** Instant (with prefetching)

---

## Best Practices

### ✅ Do

- Lazy load heavy third-party libraries
- Use prefetch="intent" for navigation links
- Provide loading fallbacks
- Analyze bundle size regularly
- Remove unused dependencies

### ❌ Don't

- Lazy load critical above-the-fold content
- Over-split (too many small chunks)
- Forget loading states
- Prefetch everything (wastes bandwidth)

---

## Troubleshooting

### Issue: Component not loading

**Solution:** Check import path and ensure component is exported as default

```tsx
// Component file
export default function MyComponent() { ... }

// Lazy load
const MyComponent = lazyLoad(() => import('~/components/MyComponent'));
```

### Issue: Prefetching not working

**Solution:** Ensure React Router v7 is properly configured

```tsx
// Check react-router.config.ts
export default {
  ssr: true, // SSR must be enabled for prefetching
};
```

### Issue: Loading state flickers

**Solution:** Add minimum delay or use skeleton loader

```tsx
const Component = lazyLoad(
  () => import('~/components/Component'),
  { fallback: <SkeletonLoader /> } // Better than spinner
);
```

---

## Next Steps

1. **Identify heavy components** in your app
2. **Implement lazy loading** for top 5 heaviest
3. **Add prefetching** to all navigation links
4. **Run bundle analysis** to measure impact
5. **Monitor Web Vitals** for improvements

---

## Resources

- [React Router Prefetching](https://reactrouter.com/start/framework/data-loading#prefetching)
- [React.lazy Documentation](https://react.dev/reference/react/lazy)
- [Web Vitals](https://web.dev/vitals/)

---

**Start with the heaviest components first for maximum impact!** 🚀
