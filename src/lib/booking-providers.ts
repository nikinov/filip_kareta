// Booking provider interfaces and implementations
// Supporting multiple booking systems for flexibility

export interface BookingProvider {
  name: string;
  checkAvailability(tourId: string, date: Date): Promise<AvailabilityResponse>;
  createBooking(bookingData: CreateBookingRequest): Promise<BookingResponse>;
  getBooking(bookingId: string): Promise<BookingResponse>;
  cancelBooking(bookingId: string): Promise<CancelBookingResponse>;
}

export interface AvailabilityResponse {
  available: boolean;
  availableSlots: TimeSlot[];
  maxGroupSize: number;
  pricing: PricingInfo;
}

export interface TimeSlot {
  startTime: string; // ISO 8601 format
  endTime: string;
  availableSpots: number;
  price: number;
}

export interface PricingInfo {
  basePrice: number;
  currency: string;
  groupDiscounts?: GroupDiscount[];
}

export interface GroupDiscount {
  minSize: number;
  discountPercent: number;
}

export interface CreateBookingRequest {
  tourId: string;
  date: string; // ISO 8601 format
  startTime: string;
  groupSize: number;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
  };
  specialRequests?: string;
  totalPrice: number;
}

export interface BookingResponse {
  success: boolean;
  bookingId?: string;
  confirmationCode?: string;
  error?: string;
  booking?: {
    id: string;
    tourId: string;
    date: string;
    startTime: string;
    groupSize: number;
    totalPrice: number;
    status: 'confirmed' | 'pending' | 'cancelled';
    customerInfo: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
  };
}

export interface CancelBookingResponse {
  success: boolean;
  error?: string;
  refundAmount?: number;
}

// Acuity Scheduling Provider Implementation
export class AcuitySchedulingProvider implements BookingProvider {
  name = 'Acuity Scheduling';
  private apiUrl: string;
  private userId: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.ACUITY_API_URL || 'https://acuityscheduling.com/api/v1';
    this.userId = process.env.ACUITY_USER_ID || '';
    this.apiKey = process.env.ACUITY_API_KEY || '';
  }

  private getAuthHeaders() {
    const credentials = Buffer.from(`${this.userId}:${this.apiKey}`).toString('base64');
    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    };
  }

  async checkAvailability(tourId: string, date: Date): Promise<AvailabilityResponse> {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await fetch(
        `${this.apiUrl}/availability/times?appointmentTypeID=${tourId}&date=${dateStr}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Acuity API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        available: data.length > 0,
        availableSlots: data.map((slot: any) => ({
          startTime: slot.time,
          endTime: this.calculateEndTime(slot.time, tourId),
          availableSpots: slot.slotsAvailable || 1,
          price: this.getTourPrice(tourId),
        })),
        maxGroupSize: this.getMaxGroupSize(tourId),
        pricing: {
          basePrice: this.getTourPrice(tourId),
          currency: 'EUR',
        },
      };
    } catch (error) {
      console.error('Acuity availability check failed:', error);
      return {
        available: false,
        availableSlots: [],
        maxGroupSize: 0,
        pricing: { basePrice: 0, currency: 'EUR' },
      };
    }
  }

  async createBooking(bookingData: CreateBookingRequest): Promise<BookingResponse> {
    try {
      const acuityBooking = {
        appointmentTypeID: bookingData.tourId,
        datetime: `${bookingData.date}T${bookingData.startTime}`,
        firstName: bookingData.customerInfo.firstName,
        lastName: bookingData.customerInfo.lastName,
        email: bookingData.customerInfo.email,
        phone: bookingData.customerInfo.phone,
        fields: [
          {
            id: 1, // Group size field ID (configured in Acuity)
            value: bookingData.groupSize.toString(),
          },
          {
            id: 2, // Special requests field ID
            value: bookingData.specialRequests || '',
          },
        ],
      };

      const response = await fetch(`${this.apiUrl}/appointments`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(acuityBooking),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Acuity booking failed: ${response.status}`);
      }

      const booking = await response.json();

      return {
        success: true,
        bookingId: booking.id.toString(),
        confirmationCode: booking.confirmationPage || booking.id.toString(),
        booking: {
          id: booking.id.toString(),
          tourId: bookingData.tourId,
          date: bookingData.date,
          startTime: bookingData.startTime,
          groupSize: bookingData.groupSize,
          totalPrice: bookingData.totalPrice,
          status: 'confirmed',
          customerInfo: {
            firstName: booking.firstName,
            lastName: booking.lastName,
            email: booking.email,
            phone: booking.phone,
          },
        },
      };
    } catch (error) {
      console.error('Acuity booking creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Booking creation failed',
      };
    }
  }

  async getBooking(bookingId: string): Promise<BookingResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/appointments/${bookingId}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Acuity get booking failed: ${response.status}`);
      }

      const booking = await response.json();

      return {
        success: true,
        booking: {
          id: booking.id.toString(),
          tourId: booking.appointmentTypeID.toString(),
          date: booking.date,
          startTime: booking.time,
          groupSize: this.extractGroupSize(booking.forms),
          totalPrice: booking.price || 0,
          status: booking.canceled ? 'cancelled' : 'confirmed',
          customerInfo: {
            firstName: booking.firstName,
            lastName: booking.lastName,
            email: booking.email,
            phone: booking.phone,
          },
        },
      };
    } catch (error) {
      console.error('Acuity get booking failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve booking',
      };
    }
  }

  async cancelBooking(bookingId: string): Promise<CancelBookingResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/appointments/${bookingId}/cancel`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Acuity cancel booking failed: ${response.status}`);
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Acuity booking cancellation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Booking cancellation failed',
      };
    }
  }

  private calculateEndTime(startTime: string, tourId: string): string {
    // Get tour duration and calculate end time
    const duration = this.getTourDuration(tourId);
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(start.getTime() + duration * 60000);
    return end.toTimeString().slice(0, 5);
  }

  private getTourPrice(tourId: string): number {
    // Tour pricing configuration - in production this would come from a database
    const tourPricing: Record<string, number> = {
      'prague-castle': 45,
      'old-town': 35,
      'jewish-quarter': 40,
      'food-tour': 65,
    };
    return tourPricing[tourId] || 50;
  }

  private getMaxGroupSize(tourId: string): number {
    // Maximum group sizes per tour
    const maxSizes: Record<string, number> = {
      'prague-castle': 8,
      'old-town': 10,
      'jewish-quarter': 6,
      'food-tour': 4,
    };
    return maxSizes[tourId] || 6;
  }

  private getTourDuration(tourId: string): number {
    // Tour durations in minutes
    const durations: Record<string, number> = {
      'prague-castle': 180,
      'old-town': 120,
      'jewish-quarter': 150,
      'food-tour': 240,
    };
    return durations[tourId] || 120;
  }

  private extractGroupSize(forms: any[]): number {
    // Extract group size from Acuity form data
    const groupSizeField = forms?.find(form => form.id === 1);
    return groupSizeField ? parseInt(groupSizeField.value) : 1;
  }
}

// Peek Pro Provider Implementation (alternative)
export class PeekProProvider implements BookingProvider {
  name = 'Peek Pro';
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = process.env.PEEK_API_URL || 'https://api.peek.com/v2';
    this.apiKey = process.env.PEEK_API_KEY || '';
  }

  private getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async checkAvailability(tourId: string, date: Date): Promise<AvailabilityResponse> {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await fetch(
        `${this.apiUrl}/products/${tourId}/availability?date=${dateStr}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Peek API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        available: data.available_times?.length > 0,
        availableSlots: data.available_times?.map((slot: any) => ({
          startTime: slot.start_time,
          endTime: slot.end_time,
          availableSpots: slot.capacity,
          price: slot.price,
        })) || [],
        maxGroupSize: data.max_group_size || 8,
        pricing: {
          basePrice: data.base_price || 0,
          currency: data.currency || 'EUR',
        },
      };
    } catch (error) {
      console.error('Peek availability check failed:', error);
      return {
        available: false,
        availableSlots: [],
        maxGroupSize: 0,
        pricing: { basePrice: 0, currency: 'EUR' },
      };
    }
  }

  async createBooking(bookingData: CreateBookingRequest): Promise<BookingResponse> {
    try {
      const peekBooking = {
        product_id: bookingData.tourId,
        start_time: `${bookingData.date}T${bookingData.startTime}`,
        party_size: bookingData.groupSize,
        customer: {
          first_name: bookingData.customerInfo.firstName,
          last_name: bookingData.customerInfo.lastName,
          email: bookingData.customerInfo.email,
          phone: bookingData.customerInfo.phone,
        },
        special_requests: bookingData.specialRequests,
        total_price: bookingData.totalPrice,
      };

      const response = await fetch(`${this.apiUrl}/bookings`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(peekBooking),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Peek booking failed: ${response.status}`);
      }

      const booking = await response.json();

      return {
        success: true,
        bookingId: booking.id,
        confirmationCode: booking.confirmation_code,
        booking: {
          id: booking.id,
          tourId: bookingData.tourId,
          date: bookingData.date,
          startTime: bookingData.startTime,
          groupSize: bookingData.groupSize,
          totalPrice: bookingData.totalPrice,
          status: booking.status,
          customerInfo: {
            firstName: booking.customer.first_name,
            lastName: booking.customer.last_name,
            email: booking.customer.email,
            phone: booking.customer.phone,
          },
        },
      };
    } catch (error) {
      console.error('Peek booking creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Booking creation failed',
      };
    }
  }

  async getBooking(bookingId: string): Promise<BookingResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/bookings/${bookingId}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Peek get booking failed: ${response.status}`);
      }

      const booking = await response.json();

      return {
        success: true,
        booking: {
          id: booking.id,
          tourId: booking.product_id,
          date: booking.start_time.split('T')[0],
          startTime: booking.start_time.split('T')[1].slice(0, 5),
          groupSize: booking.party_size,
          totalPrice: booking.total_price,
          status: booking.status,
          customerInfo: {
            firstName: booking.customer.first_name,
            lastName: booking.customer.last_name,
            email: booking.customer.email,
            phone: booking.customer.phone,
          },
        },
      };
    } catch (error) {
      console.error('Peek get booking failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve booking',
      };
    }
  }

  async cancelBooking(bookingId: string): Promise<CancelBookingResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Peek cancel booking failed: ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        refundAmount: result.refund_amount,
      };
    } catch (error) {
      console.error('Peek booking cancellation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Booking cancellation failed',
      };
    }
  }
}

// Factory function to get the configured booking provider
export function getBookingProvider(): BookingProvider {
  const provider = process.env.BOOKING_PROVIDER || 'acuity';
  
  switch (provider.toLowerCase()) {
    case 'peek':
      return new PeekProProvider();
    case 'acuity':
    default:
      return new AcuitySchedulingProvider();
  }
}