'use client';

// PayPal payment component for alternative checkout
// Handles PayPal SDK integration and payment processing

import { useState } from 'react';
import {
  PayPalScriptProvider,
  PayPalButtons,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface PayPalPaymentProps {
  amount: number;
  currency: string;
  tourId: string;
  bookingData: any;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
}

interface PayPalButtonWrapperProps {
  amount: number;
  currency: string;
  tourId: string;
  bookingData: any;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
}

const PayPalButtonWrapper = ({
  amount,
  currency,
  tourId,
  bookingData,
  onPaymentSuccess,
  onPaymentError,
}: PayPalButtonWrapperProps) => {
  const [{ isPending }] = usePayPalScriptReducer();
  const [isProcessing, setIsProcessing] = useState(false);

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading PayPal...</span>
      </div>
    );
  }

  return (
    <PayPalButtons
      style={{
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'paypal',
      }}
      disabled={isProcessing}
      createOrder={async () => {
        setIsProcessing(true);
        try {
          const response = await fetch('/api/payment/paypal', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount,
              currency,
              tourId,
              bookingData,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create PayPal order');
          }

          const data = await response.json();
          return data.orderId;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'PayPal order creation failed';
          onPaymentError(errorMessage);
          setIsProcessing(false);
          throw error;
        }
      }}
      onApprove={async (data) => {
        try {
          const response = await fetch('/api/payment/paypal', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: data.orderID,
              bookingData,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Payment capture failed');
          }

          const result = await response.json();
          onPaymentSuccess({
            orderId: data.orderID,
            status: 'completed',
            booking: result.booking,
            confirmationCode: result.confirmationCode,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
          onPaymentError(errorMessage);
        } finally {
          setIsProcessing(false);
        }
      }}
      onError={(error) => {
        console.error('PayPal error:', error);
        onPaymentError('PayPal payment failed. Please try again.');
        setIsProcessing(false);
      }}
      onCancel={() => {
        onPaymentError('Payment was cancelled');
        setIsProcessing(false);
      }}
    />
  );
};

export function PayPalPayment({
  amount,
  currency,
  tourId,
  bookingData,
  onPaymentSuccess,
  onPaymentError,
}: PayPalPaymentProps) {
  const paypalOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
    currency: currency.toUpperCase(),
    intent: 'capture',
    components: 'buttons',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-5 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
            P
          </div>
          PayPal Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p>Pay securely with your PayPal account or credit card through PayPal.</p>
          </div>
          
          <PayPalScriptProvider options={paypalOptions}>
            <PayPalButtonWrapper
              amount={amount}
              currency={currency}
              tourId={tourId}
              bookingData={bookingData}
              onPaymentSuccess={onPaymentSuccess}
              onPaymentError={onPaymentError}
            />
          </PayPalScriptProvider>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-4 h-4 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
              P
            </div>
            <span>Secured by PayPal</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
