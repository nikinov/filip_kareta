'use client';

import { ReactNode } from 'react';
import { ErrorBoundary } from './error-boundary';
import { sentry } from '@/lib/sentry';

interface RootErrorBoundaryProps {
  children: ReactNode;
}

export function RootErrorBoundary({ children }: RootErrorBoundaryProps) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        sentry.captureException(error, {
          tags: { error_type: 'root_layout' },
          extra: { componentStack: errorInfo.componentStack },
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
