import { Metadata } from 'next';
import { generateMetadata, SEOData } from '@/lib/seo';
import { StructuredData } from './structured-data';

interface PageSEOProps {
  seoData: SEOData;
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
}

export function generatePageMetadata(seoData: SEOData): Metadata {
  return generateMetadata(seoData);
}

export function PageSEO({ structuredData }: PageSEOProps) {
  if (!structuredData) {
    return null;
  }

  return <StructuredData data={structuredData} />;
}