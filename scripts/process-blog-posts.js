const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const readingTime = require('reading-time');

const BLOG_CONTENT_PATH = path.join(process.cwd(), 'content', 'blog');
const OUTPUT_PATH = path.join(process.cwd(), 'src', 'lib', 'generated-blog-data.ts');

function getAllBlogSlugs() {
  if (!fs.existsSync(BLOG_CONTENT_PATH)) {
    return [];
  }

  const files = fs.readdirSync(BLOG_CONTENT_PATH);
  return files
    .filter(file => file.endsWith('.mdx'))
    .map(file => file.replace('.mdx', ''));
}

function processBlogPost(slug) {
  try {
    const filePath = path.join(BLOG_CONTENT_PATH, `${slug}.mdx`);
    
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content } = matter(fileContent);
    
    // Calculate reading time
    const readingTimeStats = readingTime(content);
    
    // Get file stats for dates
    const stats = fs.statSync(filePath);
    
    return {
      slug,
      frontmatter,
      content,
      readingTime: Math.ceil(readingTimeStats.minutes),
      publishedAt: frontmatter.publishedAt,
      updatedAt: stats.mtime.toISOString(),
    };
  } catch (error) {
    console.error(`Error processing blog post ${slug}:`, error);
    return null;
  }
}

function generateBlogData() {
  const slugs = getAllBlogSlugs();
  const posts = slugs
    .map(slug => processBlogPost(slug))
    .filter(post => post !== null);

  const tsContent = `// This file is auto-generated. Do not edit manually.
// Generated at: ${new Date().toISOString()}

import type { Locale } from '@/types';

export interface BlogPostFrontmatter {
  title: Record<Locale, string>;
  excerpt: Record<Locale, string>;
  publishedAt: string;
  category: string;
  tags: string[];
  featuredImage: string;
  author: string;
  relatedTours: string[];
  seoTitle: Record<Locale, string>;
  seoDescription: Record<Locale, string>;
  seoKeywords: string[];
}

export interface ProcessedBlogPost {
  slug: string;
  frontmatter: BlogPostFrontmatter;
  content: string;
  readingTime: number;
  publishedAt: string;
  updatedAt?: string;
}

export const blogPosts: ProcessedBlogPost[] = ${JSON.stringify(posts, null, 2)};

export function getLocalizedContent<T extends Record<Locale, string>>(
  content: T, 
  locale: Locale
): string {
  return content[locale] || content.en || Object.values(content)[0] || '';
}

export function getAllBlogPosts(): ProcessedBlogPost[] {
  return blogPosts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getBlogPostBySlug(slug: string): ProcessedBlogPost | null {
  return blogPosts.find(post => post.slug === slug) || null;
}

export function getBlogPostsByCategory(category: string): ProcessedBlogPost[] {
  return blogPosts.filter(post => post.frontmatter.category === category)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getBlogPostsByTag(tag: string): ProcessedBlogPost[] {
  return blogPosts.filter(post => post.frontmatter.tags.includes(tag))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getPaginatedBlogPosts(
  page: number = 1, 
  postsPerPage: number = 6,
  category?: string,
  tag?: string
): {
  posts: ProcessedBlogPost[];
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalPosts: number;
} {
  let allPosts = getAllBlogPosts();
  
  if (category) {
    allPosts = getBlogPostsByCategory(category);
  } else if (tag) {
    allPosts = getBlogPostsByTag(tag);
  }

  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const startIndex = (page - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const posts = allPosts.slice(startIndex, endIndex);

  return {
    posts,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    totalPosts,
  };
}

export function getRelatedBlogPosts(currentSlug: string, limit: number = 3): ProcessedBlogPost[] {
  const currentPost = getBlogPostBySlug(currentSlug);
  if (!currentPost) return [];

  const allPosts = getAllBlogPosts().filter(post => post.slug !== currentSlug);
  
  // Score posts based on shared tags and category
  const scoredPosts = allPosts.map(post => {
    let score = 0;
    
    // Same category gets higher score
    if (post.frontmatter.category === currentPost.frontmatter.category) {
      score += 3;
    }
    
    // Shared tags get points
    const sharedTags = post.frontmatter.tags.filter(tag => 
      currentPost.frontmatter.tags.includes(tag)
    );
    score += sharedTags.length;
    
    return { post, score };
  });

  // Sort by score and return top posts
  return scoredPosts
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post);
}

export function getAllBlogTags(): string[] {
  const tags = new Set<string>();
  
  blogPosts.forEach(post => {
    post.frontmatter.tags.forEach(tag => tags.add(tag));
  });
  
  return Array.from(tags).sort();
}

export function getAllBlogCategories(): Array<{
  slug: string;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  postCount: number;
}> {
  const categoryData = {
    'travel-guides': {
      name: {
        en: 'Travel Guides',
        de: 'Reiseführer',
        fr: 'Guides de voyage',
      },
      description: {
        en: 'Comprehensive guides to help you explore Prague like a local',
        de: 'Umfassende Leitfäden, um Prag wie ein Einheimischer zu erkunden',
        fr: 'Guides complets pour explorer Prague comme un local',
      },
    },
    'food-drink': {
      name: {
        en: 'Food & Drink',
        de: 'Essen & Trinken',
        fr: 'Nourriture & Boisson',
      },
      description: {
        en: 'Discover authentic Czech cuisine and local dining experiences',
        de: 'Entdecken Sie authentische tschechische Küche und lokale Gastronomie',
        fr: 'Découvrez la cuisine tchèque authentique et les expériences culinaires locales',
      },
    },
    'history-legends': {
      name: {
        en: 'History & Legends',
        de: 'Geschichte & Legenden',
        fr: 'Histoire & Légendes',
      },
      description: {
        en: 'Fascinating stories and legends from Prague\\'s rich history',
        de: 'Faszinierende Geschichten und Legenden aus Prags reicher Geschichte',
        fr: 'Histoires fascinantes et légendes de la riche histoire de Prague',
      },
    },
    'practical-tips': {
      name: {
        en: 'Practical Tips',
        de: 'Praktische Tipps',
        fr: 'Conseils pratiques',
      },
      description: {
        en: 'Essential tips and advice for visiting Prague',
        de: 'Wichtige Tipps und Ratschläge für den Besuch in Prag',
        fr: 'Conseils essentiels et conseils pour visiter Prague',
      },
    },
  };

  const categories = new Set<string>();
  blogPosts.forEach(post => {
    categories.add(post.frontmatter.category);
  });

  return Array.from(categories).map(slug => {
    const categoryInfo = categoryData[slug as keyof typeof categoryData] || {
      name: { en: slug.replace('-', ' '), de: slug.replace('-', ' '), fr: slug.replace('-', ' ') },
      description: { en: \`Posts about \${slug.replace('-', ' ')}\`, de: \`Beiträge über \${slug.replace('-', ' ')}\`, fr: \`Articles sur \${slug.replace('-', ' ')}\` },
    };
    
    return {
      slug,
      ...categoryInfo,
      postCount: blogPosts.filter(post => post.frontmatter.category === slug).length,
    };
  }).sort((a, b) => b.postCount - a.postCount);
}

export function getBlogPostUrl(slug: string, locale: Locale): string {
  return \`/\${locale}/blog/\${slug}\`;
}

export function getBlogCategoryUrl(category: string, locale: Locale): string {
  return \`/\${locale}/blog/category/\${category}\`;
}

export function getBlogTagUrl(tag: string, locale: Locale): string {
  return \`/\${locale}/blog?tag=\${encodeURIComponent(tag)}\`;
}

export function searchBlogPosts(query: string, locale: Locale): ProcessedBlogPost[] {
  const allPosts = getAllBlogPosts();
  const searchTerm = query.toLowerCase();

  return allPosts.filter(post => {
    const title = getLocalizedContent(post.frontmatter.title, locale).toLowerCase();
    const excerpt = getLocalizedContent(post.frontmatter.excerpt, locale).toLowerCase();
    const content = post.content.toLowerCase();
    const tags = post.frontmatter.tags.join(' ').toLowerCase();
    
    return title.includes(searchTerm) || 
           excerpt.includes(searchTerm) || 
           content.includes(searchTerm) || 
           tags.includes(searchTerm);
  });
}
`;

  fs.writeFileSync(OUTPUT_PATH, tsContent);
  console.log(`Generated blog data with ${posts.length} posts`);
}

// Run the script
generateBlogData();