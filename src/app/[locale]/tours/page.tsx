import { Metadata } from 'next';
import * as m from '@/paraglide/messages';
import { setLocale } from '@/paraglide/runtime';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { generateMetadata as generateSEOMetadata, generateAlternateUrls } from '@/lib/seo';
import { LazySection } from '@/components/ui/lazy-wrapper';

interface ToursPageProps {
  params: Promise<{ locale: 'en' | 'de' | 'fr' }>;
}

// Enable Static Site Generation for tours listing page
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({ params }: ToursPageProps): Promise<Metadata> {
  const { locale } = await params;

  // Set locale for Paraglide
  setLocale(locale as any);

  const seoData = {
    title: m['tours.seo.title'](),
    description: m['tours.seo.description'](),
    keywords: m['tours.seo.keywords']().split(',').map(k => k.trim()),
    image: '/images/og-tours.jpg',
    url: '/tours',
    type: 'website' as const,
    locale,
    alternateUrls: generateAlternateUrls('/tours'),
  };

  return generateSEOMetadata(seoData);
}

export default async function ToursPage({ params }: ToursPageProps) {
  const { locale } = await params;

  // Set locale for Paraglide
  setLocale(locale as any);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Filip Kareta</h1>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {m['tours.title']()}
          </h1>
          <p className="text-xl text-gray-600">
            {m['tours.subtitle']()}
          </p>
        </div>

        <LazySection className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Placeholder tour cards */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Prague Tour {i}</h3>
                <p className="text-gray-600 mb-4">
                  {m['tours.duration']()}: 3 hours<br />
                  {m['tours.groupSize']()}: 12 people<br />
                  {m['tours.difficulty']()}: Easy
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {m['tours.from']()} €45
                  </span>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                    {m['tours.bookNow']()}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </LazySection>
      </main>
    </div>
  );
}