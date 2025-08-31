import { BlogPostCard } from './blog-post-card';
import { getRelatedBlogPosts } from '@/lib/generated-blog-data';
import type { Locale } from '@/types';

interface RelatedPostsProps {
  currentSlug: string;
  locale: Locale;
  limit?: number;
}

export function RelatedPosts({ currentSlug, locale, limit = 3 }: RelatedPostsProps) {
  const relatedPosts = getRelatedBlogPosts(currentSlug, limit);

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 pt-8 border-t border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">
        Related Stories
      </h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {relatedPosts.map((post) => (
          <BlogPostCard
            key={post.slug}
            post={post}
            locale={locale}
            showExcerpt={false}
          />
        ))}
      </div>
    </section>
  );
}