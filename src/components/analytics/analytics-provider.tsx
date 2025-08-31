'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { analytics, trackingUtils } from '@/lib/analytics';
import { abTesting } from '@/lib/ab-testing';

interface AnalyticsContextType {
  trackEvent: typeof analytics.trackEvent;
  trackPageView: typeof analytics.trackPageView;
  trackTourView: typeof analytics.trackTourView;
  trackBookingButtonClick: typeof analytics.trackBookingButtonClick;
  trackBookingStart: typeof analytics.trackBookingStart;
  trackBookingStep: typeof analytics.trackBookingStep;
  trackBookingCompletion: typeof analytics.trackBookingCompletion;
  trackCTAClick: typeof trackingUtils.trackCTAClick;
  trackFormStart: typeof trackingUtils.trackFormStart;
  trackFormComplete: typeof trackingUtils.trackFormComplete;
  trackScrollDepth: typeof trackingUtils.trackScrollDepth;
  trackTimeOnPage: typeof trackingUtils.trackTimeOnPage;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pageStartTime = useRef<number>(Date.now());
  const scrollDepthTracked = useRef<Set<number>>(new Set());
  const timeOnPageTracked = useRef<boolean>(false);

  useEffect(() => {
    // Track initial page view
    const handlePageView = () => {
      analytics.trackPageView(
        window.location.href,
        document.title,
        getPageCategory()
      );
    };

    // Track page view on mount
    handlePageView();

    // Track scroll depth
    const handleScroll = () => {
      const scrollPercentage = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );

      // Track at 25%, 50%, 75%, 90% scroll depths
      const milestones = [25, 50, 75, 90];
      milestones.forEach(milestone => {
        if (scrollPercentage >= milestone && !scrollDepthTracked.current.has(milestone)) {
          scrollDepthTracked.current.add(milestone);
          trackingUtils.trackScrollDepth(milestone, window.location.pathname);
        }
      });
    };

    // Track time on page before user leaves
    const handleBeforeUnload = () => {
      if (!timeOnPageTracked.current) {
        const timeOnPage = Math.round((Date.now() - pageStartTime.current) / 1000);
        trackingUtils.trackTimeOnPage(timeOnPage, window.location.pathname);
        timeOnPageTracked.current = true;
      }
    };

    // Track visibility change (tab switching)
    const handleVisibilityChange = () => {
      if (document.hidden && !timeOnPageTracked.current) {
        const timeOnPage = Math.round((Date.now() - pageStartTime.current) / 1000);
        trackingUtils.trackTimeOnPage(timeOnPage, window.location.pathname);
        timeOnPageTracked.current = true;
      }
    };

    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Helper function to determine page category
  const getPageCategory = (): string | undefined => {
    const pathname = window.location.pathname;
    if (pathname.includes('/tours/')) return 'tour';
    if (pathname.includes('/blog/')) return 'blog';
    if (pathname.includes('/about')) return 'about';
    if (pathname.includes('/contact')) return 'contact';
    if (pathname.includes('/book/')) return 'booking';
    return undefined;
  };

  const contextValue: AnalyticsContextType = {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackTourView: analytics.trackTourView.bind(analytics),
    trackBookingButtonClick: analytics.trackBookingButtonClick.bind(analytics),
    trackBookingStart: analytics.trackBookingStart.bind(analytics),
    trackBookingStep: analytics.trackBookingStep.bind(analytics),
    trackBookingCompletion: analytics.trackBookingCompletion.bind(analytics),
    trackCTAClick: trackingUtils.trackCTAClick,
    trackFormStart: trackingUtils.trackFormStart,
    trackFormComplete: trackingUtils.trackFormComplete,
    trackScrollDepth: trackingUtils.trackScrollDepth,
    trackTimeOnPage: trackingUtils.trackTimeOnPage,
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// Hook to use analytics context
export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

// Hook for tracking specific tour interactions
export function useTourAnalytics(tourId: string, tourName: string, category: string) {
  const analytics = useAnalytics();

  useEffect(() => {
    // Track tour page view on mount
    analytics.trackTourView(tourId, tourName, category);
  }, [tourId, tourName, category, analytics]);

  return {
    trackBookingClick: (location: string) => 
      analytics.trackBookingButtonClick(tourId, tourName, location),
    trackBookingStart: () => 
      analytics.trackBookingStart(tourId, tourName),
  };
}

// Hook for tracking booking flow
export function useBookingAnalytics(tourId: string) {
  const analytics = useAnalytics();

  return {
    trackStep: (step: number) => analytics.trackBookingStep(step, tourId),
    trackCompletion: (bookingId: string, value: number, currency?: string) =>
      analytics.trackBookingCompletion(bookingId, tourId, value, currency),
  };
}

// Hook for tracking form interactions
export function useFormAnalytics(formName: string, location: string) {
  const analytics = useAnalytics();
  const hasStarted = useRef(false);

  const trackStart = () => {
    if (!hasStarted.current) {
      analytics.trackFormStart(formName, location);
      hasStarted.current = true;
    }
  };

  const trackComplete = () => {
    analytics.trackFormComplete(formName, location);
  };

  return { trackStart, trackComplete };
}

// Hook for A/B testing with analytics
export function useABTestWithAnalytics(testId: string) {
  const variantConfig = abTesting.getVariantConfig(testId);
  
  const trackConversion = (metricName: string, value?: number) => {
    abTesting.trackConversion(testId, metricName, value);
  };

  const isInVariant = (variantId: string) => {
    return abTesting.isInVariant(testId, variantId);
  };

  return {
    config: variantConfig,
    isInVariant,
    trackConversion,
  };
}
