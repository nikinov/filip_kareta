import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/utils';
import { Skeleton } from './skeleton';
import { getImageUrl, generateResponsiveSrcSet } from '@/lib/cdn';

export interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  fill?: boolean;
  sizes?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape' | 'wide';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

const ResponsiveImage = React.forwardRef<HTMLDivElement, ResponsiveImageProps>(
  ({
    src,
    alt,
    width,
    height,
    className,
    priority = false,
    quality = 85,
    fill = false,
    sizes,
    aspectRatio,
    objectFit = 'cover',
    placeholder = 'empty',
    blurDataURL,
    ...props
  }, ref) => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [hasError, setHasError] = React.useState(false);

    const aspectRatioClasses = {
      square: 'aspect-square',
      video: 'aspect-video',
      portrait: 'aspect-[3/4]',
      landscape: 'aspect-[4/3]',
      wide: 'aspect-[16/9]',
    };

    const containerClassName = cn(
      'relative overflow-hidden',
      aspectRatio && aspectRatioClasses[aspectRatio],
      className
    );

    const imageClassName = cn(
      'transition-opacity duration-300',
      isLoading && 'opacity-0',
      !isLoading && 'opacity-100'
    );

    const handleLoad = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
    };

    if (hasError) {
      return (
        <div ref={ref} className={containerClassName} {...props}>
          <div className="flex items-center justify-center h-full bg-stone-100 text-stone-400">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      );
    }

    // Optimize image URL with CDN if available
    const optimizedSrc = getImageUrl(src, {
      width: width || 800,
      height: height || 600,
      quality,
      format: 'webp',
    });

    return (
      <div ref={ref} className={containerClassName} {...props}>
        {isLoading && (
          <Skeleton className="absolute inset-0 z-10" />
        )}
        <Image
          src={optimizedSrc}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          priority={priority}
          quality={quality}
          sizes={sizes || (fill ? '100vw' : undefined)}
          className={cn(imageClassName, fill && `object-${objectFit}`)}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      </div>
    );
  }
);
ResponsiveImage.displayName = 'ResponsiveImage';

export { ResponsiveImage };