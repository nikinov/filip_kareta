'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Star, Users, Clock } from 'lucide-react';
import type { TrustSignal } from '@/lib/review-aggregation';

interface TrustSignalsProps {
  tourId?: string;
  className?: string;
  variant?: 'compact' | 'full';
}

export function TrustSignals({ tourId, className = '', variant = 'compact' }: TrustSignalsProps) {
  const [signals, setSignals] = useState<TrustSignal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrustSignals() {
      try {
        const response = await fetch(`/api/reviews/trust-signals${tourId ? `?tourId=${tourId}` : ''}`);
        if (response.ok) {
          const data = await response.json();
          setSignals(data.signals || []);
        }
      } catch (error) {
        console.error('Failed to fetch trust signals:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTrustSignals();
  }, [tourId]);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded-full w-24"></div>
          <div className="h-6 bg-gray-200 rounded-full w-32"></div>
        </div>
      </div>
    );
  }

  if (signals.length === 0) {
    return null;
  }

  const getSignalIcon = (type: TrustSignal['type']) => {
    switch (type) {
      case 'recent_booking':
        return <Users className="w-4 h-4" />;
      case 'review_count':
        return <Star className="w-4 h-4" />;
      case 'rating_badge':
        return <Star className="w-4 h-4 fill-current" />;
      case 'verification':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getSignalColor = (type: TrustSignal['type'], priority: TrustSignal['priority']) => {
    if (priority === 'high') {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (type === 'recent_booking') {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (type === 'rating_badge') {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {signals.slice(0, 3).map((signal, index) => (
          <Badge
            key={index}
            variant="outline"
            className={`flex items-center gap-1 text-xs ${getSignalColor(signal.type, signal.priority)}`}
          >
            {getSignalIcon(signal.type)}
            {signal.message}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          Trust & Safety
        </h3>
        <div className="space-y-2">
          {signals.map((signal, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm"
            >
              <div className={`p-1 rounded ${getSignalColor(signal.type, signal.priority)}`}>
                {getSignalIcon(signal.type)}
              </div>
              <span className="text-gray-700">{signal.message}</span>
              {signal.timestamp && (
                <span className="text-gray-500 text-xs ml-auto">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {formatTimeAgo(signal.timestamp)}
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function formatTimeAgo(date: Date | string | undefined): string {
  if (!date) return 'recently';

  const now = new Date();
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Fallback if date is invalid
  if (!dateObj || isNaN(dateObj.getTime())) {
    return 'recently';
  }

  const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}
