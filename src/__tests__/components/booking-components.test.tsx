import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BookingStep1 } from '@/components/booking/booking-step-1';
import { BookingStep2 } from '@/components/booking/booking-step-2';
import { BookingStep3 } from '@/components/booking/booking-step-3';
import { Tour } from '@/types';

// Mock tour data
const mockTour: Tour = {
  id: 'prague-castle-tour',
  slug: 'prague-castle',
  title: {
    en: 'Prague Castle Tour',
    de: 'Prager Burg Tour',
    fr: 'Visite du Château de Prague'
  },
  description: {
    en: 'Explore Prague Castle',
    de: 'Erkunden Sie die Prager Burg',
    fr: 'Explorez le Château de Prague'
  },
  highlights: {
    en: ['Castle grounds', 'St. Vitus Cathedral'],
    de: ['Burggelände', 'St. Veits-Dom'],
    fr: ['Terrain du château', 'Cathédrale Saint-Guy']
  },
  duration: 180,
  maxGroupSize: 12,
  basePrice: 45,
  currency: 'EUR',
  difficulty: 'easy',
  images: [{
    id: 'img1',
    url: '/test-image.jpg',
    alt: { en: 'Test image', de: 'Testbild', fr: 'Image de test' },
    width: 400,
    height: 300
  }],
  route: [],
  availability: [],
  reviews: [],
  seoMetadata: {
    title: { en: 'Test', de: 'Test', fr: 'Test' },
    description: { en: 'Test', de: 'Test', fr: 'Test' },
    keywords: []
  }
};

const mockBookingData = {
  tourId: 'prague-castle-tour',
  date: '2024-06-15',
  startTime: '10:00',
  groupSize: 2,
  totalPrice: 90,
  customerInfo: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    country: 'US'
  },
  specialRequests: 'Test request'
};

describe('Booking Components', () => {
  describe('BookingStep1', () => {
    it('renders tour information correctly', () => {
      const mockUpdate = jest.fn();
      
      render(
        <BookingStep1
          tour={mockTour}
          locale="en"
          bookingData={mockBookingData}
          onUpdate={mockUpdate}
        />
      );

      expect(screen.getByText('Prague Castle Tour')).toBeInTheDocument();
      expect(screen.getByText('Max 12 people')).toBeInTheDocument();
      expect(screen.getByText('per person')).toBeInTheDocument();
      expect(screen.getByLabelText(/select date/i)).toBeInTheDocument();
    });

    it('handles date selection', () => {
      const mockUpdate = jest.fn();
      
      render(
        <BookingStep1
          tour={mockTour}
          locale="en"
          bookingData={mockBookingData}
          onUpdate={mockUpdate}
        />
      );

      const dateInput = screen.getByLabelText(/select date/i);
      fireEvent.change(dateInput, { target: { value: '2024-07-15' } });

      expect(mockUpdate).toHaveBeenCalled();
    });

    it('handles group size changes', () => {
      const mockUpdate = jest.fn();
      
      render(
        <BookingStep1
          tour={mockTour}
          locale="en"
          bookingData={mockBookingData}
          onUpdate={mockUpdate}
        />
      );

      const increaseButton = screen.getByText('+');
      fireEvent.click(increaseButton);

      expect(mockUpdate).toHaveBeenCalled();
    });

    it('displays group discount when applicable', () => {
      const mockUpdate = jest.fn();
      const bookingDataWithDiscount = {
        ...mockBookingData,
        groupSize: 4
      };
      
      render(
        <BookingStep1
          tour={mockTour}
          locale="en"
          bookingData={bookingDataWithDiscount}
          onUpdate={mockUpdate}
        />
      );

      expect(screen.getByText(/group discount applied/i)).toBeInTheDocument();
    });
  });

  describe('BookingStep2', () => {
    it('renders customer information form', () => {
      const mockUpdate = jest.fn();
      
      render(
        <BookingStep2
          tour={mockTour}
          locale="en"
          bookingData={mockBookingData}
          onUpdate={mockUpdate}
        />
      );

      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
    });

    it('displays booking summary', () => {
      const mockUpdate = jest.fn();
      
      render(
        <BookingStep2
          tour={mockTour}
          locale="en"
          bookingData={mockBookingData}
          onUpdate={mockUpdate}
        />
      );

      expect(screen.getByText('Booking Summary')).toBeInTheDocument();
      expect(screen.getByText('Prague Castle Tour')).toBeInTheDocument();
      expect(screen.getByText('2 people')).toBeInTheDocument();
      expect(screen.getByText('€90.00')).toBeInTheDocument();
    });

    it('handles form input changes', () => {
      const mockUpdate = jest.fn();
      
      render(
        <BookingStep2
          tour={mockTour}
          locale="en"
          bookingData={mockBookingData}
          onUpdate={mockUpdate}
        />
      );

      const firstNameInput = screen.getByLabelText(/first name/i);
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe('BookingStep3', () => {
    it('renders booking review information', () => {
      const mockUpdate = jest.fn();
      
      render(
        <BookingStep3
          tour={mockTour}
          locale="en"
          bookingData={mockBookingData}
          onUpdate={mockUpdate}
        />
      );

      expect(screen.getByText('Tour Details')).toBeInTheDocument();
      expect(screen.getByText('Your Information')).toBeInTheDocument();
      expect(screen.getByText('Price Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Payment Method')).toBeInTheDocument();
    });

    it('displays customer information correctly', () => {
      const mockUpdate = jest.fn();
      
      render(
        <BookingStep3
          tour={mockTour}
          locale="en"
          bookingData={mockBookingData}
          onUpdate={mockUpdate}
        />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('+1234567890')).toBeInTheDocument();
      expect(screen.getByText('United States')).toBeInTheDocument();
    });

    it('displays special requests when provided', () => {
      const mockUpdate = jest.fn();
      
      render(
        <BookingStep3
          tour={mockTour}
          locale="en"
          bookingData={mockBookingData}
          onUpdate={mockUpdate}
        />
      );

      expect(screen.getByText('Special Requests:')).toBeInTheDocument();
      expect(screen.getByText('Test request')).toBeInTheDocument();
    });

    it('shows payment method options', () => {
      const mockUpdate = jest.fn();
      
      render(
        <BookingStep3
          tour={mockTour}
          locale="en"
          bookingData={mockBookingData}
          onUpdate={mockUpdate}
        />
      );

      expect(screen.getByText('Credit/Debit Card')).toBeInTheDocument();
      expect(screen.getByText('PayPal')).toBeInTheDocument();
    });

    it('requires terms and conditions agreement', () => {
      const mockUpdate = jest.fn();
      
      render(
        <BookingStep3
          tour={mockTour}
          locale="en"
          bookingData={mockBookingData}
          onUpdate={mockUpdate}
        />
      );

      expect(screen.getByText(/i agree to the terms and conditions/i)).toBeInTheDocument();
    });
  });
});