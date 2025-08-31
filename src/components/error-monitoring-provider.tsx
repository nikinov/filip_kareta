'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { clientErrorReporter, PerformanceReporting } from '@/lib/client-error-reporting';
import { sentry } from '@/lib/sentry';

interface ErrorMonitoringContextType {
  isOnline: boolean;
  errorCount: number;
  lastError: Error | null;
  reportError: (error: Error, context?: any) => void;
  clearErrors: () => void;
}

const ErrorMonitoringContext = createContext<ErrorMonitoringContextType | null>(null);

export function useErrorMonitoring() {
  const context = useContext(ErrorMonitoringContext);
  if (!context) {
    throw new Error('useErrorMonitoring must be used within ErrorMonitoringProvider');
  }
  return context;
}

interface ErrorMonitoringProviderProps {
  children: ReactNode;
  userId?: string;
}

export function ErrorMonitoringProvider({ children, userId }: ErrorMonitoringProviderProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [errorCount, setErrorCount] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);

  useEffect(() => {
    // Initialize error monitoring
    if (userId) {
      clientErrorReporter.setUserId(userId);
      sentry.setUser({ id: userId });
    }

    // Set up performance monitoring
    PerformanceReporting.monitorWebVitals();

    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Global error handlers
    const handleGlobalError = (event: ErrorEvent) => {
      const error = new Error(event.message);
      error.stack = event.error?.stack;
      reportError(error, {
        type: 'global_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      reportError(error, {
        type: 'unhandled_rejection',
      });
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [userId]);

  const reportError = (error: Error, context?: any) => {
    setErrorCount(prev => prev + 1);
    setLastError(error);

    // Report to all monitoring services
    clientErrorReporter.reportError({
      message: error.message,
      stack: error.stack,
      ...context,
    });
  };

  const clearErrors = () => {
    setErrorCount(0);
    setLastError(null);
  };

  const value: ErrorMonitoringContextType = {
    isOnline,
    errorCount,
    lastError,
    reportError,
    clearErrors,
  };

  return (
    <ErrorMonitoringContext.Provider value={value}>
      {children}
      
      {/* Development error overlay */}
      {process.env.NODE_ENV === 'development' && errorCount > 0 && (
        <ErrorDebugOverlay 
          errorCount={errorCount}
          lastError={lastError}
          onClear={clearErrors}
        />
      )}
    </ErrorMonitoringContext.Provider>
  );
}

// Development error debug overlay
function ErrorDebugOverlay({ 
  errorCount, 
  lastError, 
  onClear 
}: {
  errorCount: number;
  lastError: Error | null;
  onClear: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-red-100 border border-red-300 rounded-lg shadow-lg">
        <div 
          className="p-3 cursor-pointer flex items-center justify-between"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-red-800">
              {errorCount} Error{errorCount !== 1 ? 's' : ''}
            </span>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="text-red-600 hover:text-red-800 text-xs"
          >
            Clear
          </button>
        </div>
        
        {isExpanded && lastError && (
          <div className="p-3 border-t border-red-200 bg-red-50">
            <div className="text-xs font-mono text-red-800">
              <div className="font-semibold mb-1">Latest Error:</div>
              <div className="mb-2">{lastError.message}</div>
              {lastError.stack && (
                <details>
                  <summary className="cursor-pointer">Stack Trace</summary>
                  <pre className="mt-1 text-xs whitespace-pre-wrap">
                    {lastError.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Hook for accessing error monitoring in components
export function useErrorMonitoringStatus() {
  const { isOnline, errorCount, lastError } = useErrorMonitoring();
  
  return {
    isOnline,
    hasErrors: errorCount > 0,
    errorCount,
    lastError,
    isHealthy: isOnline && errorCount === 0,
  };
}

// Component for displaying error status in UI
export function ErrorStatusIndicator() {
  const { isOnline, errorCount } = useErrorMonitoring();

  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 text-orange-600 text-sm">
        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
        <span>Offline</span>
      </div>
    );
  }

  if (errorCount > 0 && process.env.NODE_ENV === 'development') {
    return (
      <div className="flex items-center gap-2 text-red-600 text-sm">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        <span>{errorCount} Error{errorCount !== 1 ? 's' : ''}</span>
      </div>
    );
  }

  return null;
}
