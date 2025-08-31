/**
 * Performance testing utilities for the Prague tour guide website
 * Provides tools for measuring and optimizing Core Web Vitals
 */

export interface WebVitalsMetric {
  name: 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB';
  value: number;
  id: string;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType: string;
}

export interface PerformanceReport {
  url: string;
  timestamp: number;
  metrics: WebVitalsMetric[];
  deviceType: 'mobile' | 'desktop';
  connectionType: string;
  userAgent: string;
}

/**
 * Core Web Vitals thresholds
 */
export const WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  FID: { good: 100, poor: 300 },   // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte
} as const;

/**
 * Get performance rating based on metric value
 */
export function getPerformanceRating(
  metricName: keyof typeof WEB_VITALS_THRESHOLDS,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = WEB_VITALS_THRESHOLDS[metricName];
  
  if (value <= thresholds.good) {
    return 'good';
  } else if (value <= thresholds.poor) {
    return 'needs-improvement';
  } else {
    return 'poor';
  }
}

/**
 * Collect Web Vitals metrics using the web-vitals library
 */
export function collectWebVitals(): Promise<WebVitalsMetric[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve([]);
      return;
    }

    const metrics: WebVitalsMetric[] = [];
    let collectedCount = 0;
    const expectedMetrics = 5; // LCP, FID, CLS, FCP, TTFB

    const handleMetric = (metric: any) => {
      const webVitalsMetric: WebVitalsMetric = {
        name: metric.name,
        value: metric.value,
        id: metric.id,
        delta: metric.delta,
        rating: getPerformanceRating(metric.name, metric.value),
        navigationType: metric.navigationType || 'navigate',
      };

      metrics.push(webVitalsMetric);
      collectedCount++;

      if (collectedCount >= expectedMetrics) {
        resolve(metrics);
      }
    };

    // Collect metrics using Performance Observer API
    try {
      // LCP - Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        handleMetric({
          name: 'LCP',
          value: lastEntry.startTime,
          id: 'lcp-' + Date.now(),
          delta: lastEntry.startTime,
        });
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      // FCP - First Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            handleMetric({
              name: 'FCP',
              value: entry.startTime,
              id: 'fcp-' + Date.now(),
              delta: entry.startTime,
            });
          }
        });
      }).observe({ type: 'paint', buffered: true });

      // CLS - Cumulative Layout Shift
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        handleMetric({
          name: 'CLS',
          value: clsValue,
          id: 'cls-' + Date.now(),
          delta: clsValue,
        });
      }).observe({ type: 'layout-shift', buffered: true });

      // TTFB - Time to First Byte
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const navEntry = entry as PerformanceNavigationTiming;
          const ttfb = navEntry.responseStart - navEntry.requestStart;
          handleMetric({
            name: 'TTFB',
            value: ttfb,
            id: 'ttfb-' + Date.now(),
            delta: ttfb,
          });
        });
      }).observe({ type: 'navigation', buffered: true });

      // FID - First Input Delay (requires user interaction)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEventTiming;
          const fid = fidEntry.processingStart - fidEntry.startTime;
          handleMetric({
            name: 'FID',
            value: fid,
            id: 'fid-' + Date.now(),
            delta: fid,
          });
        });
      }).observe({ type: 'first-input', buffered: true });

    } catch (error) {
      console.error('Error collecting Web Vitals:', error);
      resolve([]);
    }

    // Fallback timeout
    setTimeout(() => {
      resolve(metrics);
    }, 10000);
  });
}

/**
 * Send Web Vitals metrics to the API endpoint
 */
export async function reportWebVitals(metrics: WebVitalsMetric[]) {
  if (typeof window === 'undefined' || metrics.length === 0) {
    return;
  }

  try {
    const report: PerformanceReport = {
      url: window.location.href,
      timestamp: Date.now(),
      metrics,
      deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop',
      connectionType: (navigator as any).connection?.effectiveType || 'unknown',
      userAgent: navigator.userAgent,
    };

    await fetch('/api/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metrics),
    });
  } catch (error) {
    console.error('Failed to report Web Vitals:', error);
  }
}

/**
 * Initialize Web Vitals collection and reporting
 */
export function initializeWebVitals() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') {
    return;
  }

  // Collect metrics after page load
  window.addEventListener('load', async () => {
    try {
      const metrics = await collectWebVitals();
      await reportWebVitals(metrics);
    } catch (error) {
      console.error('Web Vitals initialization failed:', error);
    }
  });
}

/**
 * Performance budget checker
 */
export function checkPerformanceBudget(metrics: WebVitalsMetric[]): {
  passed: boolean;
  failures: string[];
  score: number;
} {
  const failures: string[] = [];
  let totalScore = 0;
  const maxScore = metrics.length * 100;

  metrics.forEach((metric) => {
    const rating = getPerformanceRating(metric.name, metric.value);
    
    switch (rating) {
      case 'good':
        totalScore += 100;
        break;
      case 'needs-improvement':
        totalScore += 50;
        failures.push(`${metric.name}: ${metric.value} (needs improvement)`);
        break;
      case 'poor':
        totalScore += 0;
        failures.push(`${metric.name}: ${metric.value} (poor)`);
        break;
    }
  });

  const score = Math.round((totalScore / maxScore) * 100);
  const passed = failures.length === 0;

  return { passed, failures, score };
}

/**
 * Generate performance optimization recommendations
 */
export function generateOptimizationRecommendations(metrics: WebVitalsMetric[]): string[] {
  const recommendations: string[] = [];

  metrics.forEach((metric) => {
    const rating = getPerformanceRating(metric.name, metric.value);
    
    if (rating !== 'good') {
      switch (metric.name) {
        case 'LCP':
          recommendations.push(
            'Optimize Largest Contentful Paint: Use Next.js Image optimization, implement lazy loading, and consider CDN for faster image delivery'
          );
          break;
        case 'FID':
          recommendations.push(
            'Improve First Input Delay: Reduce JavaScript execution time, use code splitting, and defer non-critical scripts'
          );
          break;
        case 'CLS':
          recommendations.push(
            'Fix Cumulative Layout Shift: Set explicit dimensions for images and videos, avoid inserting content above existing content'
          );
          break;
        case 'FCP':
          recommendations.push(
            'Optimize First Contentful Paint: Minimize render-blocking resources, inline critical CSS, and optimize server response time'
          );
          break;
        case 'TTFB':
          recommendations.push(
            'Improve Time to First Byte: Optimize server performance, use CDN, and implement proper caching strategies'
          );
          break;
      }
    }
  });

  return [...new Set(recommendations)]; // Remove duplicates
}
