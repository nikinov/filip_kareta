import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

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

// Optimize image using Sharp
async function optimizeImage(inputPath: string, outputPath: string): Promise<{
  width: number;
  height: number;
  size: number;
}> {
  try {
    const metadata = await sharp(inputPath).metadata();
    
    // Optimize image with different settings based on size
    let sharpInstance = sharp(inputPath);
    
    // Resize if too large
    if (metadata.width && metadata.width > 2048) {
      sharpInstance = sharpInstance.resize(2048, null, {
        withoutEnlargement: true,
        fit: 'inside'
      });
    }
    
    // Convert to WebP for better compression, fallback to JPEG
    const outputExt = path.extname(outputPath).toLowerCase();
    if (outputExt === '.jpg' || outputExt === '.jpeg') {
      sharpInstance = sharpInstance.jpeg({ quality: 85, progressive: true });
    } else if (outputExt === '.png') {
      sharpInstance = sharpInstance.png({ quality: 85, progressive: true });
    } else if (outputExt === '.webp') {
      sharpInstance = sharpInstance.webp({ quality: 85 });
    }
    
    const info = await sharpInstance.toFile(outputPath);
    
    return {
      width: info.width,
      height: info.height,
      size: info.size
    };
  } catch (error) {
    console.error('Error optimizing image:', error);
    // If optimization fails, just copy the original
    fs.copyFileSync(inputPath, outputPath);
    const stats = fs.statSync(outputPath);
    return {
      width: 0,
      height: 0,
      size: stats.size
    };
  }
}

// POST - Upload media files
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const optimize = formData.get('optimize') === 'true';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/webm', 'video/ogg',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      );
    }

    ensureDirectoryExists(MEDIA_PATH);

    // Generate safe filename
    const safeFilename = generateSafeFilename(file.name);
    const filePath = path.join(MEDIA_PATH, safeFilename);

    // Save file temporarily
    const bytes = await file.arrayBuffer();
    const tempPath = filePath + '.temp';
    fs.writeFileSync(tempPath, Buffer.from(bytes));

    let finalPath = filePath;
    let dimensions: { width: number; height: number } | undefined;
    let finalSize = file.size;
    let optimized = false;

    // Optimize images if requested
    if (optimize && file.type.startsWith('image/')) {
      try {
        const optimizedResult = await optimizeImage(tempPath, filePath);
        dimensions = {
          width: optimizedResult.width,
          height: optimizedResult.height
        };
        finalSize = optimizedResult.size;
        optimized = true;
        
        // Remove temp file
        fs.unlinkSync(tempPath);
      } catch (error) {
        console.error('Error optimizing image:', error);
        // Use original file if optimization fails
        fs.renameSync(tempPath, filePath);
      }
    } else {
      // Just move the temp file to final location
      fs.renameSync(tempPath, filePath);
      
      // Get dimensions for images even if not optimizing
      if (file.type.startsWith('image/')) {
        try {
          const metadata = await sharp(filePath).metadata();
          if (metadata.width && metadata.height) {
            dimensions = {
              width: metadata.width,
              height: metadata.height
            };
          }
        } catch (error) {
          console.error('Error getting image dimensions:', error);
        }
      }
    }

    // Create media file record
    const mediaFile: MediaFile = {
      id: uuidv4(),
      name: safeFilename,
      originalName: file.name,
      url: `/media/${safeFilename}`,
      type: getFileType(file.type),
      size: finalSize,
      uploadedAt: new Date().toISOString(),
      dimensions,
      optimized,
      mimeType: file.type
    };

    // Update metadata
    const files = loadMediaMetadata();
    files.push(mediaFile);
    saveMediaMetadata(files);

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      file: mediaFile
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
