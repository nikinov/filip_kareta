import { Metadata } from 'next';
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard';
import { RealTimeMetrics } from '@/components/analytics/analytics-dashboard';

export const metadata: Metadata = {
  title: 'Analytics Dashboard - Prague Tour Guide',
  description: 'Analytics and performance metrics for the Prague tour guide website',
  robots: 'noindex, nofollow', // Keep admin pages private
};

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Monitor website performance, user behavior, and conversion metrics
          </p>
        </div>

        {/* Real-time metrics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Real-Time Metrics</h2>
          <RealTimeMetrics />
        </div>

        {/* Main analytics dashboard */}
        <AnalyticsDashboard />
      </div>
    </div>
  );
}
