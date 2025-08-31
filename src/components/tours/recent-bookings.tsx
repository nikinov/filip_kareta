import { Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface RecentBookingsProps {
  tourId: string;
  locale: string;
}

export function RecentBookings({ tourId: _tourId, locale: _locale }: RecentBookingsProps) {
  // Mock data - in a real app, this would come from an API
  const recentBookings = [
    { id: 1, customerName: 'Sarah M.', timeAgo: '2 hours ago', groupSize: 2 },
    { id: 2, customerName: 'Michael K.', timeAgo: '5 hours ago', groupSize: 4 },
    { id: 3, customerName: 'Emma L.', timeAgo: '1 day ago', groupSize: 1 },
  ];

  const getTimeAgoText = (timeAgo: string) => {
    const _translations = {
      en: {
        'hours ago': 'hours ago',
        'day ago': 'day ago',
        'days ago': 'days ago',
      },
      de: {
        'hours ago': 'Stunden her',
        'day ago': 'Tag her',
        'days ago': 'Tage her',
      },
      fr: {
        'hours ago': 'heures',
        'day ago': 'jour',
        'days ago': 'jours',
      },
    };

    // Simple translation logic - in a real app, use proper i18n
    return timeAgo;
  };

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Recent Bookings
      </h3>
      
      <div className="space-y-3">
        {recentBookings.map((booking) => (
          <div key={booking.id} className="flex items-center justify-between text-sm">
            <div>
              <p className="font-medium text-gray-900">{booking.customerName}</p>
              <p className="text-gray-500">{getTimeAgoText(booking.timeAgo)}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-600">
                {booking.groupSize} {booking.groupSize === 1 ? 'person' : 'people'}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Join {Math.floor(Math.random() * 50) + 100}+ happy travelers this month
        </p>
      </div>
    </Card>
  );
}