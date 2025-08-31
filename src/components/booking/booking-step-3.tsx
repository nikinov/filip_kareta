'use client';

import { useState } from 'react';
import { Calendar, Clock, Users, Euro, User, Mail, Phone, MapPin, MessageSquare, Shield, CreditCard, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tour, Locale } from '@/types';
import { BookingData } from './booking-flow';
import { StripePayment } from '@/components/payment/stripe-payment';
import { PayPalPayment } from '@/components/payment/paypal-payment';

interface BookingStep3Props {
  tour: Tour;
  locale: Locale;
  bookingData: BookingData;
  onUpdate: (updates: Partial<BookingData>) => void;
  onBookingComplete?: (booking: any) => void;
}

export function BookingStep3({ tour, locale: _locale, bookingData, onUpdate: _onUpdate, onBookingComplete }: BookingStep3Props) {
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string): string => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getCountryName = (countryCode: string): string => {
    const countries: Record<string, string> = {
      'US': 'United States',
      'GB': 'United Kingdom',
      'DE': 'Germany',
      'FR': 'France',
      'IT': 'Italy',
      'ES': 'Spain',
      'NL': 'Netherlands',
      'BE': 'Belgium',
      'AT': 'Austria',
      'CH': 'Switzerland',
      'CZ': 'Czech Republic',
      'PL': 'Poland',
      'HU': 'Hungary',
      'SK': 'Slovakia',
      'CA': 'Canada',
      'AU': 'Australia',
      'JP': 'Japan',
      'KR': 'South Korea',
      'CN': 'China',
      'IN': 'India',
      'BR': 'Brazil',
      'MX': 'Mexico',
      'AR': 'Argentina',
      'RU': 'Russia',
      'TR': 'Turkey',
      'EG': 'Egypt',
      'ZA': 'South Africa',
      'NG': 'Nigeria',
      'KE': 'Kenya',
    };
    return countries[countryCode] || countryCode;
  };

  const calculatePriceBreakdown = () => {
    const baseTotal = tour.basePrice * bookingData.groupSize;
    let discountAmount = 0;
    let seasonalAmount = 0;

    // Group discount
    if (bookingData.groupSize >= 6) {
      discountAmount = baseTotal * 0.1; // 10% discount
    } else if (bookingData.groupSize >= 4) {
      discountAmount = baseTotal * 0.05; // 5% discount
    }

    // Seasonal pricing
    if (bookingData.date) {
      const month = new Date(bookingData.date).getMonth();
      if (month >= 5 && month <= 8) { // June to September
        const afterDiscount = baseTotal - discountAmount;
        seasonalAmount = afterDiscount * 0.15; // 15% summer premium
      }
    }

    return {
      baseTotal,
      discountAmount,
      seasonalAmount,
      finalTotal: bookingData.totalPrice,
    };
  };

  const priceBreakdown = calculatePriceBreakdown();

  const handlePaymentSuccess = async (paymentResult: any) => {
    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      // Confirm payment and create booking
      const response = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId: paymentResult.paymentIntentId || paymentResult.orderId,
          paymentMethod,
          bookingData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Booking confirmation failed');
      }

      const result = await response.json();

      if (onBookingComplete) {
        onBookingComplete(result);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Booking confirmation failed';
      setPaymentError(errorMessage);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
    setIsProcessingPayment(false);
  };

  const handleProceedToPayment = () => {
    if (!agreeToTerms) {
      setPaymentError('Please agree to the Terms and Conditions to proceed');
      return;
    }
    setPaymentError(null);
    setShowPaymentForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Tour Details Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Tour Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            {tour.images.length > 0 && (
              <img
                src={tour.images[0].url}
                alt={tour.images[0].alt.en}
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{tour.title.en}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>{formatDate(bookingData.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{formatTime(bookingData.startTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span>{bookingData.groupSize} {bookingData.groupSize === 1 ? 'person' : 'people'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{Math.floor(tour.duration / 60)}h {tour.duration % 60}m duration</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Your Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span>{bookingData.customerInfo?.firstName} {bookingData.customerInfo?.lastName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span>{bookingData.customerInfo?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span>{bookingData.customerInfo?.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span>{getCountryName(bookingData.customerInfo?.country || '')}</span>
            </div>
          </div>
          
          {bookingData.specialRequests && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-sm">Special Requests:</span>
                </div>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                  {bookingData.specialRequests}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Price Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="w-5 h-5" />
            Price Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Base price ({bookingData.groupSize} × €{tour.basePrice})</span>
              <span>€{priceBreakdown.baseTotal.toFixed(2)}</span>
            </div>
            
            {priceBreakdown.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>
                  Group discount ({bookingData.groupSize >= 6 ? '10%' : '5%'} for {bookingData.groupSize}+ people)
                </span>
                <span>-€{priceBreakdown.discountAmount.toFixed(2)}</span>
              </div>
            )}
            
            {priceBreakdown.seasonalAmount > 0 && (
              <div className="flex justify-between text-amber-600">
                <span>Summer season premium (15%)</span>
                <span>+€{priceBreakdown.seasonalAmount.toFixed(2)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>€{priceBreakdown.finalTotal.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-md p-3 mt-4">
            <div className="flex items-center gap-2 text-green-800 text-sm">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">What's Included:</span>
            </div>
            <ul className="text-sm text-green-700 mt-2 space-y-1">
              <li>• Professional local guide (Filip)</li>
              <li>• Personalized storytelling experience</li>
              <li>• Small group tour (max {tour.maxGroupSize} people)</li>
              <li>• Free cancellation up to 24 hours before</li>
              <li>• Instant confirmation</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="stripe"
                name="payment"
                value="stripe"
                checked={paymentMethod === 'stripe'}
                onChange={(e) => setPaymentMethod(e.target.value as 'stripe' | 'paypal')}
                className="h-4 w-4 text-prague-600 focus:ring-prague-500 border-gray-300"
              />
              <label htmlFor="stripe" className="flex items-center gap-2 cursor-pointer">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  <span className="font-medium">Credit/Debit Card</span>
                </div>
                <div className="text-xs text-gray-500">
                  (Visa, Mastercard, American Express)
                </div>
              </label>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="radio"
                id="paypal"
                name="payment"
                value="paypal"
                checked={paymentMethod === 'paypal'}
                onChange={(e) => setPaymentMethod(e.target.value as 'stripe' | 'paypal')}
                className="h-4 w-4 text-prague-600 focus:ring-prague-500 border-gray-300"
              />
              <label htmlFor="paypal" className="flex items-center gap-2 cursor-pointer">
                <div className="w-5 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                  P
                </div>
                <span className="font-medium">PayPal</span>
              </label>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-center gap-2 text-blue-800 text-sm">
              <Shield className="w-4 h-4" />
              <span className="font-medium">Secure Payment</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Your payment information is encrypted and processed securely. We never store your payment details.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-prague-600 focus:ring-prague-500 border-gray-300 rounded"
                required
              />
              <div className="text-sm">
                <label htmlFor="terms" className="font-medium text-gray-700 cursor-pointer">
                  I agree to the Terms and Conditions *
                </label>
                <div className="text-gray-500 text-xs mt-1 space-y-1">
                  <p>By booking this tour, you agree to our:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><button type="button" className="text-prague-600 hover:underline">Terms of Service</button></li>
                    <li><button type="button" className="text-prague-600 hover:underline">Cancellation Policy</button></li>
                    <li><button type="button" className="text-prague-600 hover:underline">Privacy Policy</button></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <h4 className="font-medium text-sm mb-2">Key Policies:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• <strong>Free Cancellation:</strong> Cancel up to 24 hours before your tour for a full refund</li>
                <li>• <strong>Weather Policy:</strong> Tours run rain or shine. In extreme weather, we'll reschedule or refund</li>
                <li>• <strong>Group Size:</strong> Minimum 1 person, maximum {tour.maxGroupSize} people per booking</li>
                <li>• <strong>Age Requirements:</strong> All ages welcome. Children under 12 receive 20% discount</li>
                <li>• <strong>Meeting Point:</strong> Exact location will be provided in your confirmation email</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Confirmation Notice */}
      <div className="bg-prague-50 border border-prague-200 rounded-md p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-prague-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-prague-800 mb-1">Ready to Book?</p>
            <p className="text-prague-700">
              Click "Confirm Booking" to proceed to secure payment. You'll receive an instant confirmation 
              email with all tour details and Filip's contact information.
            </p>
          </div>
        </div>
      </div>

      {/* Payment Error */}
      {paymentError && (
        <Alert variant="destructive">
          <AlertDescription>{paymentError}</AlertDescription>
        </Alert>
      )}

      {/* Payment Processing or Form */}
      {!showPaymentForm ? (
        <div className="space-y-4">
          {/* Validation Message */}
          {!agreeToTerms && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800">
                Please agree to the Terms and Conditions to complete your booking.
              </p>
            </div>
          )}

          <Button
            onClick={handleProceedToPayment}
            disabled={!agreeToTerms || isProcessingPayment}
            className="w-full bg-prague-600 hover:bg-prague-700 text-white py-3 text-lg"
          >
            Proceed to Payment - €{priceBreakdown.finalTotal.toFixed(2)}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Payment Form */}
          {paymentMethod === 'stripe' ? (
            <StripePayment
              amount={bookingData.totalPrice}
              currency="eur"
              tourId={tour.id}
              bookingData={bookingData}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          ) : (
            <PayPalPayment
              amount={bookingData.totalPrice}
              currency="eur"
              tourId={tour.id}
              bookingData={bookingData}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          )}

          <Button
            onClick={() => setShowPaymentForm(false)}
            variant="outline"
            className="w-full"
            disabled={isProcessingPayment}
          >
            Back to Review
          </Button>
        </div>
      )}
    </div>
  );
}