import Image from 'next/image';
import Link from 'next/link';
import { Clock, Calendar, Tag, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ProcessedBlogPost } from '@/lib/generated-blog-data';
import type { Locale } from '@/types';
import { getLocalizedContent } from '@/lib/generated-blog-data';

interface BlogPostCardProps {
  post: ProcessedBlogPost;
  locale: Locale;
  showExcerpt?: boolean;
  className?: string;
}

export function BlogPostCard({ 
  post, 
  locale, 
  showExcerpt = true, 
  className = '' 
}: BlogPostCardProps) {
  const title = getLocalizedContent(post.frontmatter.title, locale);
  const excerpt = getLocalizedContent(post.frontmatter.excerpt, locale);
  const postUrl = `/${locale}/blog/${post.slug}`;

  return (
    <Card className={`group overflow-hidden hover:shadow-lg transition-all duration-300 ${className}`}>
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={post.frontmatter.featuredImage}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-white/90 text-gray-900">
            {post.frontmatter.category.replace('-', ' ')}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6">
        {/* Meta Information */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{post.readingTime} min read</span>
          </div>
          
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{post.frontmatter.author}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          <Link href={postUrl} className="hover:underline">
            {title}
          </Link>
        </h3>

        {/* Excerpt */}
        {showExcerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3">
            {excerpt}
          </p>
        )}

        {/* Tags */}
        {post.frontmatter.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.frontmatter.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {post.frontmatter.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{post.frontmatter.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Read More Link */}
        <Link 
          href={postUrl}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
        >
          Read More
          <svg 
            className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </CardContent>
    </Card>
  );
}