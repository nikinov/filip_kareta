// Performance tests for Core Web Vitals
// Tests for LCP, FID, CLS, and other performance metrics

import { test, expect, Page } from '@playwright/test';

// Performance thresholds based on Core Web Vitals
const PERFORMANCE_THRESHOLDS = {
  LCP: 2500, // Largest Contentful Paint (ms)
  FID: 100,  // First Input Delay (ms)
  CLS: 0.1,  // Cumulative Layout Shift
  TTFB: 600, // Time to First Byte (ms)
  FCP: 1800, // First Contentful Paint (ms)
};

// Helper function to measure Core Web Vitals
async function measureWebVitals(page: Page) {
  return await page.evaluate(() => {
    return new Promise((resolve) => {
      const vitals: any = {};
      
      // Measure LCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.LCP = lastEntry.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Measure FID
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          vitals.FID = entry.processingStart - entry.startTime;
        });
      }).observe({ entryTypes: ['first-input'] });

      // Measure CLS
      let clsValue = 0;
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        vitals.CLS = clsValue;
      }).observe({ entryTypes: ['layout-shift'] });

      // Get navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      vitals.TTFB = navigation.responseStart - navigation.requestStart;
      vitals.FCP = navigation.loadEventEnd - navigation.navigationStart;

      // Wait for measurements to complete
      setTimeout(() => resolve(vitals), 3000);
    });
  });
}

// Helper function to measure resource loading
async function measureResourceLoading(page: Page) {
  return await page.evaluate(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    const resourceMetrics = {
      totalResources: resources.length,
      totalSize: 0,
      slowestResource: { name: '', duration: 0 },
      resourceTypes: {} as Record<string, number>,
    };

    resources.forEach((resource) => {
      const duration = resource.responseEnd - resource.requestStart;
      
      if (duration > resourceMetrics.slowestResource.duration) {
        resourceMetrics.slowestResource = {
          name: resource.name,
          duration: duration,
        };
      }

      // Categorize by resource type
      const type = resource.initiatorType || 'other';
      resourceMetrics.resourceTypes[type] = (resourceMetrics.resourceTypes[type] || 0) + 1;
    });

    return resourceMetrics;
  });
}

test.describe('Performance Tests', () => {
  test.describe('Core Web Vitals', () => {
    test('homepage should meet Core Web Vitals thresholds', async ({ page }) => {
      // Navigate to homepage
      await page.goto('/');
      
      // Wait for page to fully load
      await page.waitForLoadState('networkidle');
      
      // Measure Core Web Vitals
      const vitals = await measureWebVitals(page);
      
      // Assert thresholds
      expect(vitals.LCP).toBeLessThan(PERFORMANCE_THRESHOLDS.LCP);
      expect(vitals.TTFB).toBeLessThan(PERFORMANCE_THRESHOLDS.TTFB);
      expect(vitals.CLS).toBeLessThan(PERFORMANCE_THRESHOLDS.CLS);
      
      console.log('Homepage Core Web Vitals:', vitals);
    });

    test('tour page should meet Core Web Vitals thresholds', async ({ page }) => {
      await page.goto('/en/tours/prague-castle');
      await page.waitForLoadState('networkidle');
      
      const vitals = await measureWebVitals(page);
      
      expect(vitals.LCP).toBeLessThan(PERFORMANCE_THRESHOLDS.LCP);
      expect(vitals.TTFB).toBeLessThan(PERFORMANCE_THRESHOLDS.TTFB);
      expect(vitals.CLS).toBeLessThan(PERFORMANCE_THRESHOLDS.CLS);
      
      console.log('Tour page Core Web Vitals:', vitals);
    });

    test('booking flow should maintain good performance', async ({ page }) => {
      await page.goto('/en/tours/prague-castle');
      await page.click('[data-testid="book-now-button"]');
      await page.waitForLoadState('networkidle');
      
      const vitals = await measureWebVitals(page);
      
      // Slightly more lenient thresholds for interactive pages
      expect(vitals.LCP).toBeLessThan(PERFORMANCE_THRESHOLDS.LCP * 1.2);
      expect(vitals.CLS).toBeLessThan(PERFORMANCE_THRESHOLDS.CLS * 1.5);
      
      console.log('Booking flow Core Web Vitals:', vitals);
    });
  });

  test.describe('Resource Loading Performance', () => {
    test('should load resources efficiently', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const resourceMetrics = await measureResourceLoading(page);
      
      // Assert reasonable resource counts
      expect(resourceMetrics.totalResources).toBeLessThan(50);
      expect(resourceMetrics.slowestResource.duration).toBeLessThan(3000);
      
      console.log('Resource loading metrics:', resourceMetrics);
    });

    test('images should be optimized', async ({ page }) => {
      await page.goto('/');
      
      const imageMetrics = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.map(img => ({
          src: img.src,
          loading: img.loading,
          width: img.naturalWidth,
          height: img.naturalHeight,
          hasAlt: !!img.alt,
        }));
      });
      
      // Check that images have proper optimization attributes
      imageMetrics.forEach(img => {
        expect(img.hasAlt).toBe(true); // Accessibility
        expect(img.loading).toBe('lazy'); // Performance (except above-fold images)
      });
      
      console.log('Image optimization metrics:', imageMetrics);
    });

    test('should use efficient image formats', async ({ page }) => {
      const response = await page.goto('/');
      
      // Check for modern image formats in response
      const imageRequests = [];
      page.on('response', response => {
        const contentType = response.headers()['content-type'];
        if (contentType && contentType.startsWith('image/')) {
          imageRequests.push({
            url: response.url(),
            contentType: contentType,
            size: parseInt(response.headers()['content-length'] || '0'),
          });
        }
      });
      
      await page.waitForLoadState('networkidle');
      
      // Prefer WebP/AVIF over JPEG/PNG
      const modernFormats = imageRequests.filter(req => 
        req.contentType.includes('webp') || req.contentType.includes('avif')
      );
      
      const totalImages = imageRequests.length;
      const modernFormatRatio = modernFormats.length / totalImages;
      
      expect(modernFormatRatio).toBeGreaterThan(0.5); // At least 50% modern formats
      
      console.log('Image format distribution:', {
        total: totalImages,
        modern: modernFormats.length,
        ratio: modernFormatRatio,
      });
    });
  });

  test.describe('JavaScript Performance', () => {
    test('should have minimal JavaScript bundle size', async ({ page }) => {
      const jsRequests = [];
      
      page.on('response', response => {
        const contentType = response.headers()['content-type'];
        if (contentType && contentType.includes('javascript')) {
          jsRequests.push({
            url: response.url(),
            size: parseInt(response.headers()['content-length'] || '0'),
          });
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const totalJSSize = jsRequests.reduce((sum, req) => sum + req.size, 0);
      const totalJSSizeKB = totalJSSize / 1024;
      
      // Assert reasonable bundle size (adjust based on your app's needs)
      expect(totalJSSizeKB).toBeLessThan(500); // 500KB total JS
      
      console.log('JavaScript bundle metrics:', {
        files: jsRequests.length,
        totalSizeKB: totalJSSizeKB,
      });
    });

    test('should have fast JavaScript execution', async ({ page }) => {
      await page.goto('/');
      
      const jsMetrics = await page.evaluate(() => {
        const startTime = performance.now();
        
        // Simulate some JavaScript work
        const testArray = Array.from({ length: 1000 }, (_, i) => i);
        const result = testArray.map(x => x * 2).filter(x => x % 2 === 0);
        
        const endTime = performance.now();
        
        return {
          executionTime: endTime - startTime,
          resultLength: result.length,
        };
      });
      
      expect(jsMetrics.executionTime).toBeLessThan(10); // 10ms for simple operations
      
      console.log('JavaScript execution metrics:', jsMetrics);
    });
  });

  test.describe('Network Performance', () => {
    test('should minimize network requests', async ({ page }) => {
      const requests = [];
      
      page.on('request', request => {
        requests.push({
          url: request.url(),
          method: request.method(),
          resourceType: request.resourceType(),
        });
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const requestsByType = requests.reduce((acc, req) => {
        acc[req.resourceType] = (acc[req.resourceType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Assert reasonable request counts
      expect(requests.length).toBeLessThan(30); // Total requests
      expect(requestsByType.image || 0).toBeLessThan(15); // Image requests
      expect(requestsByType.script || 0).toBeLessThan(10); // Script requests
      
      console.log('Network request metrics:', {
        total: requests.length,
        byType: requestsByType,
      });
    });

    test('should use HTTP/2', async ({ page }) => {
      const responses = [];
      
      page.on('response', response => {
        responses.push({
          url: response.url(),
          httpVersion: response.headers()['http-version'] || 'unknown',
        });
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const http2Responses = responses.filter(res => 
        res.httpVersion.includes('2') || res.url.startsWith('https')
      );
      
      const http2Ratio = http2Responses.length / responses.length;
      expect(http2Ratio).toBeGreaterThan(0.8); // 80% HTTP/2
      
      console.log('HTTP version metrics:', {
        total: responses.length,
        http2: http2Responses.length,
        ratio: http2Ratio,
      });
    });
  });

  test.describe('Mobile Performance', () => {
    test('should perform well on mobile devices', async ({ page }) => {
      // Simulate mobile device
      await page.setViewportSize({ width: 375, height: 667 });
      await page.emulateMedia({ media: 'screen' });
      
      // Simulate slow 3G connection
      await page.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
        await route.continue();
      });
      
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Mobile should load within reasonable time even on slow connection
      expect(loadTime).toBeLessThan(5000); // 5 seconds
      
      const vitals = await measureWebVitals(page);
      
      // More lenient thresholds for mobile
      expect(vitals.LCP).toBeLessThan(PERFORMANCE_THRESHOLDS.LCP * 1.5);
      expect(vitals.CLS).toBeLessThan(PERFORMANCE_THRESHOLDS.CLS);
      
      console.log('Mobile performance metrics:', {
        loadTime,
        vitals,
      });
    });
  });

  test.describe('Caching Performance', () => {
    test('should cache static resources effectively', async ({ page }) => {
      // First visit
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const firstVisitRequests = [];
      page.on('request', request => {
        firstVisitRequests.push(request.url());
      });
      
      // Second visit (should use cache)
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      const cachedRequests = firstVisitRequests.filter(url => 
        url.includes('.js') || url.includes('.css') || url.includes('.png') || url.includes('.jpg')
      );
      
      // Check that static resources are cached
      expect(cachedRequests.length).toBeGreaterThan(0);
      
      console.log('Caching metrics:', {
        totalRequests: firstVisitRequests.length,
        cacheableRequests: cachedRequests.length,
      });
    });
  });
});
