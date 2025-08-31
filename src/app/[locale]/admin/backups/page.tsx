'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Archive,
  Download,
  RotateCcw,
  Trash2,
  Calendar,
  FileText,
  Clock,
  User,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

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

export default function BackupsPage({ params }: { params: { locale: string } }) {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadBackups();
    loadActivity();
  }, []);

  const loadBackups = async () => {
    try {
      const response = await fetch('/api/admin/backups');
      const data = await response.json();
      if (data.success) {
        setBackups(data.backups);
      }
    } catch (error) {
      console.error('Error loading backups:', error);
    }
  };

  const loadActivity = async () => {
    try {
      const response = await fetch('/api/admin/backups/activity');
      const data = await response.json();
      if (data.success) {
        setActivity(data.activity);
      }
    } catch (error) {
      console.error('Error loading activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async (type: 'blog' | 'tour' | 'media' | 'full') => {
    setCreating(true);
    try {
      const response = await fetch('/api/admin/backups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      if (response.ok) {
        await loadBackups();
        await loadActivity();
      } else {
        alert('Failed to create backup');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('Failed to create backup');
    } finally {
      setCreating(false);
    }
  };

  const downloadBackup = async (backupId: string) => {
    try {
      const response = await fetch(`/api/admin/backups/download?id=${backupId}`);
      if (response.ok) {
        const blob = await response.blob();
        const backup = backups.find(b => b.id === backupId);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = backup?.filename || 'backup.zip';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading backup:', error);
      alert('Failed to download backup');
    }
  };

  const restoreBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to restore this backup? This will overwrite current content.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/backups/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ backupId }),
      });

      if (response.ok) {
        alert('Backup restored successfully');
        await loadActivity();
      } else {
        alert('Failed to restore backup');
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      alert('Failed to restore backup');
    }
  };

  const deleteBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to delete this backup?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/backups?id=${backupId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBackups(backups.filter(b => b.id !== backupId));
      } else {
        alert('Failed to delete backup');
      }
    } catch (error) {
      console.error('Error deleting backup:', error);
      alert('Failed to delete backup');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getBackupTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'blog': 'bg-blue-100 text-blue-800',
      'tour': 'bg-green-100 text-green-800',
      'media': 'bg-purple-100 text-purple-800',
      'full': 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <FileText className="h-4 w-4 text-green-600" />;
      case 'update':
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      case 'delete':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'restore':
        return <RotateCcw className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading backups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Backups & Versioning</h1>
          <p className="text-gray-600 mt-2">
            Manage content backups and track changes to your website content
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Backup</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button
            onClick={() => createBackup('blog')}
            disabled={creating}
            className="flex items-center justify-center space-x-2"
          >
            <Archive className="h-4 w-4" />
            <span>Blog Posts</span>
          </Button>
          <Button
            onClick={() => createBackup('tour')}
            disabled={creating}
            className="flex items-center justify-center space-x-2"
          >
            <Archive className="h-4 w-4" />
            <span>Tour Content</span>
          </Button>
          <Button
            onClick={() => createBackup('media')}
            disabled={creating}
            className="flex items-center justify-center space-x-2"
          >
            <Archive className="h-4 w-4" />
            <span>Media Files</span>
          </Button>
          <Button
            onClick={() => createBackup('full')}
            disabled={creating}
            variant="outline"
            className="flex items-center justify-center space-x-2 border-orange-300 text-orange-700 hover:bg-orange-50"
          >
            <Archive className="h-4 w-4" />
            <span>Full Backup</span>
          </Button>
        </div>
        {creating && (
          <div className="mt-4 text-center text-gray-600">
            Creating backup... This may take a few moments.
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backups List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Available Backups</h2>
          
          {backups.length === 0 ? (
            <Card className="p-8 text-center">
              <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No backups yet</h3>
              <p className="text-gray-600">
                Create your first backup to protect your content and enable versioning.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => (
                <Card key={backup.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge className={getBackupTypeColor(backup.type)}>
                          {backup.type.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-500">v{backup.version}</span>
                      </div>
                      
                      <h3 className="font-medium text-gray-900 mb-1">
                        {backup.originalFilename}
                      </h3>
                      
                      {backup.description && (
                        <p className="text-sm text-gray-600 mb-2">{backup.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(backup.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{backup.author}</span>
                        </div>
                        <span>{formatFileSize(backup.size)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadBackup(backup.id)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => restoreBackup(backup.id)}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteBackup(backup.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Activity Log */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          
          <Card className="p-4">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activity.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No recent activity</p>
                </div>
              ) : (
                activity.map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 py-2">
                    <div className="flex-shrink-0 mt-1">
                      {getActionIcon(log.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium capitalize">{log.action}</span>{' '}
                        <span className="text-blue-600">{log.filename}</span>
                      </p>
                      <p className="text-xs text-gray-500">{log.description}</p>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                        <span>{log.author}</span>
                        <span>•</span>
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Warning Notice */}
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Important Notes</h3>
            <div className="text-sm text-yellow-700 mt-1">
              <ul className="list-disc list-inside space-y-1">
                <li>Backups are automatically created before major content changes</li>
                <li>Full backups include all content, media files, and configurations</li>
                <li>Restoring a backup will overwrite current content - use with caution</li>
                <li>Old backups are automatically cleaned up after 30 days</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
