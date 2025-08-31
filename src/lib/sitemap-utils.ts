import { routing } from '@/i18n/routing';

export interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  alternates?: {
    languages: Record<string, string>;
  };
}

export function generateSitemapEntry(
  path: string,
  options: {
    lastModified?: Date;
    changeFrequency?: SitemapEntry['changeFrequency'];
    priority?: number;
  } = {}
): SitemapEntry[] {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://guidefilip-prague.com';
  const {
    lastModified = new Date(),
    changeFrequency = 'monthly',
    priority = 0.5,
  } = options;

  const entries: SitemapEntry[] = [];

  routing.locales.forEach((locale) => {
    const url = `${baseUrl}/${locale}${path}`;
    const alternates: Record<string, string> = {};
    
    // Generate alternate language URLs
    routing.locales.forEach((altLocale) => {
      alternates[altLocale] = `${baseUrl}/${altLocale}${path}`;
    });
    alternates['x-default'] = `${baseUrl}/en${path}`;

    entries.push({
      url,
      lastModified,
      changeFrequency,
      priority,
      alternates: {
        languages: alternates,
      },
    });
  });

  return entries;
}

export function generateStaticPagesSitemap(): SitemapEntry[] {
  const staticPages = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/tours', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/blog', priority: 0.8, changeFrequency: 'daily' as const },
    { path: '/about', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.6, changeFrequency: 'monthly' as const },
  ];

  const entries: SitemapEntry[] = [];

  staticPages.forEach((page) => {
    entries.push(...generateSitemapEntry(page.path, {
      priority: page.priority,
      changeFrequency: page.changeFrequency,
    }));
  });

  return entries;
}

// This function would typically fetch from your CMS or database
export async function getToursSitemapData() {
  // Mock data - replace with actual data fetching
  return [
    { slug: 'prague-castle', lastModified: '2024-01-15' },
    { slug: 'old-town', lastModified: '2024-01-15' },
    { slug: 'jewish-quarter', lastModified: '2024-01-15' },
    { slug: 'lesser-town', lastModified: '2024-01-15' },
    { slug: 'new-town', lastModified: '2024-01-15' },
  ];
}

// This function would typically fetch from your CMS or database
export async function getBlogPostsSitemapData() {
  // Mock data - replace with actual data fetching
  return [
    { slug: 'best-prague-restaurants', lastModified: '2024-01-20' },
    { slug: 'prague-castle-history', lastModified: '2024-01-18' },
    { slug: 'hidden-gems-prague', lastModified: '2024-01-22' },
  ];
}