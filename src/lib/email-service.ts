// Email service for booking confirmations and notifications
// Handles automated email sending with templates

import nodemailer from 'nodemailer';
import { Booking } from '@/types';

interface PaymentDetails {
  method: 'stripe' | 'paypal';
  transactionId: string;
  amount: number;
  currency: string;
  receiptUrl?: string;
}

interface BookingConfirmationData {
  booking: Booking;
  paymentDetails: PaymentDetails;
  customerEmail: string;
}

// Create email transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === 'development') {
    // Use Ethereal for development testing
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASS,
      },
    });
  }

  // Production email configuration
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Generate booking confirmation email HTML
const generateConfirmationEmailHTML = (data: BookingConfirmationData): string => {
  const { booking, paymentDetails } = data;
  const tourDate = new Date(booking.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Booking Confirmation - Filip Kareta Prague Tours</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .booking-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .cta-button { background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Booking Confirmed!</h1>
          <p>Your Prague tour with Filip is all set</p>
        </div>
        
        <div class="content">
          <h2>Hello ${booking.customerInfo.firstName}!</h2>
          <p>Thank you for booking your Prague tour with me. I'm excited to share the stories and secrets of this beautiful city with you!</p>
          
          <div class="booking-details">
            <h3>Your Tour Details</h3>
            <p><strong>Tour:</strong> ${booking.tourId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
            <p><strong>Date:</strong> ${tourDate}</p>
            <p><strong>Time:</strong> ${booking.startTime}</p>
            <p><strong>Group Size:</strong> ${booking.groupSize} ${booking.groupSize === 1 ? 'person' : 'people'}</p>
            <p><strong>Total Price:</strong> €${paymentDetails.amount.toFixed(2)}</p>
            <p><strong>Confirmation Code:</strong> ${booking.id}</p>
          </div>

          <div class="booking-details">
            <h3>Payment Information</h3>
            <p><strong>Payment Method:</strong> ${paymentDetails.method === 'stripe' ? 'Credit/Debit Card' : 'PayPal'}</p>
            <p><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</p>
            ${paymentDetails.receiptUrl ? `<p><a href="${paymentDetails.receiptUrl}" class="cta-button">View Receipt</a></p>` : ''}
          </div>

          <div class="booking-details">
            <h3>What's Next?</h3>
            <p>• I'll send you a reminder email 24 hours before your tour</p>
            <p>• Meet me at the designated starting point (details will be in your reminder)</p>
            <p>• Bring comfortable walking shoes and a camera for amazing photos!</p>
            <p>• Check the weather forecast and dress accordingly</p>
          </div>

          <div class="booking-details">
            <h3>Need to Make Changes?</h3>
            <p>If you need to reschedule or cancel your tour, please contact me at least 24 hours in advance:</p>
            <p><strong>Email:</strong> filip@guidefilip-prague.com</p>
            <p><strong>Phone:</strong> +420 123 456 789</p>
            <p><strong>WhatsApp:</strong> Available for quick questions</p>
          </div>

          <p>Looking forward to exploring Prague with you!</p>
          <p>Best regards,<br>Filip Kareta<br>Your Prague Storytelling Guide</p>
        </div>
        
        <div class="footer">
          <p>Filip Kareta Prague Tours | Prague, Czech Republic</p>
          <p>This email was sent regarding your booking confirmation ${booking.id}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send booking confirmation email
export async function sendBookingConfirmationEmail(data: BookingConfirmationData): Promise<void> {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: {
      name: 'Filip Kareta - Prague Tours',
      address: process.env.FROM_EMAIL || 'noreply@guidefilip-prague.com',
    },
    to: data.customerEmail,
    subject: `Booking Confirmed: Your Prague Tour on ${new Date(data.booking.date).toLocaleDateString()}`,
    html: generateConfirmationEmailHTML(data),
    text: `
      Booking Confirmed!
      
      Hello ${data.booking.customerInfo.firstName},
      
      Your Prague tour booking has been confirmed:
      
      Tour: ${data.booking.tourId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      Date: ${new Date(data.booking.date).toLocaleDateString()}
      Time: ${data.booking.startTime}
      Group Size: ${data.booking.groupSize} ${data.booking.groupSize === 1 ? 'person' : 'people'}
      Total Price: €${data.paymentDetails.amount.toFixed(2)}
      Confirmation Code: ${data.booking.id}
      
      Payment Method: ${data.paymentDetails.method === 'stripe' ? 'Credit/Debit Card' : 'PayPal'}
      Transaction ID: ${data.paymentDetails.transactionId}
      
      Looking forward to exploring Prague with you!
      
      Best regards,
      Filip Kareta
      Your Prague Storytelling Guide
      
      Contact: filip@guidefilip-prague.com | +420 123 456 789
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Send booking reminder email (24 hours before tour)
export async function sendBookingReminderEmail(booking: Booking): Promise<void> {
  const transporter = createTransporter();
  
  const tourDate = new Date(booking.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const mailOptions = {
    from: {
      name: 'Filip Kareta - Prague Tours',
      address: process.env.FROM_EMAIL || 'noreply@guidefilip-prague.com',
    },
    to: booking.customerInfo.email,
    subject: `Tomorrow's Tour Reminder: ${tourDate} at ${booking.startTime}`,
    html: `
      <h2>Your Prague Tour is Tomorrow!</h2>
      <p>Hello ${booking.customerInfo.firstName},</p>
      <p>This is a friendly reminder that your Prague tour is scheduled for tomorrow:</p>
      <ul>
        <li><strong>Date:</strong> ${tourDate}</li>
        <li><strong>Time:</strong> ${booking.startTime}</li>
        <li><strong>Meeting Point:</strong> Old Town Square, by the Jan Hus Memorial</li>
        <li><strong>Group Size:</strong> ${booking.groupSize} ${booking.groupSize === 1 ? 'person' : 'people'}</li>
      </ul>
      <p>Please arrive 10 minutes early. I'll be wearing a blue jacket and holding a small Prague flag.</p>
      <p>Weather forecast: Check and dress accordingly!</p>
      <p>See you tomorrow!</p>
      <p>Filip</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}
