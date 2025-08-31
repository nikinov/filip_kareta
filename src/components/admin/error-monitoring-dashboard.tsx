'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, AlertCircle, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    booking: {
      status: string;
      errorRate: number;
      averageResponseTime: number;
      issues: string[];
    };
    monitoring: {
      status: string;
      sentry: boolean;
    };
    api: {
      status: string;
    };
  };
  metrics: any;
}

interface ErrorSummary {
  summary: {
    totalErrors: number;
    timeRange: string;
    errorsByType: Record<string, { count: number; lastOccurrence: string }>;
  };
  recentErrors: Array<{
    type: string;
    error: string;
    timestamp: string;
    data: any;
  }>;
}

export function ErrorMonitoringDashboard() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [errors, setErrors] = useState<ErrorSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = async () => {
    setLoading(true);
    try {
      const [healthResponse, errorsResponse] = await Promise.all([
        fetch('/api/monitoring?type=health'),
        fetch('/api/monitoring?type=errors'),
      ]);

      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setHealth(healthData);
      }

      if (errorsResponse.ok) {
        const errorsData = await errorsResponse.json();
        setErrors(errorsData);
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'unhealthy':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="success">Healthy</Badge>;
      case 'degraded':
        return <Badge variant="warning">Degraded</Badge>;
      case 'unhealthy':
        return <Badge variant="destructive">Unhealthy</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading && !health) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">System Monitoring</h2>
          <div className="animate-pulse bg-gray-200 h-10 w-24 rounded"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="animate-pulse bg-gray-200 h-6 w-32 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse bg-gray-200 h-20 w-full rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Monitoring</h2>
          <p className="text-gray-600">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={fetchData} disabled={loading} variant="outline">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overall System Status */}
      {health && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(health.status)}
                System Status
              </CardTitle>
              {getStatusBadge(health.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-prague-600">
                  {health.services.booking.errorRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Error Rate (24h)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-prague-600">
                  {health.services.booking.averageResponseTime}ms
                </div>
                <div className="text-sm text-gray-600">Avg Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-prague-600">
                  {health.metrics.successfulBookings || 0}
                </div>
                <div className="text-sm text-gray-600">Successful Bookings</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Status */}
      {health && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(health.services.booking.status)}
                Booking System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Status:</span>
                  {getStatusBadge(health.services.booking.status)}
                </div>
                <div className="flex justify-between">
                  <span>Error Rate:</span>
                  <span className={health.services.booking.errorRate > 10 ? 'text-red-600' : 'text-green-600'}>
                    {health.services.booking.errorRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Response Time:</span>
                  <span className={health.services.booking.averageResponseTime > 3000 ? 'text-red-600' : 'text-green-600'}>
                    {health.services.booking.averageResponseTime}ms
                  </span>
                </div>
                {health.services.booking.issues.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-red-600 mb-1">Issues:</p>
                    <ul className="text-xs text-red-600 space-y-1">
                      {health.services.booking.issues.map((issue, index) => (
                        <li key={index}>• {issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(health.services.monitoring.status)}
                Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Status:</span>
                  {getStatusBadge(health.services.monitoring.status)}
                </div>
                <div className="flex justify-between">
                  <span>Sentry:</span>
                  <Badge variant={health.services.monitoring.sentry ? 'success' : 'destructive'}>
                    {health.services.monitoring.sentry ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(health.services.api.status)}
                API Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Status:</span>
                  {getStatusBadge(health.services.api.status)}
                </div>
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span className="text-green-600">
                    {Math.floor((health.metrics.uptime || 0) / 3600)}h
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Errors */}
      {errors && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Errors ({errors.summary.timeRange})</CardTitle>
            <CardDescription>
              Total: {errors.summary.totalErrors} errors
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errors.summary.totalErrors === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <p>No errors in the last {errors.summary.timeRange}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Error Types Summary */}
                <div>
                  <h4 className="font-semibold mb-3">Error Types:</h4>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(errors.summary.errorsByType).map(([type, data]) => (
                      <div key={type} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">{type}</span>
                        <Badge variant="destructive">{data.count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Error List */}
                <div>
                  <h4 className="font-semibold mb-3">Recent Errors:</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {errors.recentErrors.map((error, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-red-50 border-red-200">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="destructive" className="text-xs">
                            {error.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(error.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-red-900 mb-1">
                          {error.error}
                        </p>
                        {error.data && Object.keys(error.data).length > 0 && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-red-700 hover:text-red-900">
                              View Details
                            </summary>
                            <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-x-auto">
                              {JSON.stringify(error.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
