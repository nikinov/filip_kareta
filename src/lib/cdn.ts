/**
 * CDN configuration and utilities for global content delivery
 * Optimizes asset delivery for the Prague tour guide website
 */

// CDN configuration
export const CDN_CONFIG = {
  // Primary CDN for images and static assets
  imagesCDN: process.env.NEXT_PUBLIC_IMAGES_CDN || '',
  // Secondary CDN for fonts and CSS
  staticCDN: process.env.NEXT_PUBLIC_STATIC_CDN || '',
  // Video CDN for tour videos
  videoCDN: process.env.NEXT_PUBLIC_VIDEO_CDN || '',
  // Enable CDN in production only
  enabled: process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_CDN_ENABLED === 'true',
} as const;

/**
 * Get optimized URL for images with CDN support
 */
export function getImageUrl(
  path: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpg' | 'png';
  } = {}
): string {
  const { width, height, quality = 85, format = 'webp' } = options;
  
  // If CDN is not enabled, return original path
  if (!CDN_CONFIG.enabled || !CDN_CONFIG.imagesCDN) {
    return path;
  }

  // Build CDN URL with optimization parameters
  const baseUrl = CDN_CONFIG.imagesCDN;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  let cdnUrl = `${baseUrl}/${cleanPath}`;
  
  // Add optimization parameters
  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  if (quality !== 85) params.set('q', quality.toString());
  if (format !== 'webp') params.set('f', format);
  
  const queryString = params.toString();
  if (queryString) {
    cdnUrl += `?${queryString}`;
  }
  
  return cdnUrl;
}

/**
 * Get optimized URL for static assets (CSS, JS, fonts)
 */
export function getStaticAssetUrl(path: string): string {
  if (!CDN_CONFIG.enabled || !CDN_CONFIG.staticCDN) {
    return path;
  }
  
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${CDN_CONFIG.staticCDN}/${cleanPath}`;
}

/**
 * Get optimized URL for video content
 */
export function getVideoUrl(
  path: string,
  options: {
    quality?: 'auto' | 'low' | 'medium' | 'high';
    format?: 'mp4' | 'webm' | 'hls';
  } = {}
): string {
  const { quality = 'auto', format = 'mp4' } = options;
  
  if (!CDN_CONFIG.enabled || !CDN_CONFIG.videoCDN) {
    return path;
  }
  
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  let videoUrl = `${CDN_CONFIG.videoCDN}/${cleanPath}`;
  
  // Add video optimization parameters
  const params = new URLSearchParams();
  if (quality !== 'auto') params.set('quality', quality);
  if (format !== 'mp4') params.set('format', format);
  
  const queryString = params.toString();
  if (queryString) {
    videoUrl += `?${queryString}`;
  }
  
  return videoUrl;
}

/**
 * Generate responsive image srcSet with CDN optimization
 */
export function generateResponsiveSrcSet(
  basePath: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1920],
  format: 'webp' | 'avif' | 'jpg' = 'webp'
): string {
  return widths
    .map((width) => {
      const url = getImageUrl(basePath, { width, format });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Preload critical assets with CDN URLs
 */
export function preloadCriticalAssets() {
  if (typeof window === 'undefined') return;

  const criticalAssets = [
    { path: '/images/hero-prague-castle.webp', type: 'image' },
    { path: '/images/filip-portrait.webp', type: 'image' },
    { path: '/fonts/inter-var.woff2', type: 'font' },
    { path: '/fonts/playfair-display-var.woff2', type: 'font' },
  ];

  criticalAssets.forEach(({ path, type }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    
    if (type === 'image') {
      link.href = getImageUrl(path, { width: 1920, quality: 90 });
      link.as = 'image';
    } else if (type === 'font') {
      link.href = getStaticAssetUrl(path);
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
  });
}

/**
 * Configure CDN cache headers for different asset types
 */
export function getCacheHeaders(assetType: 'image' | 'static' | 'video' | 'api'): Record<string, string> {
  const baseHeaders = {
    'Cache-Control': 'public',
    'X-Content-Type-Options': 'nosniff',
  };

  switch (assetType) {
    case 'image':
      return {
        ...baseHeaders,
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
        'Vary': 'Accept',
      };
    
    case 'static':
      return {
        ...baseHeaders,
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
      };
    
    case 'video':
      return {
        ...baseHeaders,
        'Cache-Control': 'public, max-age=86400', // 1 day
        'Accept-Ranges': 'bytes',
      };
    
    case 'api':
      return {
        ...baseHeaders,
        'Cache-Control': 'public, max-age=300, s-maxage=3600', // 5 min browser, 1 hour CDN
        'Vary': 'Accept-Language, Accept-Encoding',
      };
    
    default:
      return baseHeaders;
  }
}

/**
 * Image optimization utilities for different use cases
 */
export const IMAGE_PRESETS = {
  hero: {
    width: 1920,
    height: 1080,
    quality: 90,
    format: 'webp' as const,
    sizes: '100vw',
  },
  tourCard: {
    width: 400,
    height: 300,
    quality: 85,
    format: 'webp' as const,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  },
  blogCard: {
    width: 600,
    height: 400,
    quality: 85,
    format: 'webp' as const,
    sizes: '(max-width: 768px) 100vw, 50vw',
  },
  avatar: {
    width: 200,
    height: 200,
    quality: 90,
    format: 'webp' as const,
    sizes: '200px',
  },
  thumbnail: {
    width: 150,
    height: 150,
    quality: 80,
    format: 'webp' as const,
    sizes: '150px',
  },
} as const;

/**
 * Get optimized image props for specific use cases
 */
export function getOptimizedImageProps(
  src: string,
  preset: keyof typeof IMAGE_PRESETS,
  overrides: Partial<typeof IMAGE_PRESETS.hero> = {}
) {
  const config = { ...IMAGE_PRESETS[preset], ...overrides };
  
  return {
    src: getImageUrl(src, config),
    width: config.width,
    height: config.height,
    quality: config.quality,
    sizes: config.sizes,
    loading: 'lazy' as const,
    decoding: 'async' as const,
  };
}

/**
 * Performance monitoring for CDN effectiveness
 */
export function monitorCDNPerformance() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') {
    return;
  }

  // Monitor resource loading times
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'resource') {
        const resourceEntry = entry as PerformanceResourceTiming;
        
        // Check if resource is served from CDN
        const isCDNResource = CDN_CONFIG.imagesCDN && 
          resourceEntry.name.includes(CDN_CONFIG.imagesCDN);
        
        if (isCDNResource) {
          console.log(`CDN Resource: ${resourceEntry.name}`, {
            duration: resourceEntry.duration,
            transferSize: resourceEntry.transferSize,
            encodedBodySize: resourceEntry.encodedBodySize,
          });
        }
      }
    });
  });

  observer.observe({ entryTypes: ['resource'] });
  
  // Cleanup after 30 seconds
  setTimeout(() => {
    observer.disconnect();
  }, 30000);
}
