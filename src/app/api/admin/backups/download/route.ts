import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

// Load backup metadata
function loadBackupMetadata(): { backups: BackupFile[]; activity: any[] } {
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

// GET - Download backup file
export async function GET(request: NextRequest) {
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

    // Read the backup file
    const fileBuffer = fs.readFileSync(backupFilePath);

    // Return the file as a download
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${backup.originalFilename}"`,
        'Content-Length': backup.size.toString(),
      },
    });

  } catch (error) {
    console.error('Error downloading backup:', error);
    return NextResponse.json(
      { error: 'Failed to download backup' },
      { status: 500 }
    );
  }
}
