import { Metadata } from 'next';
import * as m from '@/paraglide/messages';
import { setLocale } from '@/paraglide/runtime';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Footer } from '@/components/layout/footer';
import { BlogPostCard, BlogFilters, BlogPagination, BlogSearch } from '@/components/blog';
import { getPaginatedBlogPosts, getAllBlogTags } from '@/lib/generated-blog-data';
import { generateMetadata as generateSEOMetadata, generateAlternateUrls } from '@/lib/seo';
import { LazySection } from '@/components/ui/lazy-wrapper';
import type { Locale } from '@/types';

interface BlogPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{
    page?: string;
    category?: string;
    tag?: string;
  }>;
}

// Enable Static Site Generation for blog listing page
export const dynamic = 'force-static';
export const revalidate = 7200; // Revalidate every 2 hours

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;

  // Set locale for Paraglide
  setLocale(locale as any);

  const seoData = {
    title: m['blog.seo.title'](),
    description: m['blog.seo.description'](),
    keywords: m['blog.seo.keywords']().split(',').map(k => k.trim()),
    image: '/images/og-blog.jpg',
    url: 'blog',
    type: 'website' as const,
    locale,
    alternateUrls: generateAlternateUrls('blog'),
  };

  return generateSEOMetadata(seoData);
}

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const { locale } = await params;
  const { page = '1', category, tag } = await searchParams;

  // Set locale for Paraglide
  setLocale(locale as any);
  
  const currentPage = parseInt(page, 10) || 1;
  
  // Get posts based on filters
  const paginationData = getPaginatedBlogPosts(currentPage, 6, category, tag);
  const { posts, totalPages, hasNextPage, hasPrevPage, totalPosts } = paginationData;
  const allTags = getAllBlogTags();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Filip Kareta</h1>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {m['blog.title']()}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {m['blog.subtitle']()}
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <BlogSearch locale={locale} placeholder={m['blog.search.placeholder']()} />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar with Filters */}
          <aside className="lg:col-span-1">
            <BlogFilters
              locale={locale}
              currentCategory={category}
              currentTag={tag}
              allTags={allTags}
            />
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Info */}
            <div className="mb-8">
              <p className="text-gray-600">
                {category && `Category: ${category.replace('-', ' ')} • `}
                {tag && `Tag: ${tag} • `}
                Showing {posts.length} of {totalPosts} posts
                {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
              </p>
            </div>

            {/* Blog Posts Grid - Lazy loaded */}
            {posts.length > 0 ? (
              <>
                <LazySection className="grid md:grid-cols-2 gap-8 mb-12">
                  {posts.map((post) => (
                    <BlogPostCard
                      key={post.slug}
                      post={post}
                      locale={locale}
                      showExcerpt={true}
                    />
                  ))}
                </LazySection>

                {/* Pagination - Lazy loaded */}
                <LazySection>
                  <BlogPagination
                    locale={locale}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    hasNextPage={hasNextPage}
                    hasPrevPage={hasPrevPage}
                  />
                </LazySection>
              </>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  No posts found
                </h3>
                <p className="text-gray-600 mb-6">
                  {category || tag
                    ? 'Try adjusting your filters or browse all posts.'
                    : 'Check back soon for new stories about Prague!'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}