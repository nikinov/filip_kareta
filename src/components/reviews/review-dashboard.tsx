'use client';

import { useReviews } from '@/hooks/use-reviews';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RatingVisualization } from '@/components/ui/rating-visualization';
import { Testimonials } from '@/components/ui/testimonials';
import { TrustSignals } from '@/components/ui/trust-signals';
import { RefreshCw, ExternalLink } from 'lucide-react';

interface ReviewDashboardProps {
  tourId?: string;
  className?: string;
}

export function ReviewDashboard({ tourId, className = '' }: ReviewDashboardProps) {
  const { 
    reviews, 
    stats, 
    trustSignals, 
    loading, 
    error, 
    refresh, 
    clearCache 
  } = useReviews({
    tourId,
    limit: 20,
    autoRefresh: true,
    refreshInterval: 600000 // 10 minutes
  });

  const handleRefresh = async () => {
    await refresh();
  };

  const handleClearCache = async () => {
    await clearCache();
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Failed to load reviews: {error}</p>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm" 
              className="mt-4"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Dashboard Header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">
            Review Dashboard
            {tourId && <span className="text-lg font-normal text-gray-500 ml-2">for {tourId}</span>}
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={handleClearCache} 
              variant="outline" 
              size="sm"
              disabled={loading}
            >
              Clear Cache
            </Button>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {loading ? '...' : stats?.totalReviews || 0}
              </div>
              <div className="text-sm text-gray-500">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {loading ? '...' : stats?.averageRating?.toFixed(1) || '0.0'}
              </div>
              <div className="text-sm text-gray-500">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {loading ? '...' : stats?.verifiedReviewsCount || 0}
              </div>
              <div className="text-sm text-gray-500">Verified Reviews</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trust Signals */}
      <TrustSignals tourId={tourId} variant="full" />

      {/* Rating Breakdown */}
      <RatingVisualization tourId={tourId} variant="detailed" />

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Recent Customer Reviews
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a 
                  href="https://www.google.com/search?q=Filip+Kareta+Prague+guide+reviews" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Google
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a 
                  href="https://www.tripadvisor.com/Attraction_Review-g274707-d123456-Reviews-Filip_Kareta_Prague_Tours-Prague_Bohemia.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  TripAdvisor
                </a>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Testimonials 
            tourId={tourId}
            limit={12}
            variant="grid"
            showPhotos={true}
          />
        </CardContent>
      </Card>

      {/* API Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">API Integration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Google Reviews API</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                process.env.GOOGLE_PLACES_API_KEY 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {process.env.GOOGLE_PLACES_API_KEY ? 'Configured' : 'Mock Data'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">TripAdvisor API</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                process.env.TRIPADVISOR_API_KEY 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {process.env.TRIPADVISOR_API_KEY ? 'Configured' : 'Mock Data'}
              </span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>
              Configure API keys in your environment variables to enable live review fetching. 
              Currently using {process.env.NODE_ENV === 'development' ? 'mock data for development' : 'fallback data'}.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
