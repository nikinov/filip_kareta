'use client';

import * as m from '@/paraglide/messages';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { ResponsiveImage } from '@/components/ui/responsive-image';
import type { Tour } from '@/types';

// Mock tour data - in real implementation, this would come from props or API
const mockTours: Partial<Tour>[] = [
  {
    id: '1',
    slug: 'prague-castle-stories',
    title: {
      en: 'Prague Castle: Stories of Kings & Legends',
      de: 'Prager Burg: Geschichten von Königen & Legenden',
      fr: 'Château de Prague: Histoires de Rois & Légendes'
    },
    basePrice: 45,
    duration: 180,
    images: [{
      id: '1',
      url: '/images/tours/prague-castle.jpg',
      alt: {
        en: 'Prague Castle with St. Vitus Cathedral',
        de: 'Prager Burg mit St. Veits-Dom',
        fr: 'Château de Prague avec la cathédrale Saint-Guy'
      },
      width: 400,
      height: 300
    }]
  },
  {
    id: '2',
    slug: 'old-town-mysteries',
    title: {
      en: 'Old Town Mysteries & Hidden Gems',
      de: 'Geheimnisse der Altstadt & Versteckte Juwelen',
      fr: 'Mystères de la Vieille Ville & Joyaux Cachés'
    },
    basePrice: 35,
    duration: 150,
    images: [{
      id: '2',
      url: '/images/tours/old-town.jpg',
      alt: {
        en: 'Prague Old Town Square with Astronomical Clock',
        de: 'Prager Altstädter Ring mit Astronomischer Uhr',
        fr: 'Place de la Vieille Ville de Prague avec Horloge Astronomique'
      },
      width: 400,
      height: 300
    }]
  },
  {
    id: '3',
    slug: 'jewish-quarter-heritage',
    title: {
      en: 'Jewish Quarter: Heritage & Memory',
      de: 'Jüdisches Viertel: Erbe & Erinnerung',
      fr: 'Quartier Juif: Patrimoine & Mémoire'
    },
    basePrice: 40,
    duration: 120,
    images: [{
      id: '3',
      url: '/images/tours/jewish-quarter.jpg',
      alt: {
        en: 'Old Jewish Cemetery in Prague',
        de: 'Alter Jüdischer Friedhof in Prag',
        fr: 'Ancien Cimetière Juif à Prague'
      },
      width: 400,
      height: 300
    }]
  },
  {
    id: '4',
    slug: 'charles-bridge-tales',
    title: {
      en: 'Charles Bridge: Tales of Stone Saints',
      de: 'Karlsbrücke: Geschichten der Steinheiligen',
      fr: 'Pont Charles: Contes des Saints de Pierre'
    },
    basePrice: 30,
    duration: 90,
    images: [{
      id: '4',
      url: '/images/tours/charles-bridge.jpg',
      alt: {
        en: 'Charles Bridge with Prague Castle in background',
        de: 'Karlsbrücke mit Prager Burg im Hintergrund',
        fr: 'Pont Charles avec le Château de Prague en arrière-plan'
      },
      width: 400,
      height: 300
    }]
  }
];

interface FeaturedToursCarouselProps {
  locale: 'en' | 'de' | 'fr';
}

export function FeaturedToursCarousel({ locale }: FeaturedToursCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mockTours.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % mockTours.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + mockTours.length) % mockTours.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };



  return (
    <section className="py-16 md:py-24 bg-stone-50">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-stone-900 mb-4">
            {m['homepage.featuredTours.title']()}
          </h2>
          <p className="text-lg md:text-xl text-stone-600 max-w-3xl mx-auto">
            {m['homepage.featuredTours.subtitle']()}
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Desktop Grid View (hidden on mobile) */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {mockTours.slice(0, 3).map((tour) => (
              <TourCard key={tour.id} tour={tour} locale={locale} />
            ))}
          </div>

          {/* Mobile Carousel */}
          <div className="md:hidden">
            <div
              ref={carouselRef}
              className="overflow-hidden rounded-xl"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {mockTours.map((tour) => (
                  <div key={tour.id} className="w-full flex-shrink-0 px-4">
                    <TourCard tour={tour} locale={locale} />
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex justify-center items-center mt-6 gap-4">
              <button
                onClick={prevSlide}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
                aria-label="Previous tour"
              >
                <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Dots indicator */}
              <div className="flex gap-2">
                {mockTours.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-prague-500' : 'bg-stone-300'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
                aria-label="Next tour"
              >
                <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* View All Tours CTA */}
          <div className="text-center mt-12">
            <Link href={`/${locale}/tours`}>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.gtag) {
                    window.gtag('event', 'view_all_tours_click', {
                      location: 'featured_carousel',
                      page_location: window.location.href,
                    });
                  }
                }}
              >
                {m['homepage.featuredTours.viewAllCta']()}
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

interface TourCardProps {
  tour: Partial<Tour>;
  locale: 'en' | 'de' | 'fr';
}

function TourCard({ tour, locale }: TourCardProps) {

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  return (
    <Card className="group hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
      {/* Tour Image */}
      <div className="relative overflow-hidden rounded-t-lg">
        <ResponsiveImage
          src={tour.images?.[0]?.url || '/images/placeholder-tour.jpg'}
          alt={tour.images?.[0]?.alt?.[locale] || 'Tour image'}
          width={400}
          height={300}
          className="w-full h-48 md:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Price badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-sm font-semibold text-stone-900">
            From €{tour.basePrice}
          </span>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Tour Title */}
        <h3 className="text-xl font-semibold text-stone-900 mb-2 group-hover:text-prague-600 transition-colors">
          {tour.title?.[locale]}
        </h3>

        {/* Tour Details */}
        <div className="flex items-center gap-4 text-sm text-stone-600 mb-4">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{tour.duration ? formatDuration(tour.duration) : '2h'}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Small groups</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex text-gold-400">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-stone-600">4.9 (45 reviews)</span>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button
          variant="default"
          className="w-full"
          onClick={() => {
            if (typeof window !== 'undefined' && window.gtag) {
              window.gtag('event', 'booking_button_click', {
                tour_id: tour.id,
                tour_name: tour.title?.[locale],
                location: 'featured_carousel',
                value: tour.basePrice,
              });
            }
            // Navigate to tour page or booking flow
            window.location.href = `/${locale}/tours/${tour.slug}`;
          }}
        >
          {m['homepage.featuredTours.bookNow']()}
        </Button>
      </CardFooter>
    </Card>
  );
}