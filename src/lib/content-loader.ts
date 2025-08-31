// Content loader and management system
// Handles loading and caching of multilingual content

import { promises as fs } from 'fs';
import path from 'path';
import { Tour, BlogPost, Review, Locale } from '@/types';

interface ContentCache {
  tours: Map<string, Tour>;
  blogPosts: Map<string, BlogPost>;
  reviews: Map<string, Review[]>;
  lastUpdated: Date;
}

class ContentLoader {
  private cache: ContentCache = {
    tours: new Map(),
    blogPosts: new Map(),
    reviews: new Map(),
    lastUpdated: new Date(),
  };

  private contentPath = path.join(process.cwd(), 'content');

  // Load all tours with multilingual content
  async loadTours(): Promise<Tour[]> {
    try {
      const toursPath = path.join(this.contentPath, 'tours');
      const files = await fs.readdir(toursPath);
      const tourFiles = files.filter(file => file.endsWith('.json'));

      const tours: Tour[] = [];

      for (const file of tourFiles) {
        const filePath = path.join(toursPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const tour = JSON.parse(content) as Tour;
        
        // Validate tour data
        if (this.validateTour(tour)) {
          tours.push(tour);
          this.cache.tours.set(tour.id, tour);
        }
      }

      return tours.sort((a, b) => a.title.en.localeCompare(b.title.en));
    } catch (error) {
      console.error('Failed to load tours:', error);
      return [];
    }
  }

  // Load specific tour by ID
  async loadTour(tourId: string): Promise<Tour | null> {
    // Check cache first
    if (this.cache.tours.has(tourId)) {
      return this.cache.tours.get(tourId)!;
    }

    try {
      const filePath = path.join(this.contentPath, 'tours', `${tourId}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      const tour = JSON.parse(content) as Tour;
      
      if (this.validateTour(tour)) {
        this.cache.tours.set(tourId, tour);
        return tour;
      }
    } catch (error) {
      console.error(`Failed to load tour ${tourId}:`, error);
    }

    return null;
  }

  // Load blog posts with MDX processing
  async loadBlogPosts(): Promise<BlogPost[]> {
    try {
      const blogPath = path.join(this.contentPath, 'blog');
      const files = await fs.readdir(blogPath);
      const mdxFiles = files.filter(file => file.endsWith('.mdx'));

      const blogPosts: BlogPost[] = [];

      for (const file of mdxFiles) {
        const slug = file.replace('.mdx', '');
        const blogPost = await this.loadBlogPost(slug);
        
        if (blogPost) {
          blogPosts.push(blogPost);
        }
      }

      return blogPosts.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    } catch (error) {
      console.error('Failed to load blog posts:', error);
      return [];
    }
  }

  // Load specific blog post
  async loadBlogPost(slug: string): Promise<BlogPost | null> {
    // Check cache first
    if (this.cache.blogPosts.has(slug)) {
      return this.cache.blogPosts.get(slug)!;
    }

    try {
      const filePath = path.join(this.contentPath, 'blog', `${slug}.mdx`);
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Parse frontmatter and content
      const { frontmatter, content: mdxContent } = this.parseMDX(content);
      
      const blogPost: BlogPost = {
        slug,
        title: frontmatter.title,
        content: { en: mdxContent, de: mdxContent, fr: mdxContent }, // TODO: Implement proper translation
        excerpt: frontmatter.excerpt,
        publishedAt: new Date(frontmatter.publishedAt),
        category: frontmatter.category,
        tags: frontmatter.tags,
        featuredImage: frontmatter.featuredImage,
      };

      this.cache.blogPosts.set(slug, blogPost);
      return blogPost;
    } catch (error) {
      console.error(`Failed to load blog post ${slug}:`, error);
      return null;
    }
  }

  // Load reviews and testimonials
  async loadReviews(): Promise<Review[]> {
    try {
      const reviewsPath = path.join(this.contentPath, 'reviews', 'testimonials.json');
      const content = await fs.readFile(reviewsPath, 'utf-8');
      const reviewsData = JSON.parse(content);

      const allReviews = [
        ...reviewsData.featured,
        ...reviewsData.recent,
      ];

      return allReviews.map((review: any) => ({
        ...review,
        date: new Date(review.date),
      }));
    } catch (error) {
      console.error('Failed to load reviews:', error);
      return [];
    }
  }

  // Load reviews for specific tour
  async loadTourReviews(tourId: string): Promise<Review[]> {
    const allReviews = await this.loadReviews();
    return allReviews.filter(review => review.tourId === tourId);
  }

  // Load media gallery
  async loadMediaGallery(): Promise<any> {
    try {
      const galleryPath = path.join(this.contentPath, 'media', 'photo-gallery.json');
      const content = await fs.readFile(galleryPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to load media gallery:', error);
      return { collections: {} };
    }
  }

  // Content validation
  private validateTour(tour: any): boolean {
    const requiredFields = ['id', 'slug', 'title', 'description', 'duration', 'basePrice'];
    
    for (const field of requiredFields) {
      if (!tour[field]) {
        console.warn(`Tour missing required field: ${field}`);
        return false;
      }
    }

    // Validate multilingual content
    const locales: Locale[] = ['en', 'de', 'fr'];
    for (const locale of locales) {
      if (!tour.title[locale] || !tour.description[locale]) {
        console.warn(`Tour missing ${locale} translation`);
        return false;
      }
    }

    return true;
  }

  // Parse MDX frontmatter
  private parseMDX(content: string): { frontmatter: any; content: string } {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
      return { frontmatter: {}, content };
    }

    const [, frontmatterStr, mdxContent] = match;
    
    // Simple YAML parsing for frontmatter
    const frontmatter: any = {};
    const lines = frontmatterStr.split('\n');
    let currentKey = '';
    let currentObject: any = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.endsWith(':')) {
        currentKey = trimmed.slice(0, -1);
        if (currentKey.includes(' ')) {
          // Handle nested objects like title: or excerpt:
          frontmatter[currentKey] = {};
          currentObject = frontmatter[currentKey];
        } else {
          currentObject = null;
        }
      } else if (currentObject && trimmed.includes(':')) {
        const [key, ...valueParts] = trimmed.split(':');
        const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
        currentObject[key.trim()] = value;
      } else if (trimmed.includes(':')) {
        const [key, ...valueParts] = trimmed.split(':');
        const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
        
        if (value.startsWith('[') && value.endsWith(']')) {
          // Handle arrays
          frontmatter[key.trim()] = value.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
        } else {
          frontmatter[key.trim()] = value;
        }
      }
    }

    return { frontmatter, content: mdxContent };
  }

  // Get content statistics
  async getContentStats(): Promise<{
    tours: number;
    blogPosts: number;
    reviews: number;
    translations: { [key in Locale]: number };
  }> {
    const tours = await this.loadTours();
    const blogPosts = await this.loadBlogPosts();
    const reviews = await this.loadReviews();

    const translations = {
      en: tours.length + blogPosts.length,
      de: tours.filter(t => t.title.de).length + blogPosts.filter(b => b.title.de).length,
      fr: tours.filter(t => t.title.fr).length + blogPosts.filter(b => b.title.fr).length,
    };

    return {
      tours: tours.length,
      blogPosts: blogPosts.length,
      reviews: reviews.length,
      translations,
    };
  }

  // Search content
  async searchContent(query: string, locale: Locale = 'en'): Promise<{
    tours: Tour[];
    blogPosts: BlogPost[];
  }> {
    const tours = await this.loadTours();
    const blogPosts = await this.loadBlogPosts();

    const searchTerms = query.toLowerCase().split(' ');

    const matchingTours = tours.filter(tour => {
      const searchText = `${tour.title[locale]} ${tour.description[locale]} ${tour.highlights[locale]?.join(' ')}`.toLowerCase();
      return searchTerms.some(term => searchText.includes(term));
    });

    const matchingBlogPosts = blogPosts.filter(post => {
      const searchText = `${post.title[locale]} ${post.excerpt[locale]} ${post.tags.join(' ')}`.toLowerCase();
      return searchTerms.some(term => searchText.includes(term));
    });

    return {
      tours: matchingTours,
      blogPosts: matchingBlogPosts,
    };
  }

  // Clear cache
  clearCache(): void {
    this.cache = {
      tours: new Map(),
      blogPosts: new Map(),
      reviews: new Map(),
      lastUpdated: new Date(),
    };
  }

  // Preload critical content
  async preloadCriticalContent(): Promise<void> {
    try {
      await Promise.all([
        this.loadTours(),
        this.loadReviews(),
      ]);
      console.log('Critical content preloaded successfully');
    } catch (error) {
      console.error('Failed to preload critical content:', error);
    }
  }
}

// Singleton instance
export const contentLoader = new ContentLoader();

// Utility functions for content access
export async function getTours(): Promise<Tour[]> {
  return contentLoader.loadTours();
}

export async function getTour(tourId: string): Promise<Tour | null> {
  return contentLoader.loadTour(tourId);
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  return contentLoader.loadBlogPosts();
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  return contentLoader.loadBlogPost(slug);
}

export async function getReviews(): Promise<Review[]> {
  return contentLoader.loadReviews();
}

export async function getTourReviews(tourId: string): Promise<Review[]> {
  return contentLoader.loadTourReviews(tourId);
}

export async function searchContent(query: string, locale: Locale = 'en') {
  return contentLoader.searchContent(query, locale);
}

// Content validation utilities
export function validateContentStructure(content: any, type: 'tour' | 'blog'): boolean {
  if (type === 'tour') {
    return !!(content.id && content.title && content.description && content.basePrice);
  }
  
  if (type === 'blog') {
    return !!(content.slug && content.title && content.content && content.publishedAt);
  }
  
  return false;
}

// SEO content optimization
export function generateSEOMetadata(content: Tour | BlogPost, locale: Locale) {
  if ('basePrice' in content) {
    // Tour SEO
    return {
      title: content.seoMetadata?.title[locale] || content.title[locale],
      description: content.seoMetadata?.description[locale] || content.description[locale],
      keywords: content.seoMetadata?.keywords || [],
      ogImage: content.seoMetadata?.ogImage || content.images[0]?.url,
      canonicalUrl: `/tours/${content.slug}`,
    };
  } else {
    // Blog post SEO
    return {
      title: content.title[locale],
      description: content.excerpt[locale],
      keywords: content.tags || [],
      ogImage: content.featuredImage,
      canonicalUrl: `/blog/${content.slug}`,
    };
  }
}
