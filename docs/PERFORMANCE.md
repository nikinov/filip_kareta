# Performance Optimization Guide

This document outlines the performance optimizations implemented for the Prague Tour Guide website to achieve excellent Core Web Vitals scores and optimal user experience.

## 🎯 Performance Targets

- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to First Byte (TTFB)**: < 600ms
- **Google PageSpeed Score**: 90+ (mobile and desktop)

## 🚀 Implemented Optimizations

### 1. Next.js Image Optimization

**Location**: `next.config.ts`, `src/components/ui/responsive-image.tsx`

- **WebP/AVIF formats**: Automatic modern format conversion
- **Responsive images**: Multiple device sizes and breakpoints
- **Lazy loading**: Images load only when entering viewport
- **CDN integration**: Optimized delivery through global CDN
- **Blur placeholders**: Smooth loading experience

```typescript
// Example usage
<ResponsiveImage
  src="/tour-image.jpg"
  alt="Prague Castle Tour"
  aspectRatio="landscape"
  width={800}
  height={600}
  priority={false} // Lazy load by default
/>
```

### 2. Lazy Loading Implementation

**Location**: `src/components/ui/lazy-wrapper.tsx`

- **Intersection Observer**: Efficient viewport detection
- **Component lazy loading**: Below-the-fold content loads on demand
- **Progressive enhancement**: Graceful fallbacks for no-JS users
- **Skeleton placeholders**: Visual feedback during loading

```typescript
// Lazy load sections
<LazySection>
  <SocialProofSection />
</LazySection>

// Lazy load individual components
const LazyComponent = withLazyLoading(HeavyComponent);
```

### 3. Static Site Generation (SSG)

**Location**: All page components

- **Tour pages**: `export const dynamic = 'force-static'`
- **Blog pages**: Static generation with 2-hour revalidation
- **Homepage**: Static with 1-hour revalidation
- **Incremental regeneration**: Content updates without full rebuilds

```typescript
// SSG configuration
export const dynamic = 'force-static';
export const revalidate = 3600; // 1 hour
```

### 4. Bundle Optimization

**Location**: `next.config.ts`, `scripts/analyze-bundle.js`

- **Code splitting**: Automatic chunk optimization
- **Tree shaking**: Remove unused code
- **Package optimization**: Optimize imports for lucide-react, etc.
- **Bundle analysis**: Monitor and track bundle sizes

```bash
# Analyze bundle size
npm run analyze
npm run build:analyze
```

### 5. CDN Configuration

**Location**: `src/lib/cdn.ts`

- **Global delivery**: Optimized content delivery worldwide
- **Image optimization**: Dynamic resizing and format conversion
- **Cache headers**: Long-term caching for static assets
- **Fallback support**: Graceful degradation when CDN unavailable

```typescript
// CDN-optimized image URL
const optimizedUrl = getImageUrl('/image.jpg', {
  width: 800,
  quality: 85,
  format: 'webp'
});
```

### 6. Service Worker Caching

**Location**: `public/sw.js`

- **Cache strategies**: Cache-first for static, network-first for dynamic
- **Offline support**: Critical content available offline
- **Background sync**: Retry failed requests when online
- **Cache management**: Automatic cleanup of old cache versions

### 7. Resource Optimization

**Location**: `src/app/layout.tsx`, `src/lib/performance.ts`

- **DNS prefetch**: Preload critical domain connections
- **Resource hints**: Preconnect to essential services
- **Critical CSS**: Inline above-the-fold styles
- **Font optimization**: Preload critical fonts

## 📊 Performance Monitoring

### Web Vitals Collection

**Location**: `src/lib/performance-testing.ts`, `src/app/api/web-vitals/route.ts`

- **Real-time metrics**: Collect LCP, FID, CLS, FCP, TTFB
- **User experience tracking**: Monitor actual user performance
- **Performance budgets**: Automated alerts for regressions
- **Analytics integration**: Send metrics to Google Analytics

### Bundle Analysis

**Location**: `scripts/analyze-bundle.js`

- **Size monitoring**: Track JavaScript and CSS bundle sizes
- **Optimization recommendations**: Automated suggestions
- **Performance budgets**: Fail builds that exceed limits
- **Chunk analysis**: Identify large dependencies

## 🛠️ Usage Instructions

### Development

```bash
# Start development with performance monitoring
npm run dev

# Analyze current bundle size
npm run analyze

# Build and analyze production bundle
npm run build:analyze
```

### Production Deployment

1. **Configure CDN**: Set environment variables for CDN URLs
2. **Enable monitoring**: Set `NEXT_PUBLIC_PERFORMANCE_MONITORING=true`
3. **Set up analytics**: Configure Google Analytics for Web Vitals
4. **Monitor metrics**: Use `/api/web-vitals` endpoint for data collection

### Environment Variables

```env
# CDN Configuration
NEXT_PUBLIC_CDN_ENABLED=true
NEXT_PUBLIC_IMAGES_CDN=https://cdn.example.com/images
NEXT_PUBLIC_STATIC_CDN=https://cdn.example.com/static
NEXT_PUBLIC_VIDEO_CDN=https://cdn.example.com/videos

# Performance Monitoring
NEXT_PUBLIC_PERFORMANCE_MONITORING=true
NEXT_PUBLIC_WEB_VITALS_ENDPOINT=/api/web-vitals
```

## 🔍 Performance Testing

### Lighthouse Testing

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Test performance
lighthouse https://guidefilip-prague.com --output=html --output-path=./lighthouse-report.html
```

### Core Web Vitals Testing

1. **Chrome DevTools**: Use Performance tab for detailed analysis
2. **PageSpeed Insights**: Test real-world performance data
3. **Web Vitals Extension**: Monitor metrics during development
4. **Automated testing**: Include performance tests in CI/CD

## 📈 Expected Performance Improvements

- **Load time reduction**: 40-60% faster initial page loads
- **Image optimization**: 70-80% smaller image file sizes
- **Bundle size**: 30-50% reduction in JavaScript bundle size
- **Cache hit ratio**: 90%+ for returning visitors
- **Core Web Vitals**: All metrics in "Good" range

## 🔧 Troubleshooting

### Common Issues

1. **Large bundle size**: Use `npm run analyze` to identify heavy dependencies
2. **Slow image loading**: Check CDN configuration and image optimization
3. **Poor CLS scores**: Ensure all images have explicit dimensions
4. **High TTFB**: Optimize server response time and database queries

### Performance Debugging

```typescript
// Enable performance logging in development
if (process.env.NODE_ENV === 'development') {
  import('@/lib/performance-testing').then(({ collectWebVitals }) => {
    collectWebVitals().then(metrics => {
      console.table(metrics);
    });
  });
}
```

## 📚 Additional Resources

- [Next.js Performance Documentation](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web Vitals Guide](https://web.dev/vitals/)
- [Image Optimization Best Practices](https://web.dev/fast/#optimize-your-images)
- [Core Web Vitals Tools](https://web.dev/vitals-tools/)

## 🎉 Performance Checklist

- [x] Next.js Image optimization configured
- [x] Lazy loading implemented for below-the-fold content
- [x] Static Site Generation enabled for tour and blog pages
- [x] Bundle size optimization with code splitting
- [x] CDN configuration for global content delivery
- [x] Service Worker caching strategy
- [x] Web Vitals monitoring and reporting
- [x] Performance testing utilities
- [x] Resource hints and preloading
- [x] Progressive Web App manifest
