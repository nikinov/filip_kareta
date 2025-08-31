'use client';

// Payment receipt component for booking confirmations
// Displays payment details and booking information

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Download, 
  Mail, 
  Calendar, 
  Clock, 
  Users, 
  CreditCard,
  MapPin,
  Phone
} from 'lucide-react';

interface PaymentReceiptProps {
  booking: {
    id: string;
    tourId: string;
    date: string;
    startTime: string;
    groupSize: number;
    totalPrice: number;
    customerInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    status: string;
  };
  payment: {
    method: 'stripe' | 'paypal';
    transactionId: string;
    amount: number;
    currency: string;
    receiptUrl?: string;
  };
  confirmationCode: string;
}

export function PaymentReceipt({ booking, payment, confirmationCode }: PaymentReceiptProps) {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTourName = (tourId: string): string => {
    return tourId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleDownloadReceipt = () => {
    if (payment.receiptUrl) {
      window.open(payment.receiptUrl, '_blank');
    } else {
      // Generate a simple receipt download
      const receiptContent = `
BOOKING RECEIPT
Filip Kareta - Prague Tours

Booking ID: ${booking.id}
Confirmation Code: ${confirmationCode}

Tour: ${getTourName(booking.tourId)}
Date: ${formatDate(booking.date)}
Time: ${formatTime(booking.startTime)}
Group Size: ${booking.groupSize} ${booking.groupSize === 1 ? 'person' : 'people'}

Customer: ${booking.customerInfo.firstName} ${booking.customerInfo.lastName}
Email: ${booking.customerInfo.email}
Phone: ${booking.customerInfo.phone}

Payment Method: ${payment.method === 'stripe' ? 'Credit/Debit Card' : 'PayPal'}
Transaction ID: ${payment.transactionId}
Amount Paid: €${payment.amount.toFixed(2)}

Thank you for booking with Filip Kareta Prague Tours!
      `;

      const blob = new Blob([receiptContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${booking.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-800">Payment Successful!</h2>
              <p className="text-green-700 mt-2">
                Your Prague tour has been booked and confirmed.
              </p>
            </div>
            <div className="bg-white border border-green-200 rounded-lg p-4 inline-block">
              <p className="text-sm text-gray-600">Confirmation Code</p>
              <p className="text-xl font-mono font-bold text-green-800">{confirmationCode}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Your Tour Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">{getTourName(booking.tourId)}</p>
                  <p className="text-sm text-gray-600">Prague, Czech Republic</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">{formatDate(booking.date)}</p>
                  <p className="text-sm text-gray-600">Tour Date</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">{formatTime(booking.startTime)}</p>
                  <p className="text-sm text-gray-600">Start Time</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">{booking.groupSize} {booking.groupSize === 1 ? 'Person' : 'People'}</p>
                  <p className="text-sm text-gray-600">Group Size</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">{booking.customerInfo.email}</p>
                  <p className="text-sm text-gray-600">Confirmation sent to</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="font-medium">{booking.customerInfo.phone}</p>
                  <p className="text-sm text-gray-600">Contact Number</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="font-medium">
                {payment.method === 'stripe' ? 'Credit/Debit Card' : 'PayPal'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Transaction ID</p>
              <p className="font-mono text-sm">{payment.transactionId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Amount Paid</p>
              <p className="font-bold text-lg">€{payment.amount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Status</p>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-medium">Confirmed</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleDownloadReceipt}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Receipt
            </Button>
            
            {payment.receiptUrl && (
              <Button
                onClick={() => window.open(payment.receiptUrl, '_blank')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                View Payment Receipt
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">What's Next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm text-blue-700">
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Check your email for detailed confirmation and meeting instructions</span>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>You'll receive a reminder email 24 hours before your tour</span>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Filip will contact you if any changes are needed</span>
            </div>
          </div>
          
          <div className="bg-white border border-blue-200 rounded-md p-3 mt-4">
            <p className="text-sm text-blue-800">
              <strong>Need help?</strong> Contact Filip directly at{' '}
              <a href="mailto:filip@guidefilip-prague.com" className="underline">
                filip@guidefilip-prague.com
              </a>{' '}
              or <a href="tel:+420123456789" className="underline">+420 123 456 789</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
