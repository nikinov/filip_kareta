// PWA configuration and utilities
// Manages Progressive Web App features and mobile optimizations

'use client';

export interface PWAConfig {
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  orientation: 'portrait' | 'landscape' | 'any';
  scope: string;
  startUrl: string;
}

export interface NotificationConfig {
  title: string;
  body: string;
  icon: string;
  badge: string;
  tag: string;
  requireInteraction: boolean;
  vibrate: number[];
  actions: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

// PWA configuration
export const PWA_CONFIG: PWAConfig = {
  name: 'Filip Kareta - Prague Tour Guide',
  shortName: 'Prague Tours',
  description: 'Discover Prague through authentic storytelling tours with Filip Kareta',
  themeColor: '#3b82f6',
  backgroundColor: '#ffffff',
  display: 'standalone',
  orientation: 'portrait',
  scope: '/',
  startUrl: '/',
};

// Service worker utilities
export class PWAManager {
  private static registration: ServiceWorkerRegistration | null = null;
  private static updateAvailable = false;

  // Initialize PWA features
  static async initialize(): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return false;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });

      console.log('Service Worker registered successfully');

      // Set up update detection
      this.setupUpdateDetection();

      // Set up background sync
      this.setupBackgroundSync();

      // Set up push notifications
      this.setupPushNotifications();

      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  // Set up update detection
  private static setupUpdateDetection(): void {
    if (!this.registration) return;

    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration!.installing;
      
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this.updateAvailable = true;
            this.notifyUpdateAvailable();
          }
        });
      }
    });

    // Check for waiting service worker
    if (this.registration.waiting) {
      this.updateAvailable = true;
      this.notifyUpdateAvailable();
    }
  }

  // Notify about available updates
  private static notifyUpdateAvailable(): void {
    const event = new CustomEvent('pwa-update-available', {
      detail: { registration: this.registration }
    });
    window.dispatchEvent(event);
  }

  // Apply pending updates
  static async applyUpdate(): Promise<void> {
    if (!this.registration?.waiting) return;

    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // Wait for controller change
    return new Promise((resolve) => {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        resolve();
      });
    });
  }

  // Set up background sync
  private static setupBackgroundSync(): void {
    if (!this.registration || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      return;
    }

    // Register sync events for offline actions
    window.addEventListener('online', () => {
      this.registration!.sync.register('background-sync');
    });
  }

  // Set up push notifications
  private static setupPushNotifications(): void {
    if (!this.registration || !('PushManager' in window)) {
      return;
    }

    // Check current subscription status
    this.registration.pushManager.getSubscription().then((subscription) => {
      if (subscription) {
        console.log('Push notifications already subscribed');
      }
    });
  }

  // Request notification permission
  static async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Subscribe to push notifications
  static async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration || !('PushManager' in window)) {
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        ),
      });

      console.log('Push subscription successful:', subscription);
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  // Send local notification
  static async sendLocalNotification(config: Partial<NotificationConfig>): Promise<void> {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const defaultConfig: NotificationConfig = {
      title: 'Prague Tours',
      body: 'You have a new update!',
      icon: '/images/icon-192x192.png',
      badge: '/images/icon-72x72.png',
      tag: 'default',
      requireInteraction: false,
      vibrate: [200, 100, 200],
      actions: [],
    };

    const notificationConfig = { ...defaultConfig, ...config };

    const notification = new Notification(notificationConfig.title, {
      body: notificationConfig.body,
      icon: notificationConfig.icon,
      badge: notificationConfig.badge,
      tag: notificationConfig.tag,
      requireInteraction: notificationConfig.requireInteraction,
      vibrate: notificationConfig.vibrate,
      actions: notificationConfig.actions,
    });

    // Auto-close after 5 seconds if not requiring interaction
    if (!notificationConfig.requireInteraction) {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  }

  // Cache management
  static async clearOldCaches(): Promise<void> {
    if (!('caches' in window)) return;

    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
      !name.includes('v2') && name.includes('prague-tours')
    );

    await Promise.all(oldCaches.map(name => caches.delete(name)));
    console.log('Old caches cleared:', oldCaches);
  }

  // Get cache usage
  static async getCacheUsage(): Promise<{
    used: number;
    available: number;
    percentage: number;
  }> {
    if (!('storage' in navigator) || !('estimate' in navigator.storage)) {
      return { used: 0, available: 0, percentage: 0 };
    }

    try {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const available = estimate.quota || 0;
      const percentage = available > 0 ? (used / available) * 100 : 0;

      return { used, available, percentage };
    } catch (error) {
      console.error('Failed to get cache usage:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  // Utility function to convert VAPID key
  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Check PWA installation status
  static getInstallationStatus(): {
    canInstall: boolean;
    isInstalled: boolean;
    isStandalone: boolean;
    platform: string;
  } {
    if (typeof window === 'undefined') {
      return {
        canInstall: false,
        isInstalled: false,
        isStandalone: false,
        platform: 'unknown',
      };
    }

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true;

    const userAgent = navigator.userAgent.toLowerCase();
    let platform = 'web';
    
    if (/android/.test(userAgent)) platform = 'android';
    else if (/iphone|ipad|ipod/.test(userAgent)) platform = 'ios';
    else if (/windows/.test(userAgent)) platform = 'windows';
    else if (/mac/.test(userAgent)) platform = 'macos';

    return {
      canInstall: 'serviceWorker' in navigator && 'PushManager' in window,
      isInstalled: isStandalone,
      isStandalone,
      platform,
    };
  }

  // Performance monitoring for PWA
  static monitorPerformance(): void {
    if (typeof window === 'undefined' || !this.registration) return;

    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        // Send performance data to service worker
        this.registration!.active?.postMessage({
          type: 'PERFORMANCE_METRICS',
          metrics: {
            name: entry.name,
            value: entry.startTime,
            type: entry.entryType,
          },
        });
      });
    });

    observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
  }
}
