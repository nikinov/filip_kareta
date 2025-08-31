// Payment-related TypeScript interfaces and types
// Defines all payment system data structures

export interface PaymentMethod {
  id: 'stripe' | 'paypal';
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  processingFee: number;
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  metadata: Record<string, string>;
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
  timestamp: string;
}

export interface PaymentConfirmation {
  paymentIntentId: string;
  paymentMethod: 'stripe' | 'paypal';
  bookingData: {
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
    specialRequests?: string;
  };
}

export interface PaymentReceipt {
  receiptId: string;
  bookingId: string;
  confirmationCode: string;
  issueDate: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  tour: {
    id: string;
    name: string;
    date: string;
    time: string;
    groupSize: number;
  };
  payment: {
    method: 'stripe' | 'paypal';
    transactionId: string;
    amount: number;
    currency: string;
    processingFee: number;
    receiptUrl?: string;
  };
  totals: {
    subtotal: number;
    processingFee: number;
    total: number;
  };
}

export interface StripePaymentData {
  paymentIntentId: string;
  clientSecret: string;
  status: string;
  amount: number;
  currency: string;
}

export interface PayPalPaymentData {
  orderId: string;
  status: string;
  amount: number;
  currency: string;
  approvalUrl?: string;
}

export interface PaymentError {
  code: string;
  message: string;
  statusCode: number;
  retryable: boolean;
  timestamp: string;
}

export interface PaymentWebhookEvent {
  id: string;
  type: string;
  data: any;
  created: number;
  provider: 'stripe' | 'paypal';
}

export interface PaymentSecurityCheck {
  ipAddress: string;
  userAgent: string;
  timestamp: number;
  riskScore: number;
  flags: string[];
}

// Payment processing states
export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled'
  | 'requires_action';

// Payment method capabilities
export interface PaymentMethodCapabilities {
  supportedCurrencies: string[];
  minimumAmount: number;
  maximumAmount: number;
  processingTime: string;
  refundSupport: boolean;
  recurringSupport: boolean;
}

export const PAYMENT_METHOD_CONFIGS: Record<string, PaymentMethodCapabilities> = {
  stripe: {
    supportedCurrencies: ['eur', 'usd', 'gbp'],
    minimumAmount: 0.5,
    maximumAmount: 10000,
    processingTime: 'instant',
    refundSupport: true,
    recurringSupport: true,
  },
  paypal: {
    supportedCurrencies: ['eur', 'usd', 'gbp'],
    minimumAmount: 1.0,
    maximumAmount: 10000,
    processingTime: 'instant',
    refundSupport: true,
    recurringSupport: false,
  },
};

// Payment validation schemas
export interface PaymentValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface RefundRequest {
  paymentId: string;
  amount?: number; // Partial refund amount, if not provided, full refund
  reason: string;
  bookingId: string;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  estimatedArrival?: string;
  error?: string;
}
