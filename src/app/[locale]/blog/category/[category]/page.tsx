import { Metadata } from 'next';
import { notFound } from 'next/navigation';
// import { getTranslations } from 'next-intl/server';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Footer } from '@/components/layout/footer';
import { BlogPostCard, BlogFilters, BlogPagination } from '@/components/blog';
import { getBlogPostsByCategory, getAllBlogTags } from '@/lib/generated-blog-data';
import { generateMetadata as generateSEOMetadata, generateAlternateUrls } from '@/lib/seo';

// Blog categories for static params generation
const blogCategories = [
  { slug: 'travel-guides' },
  { slug: 'food-drink' },
  { slug: 'history-legends' },
  { slug: 'practical-tips' },
];
import type { Locale } from '@/types';

interface BlogCategoryPageProps {
  params: Promise<{ locale: Locale; category: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateStaticParams() {
  return blogCategories.flatMap((category) => 
    ['en', 'de', 'fr'].map((locale) => ({
      locale,
      category: category.slug,
    }))
  );
}

export async function generateMetadata({ params }: BlogCategoryPageProps): Promise<Metadata> {
  const { locale, category } = await params;
  const posts = getBlogPostsByCategory(category);
  
  if (posts.length === 0) {
    return {
      title: 'Category Not Found',
    };
  }

  const categoryName = category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  const categoryDescription = `Discover ${categoryName.toLowerCase()} stories and insights about Prague`;
  
  const seoData = {
    title: `${categoryName} | Prague Stories by Filip Kareta`,
    description: `${categoryDescription} - Discover Prague through authentic local stories and expert insights.`,
    keywords: [category, 'Prague', 'travel', 'guide', 'stories'],
    image: '/images/og-blog-category.jpg',
    url: `blog/category/${category}`,
    type: 'website' as const,
    locale,
    alternateUrls: generateAlternateUrls(`blog/category/${category}`),
  };

  return generateSEOMetadata(seoData);
}

export default async function BlogCategoryPage({ params, searchParams }: BlogCategoryPageProps) {
  const { locale, category } = await params;
  const { page = '1' } = await searchParams;
  
  const allCategoryPosts = getBlogPostsByCategory(category);
  
  if (allCategoryPosts.length === 0) {
    notFound();
  }

  const currentPage = parseInt(page, 10) || 1;
  const postsPerPage = 6;
  
  const totalPages = Math.ceil(allCategoryPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const posts = allCategoryPosts.slice(startIndex, startIndex + postsPerPage);
  
  const categoryName = category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  const categoryDescription = `Discover ${categoryName.toLowerCase()} stories and insights about Prague`;
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
        {/* Category Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {categoryName}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {categoryDescription}
          </p>
          <div className="mt-6">
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {allCategoryPosts.length} {allCategoryPosts.length === 1 ? 'post' : 'posts'}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar with Filters */}
          <aside className="lg:col-span-1">
            <BlogFilters 
              locale={locale} 
              currentCategory={category}
              allTags={allTags}
            />
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Blog Posts Grid */}
            {posts.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  {posts.map((post) => (
                    <BlogPostCard
                      key={post.slug}
                      post={post}
                      locale={locale}
                      showExcerpt={true}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <BlogPagination
                    locale={locale}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    hasNextPage={currentPage < totalPages}
                    hasPrevPage={currentPage > 1}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  No posts in this category yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Check back soon for new stories about {categoryName.toLowerCase()}!
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