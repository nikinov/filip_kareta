'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, Users, Euro } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tour, Locale } from '@/types';
import { BookingData } from './booking-flow';
import { BookingValidator } from '@/lib/booking-validation';

interface BookingStep1Props {
  tour: Tour;
  locale: Locale;
  bookingData: BookingData;
  onUpdate: (updates: Partial<BookingData>) => void;
}

interface AvailableSlot {
  time: string;
  available: boolean;
  spotsLeft?: number;
}

export function BookingStep1({ tour, locale: _locale, bookingData, onUpdate }: BookingStep1Props) {
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [selectedDate, setSelectedDate] = useState(bookingData.date);
  const [selectedTime, setSelectedTime] = useState(bookingData.startTime);
  const [groupSize, setGroupSize] = useState(bookingData.groupSize);

  // Calculate total price whenever group size changes
  const totalPrice = BookingValidator.calculateTotalPrice(tour.id, groupSize, selectedDate);

  // Update parent component when local state changes
  useEffect(() => {
    onUpdate({
      date: selectedDate,
      startTime: selectedTime,
      groupSize,
      totalPrice,
    });
  }, [selectedDate, selectedTime, groupSize, totalPrice, onUpdate]);

  // Fetch availability when date changes
  const fetchAvailability = useCallback(async (date: string) => {
    if (!date) {
      setAvailableSlots([]);
      return;
    }

    setIsLoadingAvailability(true);
    try {
      // Simulate API call - in real implementation, this would call the booking provider API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock availability data based on tour and date
      const mockSlots: AvailableSlot[] = [
        { time: '09:00', available: true, spotsLeft: 6 },
        { time: '10:00', available: true, spotsLeft: 4 },
        { time: '11:00', available: false },
        { time: '14:00', available: true, spotsLeft: 8 },
        { time: '15:00', available: true, spotsLeft: 3 },
        { time: '16:00', available: true, spotsLeft: 7 },
      ];

      // Filter based on tour availability rules
      const dayOfWeek = new Date(date).getDay();
      const tourAvailability: Record<string, number[]> = {
        'prague-castle': [1, 2, 3, 4, 5, 6], // Monday to Saturday
        'old-town': [0, 1, 2, 3, 4, 5, 6], // Every day
        'jewish-quarter': [1, 2, 3, 4, 5], // Monday to Friday
        'food-tour': [4, 5, 6], // Thursday to Saturday
      };

      const availableDays = tourAvailability[tour.id] || [1, 2, 3, 4, 5, 6];
      
      if (availableDays.includes(dayOfWeek)) {
        setAvailableSlots(mockSlots);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      setAvailableSlots([]);
    } finally {
      setIsLoadingAvailability(false);
    }
  }, [tour.id]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailability(selectedDate);
    }
  }, [selectedDate, fetchAvailability]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleGroupSizeChange = (newSize: number) => {
    const maxSize = Math.min(tour.maxGroupSize, 12); // Cap at 12 for UI purposes
    const validSize = Math.max(1, Math.min(maxSize, newSize));
    setGroupSize(validSize);
  };

  // Get minimum date (today)
  const minDate = new Date().toISOString().split('T')[0];
  
  // Get maximum date (1 year from now)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateString = maxDate.toISOString().split('T')[0];

  // Check if selected date is valid
  const dateValidation = selectedDate ? BookingValidator.validateBookingDate(selectedDate) : { valid: true };
  const availabilityValidation = selectedDate ? BookingValidator.validateTourAvailability(tour.id, selectedDate) : { valid: true };

  return (
    <div className="space-y-6">
      {/* Tour Summary */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {tour.images.length > 0 && (
              <img
                src={tour.images[0].url}
                alt={tour.images[0].alt.en}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{tour.title.en}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {Math.floor(tour.duration / 60)}h {tour.duration % 60}m
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Max {tour.maxGroupSize} people
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">From</div>
              <div className="text-xl font-bold">€{tour.basePrice}</div>
              <div className="text-sm text-gray-600">per person</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date Selection */}
      <div className="space-y-3">
        <Label htmlFor="booking-date" className="text-base font-medium flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Select Date
        </Label>
        <Input
          id="booking-date"
          type="date"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          min={minDate}
          max={maxDateString}
          className="text-base"
        />
        {!dateValidation.valid && dateValidation.error && (
          <p className="text-sm text-red-600">{dateValidation.error}</p>
        )}
        {!availabilityValidation.valid && availabilityValidation.error && (
          <p className="text-sm text-red-600">{availabilityValidation.error}</p>
        )}
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <div className="space-y-3">
          <Label className="text-base font-medium flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Select Time
          </Label>
          
          {isLoadingAvailability ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-prague-500"></div>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No available times for this date.</p>
              <p className="text-sm mt-1">Please select a different date.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={selectedTime === slot.time ? 'default' : 'outline'}
                  disabled={!slot.available}
                  onClick={() => handleTimeSelect(slot.time)}
                  className="flex flex-col items-center py-3 h-auto"
                >
                  <span className="font-medium">{slot.time}</span>
                  {slot.available && slot.spotsLeft && (
                    <span className="text-xs opacity-75">
                      {slot.spotsLeft} spots left
                    </span>
                  )}
                  {!slot.available && (
                    <span className="text-xs opacity-75">Fully booked</span>
                  )}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Group Size Selection */}
      <div className="space-y-3">
        <Label className="text-base font-medium flex items-center gap-2">
          <Users className="w-5 h-5" />
          Group Size
        </Label>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleGroupSizeChange(groupSize - 1)}
              disabled={groupSize <= 1}
              className="w-10 h-10 rounded-full p-0"
            >
              -
            </Button>
            
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={groupSize}
                onChange={(e) => handleGroupSizeChange(parseInt(e.target.value) || 1)}
                min={1}
                max={tour.maxGroupSize}
                className="w-20 text-center"
              />
              <span className="text-sm text-gray-600">
                {groupSize === 1 ? 'person' : 'people'}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleGroupSizeChange(groupSize + 1)}
              disabled={groupSize >= tour.maxGroupSize}
              className="w-10 h-10 rounded-full p-0"
            >
              +
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            (Max {tour.maxGroupSize})
          </div>
        </div>

        {/* Group Size Discounts */}
        {groupSize >= 4 && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-sm text-green-800 font-medium">
              🎉 Group Discount Applied!
            </p>
            <p className="text-sm text-green-700">
              {groupSize >= 6 ? '10% discount for groups of 6+' : '5% discount for groups of 4-5'}
            </p>
          </div>
        )}
      </div>

      {/* Price Summary */}
      <Card className="bg-prague-50 border-prague-200">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Base price ({groupSize} × €{tour.basePrice})</span>
              <span>€{(tour.basePrice * groupSize).toFixed(2)}</span>
            </div>
            
            {groupSize >= 4 && (
              <div className="flex justify-between items-center text-green-600">
                <span>Group discount</span>
                <span>-€{((tour.basePrice * groupSize) - (tour.basePrice * groupSize * (groupSize >= 6 ? 0.9 : 0.95))).toFixed(2)}</span>
              </div>
            )}
            
            {selectedDate && (() => {
              const month = new Date(selectedDate).getMonth();
              const isSummer = month >= 5 && month <= 8;
              return isSummer && (
                <div className="flex justify-between items-center text-amber-600">
                  <span>Summer season (15%)</span>
                  <span>+€{(totalPrice * 0.15 / 1.15).toFixed(2)}</span>
                </div>
              );
            })()}
            
            <div className="border-t pt-2 flex justify-between items-center font-bold text-lg">
              <span className="flex items-center gap-1">
                <Euro className="w-5 h-5" />
                Total
              </span>
              <span>€{totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Policies */}
      <div className="text-sm text-gray-600 space-y-1">
        <p>✓ Free cancellation up to 24 hours before the tour</p>
        <p>✓ Instant confirmation</p>
        <p>✓ Mobile ticket accepted</p>
      </div>
    </div>
  );
}