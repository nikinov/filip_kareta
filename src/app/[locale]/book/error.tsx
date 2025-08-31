'use client';

import { useEffect } from 'react';
// import { useTranslations } from 'next-intl'; // TODO: Replace with Paraglide
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, AlertTriangle, RefreshCw, Phone, Mail, Calendar } from 'lucide-react';
import Link from 'next/link';
import { sentry, ErrorReporting } from '@/lib/sentry';

interface BookingErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BookingError({ error, reset }: BookingErrorProps) {
  // TODO: Replace with Paraglide
  const t = (key: string) => key;

  useEffect(() => {
    // Log booking-specific error
    ErrorReporting.bookingError(error, {
      page: 'booking_flow',
      digest: error.digest,
    });
  }, [error]);

  // Determine error type and customize message
  const getErrorDetails = () => {
    const message = error.message.toLowerCase();
    
    if (message.includes('payment') || message.includes('card')) {
      return {
        icon: CreditCard,
        title: t('paymentError.title', { default: 'Payment Issue' }),
        description: t('paymentError.description', { 
          default: 'There was a problem processing your payment. Please check your payment details and try again.' 
        }),
        suggestions: [
          t('paymentError.suggestion1', { default: 'Verify your card details are correct' }),
          t('paymentError.suggestion2', { default: 'Check if your card has sufficient funds' }),
          t('paymentError.suggestion3', { default: 'Try a different payment method' }),
        ],
      };
    }
    
    if (message.includes('availability') || message.includes('sold out')) {
      return {
        icon: Calendar,
        title: t('availabilityError.title', { default: 'Tour Unavailable' }),
        description: t('availabilityError.description', { 
          default: 'This tour is no longer available for your selected date and time.' 
        }),
        suggestions: [
          t('availabilityError.suggestion1', { default: 'Try selecting a different date' }),
          t('availabilityError.suggestion2', { default: 'Consider a smaller group size' }),
          t('availabilityError.suggestion3', { default: 'Contact us for alternative options' }),
        ],
      };
    }
    
    // Generic booking error
    return {
      icon: AlertTriangle,
      title: t('genericError.title', { default: 'Booking Error' }),
      description: t('genericError.description', { 
        default: 'We encountered an issue while processing your booking. Please try again or contact us for assistance.' 
      }),
      suggestions: [
        t('genericError.suggestion1', { default: 'Refresh the page and try again' }),
        t('genericError.suggestion2', { default: 'Clear your browser cache' }),
        t('genericError.suggestion3', { default: 'Contact us directly to complete your booking' }),
      ],
    };
  };

  const errorDetails = getErrorDetails();
  const IconComponent = errorDetails.icon;

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <IconComponent className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">{errorDetails.title}</CardTitle>
          <CardDescription className="text-base">
            {errorDetails.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Suggestions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">
              {t('suggestions.title', { default: 'What you can try:' })}
            </h4>
            <ul className="space-y-2 text-sm text-blue-800">
              {errorDetails.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
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
              <Link href="/tours">
                <Calendar className="mr-2 h-4 w-4" />
                {t('browseTours', { default: 'Browse Tours' })}
              </Link>
            </Button>
          </div>

          {/* Direct Contact Options */}
          <div className="border-t pt-6">
            <h4 className="font-semibold text-center mb-4">
              {t('directContact.title', { default: 'Need immediate help?' })}
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button asChild variant="outline" size="lg" className="h-auto p-4">
                <a href="tel:+420123456789" className="flex flex-col items-center gap-2">
                  <Phone className="h-5 w-5" />
                  <span className="font-semibold">
                    {t('directContact.phone', { default: 'Call Filip' })}
                  </span>
                  <span className="text-xs opacity-80">+420 123 456 789</span>
                </a>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="h-auto p-4">
                <Link href="/contact" className="flex flex-col items-center gap-2">
                  <Mail className="h-5 w-5" />
                  <span className="font-semibold">
                    {t('directContact.email', { default: 'Send Message' })}
                  </span>
                  <span className="text-xs opacity-80">
                    {t('directContact.emailDescription', { default: 'Get personal assistance' })}
                  </span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Reassurance */}
          <div className="text-center text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
            <p className="mb-2">
              {t('reassurance', { 
                default: 'Don\'t worry - your tour spot isn\'t lost! We\'re here to help you complete your booking.' 
              })}
            </p>
            <p className="text-xs">
              {t('responseTime', { 
                default: 'We typically respond within 2 hours during business hours.' 
              })}
            </p>
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
        </CardContent>
      </Card>
    </div>
  );
}
