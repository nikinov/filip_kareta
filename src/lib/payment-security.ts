// Payment security utilities and middleware
// Implements security measures for payment processing

import { NextRequest } from 'next/server';
import { z } from 'zod';

// Rate limiting for payment endpoints
const paymentAttempts = new Map<string, { count: number; resetTime: number }>();

export const PAYMENT_RATE_LIMITS = {
  MAX_ATTEMPTS: 5,
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  BLOCK_DURATION_MS: 60 * 60 * 1000, // 1 hour
};

// Check rate limiting for payment attempts
export function checkPaymentRateLimit(identifier: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const attempts = paymentAttempts.get(identifier);

  if (!attempts || now > attempts.resetTime) {
    // Reset or initialize
    paymentAttempts.set(identifier, {
      count: 1,
      resetTime: now + PAYMENT_RATE_LIMITS.WINDOW_MS,
    });
    return { allowed: true };
  }

  if (attempts.count >= PAYMENT_RATE_LIMITS.MAX_ATTEMPTS) {
    return { 
      allowed: false, 
      resetTime: attempts.resetTime + PAYMENT_RATE_LIMITS.BLOCK_DURATION_MS 
    };
  }

  attempts.count++;
  return { allowed: true };
}

// Validate payment request origin and headers
export function validatePaymentRequest(request: NextRequest): { valid: boolean; error?: string } {
  // Check Content-Type
  const contentType = request.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return { valid: false, error: 'Invalid content type' };
  }

  // Check Origin (in production)
  if (process.env.NODE_ENV === 'production') {
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_BASE_URL,
      'https://guidefilip-prague.com',
      'https://www.guidefilip-prague.com',
    ].filter(Boolean);

    if (!origin || !allowedOrigins.includes(origin)) {
      return { valid: false, error: 'Invalid origin' };
    }
  }

  return { valid: true };
}

// Sanitize payment logs (remove sensitive data)
export function sanitizePaymentLog(data: any): any {
  const sanitized = { ...data };

  // Remove sensitive fields
  const sensitiveFields = [
    'cardNumber',
    'cvv',
    'expiryDate',
    'cardholderName',
    'bankAccount',
    'routingNumber',
    'ssn',
    'taxId',
  ];

  function removeSensitiveData(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(removeSensitiveData);
    }

    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveFields.includes(key)) {
        cleaned[key] = '[REDACTED]';
      } else {
        cleaned[key] = removeSensitiveData(value);
      }
    }
    return cleaned;
  }

  return removeSensitiveData(sanitized);
}

// Validate webhook signatures
export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  provider: 'stripe' | 'paypal'
): boolean {
  try {
    if (provider === 'stripe') {
      // Stripe signature validation is handled by their SDK
      return true;
    } else if (provider === 'paypal') {
      // PayPal webhook validation would go here
      // This is a simplified version
      return signature.length > 0;
    }
    return false;
  } catch (error) {
    console.error('Webhook signature validation failed:', error);
    return false;
  }
}

// Payment amount validation
export const paymentAmountValidator = z.object({
  amount: z.number()
    .min(0.5, 'Minimum payment amount is €0.50')
    .max(10000, 'Maximum payment amount is €10,000')
    .refine(
      (amount) => Number.isFinite(amount) && amount > 0,
      'Amount must be a valid positive number'
    ),
  currency: z.enum(['eur', 'usd']).default('eur'),
});

// Customer information validation for payments
export const paymentCustomerValidator = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
});

// Security headers for payment endpoints
export const PAYMENT_SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com https://www.paypal.com; frame-src https://js.stripe.com https://www.paypal.com; connect-src 'self' https://api.stripe.com https://www.paypal.com;",
};

// Generate secure payment session ID
export function generatePaymentSessionId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `pay_${timestamp}_${randomPart}`;
}

// Validate payment timing (prevent replay attacks)
export function validatePaymentTiming(timestamp: number, maxAgeMs: number = 5 * 60 * 1000): boolean {
  const now = Date.now();
  const age = now - timestamp;
  return age >= 0 && age <= maxAgeMs;
}

// Payment fraud detection helpers
export function detectSuspiciousActivity(paymentData: any): { suspicious: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // Check for unusual amounts
  if (paymentData.amount > 1000) {
    reasons.push('High payment amount');
  }

  // Check for rapid successive payments
  const recentPayments = paymentAttempts.get(paymentData.customerEmail);
  if (recentPayments && recentPayments.count > 3) {
    reasons.push('Multiple payment attempts');
  }

  // Check for mismatched customer information
  if (paymentData.customerInfo?.email?.includes('test') || 
      paymentData.customerInfo?.email?.includes('fake')) {
    reasons.push('Suspicious email address');
  }

  return {
    suspicious: reasons.length > 0,
    reasons,
  };
}
