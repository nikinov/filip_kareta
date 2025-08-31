import { notFound } from 'next/navigation';
import { BookingFlow } from '@/components/booking';
import { getTourById } from '@/lib/tours';
import { Locale } from '@/types';

interface BookingPageProps {
  params: {
    locale: Locale;
    tourId: string;
  };
  searchParams: {
    date?: string;
    time?: string;
    groupSize?: string;
  };
}

export default async function BookingPage({ params, searchParams }: BookingPageProps) {
  const { locale, tourId } = params;
  
  // Get tour data
  const tour = await getTourById(tourId);
  
  if (!tour) {
    notFound();
  }

  // Parse search params for pre-filled data
  const initialData = {
    date: searchParams.date || '',
    startTime: searchParams.time || '',
    groupSize: searchParams.groupSize ? parseInt(searchParams.groupSize) : 2,
    totalPrice: 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Book Your Tour
          </h1>
          <p className="text-gray-600">
            Complete your booking in just 3 simple steps
          </p>
        </div>
        
        <BookingFlow
          tour={tour}
          locale={locale}
          initialData={initialData}
        />
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: BookingPageProps) {
  const { locale, tourId } = params;
  const tour = await getTourById(tourId);
  
  if (!tour) {
    return {
      title: 'Tour Not Found',
    };
  }

  return {
    title: `Book ${tour.title[locale]} - Prague Tours with Filip`,
    description: `Book your ${tour.title[locale]} experience with local guide Filip. Secure online booking with instant confirmation.`,
    robots: 'noindex, nofollow', // Booking pages shouldn't be indexed
  };
}