import { Metadata } from 'next';
import * as m from '@/paraglide/messages';
import { setLocale } from '@/paraglide/runtime';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { generateMetadata as generateSEOMetadata, generateAlternateUrls } from '@/lib/seo';
import { StructuredData } from '@/components/seo/structured-data';
import { generatePersonSchema, generateBreadcrumbSchema } from '@/lib/structured-data';

interface AboutPageProps {
  params: Promise<{ locale: 'en' | 'de' | 'fr' }>;
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;

  // Set locale for Paraglide
  setLocale(locale as any);

  const seoData = {
    title: m['about.seo.title'](),
    description: m['about.seo.description'](),
    keywords: m['about.seo.keywords']().split(',').map(k => k.trim()),
    image: '/images/og-about.jpg',
    url: '/about',
    type: 'website' as const,
    locale,
    alternateUrls: generateAlternateUrls('/about'),
  };

  return generateSEOMetadata(seoData);
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;

  // Set locale for Paraglide
  setLocale(locale as any);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://guidefilip-prague.com';
  
  // Generate structured data
  const personSchema = generatePersonSchema();
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${baseUrl}/${locale}` },
    { name: m['navigation.about'](), url: `${baseUrl}/${locale}/about` },
  ]);

  return (
    <>
      <StructuredData data={[personSchema, breadcrumbSchema]} />
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900">Filip Kareta</h1>
            <LanguageSwitcher />
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {m['about.title']()}
              </h1>
              <p className="text-xl text-gray-600">
                {m['about.subtitle']()}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="h-96 bg-gray-200 rounded-lg"></div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {m['about.sectionTitle']()}
                </h2>
                <p className="text-gray-600 mb-6">
                  {m['about.description1']()}
                </p>
                <p className="text-gray-600 mb-6">
                  {m['about.description2']()}
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>{m['about.credential1']()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>{m['about.credential2']()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span>{m['about.credential3']()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}