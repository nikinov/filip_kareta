import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Footer } from '@/components/layout/footer';
import { BlogPostCard } from '@/components/blog';
import { getAllBlogPosts } from '@/lib/generated-blog-data';
import { generateMetadata as generateSEOMetadata, generateAlternateUrls } from '@/lib/seo';
import type { Locale } from '@/types';

interface BlogArchivePageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: BlogArchivePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  
  const seoData = {
    title: `${t('archive.title')} | Filip Kareta Prague Tours`,
    description: t('archive.description'),
    keywords: ['Prague blog', 'travel stories', 'Prague guide', 'blog archive'],
    image: '/images/og-blog-archive.jpg',
    url: 'blog/archive',
    type: 'website' as const,
    locale,
    alternateUrls: generateAlternateUrls('blog/archive'),
  };

  return generateSEOMetadata(seoData);
}

export default async function BlogArchivePage({ params }: BlogArchivePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });
  
  const allPosts = getAllBlogPosts();
  
  // Group posts by year and month
  const postsByDate = allPosts.reduce((acc, post) => {
    const date = new Date(post.publishedAt);
    const year = date.getFullYear();
    const month = date.toLocaleDateString(locale, { month: 'long' });
    
    if (!acc[year]) {
      acc[year] = {};
    }
    if (!acc[year][month]) {
      acc[year][month] = [];
    }
    
    acc[year][month].push(post);
    return acc;
  }, {} as Record<number, Record<string, typeof allPosts>>);

  const years = Object.keys(postsByDate).map(Number).sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Filip Kareta</h1>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Archive Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('archive.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('archive.description')}
          </p>
          <div className="mt-6">
            <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {allPosts.length} {allPosts.length === 1 ? 'post' : 'posts'} total
            </span>
          </div>
        </div>

        {/* Posts by Year and Month */}
        <div className="space-y-12">
          {years.map((year) => (
            <div key={year}>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b border-gray-200 pb-4">
                {year}
              </h2>
              
              <div className="space-y-8">
                {Object.entries(postsByDate[year]).map(([month, posts]) => (
                  <div key={month}>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      {month} {year}
                    </h3>
                    
                    <div className="grid gap-6">
                      {posts.map((post) => (
                        <div key={post.slug} className="border-l-4 border-blue-200 pl-6">
                          <BlogPostCard
                            post={post}
                            locale={locale}
                            showExcerpt={true}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Archive Navigation */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 text-sm text-gray-600">
            <a href={`/${locale}/blog`} className="text-blue-600 hover:text-blue-800 underline">
              ← Back to Blog
            </a>
            <span>•</span>
            <span>{allPosts.length} posts archived</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}