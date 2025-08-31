'use client';

// PWA update manager component
// Handles service worker updates and app version management

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface UpdateStatus {
  available: boolean;
  installing: boolean;
  installed: boolean;
  error: string | null;
}

export function PWAUpdateManager() {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({
    available: false,
    installing: false,
    installed: false,
    error: null,
  });
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  
  const t = useTranslations('pwa');

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker and handle updates
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          setRegistration(reg);
          
          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            
            if (newWorker) {
              setUpdateStatus(prev => ({ ...prev, available: true, installing: true }));
              
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // New update available
                    setUpdateStatus(prev => ({ 
                      ...prev, 
                      available: true, 
                      installing: false,
                      installed: true 
                    }));
                    setShowUpdatePrompt(true);
                  } else {
                    // First install
                    setUpdateStatus(prev => ({ 
                      ...prev, 
                      available: false, 
                      installing: false,
                      installed: true 
                    }));
                  }
                }
              });
            }
          });

          // Check for waiting service worker
          if (reg.waiting) {
            setUpdateStatus(prev => ({ 
              ...prev, 
              available: true, 
              installed: true 
            }));
            setShowUpdatePrompt(true);
          }
        })
        .catch((error) => {
          console.error('Service worker registration failed:', error);
          setUpdateStatus(prev => ({ 
            ...prev, 
            error: 'Failed to register service worker' 
          }));
        });

      // Listen for controller change (update applied)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setUpdateStatus(prev => ({ 
          ...prev, 
          available: false, 
          installing: false,
          installed: true 
        }));
        setShowUpdatePrompt(false);
        
        // Show success message
        setTimeout(() => {
          setUpdateStatus(prev => ({ ...prev, installed: false }));
        }, 3000);
      });
    }
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      // Tell the waiting service worker to skip waiting
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setUpdateStatus(prev => ({ ...prev, installing: true }));
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
    
    // Don't show again for this session
    sessionStorage.setItem('pwa-update-dismissed', 'true');
  };

  // Don't show if user dismissed this session
  if (typeof window !== 'undefined' && sessionStorage.getItem('pwa-update-dismissed')) {
    return null;
  }

  // Update available prompt
  if (showUpdatePrompt && updateStatus.available) {
    return (
      <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
        <Card className="shadow-lg border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <RefreshCw className="h-5 w-5 text-blue-600" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">
                  {t('updateAvailable', { default: 'Update Available' })}
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  {t('updateDescription', { 
                    default: 'A new version of the app is available with improvements and bug fixes.' 
                  })}
                </p>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdate}
                    disabled={updateStatus.installing}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {updateStatus.installing ? (
                      <>
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        {t('updating', { default: 'Updating...' })}
                      </>
                    ) : (
                      <>
                        <Download className="h-3 w-3 mr-1" />
                        {t('update', { default: 'Update' })}
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleDismiss}
                    variant="ghost"
                    size="sm"
                  >
                    {t('later', { default: 'Later' })}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Update installed success message
  if (updateStatus.installed && !updateStatus.available) {
    return (
      <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
        <Card className="shadow-lg border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="font-semibold text-sm">
                  {t('updateInstalled', { default: 'App Updated!' })}
                </h3>
                <p className="text-xs text-gray-600">
                  {t('updateInstalledDescription', { 
                    default: 'You\'re now using the latest version.' 
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (updateStatus.error) {
    return (
      <div className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
        <Card className="shadow-lg border-red-200 bg-gradient-to-r from-red-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-sm">
                  {t('updateError', { default: 'Update Error' })}
                </h3>
                <p className="text-xs text-gray-600">
                  {updateStatus.error}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

// PWA installation status component
export function PWAInstallStatus() {
  const [installStatus, setInstallStatus] = useState({
    canInstall: false,
    isInstalled: false,
    isStandalone: false,
  });

  useEffect(() => {
    const checkInstallStatus = () => {
      setInstallStatus({
        canInstall: 'serviceWorker' in navigator && 'PushManager' in window,
        isInstalled: window.matchMedia('(display-mode: standalone)').matches,
        isStandalone: (window.navigator as any).standalone === true,
      });
    };

    checkInstallStatus();
    
    // Listen for app installed event
    window.addEventListener('appinstalled', checkInstallStatus);
    
    return () => {
      window.removeEventListener('appinstalled', checkInstallStatus);
    };
  }, []);

  if (!installStatus.canInstall) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-xs text-gray-600">
      {installStatus.isInstalled || installStatus.isStandalone ? (
        <Badge variant="secondary" className="text-xs">
          📱 App Mode
        </Badge>
      ) : (
        <Badge variant="outline" className="text-xs">
          🌐 Web Mode
        </Badge>
      )}
    </div>
  );
}

// PWA capabilities detector
export function PWACapabilities() {
  const [capabilities, setCapabilities] = useState({
    serviceWorker: false,
    pushNotifications: false,
    backgroundSync: false,
    webShare: false,
    installPrompt: false,
    offlineStorage: false,
  });

  useEffect(() => {
    setCapabilities({
      serviceWorker: 'serviceWorker' in navigator,
      pushNotifications: 'PushManager' in window && 'Notification' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      webShare: 'share' in navigator,
      installPrompt: 'BeforeInstallPromptEvent' in window,
      offlineStorage: 'caches' in window && 'localStorage' in window,
    });
  }, []);

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-sm">PWA Capabilities</h4>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {Object.entries(capabilities).map(([feature, supported]) => (
          <div key={feature} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${supported ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
