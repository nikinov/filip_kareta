import { PERFORMANCE_CONFIG } from './constants';

/**
 * Performance optimization utilities for the Prague tour guide website
 */

// Intersection Observer for lazy loading
export class LazyLoadObserver {
  private observer: IntersectionObserver | null = null;
  private callbacks = new Map<Element, () => void>();

  constructor() {
    if (typeof window !== 'undefined') {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const callback = this.callbacks.get(entry.target);
              if (callback) {
                callback();
                this.unobserve(entry.target);
              }
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.1,
        }
      );
    }
  }

  observe(element: Element, callback: () => void) {
    if (this.observer) {
      this.callbacks.set(element, callback);
      this.observer.observe(element);
    }
  }

  unobserve(element: Element) {
    if (this.observer) {
      this.observer.unobserve(element);
      this.callbacks.delete(element);
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.callbacks.clear();
    }
  }
}

// Singleton instance
let lazyLoadObserver: LazyLoadObserver | null = null;

export function getLazyLoadObserver(): LazyLoadObserver {
  if (!lazyLoadObserver) {
    lazyLoadObserver = new LazyLoadObserver();
  }
  return lazyLoadObserver;
}

// Image optimization utilities
export function generateImageSizes(breakpoints: Record<string, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}): string {
  const sizes = [
    `(max-width: ${breakpoints.sm}px) 100vw`,
    `(max-width: ${breakpoints.md}px) 50vw`,
    `(max-width: ${breakpoints.lg}px) 33vw`,
    `(max-width: ${breakpoints.xl}px) 25vw`,
    '20vw',
  ];
  
  return sizes.join(', ');
}

export function generateResponsiveSizes(config: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
  wide?: string;
} = {}): string {
  const {
    mobile = '100vw',
    tablet = '50vw',
    desktop = '33vw',
    wide = '25vw',
  } = config;

  return [
    `(max-width: 640px) ${mobile}`,
    `(max-width: 768px) ${tablet}`,
    `(max-width: 1024px) ${desktop}`,
    wide,
  ].join(', ');
}

// Bundle optimization utilities
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return;

  // Preload critical fonts
  const fontPreloads = [
    '/fonts/inter-var.woff2',
    '/fonts/playfair-display-var.woff2',
  ];

  fontPreloads.forEach((font) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = font;
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });

  // Preload critical images
  const criticalImages = [
    '/images/hero-prague-castle.webp',
    '/images/filip-portrait.webp',
  ];

  criticalImages.forEach((image) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = image;
    link.as = 'image';
    document.head.appendChild(link);
  });
}

// Code splitting utilities
export function loadComponentLazily<T>(
  importFn: () => Promise<{ default: T }>
): Promise<T> {
  return importFn().then((module) => module.default);
}

// Performance monitoring
export function measurePerformance(name: string, fn: () => void | Promise<void>) {
  if (typeof window === 'undefined') return fn();

  const start = performance.now();
  const result = fn();

  if (result instanceof Promise) {
    return result.finally(() => {
      const end = performance.now();
      console.log(`Performance: ${name} took ${end - start} milliseconds`);
    });
  } else {
    const end = performance.now();
    console.log(`Performance: ${name} took ${end - start} milliseconds`);
    return result;
  }
}

// CDN utilities
export function getCDNUrl(path: string): string {
  const cdnBase = process.env.NEXT_PUBLIC_CDN_URL;
  if (cdnBase && !path.startsWith('http')) {
    return `${cdnBase}${path.startsWith('/') ? path : `/${path}`}`;
  }
  return path;
}

// Resource hints
export function addResourceHints() {
  if (typeof window === 'undefined') return;

  // DNS prefetch for external domains
  const domains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'www.google-analytics.com',
    'js.stripe.com',
  ];

  domains.forEach((domain) => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  });

  // Preconnect to critical domains
  const criticalDomains = [
    'fonts.googleapis.com',
    'js.stripe.com',
  ];

  criticalDomains.forEach((domain) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = `https://${domain}`;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

// Web Vitals optimization
export function optimizeWebVitals() {
  if (typeof window === 'undefined') return;

  // Optimize LCP by preloading hero image
  const heroImage = document.querySelector('[data-hero-image]') as HTMLImageElement;
  if (heroImage && heroImage.src) {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = heroImage.src;
    link.as = 'image';
    document.head.appendChild(link);
  }

  // Optimize CLS by setting image dimensions
  const images = document.querySelectorAll('img[data-optimize-cls]');
  images.forEach((img) => {
    const image = img as HTMLImageElement;
    if (!image.width || !image.height) {
      // Set aspect ratio to prevent layout shift
      image.style.aspectRatio = '16/9';
    }
  });
}

// Service Worker registration for caching
export function registerServiceWorker() {
  if (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    process.env.NODE_ENV === 'production'
  ) {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  }
}

// Critical CSS inlining utility
export function inlineCriticalCSS(css: string) {
  if (typeof window === 'undefined') return;

  const style = document.createElement('style');
  style.textContent = css;
  style.setAttribute('data-critical', 'true');
  document.head.appendChild(style);
}

// Performance metrics collection
export interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
}

export function collectPerformanceMetrics(): Promise<PerformanceMetrics> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve({});
      return;
    }

    const metrics: PerformanceMetrics = {};

    // Collect TTFB
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      metrics.ttfb = navigation.responseStart - navigation.requestStart;
    }

    // Use Web Vitals library if available
    if ('web-vitals' in window) {
      // This would be implemented with the web-vitals library
      // For now, we'll collect basic metrics
      setTimeout(() => {
        resolve(metrics);
      }, 1000);
    } else {
      resolve(metrics);
    }
  });
}
