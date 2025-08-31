'use client';

// Mobile-optimized navigation component
// Touch-friendly navigation with swipe gestures and PWA features

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Home, 
  MapPin, 
  User, 
  MessageCircle, 
  Calendar,
  Wifi,
  WifiOff,
  Download,
  Bell,
  Settings
} from 'lucide-react';
import { useMobileDevice, useMobileInteractions } from '@/lib/mobile-interactions';
import { mobileUtils } from '@/lib/mobile-interactions';
import * as m from '@/paraglide/messages';

interface MobileNavigationProps {
  locale: string;
}

export function MobileNavigation({ locale }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [canInstall, setCanInstall] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);
  
  const navRef = useRef<HTMLDivElement>(null);
  const mobileDevice = useMobileDevice();
  const pathname = usePathname();
  const t = useTranslations('navigation');

  // Navigation items
  const navigationItems = [
    {
      href: `/${locale}`,
      label: t('home', { default: 'Home' }),
      icon: Home,
      exact: true,
    },
    {
      href: `/${locale}/tours`,
      label: t('tours', { default: 'Tours' }),
      icon: MapPin,
    },
    {
      href: `/${locale}/about`,
      label: t('about', { default: 'About Filip' }),
      icon: User,
    },
    {
      href: `/${locale}/contact`,
      label: t('contact', { default: 'Contact' }),
      icon: MessageCircle,
    },
  ];

  // Set up swipe gestures for navigation
  useMobileInteractions(navRef, {
    onSwipe: (gesture) => {
      if (gesture.direction === 'right' && !isOpen) {
        setIsOpen(true);
      } else if (gesture.direction === 'left' && isOpen) {
        setIsOpen(false);
      }
    },
  });

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check PWA installation capability
    setCanInstall(mobileUtils.canInstallPWA() && !mobileUtils.isPWA());

    // Check notification permission
    if ('Notification' in window) {
      setHasNotifications(Notification.permission === 'granted');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Close navigation when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleInstallPWA = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const deferredPrompt = (window as any).deferredPrompt;
        
        if (deferredPrompt) {
          await deferredPrompt.prompt();
          const choiceResult = await deferredPrompt.userChoice;
          
          if (choiceResult.outcome === 'accepted') {
            setCanInstall(false);
          }
        }
      } catch (error) {
        console.error('PWA installation failed:', error);
      }
    }
  };

  const handleNotificationRequest = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setHasNotifications(permission === 'granted');
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="relative p-2"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
          
          {/* Offline indicator */}
          {!isOnline && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-3 w-3 p-0 flex items-center justify-center"
            >
              <WifiOff className="h-2 w-2" />
            </Badge>
          )}
        </Button>
      </div>

      {/* Mobile navigation overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Navigation panel */}
          <div 
            ref={navRef}
            className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300 ease-out"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="font-semibold text-lg">Filip Kareta</h2>
                <p className="text-sm text-gray-600">Prague Tour Guide</p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="p-2"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Status indicators */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                <Badge variant={isOnline ? "default" : "destructive"} className="text-xs">
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
                
                {mobileUtils.isPWA() && (
                  <Badge variant="secondary" className="text-xs">
                    📱 App Mode
                  </Badge>
                )}
                
                {hasNotifications && (
                  <Badge variant="secondary" className="text-xs">
                    <Bell className="h-3 w-3 mr-1" />
                    Notifications
                  </Badge>
                )}
              </div>
            </div>

            {/* Navigation items */}
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact 
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                  
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                        {isActive && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            Current
                          </Badge>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* PWA features */}
            <div className="p-4 border-t bg-gray-50 space-y-3">
              {canInstall && (
                <Button
                  onClick={handleInstallPWA}
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('installApp', { default: 'Install App' })}
                </Button>
              )}
              
              {!hasNotifications && 'Notification' in window && (
                <Button
                  onClick={handleNotificationRequest}
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  {t('enableNotifications', { default: 'Enable Notifications' })}
                </Button>
              )}
              
              <Link
                href={`/${locale}/settings`}
                className="flex items-center gap-2 p-2 text-sm text-gray-600 hover:text-gray-900"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="h-4 w-4" />
                {t('settings', { default: 'Settings' })}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Mobile bottom navigation for key actions
export function MobileBottomNav({ locale }: { locale: string }) {
  const pathname = usePathname();
  const mobileDevice = useMobileDevice();
  const t = useTranslations('navigation');

  // Don't show on booking flow or if not mobile
  if (!mobileDevice.isMobile || pathname.includes('/booking')) {
    return null;
  }

  const bottomNavItems = [
    {
      href: `/${locale}`,
      label: t('home', { default: 'Home' }),
      icon: Home,
    },
    {
      href: `/${locale}/tours`,
      label: t('tours', { default: 'Tours' }),
      icon: MapPin,
    },
    {
      href: `/${locale}/booking`,
      label: t('book', { default: 'Book' }),
      icon: Calendar,
    },
    {
      href: `/${locale}/contact`,
      label: t('contact', { default: 'Contact' }),
      icon: MessageCircle,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-bottom">
      <nav className="flex">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
                          (item.href !== `/${locale}` && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 transition-colors ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

// Mobile-optimized language switcher
export function MobileLanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0];

  const getLocalizedPath = (locale: string) => {
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');
    return `/${locale}${pathWithoutLocale}`;
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2"
        aria-label="Change language"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="text-sm font-medium">{currentLanguage.code.toUpperCase()}</span>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Language options */}
          <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[150px]">
            {languages.map((language) => (
              <Link
                key={language.code}
                href={getLocalizedPath(language.code)}
                className={`flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  language.code === currentLocale ? 'bg-blue-50 text-blue-700' : ''
                }`}
                onClick={() => setIsOpen(false)}
              >
                <span className="text-lg">{language.flag}</span>
                <span className="font-medium">{language.name}</span>
                {language.code === currentLocale && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    Current
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Mobile-optimized header
export function MobileHeader({ locale }: { locale: string }) {
  const [isOnline, setIsOnline] = useState(true);
  const mobileDevice = useMobileDevice();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200 safe-area-top">
      <div className="flex items-center justify-between p-4">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">Filip Kareta</h1>
            <p className="text-xs text-gray-600">Prague Guide</p>
          </div>
        </Link>

        {/* Status and controls */}
        <div className="flex items-center gap-2">
          {/* Online/Offline indicator */}
          {!isOnline && (
            <Badge variant="destructive" className="text-xs">
              <WifiOff className="h-3 w-3 mr-1" />
              Offline
            </Badge>
          )}

          {/* Language switcher */}
          <MobileLanguageSwitcher currentLocale={locale} />

          {/* Mobile navigation toggle */}
          <MobileNavigation locale={locale} />
        </div>
      </div>
    </header>
  );
}

// Mobile-optimized footer with PWA features
export function MobileFooter({ locale }: { locale: string }) {
  const [showPWAFeatures, setShowPWAFeatures] = useState(false);
  const mobileDevice = useMobileDevice();

  if (!mobileDevice.isMobile) {
    return null;
  }

  return (
    <footer className="bg-gray-50 border-t border-gray-200 safe-area-bottom">
      <div className="p-4 space-y-4">
        {/* PWA features toggle */}
        <Button
          variant="ghost"
          onClick={() => setShowPWAFeatures(!showPWAFeatures)}
          className="w-full justify-between text-sm"
        >
          <span>App Features</span>
          <span className={`transform transition-transform ${showPWAFeatures ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </Button>

        {/* PWA features panel */}
        {showPWAFeatures && (
          <div className="space-y-3 p-3 bg-white rounded-lg border">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Wifi className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                <p className="text-xs font-medium">Offline Access</p>
                <p className="text-xs text-gray-600">Browse tours offline</p>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <Download className="h-6 w-6 mx-auto mb-1 text-green-600" />
                <p className="text-xs font-medium">Fast Loading</p>
                <p className="text-xs text-gray-600">Instant page loads</p>
              </div>
            </div>
            
            {mobileUtils.canInstallPWA() && !mobileUtils.isPWA() && (
              <Button
                onClick={() => {
                  // Trigger install prompt
                  const event = new CustomEvent('pwa-install-requested');
                  window.dispatchEvent(event);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Install Prague Tours App
              </Button>
            )}
          </div>
        )}

        {/* Copyright */}
        <div className="text-center text-xs text-gray-500 pt-2 border-t">
          <p>© 2024 Filip Kareta. All rights reserved.</p>
          <p className="mt-1">
            <Link href={`/${locale}/privacy`} className="hover:text-gray-700">
              Privacy Policy
            </Link>
            {' • '}
            <Link href={`/${locale}/terms`} className="hover:text-gray-700">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
