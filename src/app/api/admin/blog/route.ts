import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const BLOG_CONTENT_PATH = path.join(process.cwd(), 'content/blog');
const BACKUP_PATH = path.join(process.cwd(), 'content/backups/blog');

// Ensure directories exist
function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Create backup of existing file
async function createBackup(slug: string): Promise<void> {
  const originalPath = path.join(BLOG_CONTENT_PATH, `${slug}.mdx`);
  
  if (fs.existsSync(originalPath)) {
    ensureDirectoryExists(BACKUP_PATH);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_PATH, `${slug}-${timestamp}.mdx`);
    
    fs.copyFileSync(originalPath, backupPath);
    
    // Keep only last 10 backups per file
    const backupFiles = fs.readdirSync(BACKUP_PATH)
      .filter(file => file.startsWith(`${slug}-`) && file.endsWith('.mdx'))
      .sort()
      .reverse();
    
    if (backupFiles.length > 10) {
      backupFiles.slice(10).forEach(file => {
        fs.unlinkSync(path.join(BACKUP_PATH, file));
      });
    }
  }
}

// Regenerate blog data after changes
async function regenerateBlogData(): Promise<void> {
  try {
    await execAsync('node scripts/process-blog-posts.js', {
      cwd: process.cwd()
    });
  } catch (error) {
    console.error('Error regenerating blog data:', error);
    throw new Error('Failed to regenerate blog data');
  }
}

// POST - Create or update blog post
export async function POST(request: NextRequest) {
  try {
    const { slug, content, locale } = await request.json();

    if (!slug || !content) {
      return NextResponse.json(
        { error: 'Slug and content are required' },
        { status: 400 }
      );
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { error: 'Invalid slug format. Use only lowercase letters, numbers, and hyphens.' },
        { status: 400 }
      );
    }

    ensureDirectoryExists(BLOG_CONTENT_PATH);

    const filePath = path.join(BLOG_CONTENT_PATH, `${slug}.mdx`);
    const isUpdate = fs.existsSync(filePath);

    // Create backup if updating existing file
    if (isUpdate) {
      await createBackup(slug);
    }

    // Write the MDX file
    fs.writeFileSync(filePath, content, 'utf8');

    // Regenerate blog data
    await regenerateBlogData();

    return NextResponse.json({
      success: true,
      message: isUpdate ? 'Blog post updated successfully' : 'Blog post created successfully',
      slug,
      isUpdate
    });

  } catch (error) {
    console.error('Error saving blog post:', error);
    return NextResponse.json(
      { error: 'Failed to save blog post' },
      { status: 500 }
    );
  }
}

// GET - List all blog posts with metadata
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeContent = searchParams.get('includeContent') === 'true';

    ensureDirectoryExists(BLOG_CONTENT_PATH);

    const files = fs.readdirSync(BLOG_CONTENT_PATH)
      .filter(file => file.endsWith('.mdx'))
      .map(file => {
        const slug = file.replace('.mdx', '');
        const filePath = path.join(BLOG_CONTENT_PATH, file);
        const stats = fs.statSync(filePath);
        
        let content = '';
        let frontmatter = {};
        
        if (includeContent) {
          content = fs.readFileSync(filePath, 'utf8');
          
          // Parse frontmatter
          const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
          if (frontmatterMatch) {
            try {
              // Simple YAML parsing for frontmatter
              const yamlContent = frontmatterMatch[1];
              frontmatter = parseSimpleYAML(yamlContent);
            } catch (error) {
              console.error(`Error parsing frontmatter for ${slug}:`, error);
            }
          }
        }

        return {
          slug,
          fileName: file,
          lastModified: stats.mtime.toISOString(),
          size: stats.size,
          ...(includeContent && { content, frontmatter })
        };
      })
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());

    return NextResponse.json({
      success: true,
      posts: files,
      total: files.length
    });

  } catch (error) {
    console.error('Error listing blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to list blog posts' },
      { status: 500 }
    );
  }
}

// DELETE - Delete blog post
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    const filePath = path.join(BLOG_CONTENT_PATH, `${slug}.mdx`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Create backup before deletion
    await createBackup(slug);

    // Delete the file
    fs.unlinkSync(filePath);

    // Regenerate blog data
    await regenerateBlogData();

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully',
      slug
    });

  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}

// Simple YAML parser for frontmatter
function parseSimpleYAML(yamlContent: string): Record<string, any> {
  const result: Record<string, any> = {};
  const lines = yamlContent.split('\n');
  let currentKey = '';
  let currentObject: Record<string, any> = {};
  let inObject = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    if (trimmedLine.endsWith(':') && !trimmedLine.includes('"')) {
      // Start of object
      if (inObject && currentKey) {
        result[currentKey] = currentObject;
      }
      currentKey = trimmedLine.slice(0, -1);
      currentObject = {};
      inObject = true;
    } else if (inObject && trimmedLine.startsWith('  ')) {
      // Object property
      const [key, ...valueParts] = trimmedLine.slice(2).split(':');
      const value = valueParts.join(':').trim().replace(/^"(.*)"$/, '$1');
      currentObject[key.trim()] = value;
    } else if (trimmedLine.includes(':')) {
      // Simple key-value pair
      if (inObject && currentKey) {
        result[currentKey] = currentObject;
        inObject = false;
      }
      
      const [key, ...valueParts] = trimmedLine.split(':');
      let value = valueParts.join(':').trim();
      
      // Handle arrays
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1)
          .split(',')
          .map(item => item.trim().replace(/^"(.*)"$/, '$1'));
      } else {
        // Remove quotes
        value = value.replace(/^"(.*)"$/, '$1');
      }
      
      result[key.trim()] = value;
    }
  }

  // Handle last object
  if (inObject && currentKey) {
    result[currentKey] = currentObject;
  }

  return result;
}
