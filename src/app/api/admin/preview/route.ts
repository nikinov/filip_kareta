import { NextRequest, NextResponse } from 'next/server';
import { getAllBlogPosts } from '@/lib/generated-blog-data';
import { sampleTours } from '@/lib/content';
import type { Locale } from '@/types';

interface PreviewItem {
  id: string;
  type: 'blog' | 'tour' | 'page';
  title: string;
  slug: string;
  status: 'draft' | 'modified' | 'published';
  lastModified: string;
  author: string;
  previewUrl: string;
  languages: string[];
}

// GET - List all content items available for preview
export async function GET(request: NextRequest) {
  try {
    const items: PreviewItem[] = [];

    // Add blog posts
    const blogPosts = getAllBlogPosts();
    for (const post of blogPosts) {
      items.push({
        id: `blog-${post.slug}`,
        type: 'blog',
        title: post.frontmatter.title.en || 'Untitled Blog Post',
        slug: post.slug,
        status: post.updatedAt ? 'modified' : 'published',
        lastModified: post.updatedAt || post.publishedAt,
        author: post.frontmatter.author,
        previewUrl: `/blog/${post.slug}`,
        languages: Object.keys(post.frontmatter.title).filter(lang => 
          post.frontmatter.title[lang as Locale]
        )
      });
    }

    // Add tours
    for (const tour of sampleTours) {
      items.push({
        id: `tour-${tour.slug}`,
        type: 'tour',
        title: tour.title.en || 'Untitled Tour',
        slug: tour.slug,
        status: 'published', // For now, all tours are published
        lastModified: new Date().toISOString(),
        author: 'Filip Kareta',
        previewUrl: `/tours/${tour.slug}`,
        languages: Object.keys(tour.title).filter(lang => 
          tour.title[lang as Locale]
        )
      });
    }

    // Add static pages
    const staticPages = [
      {
        id: 'page-home',
        type: 'page' as const,
        title: 'Homepage',
        slug: '',
        status: 'published' as const,
        lastModified: new Date().toISOString(),
        author: 'Filip Kareta',
        previewUrl: '/',
        languages: ['en', 'de', 'fr']
      },
      {
        id: 'page-about',
        type: 'page' as const,
        title: 'About Filip',
        slug: 'about',
        status: 'published' as const,
        lastModified: new Date().toISOString(),
        author: 'Filip Kareta',
        previewUrl: '/about',
        languages: ['en', 'de', 'fr']
      },
      {
        id: 'page-contact',
        type: 'page' as const,
        title: 'Contact',
        slug: 'contact',
        status: 'published' as const,
        lastModified: new Date().toISOString(),
        author: 'Filip Kareta',
        previewUrl: '/contact',
        languages: ['en', 'de', 'fr']
      }
    ];

    items.push(...staticPages);

    // Sort by last modified date (newest first)
    items.sort((a, b) => 
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    );

    return NextResponse.json({
      success: true,
      items,
      total: items.length,
      summary: {
        blog: items.filter(item => item.type === 'blog').length,
        tour: items.filter(item => item.type === 'tour').length,
        page: items.filter(item => item.type === 'page').length,
        draft: items.filter(item => item.status === 'draft').length,
        modified: items.filter(item => item.status === 'modified').length,
        published: items.filter(item => item.status === 'published').length
      }
    });

  } catch (error) {
    console.error('Error loading preview items:', error);
    return NextResponse.json(
      { error: 'Failed to load preview items' },
      { status: 500 }
    );
  }
}

// POST - Update preview status or create preview session
export async function POST(request: NextRequest) {
  try {
    const { action, itemId, previewData } = await request.json();

    switch (action) {
      case 'create-preview-session':
        // In a real implementation, you might store preview data in a session
        // or temporary storage for draft content preview
        return NextResponse.json({
          success: true,
          message: 'Preview session created',
          previewId: `preview-${Date.now()}`,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        });

      case 'refresh-preview':
        // Force refresh preview data
        return NextResponse.json({
          success: true,
          message: 'Preview refreshed',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in preview operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform preview operation' },
      { status: 500 }
    );
  }
}
