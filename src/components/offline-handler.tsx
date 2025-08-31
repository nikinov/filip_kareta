'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import * as m from '@/paraglide/messages';

interface OfflineData {
  tours: any[];
  bookingDrafts: any[];
  lastSync: string;
}

export function OfflineHandler({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncOfflineData = async () => {
    try {
      const offlineData = getOfflineData();
      if (offlineData.bookingDrafts.length > 0) {
        // Attempt to sync booking drafts
        await syncBookingDrafts(offlineData.bookingDrafts);
      }
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  };

  if (showOfflineMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
              <WifiOff className="h-8 w-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl">
              {m.offlineTitle()}
            </CardTitle>
            <CardDescription className="text-base">
              {m.offlineDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">
                    {m.offlineFeatures()}
                  </p>
                  <ul className="text-blue-800 space-y-1">
                    <li>• {m.offlineBrowseTours()}</li>
                    <li>• {m.offlineReadBlog()}</li>
                    <li>• {m.offlineViewPhotos()}</li>
                    <li>• {m.offlineContactInfo()}</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => window.location.reload()}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {m.offlineCheckConnection()}
            </Button>

            <div className="text-center text-sm text-gray-600">
              <p>
                {m.offlineEmergencyContact()}
              </p>
              <a 
                href="tel:+420123456789" 
                className="font-semibold text-prague-600 hover:underline"
              >
                +420 123 456 789
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {children}
      {!isOnline && (
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="w-80 shadow-lg border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <WifiOff className="h-5 w-5 text-orange-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-900">
                    {m.offlineConnectionLost()}
                  </p>
                  <p className="text-xs text-orange-700">
                    {m.offlineLimitedFunctionality()}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setShowOfflineMessage(false)}
                  className="text-orange-600 hover:text-orange-800"
                >
                  ×
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

// Offline data management utilities
function getOfflineData(): OfflineData {
  if (typeof window === 'undefined') {
    return { tours: [], bookingDrafts: [], lastSync: '' };
  }

  try {
    const data = localStorage.getItem('prague-tours-offline');
    return data ? JSON.parse(data) : { tours: [], bookingDrafts: [], lastSync: '' };
  } catch (error) {
    console.error('Failed to get offline data:', error);
    return { tours: [], bookingDrafts: [], lastSync: '' };
  }
}

function setOfflineData(data: OfflineData) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('prague-tours-offline', JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save offline data:', error);
  }
}

export function cacheForOffline(key: string, data: any) {
  const offlineData = getOfflineData();
  
  switch (key) {
    case 'tours':
      offlineData.tours = data;
      break;
    default:
      // Store in a generic cache
      (offlineData as any)[key] = data;
  }
  
  offlineData.lastSync = new Date().toISOString();
  setOfflineData(offlineData);
}

export function getOfflineCache(key: string) {
  const offlineData = getOfflineData();
  return (offlineData as any)[key] || null;
}

export function saveBookingDraft(bookingData: any) {
  const offlineData = getOfflineData();
  const draftId = `draft_${Date.now()}`;
  
  offlineData.bookingDrafts.push({
    id: draftId,
    data: bookingData,
    timestamp: new Date().toISOString(),
  });
  
  setOfflineData(offlineData);
  return draftId;
}

async function syncBookingDrafts(drafts: any[]) {
  for (const draft of drafts) {
    try {
      // Attempt to submit the booking draft
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft.data),
      });

      if (response.ok) {
        // Remove successfully synced draft
        const offlineData = getOfflineData();
        offlineData.bookingDrafts = offlineData.bookingDrafts.filter(
          d => d.id !== draft.id
        );
        setOfflineData(offlineData);
      }
    } catch (error) {
      console.error('Failed to sync booking draft:', error);
    }
  }
}

// Hook for offline-aware data fetching
export function useOfflineAwareFetch<T>(
  url: string,
  cacheKey: string,
  options?: RequestInit
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to fetch from network first
        if (navigator.onLine) {
          const response = await fetch(url, options);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          
          const result = await response.json();
          setData(result);
          setIsFromCache(false);
          
          // Cache the successful response
          cacheForOffline(cacheKey, result);
        } else {
          throw new Error('Offline');
        }
      } catch (fetchError) {
        // Fall back to cached data
        const cachedData = getOfflineCache(cacheKey);
        if (cachedData) {
          setData(cachedData);
          setIsFromCache(true);
          setError(null);
        } else {
          setError(fetchError as Error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, cacheKey]);

  return { data, loading, error, isFromCache };
}

// Service Worker registration for offline functionality
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });
}
