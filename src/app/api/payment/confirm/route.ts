// Payment confirmation API route
// Handles payment confirmation and booking finalization

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';
import { getBookingProvider } from '@/lib/booking-providers';
import { BookingValidator, handleBookingError, BookingErrorCodes } from '@/lib/booking-validation';
import { sendBookingConfirmationEmail } from '@/lib/email-service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const confirmPaymentSchema = z.object({
  paymentIntentId: z.string().min(1, 'Payment intent ID is required'),
  paymentMethod: z.enum(['stripe', 'paypal']),
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
    const validatedData = confirmPaymentSchema.parse(body);

    let paymentConfirmed = false;
    let paymentDetails: any = {};

    // Verify payment based on method
    if (validatedData.paymentMethod === 'stripe') {
      // Retrieve and verify Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.retrieve(validatedData.paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return NextResponse.json(
          { error: 'Payment not completed' },
          { status: 400 }
        );
      }

      paymentConfirmed = true;
      paymentDetails = {
        method: 'stripe',
        transactionId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        receiptUrl: paymentIntent.charges.data[0]?.receipt_url,
      };
    } else if (validatedData.paymentMethod === 'paypal') {
      // For PayPal, we would verify the payment here
      // This is a placeholder for PayPal verification logic
      paymentConfirmed = true;
      paymentDetails = {
        method: 'paypal',
        transactionId: validatedData.paymentIntentId,
        amount: validatedData.bookingData.totalPrice,
        currency: 'eur',
      };
    }

    if (!paymentConfirmed) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Create booking with provider
    const provider = getBookingProvider();
    const bookingResult = await provider.createBooking(validatedData.bookingData);

    if (!bookingResult.success) {
      // Payment succeeded but booking failed - this needs manual intervention
      console.error('Critical: Payment succeeded but booking failed', {
        paymentIntentId: validatedData.paymentIntentId,
        bookingData: validatedData.bookingData,
        error: bookingResult.error,
      });

      return NextResponse.json(
        { 
          error: 'Booking creation failed after payment. Please contact support.',
          paymentId: validatedData.paymentIntentId,
          requiresManualIntervention: true,
        },
        { status: 500 }
      );
    }

    // Send confirmation email
    try {
      await sendBookingConfirmationEmail({
        booking: bookingResult.booking!,
        paymentDetails,
        customerEmail: validatedData.bookingData.customerInfo.email,
      });
    } catch (emailError) {
      console.error('Email confirmation failed:', emailError);
      // Don't fail the booking if email fails
    }

    return NextResponse.json({
      success: true,
      booking: bookingResult.booking,
      confirmationCode: bookingResult.confirmationCode,
      payment: paymentDetails,
    });

  } catch (error) {
    console.error('Payment confirmation failed:', error);
    
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
