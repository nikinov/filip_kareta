import type { Locale } from '@/types';

// Re-export types and client-safe utilities
export type { BlogPost, BlogCategory } from './blog-server';
export { blogCategories } from './blog-server';

// Client-safe utility functions
export function getBlogPostUrl(slug: string, locale: Locale): string {
  return `/${locale}/blog/${slug}`;
}

export function getBlogCategoryUrl(categorySlug: string, locale: Locale): string {
  return `/${locale}/blog/category/${categorySlug}`;
}