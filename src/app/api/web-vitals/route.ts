import { NextRequest, NextResponse } from 'next/server';

interface WebVitalsMetric {
  name: string;
  value: number;
  id: string;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType: string;
  url: string;
  userAgent: string;
  timestamp: number;
}

/**
 * API endpoint for collecting Web Vitals metrics
 * Used for performance monitoring and optimization
 */
export async function POST(request: NextRequest) {
  try {
    const metrics: WebVitalsMetric[] = await request.json();
    
    // Validate metrics data
    if (!Array.isArray(metrics) || metrics.length === 0) {
      return NextResponse.json(
        { error: 'Invalid metrics data' },
        { status: 400 }
      );
    }

    // Process each metric
    for (const metric of metrics) {
      // Log metrics in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 Web Vitals - ${metric.name}:`, {
          value: metric.value,
          rating: metric.rating,
          url: metric.url,
        });
      }

      // In production, you would send these to your analytics service
      // Examples: Google Analytics, Sentry, DataDog, etc.
      if (process.env.NODE_ENV === 'production') {
        await sendToAnalytics(metric);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Web Vitals metrics:', error);
    return NextResponse.json(
      { error: 'Failed to process metrics' },
      { status: 500 }
    );
  }
}

/**
 * Send metrics to analytics service
 */
async function sendToAnalytics(metric: WebVitalsMetric) {
  try {
    // Example: Send to Google Analytics 4
    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      await sendToGoogleAnalytics(metric);
    }

    // Example: Send to custom analytics endpoint
    if (process.env.ANALYTICS_ENDPOINT) {
      await sendToCustomAnalytics(metric);
    }

    // Example: Send to Sentry for performance monitoring
    if (process.env.SENTRY_DSN) {
      await sendToSentry(metric);
    }
  } catch (error) {
    console.error('Failed to send metric to analytics:', error);
  }
}

/**
 * Send metrics to Google Analytics 4
 */
async function sendToGoogleAnalytics(metric: WebVitalsMetric) {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const apiSecret = process.env.GA_API_SECRET;
  
  if (!measurementId || !apiSecret) {
    return;
  }

  const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`;
  
  const payload = {
    client_id: metric.id,
    events: [{
      name: 'web_vitals',
      params: {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_rating: metric.rating,
        page_location: metric.url,
      },
    }],
  };

  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

/**
 * Send metrics to custom analytics endpoint
 */
async function sendToCustomAnalytics(metric: WebVitalsMetric) {
  const endpoint = process.env.ANALYTICS_ENDPOINT;
  
  if (!endpoint) {
    return;
  }

  await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.ANALYTICS_API_KEY}`,
    },
    body: JSON.stringify({
      type: 'web_vitals',
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
      url: metric.url,
      timestamp: metric.timestamp,
      userAgent: metric.userAgent,
    }),
  });
}

/**
 * Send metrics to Sentry for performance monitoring
 */
async function sendToSentry(metric: WebVitalsMetric) {
  const sentryDsn = process.env.SENTRY_DSN;
  
  if (!sentryDsn) {
    return;
  }

  // This would typically use the Sentry SDK
  // For now, we'll just log the metric
  console.log(`Sentry Web Vitals - ${metric.name}:`, metric.value);
}

/**
 * GET endpoint for health check
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'web-vitals-collector',
  });
}
