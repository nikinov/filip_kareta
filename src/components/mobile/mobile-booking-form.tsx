'use client';

// Mobile-optimized booking form component
// Enhanced touch interactions and mobile-specific UX

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Users, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useMobileDevice, useOrientation, mobileBookingOptimizations } from '@/lib/mobile-interactions';
import * as m from '@/paraglide/messages';

interface MobileBookingFormProps {
  tourId: string;
  tourName: string;
  tourPrice: number;
  onComplete: (bookingData: any) => void;
  onCancel: () => void;
}

interface BookingStep {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  validation: (data: any) => boolean;
}

export function MobileBookingForm({
  tourId,
  tourName,
  tourPrice,
  onComplete,
  onCancel,
}: MobileBookingFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    tourId,
    date: '',
    time: '',
    groupSize: 1,
    customerInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialRequests: '',
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formRef = useRef<HTMLDivElement>(null);
  const mobileDevice = useMobileDevice();
  const orientation = useOrientation();

  // Mobile-optimized booking steps
  const steps: BookingStep[] = [
    {
      id: 'datetime',
      title: t('selectDateTime', { default: 'Select Date & Time' }),
      component: DateTimeStep,
      validation: (data) => !!data.date && !!data.time,
    },
    {
      id: 'group',
      title: t('groupSize', { default: 'Group Size' }),
      component: GroupSizeStep,
      validation: (data) => data.groupSize > 0 && data.groupSize <= 8,
    },
    {
      id: 'details',
      title: t('yourDetails', { default: 'Your Details' }),
      component: CustomerDetailsStep,
      validation: (data) => 
        !!data.customerInfo.firstName && 
        !!data.customerInfo.lastName && 
        !!data.customerInfo.email,
    },
    {
      id: 'review',
      title: t('reviewBooking', { default: 'Review & Confirm' }),
      component: ReviewStep,
      validation: () => true,
    },
  ];

  useEffect(() => {
    // Optimize form for mobile on mount
    if (formRef.current && mobileDevice.isMobile) {
      mobileBookingOptimizations.optimizeDatePicker(formRef.current);
      mobileBookingOptimizations.enhanceMobileValidation(formRef.current as HTMLFormElement);
    }
  }, [mobileDevice.isMobile]);

  const handleNext = () => {
    const currentStepData = steps[currentStep];
    
    if (!currentStepData.validation(bookingData)) {
      setErrors({ step: 'Please complete all required fields' });
      return;
    }

    setErrors({});
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      await onComplete(bookingData);
    } catch (error) {
      setErrors({ submit: 'Booking failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateBookingData = (updates: any) => {
    setBookingData(prev => ({ ...prev, ...updates }));
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div 
      ref={formRef}
      className={`mobile-booking-form ${orientation === 'landscape' ? 'landscape' : 'portrait'}`}
    >
      {/* Mobile header with progress */}
      <div className="sticky top-0 bg-white border-b z-10 p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Cancel booking"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="text-center">
            <h2 className="font-semibold text-lg">{tourName}</h2>
            <p className="text-sm text-gray-600">€{tourPrice} per person</p>
          </div>
          
          <div className="w-9" /> {/* Spacer for centering */}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="font-medium">
              {steps[currentStep].title}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 p-4">
        <CurrentStepComponent
          bookingData={bookingData}
          updateBookingData={updateBookingData}
          errors={errors}
          mobileDevice={mobileDevice}
          orientation={orientation}
        />
      </div>

      {/* Mobile footer with navigation */}
      <div className="sticky bottom-0 bg-white border-t p-4">
        {errors.step && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
            {errors.step}
          </div>
        )}
        
        <div className="flex gap-3">
          {currentStep > 0 && (
            <Button
              onClick={handlePrevious}
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              {t('previous', { default: 'Previous' })}
            </Button>
          )}
          
          <Button
            onClick={handleNext}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {currentStep === steps.length - 1 ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                {isSubmitting ? t('booking', { default: 'Booking...' }) : t('confirmBooking', { default: 'Confirm Booking' })}
              </>
            ) : (
              <>
                {t('next', { default: 'Next' })}
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Step components
function DateTimeStep({ bookingData, updateBookingData, errors, mobileDevice }: any) {
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          {t('selectDate', { default: 'Select Date' })}
        </h3>
        
        <Input
          type="date"
          value={bookingData.date}
          onChange={(e) => updateBookingData({ date: e.target.value })}
          min={new Date().toISOString().split('T')[0]}
          className="w-full text-lg p-4"
          data-testid="date-picker"
        />
        {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          {t('selectTime', { default: 'Select Time' })}
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {['10:00', '14:00'].map((time) => (
            <button
              key={time}
              onClick={() => updateBookingData({ time })}
              className={`p-4 rounded-lg border-2 text-center transition-colors ${
                bookingData.time === time
                  ? 'border-blue-600 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              data-testid="time-option"
              data-time={time}
            >
              <div className="font-semibold">{time}</div>
              <div className="text-sm text-gray-600">Available</div>
            </button>
          ))}
        </div>
        {errors.time && <p className="text-red-600 text-sm mt-1">{errors.time}</p>}
      </div>
    </div>
  );
}

function GroupSizeStep({ bookingData, updateBookingData, errors }: any) {
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-blue-600" />
        {t('howManyPeople', { default: 'How many people?' })}
      </h3>
      
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
          <button
            key={size}
            onClick={() => updateBookingData({ groupSize: size })}
            className={`aspect-square rounded-lg border-2 text-center transition-colors ${
              bookingData.groupSize === size
                ? 'border-blue-600 bg-blue-50 text-blue-900'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            data-testid="group-size-option"
          >
            <div className="font-bold text-lg">{size}</div>
            <div className="text-xs text-gray-600">
              {size === 1 ? 'person' : 'people'}
            </div>
          </button>
        ))}
      </div>
      
      {errors.groupSize && <p className="text-red-600 text-sm mt-1">{errors.groupSize}</p>}
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Total: €{(bookingData.groupSize * 45).toFixed(2)}</strong>
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Price includes guide service and tour materials
        </p>
      </div>
    </div>
  );
}

function CustomerDetailsStep({ bookingData, updateBookingData, errors, mobileDevice }: any) {
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">
        {t('yourInformation', { default: 'Your Information' })}
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium mb-1">
            {t('firstName', { default: 'First Name' })} *
          </label>
          <Input
            id="firstName"
            type="text"
            value={bookingData.customerInfo.firstName}
            onChange={(e) => updateBookingData({
              customerInfo: { ...bookingData.customerInfo, firstName: e.target.value }
            })}
            className="w-full"
            data-testid="first-name"
            autoComplete="given-name"
          />
          {errors.firstName && <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>}
        </div>
        
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium mb-1">
            {t('lastName', { default: 'Last Name' })} *
          </label>
          <Input
            id="lastName"
            type="text"
            value={bookingData.customerInfo.lastName}
            onChange={(e) => updateBookingData({
              customerInfo: { ...bookingData.customerInfo, lastName: e.target.value }
            })}
            className="w-full"
            data-testid="last-name"
            autoComplete="family-name"
          />
          {errors.lastName && <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>}
        </div>
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          {t('email', { default: 'Email Address' })} *
        </label>
        <Input
          id="email"
          type="email"
          value={bookingData.customerInfo.email}
          onChange={(e) => updateBookingData({
            customerInfo: { ...bookingData.customerInfo, email: e.target.value }
          })}
          className="w-full"
          data-testid="email"
          autoComplete="email"
          inputMode="email"
        />
        {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
      </div>
      
      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1">
          {t('phone', { default: 'Phone Number' })}
        </label>
        <Input
          id="phone"
          type="tel"
          value={bookingData.customerInfo.phone}
          onChange={(e) => updateBookingData({
            customerInfo: { ...bookingData.customerInfo, phone: e.target.value }
          })}
          className="w-full"
          data-testid="phone"
          autoComplete="tel"
          inputMode="tel"
          placeholder="+420 123 456 789"
        />
        {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
      </div>
      
      <div>
        <label htmlFor="specialRequests" className="block text-sm font-medium mb-1">
          {t('specialRequests', { default: 'Special Requests' })}
        </label>
        <textarea
          id="specialRequests"
          value={bookingData.customerInfo.specialRequests}
          onChange={(e) => updateBookingData({
            customerInfo: { ...bookingData.customerInfo, specialRequests: e.target.value }
          })}
          className="w-full p-3 border border-gray-300 rounded-md resize-none"
          rows={3}
          placeholder={t('specialRequestsPlaceholder', { 
            default: 'Any dietary restrictions, mobility needs, or special interests?' 
          })}
          data-testid="special-requests"
        />
      </div>
      
      {mobileDevice.isMobile && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            💡 {t('mobileBookingTip', { 
              default: 'Tip: You can save this booking as a draft and complete it later if needed.' 
            })}
          </p>
        </div>
      )}
    </div>
  );
}

function ReviewStep({ bookingData, tourName, tourPrice }: any) {
  
  const totalPrice = bookingData.groupSize * tourPrice;
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">
        {t('reviewYourBooking', { default: 'Review Your Booking' })}
      </h3>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{tourName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{t('date', { default: 'Date' })}</span>
            <span className="font-medium">{bookingData.date}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{t('time', { default: 'Time' })}</span>
            <span className="font-medium">{bookingData.time}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{t('groupSize', { default: 'Group Size' })}</span>
            <span className="font-medium">{bookingData.groupSize} {bookingData.groupSize === 1 ? 'person' : 'people'}</span>
          </div>
          
          <hr />
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{t('name', { default: 'Name' })}</span>
            <span className="font-medium">
              {bookingData.customerInfo.firstName} {bookingData.customerInfo.lastName}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{t('email', { default: 'Email' })}</span>
            <span className="font-medium text-sm">{bookingData.customerInfo.email}</span>
          </div>
          
          {bookingData.customerInfo.phone && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t('phone', { default: 'Phone' })}</span>
              <span className="font-medium">{bookingData.customerInfo.phone}</span>
            </div>
          )}
          
          <hr />
          
          <div className="flex justify-between items-center text-lg font-bold">
            <span>{t('total', { default: 'Total' })}</span>
            <span>€{totalPrice.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
      
      {bookingData.customerInfo.specialRequests && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('specialRequests', { default: 'Special Requests' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700">{bookingData.customerInfo.specialRequests}</p>
          </CardContent>
        </Card>
      )}
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          ✅ {t('bookingConfirmation', { 
            default: 'By confirming, you agree to our terms and conditions. You will receive a confirmation email shortly.' 
          })}
        </p>
      </div>
    </div>
  );
}
