'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BlogEditor, BlogPostData } from '@/components/admin/blog-editor';
import type { Locale } from '@/types';

interface NewBlogPostProps {
  params: { locale: string };
}

export default function NewBlogPost({ params }: NewBlogPostProps) {
  const router = useRouter();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<BlogPostData | null>(null);

  const handleSave = async (data: BlogPostData) => {
    try {
      // Convert the data to MDX format
      const mdxContent = generateMDXContent(data);
      
      // Save the blog post
      const response = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: data.slug,
          content: mdxContent,
          locale: params.locale,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save blog post');
      }

      // Redirect to blog management page
      router.push(`/${params.locale}/admin/blog`);
    } catch (error) {
      console.error('Error saving blog post:', error);
      alert('Failed to save blog post. Please try again.');
    }
  };

  const handlePreview = (data: BlogPostData) => {
    setPreviewData(data);
    setIsPreviewOpen(true);
  };

  return (
    <>
      <BlogEditor
        locale={params.locale as Locale}
        onSave={handleSave}
        onPreview={handlePreview}
      />
      
      {/* Preview Modal */}
      {isPreviewOpen && previewData && (
        <PreviewModal
          data={previewData}
          locale={params.locale as Locale}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </>
  );
}

function generateMDXContent(data: BlogPostData): string {
  const frontmatter = {
    title: data.title,
    excerpt: data.excerpt,
    publishedAt: data.publishedAt,
    category: data.category,
    tags: data.tags,
    featuredImage: data.featuredImage,
    author: data.author,
    relatedTours: data.relatedTours,
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    seoKeywords: data.seoKeywords,
  };

  const yamlFrontmatter = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (typeof value === 'object' && !Array.isArray(value)) {
        // Handle multilingual objects
        const entries = Object.entries(value)
          .map(([lang, text]) => `  ${lang}: "${text}"`)
          .join('\n');
        return `${key}:\n${entries}`;
      } else if (Array.isArray(value)) {
        // Handle arrays
        const items = value.map(item => `"${item}"`).join(', ');
        return `${key}: [${items}]`;
      } else {
        // Handle simple values
        return `${key}: "${value}"`;
      }
    })
    .join('\n');

  return `---
${yamlFrontmatter}
---

${data.content.en}`;
}

interface PreviewModalProps {
  data: BlogPostData;
  locale: Locale;
  onClose: () => void;
}

function PreviewModal({ data, locale, onClose }: PreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Preview: {data.title[locale]}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-6">
          <div className="prose prose-lg max-w-none">
            {/* Featured Image */}
            {data.featuredImage && (
              <img
                src={data.featuredImage}
                alt={data.title[locale]}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            
            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {data.title[locale]}
            </h1>
            
            {/* Meta Information */}
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
              <span>By {data.author}</span>
              <span>•</span>
              <span>{new Date(data.publishedAt).toLocaleDateString()}</span>
              <span>•</span>
              <span className="capitalize">{data.category.replace('-', ' ')}</span>
            </div>
            
            {/* Excerpt */}
            <p className="text-lg text-gray-700 mb-6 italic">
              {data.excerpt[locale]}
            </p>
            
            {/* Content Preview */}
            <div className="whitespace-pre-wrap">
              {data.content[locale].split('\n').slice(0, 10).join('\n')}
              {data.content[locale].split('\n').length > 10 && (
                <p className="text-gray-500 italic mt-4">
                  ... (content continues)
                </p>
              )}
            </div>
            
            {/* Tags */}
            {data.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {data.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Related Tours */}
            {data.relatedTours.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Related Tours:</h3>
                <div className="space-y-1">
                  {data.relatedTours.map((tourId) => (
                    <div key={tourId} className="text-sm text-blue-600">
                      {tourId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close Preview
            </button>
            <button
              onClick={() => {
                window.open(`/${locale}/blog/${data.slug}`, '_blank');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Open in New Tab
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
