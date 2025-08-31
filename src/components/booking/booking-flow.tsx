'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookingStep1 } from './booking-step-1';
import { BookingStep2 } from './booking-step-2';
import { BookingStep3 } from './booking-step-3';
import { Tour, CustomerInfo, Locale } from '@/types';
import { BookingValidator } from '@/lib/booking-validation';
import { useBookingAnalytics } from '@/components/analytics/analytics-provider';
import { BookingErrorBoundary, useErrorReporting } from '@/components/error-boundary';
import { saveBookingDraft } from '@/components/offline-handler';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface BookingData {
  tourId: string;
  date: string;
  startTime: string;
  groupSize: number;
  totalPrice: number;
  customerInfo?: CustomerInfo;
  specialRequests?: string;
}

interface BookingFlowProps {
  tour: Tour;
  locale: Locale;
  initialData?: Partial<BookingData>;
  onComplete?: (bookingData: BookingData) => void;
}

export function BookingFlow({ tour, locale, initialData, onComplete }: BookingFlowProps) {
  const router = useRouter();
  const { trackStep, trackCompletion } = useBookingAnalytics(tour.id);
  const { reportBookingError } = useErrorReporting();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<any>(null);
  
  const [bookingData, setBookingData] = useState<BookingData>({
    tourId: tour.id,
    date: '',
    startTime: '',
    groupSize: 2,
    totalPrice: 0,
    ...initialData,
  });

  const updateBookingData = useCallback((updates: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...updates }));
    setErrors([]); // Clear errors when data changes
  }, []);

  const validateCurrentStep = useCallback((): boolean => {
    const newErrors: string[] = [];

    switch (currentStep) {
      case 1:
        if (!bookingData.date) {
          newErrors.push('Please select a date');
        }
        if (!bookingData.startTime) {
          newErrors.push('Please select a time');
        }
        if (bookingData.groupSize < 1) {
          newErrors.push('Group size must be at least 1');
        }

        // Business validation for step 1
        if (bookingData.date) {
          const dateValidation = BookingValidator.validateBookingDate(bookingData.date);
          if (!dateValidation.valid && dateValidation.error) {
            newErrors.push(dateValidation.error);
          }

          const timeValidation = BookingValidator.validateBookingTime(bookingData.startTime, bookingData.date);
          if (!timeValidation.valid && timeValidation.error) {
            newErrors.push(timeValidation.error);
          }

          const availabilityValidation = BookingValidator.validateTourAvailability(tour.id, bookingData.date);
          if (!availabilityValidation.valid && availabilityValidation.error) {
            newErrors.push(availabilityValidation.error);
          }
        }

        const groupSizeValidation = BookingValidator.validateGroupSize(bookingData.groupSize, tour.id);
        if (!groupSizeValidation.valid && groupSizeValidation.error) {
          newErrors.push(groupSizeValidation.error);
        }
        break;

      case 2:
        if (!bookingData.customerInfo) {
          newErrors.push('Customer information is required');
          break;
        }

        const { customerInfo } = bookingData;
        if (!customerInfo.firstName?.trim()) {
          newErrors.push('First name is required');
        }
        if (!customerInfo.lastName?.trim()) {
          newErrors.push('Last name is required');
        }
        if (!customerInfo.email?.trim()) {
          newErrors.push('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
          newErrors.push('Please enter a valid email address');
        }
        if (!customerInfo.phone?.trim()) {
          newErrors.push('Phone number is required');
        }
        if (!customerInfo.country?.trim()) {
          newErrors.push('Country is required');
        }
        break;

      case 3:
        // Final validation before submission
        const completeValidation = BookingValidator.validateCompleteBooking(bookingData);
        if (!completeValidation.valid) {
          newErrors.push(...completeValidation.errors);
        }
        break;
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  }, [currentStep, bookingData, tour.id]);

  const handleNext = useCallback(async () => {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep < 3) {
      // Track step completion
      trackStep(currentStep);
      setCurrentStep(prev => prev + 1);
    } else {
      // Final step - submit booking
      setIsLoading(true);
      try {
        // Save booking draft for offline recovery
        const draftId = saveBookingDraft(bookingData);

        if (onComplete) {
          await onComplete(bookingData);
        } else {
          // Default behavior - redirect to confirmation
          router.push(`/${locale}/book/confirmation?booking=${encodeURIComponent(JSON.stringify(bookingData))}`);
        }
      } catch (error) {
        console.error('Booking submission error:', error);

        // Report error with context
        reportBookingError(error as Error, {
          step: 'submission',
          tourId: tour.id,
          groupSize: bookingData.groupSize,
          date: bookingData.date,
        });

        // Check if it's a network error and user is offline
        if (!navigator.onLine) {
          setErrors([
            'You appear to be offline. Your booking has been saved and will be submitted when you reconnect to the internet.',
            'You can also call us directly at +420 123 456 789 to complete your booking.'
          ]);
        } else {
          setErrors(['An error occurred while processing your booking. Please try again or contact us for assistance.']);
        }
      } finally {
        setIsLoading(false);
      }
    }
  }, [currentStep, validateCurrentStep, bookingData, onComplete, router, locale, reportBookingError, tour.id]);

  const handlePaymentComplete = useCallback((result: any) => {
    setCompletedBooking(result);
    setBookingComplete(true);

    // Track booking completion
    if (result.bookingId && result.totalPrice) {
      trackCompletion(result.bookingId, result.totalPrice, result.currency || 'EUR');
    }

    if (onComplete) {
      onComplete(result);
    } else {
      // Redirect to confirmation page with booking details
      router.push(`/${locale}/book/confirmation?booking=${encodeURIComponent(JSON.stringify(result))}`);
    }
  }, [onComplete, router, locale, trackCompletion]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setErrors([]);
    }
  }, [currentStep]);

  const getStepTitle = (step: number): string => {
    switch (step) {
      case 1:
        return 'Select Date & Time';
      case 2:
        return 'Your Information';
      case 3:
        return 'Review & Confirm';
      default:
        return '';
    }
  };

  const getButtonText = (): string => {
    switch (currentStep) {
      case 1:
        return 'Continue to Information';
      case 2:
        return 'Review Booking';
      case 3:
        return 'Confirm Booking';
      default:
        return 'Continue';
    }
  };

  return (
    <BookingErrorBoundary>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">
                {getStepTitle(currentStep)}
              </CardTitle>
              <div className="text-sm text-gray-500">
                Step {currentStep} of 3
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div
                className="bg-prague-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Display */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-red-800 text-sm">
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Step Content */}
            {currentStep === 1 && (
              <BookingStep1
                tour={tour}
                locale={locale}
                bookingData={bookingData}
                onUpdate={updateBookingData}
              />
            )}

            {currentStep === 2 && (
              <BookingStep2
                tour={tour}
                locale={locale}
                bookingData={bookingData}
                onUpdate={updateBookingData}
              />
            )}

            {currentStep === 3 && (
              <BookingStep3
                tour={tour}
                locale={locale}
                bookingData={bookingData}
                onUpdate={updateBookingData}
                onBookingComplete={handlePaymentComplete}
              />
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || isLoading}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                loading={isLoading}
                disabled={isLoading}
                variant={currentStep === 3 ? 'cta' : 'default'}
                className="flex items-center gap-2"
              >
                {getButtonText()}
                {currentStep < 3 && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* NoScript fallback for JavaScript-disabled users */}
        <noscript>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              JavaScript is required for the booking form. Please enable JavaScript or contact us directly.
            </p>
          </div>
        </noscript>
      </div>
    </BookingErrorBoundary>
  );
}