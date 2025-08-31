// Booking system monitoring and error tracking utilities

export interface BookingMetrics {
  bookingAttempts: number;
  successfulBookings: number;
  failedBookings: number;
  availabilityChecks: number;
  cancellations: number;
  averageResponseTime: number;
}

export interface BookingEvent {
  type: 'booking_created' | 'booking_failed' | 'availability_checked' | 'booking_cancelled';
  timestamp: Date;
  data: Record<string, any>;
  duration?: number;
  error?: string;
}

class BookingMonitor {
  private events: BookingEvent[] = [];
  private metrics: BookingMetrics = {
    bookingAttempts: 0,
    successfulBookings: 0,
    failedBookings: 0,
    availabilityChecks: 0,
    cancellations: 0,
    averageResponseTime: 0,
  };

  // Track booking events
  trackEvent(event: Omit<BookingEvent, 'timestamp'>) {
    const fullEvent: BookingEvent = {
      ...event,
      timestamp: new Date(),
    };

    this.events.push(fullEvent);
    this.updateMetrics(fullEvent);

    // In production, send to monitoring service (e.g., Sentry, DataDog)
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(fullEvent);
    }

    // Keep only last 1000 events in memory
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
  }

  // Track booking attempt
  trackBookingAttempt(data: { tourId: string; date: string; groupSize: number }) {
    this.trackEvent({
      type: 'booking_created',
      data,
    });
  }

  // Track booking success
  trackBookingSuccess(data: { bookingId: string; tourId: string; totalPrice: number }, duration: number) {
    this.trackEvent({
      type: 'booking_created',
      data: { ...data, success: true },
      duration,
    });
  }

  // Track booking failure
  trackBookingFailure(data: { tourId: string; error: string; errorCode: string }, duration: number) {
    this.trackEvent({
      type: 'booking_failed',
      data,
      duration,
      error: data.error,
    });
  }

  // Track availability check
  trackAvailabilityCheck(data: { tourId: string; date: string; available: boolean }, duration: number) {
    this.trackEvent({
      type: 'availability_checked',
      data,
      duration,
    });
  }

  // Track cancellation
  trackCancellation(data: { bookingId: string; refundAmount: number; reason?: string }) {
    this.trackEvent({
      type: 'booking_cancelled',
      data,
    });
  }

  // Get current metrics
  getMetrics(): BookingMetrics {
    return { ...this.metrics };
  }

  // Get recent events
  getRecentEvents(limit: number = 100): BookingEvent[] {
    return this.events.slice(-limit);
  }

  // Get events by type
  getEventsByType(type: BookingEvent['type'], limit: number = 50): BookingEvent[] {
    return this.events
      .filter(event => event.type === type)
      .slice(-limit);
  }

  // Get error rate for a time period
  getErrorRate(periodMinutes: number = 60): number {
    const cutoff = new Date(Date.now() - periodMinutes * 60 * 1000);
    const recentEvents = this.events.filter(event => event.timestamp > cutoff);
    
    if (recentEvents.length === 0) return 0;
    
    const errorEvents = recentEvents.filter(event => event.error);
    return (errorEvents.length / recentEvents.length) * 100;
  }

  // Check system health
  getSystemHealth(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    errorRate: number;
    averageResponseTime: number;
    issues: string[];
  } {
    const errorRate = this.getErrorRate(30); // Last 30 minutes
    const issues: string[] = [];
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    // Check error rate
    if (errorRate > 50) {
      status = 'unhealthy';
      issues.push(`High error rate: ${errorRate.toFixed(1)}%`);
    } else if (errorRate > 20) {
      status = 'degraded';
      issues.push(`Elevated error rate: ${errorRate.toFixed(1)}%`);
    }

    // Check response time
    if (this.metrics.averageResponseTime > 5000) {
      status = status === 'healthy' ? 'degraded' : 'unhealthy';
      issues.push(`Slow response time: ${this.metrics.averageResponseTime}ms`);
    }

    return {
      status,
      errorRate,
      averageResponseTime: this.metrics.averageResponseTime,
      issues,
    };
  }

  private updateMetrics(event: BookingEvent) {
    switch (event.type) {
      case 'booking_created':
        this.metrics.bookingAttempts++;
        if (!event.error) {
          this.metrics.successfulBookings++;
        } else {
          this.metrics.failedBookings++;
        }
        break;
      case 'booking_failed':
        this.metrics.failedBookings++;
        break;
      case 'availability_checked':
        this.metrics.availabilityChecks++;
        break;
      case 'booking_cancelled':
        this.metrics.cancellations++;
        break;
    }

    // Update average response time
    if (event.duration) {
      const totalEvents = this.metrics.bookingAttempts + this.metrics.availabilityChecks;
      this.metrics.averageResponseTime = 
        (this.metrics.averageResponseTime * (totalEvents - 1) + event.duration) / totalEvents;
    }
  }

  private sendToMonitoringService(event: BookingEvent) {
    // Send to Sentry if error occurred
    if (event.error) {
      try {
        // Import Sentry dynamically to avoid issues
        import('@/lib/sentry').then(({ ErrorReporting }) => {
          ErrorReporting.bookingError(new Error(event.error!), {
            step: event.type,
            tourId: event.data?.tourId,
            timestamp: event.timestamp,
            duration: event.duration,
          });
        });
      } catch (sentryError) {
        console.error('Failed to send to Sentry:', sentryError);
      }
    }

    // Log to structured logging service
    console.log('Booking event:', {
      type: event.type,
      timestamp: event.timestamp.toISOString(),
      data: event.data,
      duration: event.duration,
      error: event.error,
      level: event.error ? 'error' : 'info',
    });

    // Send to external monitoring services if configured
    if (process.env.DATADOG_API_KEY) {
      this.sendToDatadog(event);
    }

    if (process.env.NEW_RELIC_LICENSE_KEY) {
      this.sendToNewRelic(event);
    }
  }

  private sendToDatadog(event: BookingEvent) {
    // Example DataDog integration
    // In production, this would use the DataDog SDK
    console.log('DataDog event:', event);
  }

  private sendToNewRelic(event: BookingEvent) {
    // Example New Relic integration
    // In production, this would use the New Relic SDK
    console.log('New Relic event:', event);
  }
}

// Singleton instance
export const bookingMonitor = new BookingMonitor();

// Performance measurement utility
export function measurePerformance<T>(
  operation: () => Promise<T>,
  eventType: BookingEvent['type'],
  data: Record<string, any>
): Promise<T> {
  const startTime = Date.now();
  
  return operation()
    .then(result => {
      const duration = Date.now() - startTime;
      bookingMonitor.trackEvent({
        type: eventType,
        data: { ...data, success: true },
        duration,
      });
      return result;
    })
    .catch(error => {
      const duration = Date.now() - startTime;
      bookingMonitor.trackEvent({
        type: eventType,
        data: { ...data, success: false },
        duration,
        error: error.message,
      });
      throw error;
    });
}

// Health check endpoint data
export function getHealthCheckData() {
  const health = bookingMonitor.getSystemHealth();
  const metrics = bookingMonitor.getMetrics();
  
  return {
    timestamp: new Date().toISOString(),
    status: health.status,
    metrics: {
      totalBookings: metrics.successfulBookings,
      failedBookings: metrics.failedBookings,
      successRate: metrics.bookingAttempts > 0 
        ? ((metrics.successfulBookings / metrics.bookingAttempts) * 100).toFixed(1) + '%'
        : 'N/A',
      availabilityChecks: metrics.availabilityChecks,
      cancellations: metrics.cancellations,
      averageResponseTime: Math.round(metrics.averageResponseTime) + 'ms',
    },
    health: {
      errorRate: health.errorRate.toFixed(1) + '%',
      issues: health.issues,
    },
    uptime: process.uptime(),
  };
}

// Alert thresholds and notifications
export class BookingAlerts {
  private static readonly ERROR_RATE_THRESHOLD = 25; // 25%
  private static readonly RESPONSE_TIME_THRESHOLD = 3000; // 3 seconds
  private static readonly CONSECUTIVE_FAILURES_THRESHOLD = 5;

  private static consecutiveFailures = 0;
  private static lastAlertTime = 0;
  private static readonly ALERT_COOLDOWN = 5 * 60 * 1000; // 5 minutes

  static checkAlerts() {
    const health = bookingMonitor.getSystemHealth();
    const now = Date.now();

    // Avoid spam alerts
    if (now - this.lastAlertTime < this.ALERT_COOLDOWN) {
      return;
    }

    // High error rate alert
    if (health.errorRate > this.ERROR_RATE_THRESHOLD) {
      this.sendAlert('HIGH_ERROR_RATE', {
        errorRate: health.errorRate,
        threshold: this.ERROR_RATE_THRESHOLD,
      });
      this.lastAlertTime = now;
    }

    // Slow response time alert
    if (health.averageResponseTime > this.RESPONSE_TIME_THRESHOLD) {
      this.sendAlert('SLOW_RESPONSE_TIME', {
        responseTime: health.averageResponseTime,
        threshold: this.RESPONSE_TIME_THRESHOLD,
      });
      this.lastAlertTime = now;
    }

    // System unhealthy alert
    if (health.status === 'unhealthy') {
      this.sendAlert('SYSTEM_UNHEALTHY', {
        issues: health.issues,
        status: health.status,
      });
      this.lastAlertTime = now;
    }
  }

  static trackFailure() {
    this.consecutiveFailures++;
    
    if (this.consecutiveFailures >= this.CONSECUTIVE_FAILURES_THRESHOLD) {
      const now = Date.now();
      if (now - this.lastAlertTime >= this.ALERT_COOLDOWN) {
        this.sendAlert('CONSECUTIVE_FAILURES', {
          failures: this.consecutiveFailures,
          threshold: this.CONSECUTIVE_FAILURES_THRESHOLD,
        });
        this.lastAlertTime = now;
      }
    }
  }

  static trackSuccess() {
    this.consecutiveFailures = 0;
  }

  private static sendAlert(type: string, data: Record<string, any>) {
    // In production, send to alerting service (PagerDuty, Slack, email, etc.)
    console.error(`BOOKING SYSTEM ALERT [${type}]:`, data);
    
    // Example: Send to Slack webhook
    if (process.env.SLACK_WEBHOOK_URL) {
      // Implementation would go here
    }
    
    // Example: Send email alert
    if (process.env.ALERT_EMAIL) {
      // Implementation would go here
    }
  }
}