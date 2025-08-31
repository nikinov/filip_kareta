import { StructuredData } from './structured-data';
import { PageHead } from './page-head';
import { generatePageSchemas } from '@/lib/seo-schemas';

interface ComprehensiveSEOProps {
  locale: string;
  pathname: string;
  pageType: 'homepage' | 'tour' | 'blog' | 'about' | 'contact' | 'tours-listing';
  title: string;
  description: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
  tourData?: {
    tourName: string;
    tourDescription: string;
    price: number;
    currency: string;
    duration: number;
    images: string[];
    rating?: {
      value: number;
      count: number;
    };
  };
  blogData?: {
    title: string;
    description: string;
    publishedDate: string;
    modifiedDate?: string;
    author: string;
    image?: string;
    wordCount?: number;
  };
  faqs?: Array<{ question: string; answer: string }>;
}

export function ComprehensiveSEO({
  locale,
  pathname,
  pageType,
  title,
  description,
  breadcrumbs,
  tourData,
  blogData,
  faqs,
}: ComprehensiveSEOProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://guidefilip-prague.com';
  
  const schemas = generatePageSchemas({
    baseUrl,
    locale,
    pathname,
    pageType,
    title,
    description,
    breadcrumbs,
    tourData: tourData ? { ...tourData, baseUrl, locale, pathname } : undefined,
    blogData: blogData ? { ...blogData, baseUrl, locale, pathname } : undefined,
    faqs,
  });

  return (
    <>
      <PageHead pathname={pathname} locale={locale} />
      <StructuredData data={schemas} />
    </>
  );
}