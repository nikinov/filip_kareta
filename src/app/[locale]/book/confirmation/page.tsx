import { Suspense } from 'react';
import { CheckCircle, Calendar, Clock, Users, Euro, Mail, Phone, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PaymentReceipt } from '@/components/payment/payment-receipt';
import Link from 'next/link';
import { Locale } from '@/types';

interface ConfirmationPageProps {
  params: Promise<{
    locale: Locale;
  }>;
  searchParams: Promise<{
    booking?: string;
  }>;
}

function ConfirmationContent({ bookingData, locale }: { bookingData: any; locale: string }) {
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

  // Check if this is a payment-enabled booking or legacy booking
  const hasPaymentData = bookingData?.booking && bookingData?.payment;
  const confirmationCode = bookingData?.confirmationCode || `FP${Date.now().toString().slice(-6)}`;

  if (hasPaymentData) {
    // New payment-enabled booking confirmation
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Booking Confirmed!
            </h1>
            <p className="text-gray-600">
              Thank you for booking your Prague tour with Filip. Check your email for detailed confirmation.
            </p>
          </div>

          <PaymentReceipt
            booking={bookingData.booking}
            payment={bookingData.payment}
            confirmationCode={confirmationCode}
          />

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/${locale}`}>
              <Button variant="outline" className="w-full sm:w-auto">
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Button>
            </Link>

            <Link href={`/${locale}/tours`}>
              <Button variant="outline" className="w-full sm:w-auto">
                <Calendar className="w-4 h-4 mr-2" />
                Browse More Tours
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Legacy booking confirmation (fallback)
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600">
            Your Prague tour has been successfully booked. Check your email for confirmation details.
          </p>
        </div>

        {/* Confirmation Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Booking Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="text-center">
                <p className="text-sm text-green-700 mb-1">Confirmation Code</p>
                <p className="text-2xl font-bold text-green-800">{confirmationCode}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tour:</span>
                <span className="font-medium">Prague Castle & Lesser Town</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Date:
                </span>
                <span className="font-medium">{formatDate(bookingData?.date)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Time:
                </span>
                <span className="font-medium">{formatTime(bookingData?.startTime)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Group Size:
                </span>
                <span className="font-medium">
                  {bookingData?.groupSize} {bookingData?.groupSize === 1 ? 'person' : 'people'}
                </span>
              </div>
              <div className="flex justify-between items-center font-bold text-lg">
                <span className="flex items-center gap-1">
                  <Euro className="w-5 h-5" />
                  Total Paid:
                </span>
                <span>€{bookingData?.totalPrice?.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Guide: Filip</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-prague-100 rounded-full flex items-center justify-center">
                <span className="text-prague-600 font-bold text-lg">F</span>
              </div>
              <div>
                <p className="font-medium">Filip Kareta</p>
                <p className="text-sm text-gray-600">Licensed Prague Tour Guide</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>filip@guidefilip-prague.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>+420 123 456 789</span>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                <strong>Meeting Point:</strong> Filip will contact you 24 hours before your tour 
                with the exact meeting location and his contact details for the day of the tour.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* What's Next */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-prague-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-prague-600 font-bold text-xs">1</span>
                </div>
                <div>
                  <p className="font-medium">Confirmation Email</p>
                  <p className="text-gray-600">You'll receive a detailed confirmation email within 5 minutes</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-prague-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-prague-600 font-bold text-xs">2</span>
                </div>
                <div>
                  <p className="font-medium">Pre-Tour Contact</p>
                  <p className="text-gray-600">Filip will reach out 24 hours before with meeting details</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-prague-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-prague-600 font-bold text-xs">3</span>
                </div>
                <div>
                  <p className="font-medium">Enjoy Your Tour</p>
                  <p className="text-gray-600">Meet Filip at the designated location and enjoy your Prague experience</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button asChild className="flex-1">
            <Link href="/en">
              Return to Homepage
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link href="/en/tours">
              Browse More Tours
            </Link>
          </Button>
        </div>

        {/* Support Information */}
        <div className="text-center text-sm text-gray-600">
          <p>Need help? Contact us at <a href="mailto:support@guidefilip-prague.com" className="text-prague-600 hover:underline">support@guidefilip-prague.com</a></p>
          <p className="mt-1">or call <a href="tel:+420123456789" className="text-prague-600 hover:underline">+420 123 456 789</a></p>
        </div>
      </div>
    </div>
  );
}

export default async function ConfirmationPage({ params, searchParams }: ConfirmationPageProps) {
  const { locale } = await params;
  const { booking } = await searchParams;

  let bookingData = null;

  if (booking) {
    try {
      bookingData = JSON.parse(decodeURIComponent(booking));
    } catch (error) {
      console.error('Error parsing booking data:', error);
    }
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-prague-500"></div>
      </div>
    }>
      <ConfirmationContent bookingData={bookingData} locale={locale} />
    </Suspense>
  );
}

export async function generateMetadata({ params }: ConfirmationPageProps) {
  return {
    title: 'Booking Confirmed - Prague Tours with Filip',
    description: 'Your Prague tour booking has been confirmed. Check your email for details.',
    robots: 'noindex, nofollow', // Confirmation pages shouldn't be indexed
  };
}