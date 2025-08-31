import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BACKUP_PATH = path.join(process.cwd(), 'content/backups');
const BACKUP_METADATA_PATH = path.join(BACKUP_PATH, 'metadata.json');

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
function loadBackupMetadata(): { backups: any[]; activity: ActivityLog[] } {
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

// GET - Get activity log
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type');

    const data = loadBackupMetadata();
    let activity = data.activity;

    // Filter by type if specified
    if (type && type !== 'all') {
      activity = activity.filter(log => log.type === type);
    }

    // Sort by timestamp (newest first) and limit results
    activity = activity
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      activity,
      total: activity.length
    });

  } catch (error) {
    console.error('Error loading activity log:', error);
    return NextResponse.json(
      { error: 'Failed to load activity log' },
      { status: 500 }
    );
  }
}
