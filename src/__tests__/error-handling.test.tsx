import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ErrorBoundary, BookingErrorBoundary } from '@/components/error-boundary';
import { OfflineHandler } from '@/components/offline-handler';
import { useErrorHandling } from '@/hooks/use-error-handling';
import { sentry } from '@/lib/sentry';

// Mock Sentry
jest.mock('@/lib/sentry', () => ({
  sentry: {
    captureException: jest.fn(),
    captureMessage: jest.fn(),
    setUser: jest.fn(),
    addBreadcrumb: jest.fn(),
    isConfigured: jest.fn(() => true),
  },
  ErrorReporting: {
    bookingError: jest.fn(),
    paymentError: jest.fn(),
    apiError: jest.fn(),
  },
}));

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

// Component that throws an error for testing
function ThrowError({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

describe('Error Handling System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset online status
    Object.defineProperty(navigator, 'onLine', { value: true });
  });

  describe('ErrorBoundary', () => {
    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('renders error UI when error occurs', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Go Home')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('calls onError callback when error occurs', () => {
      const onError = jest.fn();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );

      consoleSpy.mockRestore();
    });

    it('resets error state when retry button is clicked', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Try Again'));

      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('BookingErrorBoundary', () => {
    it('renders booking-specific error UI', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <BookingErrorBoundary>
          <ThrowError shouldThrow={true} />
        </BookingErrorBoundary>
      );

      expect(screen.getByText('Booking System Error')).toBeInTheDocument();
      expect(screen.getByText('Contact Us')).toBeInTheDocument();
      expect(screen.getByText('+420 123 456 789')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('OfflineHandler', () => {
    it('renders children when online', () => {
      render(
        <OfflineHandler>
          <div>Online content</div>
        </OfflineHandler>
      );

      expect(screen.getByText('Online content')).toBeInTheDocument();
    });

    it('shows offline message when offline', async () => {
      // Simulate offline
      Object.defineProperty(navigator, 'onLine', { value: false });

      render(
        <OfflineHandler>
          <div>Online content</div>
        </OfflineHandler>
      );

      // Trigger offline event
      fireEvent(window, new Event('offline'));

      await waitFor(() => {
        expect(screen.getByText("You're Offline")).toBeInTheDocument();
      });
    });

    it('shows connection restored when back online', async () => {
      // Start offline
      Object.defineProperty(navigator, 'onLine', { value: false });

      render(
        <OfflineHandler>
          <div>Online content</div>
        </OfflineHandler>
      );

      fireEvent(window, new Event('offline'));

      await waitFor(() => {
        expect(screen.getByText("You're Offline")).toBeInTheDocument();
      });

      // Go back online
      Object.defineProperty(navigator, 'onLine', { value: true });
      fireEvent(window, new Event('online'));

      await waitFor(() => {
        expect(screen.getByText('Online content')).toBeInTheDocument();
      });
    });
  });

  describe('useErrorHandling Hook', () => {
    function TestComponent() {
      const { handleError, handleBookingError, handleApiError } = useErrorHandling();

      return (
        <div>
          <button onClick={() => handleError(new Error('Test error'))}>
            Trigger Error
          </button>
          <button onClick={() => handleBookingError(new Error('Booking error'), { tourId: 'test' })}>
            Trigger Booking Error
          </button>
          <button onClick={() => handleApiError(new Error('API error'), '/api/test', 'GET')}>
            Trigger API Error
          </button>
        </div>
      );
    }

    it('handles generic errors', () => {
      render(<TestComponent />);

      fireEvent.click(screen.getByText('Trigger Error'));

      expect(sentry.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object)
      );
    });

    it('handles booking errors with context', () => {
      render(<TestComponent />);

      fireEvent.click(screen.getByText('Trigger Booking Error'));

      expect(sentry.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          tags: expect.objectContaining({
            error_type: 'booking_system',
          }),
        })
      );
    });

    it('handles API errors', () => {
      render(<TestComponent />);

      fireEvent.click(screen.getByText('Trigger API Error'));

      expect(sentry.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          tags: expect.objectContaining({
            error_type: 'api_error',
            endpoint: '/api/test',
            method: 'GET',
          }),
        })
      );
    });
  });

  describe('Error Recovery', () => {
    it('provides retry functionality', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const retryButton = screen.getByText('Try Again');
      expect(retryButton).toBeInTheDocument();

      // Clicking retry should reset the error boundary
      fireEvent.click(retryButton);

      consoleSpy.mockRestore();
    });

    it('provides navigation to home page', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const homeButton = screen.getByText('Go Home');
      expect(homeButton).toBeInTheDocument();
      expect(homeButton.closest('a')).toHaveAttribute('href', '/');

      consoleSpy.mockRestore();
    });
  });

  describe('Offline Data Management', () => {
    beforeEach(() => {
      // Mock localStorage
      const localStorageMock = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      };
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
    });

    it('saves booking drafts when offline', async () => {
      const { saveBookingDraft } = await import('@/components/offline-handler');
      
      const bookingData = {
        tourId: 'test-tour',
        date: '2024-01-15',
        groupSize: 2,
      };

      const draftId = saveBookingDraft(bookingData);

      expect(draftId).toMatch(/^draft_\d+$/);
      expect(localStorage.setItem).toHaveBeenCalled();
    });

    it('caches data for offline access', async () => {
      const { cacheForOffline, getOfflineCache } = await import('@/components/offline-handler');
      
      const testData = { tours: [{ id: 1, title: 'Test Tour' }] };
      
      cacheForOffline('tours', testData);
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'prague-tours-offline',
        expect.stringContaining('tours')
      );
    });
  });

  describe('Performance Monitoring', () => {
    it('reports performance issues above threshold', () => {
      const { PerformanceReporting } = require('@/lib/client-error-reporting');
      
      // Mock performance observer
      global.PerformanceObserver = jest.fn().mockImplementation((callback) => ({
        observe: jest.fn(),
      }));

      PerformanceReporting.monitorWebVitals();

      expect(global.PerformanceObserver).toHaveBeenCalled();
    });
  });
});
