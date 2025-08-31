import { Metadata } from 'next';
import * as m from '@/paraglide/messages';
import { setLocale } from '@/paraglide/runtime';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Footer } from '@/components/layout/footer';
import {
  HeroSection,
  FeaturedToursCarousel,
  SocialProofSection,
  AboutFilipSection
} from '@/components/homepage';
import { generateMetadata as generateSEOMetadata, generateAlternateUrls } from '@/lib/seo';
import { LazySection } from '@/components/ui/lazy-wrapper';
import { StructuredData } from '@/components/seo/structured-data';
import { generateLocalBusinessSchema, generateWebsiteSchema, generatePersonSchema } from '@/lib/structured-data';

interface HomePageProps {
  params: Promise<{ locale: 'en' | 'de' | 'fr' }>;
}

// Enable Static Site Generation for homepage
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;

  // Set locale for Paraglide
  setLocale(locale as any);

  const seoData = {
    title: m['homepage.seo.title'](),
    description: m['homepage.seo.description'](),
    keywords: m['homepage.seo.keywords']().split(',').map(k => k.trim()),
    image: '/images/og-homepage.jpg',
    url: '',
    type: 'website' as const,
    locale,
    alternateUrls: generateAlternateUrls(''),
  };

  return generateSEOMetadata(seoData);
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  // Generate structured data for homepage
  const localBusinessData = {
    name: 'Filip Kareta Prague Tours',
    description: 'Authentic Prague tours with local storytelling guide Filip Kareta. Discover hidden gems and fascinating stories of Prague.',
    address: {
      streetAddress: 'Old Town Square',
      addressLocality: 'Prague',
      addressRegion: 'Prague',
      postalCode: '110 00',
      addressCountry: 'CZ',
    },
    telephone: '+420 123 456 789',
    email: 'info@guidefilip-prague.com',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://guidefilip-prague.com',
    image: [
      `${process.env.NEXT_PUBLIC_BASE_URL || 'https://guidefilip-prague.com'}/images/filip-profile.jpg`,
      `${process.env.NEXT_PUBLIC_BASE_URL || 'https://guidefilip-prague.com'}/images/prague-tours.jpg`,
    ],
    priceRange: '€€',
    openingHours: [
      'Monday 09:00 18:00',
      'Tuesday 09:00 18:00',
      'Wednesday 09:00 18:00',
      'Thursday 09:00 18:00',
      'Friday 09:00 18:00',
      'Saturday 09:00 18:00',
      'Sunday 09:00 18:00',
    ],
    geo: {
      latitude: 50.0875,
      longitude: 14.4213,
    },
    sameAs: [
      'https://www.tripadvisor.com/Attraction_Review-g274707-d12345678-Reviews-Filip_Kareta_Prague_Tours-Prague_Bohemia.html',
      'https://www.google.com/maps/place/Filip+Kareta+Prague+Tours',
      'https://www.facebook.com/filippraguetours',
      'https://www.instagram.com/filipprague',
    ],
  };

  const localBusinessSchema = generateLocalBusinessSchema(localBusinessData);
  const websiteSchema = generateWebsiteSchema();
  const personSchema = generatePersonSchema();

  return (
    <>
      <StructuredData data={[localBusinessSchema, websiteSchema, personSchema]} />
      <div className="min-h-screen">
        {/* Main Content */}
        <div>
          {/* Hero Section - Above the fold, no lazy loading */}
          <HeroSection />

          {/* Featured Tours - Lazy loaded */}
          <LazySection>
            <FeaturedToursCarousel locale={locale} />
          </LazySection>

          {/* Social Proof - Lazy loaded */}
          <LazySection>
            <SocialProofSection />
          </LazySection>

          {/* About Filip - Lazy loaded */}
          <LazySection>
            <AboutFilipSection />
          </LazySection>
        </div>
      </div>
    </>
  );
}