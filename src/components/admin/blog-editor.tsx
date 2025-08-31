'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Eye, 
  Upload, 
  X, 
  Plus,
  Globe,
  Calendar,
  Tag,
  Image as ImageIcon
} from 'lucide-react';
import type { Locale } from '@/types';
import type { BlogPostFrontmatter } from '@/lib/generated-blog-data';

interface BlogEditorProps {
  initialData?: {
    slug: string;
    frontmatter: BlogPostFrontmatter;
    content: string;
  };
  locale: Locale;
  onSave: (data: BlogPostData) => Promise<void>;
  onPreview: (data: BlogPostData) => void;
}

export interface BlogPostData {
  slug: string;
  title: Record<Locale, string>;
  excerpt: Record<Locale, string>;
  content: Record<Locale, string>;
  category: string;
  tags: string[];
  featuredImage: string;
  author: string;
  relatedTours: string[];
  seoTitle: Record<Locale, string>;
  seoDescription: Record<Locale, string>;
  seoKeywords: string[];
  publishedAt: string;
}

const categories = [
  { id: 'travel-guides', name: 'Travel Guides' },
  { id: 'food-drink', name: 'Food & Drink' },
  { id: 'history-legends', name: 'History & Legends' },
  { id: 'practical-tips', name: 'Practical Tips' },
];

const availableTours = [
  { id: 'prague-castle', name: 'Prague Castle & Lesser Town' },
  { id: 'old-town-jewish-quarter', name: 'Old Town & Jewish Quarter' },
  { id: 'communist-prague', name: 'Communist Prague Tour' },
];

export function BlogEditor({ initialData, locale, onSave, onPreview }: BlogEditorProps) {
  const [activeLocale, setActiveLocale] = useState<Locale>(locale);
  const [isSaving, setIsSaving] = useState(false);
  const [newTag, setNewTag] = useState('');
  
  const [formData, setFormData] = useState<BlogPostData>({
    slug: initialData?.slug || '',
    title: initialData?.frontmatter.title || { en: '', de: '', fr: '' },
    excerpt: initialData?.frontmatter.excerpt || { en: '', de: '', fr: '' },
    content: { en: initialData?.content || '', de: '', fr: '' },
    category: initialData?.frontmatter.category || 'travel-guides',
    tags: initialData?.frontmatter.tags || [],
    featuredImage: initialData?.frontmatter.featuredImage || '',
    author: initialData?.frontmatter.author || 'Filip Kareta',
    relatedTours: initialData?.frontmatter.relatedTours || [],
    seoTitle: initialData?.frontmatter.seoTitle || { en: '', de: '', fr: '' },
    seoDescription: initialData?.frontmatter.seoDescription || { en: '', de: '', fr: '' },
    seoKeywords: initialData?.frontmatter.seoKeywords || [],
    publishedAt: initialData?.frontmatter.publishedAt || new Date().toISOString().split('T')[0],
  });

  // Auto-generate slug from title
  useEffect(() => {
    if (!initialData && formData.title.en) {
      const slug = formData.title.en
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title.en, initialData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    onPreview(formData);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const toggleRelatedTour = (tourId: string) => {
    setFormData(prev => ({
      ...prev,
      relatedTours: prev.relatedTours.includes(tourId)
        ? prev.relatedTours.filter(id => id !== tourId)
        : [...prev.relatedTours, tourId]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {initialData ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
          <p className="text-gray-600 mt-2">
            {initialData ? 'Update your blog post content' : 'Write a new blog post to attract visitors'}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Language Tabs */}
      <Card className="p-4">
        <div className="flex space-x-2">
          {(['en', 'de', 'fr'] as Locale[]).map((lang) => (
            <Button
              key={lang}
              variant={activeLocale === lang ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveLocale(lang)}
              className="flex items-center space-x-1"
            >
              <Globe className="h-3 w-3" />
              <span className="uppercase">{lang}</span>
            </Button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Content ({activeLocale.toUpperCase()})
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title[activeLocale]}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    title: { ...prev.title, [activeLocale]: e.target.value }
                  }))}
                  placeholder="Enter blog post title"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt[activeLocale]}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    excerpt: { ...prev.excerpt, [activeLocale]: e.target.value }
                  }))}
                  placeholder="Brief description for social media and search results"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="content">Content (MDX)</Label>
                <Textarea
                  id="content"
                  value={formData.content[activeLocale]}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    content: { ...prev.content, [activeLocale]: e.target.value }
                  }))}
                  placeholder="Write your blog post content in MDX format..."
                  rows={20}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </Card>

          {/* SEO Settings */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              SEO Settings ({activeLocale.toUpperCase()})
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoTitle[activeLocale]}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    seoTitle: { ...prev.seoTitle, [activeLocale]: e.target.value }
                  }))}
                  placeholder="Optimized title for search engines"
                />
              </div>

              <div>
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seoDescription[activeLocale]}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    seoDescription: { ...prev.seoDescription, [activeLocale]: e.target.value }
                  }))}
                  placeholder="Meta description for search results"
                  rows={3}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publishing Settings */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Publishing</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-friendly-slug"
                />
              </div>

              <div>
                <Label htmlFor="publishedAt">Publish Date</Label>
                <Input
                  id="publishedAt"
                  type="date"
                  value={formData.publishedAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, publishedAt: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="featuredImage">Featured Image</Label>
                <div className="flex space-x-2">
                  <Input
                    id="featuredImage"
                    value={formData.featuredImage}
                    onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                    placeholder="/blog/image.jpg"
                  />
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Tags */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
            
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button variant="outline" size="sm" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                    <span>{tag}</span>
                    <button onClick={() => removeTag(tag)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          {/* Related Tours */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Tours</h3>
            
            <div className="space-y-2">
              {availableTours.map((tour) => (
                <label key={tour.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.relatedTours.includes(tour.id)}
                    onChange={() => toggleRelatedTour(tour.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{tour.name}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* SEO Keywords */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Keywords</h3>
            
            <div className="space-y-3">
              <Textarea
                value={formData.seoKeywords.join(', ')}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  seoKeywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                }))}
                placeholder="keyword1, keyword2, keyword3"
                rows={3}
              />
              
              <div className="flex flex-wrap gap-1">
                {formData.seoKeywords.map((keyword) => (
                  <Badge key={keyword} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
