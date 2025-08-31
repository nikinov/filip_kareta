'use client';

import { useEffect } from 'react';
// import { useTranslations } from 'next-intl'; // TODO: Replace with Paraglide
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';
import Link from 'next/link';
import { sentry } from '@/lib/sentry';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  // TODO: Replace with Paraglide
  const t = (key: string) => key;

  useEffect(() => {
    // Log error to Sentry and analytics
    sentry.captureException(error, {
      tags: { 
        error_type: 'page_error',
        error_digest: error.digest,
      },
      extra: {
        digest: error.digest,
        timestamp: new Date().toISOString(),
        page_type: 'localized_page',
      },
    });

    // Track in Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        error_digest: error.digest,
        page_error: true,
      });
    }
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">
            {t('title', { default: 'Something went wrong' })}
          </CardTitle>
          <CardDescription className="text-base">
            {t('description', { 
              default: 'We encountered an unexpected error. Please try refreshing the page or contact us if the problem persists.' 
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button 
              onClick={reset}
              className="flex-1"
              variant="default"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('tryAgain', { default: 'Try Again' })}
            </Button>
            <Button 
              asChild
              variant="outline"
              className="flex-1"
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                {t('goHome', { default: 'Go Home' })}
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              {t('contactPrompt', { 
                default: 'If the problem persists, please contact us:' 
              })}
            </p>
            <Button asChild variant="ghost" size="sm">
              <Link href="/contact">
                <Mail className="mr-2 h-4 w-4" />
                {t('contactSupport', { default: 'Contact Support' })}
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              {t('alternativeContact', { default: 'Or reach out directly:' })}
            </p>
            <div className="space-y-1 text-sm">
              <p>
                <strong>{t('phone', { default: 'Phone' })}:</strong>{' '}
                <a href="tel:+420123456789" className="text-prague-600 hover:underline">
                  +420 123 456 789
                </a>
              </p>
              <p>
                <strong>{t('email', { default: 'Email' })}:</strong>{' '}
                <a href="mailto:filip@guidefilip-prague.com" className="text-prague-600 hover:underline">
                  filip@guidefilip-prague.com
                </a>
              </p>
            </div>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                {t('technicalDetails', { default: 'Technical Details' })}
              </summary>
              <div className="mt-3 rounded bg-gray-100 p-4 text-xs font-mono">
                <div className="mb-2">
                  <strong>Error:</strong> {error.message}
                </div>
                {error.digest && (
                  <div className="mb-2">
                    <strong>Digest:</strong> {error.digest}
                  </div>
                )}
                {error.stack && (
                  <div>
                    <strong>Stack:</strong>
                    <pre className="mt-1 whitespace-pre-wrap text-xs">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          <div className="text-center text-xs text-gray-500">
            {t('errorId', { default: 'Error ID' })}: {error.digest || 'N/A'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
