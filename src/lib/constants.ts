// Constants for the Prague tour guide website

export const LOCALES = ['en', 'de', 'fr'] as const;
export const DEFAULT_LOCALE = 'en';

export const CURRENCIES = {
  en: 'USD',
  de: 'EUR',
  fr: 'EUR',
} as const;

export const PRAGUE_COORDINATES = {
  lat: 50.0755,
  lng: 14.4378,
} as const;

export const SITE_CONFIG = {
  name: 'Filip Kareta - Prague Tour Guide',
  description: 'Authentic Prague tours with local storyteller Filip Kareta',
  url: 'https://guidefilip-prague.com',
  ogImage: '/og-image.jpg',
} as const;

export const CONTACT_INFO = {
  email: 'filip@guidefilip-prague.com',
  phone: '+420 123 456 789',
  address: 'Prague, Czech Republic',
} as const;

export const SOCIAL_LINKS = {
  tripadvisor: 'https://tripadvisor.com/profile/filipkareta',
  google: 'https://google.com/maps/contrib/filipkareta',
  instagram: 'https://instagram.com/filipkareta',
  facebook: 'https://facebook.com/filipkareta',
} as const;

export const TOUR_DIFFICULTIES = {
  easy: { en: 'Easy', de: 'Einfach', fr: 'Facile' },
  moderate: { en: 'Moderate', de: 'Mäßig', fr: 'Modéré' },
  challenging: { en: 'Challenging', de: 'Anspruchsvoll', fr: 'Difficile' },
} as const;

export const BOOKING_CONFIG = {
  maxGroupSize: 15,
  minAdvanceBooking: 24, // hours
  maxAdvanceBooking: 365, // days
  cancellationPolicy: 24, // hours before tour
} as const;

export const SEO_CONFIG = {
  titleTemplate: '%s | Filip Kareta - Prague Tour Guide',
  defaultTitle: 'Filip Kareta - Authentic Prague Tours & Local Stories',
  defaultDescription: 'Discover Prague through the eyes of a local storyteller. Authentic walking tours, hidden gems, and fascinating stories with Filip Kareta.',
  keywords: [
    'Prague tours',
    'Prague guide',
    'walking tours Prague',
    'Prague Castle tour',
    'Old Town Prague',
    'local Prague guide',
    'Prague storyteller',
    'authentic Prague experience',
  ] as string[],
} as const;

export const PERFORMANCE_CONFIG = {
  imageQuality: 85,
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  // Lazy loading configuration
  lazyLoadRootMargin: '50px 0px',
  lazyLoadThreshold: 0.1,
  // Bundle optimization
  chunkSizeLimit: 250, // KB
  totalBundleLimit: 750, // KB
  // Cache configuration
  staticCacheTTL: 31536000, // 1 year in seconds
  dynamicCacheTTL: 3600, // 1 hour in seconds
  // CDN configuration
  cdnEnabled: process.env.NEXT_PUBLIC_CDN_ENABLED === 'true',
  imagesCDN: process.env.NEXT_PUBLIC_IMAGES_CDN || '',
  staticCDN: process.env.NEXT_PUBLIC_STATIC_CDN || '',
  videoCDN: process.env.NEXT_PUBLIC_VIDEO_CDN || '',
  // Performance monitoring
  webVitalsEnabled: process.env.NEXT_PUBLIC_PERFORMANCE_MONITORING === 'true',
  webVitalsEndpoint: process.env.NEXT_PUBLIC_WEB_VITALS_ENDPOINT || '/api/web-vitals',
} as const;

export const ANALYTICS_CONFIG = {
  enabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
  googleAnalyticsId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  googleAnalyticsApiSecret: process.env.GA_API_SECRET,
  customEndpoint: process.env.ANALYTICS_ENDPOINT,
  customApiKey: process.env.ANALYTICS_API_KEY,
  abTestingEnabled: process.env.NEXT_PUBLIC_AB_TESTING_ENABLED === 'true',
  debugMode: process.env.NODE_ENV === 'development',
} as const;

export const API_ENDPOINTS = {
  booking: '/api/booking',
  reviews: '/api/reviews',
  availability: '/api/availability',
  analytics: '/api/analytics',
  analyticsDashboard: '/api/analytics/dashboard',
} as const;
