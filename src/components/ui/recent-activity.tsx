'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Star, CheckCircle } from 'lucide-react';

interface RecentActivity {
  id: string;
  type: 'booking' | 'review' | 'inquiry';
  message: string;
  timestamp: Date;
  tourId?: string;
  customerName?: string;
  rating?: number;
}

interface RecentActivityProps {
  tourId?: string;
  limit?: number;
  className?: string;
  showTimestamps?: boolean;
}

export function RecentActivity({ 
  tourId, 
  limit = 5, 
  className = '',
  showTimestamps = true 
}: RecentActivityProps) {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate recent activity data
    // In a real implementation, this would fetch from your booking/review APIs
    const generateMockActivity = (): RecentActivity[] => {
      const now = new Date();
      const activities: RecentActivity[] = [];
      
      // Generate some recent bookings
      for (let i = 0; i < 3; i++) {
        const hoursAgo = Math.floor(Math.random() * 24) + 1;
        const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
        
        activities.push({
          id: `booking-${i}`,
          type: 'booking',
          message: `${getRandomName()} booked a tour`,
          timestamp,
          tourId: tourId || getRandomTourId(),
          customerName: getRandomName()
        });
      }
      
      // Generate some recent reviews
      for (let i = 0; i < 2; i++) {
        const daysAgo = Math.floor(Math.random() * 7) + 1;
        const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        
        activities.push({
          id: `review-${i}`,
          type: 'review',
          message: `${getRandomName()} left a ${4 + Math.round(Math.random())}★ review`,
          timestamp,
          tourId: tourId || getRandomTourId(),
          customerName: getRandomName(),
          rating: 4 + Math.round(Math.random())
        });
      }
      
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
    };

    setTimeout(() => {
      setActivities(generateMockActivity());
      setLoading(false);
    }, 500);
  }, [tourId, limit]);

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'booking':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'review':
        return <Star className="w-4 h-4 text-yellow-600" />;
      case 'inquiry':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityBadgeColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'booking':
        return 'bg-blue-100 text-blue-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'inquiry':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (date: Date | string): string => {
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;

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
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {Array.from({ length: limit }, (_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-gray-900">{activity.message}</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getActivityBadgeColor(activity.type)}`}
                  >
                    {activity.type}
                  </Badge>
                </div>
                {showTimestamps && (
                  <div className="text-xs text-gray-500">
                    {formatTimeAgo(activity.timestamp)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper functions for mock data
function getRandomName(): string {
  const names = ['Sarah M.', 'Michael K.', 'Emma L.', 'David R.', 'Lisa T.', 'Thomas B.', 'Anna S.', 'James W.'];
  return names[Math.floor(Math.random() * names.length)];
}

function getRandomTourId(): string {
  const tours = ['prague-castle-tour', 'old-town-tour', 'jewish-quarter-tour'];
  return tours[Math.floor(Math.random() * tours.length)];
}
