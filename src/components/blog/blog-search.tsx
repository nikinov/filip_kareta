'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BlogPostCard } from './blog-post-card';
import { searchBlogPosts } from '@/lib/generated-blog-data';
import type { Locale } from '@/types';
import type { ProcessedBlogPost } from '@/lib/generated-blog-data';

interface BlogSearchProps {
  locale: Locale;
  placeholder?: string;
}

export function BlogSearch({ locale, placeholder = 'Search blog posts...' }: BlogSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProcessedBlogPost[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      const searchResults = searchBlogPosts(query, locale);
      setResults(searchResults);
      setShowResults(true);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, locale]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/${locale}/blog?search=${encodeURIComponent(query.trim())}`);
      setShowResults(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10"
            onFocus={() => query.length >= 2 && setShowResults(true)}
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center text-gray-500">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              <div className="text-sm text-gray-600 px-2 py-1 mb-2">
                Found {results.length} result{results.length !== 1 ? 's' : ''}
              </div>
              {results.slice(0, 5).map((post) => (
                <div key={post.slug} className="mb-2 last:mb-0">
                  <BlogPostCard
                    post={post}
                    locale={locale}
                    showExcerpt={false}
                    className="hover:bg-gray-50"
                  />
                </div>
              ))}
              {results.length > 5 && (
                <div className="text-center pt-2 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      router.push(`/${locale}/blog?search=${encodeURIComponent(query)}`);
                      setShowResults(false);
                    }}
                  >
                    View all {results.length} results
                  </Button>
                </div>
              )}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              No posts found for &quot;{query}&quot;
            </div>
          ) : null}
        </div>
      )}

      {/* Backdrop to close search results */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
}