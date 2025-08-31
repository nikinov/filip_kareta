'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Clock, Users, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tour, Locale } from '@/types';
import { cn } from '@/utils';

interface TourHeroProps {
  tour: Tour;
  locale: Locale;
}

export function TourHero({ tour, locale }: TourHeroProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === tour.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? tour.images.length - 1 : prev - 1
    );
  };

  const averageRating = tour.reviews.length > 0 
    ? tour.reviews.reduce((sum, review) => sum + review.rating, 0) / tour.reviews.length 
    : 0;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels = {
      easy: { en: 'Easy', de: 'Einfach', fr: 'Facile' },
      moderate: { en: 'Moderate', de: 'Mittel', fr: 'Modéré' },
      challenging: { en: 'Challenging', de: 'Anspruchsvoll', fr: 'Difficile' }
    };
    return labels[difficulty as keyof typeof labels]?.[locale] || difficulty;
  };

  return (
    <div className="relative">
      {/* Image Gallery */}
      <div className="relative h-[60vh] min-h-[500px] overflow-hidden">
        {tour.images.map((image, index) => (
          <div
            key={image.id}
            className={cn(
              'absolute inset-0 transition-opacity duration-500',
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            )}
          >
            <Image
              src={image.url}
              alt={image.alt[locale]}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}

        {/* Gallery Navigation */}
        {tour.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Image Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {tour.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    'w-3 h-3 rounded-full transition-colors',
                    index === currentImageIndex 
                      ? 'bg-white' 
                      : 'bg-white/50 hover:bg-white/75'
                  )}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8 items-end">
            {/* Tour Info */}
            <div className="lg:col-span-2 text-white">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {getDifficultyLabel(tour.difficulty)}
                </Badge>
                {averageRating > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{averageRating.toFixed(1)}</span>
                    <span className="text-white/80">({tour.reviews.length} reviews)</span>
                  </div>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                {tour.title[locale]}
              </h1>

              <p className="text-lg md:text-xl text-white/90 mb-6 max-w-3xl leading-relaxed">
                {tour.description[locale]}
              </p>

              {/* Tour Details */}
              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{formatDuration(tour.duration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>Max {tour.maxGroupSize} people</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>Prague, Czech Republic</span>
                </div>
              </div>
            </div>

            {/* Booking CTA */}
            <div className="lg:col-span-1">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-xl">
                <div className="text-center mb-4">
                  <div className="text-sm text-gray-600 mb-1">From</div>
                  <div className="text-3xl font-bold text-gray-900">
                    €{tour.basePrice}
                    <span className="text-lg font-normal text-gray-600">/person</span>
                  </div>
                </div>
                
                <Button
                  size="lg"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                  onClick={() => {
                    // Track booking button click
                    if (typeof window !== 'undefined' && window.gtag) {
                      window.gtag('event', 'booking_button_click', {
                        tour_id: tour.id,
                        tour_name: tour.title[locale],
                        location: 'hero',
                        value: tour.basePrice,
                      });
                    }

                    // Scroll to booking widget
                    const bookingWidget = document.getElementById('booking-widget');
                    bookingWidget?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Book This Tour
                </Button>
                
                <p className="text-xs text-gray-500 text-center mt-3">
                  Free cancellation up to 24 hours before
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}