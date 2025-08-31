// Payment utilities and helpers
// Common functions for payment processing and validation

import { z } from 'zod';

export interface PaymentMethod {
  id: 'stripe' | 'paypal';
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  transactionId: string;
  amount: number;
  currency: string;
  method: 'stripe' | 'paypal';
  receiptUrl?: string;
  error?: string;
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

// Payment validation schemas
export const paymentAmountSchema = z.object({
  amount: z.number().min(0.5, 'Minimum payment amount is €0.50').max(10000, 'Maximum payment amount is €10,000'),
  currency: z.enum(['eur', 'usd']).default('eur'),
});

export const paymentMethodSchema = z.enum(['stripe', 'paypal']);

// Available payment methods configuration
export const getAvailablePaymentMethods = (): PaymentMethod[] => {
  return [
    {
      id: 'stripe',
      name: 'Credit/Debit Card',
      description: 'Visa, Mastercard, American Express',
      icon: 'credit-card',
      enabled: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pay with your PayPal account',
      icon: 'paypal',
      enabled: !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    },
  ].filter(method => method.enabled);
};

// Format currency for display
export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Calculate payment processing fees
export const calculateProcessingFee = (amount: number, method: 'stripe' | 'paypal'): number => {
  if (method === 'stripe') {
    // Stripe: 2.9% + €0.30 per transaction
    return (amount * 0.029) + 0.30;
  } else if (method === 'paypal') {
    // PayPal: 3.4% + €0.35 per transaction
    return (amount * 0.034) + 0.35;
  }
  return 0;
};

// Validate payment amount against tour pricing
export const validatePaymentAmount = (
  expectedAmount: number,
  actualAmount: number,
  tolerance: number = 0.01
): boolean => {
  return Math.abs(expectedAmount - actualAmount) <= tolerance;
};

// Generate receipt data
export const generateReceiptData = (
  booking: any,
  payment: PaymentResult
): any => {
  return {
    receiptId: `RCP-${booking.id}-${Date.now()}`,
    bookingId: booking.id,
    confirmationCode: booking.confirmationCode || booking.id,
    issueDate: new Date().toISOString(),
    customer: {
      name: `${booking.customerInfo.firstName} ${booking.customerInfo.lastName}`,
      email: booking.customerInfo.email,
      phone: booking.customerInfo.phone,
    },
    tour: {
      id: booking.tourId,
      name: booking.tourId.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      date: booking.date,
      time: booking.startTime,
      groupSize: booking.groupSize,
    },
    payment: {
      method: payment.method,
      transactionId: payment.transactionId,
      amount: payment.amount,
      currency: payment.currency,
      processingFee: calculateProcessingFee(payment.amount, payment.method),
      receiptUrl: payment.receiptUrl,
    },
    totals: {
      subtotal: payment.amount,
      processingFee: calculateProcessingFee(payment.amount, payment.method),
      total: payment.amount,
    },
  };
};

// Security helpers
export const sanitizePaymentData = (data: any): any => {
  // Remove sensitive payment information before logging
  const sanitized = { ...data };
  
  // Remove card details, CVV, etc.
  delete sanitized.cardNumber;
  delete sanitized.cvv;
  delete sanitized.expiryDate;
  delete sanitized.cardholderName;
  
  // Keep only safe payment metadata
  if (sanitized.payment) {
    sanitized.payment = {
      method: sanitized.payment.method,
      amount: sanitized.payment.amount,
      currency: sanitized.payment.currency,
      status: sanitized.payment.status,
    };
  }
  
  return sanitized;
};

// Payment error handling
export class PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

export const PaymentErrorCodes = {
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  PAYMENT_DECLINED: 'PAYMENT_DECLINED',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  EXPIRED_CARD: 'EXPIRED_CARD',
  INVALID_CARD: 'INVALID_CARD',
  PROCESSING_ERROR: 'PROCESSING_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  WEBHOOK_ERROR: 'WEBHOOK_ERROR',
  BOOKING_CONFLICT: 'BOOKING_CONFLICT',
} as const;

export const handlePaymentError = (error: unknown): PaymentError => {
  if (error instanceof PaymentError) {
    return error;
  }

  if (error instanceof Error) {
    // Map common Stripe/PayPal errors to our error codes
    if (error.message.includes('card_declined')) {
      return new PaymentError(
        'Your card was declined. Please try a different payment method.',
        PaymentErrorCodes.PAYMENT_DECLINED,
        400,
        true
      );
    }
    
    if (error.message.includes('insufficient_funds')) {
      return new PaymentError(
        'Insufficient funds. Please check your account balance.',
        PaymentErrorCodes.INSUFFICIENT_FUNDS,
        400,
        true
      );
    }
    
    if (error.message.includes('expired_card')) {
      return new PaymentError(
        'Your card has expired. Please use a different card.',
        PaymentErrorCodes.EXPIRED_CARD,
        400,
        false
      );
    }

    return new PaymentError(
      error.message,
      PaymentErrorCodes.PROCESSING_ERROR,
      500,
      true
    );
  }

  return new PaymentError(
    'An unexpected payment error occurred',
    PaymentErrorCodes.PROCESSING_ERROR,
    500,
    true
  );
};
