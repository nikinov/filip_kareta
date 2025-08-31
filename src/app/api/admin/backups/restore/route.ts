import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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
    fs.writeFileSync(BACKUP_METADATA_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving backup metadata:', error);
    throw error;
  }
}

// Extract backup archive
async function extractBackup(backupPath: string, extractPath: string): Promise<void> {
  try {
    // Create extraction directory
    if (!fs.existsSync(extractPath)) {
      fs.mkdirSync(extractPath, { recursive: true });
    }

    // Use unzip command to extract the backup
    await execAsync(`unzip -o "${backupPath}" -d "${extractPath}"`);
  } catch (error) {
    console.error('Error extracting backup:', error);
    throw new Error('Failed to extract backup archive');
  }
}

// Restore backup files to their original locations
async function restoreFiles(extractPath: string, backupType: string): Promise<void> {
  try {
    const projectRoot = process.cwd();

    switch (backupType) {
      case 'blog':
        const blogExtractPath = path.join(extractPath, 'blog');
        const blogTargetPath = path.join(projectRoot, 'content/blog');
        
        if (fs.existsSync(blogExtractPath)) {
          // Remove existing blog content
          if (fs.existsSync(blogTargetPath)) {
            fs.rmSync(blogTargetPath, { recursive: true, force: true });
          }
          
          // Copy restored content
          fs.mkdirSync(blogTargetPath, { recursive: true });
          await execAsync(`cp -r "${blogExtractPath}"/* "${blogTargetPath}"/`);
        }
        break;

      case 'tour':
        const tourExtractPath = path.join(extractPath, 'tour-data.ts');
        const tourTargetPath = path.join(projectRoot, 'src/lib/content.ts');
        
        if (fs.existsSync(tourExtractPath)) {
          fs.copyFileSync(tourExtractPath, tourTargetPath);
        }
        break;

      case 'media':
        const mediaExtractPath = path.join(extractPath, 'media');
        const mediaTargetPath = path.join(projectRoot, 'public/media');
        const mediaMetadataExtractPath = path.join(extractPath, 'media-metadata.json');
        const mediaMetadataTargetPath = path.join(projectRoot, 'content/media-metadata.json');
        
        if (fs.existsSync(mediaExtractPath)) {
          // Remove existing media
          if (fs.existsSync(mediaTargetPath)) {
            fs.rmSync(mediaTargetPath, { recursive: true, force: true });
          }
          
          // Copy restored media
          fs.mkdirSync(mediaTargetPath, { recursive: true });
          await execAsync(`cp -r "${mediaExtractPath}"/* "${mediaTargetPath}"/`);
        }
        
        if (fs.existsSync(mediaMetadataExtractPath)) {
          fs.copyFileSync(mediaMetadataExtractPath, mediaMetadataTargetPath);
        }
        break;

      case 'full':
        // Full restore - restore all components
        const contentExtractPath = path.join(extractPath, 'content');
        const contentTargetPath = path.join(projectRoot, 'content');
        const publicMediaExtractPath = path.join(extractPath, 'public/media');
        const publicMediaTargetPath = path.join(projectRoot, 'public/media');
        const srcLibExtractPath = path.join(extractPath, 'src/lib/content.ts');
        const srcLibTargetPath = path.join(projectRoot, 'src/lib/content.ts');
        
        // Restore content directory
        if (fs.existsSync(contentExtractPath)) {
          if (fs.existsSync(contentTargetPath)) {
            fs.rmSync(contentTargetPath, { recursive: true, force: true });
          }
          fs.mkdirSync(contentTargetPath, { recursive: true });
          await execAsync(`cp -r "${contentExtractPath}"/* "${contentTargetPath}"/`);
        }
        
        // Restore media
        if (fs.existsSync(publicMediaExtractPath)) {
          if (fs.existsSync(publicMediaTargetPath)) {
            fs.rmSync(publicMediaTargetPath, { recursive: true, force: true });
          }
          fs.mkdirSync(publicMediaTargetPath, { recursive: true });
          await execAsync(`cp -r "${publicMediaExtractPath}"/* "${publicMediaTargetPath}"/`);
        }
        
        // Restore tour data
        if (fs.existsSync(srcLibExtractPath)) {
          fs.copyFileSync(srcLibExtractPath, srcLibTargetPath);
        }
        break;

      default:
        throw new Error(`Unknown backup type: ${backupType}`);
    }

    // Regenerate blog data if blog content was restored
    if (backupType === 'blog' || backupType === 'full') {
      try {
        await execAsync('node scripts/process-blog-posts.js', {
          cwd: projectRoot
        });
      } catch (error) {
        console.error('Error regenerating blog data:', error);
        // Don't fail the restore if blog regeneration fails
      }
    }

  } catch (error) {
    console.error('Error restoring files:', error);
    throw new Error('Failed to restore backup files');
  }
}

// POST - Restore backup
export async function POST(request: NextRequest) {
  try {
    const { backupId } = await request.json();

    if (!backupId) {
      return NextResponse.json(
        { error: 'Backup ID is required' },
        { status: 400 }
      );
    }

    const data = loadBackupMetadata();
    const backup = data.backups.find(b => b.id === backupId);

    if (!backup) {
      return NextResponse.json(
        { error: 'Backup not found' },
        { status: 404 }
      );
    }

    const backupFilePath = path.join(BACKUP_PATH, backup.filename);

    if (!fs.existsSync(backupFilePath)) {
      return NextResponse.json(
        { error: 'Backup file not found on disk' },
        { status: 404 }
      );
    }

    // Create temporary extraction directory
    const tempExtractPath = path.join(BACKUP_PATH, `temp-restore-${Date.now()}`);

    try {
      // Extract backup
      await extractBackup(backupFilePath, tempExtractPath);

      // Restore files
      await restoreFiles(tempExtractPath, backup.type);

      // Add activity log
      const activity: ActivityLog = {
        id: uuidv4(),
        action: 'restore',
        type: backup.type,
        filename: backup.originalFilename,
        timestamp: new Date().toISOString(),
        author: 'Filip Kareta',
        description: `Restored ${backup.type} backup from ${new Date(backup.createdAt).toLocaleDateString()}`
      };

      data.activity.push(activity);
      saveBackupMetadata(data);

      return NextResponse.json({
        success: true,
        message: 'Backup restored successfully',
        backup: backup.originalFilename
      });

    } finally {
      // Clean up temporary extraction directory
      if (fs.existsSync(tempExtractPath)) {
        fs.rmSync(tempExtractPath, { recursive: true, force: true });
      }
    }

  } catch (error) {
    console.error('Error restoring backup:', error);
    return NextResponse.json(
      { error: 'Failed to restore backup' },
      { status: 500 }
    );
  }
}
