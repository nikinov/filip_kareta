import { NextRequest, NextResponse } from 'next/server';

export interface AnalyticsData {
  event_name: string;
  timestamp: string;
  user_id?: string;
  session_id?: string;
  page_url: string;
  page_title: string;
  user_agent: string;
  referrer?: string;
  parameters: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const data: AnalyticsData = await request.json();

    // Validate required fields
    if (!data.event_name || !data.page_url) {
      return NextResponse.json(
        { error: 'Missing required fields: event_name, page_url' },
        { status: 400 }
      );
    }

    // Process analytics data
    await processAnalyticsEvent(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing analytics event:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics event' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Get analytics data based on parameters
    const data = await getAnalyticsData(metric, startDate, endDate);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

async function processAnalyticsEvent(data: AnalyticsData) {
  // In production, you would:
  // 1. Store in database for custom analytics
  // 2. Send to Google Analytics via Measurement Protocol
  // 3. Send to other analytics services (Mixpanel, Amplitude, etc.)

  // Log for development
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Analytics Event:', {
      event: data.event_name,
      page: data.page_url,
      parameters: data.parameters,
      timestamp: data.timestamp,
    });
  }

  // Send to Google Analytics 4 via Measurement Protocol
  if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && process.env.GA_API_SECRET) {
    await sendToGoogleAnalytics(data);
  }

  // Send to custom analytics endpoint
  if (process.env.ANALYTICS_ENDPOINT) {
    await sendToCustomAnalytics(data);
  }
}

async function sendToGoogleAnalytics(data: AnalyticsData) {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const apiSecret = process.env.GA_API_SECRET;

  if (!measurementId || !apiSecret) return;

  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;

  const payload = {
    client_id: data.user_id || 'anonymous',
    events: [{
      name: data.event_name,
      params: {
        page_location: data.page_url,
        page_title: data.page_title,
        page_referrer: data.referrer,
        ...data.parameters,
      },
    }],
  };

  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Failed to send event to Google Analytics:', error);
  }
}

async function sendToCustomAnalytics(data: AnalyticsData) {
  const endpoint = process.env.ANALYTICS_ENDPOINT;
  const apiKey = process.env.ANALYTICS_API_KEY;

  if (!endpoint) return;

  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
      },
      body: JSON.stringify({
        type: 'custom_event',
        event_name: data.event_name,
        timestamp: data.timestamp,
        user_id: data.user_id,
        session_id: data.session_id,
        page_url: data.page_url,
        page_title: data.page_title,
        user_agent: data.user_agent,
        referrer: data.referrer,
        parameters: data.parameters,
      }),
    });
  } catch (error) {
    console.error('Failed to send event to custom analytics:', error);
  }
}

async function getAnalyticsData(metric?: string | null, startDate?: string | null, endDate?: string | null) {
  // In production, this would query your analytics database
  // For now, return mock data structure

  const mockData = {
    overview: {
      total_visitors: 1250,
      unique_visitors: 980,
      page_views: 3200,
      bounce_rate: 0.35,
      avg_session_duration: 180, // seconds
    },
    conversions: {
      booking_button_clicks: 156,
      booking_flow_starts: 89,
      booking_completions: 23,
      conversion_rate: 0.018, // 1.8%
      total_revenue: 1955, // EUR
    },
    top_pages: [
      { page: '/en/tours/prague-castle', views: 450, conversions: 8 },
      { page: '/en/tours/old-town', views: 380, conversions: 6 },
      { page: '/en/tours/jewish-quarter', views: 290, conversions: 4 },
      { page: '/en', views: 520, conversions: 3 },
      { page: '/en/blog/best-prague-restaurants', views: 180, conversions: 1 },
    ],
    traffic_sources: [
      { source: 'organic_search', visitors: 650, percentage: 52.0 },
      { source: 'direct', visitors: 312, percentage: 25.0 },
      { source: 'social_media', visitors: 188, percentage: 15.0 },
      { source: 'referral', visitors: 100, percentage: 8.0 },
    ],
    devices: [
      { device: 'mobile', visitors: 750, percentage: 60.0 },
      { device: 'desktop', visitors: 375, percentage: 30.0 },
      { device: 'tablet', visitors: 125, percentage: 10.0 },
    ],
    countries: [
      { country: 'United States', visitors: 425, percentage: 34.0 },
      { country: 'Germany', visitors: 300, percentage: 24.0 },
      { country: 'United Kingdom', visitors: 200, percentage: 16.0 },
      { country: 'France', visitors: 150, percentage: 12.0 },
      { country: 'Other', visitors: 175, percentage: 14.0 },
    ],
  };

  // Filter data based on metric parameter
  if (metric) {
    return { [metric]: mockData[metric as keyof typeof mockData] };
  }

  return mockData;
}
