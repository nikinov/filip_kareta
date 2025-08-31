// Error monitoring and system health API endpoint
import { NextRequest, NextResponse } from 'next/server';
import { bookingMonitor } from '@/lib/booking-monitoring';
import { sentry } from '@/lib/sentry';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'health';

    switch (type) {
      case 'health':
        return getSystemHealth();
      case 'errors':
        return getErrorSummary();
      case 'performance':
        return getPerformanceMetrics();
      default:
        return NextResponse.json(
          { error: 'Invalid monitoring type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Monitoring endpoint error:', error);
    return NextResponse.json(
      { error: 'Monitoring service unavailable' },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    switch (type) {
      case 'client_error':
        return handleClientError(data);
      case 'performance_metric':
        return handlePerformanceMetric(data);
      case 'user_feedback':
        return handleUserFeedback(data);
      default:
        return NextResponse.json(
          { error: 'Invalid monitoring event type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Monitoring event handling error:', error);
    return NextResponse.json(
      { error: 'Failed to process monitoring event' },
      { status: 500 }
    );
  }
}

async function getSystemHealth() {
  const bookingHealth = bookingMonitor.getSystemHealth();
  const sentryConfigured = sentry.isConfigured();
  
  const overallStatus = bookingHealth.status === 'unhealthy' ? 'unhealthy' :
                       bookingHealth.status === 'degraded' ? 'degraded' : 'healthy';

  return NextResponse.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    services: {
      booking: {
        status: bookingHealth.status,
        errorRate: bookingHealth.errorRate,
        averageResponseTime: bookingHealth.averageResponseTime,
        issues: bookingHealth.issues,
      },
      monitoring: {
        status: sentryConfigured ? 'healthy' : 'degraded',
        sentry: sentryConfigured,
      },
      api: {
        status: 'healthy', // This endpoint is responding
      },
    },
    metrics: bookingMonitor.getMetrics(),
  });
}

async function getErrorSummary() {
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentEvents = bookingMonitor.getEvents().filter(
    event => event.timestamp > last24Hours && event.error
  );

  const errorsByType = recentEvents.reduce((acc, event) => {
    const errorType = event.type;
    if (!acc[errorType]) {
      acc[errorType] = { count: 0, lastOccurrence: event.timestamp };
    }
    acc[errorType].count++;
    if (event.timestamp > acc[errorType].lastOccurrence) {
      acc[errorType].lastOccurrence = event.timestamp;
    }
    return acc;
  }, {} as Record<string, { count: number; lastOccurrence: Date }>);

  return NextResponse.json({
    summary: {
      totalErrors: recentEvents.length,
      timeRange: '24 hours',
      errorsByType,
    },
    recentErrors: recentEvents.slice(-10).map(event => ({
      type: event.type,
      error: event.error,
      timestamp: event.timestamp,
      data: event.data,
    })),
  });
}

async function getPerformanceMetrics() {
  const metrics = bookingMonitor.getMetrics();
  
  return NextResponse.json({
    booking: {
      averageResponseTime: metrics.averageResponseTime,
      successRate: metrics.bookingAttempts > 0 
        ? (metrics.successfulBookings / metrics.bookingAttempts) * 100 
        : 0,
      totalBookings: metrics.successfulBookings,
      failedBookings: metrics.failedBookings,
    },
    system: {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
    },
  });
}

async function handleClientError(data: any) {
  // Log client-side error
  sentry.captureException(new Error(data.message), {
    tags: { 
      error_type: 'client_error',
      page: data.page,
      userAgent: data.userAgent,
    },
    extra: {
      stack: data.stack,
      url: data.url,
      timestamp: data.timestamp,
      userId: data.userId,
    },
  });

  return NextResponse.json({ success: true });
}

async function handlePerformanceMetric(data: any) {
  // Log performance metric
  if (data.value > data.threshold) {
    sentry.captureMessage(
      `Performance threshold exceeded: ${data.name}`,
      'warning',
      {
        tags: { error_type: 'performance' },
        extra: {
          metric: data.name,
          value: data.value,
          threshold: data.threshold,
          page: data.page,
        },
      }
    );
  }

  return NextResponse.json({ success: true });
}

async function handleUserFeedback(data: any) {
  // Log user feedback about errors
  sentry.captureMessage(
    `User feedback: ${data.message}`,
    'info',
    {
      tags: { 
        error_type: 'user_feedback',
        feedback_type: data.type,
      },
      extra: {
        userMessage: data.message,
        page: data.page,
        errorId: data.errorId,
        userEmail: data.email,
      },
    }
  );

  return NextResponse.json({ success: true });
}
