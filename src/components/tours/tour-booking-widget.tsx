'use client';

import { useState } from 'react';
import { Calendar, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tour } from '@/types';

interface TourBookingWidgetProps {
  tour: Tour;
  locale: string;
}

export function TourBookingWidget({ tour, locale: _locale }: TourBookingWidgetProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [groupSize, setGroupSize] = useState(2);
  const [selectedTime, setSelectedTime] = useState<string>('');

  const totalPrice = tour.basePrice * groupSize;

  const availableTimes = [
    '09:00',
    '10:00',
    '14:00',
    '15:00',
  ];

  const handleBooking = () => {
    // This would integrate with the booking system
    console.log('Booking:', {
      tourId: tour.id,
      date: selectedDate,
      time: selectedTime,
      groupSize,
      totalPrice,
    });
  };

  return (
    <Card className="p-6 sticky top-6" id="booking-widget">
      <div className="text-center mb-6">
        <div className="text-sm text-gray-600 mb-1">From</div>
        <div className="text-3xl font-bold text-gray-900">
          €{tour.basePrice}
          <span className="text-lg font-normal text-gray-600">/person</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Time Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-2" />
            Select Time
          </label>
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose time</option>
            {availableTimes.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        {/* Group Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Users className="w-4 h-4 inline mr-2" />
            Group Size
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setGroupSize(Math.max(1, groupSize - 1))}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              disabled={groupSize <= 1}
            >
              -
            </button>
            <span className="font-medium text-lg w-8 text-center">{groupSize}</span>
            <button
              onClick={() => setGroupSize(Math.min(tour.maxGroupSize, groupSize + 1))}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
              disabled={groupSize >= tour.maxGroupSize}
            >
              +
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Maximum {tour.maxGroupSize} people
          </p>
        </div>

        {/* Total Price */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-medium">Total</span>
            <span className="text-xl font-bold">€{totalPrice}</span>
          </div>

          <Button
            onClick={() => {
              // Track booking button click
              if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('event', 'booking_button_click', {
                  tour_id: tour.id,
                  tour_name: tour.title[locale],
                  location: 'widget',
                  value: totalPrice,
                  selected_date: selectedDate,
                  group_size: groupSize,
                });
              }
              handleBooking();
            }}
            disabled={!selectedDate || !selectedTime}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold"
            size="lg"
          >
            Book Now
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Free cancellation up to 24 hours before the tour
        </p>
      </div>
    </Card>
  );
}