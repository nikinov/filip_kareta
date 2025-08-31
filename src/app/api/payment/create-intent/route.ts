// Stripe payment intent creation API route
// Creates payment intents for secure checkout processing

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { BookingValidator, handleBookingError } from '@/lib/booking-validation';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const createPaymentIntentSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  currency: z.string().default('eur'),
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createPaymentIntentSchema.parse(body);

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

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(validatedData.amount * 100), // Convert to cents
      currency: validatedData.currency,
      metadata: {
        tourId: validatedData.tourId,
        bookingDate: validatedData.bookingData.date,
        groupSize: validatedData.bookingData.groupSize.toString(),
        customerEmail: validatedData.bookingData.customerInfo.email,
        customerName: `${validatedData.bookingData.customerInfo.firstName} ${validatedData.bookingData.customerInfo.lastName}`,
      },
      description: `Prague Tour: ${validatedData.tourId} for ${validatedData.bookingData.groupSize} people`,
      receipt_email: validatedData.bookingData.customerInfo.email,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    console.error('Payment intent creation failed:', error);
    
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
