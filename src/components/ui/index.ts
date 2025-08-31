// UI Components barrel export
// Core shadcn/ui inspired components for Prague tour guide website

export * from './avatar';
export * from './badge';
export * from './button';
export * from './card';
export * from './container';
export * from './grid';
export * from './input';
export * from './label';
export * from './loading-card';
export * from './responsive-image';
export * from './separator';
export * from './skeleton';
export * from './spinner';
export * from './textarea';
export * from './progress';
export * from './trust-signals';
export * from './rating-visualization';
export * from './testimonials';
export * from './recent-activity';
export * from './lazy-wrapper';

// Error handling components
export { ErrorBoundary, BookingErrorBoundary, TourErrorBoundary, useErrorReporting } from '../error-boundary';
export { OfflineHandler, useOfflineAwareFetch, cacheForOffline } from '../offline-handler';
export {
  NoScriptBookingFallback,
  NoScriptContactForm,
  NoScriptLanguageSwitcher,
  NoScriptSearchFallback
} from '../no-script-fallback';

// Performance components
export { PerformanceProvider, PerformanceMonitor, CriticalCSSLoader, ResourcePreloader } from '../performance/performance-monitor';

// Additional exports will be added as components are created