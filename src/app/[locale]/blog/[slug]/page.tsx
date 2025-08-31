import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, User, ArrowLeft, Tag } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Footer } from '@/components/layout/footer';
import { Badge } from '@/components/ui/badge';

import { RelatedPosts, BlogCTA } from '@/components/blog';
import { LazySection } from '@/components/ui/lazy-wrapper';

import { getBlogPostBySlug, getAllBlogPosts, getLocalizedContent } from '@/lib/generated-blog-data';
import { generateMetadata as generateSEOMetadata, generateAlternateUrls } from '@/lib/seo';
import { BlogContent } from '@/components/blog/blog-content';
import type { Locale } from '@/types';

interface BlogPostPageProps {
  params: Promise<{ locale: Locale; slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts();

  return posts.flatMap((post) =>
    ['en', 'de', 'fr'].map((locale) => ({
      locale,
      slug: post.slug,
    }))
  );
}

// Enable Static Site Generation for blog pages
export const dynamic = 'force-static';
export const revalidate = 7200; // Revalidate every 2 hours

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getBlogPostBySlug(slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const title = getLocalizedContent(post.frontmatter.seoTitle, locale);
  const description = getLocalizedContent(post.frontmatter.seoDescription, locale);
  
  const seoData = {
    title,
    description,
    keywords: post.frontmatter.seoKeywords,
    image: post.frontmatter.featuredImage,
    url: `blog/${slug}`,
    type: 'article' as const,
    locale,
    alternateUrls: generateAlternateUrls(`blog/${slug}`),
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    author: post.frontmatter.author,
    tags: post.frontmatter.tags,
  };

  return generateSEOMetadata(seoData);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const title = getLocalizedContent(post.frontmatter.title, locale);

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href={`/${locale}`} className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
            Filip Kareta
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main>
        {/* Back to Blog Link */}
        <div className="max-w-4xl mx-auto px-6 pt-8">
          <Link href={`/${locale}/blog`} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>

        {/* Article Header */}
        <article className="max-w-4xl mx-auto px-6">
          {/* Category Badge */}
          <div className="mb-4">
            <Badge variant="secondary" className="text-sm">
              {post.frontmatter.category.replace('-', ' ')}
            </Badge>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span className="font-medium">{post.frontmatter.author}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{post.readingTime} min read</span>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative aspect-[16/9] mb-12 rounded-xl overflow-hidden">
            <Image
              src={post.frontmatter.featuredImage}
              alt={title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
          </div>

          {/* Article Content */}
          <BlogContent 
            content={post.content} 
            locale={locale}
            relatedTours={post.frontmatter.relatedTours}
          />

          {/* Tags - Lazy loaded */}
          {post.frontmatter.tags.length > 0 && (
            <LazySection className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.frontmatter.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/${locale}/blog?tag=${encodeURIComponent(tag)}`}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </Link>
                ))}
              </div>
            </LazySection>
          )}

          {/* Call to Action - Lazy loaded */}
          <LazySection>
            <BlogCTA
              locale={locale}
              relatedTours={post.frontmatter.relatedTours}
              variant="tour-booking"
            />
          </LazySection>

          {/* Author Bio - Lazy loaded */}
          <LazySection className="mt-12 p-8 bg-gray-50 rounded-xl">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gray-300 rounded-full flex-shrink-0"></div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  About {post.frontmatter.author}
                </h3>
                <p className="text-gray-600 mb-4">
                  Filip is a licensed Prague tour guide with over 12 years of experience sharing
                  the magic of his city. Born and raised in Prague, he transforms every tour into
                  an unforgettable journey through time with his authentic storytelling.
                </p>
                <div className="flex gap-4">
                  <Link href={`/${locale}/tours`} className="inline-flex items-center justify-center h-9 px-3 py-1.5 text-xs font-semibold border-2 border-prague-500 text-prague-500 hover:bg-prague-50 hover:border-prague-600 rounded-lg transition-colors">
                    View Filip&apos;s Tours
                  </Link>
                  <Link href={`/${locale}/about`} className="inline-flex items-center justify-center h-9 px-3 py-1.5 text-xs font-semibold border-2 border-prague-500 text-prague-500 hover:bg-prague-50 hover:border-prague-600 rounded-lg transition-colors">
                    Learn More About Filip
                  </Link>
                </div>
              </div>
            </div>
          </LazySection>

          {/* Related Posts - Lazy loaded */}
          <LazySection>
            <RelatedPosts currentSlug={slug} locale={locale} />
          </LazySection>
        </article>
      </main>

      <Footer />
    </div>
  );
}