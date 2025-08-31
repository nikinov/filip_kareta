'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Tour, Locale, CustomerInfo } from '@/types';
import { BookingData } from './booking-flow';

interface BookingStep2Props {
  tour: Tour;
  locale: Locale;
  bookingData: BookingData;
  onUpdate: (updates: Partial<BookingData>) => void;
}

// Common countries for the dropdown
const COMMON_COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'AT', name: 'Austria' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'PL', name: 'Poland' },
  { code: 'HU', name: 'Hungary' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'AR', name: 'Argentina' },
  { code: 'RU', name: 'Russia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'EG', name: 'Egypt' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KE', name: 'Kenya' },
];

export function BookingStep2({ tour, locale: _locale, bookingData, onUpdate }: BookingStep2Props) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>(
    bookingData.customerInfo || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: '',
    }
  );
  
  const [specialRequests, setSpecialRequests] = useState(bookingData.specialRequests || '');

  // Update parent component when local state changes
  useEffect(() => {
    onUpdate({
      customerInfo,
      specialRequests,
    });
  }, [customerInfo, specialRequests, onUpdate]);

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string): string => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Booking Summary */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-3">Booking Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Tour:</span>
              <span className="font-medium">{tour.title.en}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{formatDate(bookingData.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">{formatTime(bookingData.startTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Group Size:</span>
              <span className="font-medium">{bookingData.groupSize} {bookingData.groupSize === 1 ? 'person' : 'people'}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold">
              <span>Total:</span>
              <span>€{bookingData.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information Form */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Your Information
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            We'll use this information to confirm your booking and send you tour details.
          </p>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium">
              First Name *
            </Label>
            <Input
              id="firstName"
              type="text"
              value={customerInfo.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Enter your first name"
              className="text-base"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium">
              Last Name *
            </Label>
            <Input
              id="lastName"
              type="text"
              value={customerInfo.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Enter your last name"
              className="text-base"
              required
            />
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            value={customerInfo.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter your email address"
            className="text-base"
            required
          />
          <p className="text-xs text-gray-500">
            We'll send your booking confirmation and tour details to this email.
          </p>
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Phone Number *
          </Label>
          <Input
            id="phone"
            type="tel"
            value={customerInfo.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="Enter your phone number"
            className="text-base"
            required
          />
          <p className="text-xs text-gray-500">
            Include country code (e.g., +1 555-123-4567). Used for urgent tour updates only.
          </p>
        </div>

        {/* Country Field */}
        <div className="space-y-2">
          <Label htmlFor="country" className="text-sm font-medium flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Country *
          </Label>
          <select
            id="country"
            value={customerInfo.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-prague-500 focus:border-prague-500 text-base"
            required
          >
            <option value="">Select your country</option>
            {COMMON_COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            This helps us provide relevant local information and emergency contacts.
          </p>
        </div>

        {/* Special Requests */}
        <div className="space-y-2">
          <Label htmlFor="specialRequests" className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Special Requests (Optional)
          </Label>
          <Textarea
            id="specialRequests"
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Any special requests, dietary restrictions, mobility needs, or questions? (Optional)"
            className="text-base min-h-[100px]"
            maxLength={500}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Let Filip know about any special needs or interests.</span>
            <span>{specialRequests.length}/500</span>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">Privacy & Data Protection</p>
            <ul className="space-y-1 text-xs">
              <li>• Your information is used only for booking confirmation and tour communication</li>
              <li>• We comply with GDPR and never share your data with third parties</li>
              <li>• You can request data deletion at any time by contacting us</li>
              <li>• Payment information is processed securely by our payment partners</li>
            </ul>
          </div>
        </div>

        {/* Marketing Opt-in */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="marketing-optin"
            className="mt-1 h-4 w-4 text-prague-600 focus:ring-prague-500 border-gray-300 rounded"
          />
          <div className="text-sm">
            <label htmlFor="marketing-optin" className="font-medium text-gray-700 cursor-pointer">
              Keep me updated (Optional)
            </label>
            <p className="text-gray-500 text-xs mt-1">
              Receive occasional emails about new tours, Prague travel tips, and special offers. 
              You can unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}