'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getLazyLoadObserver } from '@/lib/performance';
import { Skeleton } from './skeleton';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
  minHeight?: string;
}

/**
 * LazyWrapper component for lazy loading content below the fold
 * Optimizes performance by only rendering components when they come into view
 */
export function LazyWrapper({
  children,
  fallback,
  rootMargin = '50px 0px',
  threshold = 0.1,
  className,
  minHeight = '200px',
}: LazyWrapperProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(element);
          }
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold]);

  useEffect(() => {
    if (isVisible) {
      // Small delay to ensure smooth loading
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const defaultFallback = (
    <div className="w-full" style={{ minHeight }}>
      <Skeleton className="w-full h-full" />
    </div>
  );

  return (
    <div ref={elementRef} className={className}>
      {isLoaded ? children : (fallback || defaultFallback)}
    </div>
  );
}

/**
 * Hook for lazy loading components
 */
export function useLazyLoad(threshold = 0.1, rootMargin = '50px 0px') {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(element);
          }
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold]);

  return { isVisible, elementRef };
}

/**
 * Higher-order component for lazy loading
 */
export function withLazyLoading<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  const LazyComponent = (props: P) => {
    const { isVisible, elementRef } = useLazyLoad();

    return (
      <div ref={elementRef}>
        {isVisible ? (
          <Component {...props} />
        ) : (
          fallback || <Skeleton className="w-full h-48" />
        )}
      </div>
    );
  };

  LazyComponent.displayName = `withLazyLoading(${Component.displayName || Component.name})`;
  return LazyComponent;
}

/**
 * Lazy loading for images with progressive enhancement
 */
interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: string;
  blurDataURL?: string;
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes,
  quality = PERFORMANCE_CONFIG.imageQuality,
  placeholder = 'blur',
  blurDataURL,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { isVisible, elementRef } = useLazyLoad();

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  // Generate blur data URL if not provided
  const defaultBlurDataURL = blurDataURL || 
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';

  if (!priority && !isVisible) {
    return (
      <div 
        ref={elementRef} 
        className={`${className} bg-gray-200 animate-pulse`}
        style={{ width, height, aspectRatio: width && height ? `${width}/${height}` : undefined }}
      />
    );
  }

  if (hasError) {
    return (
      <div 
        className={`${className} bg-gray-200 flex items-center justify-center text-gray-500`}
        style={{ width, height }}
      >
        <span className="text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {!isLoaded && (
        <Skeleton 
          className="absolute inset-0 z-10" 
          style={{ width, height }}
        />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />
    </div>
  );
}

/**
 * Component for lazy loading sections below the fold
 */
interface LazySectionProps {
  children: React.ReactNode;
  className?: string;
  fallback?: React.ReactNode;
  delay?: number;
}

export function LazySection({ 
  children, 
  className, 
  fallback,
  delay = 0 
}: LazySectionProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const { isVisible, elementRef } = useLazyLoad();

  useEffect(() => {
    if (isVisible) {
      if (delay > 0) {
        const timer = setTimeout(() => {
          setShouldRender(true);
        }, delay);
        return () => clearTimeout(timer);
      } else {
        setShouldRender(true);
      }
    }
  }, [isVisible, delay]);

  return (
    <div ref={elementRef} className={className}>
      {shouldRender ? children : (fallback || <Skeleton className="w-full h-64" />)}
    </div>
  );
}

/**
 * Preload critical resources for better performance
 */
export function preloadRoute(href: string) {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
}

/**
 * Optimize images for different screen sizes
 */
export function getOptimizedImageProps(
  src: string,
  alt: string,
  options: {
    priority?: boolean;
    sizes?: string;
    quality?: number;
    aspectRatio?: string;
  } = {}
) {
  const {
    priority = false,
    sizes = generateImageSizes(),
    quality = PERFORMANCE_CONFIG.imageQuality,
    aspectRatio,
  } = options;

  return {
    src,
    alt,
    priority,
    sizes,
    quality,
    style: aspectRatio ? { aspectRatio } : undefined,
    loading: priority ? 'eager' as const : 'lazy' as const,
    decoding: 'async' as const,
  };
}
