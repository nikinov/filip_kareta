'use client';

// Mobile-optimized tour card component
// Enhanced touch interactions and mobile-specific layout

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Clock, 
  Users, 
  Star, 
  MapPin, 
  Heart,
  Share2,
  Calendar,
  Euro,
  ChevronRight
} from 'lucide-react';
import { useMobileDevice, useMobileInteractions, MobileInteractions } from '@/lib/mobile-interactions';
import * as m from '@/paraglide/messages';

interface Tour {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  maxGroupSize: number;
  rating: number;
  reviewCount: number;
  highlights: string[];
  images: {
    main: string;
    gallery: string[];
  };
  availability: {
    nextAvailable: string;
    spotsLeft: number;
  };
}

interface MobileTourCardProps {
  tour: Tour;
  locale: string;
  onFavorite?: (tourId: string) => void;
  onShare?: (tour: Tour) => void;
  isFavorite?: boolean;
}

export function MobileTourCard({ 
  tour, 
  locale, 
  onFavorite, 
  onShare, 
  isFavorite = false 
}: MobileTourCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const mobileDevice = useMobileDevice();
  const t = useTranslations('tours');

  // Set up mobile interactions
  useMobileInteractions(cardRef, {
    onTap: (gesture) => {
      // Provide haptic feedback on tap
      MobileInteractions.provideFeedback('light');
    },
    onLongPress: (gesture) => {
      // Long press to share
      if (onShare) {
        MobileInteractions.provideFeedback('medium');
        onShare(tour);
      }
    },
  });

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    MobileInteractions.provideFeedback('light');
    onFavorite?.(tour.id);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    MobileInteractions.provideFeedback('light');
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: tour.name,
          text: tour.description,
          url: `${window.location.origin}/${locale}/tours/${tour.id}`,
        });
      } catch (error) {
        console.log('Share cancelled or failed:', error);
      }
    } else {
      onShare?.(tour);
    }
  };

  const truncatedDescription = tour.description.length > 120 
    ? `${tour.description.substring(0, 120)}...`
    : tour.description;

  return (
    <Card 
      ref={cardRef}
      className="mobile-tour-card overflow-hidden touch-manipulation"
    >
      {/* Image section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={tour.images.main}
          alt={tour.name}
          fill
          className={`object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={false}
        />
        
        {/* Loading placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <MapPin className="h-8 w-8 text-gray-400" />
          </div>
        )}

        {/* Overlay actions */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={handleFavorite}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              isFavorite 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white/80 text-gray-700 hover:bg-white backdrop-blur-sm transition-colors"
            aria-label="Share tour"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        {/* Price badge */}
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-white/90 text-gray-900 font-semibold">
            <Euro className="h-3 w-3 mr-1" />
            {tour.price}
          </Badge>
        </div>

        {/* Availability indicator */}
        {tour.availability.spotsLeft <= 3 && (
          <div className="absolute bottom-3 right-3">
            <Badge variant="destructive" className="text-xs">
              Only {tour.availability.spotsLeft} spots left
            </Badge>
          </div>
        )}
      </div>

      {/* Content section */}
      <CardContent className="p-4">
        {/* Title and rating */}
        <div className="mb-3">
          <h3 className="font-semibold text-lg leading-tight mb-1">
            {tour.name}
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{tour.rating}</span>
              <span>({tour.reviewCount})</span>
            </div>
            
            <span>•</span>
            
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{Math.floor(tour.duration / 60)}h {tour.duration % 60}m</span>
            </div>
            
            <span>•</span>
            
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Max {tour.maxGroupSize}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            {showFullDescription ? tour.description : truncatedDescription}
          </p>
          
          {tour.description.length > 120 && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-blue-600 text-sm font-medium mt-1 hover:text-blue-700"
            >
              {showFullDescription ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Highlights */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {tour.highlights.slice(0, 3).map((highlight, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs"
              >
                {highlight}
              </Badge>
            ))}
            {tour.highlights.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tour.highlights.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Next available */}
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">
                {t('nextAvailable', { default: 'Next Available' })}
              </p>
              <p className="text-xs text-green-600">
                {new Date(tour.availability.nextAvailable).toLocaleDateString(locale, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
            <Calendar className="h-5 w-5 text-green-600" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Link
            href={`/${locale}/tours/${tour.id}`}
            className="flex-1"
          >
            <Button 
              variant="outline" 
              className="w-full justify-between"
              size="sm"
            >
              {t('viewDetails', { default: 'View Details' })}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
          
          <Link
            href={`/${locale}/tours/${tour.id}/book`}
            className="flex-1"
          >
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Calendar className="h-4 w-4 mr-2" />
              {t('bookNow', { default: 'Book Now' })}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Mobile tour grid layout
export function MobileTourGrid({ 
  tours, 
  locale,
  onFavorite,
  onShare,
  favorites = []
}: {
  tours: Tour[];
  locale: string;
  onFavorite?: (tourId: string) => void;
  onShare?: (tour: Tour) => void;
  favorites?: string[];
}) {
  const mobileDevice = useMobileDevice();

  return (
    <div className={`grid gap-4 ${
      mobileDevice.isMobile 
        ? 'grid-cols-1' 
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    }`}>
      {tours.map((tour) => (
        <MobileTourCard
          key={tour.id}
          tour={tour}
          locale={locale}
          onFavorite={onFavorite}
          onShare={onShare}
          isFavorite={favorites.includes(tour.id)}
        />
      ))}
    </div>
  );
}
