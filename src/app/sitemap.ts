import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { 
  generateStaticPagesSitemap, 
  getToursSitemapData, 
  getBlogPostsSitemapData 
} from '@/lib/sitemap-utils';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemap: MetadataRoute.Sitemap = [];

  // Add static pages
  const staticPages = generateStaticPagesSitemap();
  sitemap.push(...staticPages);

  // Add dynamic tour pages
  const tours = await getToursSitemapData();
  tours.forEach((tour) => {
    routing.locales.forEach((locale) => {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://guidefilip-prague.com';
      const url = `${baseUrl}/${locale}/tours/${tour.slug}`;
      sitemap.push({
        url,
        lastModified: new Date(tour.lastModified),
        changeFrequency: 'monthly',
        priority: 0.8,
        alternates: {
          languages: generateAlternateLanguages(`/tours/${tour.slug}`),
        },
      });
    });
  });

  // Add dynamic blog pages
  const blogPosts = await getBlogPostsSitemapData();
  blogPosts.forEach((post) => {
    routing.locales.forEach((locale) => {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://guidefilip-prague.com';
      const url = `${baseUrl}/${locale}/blog/${post.slug}`;
      sitemap.push({
        url,
        lastModified: new Date(post.lastModified),
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: {
          languages: generateAlternateLanguages(`/blog/${post.slug}`),
        },
      });
    });
  });

  return sitemap;
}

function generateAlternateLanguages(path: string): Record<string, string> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://guidefilip-prague.com';
  const alternates: Record<string, string> = {};
  
  routing.locales.forEach((locale) => {
    alternates[locale] = `${baseUrl}/${locale}${path}`;
  });
  
  // Add x-default
  alternates['x-default'] = `${baseUrl}/en${path}`;
  
  return alternates;
}