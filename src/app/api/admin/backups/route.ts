import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import archiver from 'archiver';

const BACKUP_PATH = path.join(process.cwd(), 'content/backups');
const BACKUP_METADATA_PATH = path.join(BACKUP_PATH, 'metadata.json');

interface BackupFile {
  id: string;
  type: 'blog' | 'tour' | 'media' | 'full';
  filename: string;
  originalFilename: string;
  size: number;
  createdAt: string;
  description?: string;
  author: string;
  version: string;
}

interface ActivityLog {
  id: string;
  action: 'create' | 'update' | 'delete' | 'restore';
  type: 'blog' | 'tour' | 'media';
  filename: string;
  timestamp: string;
  author: string;
  description: string;
}

// Ensure directories exist
function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Load backup metadata
function loadBackupMetadata(): { backups: BackupFile[]; activity: ActivityLog[] } {
  try {
    if (fs.existsSync(BACKUP_METADATA_PATH)) {
      const data = fs.readFileSync(BACKUP_METADATA_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading backup metadata:', error);
  }
  return { backups: [], activity: [] };
}

// Save backup metadata
function saveBackupMetadata(data: { backups: BackupFile[]; activity: ActivityLog[] }) {
  try {
    ensureDirectoryExists(BACKUP_PATH);
    fs.writeFileSync(BACKUP_METADATA_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving backup metadata:', error);
    throw error;
  }
}

// Create backup archive
async function createBackupArchive(type: string, outputPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      resolve(archive.pointer());
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    try {
      switch (type) {
        case 'blog':
          const blogPath = path.join(process.cwd(), 'content/blog');
          if (fs.existsSync(blogPath)) {
            archive.directory(blogPath, 'blog');
          }
          break;

        case 'tour':
          const tourDataPath = path.join(process.cwd(), 'src/lib/content.ts');
          if (fs.existsSync(tourDataPath)) {
            archive.file(tourDataPath, { name: 'tour-data.ts' });
          }
          break;

        case 'media':
          const mediaPath = path.join(process.cwd(), 'public/media');
          const mediaMetadataPath = path.join(process.cwd(), 'content/media-metadata.json');
          if (fs.existsSync(mediaPath)) {
            archive.directory(mediaPath, 'media');
          }
          if (fs.existsSync(mediaMetadataPath)) {
            archive.file(mediaMetadataPath, { name: 'media-metadata.json' });
          }
          break;

        case 'full':
          // Full backup includes everything
          const contentPath = path.join(process.cwd(), 'content');
          const publicMediaPath = path.join(process.cwd(), 'public/media');
          const srcLibPath = path.join(process.cwd(), 'src/lib/content.ts');
          
          if (fs.existsSync(contentPath)) {
            archive.directory(contentPath, 'content');
          }
          if (fs.existsSync(publicMediaPath)) {
            archive.directory(publicMediaPath, 'public/media');
          }
          if (fs.existsSync(srcLibPath)) {
            archive.file(srcLibPath, { name: 'src/lib/content.ts' });
          }
          break;

        default:
          throw new Error(`Unknown backup type: ${type}`);
      }

      archive.finalize();
    } catch (error) {
      reject(error);
    }
  });
}

// GET - List backups and activity
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const data = loadBackupMetadata();

    if (type === 'activity') {
      return NextResponse.json({
        success: true,
        activity: data.activity.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      });
    }

    return NextResponse.json({
      success: true,
      backups: data.backups.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    });

  } catch (error) {
    console.error('Error listing backups:', error);
    return NextResponse.json(
      { error: 'Failed to list backups' },
      { status: 500 }
    );
  }
}

// POST - Create backup
export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json();

    if (!['blog', 'tour', 'media', 'full'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid backup type' },
        { status: 400 }
      );
    }

    ensureDirectoryExists(BACKUP_PATH);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${type}-backup-${timestamp}.zip`;
    const filePath = path.join(BACKUP_PATH, filename);

    // Create backup archive
    const size = await createBackupArchive(type, filePath);

    // Generate version number
    const data = loadBackupMetadata();
    const existingBackups = data.backups.filter(b => b.type === type);
    const version = `${existingBackups.length + 1}.0`;

    // Create backup record
    const backup: BackupFile = {
      id: uuidv4(),
      type: type as any,
      filename,
      originalFilename: `${type}-backup-${new Date().toLocaleDateString()}.zip`,
      size,
      createdAt: new Date().toISOString(),
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} backup created automatically`,
      author: 'Filip Kareta',
      version
    };

    // Add activity log
    const activity: ActivityLog = {
      id: uuidv4(),
      action: 'create',
      type: type as any,
      filename: backup.originalFilename,
      timestamp: new Date().toISOString(),
      author: 'Filip Kareta',
      description: `Created ${type} backup`
    };

    // Update metadata
    data.backups.push(backup);
    data.activity.push(activity);
    saveBackupMetadata(data);

    // Clean up old backups (keep only last 10 per type)
    const typeBackups = data.backups
      .filter(b => b.type === type)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (typeBackups.length > 10) {
      const toDelete = typeBackups.slice(10);
      for (const backup of toDelete) {
        const backupPath = path.join(BACKUP_PATH, backup.filename);
        if (fs.existsSync(backupPath)) {
          fs.unlinkSync(backupPath);
        }
        data.backups = data.backups.filter(b => b.id !== backup.id);
      }
      saveBackupMetadata(data);
    }

    return NextResponse.json({
      success: true,
      message: 'Backup created successfully',
      backup
    });

  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    );
  }
}

// DELETE - Delete backup
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const backupId = searchParams.get('id');

    if (!backupId) {
      return NextResponse.json(
        { error: 'Backup ID is required' },
        { status: 400 }
      );
    }

    const data = loadBackupMetadata();
    const backupIndex = data.backups.findIndex(b => b.id === backupId);

    if (backupIndex === -1) {
      return NextResponse.json(
        { error: 'Backup not found' },
        { status: 404 }
      );
    }

    const backup = data.backups[backupIndex];
    const backupPath = path.join(BACKUP_PATH, backup.filename);

    // Delete physical file
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
    }

    // Remove from metadata
    data.backups.splice(backupIndex, 1);

    // Add activity log
    const activity: ActivityLog = {
      id: uuidv4(),
      action: 'delete',
      type: backup.type,
      filename: backup.originalFilename,
      timestamp: new Date().toISOString(),
      author: 'Filip Kareta',
      description: `Deleted ${backup.type} backup`
    };

    data.activity.push(activity);
    saveBackupMetadata(data);

    return NextResponse.json({
      success: true,
      message: 'Backup deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting backup:', error);
    return NextResponse.json(
      { error: 'Failed to delete backup' },
      { status: 500 }
    );
  }
}
