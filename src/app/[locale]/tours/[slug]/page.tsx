import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { TourHero } from '@/components/tours/tour-hero';
import { TourDescription } from '@/components/tours/tour-description';
import { TourReviews } from '@/components/tours/tour-reviews';
import { TourBookingWidget } from '@/components/tours/tour-booking-widget';
import { RecentBookings } from '@/components/tours/recent-bookings';
import { LazySection } from '@/components/ui/lazy-wrapper';
import { PageViewTracker } from '@/components/analytics/tracking-components';
import { getTourBySlug, getAllTourSlugs } from '@/lib/tours';
import { generateMetadata as generateSEOMetadata, generateAlternateUrls } from '@/lib/seo';
import { generateTourProductSchema, generateBreadcrumbSchema } from '@/lib/structured-data';
import { StructuredData } from '@/components/seo/structured-data';
import { Locale } from '@/types';

interface TourPageProps {
  params: Promise<{
    locale: Locale;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = await getAllTourSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Enable Static Site Generation for tour pages
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({ params }: TourPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const tour = await getTourBySlug(slug);

  if (!tour) {
    return {
      title: 'Tour Not Found',
    };
  }

  const path = `/tours/${slug}`;
  const alternateUrls = generateAlternateUrls(path);

  return generateSEOMetadata({
    title: tour.seoMetadata.title[locale],
    description: tour.seoMetadata.description[locale],
    keywords: tour.seoMetadata.keywords,
    image: tour.images.length > 0 ? tour.images[0].url : undefined,
    url: path,
    type: 'product',
    locale,
    alternateUrls,
  });
}

export default async function TourPage({ params }: TourPageProps) {
  const { locale, slug } = await params;
  const tour = await getTourBySlug(slug);

  if (!tour) {
    notFound();
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://guidefilip-prague.com';

  // Generate structured data
  const tourProductSchema = generateTourProductSchema({
    name: tour.title[locale],
    description: tour.description[locale],
    image: tour.images.map(img => `${baseUrl}${img.url}`),
    offers: {
      price: tour.basePrice,
      currency: tour.currency,
      availability: 'InStock',
    },
    provider: {
      name: 'Filip Kareta Prague Tours',
      url: baseUrl,
    },
    duration: `PT${Math.floor(tour.duration / 60)}H${tour.duration % 60}M`,
    location: {
      name: 'Prague, Czech Republic',
      address: 'Prague, Czech Republic',
    },
    aggregateRating: tour.reviews.length > 0 ? {
      ratingValue: tour.reviews.reduce((sum, review) => sum + review.rating, 0) / tour.reviews.length,
      reviewCount: tour.reviews.length,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${baseUrl}/${locale}` },
    { name: 'Tours', url: `${baseUrl}/${locale}/tours` },
    { name: tour.title[locale], url: `${baseUrl}/${locale}/tours/${slug}` },
  ]);

  return (
    <>
      <StructuredData data={[tourProductSchema, breadcrumbSchema]} />
      <PageViewTracker />
      <div className="min-h-screen bg-white">
        {/* Tour Hero Section */}
        <TourHero tour={tour} locale={locale} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Tour Description */}
              <TourDescription tour={tour} locale={locale} />

              {/* Reviews Section - Lazy loaded */}
              <LazySection className="space-y-6">
                <TourReviews tour={tour} locale={locale} />
              </LazySection>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              {/* Booking Widget */}
              <TourBookingWidget tour={tour} locale={locale} />

              {/* Recent Bookings - Lazy loaded */}
              <LazySection>
                <RecentBookings tourId={tour.id} locale={locale} />
              </LazySection>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}