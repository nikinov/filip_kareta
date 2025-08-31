import type { Metadata } from 'next';
import { locales } from '@/paraglide/runtime';

export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  locale?: string;
  alternateUrls?: Record<string, string>;
  structuredData?: Record<string, unknown>;
}

export function generateMetadata(seoData: SEOData): Metadata {
  const {
    title,
    description,
    keywords,
    image,
    url,
    type = 'website',
    locale = 'en',
    alternateUrls = {},
  } = seoData;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://guidefilip-prague.com';
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const imageUrl = image ? `${baseUrl}${image}` : `${baseUrl}/images/og-default.jpg`;

  return {
    title,
    description,
    keywords: keywords?.join(', '),
    authors: [{ name: 'Filip Kareta' }],
    creator: 'Filip Kareta',
    publisher: 'Filip Kareta Prague Tours',
    
    // Open Graph
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: 'Filip Kareta - Prague Tour Guide',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale,
      type: type === 'product' ? 'website' : type,
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@filipprague',
    },

    // Canonical URL
    alternates: {
      canonical: fullUrl,
      languages: {
        ...alternateUrls,
        'x-default': `${baseUrl}/en${url || ''}`,
      },
    },

    // Additional SEO
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Verification
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
    },
  };
}

export function generateAlternateUrls(path: string): Record<string, string> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://guidefilip-prague.com';
  const alternates: Record<string, string> = {};
  
  locales.forEach((locale) => {
    alternates[locale] = `${baseUrl}/${locale}${path}`;
  });
  
  return alternates;
}

export function generateHreflangTags(path: string): Array<{ rel: string; href: string; hrefLang: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://guidefilip-prague.com';
  const hreflangTags: Array<{ rel: string; href: string; hrefLang: string }> = [];
  
  // Add hreflang for each locale
  locales.forEach((locale) => {
    hreflangTags.push({
      rel: 'alternate',
      href: `${baseUrl}/${locale}${path}`,
      hrefLang: locale,
    });
  });
  
  // Add x-default
  hreflangTags.push({
    rel: 'alternate',
    href: `${baseUrl}/en${path}`,
    hrefLang: 'x-default',
  });
  
  return hreflangTags;
}