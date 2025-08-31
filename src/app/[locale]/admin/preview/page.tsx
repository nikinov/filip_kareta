'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  ExternalLink, 
  RefreshCw, 
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Calendar,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

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

export default function PreviewPage({ params }: { params: { locale: string } }) {
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PreviewItem | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewLanguage, setPreviewLanguage] = useState(params.locale);

  useEffect(() => {
    loadPreviewItems();
  }, []);

  const loadPreviewItems = async () => {
    try {
      const response = await fetch('/api/admin/preview');
      const data = await response.json();
      if (data.success) {
        setPreviewItems(data.items);
        if (data.items.length > 0) {
          setSelectedItem(data.items[0]);
        }
      }
    } catch (error) {
      console.error('Error loading preview items:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshPreview = () => {
    if (selectedItem) {
      // Force refresh the iframe
      const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
      if (iframe) {
        iframe.src = iframe.src;
      }
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'draft': 'bg-yellow-100 text-yellow-800',
      'modified': 'bg-blue-100 text-blue-800',
      'published': 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog':
        return <FileText className="h-4 w-4" />;
      case 'tour':
        return <ImageIcon className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getPreviewUrl = (item: PreviewItem) => {
    const baseUrl = `/${previewLanguage}`;
    switch (item.type) {
      case 'blog':
        return `${baseUrl}/blog/${item.slug}?preview=true`;
      case 'tour':
        return `${baseUrl}/tours/${item.slug}?preview=true`;
      default:
        return `${baseUrl}/${item.slug}?preview=true`;
    }
  };

  const getDeviceClass = () => {
    switch (previewMode) {
      case 'mobile':
        return 'w-80 h-[600px]';
      case 'tablet':
        return 'w-[768px] h-[600px]';
      default:
        return 'w-full h-[600px]';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading preview items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Preview</h1>
          <p className="text-gray-600 mt-2">
            Preview your content changes before publishing
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={refreshPreview}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {selectedItem && (
            <Button
              onClick={() => window.open(getPreviewUrl(selectedItem), '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in New Tab
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Content List */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Items</h2>
            
            <div className="space-y-2">
              {previewItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedItem?.id === item.id
                      ? 'bg-blue-50 border-2 border-blue-200'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.title}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(item.lastModified).toLocaleDateString()}</span>
                      </div>
                      <div className="flex space-x-1 mt-2">
                        {item.languages.map((lang) => (
                          <span
                            key={lang}
                            className="px-1 py-0.5 bg-gray-200 text-gray-700 text-xs rounded uppercase"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {previewItems.length === 0 && (
              <div className="text-center py-8">
                <Eye className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">No items to preview</p>
              </div>
            )}
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-3">
          <Card className="p-4">
            {selectedItem ? (
              <>
                {/* Preview Controls */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedItem.title}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {selectedItem.type} • Last modified {new Date(selectedItem.lastModified).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Language Selector */}
                    <select
                      value={previewLanguage}
                      onChange={(e) => setPreviewLanguage(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {selectedItem.languages.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    
                    {/* Device Mode Selector */}
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                      <Button
                        variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setPreviewMode('desktop')}
                        className="h-8 w-8 p-0"
                      >
                        <Monitor className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={previewMode === 'tablet' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setPreviewMode('tablet')}
                        className="h-8 w-8 p-0"
                      >
                        <Tablet className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setPreviewMode('mobile')}
                        className="h-8 w-8 p-0"
                      >
                        <Smartphone className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Preview Frame */}
                <div className="flex justify-center">
                  <div className={`${getDeviceClass()} border rounded-lg overflow-hidden bg-white shadow-lg`}>
                    <iframe
                      id="preview-iframe"
                      src={getPreviewUrl(selectedItem)}
                      className="w-full h-full border-0"
                      title={`Preview of ${selectedItem.title}`}
                    />
                  </div>
                </div>

                {/* Preview Info */}
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <Badge className={`ml-2 ${getStatusColor(selectedItem.status)}`}>
                        {selectedItem.status}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Author:</span>
                      <span className="ml-2 text-gray-600">{selectedItem.author}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">URL:</span>
                      <span className="ml-2 text-blue-600 text-xs">
                        /{previewLanguage}/{selectedItem.type === 'blog' ? 'blog/' : selectedItem.type === 'tour' ? 'tours/' : ''}{selectedItem.slug}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Selected</h3>
                  <p className="text-gray-600">
                    Select a content item from the list to preview it here.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
