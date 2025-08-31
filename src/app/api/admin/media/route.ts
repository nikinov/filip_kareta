import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const MEDIA_PATH = path.join(process.cwd(), 'public/media');
const MEDIA_METADATA_PATH = path.join(process.cwd(), 'content/media-metadata.json');

interface MediaFile {
  id: string;
  name: string;
  originalName: string;
  url: string;
  type: 'image' | 'video' | 'document';
  size: number;
  uploadedAt: string;
  dimensions?: {
    width: number;
    height: number;
  };
  optimized?: boolean;
  mimeType: string;
}

// Ensure directories exist
function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Load media metadata
function loadMediaMetadata(): MediaFile[] {
  try {
    if (fs.existsSync(MEDIA_METADATA_PATH)) {
      const data = fs.readFileSync(MEDIA_METADATA_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading media metadata:', error);
  }
  return [];
}

// Save media metadata
function saveMediaMetadata(files: MediaFile[]) {
  try {
    ensureDirectoryExists(path.dirname(MEDIA_METADATA_PATH));
    fs.writeFileSync(MEDIA_METADATA_PATH, JSON.stringify(files, null, 2));
  } catch (error) {
    console.error('Error saving media metadata:', error);
    throw error;
  }
}

// Get file type from mime type
function getFileType(mimeType: string): 'image' | 'video' | 'document' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  return 'document';
}

// Generate safe filename
function generateSafeFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  const safeName = name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  
  const timestamp = Date.now();
  return `${safeName}-${timestamp}${ext}`;
}

// GET - List all media files
export async function GET(request: NextRequest) {
  try {
    const files = loadMediaMetadata();
    
    // Verify files still exist and update metadata
    const existingFiles = files.filter(file => {
      const filePath = path.join(process.cwd(), 'public', file.url.replace(/^\//, ''));
      return fs.existsSync(filePath);
    });

    // Save updated metadata if files were removed
    if (existingFiles.length !== files.length) {
      saveMediaMetadata(existingFiles);
    }

    return NextResponse.json({
      success: true,
      files: existingFiles.sort((a, b) => 
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      )
    });

  } catch (error) {
    console.error('Error listing media files:', error);
    return NextResponse.json(
      { error: 'Failed to list media files' },
      { status: 500 }
    );
  }
}

// DELETE - Delete media file
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('id');

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    const files = loadMediaMetadata();
    const fileIndex = files.findIndex(file => file.id === fileId);

    if (fileIndex === -1) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    const file = files[fileIndex];
    const filePath = path.join(process.cwd(), 'public', file.url.replace(/^\//, ''));

    // Delete physical file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from metadata
    files.splice(fileIndex, 1);
    saveMediaMetadata(files);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
      fileId
    });

  } catch (error) {
    console.error('Error deleting media file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}

// POST - Bulk operations (delete multiple files, etc.)
export async function POST(request: NextRequest) {
  try {
    const { action, fileIds } = await request.json();

    if (action === 'delete-multiple') {
      if (!Array.isArray(fileIds) || fileIds.length === 0) {
        return NextResponse.json(
          { error: 'File IDs array is required' },
          { status: 400 }
        );
      }

      const files = loadMediaMetadata();
      const deletedFiles: string[] = [];

      for (const fileId of fileIds) {
        const fileIndex = files.findIndex(file => file.id === fileId);
        if (fileIndex !== -1) {
          const file = files[fileIndex];
          const filePath = path.join(process.cwd(), 'public', file.url.replace(/^\//, ''));

          // Delete physical file
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }

          // Remove from array
          files.splice(fileIndex, 1);
          deletedFiles.push(fileId);
        }
      }

      saveMediaMetadata(files);

      return NextResponse.json({
        success: true,
        message: `${deletedFiles.length} files deleted successfully`,
        deletedFiles
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in bulk operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}
