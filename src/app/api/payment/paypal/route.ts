// PayPal payment processing API route
// Handles PayPal order creation and capture

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { BookingValidator, handleBookingError } from '@/lib/booking-validation';

const createPayPalOrderSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  currency: z.string().default('EUR'),
  tourId: z.string().min(1, 'Tour ID is required'),
  bookingData: z.object({
    tourId: z.string(),
    date: z.string(),
    startTime: z.string(),
    groupSize: z.number(),
    totalPrice: z.number(),
    customerInfo: z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
      phone: z.string(),
    }),
    specialRequests: z.string().optional(),
  }),
});

const capturePayPalOrderSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  bookingData: z.object({
    tourId: z.string(),
    date: z.string(),
    startTime: z.string(),
    groupSize: z.number(),
    totalPrice: z.number(),
    customerInfo: z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
      phone: z.string(),
    }),
    specialRequests: z.string().optional(),
  }),
});

// Get PayPal access token
async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com';

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token');
  }

  const data = await response.json();
  return data.access_token;
}

// Create PayPal order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createPayPalOrderSchema.parse(body);

    // Validate booking data
    const bookingValidation = BookingValidator.validateCompleteBooking(validatedData.bookingData);
    if (!bookingValidation.valid) {
      return NextResponse.json(
        { 
          error: 'Invalid booking data',
          details: bookingValidation.errors 
        },
        { status: 400 }
      );
    }

    const accessToken = await getPayPalAccessToken();
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: validatedData.currency,
          value: validatedData.amount.toFixed(2),
        },
        description: `Prague Tour: ${validatedData.tourId} for ${validatedData.bookingData.groupSize} people`,
        custom_id: `tour_${validatedData.tourId}_${Date.now()}`,
      }],
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book/confirmation`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/book/${validatedData.tourId}`,
        brand_name: 'Filip Kareta - Prague Tours',
        user_action: 'PAY_NOW',
      },
    };

    const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error('Failed to create PayPal order');
    }

    const order = await response.json();

    return NextResponse.json({
      orderId: order.id,
      approvalUrl: order.links.find((link: any) => link.rel === 'approve')?.href,
    });

  } catch (error) {
    console.error('PayPal order creation failed:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    const bookingError = handleBookingError(error);
    return NextResponse.json(
      { 
        error: bookingError.message,
        code: bookingError.code 
      },
      { status: bookingError.statusCode }
    );
  }
}

// Capture PayPal payment
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = capturePayPalOrderSchema.parse(body);

    const accessToken = await getPayPalAccessToken();
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';

    // Capture the PayPal order
    const response = await fetch(`${baseUrl}/v2/checkout/orders/${validatedData.orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to capture PayPal payment');
    }

    const captureData = await response.json();

    if (captureData.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'PayPal payment not completed' },
        { status: 400 }
      );
    }

    // Create booking with provider
    const provider = getBookingProvider();
    const bookingResult = await provider.createBooking(validatedData.bookingData);

    if (!bookingResult.success) {
      console.error('Critical: PayPal payment succeeded but booking failed', {
        orderId: validatedData.orderId,
        bookingData: validatedData.bookingData,
        error: bookingResult.error,
      });

      return NextResponse.json(
        { 
          error: 'Booking creation failed after payment. Please contact support.',
          paymentId: validatedData.orderId,
          requiresManualIntervention: true,
        },
        { status: 500 }
      );
    }

    const paymentDetails = {
      method: 'paypal',
      transactionId: captureData.id,
      amount: parseFloat(captureData.purchase_units[0].payments.captures[0].amount.value),
      currency: captureData.purchase_units[0].payments.captures[0].amount.currency_code,
    };

    // Send confirmation email
    try {
      await sendBookingConfirmationEmail({
        booking: bookingResult.booking!,
        paymentDetails,
        customerEmail: validatedData.bookingData.customerInfo.email,
      });
    } catch (emailError) {
      console.error('Email confirmation failed:', emailError);
    }

    return NextResponse.json({
      success: true,
      booking: bookingResult.booking,
      confirmationCode: bookingResult.confirmationCode,
      payment: paymentDetails,
    });

  } catch (error) {
    console.error('PayPal payment capture failed:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    const bookingError = handleBookingError(error);
    return NextResponse.json(
      { 
        error: bookingError.message,
        code: bookingError.code 
      },
      { status: bookingError.statusCode }
    );
  }
}
