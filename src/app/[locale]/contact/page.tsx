import { Metadata } from 'next';
import * as m from '@/paraglide/messages';
import { setLocale } from '@/paraglide/runtime';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { generateMetadata as generateSEOMetadata, generateAlternateUrls } from '@/lib/seo';
import { generateLocalBusinessSchema } from '@/lib/structured-data';
import { StructuredData } from '@/components/seo/structured-data';
import { Locale } from '@/types';

interface ContactPageProps {
  params: Promise<{
    locale: Locale;
  }>;
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const path = '/contact';
  const alternateUrls = generateAlternateUrls(path);

  const titles = {
    en: 'Contact Filip Kareta - Prague Tour Guide | Book Your Tour',
    de: 'Kontakt Filip Kareta - Prag Reiseführer | Buchen Sie Ihre Tour',
    fr: 'Contacter Filip Kareta - Guide Touristique Prague | Réservez Votre Tour',
  };

  const descriptions = {
    en: 'Contact Filip Kareta, your local Prague tour guide. Get in touch to book authentic storytelling tours, ask questions, or plan your perfect Prague experience.',
    de: 'Kontaktieren Sie Filip Kareta, Ihren lokalen Prag-Reiseführer. Nehmen Sie Kontakt auf, um authentische Erzähltouren zu buchen, Fragen zu stellen oder Ihr perfektes Prag-Erlebnis zu planen.',
    fr: 'Contactez Filip Kareta, votre guide touristique local de Prague. Prenez contact pour réserver des tours de narration authentiques, poser des questions ou planifier votre expérience parfaite à Prague.',
  };

  return generateSEOMetadata({
    title: titles[locale],
    description: descriptions[locale],
    keywords: ['contact Prague tour guide', 'book Prague tours', 'Filip Kareta contact', 'Prague tour booking'],
    url: path,
    type: 'website',
    locale,
    alternateUrls,
  });
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;

  // Set locale for Paraglide
  setLocale(locale as any);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://guidefilip-prague.com';

  // Generate LocalBusiness structured data
  const localBusinessSchema = generateLocalBusinessSchema({
    name: 'Filip Kareta Prague Tours',
    description: 'Professional Prague tour guide offering authentic storytelling tours and local experiences',
    address: {
      streetAddress: 'Old Town Square',
      addressLocality: 'Prague',
      addressRegion: 'Prague',
      postalCode: '110 00',
      addressCountry: 'CZ',
    },
    telephone: '+420 123 456 789',
    email: 'filip@praguetours.com',
    url: baseUrl,
    image: [`${baseUrl}/images/filip-profile.jpg`, `${baseUrl}/images/prague-tours.jpg`],
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
  });

  return (
    <>
      <StructuredData data={localBusinessSchema} />
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
              {t('contact')}
            </h1>
            <p className="text-xl text-gray-600">
              Get in touch to plan your Prague adventure
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    📧
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">filip@praguetours.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    📱
                  </div>
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-gray-600">+420 123 456 789</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    📍
                  </div>
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-gray-600">Prague, Czech Republic</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  );
}