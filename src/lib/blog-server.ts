import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import type { Locale } from '@/types';

export interface BlogPost {
  slug: string;
  title: Record<Locale, string>;
  content: Record<Locale, string>;
  excerpt: Record<Locale, string>;
  publishedAt: Date;
  updatedAt?: Date;
  category: string;
  tags: string[];
  featuredImage: string;
  author: string;
  readingTime: number;
  relatedTours: string[];
  seoMetadata: {
    title: Record<Locale, string>;
    description: Record<Locale, string>;
    keywords: string[];
  };
}

export interface BlogCategory {
  id: string;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  slug: string;
}

const BLOG_CONTENT_PATH = path.join(process.cwd(), 'content/blog');
const POSTS_PER_PAGE = 6;

// Blog categories
export const blogCategories: BlogCategory[] = [
  {
    id: 'travel-guides',
    slug: 'travel-guides',
    name: {
      en: 'Travel Guides',
      de: 'Reiseführer',
      fr: 'Guides de voyage',
    },
    description: {
      en: 'Comprehensive guides to exploring Prague',
      de: 'Umfassende Leitfäden zur Erkundung Prags',
      fr: 'Guides complets pour explorer Prague',
    },
  },
  {
    id: 'food-drink',
    slug: 'food-drink',
    name: {
      en: 'Food & Drink',
      de: 'Essen & Trinken',
      fr: 'Nourriture & Boisson',
    },
    description: {
      en: 'Local culinary experiences and recommendations',
      de: 'Lokale kulinarische Erlebnisse und Empfehlungen',
      fr: 'Expériences culinaires locales et recommandations',
    },
  },
  {
    id: 'history-legends',
    slug: 'history-legends',
    name: {
      en: 'History & Legends',
      de: 'Geschichte & Legenden',
      fr: 'Histoire & Légendes',
    },
    description: {
      en: 'Stories and legends from Prague\'s rich past',
      de: 'Geschichten und Legenden aus Prags reicher Vergangenheit',
      fr: 'Histoires et légendes du riche passé de Prague',
    },
  },
  {
    id: 'practical-tips',
    slug: 'practical-tips',
    name: {
      en: 'Practical Tips',
      de: 'Praktische Tipps',
      fr: 'Conseils pratiques',
    },
    description: {
      en: 'Helpful tips for visiting Prague',
      de: 'Hilfreiche Tipps für den Besuch in Prag',
      fr: 'Conseils utiles pour visiter Prague',
    },
  },
];

// Get all blog posts
export function getAllBlogPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_CONTENT_PATH)) {
    return [];
  }

  const fileNames = fs.readdirSync(BLOG_CONTENT_PATH);
  const posts = fileNames
    .filter((name) => name.endsWith('.mdx'))
    .map((name) => {
      const slug = name.replace(/\.mdx$/, '');
      return getBlogPostBySlug(slug);
    })
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  return posts;
}

// Get blog post by slug
export function getBlogPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(BLOG_CONTENT_PATH, `${slug}.mdx`);
    
    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // Calculate reading time for English content
    const stats = readingTime(content);

    return {
      slug,
      title: data.title,
      content: { en: content, de: content, fr: content }, // For now, same content for all languages
      excerpt: data.excerpt,
      publishedAt: new Date(data.publishedAt),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
      category: data.category,
      tags: data.tags || [],
      featuredImage: data.featuredImage,
      author: data.author || 'Filip Kareta',
      readingTime: Math.ceil(stats.minutes),
      relatedTours: data.relatedTours || [],
      seoMetadata: {
        title: data.seoTitle || data.title,
        description: data.seoDescription || data.excerpt,
        keywords: data.seoKeywords || data.tags || [],
      },
    };
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error);
    return null;
  }
}

// Get posts by category
export function getBlogPostsByCategory(categorySlug: string): BlogPost[] {
  const allPosts = getAllBlogPosts();
  return allPosts.filter((post) => post.category === categorySlug);
}

// Get posts by tag
export function getBlogPostsByTag(tag: string): BlogPost[] {
  const allPosts = getAllBlogPosts();
  return allPosts.filter((post) => post.tags.includes(tag));
}

// Get paginated posts
export function getPaginatedBlogPosts(page: number = 1, category?: string): {
  posts: BlogPost[];
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
} {
  let allPosts = getAllBlogPosts();
  
  if (category) {
    allPosts = getBlogPostsByCategory(category);
  }

  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const startIndex = (page - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const posts = allPosts.slice(startIndex, endIndex);

  return {
    posts,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

// Get related posts
export function getRelatedBlogPosts(currentSlug: string, limit: number = 3): BlogPost[] {
  const currentPost = getBlogPostBySlug(currentSlug);
  if (!currentPost) return [];

  const allPosts = getAllBlogPosts().filter((post) => post.slug !== currentSlug);
  
  // Score posts based on shared tags and category
  const scoredPosts = allPosts.map((post) => {
    let score = 0;
    
    // Same category gets higher score
    if (post.category === currentPost.category) {
      score += 3;
    }
    
    // Shared tags get points
    const sharedTags = post.tags.filter((tag) => currentPost.tags.includes(tag));
    score += sharedTags.length;
    
    return { post, score };
  });

  // Sort by score and return top posts
  return scoredPosts
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.post);
}

// Get all unique tags
export function getAllBlogTags(): string[] {
  const allPosts = getAllBlogPosts();
  const tags = new Set<string>();
  
  allPosts.forEach((post) => {
    post.tags.forEach((tag) => tags.add(tag));
  });
  
  return Array.from(tags).sort();
}

// Get category by slug
export function getBlogCategoryBySlug(slug: string): BlogCategory | null {
  return blogCategories.find((category) => category.slug === slug) || null;
}

// Generate blog post URL
export function getBlogPostUrl(slug: string, locale: Locale): string {
  return `/${locale}/blog/${slug}`;
}

// Generate category URL
export function getBlogCategoryUrl(categorySlug: string, locale: Locale): string {
  return `/${locale}/blog/category/${categorySlug}`;
}