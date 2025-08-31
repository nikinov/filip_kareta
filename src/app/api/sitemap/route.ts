import { NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';
import { 
  generateStaticPagesSitemap, 
  getToursSitemapData, 
  getBlogPostsSitemapData 
} from '@/lib/sitemap-utils';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://guidefilip-prague.com';
  
  // Generate sitemap entries
  const staticPages = generateStaticPagesSitemap();
  const tours = await getToursSitemapData();
  const blogPosts = await getBlogPostsSitemapData();
  
  // Build XML sitemap
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

  // Add static pages
  staticPages.forEach((entry) => {
    xml += `
  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastModified.toISOString()}</lastmod>
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>`;
    
    // Add hreflang alternates
    if (entry.alternates?.languages) {
      Object.entries(entry.alternates.languages).forEach(([lang, url]) => {
        xml += `
    <xhtml:link rel="alternate" hreflang="${lang}" href="${url}" />`;
      });
    }
    
    xml += `
  </url>`;
  });

  // Add tour pages
  tours.forEach((tour) => {
    routing.locales.forEach((locale) => {
      const url = `${baseUrl}/${locale}/tours/${tour.slug}`;
      const alternates: Record<string, string> = {};
      
      routing.locales.forEach((altLocale) => {
        alternates[altLocale] = `${baseUrl}/${altLocale}/tours/${tour.slug}`;
      });
      alternates['x-default'] = `${baseUrl}/en/tours/${tour.slug}`;

      xml += `
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date(tour.lastModified).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>`;
    
      Object.entries(alternates).forEach(([lang, altUrl]) => {
        xml += `
    <xhtml:link rel="alternate" hreflang="${lang}" href="${altUrl}" />`;
      });
      
      xml += `
  </url>`;
    });
  });

  // Add blog posts
  blogPosts.forEach((post) => {
    routing.locales.forEach((locale) => {
      const url = `${baseUrl}/${locale}/blog/${post.slug}`;
      const alternates: Record<string, string> = {};
      
      routing.locales.forEach((altLocale) => {
        alternates[altLocale] = `${baseUrl}/${altLocale}/blog/${post.slug}`;
      });
      alternates['x-default'] = `${baseUrl}/en/blog/${post.slug}`;

      xml += `
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date(post.lastModified).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>`;
    
      Object.entries(alternates).forEach(([lang, altUrl]) => {
        xml += `
    <xhtml:link rel="alternate" hreflang="${lang}" href="${altUrl}" />`;
      });
      
      xml += `
  </url>`;
    });
  });

  xml += `
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}