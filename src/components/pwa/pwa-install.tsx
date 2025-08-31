'use client';

// PWA installation and management component
// Handles app installation prompts and PWA features

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Smartphone, X, Wifi, WifiOff } from 'lucide-react';
import { mobileUtils } from '@/lib/mobile-interactions';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check if already installed
    setIsInstalled(mobileUtils.isPWA());
    setIsOnline(navigator.onLine);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install prompt after user has been on site for 30 seconds
      setTimeout(() => {
        if (!mobileUtils.isPWA()) {
          setShowInstallPrompt(true);
        }
      }, 30000);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      
      // Track installation
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'pwa_installed', {
          event_category: 'PWA',
          event_label: 'App Installation',
        });
      }
    };

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Install prompt failed:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or dismissed
  if (isInstalled || !showInstallPrompt || !deferredPrompt) {
    return null;
  }

  // Don't show if user already dismissed this session
  if (typeof window !== 'undefined' && sessionStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <Card className="shadow-lg border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Install App</CardTitle>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-gray-100 rounded"
              aria-label="Dismiss install prompt"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 mb-4">
            Install our app for a better experience with offline access to tour information!
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="text-xs">
              <Wifi className="h-3 w-3 mr-1" />
              Offline Access
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Download className="h-3 w-3 mr-1" />
              Fast Loading
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Smartphone className="h-3 w-3 mr-1" />
              Native Feel
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleInstallClick}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Install App
            </Button>
            <Button 
              onClick={handleDismiss}
              variant="outline"
              size="sm"
            >
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// PWA status indicator
export function PWAStatus() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    setIsInstalled(mobileUtils.isPWA());
    setIsOnline(navigator.onLine);

    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setUpdateAvailable(true);
      });
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
  };

  if (!isInstalled) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-40">
      <div className="flex flex-col gap-2">
        {/* Online/Offline status */}
        <Badge 
          variant={isOnline ? "default" : "destructive"}
          className="text-xs"
        >
          {isOnline ? (
            <>
              <Wifi className="h-3 w-3 mr-1" />
              Online
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 mr-1" />
              Offline
            </>
          )}
        </Badge>

        {/* Update available notification */}
        {updateAvailable && (
          <Button
            onClick={handleUpdate}
            size="sm"
            className="text-xs"
          >
            Update Available
          </Button>
        )}
      </div>
    </div>
  );
}

// PWA features component
export function PWAFeatures() {
  const [capabilities, setCapabilities] = useState({
    canInstall: false,
    isInstalled: false,
    supportsNotifications: false,
    supportsBackgroundSync: false,
    supportsShare: false,
  });

  useEffect(() => {
    setCapabilities({
      canInstall: mobileUtils.canInstallPWA(),
      isInstalled: mobileUtils.isPWA(),
      supportsNotifications: 'Notification' in window,
      supportsBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      supportsShare: 'share' in navigator,
    });
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      new Notification('Notifications enabled!', {
        body: 'You\'ll receive updates about your bookings and new tours.',
        icon: '/images/icon-192x192.png',
        badge: '/images/icon-72x72.png',
      });
    }
  };

  const shareApp = async () => {
    if (!navigator.share) {
      // Fallback for browsers without Web Share API
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
      return;
    }

    try {
      await navigator.share({
        title: 'Filip Kareta - Prague Tour Guide',
        text: 'Discover Prague through authentic storytelling tours',
        url: window.location.href,
      });
    } catch (error) {
      console.log('Share cancelled or failed:', error);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          App Features
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
              capabilities.isInstalled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              <Download className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium">
              {capabilities.isInstalled ? 'Installed' : 'Install App'}
            </p>
          </div>

          <div className="text-center">
            <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
              capabilities.supportsNotifications ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
            }`}>
              <Wifi className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium">Notifications</p>
          </div>
        </div>

        <div className="space-y-2">
          {capabilities.supportsNotifications && (
            <Button
              onClick={requestNotificationPermission}
              variant="outline"
              className="w-full"
              size="sm"
            >
              Enable Notifications
            </Button>
          )}

          {capabilities.supportsShare && (
            <Button
              onClick={shareApp}
              variant="outline"
              className="w-full"
              size="sm"
            >
              Share App
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>✅ Offline tour browsing</p>
          <p>✅ Fast loading with caching</p>
          <p>✅ Native app experience</p>
          <p>✅ Background updates</p>
        </div>
      </CardContent>
    </Card>
  );
}
