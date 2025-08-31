// Jest setup for comprehensive testing suite
import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';

// Mock environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-purposes-only-32-chars';
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
process.env.SECURITY_API_KEY = 'test-security-key';
process.env.GDPR_CONTACT_EMAIL = 'privacy@test.com';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/test-path',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
  useMessages: () => ({}),
}));

// Mock Stripe
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve({
    elements: jest.fn(() => ({
      create: jest.fn(() => ({
        mount: jest.fn(),
        unmount: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
      })),
    })),
    confirmPayment: jest.fn(),
    confirmCardPayment: jest.fn(),
  })),
}));

// Mock PayPal
global.paypal = {
  Buttons: jest.fn(() => ({
    render: jest.fn(),
  })),
};

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock crypto for CSRF token generation
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: jest.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
    randomUUID: jest.fn(() => 'test-uuid-1234-5678-9012-123456789012'),
  },
});

// Mock fetch for API testing
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Reset fetch mock
  (fetch as jest.Mock).mockClear();

  // Suppress console errors/warnings in tests unless explicitly needed
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterEach(() => {
  // Restore console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test utilities
global.testUtils = {
  // Create mock booking data
  createMockBooking: () => ({
    tourId: 'prague-castle',
    date: '2024-04-15',
    time: '10:00',
    groupSize: 2,
    customerInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+420123456789',
    },
  }),

  // Create mock tour data
  createMockTour: () => ({
    id: 'prague-castle',
    name: 'Prague Castle Tour',
    description: 'Explore the historic Prague Castle',
    price: 45,
    duration: 180,
    maxGroupSize: 8,
  }),

  // Create mock user session
  createMockSession: () => ({
    sessionId: 'test-session-123',
    userId: 'user-123',
    email: 'test@example.com',
    csrfToken: 'test-csrf-token-64-chars-long-abcdef1234567890abcdef1234567890',
    createdAt: new Date(),
    lastActivity: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    ipAddress: '127.0.0.1',
    userAgent: 'test-agent',
  }),

  // Wait for async operations
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
};;
