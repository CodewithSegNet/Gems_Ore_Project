# Performance Optimization Guide

This guide covers performance optimization strategies for the Gems Ore Admin Dashboard.

## 📊 Current Performance Status

### Build Configuration ✅
- [x] Code splitting enabled (lazy loading)
- [x] Tree shaking enabled
- [x] Minification enabled (esbuild)
- [x] CSS code splitting enabled
- [x] Manual vendor chunks configured
- [x] Optimized asset naming

### Runtime Performance ✅
- [x] React lazy loading for routes
- [x] Suspense boundaries for loading states
- [x] Error boundaries for error handling
- [x] Production-safe logging
- [x] Performance monitoring utilities

## 🎯 Performance Targets

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s ⭐
- **FID (First Input Delay)**: < 100ms ⭐
- **CLS (Cumulative Layout Shift)**: < 0.1 ⭐

### Lighthouse Scores (Target: > 90)
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

### Bundle Size Targets
- Main bundle: < 200KB (gzipped)
- Vendor chunks: < 300KB (gzipped)
- Total initial load: < 500KB (gzipped)

## 🚀 Implemented Optimizations

### 1. Code Splitting

**Route-based splitting:**
```typescript
// /src/app/routes.tsx
const DashboardOverview = lazy(() => 
  import("./pages/dashboard-overview").then(module => ({ 
    default: module.DashboardOverview 
  }))
);
```

**Benefits:**
- Reduces initial bundle size
- Loads pages on-demand
- Improves Time to Interactive (TTI)

### 2. Vendor Chunk Splitting

**Configuration in vite.config.ts:**
```typescript
manualChunks: {
  'react-vendor': ['react', 'react-dom', 'react-router'],
  'ui-vendor': ['@radix-ui/...'],
  'chart-vendor': ['recharts'],
  'form-vendor': ['react-hook-form'],
  'utils': ['clsx', 'class-variance-authority', 'tailwind-merge'],
}
```

**Benefits:**
- Better caching (vendor code changes less frequently)
- Parallel downloads
- Reduced main bundle size

### 3. Asset Optimization

**Configured in vite.config.ts:**
```typescript
assetFileNames: (assetInfo) => {
  // Organize assets by type
  if (/png|jpe?g|svg|gif/.test(ext)) {
    return `assets/images/[name]-[hash][extname]`;
  } else if (/woff|woff2/.test(ext)) {
    return `assets/fonts/[name]-[hash][extname]`;
  }
}
```

**Benefits:**
- Organized build output
- Fingerprinted files for caching
- Separate image/font directories

### 4. Performance Monitoring

**Utilities in /src/app/utils/performance.ts:**
```typescript
import { performanceMonitor } from './utils/performance';

// Measure operation
performanceMonitor.measureAsync('fetchProducts', async () => {
  return await api.products.getAll();
});

// Get memory usage
performanceMonitor.getMemoryUsage();
```

**Features:**
- Operation timing
- Memory usage tracking
- Component render timing
- Page load performance logging

## 📈 Additional Optimizations

### 1. Image Optimization

**Current State:**
- Using standard image formats (JPG, PNG)
- Basic validation

**Recommended Improvements:**
```typescript
// Use modern formats
const ACCEPTED_FORMATS = ['image/webp', 'image/avif', 'image/jpeg'];

// Implement lazy loading
<img 
  loading="lazy" 
  src={product.image} 
  alt={product.name}
/>

// Use responsive images
<img
  srcSet={`
    ${product.image_small} 400w,
    ${product.image_medium} 800w,
    ${product.image_large} 1200w
  `}
  sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
  src={product.image_medium}
  alt={product.name}
/>
```

### 2. React Performance

**Memoization:**
```typescript
import { memo, useMemo, useCallback } from 'react';

// Memoize expensive components
const ProductCard = memo(({ product }) => {
  return <div>...</div>;
});

// Memoize expensive computations
const filteredProducts = useMemo(() => {
  return products.filter(p => p.category === selectedCategory);
}, [products, selectedCategory]);

// Memoize callbacks
const handleClick = useCallback(() => {
  // handle click
}, [dependencies]);
```

### 3. Debouncing & Throttling

**Using performance utilities:**
```typescript
import { debounce, throttle } from './utils/performance';

// Debounce search input
const debouncedSearch = debounce((query: string) => {
  searchProducts(query);
}, 300);

// Throttle scroll handler
const throttledScroll = throttle(() => {
  handleScroll();
}, 100);
```

### 4. Virtual Scrolling

**For long lists:**
```bash
npm install react-window
```

```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={products.length}
  itemSize={80}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <ProductRow product={products[index]} />
    </div>
  )}
</FixedSizeList>
```

### 5. Data Caching

**Using React Query (recommended for production):**
```bash
npm install @tanstack/react-query
```

```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ['products'],
  queryFn: () => api.products.getAll(),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

### 6. Service Worker

**For offline support and caching:**
```typescript
// public/sw.js
const CACHE_NAME = 'gemsore-admin-v1';
const urlsToCache = [
  '/',
  '/assets/index.css',
  '/assets/index.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

## 🔧 Build Optimization

### 1. Analyze Bundle Size

**Install bundle analyzer:**
```bash
npm install --save-dev rollup-plugin-visualizer
```

**Update vite.config.ts:**
```typescript
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});
```

**Run:**
```bash
npm run build
# Opens stats.html showing bundle composition
```

### 2. Reduce Dependencies

**Audit dependencies:**
```bash
# Check bundle impact
npx vite-bundle-visualizer

# Find duplicate dependencies
npx npm-check-duplicates

# Remove unused dependencies
npx depcheck
```

### 3. Tree Shaking

**Ensure proper imports:**
```typescript
// ❌ Bad - imports entire library
import _ from 'lodash';

// ✅ Good - imports only what's needed
import { debounce } from 'lodash-es';

// ✅ Better - use individual packages
import debounce from 'lodash.debounce';
```

## 🌐 Network Optimization

### 1. HTTP/2 Server Push

**nginx configuration:**
```nginx
server {
    listen 443 ssl http2;
    
    # Preload critical resources
    location / {
        add_header Link "</assets/index.css>; rel=preload; as=style";
        add_header Link "</assets/index.js>; rel=preload; as=script";
    }
}
```

### 2. Compression

**Enable gzip/brotli:**
```nginx
# Gzip
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

# Brotli (if available)
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css text/xml text/javascript application/javascript application/json;
```

### 3. CDN Configuration

**For static assets:**
```typescript
// vite.config.ts
export default defineConfig({
  base: process.env.VITE_CDN_URL || '/',
  build: {
    assetsInlineLimit: 4096, // Inline assets < 4KB
  },
});
```

### 4. Cache Headers

**nginx configuration:**
```nginx
# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Don't cache HTML
location ~* \.html$ {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

## 📱 Mobile Performance

### 1. Responsive Images

```typescript
<picture>
  <source
    media="(max-width: 640px)"
    srcSet={product.imageMobile}
  />
  <source
    media="(max-width: 1024px)"
    srcSet={product.imageTablet}
  />
  <img src={product.imageDesktop} alt={product.name} />
</picture>
```

### 2. Touch Optimization

```typescript
// Prevent double-tap zoom on buttons
.no-double-tap {
  touch-action: manipulation;
}

// Faster click events
<button onClick={handleClick} style={{ touchAction: 'manipulation' }}>
  Click me
</button>
```

### 3. Reduce JavaScript

```typescript
// Use CSS animations instead of JS when possible
.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

## 🔍 Monitoring

### 1. Real User Monitoring (RUM)

**Using web-vitals:**
```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics service
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### 2. Performance Budget

**Set in vite.config.ts:**
```typescript
build: {
  chunkSizeWarningLimit: 500, // Warn if chunk > 500KB
  rollupOptions: {
    output: {
      // Fail build if exceeds budget
      manualChunks(id) {
        if (id.includes('node_modules')) {
          // Ensure vendor chunks stay reasonable
          return 'vendor';
        }
      },
    },
  },
}
```

### 3. Lighthouse CI

**Add to CI/CD:**
```yaml
# .github/workflows/performance.yml
name: Performance
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci && npm run build
      - uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:4173
          uploadArtifacts: true
```

## 📊 Performance Checklist

### Pre-Deployment
- [ ] Run Lighthouse audit (all scores > 90)
- [ ] Check bundle sizes (< 500KB total gzipped)
- [ ] Test on slow 3G network
- [ ] Test on low-end devices
- [ ] Verify code splitting working
- [ ] Check for console errors/warnings
- [ ] Verify images are optimized
- [ ] Test lazy loading
- [ ] Verify caching headers
- [ ] Check compression enabled

### Post-Deployment
- [ ] Monitor Core Web Vitals
- [ ] Track bundle sizes over time
- [ ] Monitor error rates
- [ ] Check slow API endpoints
- [ ] Review user experience metrics
- [ ] Monitor memory leaks
- [ ] Track Time to Interactive
- [ ] Review server response times

## 🎓 Resources

- [web.dev Performance](https://web.dev/performance/)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

---

**Last Updated:** March 6, 2026
