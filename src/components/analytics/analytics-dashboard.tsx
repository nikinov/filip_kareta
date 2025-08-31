'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { bookingMonitor, BookingMetrics } from '@/lib/booking-monitoring';
import { abTesting } from '@/lib/ab-testing';

interface AnalyticsDashboardProps {
  className?: string;
}

interface WebVitalsData {
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
  timestamp: Date;
}

interface ConversionMetrics {
  totalVisitors: number;
  tourPageViews: number;
  bookingButtonClicks: number;
  bookingStarts: number;
  bookingCompletions: number;
  conversionRate: number;
  averageOrderValue: number;
}

export function AnalyticsDashboard({ className }: AnalyticsDashboardProps) {
  const [bookingMetrics, setBookingMetrics] = useState<BookingMetrics | null>(null);
  const [webVitals, setWebVitals] = useState<WebVitalsData[]>([]);
  const [conversionMetrics, setConversionMetrics] = useState<ConversionMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadAnalyticsData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(loadAnalyticsData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Load booking metrics
      const bookingData = bookingMonitor.getMetrics();
      setBookingMetrics(bookingData);

      // Load web vitals data
      await loadWebVitalsData();

      // Load conversion metrics
      await loadConversionMetrics();

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWebVitalsData = async () => {
    try {
      // In production, this would fetch from your analytics API
      // For now, we'll simulate some data
      const mockData: WebVitalsData[] = [
        {
          lcp: 1200,
          fid: 50,
          cls: 0.05,
          ttfb: 400,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        {
          lcp: 1100,
          fid: 45,
          cls: 0.03,
          ttfb: 380,
          timestamp: new Date(),
        },
      ];
      setWebVitals(mockData);
    } catch (error) {
      console.error('Failed to load web vitals data:', error);
    }
  };

  const loadConversionMetrics = async () => {
    try {
      // In production, this would fetch from Google Analytics API
      // For now, we'll calculate from booking metrics
      if (bookingMetrics) {
        const totalVisitors = 1000; // This would come from GA4
        const tourPageViews = 500; // This would come from GA4
        const bookingButtonClicks = 150; // This would come from GA4
        
        const conversionData: ConversionMetrics = {
          totalVisitors,
          tourPageViews,
          bookingButtonClicks,
          bookingStarts: bookingMetrics.bookingAttempts,
          bookingCompletions: bookingMetrics.successfulBookings,
          conversionRate: (bookingMetrics.successfulBookings / totalVisitors) * 100,
          averageOrderValue: 85, // This would be calculated from actual booking data
        };
        
        setConversionMetrics(conversionData);
      }
    } catch (error) {
      console.error('Failed to load conversion metrics:', error);
    }
  };

  const getWebVitalsRating = (metric: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      ttfb: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const formatMetricValue = (metric: string, value: number): string => {
    if (metric === 'cls') return value.toFixed(3);
    return `${Math.round(value)}ms`;
  };

  const getRatingColor = (rating: string): string => {
    switch (rating) {
      case 'good': return 'bg-green-500';
      case 'needs-improvement': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading && !bookingMetrics) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <Button onClick={loadAnalyticsData} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="ab-tests">A/B Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bookingMetrics?.successfulBookings || 0}</div>
                <p className="text-xs text-gray-500">
                  {bookingMetrics?.failedBookings || 0} failed attempts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {conversionMetrics?.conversionRate.toFixed(1) || '0.0'}%
                </div>
                <p className="text-xs text-gray-500">
                  {conversionMetrics?.totalVisitors || 0} total visitors
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(bookingMetrics?.averageResponseTime || 0)}ms
                </div>
                <p className="text-xs text-gray-500">
                  {bookingMetrics?.availabilityChecks || 0} availability checks
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  €{conversionMetrics?.averageOrderValue || 0}
                </div>
                <p className="text-xs text-gray-500">
                  {bookingMetrics?.successfulBookings || 0} completed bookings
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>Track user journey from visit to booking</CardDescription>
            </CardHeader>
            <CardContent>
              {conversionMetrics && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span>Total Visitors</span>
                    <span className="font-bold">{conversionMetrics.totalVisitors}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span>Tour Page Views</span>
                    <span className="font-bold">{conversionMetrics.tourPageViews}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                    <span>Booking Button Clicks</span>
                    <span className="font-bold">{conversionMetrics.bookingButtonClicks}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                    <span>Booking Flow Started</span>
                    <span className="font-bold">{conversionMetrics.bookingStarts}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span>Bookings Completed</span>
                    <span className="font-bold">{conversionMetrics.bookingCompletions}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {webVitals.length > 0 && webVitals[webVitals.length - 1] && (
              <>
                {Object.entries({
                  lcp: 'Largest Contentful Paint',
                  fid: 'First Input Delay',
                  cls: 'Cumulative Layout Shift',
                  ttfb: 'Time to First Byte',
                }).map(([metric, label]) => {
                  const value = webVitals[webVitals.length - 1][metric as keyof WebVitalsData] as number;
                  const rating = getWebVitalsRating(metric, value);
                  
                  return (
                    <Card key={metric}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">{label}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-bold">
                            {formatMetricValue(metric, value)}
                          </div>
                          <Badge className={`${getRatingColor(rating)} text-white`}>
                            {rating}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ab-tests" className="space-y-4">
          <div className="grid gap-4">
            {abTesting.getActiveTests().map(test => {
              const results = abTesting.getTestResults(test.id);
              
              return (
                <Card key={test.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {test.name}
                      <Badge variant="outline">Active</Badge>
                    </CardTitle>
                    <CardDescription>{test.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <strong>Target Metric:</strong> {test.targetMetric}
                      </div>
                      <div className="text-sm">
                        <strong>Total Assignments:</strong> {results.totalAssignments}
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Variant Distribution:</div>
                        {test.variants.map(variant => {
                          const count = results.variantDistribution[variant.id] || 0;
                          const percentage = results.totalAssignments > 0 
                            ? ((count / results.totalAssignments) * 100).toFixed(1)
                            : '0.0';
                          
                          return (
                            <div key={variant.id} className="flex justify-between items-center text-sm">
                              <span>{variant.name}</span>
                              <span>{count} ({percentage}%)</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Real-time metrics component
export function RealTimeMetrics() {
  const [metrics, setMetrics] = useState<BookingMetrics | null>(null);

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(bookingMonitor.getMetrics());
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  if (!metrics) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">{metrics.successfulBookings}</div>
        <div className="text-xs text-gray-500">Successful Bookings</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600">{metrics.bookingAttempts}</div>
        <div className="text-xs text-gray-500">Total Attempts</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-orange-600">{metrics.availabilityChecks}</div>
        <div className="text-xs text-gray-500">Availability Checks</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600">
          {Math.round(metrics.averageResponseTime)}ms
        </div>
        <div className="text-xs text-gray-500">Avg Response Time</div>
      </div>
    </div>
  );
}

// Analytics summary widget for admin pages
export function AnalyticsSummary() {
  const [summary, setSummary] = useState({
    todayBookings: 0,
    weeklyBookings: 0,
    conversionRate: 0,
    topTour: 'Prague Castle Tour',
  });

  useEffect(() => {
    // Load summary data
    const loadSummary = async () => {
      try {
        const metrics = bookingMonitor.getMetrics();
        setSummary({
          todayBookings: Math.floor(metrics.successfulBookings * 0.1), // Simulate daily bookings
          weeklyBookings: metrics.successfulBookings,
          conversionRate: metrics.bookingAttempts > 0 
            ? (metrics.successfulBookings / metrics.bookingAttempts) * 100 
            : 0,
          topTour: 'Prague Castle Tour',
        });
      } catch (error) {
        console.error('Failed to load analytics summary:', error);
      }
    };

    loadSummary();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold text-green-600">{summary.todayBookings}</div>
            <div className="text-sm text-gray-500">Today's Bookings</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{summary.weeklyBookings}</div>
            <div className="text-sm text-gray-500">This Week</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {summary.conversionRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">Conversion Rate</div>
          </div>
          <div>
            <div className="text-sm font-medium text-orange-600">{summary.topTour}</div>
            <div className="text-sm text-gray-500">Top Performing Tour</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
