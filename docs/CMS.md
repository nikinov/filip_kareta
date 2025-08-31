# Content Management System (CMS)

This document describes the Content Management System implemented for the Prague Tour Guide website.

## Overview

The CMS provides a comprehensive interface for managing all website content including blog posts, tour descriptions, media files, and system backups. It supports multilingual content editing and includes advanced features like content versioning, image optimization, and preview functionality.

## Features Implemented

### ✅ Content Editing Workflow for Tour Descriptions
- **Location**: `/[locale]/admin/content`
- **Features**:
  - Visual tour management interface
  - Multilingual content support (EN/DE/FR)
  - Tour details editing (duration, price, difficulty, highlights)
  - Language completion status indicators
  - Quick stats dashboard

### ✅ Blog Post Creation and Editing Interface
- **Location**: `/[locale]/admin/blog`
- **Features**:
  - Full MDX blog editor with live preview
  - Multilingual content editing
  - SEO optimization fields (title, description, keywords)
  - Tag management system
  - Related tours linking
  - Category organization
  - Featured image selection
  - Publishing workflow

### ✅ Image Upload and Optimization Pipeline
- **Location**: `/[locale]/admin/media`
- **Features**:
  - Drag-and-drop file upload
  - Automatic image optimization using Sharp
  - WebP conversion for better performance
  - Image resizing and compression
  - Metadata extraction (dimensions, file size)
  - Grid and list view modes
  - File type filtering and search
  - CDN integration ready

### ✅ Content Preview Functionality
- **Location**: `/[locale]/admin/preview`
- **Features**:
  - Real-time content preview
  - Multi-device preview (desktop, tablet, mobile)
  - Language switching in preview
  - Side-by-side content list and preview
  - Direct links to live content
  - Preview status indicators

### ✅ Content Versioning and Backup System
- **Location**: `/[locale]/admin/backups`
- **Features**:
  - Automated backup creation
  - Selective backups (blog, tours, media, full)
  - Version tracking and management
  - One-click restore functionality
  - Activity logging and audit trail
  - Backup download capability
  - Automatic cleanup of old backups

## Technical Architecture

### Admin Layout
- **File**: `src/app/[locale]/admin/layout.tsx`
- Provides consistent navigation and authentication
- Responsive sidebar with feature descriptions
- Language indicator and site preview links

### API Endpoints

#### Blog Management
- `POST /api/admin/blog` - Create/update blog posts
- `GET /api/admin/blog` - List all blog posts
- `DELETE /api/admin/blog` - Delete blog posts

#### Media Management
- `POST /api/admin/media/upload` - Upload and optimize files
- `GET /api/admin/media` - List media files
- `DELETE /api/admin/media` - Delete media files

#### Backup System
- `POST /api/admin/backups` - Create backups
- `GET /api/admin/backups` - List backups and activity
- `GET /api/admin/backups/download` - Download backup files
- `POST /api/admin/backups/restore` - Restore from backup
- `DELETE /api/admin/backups` - Delete backups

#### Preview System
- `GET /api/admin/preview` - List previewable content
- `POST /api/admin/preview` - Create preview sessions

### Components

#### Blog Editor
- **File**: `src/components/admin/blog-editor.tsx`
- Full-featured MDX editor with multilingual support
- Real-time preview functionality
- SEO optimization fields
- Tag and category management

### Data Storage

#### Blog Content
- **Location**: `content/blog/*.mdx`
- MDX format with YAML frontmatter
- Multilingual metadata support
- Automatic processing via `scripts/process-blog-posts.js`

#### Media Files
- **Location**: `public/media/`
- **Metadata**: `content/media-metadata.json`
- Optimized images with CDN support
- Automatic cleanup and organization

#### Backups
- **Location**: `content/backups/`
- **Metadata**: `content/backups/metadata.json`
- ZIP archives with version tracking
- Activity logs for audit trail

## Usage Guide

### Accessing the CMS
1. Navigate to `/[locale]/admin` (e.g., `/en/admin`)
2. Use the sidebar navigation to access different features
3. All changes are automatically saved and versioned

### Creating Blog Posts
1. Go to **Blog Management** → **New Blog Post**
2. Fill in content for each language using the language tabs
3. Add SEO metadata, tags, and related tours
4. Use the preview function to review before saving
5. Save to create the MDX file and regenerate blog data

### Managing Media
1. Go to **Media Library**
2. Upload files using the upload button or drag-and-drop
3. Files are automatically optimized and organized
4. Use search and filters to find specific files
5. Copy URLs directly to clipboard for use in content

### Content Backups
1. Go to **Backups & Versioning**
2. Create selective or full backups as needed
3. Download backups for external storage
4. Restore previous versions when needed
5. Monitor activity log for change tracking

### Content Preview
1. Go to **Preview**
2. Select content from the list
3. Choose language and device mode
4. Preview changes before publishing
5. Open in new tab for full testing

## Security Considerations

- Admin routes are protected with `robots: 'noindex, nofollow'`
- File uploads are validated for type and size
- Backup operations include error handling and cleanup
- All API endpoints include proper error handling

## Performance Features

- Image optimization with Sharp
- CDN integration ready
- Lazy loading for media library
- Efficient backup compression
- Automatic cleanup of old files

## Requirements Fulfilled

This implementation fulfills the following requirements:

- **Requirement 10.2**: Content management and social integration
- **Requirement 4.2**: Content hub and spoke architecture support

The CMS provides a complete solution for managing the Prague tour guide website content with professional-grade features including multilingual support, version control, and media optimization.
