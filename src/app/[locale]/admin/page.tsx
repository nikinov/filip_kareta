import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Image, 
  PenTool, 
  Upload,
  Eye,
  Archive,
  BarChart3,
  Plus,
  Edit,
  Calendar
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Prague Tour Guide CMS',
  description: 'Content management dashboard for the Prague tour guide website',
  robots: 'noindex, nofollow',
};

interface AdminDashboardProps {
  params: { locale: string };
}

export default function AdminDashboard({ params }: AdminDashboardProps) {
  const { locale } = params;

  const quickActions = [
    {
      title: 'Create New Blog Post',
      description: 'Write a new blog post with multilingual support',
      href: `/${locale}/admin/blog/new`,
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Edit Tour Content',
      description: 'Update tour descriptions and details',
      href: `/${locale}/admin/content/tours`,
      icon: Edit,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Upload Images',
      description: 'Add new images to the media library',
      href: `/${locale}/admin/media/upload`,
      icon: Upload,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Preview Changes',
      description: 'Preview content before publishing',
      href: `/${locale}/admin/preview`,
      icon: Eye,
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  const recentActivity = [
    {
      action: 'Blog post updated',
      item: 'Best Prague Viewpoints',
      time: '2 hours ago',
      user: 'Filip Kareta'
    },
    {
      action: 'Image uploaded',
      item: 'prague-castle-sunset.jpg',
      time: '4 hours ago',
      user: 'Filip Kareta'
    },
    {
      action: 'Tour description edited',
      item: 'Prague Castle & Lesser Town',
      time: '1 day ago',
      user: 'Filip Kareta'
    }
  ];

  const contentStats = {
    blogPosts: 12,
    tours: 5,
    images: 156,
    pendingChanges: 3
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome to your CMS</h1>
        <p className="text-gray-600 mt-2">
          Manage your Prague tour guide website content, images, and settings.
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} href={action.href}>
                <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg text-white ${action.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Content Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Blog Posts</p>
                <p className="text-2xl font-bold text-gray-900">{contentStats.blogPosts}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tours</p>
                <p className="text-2xl font-bold text-gray-900">{contentStats.tours}</p>
              </div>
              <PenTool className="h-8 w-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Images</p>
                <p className="text-2xl font-bold text-gray-900">{contentStats.images}</p>
              </div>
              <Image className="h-8 w-8 text-purple-500" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Changes</p>
                <p className="text-2xl font-bold text-gray-900">{contentStats.pendingChanges}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <Card className="p-6">
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action}: <span className="text-blue-600">{activity.item}</span>
                  </p>
                  <p className="text-xs text-gray-500">by {activity.user}</p>
                </div>
                <div className="text-xs text-gray-500">{activity.time}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t">
            <Link href={`/${locale}/admin/backups`}>
              <Button variant="outline" size="sm">
                View All Activity
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* System Status */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">Content System</p>
                <p className="text-sm text-gray-500">All systems operational</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">Image Processing</p>
                <p className="text-sm text-gray-500">CDN optimization active</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">Backup System</p>
                <p className="text-sm text-gray-500">Last backup: 6 hours ago</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
