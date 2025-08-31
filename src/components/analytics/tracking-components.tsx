'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAnalytics } from './analytics-provider';
import { useABTestWithAnalytics } from './analytics-provider';

interface TrackingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  trackingEvent: string;
  trackingData?: Record<string, any>;
  children: React.ReactNode;
}

// Button component with built-in analytics tracking
export function TrackingButton({ 
  trackingEvent, 
  trackingData = {}, 
  onClick, 
  children, 
  ...props 
}: TrackingButtonProps) {
  const analytics = useAnalytics();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Track the event
    analytics.trackEvent({
      name: trackingEvent,
      parameters: {
        button_text: typeof children === 'string' ? children : 'button',
        page_location: window.location.href,
        ...trackingData,
      },
    });

    // Call original onClick if provided
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button {...props} onClick={handleClick}>
      {children}
    </button>
  );
}

interface TrackingLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  trackingEvent: string;
  trackingData?: Record<string, any>;
  children: React.ReactNode;
}

// Link component with built-in analytics tracking
export function TrackingLink({ 
  trackingEvent, 
  trackingData = {}, 
  onClick, 
  children, 
  href,
  ...props 
}: TrackingLinkProps) {
  const analytics = useAnalytics();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Track the event
    analytics.trackEvent({
      name: trackingEvent,
      parameters: {
        link_text: typeof children === 'string' ? children : 'link',
        link_url: href,
        page_location: window.location.href,
        ...trackingData,
      },
    });

    // Call original onClick if provided
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <a {...props} href={href} onClick={handleClick}>
      {children}
    </a>
  );
}

interface VideoTrackingProps {
  videoId: string;
  location: string;
  children: React.ReactNode;
}

// Video wrapper with play tracking
export function VideoTracking({ videoId, location, children }: VideoTrackingProps) {
  const analytics = useAnalytics();
  const hasTrackedPlay = useRef(false);

  const handlePlay = () => {
    if (!hasTrackedPlay.current) {
      analytics.trackEvent({
        name: 'video_play',
        parameters: {
          video_id: videoId,
          location,
          page_location: window.location.href,
        },
      });
      hasTrackedPlay.current = true;
    }
  };

  return (
    <div onPlay={handlePlay}>
      {children}
    </div>
  );
}

interface FormTrackingProps {
  formName: string;
  location: string;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
}

// Form wrapper with start/complete tracking
export function FormTracking({ formName, location, children, onSubmit }: FormTrackingProps) {
  const { trackFormStart, trackFormComplete } = useFormAnalytics(formName, location);
  const hasStarted = useRef(false);

  const handleFocus = () => {
    if (!hasStarted.current) {
      trackFormStart();
      hasStarted.current = true;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    trackFormComplete();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form onFocus={handleFocus} onSubmit={handleSubmit}>
      {children}
    </form>
  );
}

interface ABTestComponentProps {
  testId: string;
  children: (config: Record<string, any> | null, trackConversion: (metric: string, value?: number) => void) => React.ReactNode;
}

// Component for A/B testing with analytics
export function ABTestComponent({ testId, children }: ABTestComponentProps) {
  const [isClient, setIsClient] = useState(false);
  const { config, trackConversion } = useABTestWithAnalytics(testId);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // During SSR and initial hydration, return null to prevent mismatch
  if (!isClient) {
    return null;
  }

  return <>{children(config, trackConversion)}</>;
}

// Scroll depth tracking component
export function ScrollDepthTracker() {
  const analytics = useAnalytics();
  const trackedDepths = useRef<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );

      // Track at 25%, 50%, 75%, 90% scroll depths
      const milestones = [25, 50, 75, 90];
      milestones.forEach(milestone => {
        if (scrollPercentage >= milestone && !trackedDepths.current.has(milestone)) {
          trackedDepths.current.add(milestone);
          analytics.trackScrollDepth(milestone, window.location.pathname);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [analytics]);

  return null; // This component doesn't render anything
}

// Page view tracker for client-side navigation
export function PageViewTracker() {
  const analytics = useAnalytics();

  useEffect(() => {
    // Track page view on mount
    analytics.trackPageView(
      window.location.href,
      document.title,
      getPageCategory()
    );
  }, [analytics]);

  return null;
}

// Helper function to determine page category
function getPageCategory(): string | undefined {
  const pathname = window.location.pathname;
  if (pathname.includes('/tours/')) return 'tour';
  if (pathname.includes('/blog/')) return 'blog';
  if (pathname.includes('/about')) return 'about';
  if (pathname.includes('/contact')) return 'contact';
  if (pathname.includes('/book/')) return 'booking';
  return undefined;
}

// Enhanced CTA button with A/B testing
interface ABTestCTAProps {
  testId: string;
  defaultConfig: Record<string, any>;
  onClick?: () => void;
  className?: string;
}

export function ABTestCTA({ testId, defaultConfig, onClick, className }: ABTestCTAProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show default config during SSR and initial hydration
  if (!isClient) {
    const handleClick = () => {
      if (onClick) onClick();
    };

    return (
      <TrackingButton
        trackingEvent="ab_test_cta_click"
        trackingData={{ test_id: testId, variant: 'default' }}
        onClick={handleClick}
        className={`${defaultConfig.buttonColor} ${className}`}
        style={{ fontSize: defaultConfig.buttonSize === 'xl' ? '1.25rem' : '1rem' }}
      >
        {defaultConfig.buttonText}
      </TrackingButton>
    );
  }

  return (
    <ABTestComponent testId={testId}>
      {(config, trackConversion) => {
        const finalConfig = config || defaultConfig;

        const handleClick = () => {
          trackConversion('cta_click');
          if (onClick) onClick();
        };

        return (
          <TrackingButton
            trackingEvent="ab_test_cta_click"
            trackingData={{ test_id: testId, variant_config: finalConfig }}
            onClick={handleClick}
            className={`${finalConfig.buttonColor} ${className}`}
            style={{ fontSize: finalConfig.buttonSize === 'xl' ? '1.25rem' : '1rem' }}
          >
            {finalConfig.buttonText}
          </TrackingButton>
        );
      }}
    </ABTestComponent>
  );
}

// Social share tracking component
interface SocialShareTrackerProps {
  platform: string;
  content: string;
  url: string;
  children: React.ReactNode;
}

export function SocialShareTracker({ platform, content, url, children }: SocialShareTrackerProps) {
  const analytics = useAnalytics();

  const handleShare = () => {
    analytics.trackEvent({
      name: 'social_share',
      parameters: {
        platform,
        content,
        shared_url: url,
        page_location: window.location.href,
      },
    });
  };

  return (
    <div onClick={handleShare}>
      {children}
    </div>
  );
}

// Newsletter signup tracking
interface NewsletterTrackingProps {
  source: string;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
}

export function NewsletterTracking({ source, children, onSubmit }: NewsletterTrackingProps) {
  const analytics = useAnalytics();

  const handleSubmit = (e: React.FormEvent) => {
    analytics.trackEvent({
      name: 'newsletter_signup',
      parameters: {
        source,
        page_location: window.location.href,
      },
    });

    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <FormTracking formName="newsletter" location={source} onSubmit={handleSubmit}>
      {children}
    </FormTracking>
  );
}
