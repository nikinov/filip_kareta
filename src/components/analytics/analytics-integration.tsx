'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';
import { ANALYTICS_CONFIG } from '@/lib/constants';

interface AnalyticsIntegrationProps {
  children: React.ReactNode;
}

// Google Analytics 4 Script Integration
export function GoogleAnalyticsScript() {
  if (!ANALYTICS_CONFIG.googleAnalyticsId || !ANALYTICS_CONFIG.enabled) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.googleAnalyticsId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          
          gtag('config', '${ANALYTICS_CONFIG.googleAnalyticsId}', {
            page_title: document.title,
            page_location: window.location.href,
            send_page_view: true,
            allow_enhanced_conversions: true,
            anonymize_ip: true,
            custom_map: {
              'custom_parameter_1': 'tour_category',
              'custom_parameter_2': 'user_language'
            }
          });

          // Track initial page load
          gtag('event', 'page_view', {
            page_title: document.title,
            page_location: window.location.href,
            content_group1: window.location.pathname.includes('/tours/') ? 'tour' : 'general',
            content_group2: document.documentElement.lang || 'en'
          });
        `}
      </Script>
    </>
  );
}

// Conversion tracking setup
export function ConversionTracking() {
  useEffect(() => {
    if (!ANALYTICS_CONFIG.enabled || !window.gtag) return;

    // Set up enhanced conversions
    window.gtag('config', ANALYTICS_CONFIG.googleAnalyticsId!, {
      allow_enhanced_conversions: true,
    });

    // Track page load performance
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          window.gtag('event', 'page_load_performance', {
            page_load_time: Math.round(perfData.loadEventEnd - perfData.fetchStart),
            dom_content_loaded: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
            first_paint: Math.round(perfData.responseEnd - perfData.fetchStart),
          });
        }, 0);
      });
    }
  }, []);

  return null;
}

// User engagement tracking
export function UserEngagementTracking() {
  useEffect(() => {
    if (!ANALYTICS_CONFIG.enabled || !window.gtag) return;

    let engagementStartTime = Date.now();
    let isEngaged = false;

    // Track user engagement
    const trackEngagement = () => {
      if (!isEngaged) {
        isEngaged = true;
        window.gtag('event', 'user_engagement', {
          engagement_time_msec: Date.now() - engagementStartTime,
        });
      }
    };

    // Track various engagement signals
    const engagementEvents = ['click', 'scroll', 'keydown', 'mousemove'];
    engagementEvents.forEach(event => {
      document.addEventListener(event, trackEngagement, { once: true, passive: true });
    });

    // Track time to engagement
    const engagementTimer = setTimeout(trackEngagement, 10000); // 10 seconds

    return () => {
      clearTimeout(engagementTimer);
      engagementEvents.forEach(event => {
        document.removeEventListener(event, trackEngagement);
      });
    };
  }, []);

  return null;
}

// Error tracking integration
export function ErrorTracking() {
  useEffect(() => {
    if (!ANALYTICS_CONFIG.enabled || !window.gtag) return;

    // Track JavaScript errors
    const handleError = (event: ErrorEvent) => {
      window.gtag('event', 'exception', {
        description: event.error?.message || event.message,
        fatal: false,
        error_file: event.filename,
        error_line: event.lineno,
        error_column: event.colno,
      });
    };

    // Track unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      window.gtag('event', 'exception', {
        description: event.reason?.message || 'Unhandled Promise Rejection',
        fatal: false,
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}

// Complete analytics integration wrapper
export function AnalyticsIntegration({ children }: AnalyticsIntegrationProps) {
  return (
    <>
      <GoogleAnalyticsScript />
      <ConversionTracking />
      <UserEngagementTracking />
      <ErrorTracking />
      {children}
    </>
  );
}

// Custom event tracking utilities for specific business events
export const businessEventTracking = {
  // Track tour interest signals
  trackTourInterest: (tourId: string, action: string) => {
    if (window.gtag) {
      window.gtag('event', 'tour_interest', {
        tour_id: tourId,
        interest_action: action, // 'image_click', 'description_read', 'reviews_viewed'
      });
    }
  },

  // Track booking funnel progression
  trackBookingFunnel: (tourId: string, step: string, value?: number) => {
    if (window.gtag) {
      window.gtag('event', 'booking_funnel', {
        tour_id: tourId,
        funnel_step: step, // 'interest', 'consideration', 'intent', 'purchase'
        value: value,
      });
    }
  },

  // Track content engagement
  trackContentEngagement: (contentType: string, contentId: string, action: string) => {
    if (window.gtag) {
      window.gtag('event', 'content_engagement', {
        content_type: contentType, // 'blog', 'tour', 'about'
        content_id: contentId,
        engagement_action: action, // 'read', 'share', 'comment'
      });
    }
  },

  // Track search behavior
  trackSiteSearch: (query: string, results: number, filters?: Record<string, string>) => {
    if (window.gtag) {
      window.gtag('event', 'search', {
        search_term: query,
        search_results: results,
        ...filters,
      });
    }
  },

  // Track newsletter and lead generation
  trackLeadGeneration: (source: string, leadType: string) => {
    if (window.gtag) {
      window.gtag('event', 'generate_lead', {
        lead_source: source, // 'newsletter', 'contact_form', 'booking_inquiry'
        lead_type: leadType, // 'email_signup', 'contact_request', 'booking_request'
      });
    }
  },

  // Track social proof interactions
  trackSocialProof: (proofType: string, action: string, tourId?: string) => {
    if (window.gtag) {
      window.gtag('event', 'social_proof_interaction', {
        proof_type: proofType, // 'review', 'testimonial', 'trust_badge'
        interaction_action: action, // 'view', 'click', 'expand'
        tour_id: tourId,
      });
    }
  },
};

// Performance monitoring integration
export function PerformanceAnalytics() {
  useEffect(() => {
    if (!ANALYTICS_CONFIG.enabled || !window.gtag) return;

    // Track Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          window.gtag('event', 'web_vitals', {
            metric_name: 'LCP',
            metric_value: Math.round(entry.startTime),
            metric_rating: entry.startTime <= 2500 ? 'good' : entry.startTime <= 4000 ? 'needs_improvement' : 'poor',
          });
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('Performance observer not supported:', error);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}

// Debug mode analytics logging
export function AnalyticsDebugger() {
  useEffect(() => {
    if (!ANALYTICS_CONFIG.debugMode) return;

    // Override gtag to log events in debug mode
    const originalGtag = window.gtag;
    
    window.gtag = function(command: string, ...args: any[]) {
      console.log('🔍 Analytics Debug:', { command, args });
      if (originalGtag) {
        originalGtag(command, ...args);
      }
    };

    return () => {
      window.gtag = originalGtag;
    };
  }, []);

  return null;
}
