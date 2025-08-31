// Google Analytics 4 integration and custom event tracking

export interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, any>;
}

export interface ConversionEvent {
  event_name: string;
  currency?: string;
  value?: number;
  transaction_id?: string;
  items?: Array<{
    item_id: string;
    item_name: string;
    category: string;
    quantity: number;
    price: number;
  }>;
}

export interface UserBehaviorEvent {
  event_name: string;
  page_title?: string;
  page_location?: string;
  content_group1?: string; // Tour category
  content_group2?: string; // Language
  custom_parameter_1?: string;
  custom_parameter_2?: string;
}

// Google Analytics 4 gtag wrapper
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'consent',
      targetId: string | Date | 'default',
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

class Analytics {
  private isInitialized = false;
  private measurementId: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || null;
      this.initialize();
    }
  }

  private initialize() {
    if (!this.measurementId || this.isInitialized) return;

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    document.head.appendChild(script);

    // Configure GA4
    window.gtag('js', new Date());
    window.gtag('config', this.measurementId, {
      page_title: document.title,
      page_location: window.location.href,
      send_page_view: true,
      // Enhanced ecommerce settings
      allow_enhanced_conversions: true,
      // Privacy settings
      anonymize_ip: true,
      // Custom dimensions
      custom_map: {
        custom_parameter_1: 'tour_category',
        custom_parameter_2: 'user_language',
      },
    });

    this.isInitialized = true;
  }

  // Track custom events
  trackEvent(event: AnalyticsEvent) {
    if (!this.isInitialized || !window.gtag) return;

    window.gtag('event', event.name, event.parameters);
  }

  // Track page views
  trackPageView(url: string, title: string, tourCategory?: string) {
    if (!this.isInitialized || !window.gtag) return;

    window.gtag('event', 'page_view', {
      page_title: title,
      page_location: url,
      content_group1: tourCategory,
      content_group2: document.documentElement.lang,
    });
  }

  // Track conversion events
  trackConversion(event: ConversionEvent) {
    if (!this.isInitialized || !window.gtag) return;

    window.gtag('event', event.event_name, {
      currency: event.currency || 'EUR',
      value: event.value,
      transaction_id: event.transaction_id,
      items: event.items,
    });
  }

  // Track user behavior events
  trackUserBehavior(event: UserBehaviorEvent) {
    if (!this.isInitialized || !window.gtag) return;

    window.gtag('event', event.event_name, {
      page_title: event.page_title || document.title,
      page_location: event.page_location || window.location.href,
      content_group1: event.content_group1,
      content_group2: event.content_group2 || document.documentElement.lang,
      custom_parameter_1: event.custom_parameter_1,
      custom_parameter_2: event.custom_parameter_2,
    });
  }

  // Specific tracking methods for common events
  trackTourView(tourId: string, tourName: string, category: string) {
    this.trackUserBehavior({
      event_name: 'tour_page_view',
      content_group1: category,
      custom_parameter_1: tourId,
      custom_parameter_2: tourName,
    });
  }

  trackBookingButtonClick(tourId: string, tourName: string, location: string) {
    this.trackUserBehavior({
      event_name: 'booking_button_click',
      custom_parameter_1: tourId,
      custom_parameter_2: location, // 'hero', 'sidebar', 'footer'
    });
  }

  trackBookingStart(tourId: string, tourName: string) {
    this.trackUserBehavior({
      event_name: 'booking_flow_start',
      custom_parameter_1: tourId,
      custom_parameter_2: tourName,
    });
  }

  trackBookingStep(step: number, tourId: string) {
    this.trackUserBehavior({
      event_name: 'booking_step_completed',
      custom_parameter_1: tourId,
      custom_parameter_2: `step_${step}`,
    });
  }

  trackBookingCompletion(bookingId: string, tourId: string, value: number, currency = 'EUR') {
    // Track as conversion
    this.trackConversion({
      event_name: 'purchase',
      currency,
      value,
      transaction_id: bookingId,
      items: [{
        item_id: tourId,
        item_name: `Prague Tour - ${tourId}`,
        category: 'tour',
        quantity: 1,
        price: value,
      }],
    });

    // Also track as custom event
    this.trackUserBehavior({
      event_name: 'booking_confirmation',
      custom_parameter_1: tourId,
      custom_parameter_2: bookingId,
    });
  }

  trackContactFormSubmit(source: string) {
    this.trackUserBehavior({
      event_name: 'contact_form_submit',
      custom_parameter_1: source, // 'contact_page', 'tour_page', 'footer'
    });
  }

  trackNewsletterSignup(source: string) {
    this.trackUserBehavior({
      event_name: 'newsletter_signup',
      custom_parameter_1: source,
    });
  }

  trackSocialShare(platform: string, content: string) {
    this.trackUserBehavior({
      event_name: 'social_share',
      custom_parameter_1: platform,
      custom_parameter_2: content,
    });
  }

  trackSearchQuery(query: string, results: number) {
    this.trackUserBehavior({
      event_name: 'site_search',
      custom_parameter_1: query,
      custom_parameter_2: results.toString(),
    });
  }

  trackVideoPlay(videoId: string, location: string) {
    this.trackUserBehavior({
      event_name: 'video_play',
      custom_parameter_1: videoId,
      custom_parameter_2: location,
    });
  }

  trackDownload(fileName: string, fileType: string) {
    this.trackUserBehavior({
      event_name: 'file_download',
      custom_parameter_1: fileName,
      custom_parameter_2: fileType,
    });
  }
}

// Singleton instance
export const analytics = new Analytics();

// Utility functions for common tracking scenarios
export const trackingUtils = {
  // Track CTA clicks with context
  trackCTAClick: (ctaText: string, location: string, tourId?: string) => {
    analytics.trackUserBehavior({
      event_name: 'cta_click',
      custom_parameter_1: ctaText,
      custom_parameter_2: location,
      ...(tourId && { content_group1: tourId }),
    });
  },

  // Track form interactions
  trackFormStart: (formName: string, location: string) => {
    analytics.trackUserBehavior({
      event_name: 'form_start',
      custom_parameter_1: formName,
      custom_parameter_2: location,
    });
  },

  trackFormComplete: (formName: string, location: string) => {
    analytics.trackUserBehavior({
      event_name: 'form_complete',
      custom_parameter_1: formName,
      custom_parameter_2: location,
    });
  },

  // Track scroll depth
  trackScrollDepth: (percentage: number, page: string) => {
    analytics.trackUserBehavior({
      event_name: 'scroll_depth',
      custom_parameter_1: `${percentage}%`,
      custom_parameter_2: page,
    });
  },

  // Track time on page
  trackTimeOnPage: (seconds: number, page: string) => {
    analytics.trackUserBehavior({
      event_name: 'time_on_page',
      custom_parameter_1: seconds.toString(),
      custom_parameter_2: page,
    });
  },
};
