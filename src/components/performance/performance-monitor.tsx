'use client';

import { useEffect } from 'react';
import {
  preloadCriticalResources,
  addResourceHints,
  optimizeWebVitals,
  registerServiceWorker,
  collectPerformanceMetrics
} from '@/lib/performance';
import { initializeWebVitals } from '@/lib/performance-testing';
import { PERFORMANCE_CONFIG } from '@/lib/constants';

interface PerformanceMonitorProps {
  enableServiceWorker?: boolean;
  enableWebVitals?: boolean;
  enableResourceHints?: boolean;
}

/**
 * Performance monitoring component that initializes performance optimizations
 * Should be included in the root layout for maximum effectiveness
 */
export function PerformanceMonitor({
  enableServiceWorker = true,
  enableWebVitals = true,
  enableResourceHints = true,
}: PerformanceMonitorProps) {
  useEffect(() => {
    // Initialize performance optimizations
    if (enableResourceHints) {
      addResourceHints();
    }

    if (enableWebVitals) {
      optimizeWebVitals();
    }

    // Preload critical resources
    preloadCriticalResources();

    // Register service worker for caching
    if (enableServiceWorker) {
      registerServiceWorker();
    }

    // Initialize Web Vitals monitoring
    if (PERFORMANCE_CONFIG.webVitalsEnabled) {
      initializeWebVitals();
    }

    // Collect and report performance metrics
    const collectMetrics = async () => {
      try {
        const metrics = await collectPerformanceMetrics();

        // Send metrics to analytics or monitoring service
        if (process.env.NODE_ENV === 'production') {
          // This could be sent to Google Analytics, Sentry, or custom analytics
          console.log('Performance metrics:', metrics);

          // Send to service worker for potential caching optimization
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'PERFORMANCE_METRICS',
              metrics,
            });
          }
        }
      } catch (error) {
        console.error('Failed to collect performance metrics:', error);
      }
    };

    // Collect metrics after page load
    const timer = setTimeout(collectMetrics, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [enableServiceWorker, enableWebVitals, enableResourceHints]);

  // This component doesn't render anything visible
  return null;
}

/**
 * Critical CSS loader component
 * Inlines critical CSS for above-the-fold content
 */
export function CriticalCSSLoader() {
  useEffect(() => {
    // Critical CSS for above-the-fold content
    const criticalCSS = `
      /* Critical styles for hero section and navigation */
      .hero-section {
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      
      .nav-header {
        position: sticky;
        top: 0;
        z-index: 50;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
      }
      
      .cta-button {
        background: #3b82f6;
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 600;
        transition: all 0.2s ease;
      }
      
      .cta-button:hover {
        background: #2563eb;
        transform: translateY(-1px);
      }
    `;

    // Inline critical CSS
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    style.setAttribute('data-critical', 'true');
    document.head.appendChild(style);

    return () => {
      // Cleanup on unmount
      const criticalStyles = document.querySelectorAll('style[data-critical]');
      criticalStyles.forEach(style => style.remove());
    };
  }, []);

  return null;
}

/**
 * Resource preloader component
 * Preloads critical resources for better performance
 */
interface ResourcePreloaderProps {
  images?: string[];
  fonts?: string[];
  scripts?: string[];
}

export function ResourcePreloader({ 
  images = [], 
  fonts = [], 
  scripts = [] 
}: ResourcePreloaderProps) {
  useEffect(() => {
    // Preload images
    images.forEach((src) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = src;
      link.as = 'image';
      document.head.appendChild(link);
    });

    // Preload fonts
    fonts.forEach((src) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = src;
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Preload scripts
    scripts.forEach((src) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = src;
      link.as = 'script';
      document.head.appendChild(link);
    });
  }, [images, fonts, scripts]);

  return null;
}

/**
 * Bundle size monitor (development only)
 */
export function BundleSizeMonitor() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Monitor bundle size in development
      const checkBundleSize = () => {
        const scripts = document.querySelectorAll('script[src]');
        let totalSize = 0;

        scripts.forEach((script) => {
          const src = (script as HTMLScriptElement).src;
          if (src.includes('/_next/static/')) {
            // This is a rough estimate - in production you'd use proper bundle analysis
            fetch(src, { method: 'HEAD' })
              .then((response) => {
                const size = response.headers.get('content-length');
                if (size) {
                  totalSize += parseInt(size, 10);
                  console.log(`Bundle size estimate: ${(totalSize / 1024).toFixed(2)} KB`);
                }
              })
              .catch(() => {
                // Ignore errors in development
              });
          }
        });
      };

      const timer = setTimeout(checkBundleSize, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  return null;
}

/**
 * Performance optimization provider
 * Wraps the app with performance monitoring and optimization features
 */
interface PerformanceProviderProps {
  children: React.ReactNode;
  enableMonitoring?: boolean;
  enableCriticalCSS?: boolean;
  enableResourcePreloading?: boolean;
}

export function PerformanceProvider({
  children,
  enableMonitoring = true,
  enableCriticalCSS = true,
  enableResourcePreloading = true,
}: PerformanceProviderProps) {
  return (
    <>
      {enableMonitoring && <PerformanceMonitor />}
      {enableCriticalCSS && <CriticalCSSLoader />}
      {enableResourcePreloading && (
        <ResourcePreloader
          images={['/images/hero-prague-castle.webp', '/images/filip-portrait.webp']}
          fonts={['/fonts/inter-var.woff2', '/fonts/playfair-display-var.woff2']}
        />
      )}
      {process.env.NODE_ENV === 'development' && <BundleSizeMonitor />}
      {children}
    </>
  );
}
