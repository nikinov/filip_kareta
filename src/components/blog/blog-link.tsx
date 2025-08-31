import Link from 'next/link';
import { FileText, ExternalLink } from 'lucide-react';
import { getBlogPostBySlug, getLocalizedContent } from '@/lib/generated-blog-data';
import type { Locale } from '@/types';

interface BlogLinkProps {
  slug: string;
  children?: React.ReactNode;
  locale?: Locale;
  variant?: 'inline' | 'card';
  showExcerpt?: boolean;
}

export function BlogLink({ 
  slug, 
  children, 
  locale = 'en', 
  variant = 'inline',
  showExcerpt = false 
}: BlogLinkProps) {
  const post = getBlogPostBySlug(slug);
  const blogUrl = `/${locale}/blog/${slug}`;

  if (!post) {
    // Fallback for unknown posts
    return (
      <Link 
        href={blogUrl}
        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline decoration-blue-200 hover:decoration-blue-400 transition-colors"
      >
        {children || slug}
        <ExternalLink className="w-3 h-3" />
      </Link>
    );
  }

  const title = getLocalizedContent(post.frontmatter.title, locale);
  const excerpt = getLocalizedContent(post.frontmatter.excerpt, locale);

  if (variant === 'card') {
    return (
      <Link 
        href={blogUrl}
        className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
      >
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
              {title}
            </h4>
            {showExcerpt && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {excerpt}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span>{post.readingTime} min read</span>
              <span className="capitalize">{post.frontmatter.category.replace('-', ' ')}</span>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </div>
      </Link>
    );
  }

  // Default inline variant
  return (
    <Link 
      href={blogUrl}
      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline decoration-blue-200 hover:decoration-blue-400 transition-colors"
      title={excerpt}
    >
      {children || title}
      <ExternalLink className="w-3 h-3" />
    </Link>
  );
}