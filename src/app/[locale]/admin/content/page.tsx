'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Eye, 
  Plus,
  Globe,
  Calendar,
  Users,
  Clock,
  MapPin,
  Star,
  Euro
} from 'lucide-react';
import Link from 'next/link';
import type { Locale } from '@/types';
import { sampleTours } from '@/lib/content';

interface Tour {
  id: string;
  slug: string;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  highlights: Record<Locale, string[]>;
  duration: number;
  maxGroupSize: number;
  basePrice: number;
  currency: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  images: string[];
  lastModified?: string;
  status: 'published' | 'draft' | 'modified';
}

export default function ContentManagement({ params }: { params: { locale: string } }) {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTours();
  }, []);

  const loadTours = async () => {
    try {
      // For now, use sample data with added status and lastModified
      const toursWithStatus = sampleTours.map(tour => ({
        ...tour,
        lastModified: new Date().toISOString(),
        status: 'published' as const
      }));
      setTours(toursWithStatus);
    } catch (error) {
      console.error('Error loading tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      'easy': 'bg-green-100 text-green-800',
      'moderate': 'bg-yellow-100 text-yellow-800',
      'challenging': 'bg-red-100 text-red-800',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'published': 'bg-green-100 text-green-800',
      'draft': 'bg-yellow-100 text-yellow-800',
      'modified': 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading tours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tour Content Management</h1>
          <p className="text-gray-600 mt-2">
            Edit tour descriptions, details, and multilingual content
          </p>
        </div>
        
        <Link href={`/${params.locale}/admin/content/tours/new`}>
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Tour</span>
          </Button>
        </Link>
      </div>

      {/* Tours Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tours.map((tour) => (
          <Card key={tour.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className={getStatusColor(tour.status)}>
                    {tour.status}
                  </Badge>
                  <Badge className={getDifficultyColor(tour.difficulty)}>
                    {tour.difficulty}
                  </Badge>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {tour.title[params.locale as Locale] || tour.title.en}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {tour.description[params.locale as Locale] || tour.description.en}
                </p>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <Link href={`/${params.locale}/tours/${tour.slug}`} target="_blank">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/${params.locale}/admin/content/tours/${tour.slug}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Tour Details */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(tour.duration)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>Max {tour.maxGroupSize} people</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Euro className="h-4 w-4" />
                <span>From {tour.basePrice} {tour.currency}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{tour.highlights[params.locale as Locale]?.[0] || tour.highlights.en[0]}</span>
              </div>
            </div>

            {/* Highlights Preview */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Highlights:</h4>
              <div className="flex flex-wrap gap-1">
                {(tour.highlights[params.locale as Locale] || tour.highlights.en).slice(0, 3).map((highlight, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {highlight}
                  </Badge>
                ))}
                {(tour.highlights[params.locale as Locale] || tour.highlights.en).length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{(tour.highlights[params.locale as Locale] || tour.highlights.en).length - 3} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Language Status */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">Languages:</span>
                  <div className="flex space-x-2">
                    {(['en', 'de', 'fr'] as Locale[]).map((lang) => (
                      <div key={lang} className="flex items-center space-x-1">
                        <Globe className="h-3 w-3" />
                        <span className="text-xs font-medium text-gray-600 uppercase">
                          {lang}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${
                          tour.title[lang] ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {tour.lastModified && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(tour.lastModified).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {tours.length === 0 && (
        <Card className="p-12 text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tours yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first tour to start attracting visitors to Prague.
          </p>
          <Link href={`/${params.locale}/admin/content/tours/new`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create First Tour
            </Button>
          </Link>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tours</p>
              <p className="text-2xl font-bold text-gray-900">{tours.length}</p>
            </div>
            <MapPin className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-gray-900">
                {tours.filter(t => t.status === 'published').length}
              </p>
            </div>
            <Eye className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-gray-900">
                {tours.filter(t => t.status === 'draft').length}
              </p>
            </div>
            <Edit className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Duration</p>
              <p className="text-2xl font-bold text-gray-900">
                {tours.length > 0 ? formatDuration(Math.round(tours.reduce((acc, t) => acc + t.duration, 0) / tours.length)) : '0m'}
              </p>
            </div>
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>
    </div>
  );
}
