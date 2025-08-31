import { Metadata } from 'next';
import Link from 'next/link';
// import { useTranslations } from 'next-intl'; // TODO: Replace with Paraglide
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  FileText, 
  Image, 
  Settings, 
  BarChart3, 
  PenTool, 
  Upload,
  Eye,
  Archive,
  Home
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Dashboard - Prague Tour Guide',
  description: 'Content management system for the Prague tour guide website',
  robots: 'noindex, nofollow', // Keep admin pages private
};

interface AdminLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default function AdminLayout({ children, params }: AdminLayoutProps) {
  // TODO: Replace with Paraglide
  const t = (key: string) => key;

  const navigation = [
    {
      name: 'Dashboard',
      href: `/${params.locale}/admin`,
      icon: Home,
      description: 'Overview and quick actions'
    },
    {
      name: 'Content Editor',
      href: `/${params.locale}/admin/content`,
      icon: PenTool,
      description: 'Edit tours and blog posts'
    },
    {
      name: 'Media Library',
      href: `/${params.locale}/admin/media`,
      icon: Image,
      description: 'Upload and manage images'
    },
    {
      name: 'Blog Posts',
      href: `/${params.locale}/admin/blog`,
      icon: FileText,
      description: 'Create and edit blog content'
    },
    {
      name: 'Preview',
      href: `/${params.locale}/admin/preview`,
      icon: Eye,
      description: 'Preview content changes'
    },
    {
      name: 'Backups',
      href: `/${params.locale}/admin/backups`,
      icon: Archive,
      description: 'Content versioning and backups'
    },
    {
      name: 'Analytics',
      href: `/${params.locale}/admin/analytics`,
      icon: BarChart3,
      description: 'Website performance metrics'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Prague Tours CMS
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href={`/${params.locale}`}>
                <Button variant="outline" size="sm">
                  View Site
                </Button>
              </Link>
              <div className="text-sm text-gray-500">
                Language: {params.locale.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-6">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    <div>
                      <div>{item.name}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
