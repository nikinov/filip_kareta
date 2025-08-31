'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Locale } from '@/types';
import { getLocalizedContent } from '@/lib/generated-blog-data';

// Blog categories for filtering
const blogCategories = [
  {
    id: 'travel-guides',
    slug: 'travel-guides',
    name: {
      en: 'Travel Guides',
      de: 'Reiseführer',
      fr: 'Guides de voyage',
    },
  },
  {
    id: 'food-drink',
    slug: 'food-drink',
    name: {
      en: 'Food & Drink',
      de: 'Essen & Trinken',
      fr: 'Nourriture & Boisson',
    },
  },
  {
    id: 'history-legends',
    slug: 'history-legends',
    name: {
      en: 'History & Legends',
      de: 'Geschichte & Legenden',
      fr: 'Histoire & Légendes',
    },
  },
  {
    id: 'practical-tips',
    slug: 'practical-tips',
    name: {
      en: 'Practical Tips',
      de: 'Praktische Tipps',
      fr: 'Conseils pratiques',
    },
  },
];

interface BlogFiltersProps {
  locale: Locale;
  currentCategory?: string;
  currentTag?: string;
  allTags?: string[];
}

export function BlogFilters({ locale, currentCategory, currentTag, allTags = [] }: BlogFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  
  // allTags is now passed as prop

  const handleCategoryFilter = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (categorySlug === currentCategory) {
      params.delete('category');
    } else {
      params.set('category', categorySlug);
    }
    
    params.delete('tag'); // Clear tag filter when changing category
    params.delete('page'); // Reset to first page
    
    const queryString = params.toString();
    const url = `/${locale}/blog${queryString ? `?${queryString}` : ''}`;
    router.push(url);
  };

  const handleTagFilter = (tag: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (tag === currentTag) {
      params.delete('tag');
    } else {
      params.set('tag', tag);
    }
    
    params.delete('category'); // Clear category filter when changing tag
    params.delete('page'); // Reset to first page
    
    const queryString = params.toString();
    const url = `/${locale}/blog${queryString ? `?${queryString}` : ''}`;
    router.push(url);
  };

  const clearAllFilters = () => {
    router.push(`/${locale}/blog`);
  };

  const hasActiveFilters = currentCategory || currentTag;

  return (
    <div className="bg-white border rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filter Posts
        </h3>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden"
        >
          {isOpen ? 'Hide' : 'Show'} Filters
        </Button>
      </div>

      <div className={`space-y-6 ${isOpen ? 'block' : 'hidden md:block'}`}>
        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Active filters:</span>
            
            {currentCategory && (
              <Badge variant="default" className="flex items-center gap-1">
                Category: {blogCategories.find(c => c.slug === currentCategory)?.name[locale]}
                <button
                  onClick={() => handleCategoryFilter(currentCategory)}
                  className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            
            {currentTag && (
              <Badge variant="default" className="flex items-center gap-1">
                Tag: {currentTag}
                <button
                  onClick={() => handleTagFilter(currentTag)}
                  className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Categories */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
          <div className="flex flex-wrap gap-2">
            {blogCategories.map((category) => {
              const categoryName = getLocalizedContent(category.name, locale);
              const isActive = currentCategory === category.slug;
              
              return (
                <Button
                  key={category.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryFilter(category.slug)}
                  className="text-sm"
                >
                  {categoryName}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Popular Tags</h4>
          <div className="flex flex-wrap gap-2">
            {allTags.slice(0, 12).map((tag) => {
              const isActive = currentTag === tag;
              
              return (
                <Button
                  key={tag}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTagFilter(tag)}
                  className="text-xs"
                >
                  #{tag}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}