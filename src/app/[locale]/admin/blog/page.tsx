import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Calendar,
  Tag,
  FileText,
  Globe
} from 'lucide-react';
import { getAllBlogPosts } from '@/lib/generated-blog-data';
import { getLocalizedContent } from '@/lib/generated-blog-data';
import type { Locale } from '@/types';

export const metadata: Metadata = {
  title: 'Blog Management - Prague Tour Guide CMS',
  description: 'Manage blog posts and content',
  robots: 'noindex, nofollow',
};

interface BlogManagementProps {
  params: { locale: string };
}

export default function BlogManagement({ params }: BlogManagementProps) {
  const { locale } = params;
  const blogPosts = getAllBlogPosts();

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'travel-guides': 'bg-blue-100 text-blue-800',
      'food-drink': 'bg-green-100 text-green-800',
      'history-legends': 'bg-purple-100 text-purple-800',
      'practical-tips': 'bg-orange-100 text-orange-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600 mt-2">
            Create, edit, and manage your blog posts across all languages
          </p>
        </div>
        <Link href={`/${locale}/admin/blog/new`}>
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Blog Post</span>
          </Button>
        </Link>
      </div>

      {/* Blog Posts List */}
      <div className="space-y-4">
        {blogPosts.map((post) => (
          <Card key={post.slug} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {getLocalizedContent(post.frontmatter.title, locale as Locale)}
                  </h3>
                  <Badge className={getCategoryColor(post.frontmatter.category)}>
                    {post.frontmatter.category}
                  </Badge>
                </div>
                
                <p className="text-gray-600 mb-3">
                  {getLocalizedContent(post.frontmatter.excerpt, locale as Locale)}
                </p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>{post.readingTime} min read</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Tag className="h-4 w-4" />
                    <span>{post.frontmatter.tags.length} tags</span>
                  </div>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {post.frontmatter.tags.slice(0, 5).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {post.frontmatter.tags.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{post.frontmatter.tags.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Link href={`/${locale}/blog/${post.slug}`} target="_blank">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/${locale}/admin/blog/edit/${post.slug}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Language Status */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Languages:</span>
                <div className="flex space-x-2">
                  {(['en', 'de', 'fr'] as Locale[]).map((lang) => (
                    <div key={lang} className="flex items-center space-x-1">
                      <Globe className="h-3 w-3" />
                      <span className="text-xs font-medium text-gray-600 uppercase">
                        {lang}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${
                        post.frontmatter.title[lang] ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {blogPosts.length === 0 && (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts yet</h3>
          <p className="text-gray-600 mb-4">
            Get started by creating your first blog post to attract visitors and showcase your expertise.
          </p>
          <Link href={`/${locale}/admin/blog/new`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create First Blog Post
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
