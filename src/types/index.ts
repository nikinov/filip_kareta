// Core types for the Prague tour guide website

export type Locale = 'en' | 'de' | 'fr';

export interface LocalizedContent {
  en: string;
  de: string;
  fr: string;
}

export interface SEOMetadata {
  title: LocalizedContent;
  description: LocalizedContent;
  keywords: string[];
  ogImage?: string;
  canonicalUrl?: string;
}

export interface TourImage {
  id: string;
  url: string;
  alt: LocalizedContent;
  caption?: LocalizedContent;
  width: number;
  height: number;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  name: LocalizedContent;
}

export interface AvailabilityRule {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  maxBookings: number;
}

export interface Review {
  id: string;
  tourId: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  date: Date;
  source: 'google' | 'tripadvisor' | 'direct';
  verified: boolean;
  photos?: string[];
  country?: string; // ISO country code (e.g., 'US', 'DE', 'FR')
  countryName?: string; // Full country name for display
}

export interface Tour {
  id: string;
  slug: string;
  title: LocalizedContent;
  description: LocalizedContent;
  highlights: Record<Locale, string[]>;
  duration: number; // minutes
  maxGroupSize: number;
  basePrice: number;
  currency: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  images: TourImage[];
  route: GeoLocation[];
  availability: AvailabilityRule[];
  reviews: Review[];
  seoMetadata: SEOMetadata;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
}

export interface Booking {
  id: string;
  tourId: string;
  customerInfo: CustomerInfo;
  bookingDate: Date;
  groupSize: number;
  totalPrice: number;
  paymentStatus: 'pending' | 'confirmed' | 'failed';
  specialRequests?: string;
  confirmationCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlogPost {
  slug: string;
  title: LocalizedContent;
  content: LocalizedContent;
  excerpt: LocalizedContent;
  publishedAt: Date;
  category: string;
  tags: string[];
  featuredImage: string;
  seoMetadata: SEOMetadata;
  relatedTours: string[]; // Tour IDs
}
