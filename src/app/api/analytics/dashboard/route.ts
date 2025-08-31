import { NextRequest, NextResponse } from 'next/server';
import { bookingMonitor } from '@/lib/booking-monitoring';
import { abTesting } from '@/lib/ab-testing';

export interface DashboardMetrics {
  overview: {
    totalBookings: number;
    conversionRate: number;
    averageOrderValue: number;
    totalRevenue: number;
  };
  performance: {
    averageResponseTime: number;
    successRate: number;
    availabilityChecks: number;
    errorRate: number;
  };
  userBehavior: {
    pageViews: number;
    uniqueVisitors: number;
    bounceRate: number;
    averageSessionDuration: number;
  };
  abTests: Array<{
    testId: string;
    name: string;
    status: 'active' | 'completed' | 'paused';
    variants: Array<{
      id: string;
      name: string;
      traffic: number;
      conversions: number;
      conversionRate: number;
    }>;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d'; // 1d, 7d, 30d
    const metric = searchParams.get('metric'); // specific metric to fetch

    // Get booking metrics
    const bookingMetrics = bookingMonitor.getMetrics();
    
    // Calculate derived metrics
    const successRate = bookingMetrics.bookingAttempts > 0 
      ? (bookingMetrics.successfulBookings / bookingMetrics.bookingAttempts) * 100 
      : 0;
    
    const errorRate = bookingMetrics.bookingAttempts > 0
      ? (bookingMetrics.failedBookings / bookingMetrics.bookingAttempts) * 100
      : 0;

    // Get A/B test data
    const activeTests = abTesting.getActiveTests();
    const abTestData = activeTests.map(test => {
      const results = abTesting.getTestResults(test.id);
      
      return {
        testId: test.id,
        name: test.name,
        status: 'active' as const,
        variants: test.variants.map(variant => {
          const traffic = results.variantDistribution[variant.id] || 0;
          // In production, you'd calculate actual conversions from analytics data
          const conversions = Math.floor(traffic * 0.15); // Mock conversion data
          const conversionRate = traffic > 0 ? (conversions / traffic) * 100 : 0;
          
          return {
            id: variant.id,
            name: variant.name,
            traffic,
            conversions,
            conversionRate,
          };
        }),
      };
    });

    // Compile dashboard metrics
    const dashboardData: DashboardMetrics = {
      overview: {
        totalBookings: bookingMetrics.successfulBookings,
        conversionRate: successRate,
        averageOrderValue: 85, // This would come from actual booking data
        totalRevenue: bookingMetrics.successfulBookings * 85, // Mock calculation
      },
      performance: {
        averageResponseTime: bookingMetrics.averageResponseTime,
        successRate,
        availabilityChecks: bookingMetrics.availabilityChecks,
        errorRate,
      },
      userBehavior: {
        // In production, these would come from Google Analytics API
        pageViews: 3200,
        uniqueVisitors: 980,
        bounceRate: 35,
        averageSessionDuration: 180,
      },
      abTests: abTestData,
    };

    // Return specific metric if requested
    if (metric && metric in dashboardData) {
      return NextResponse.json({
        [metric]: dashboardData[metric as keyof DashboardMetrics]
      });
    }

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  }
}

// POST endpoint for updating analytics settings
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { action, testId, settings } = data;

    switch (action) {
      case 'pause_test':
        // In production, you'd update the test status in your database
        console.log(`Pausing A/B test: ${testId}`);
        break;
        
      case 'resume_test':
        console.log(`Resuming A/B test: ${testId}`);
        break;
        
      case 'update_settings':
        console.log(`Updating analytics settings:`, settings);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating analytics settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

// Helper function to fetch Google Analytics data (for production)
async function fetchGoogleAnalyticsData(timeRange: string) {
  // This would integrate with Google Analytics Reporting API
  // For now, return mock data
  
  return {
    pageViews: 3200,
    uniqueVisitors: 980,
    bounceRate: 35,
    averageSessionDuration: 180,
    topPages: [
      { page: '/en/tours/prague-castle', views: 450 },
      { page: '/en/tours/old-town', views: 380 },
      { page: '/en', views: 520 },
    ],
    conversionEvents: [
      { event: 'booking_button_click', count: 156 },
      { event: 'booking_flow_start', count: 89 },
      { event: 'purchase', count: 23 },
    ],
  };
}

// Helper function to calculate conversion funnel
function calculateConversionFunnel(bookingMetrics: any, analyticsData: any) {
  return {
    visitors: analyticsData.uniqueVisitors,
    tourPageViews: analyticsData.topPages
      .filter((page: any) => page.page.includes('/tours/'))
      .reduce((sum: number, page: any) => sum + page.views, 0),
    bookingClicks: analyticsData.conversionEvents
      .find((event: any) => event.event === 'booking_button_click')?.count || 0,
    bookingStarts: bookingMetrics.bookingAttempts,
    bookingCompletions: bookingMetrics.successfulBookings,
  };
}
