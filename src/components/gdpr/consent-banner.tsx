'use client';

// GDPR consent banner component
// Handles cookie consent and privacy preferences

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ClientGDPR, securityEvents } from '@/lib/client-security';
import { X, Shield, Cookie, Settings } from 'lucide-react';

interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

export function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    personalization: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consentStatus = ClientGDPR.getConsentStatus();
    if (!consentStatus.hasConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = async () => {
    setLoading(true);
    
    const allConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true,
    };

    const success = await ClientGDPR.updateConsent([
      'necessary', 'analytics', 'marketing', 'personalization', 'booking_data', 'communication'
    ]);

    if (success) {
      securityEvents.trackConsentChange(['necessary', 'analytics', 'marketing', 'personalization']);
      setShowBanner(false);
    }
    
    setLoading(false);
  };

  const handleAcceptNecessary = async () => {
    setLoading(true);
    
    const success = await ClientGDPR.updateConsent(['necessary', 'booking_data']);

    if (success) {
      securityEvents.trackConsentChange(['necessary']);
      setShowBanner(false);
    }
    
    setLoading(false);
  };

  const handleCustomPreferences = async () => {
    setLoading(true);
    
    const consentTypes = ['necessary', 'booking_data']; // Always include necessary
    
    if (preferences.analytics) consentTypes.push('analytics');
    if (preferences.marketing) consentTypes.push('marketing', 'communication');
    if (preferences.personalization) consentTypes.push('personalization');

    const success = await ClientGDPR.updateConsent(consentTypes);

    if (success) {
      securityEvents.trackConsentChange(consentTypes);
      setShowBanner(false);
    }
    
    setLoading(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/50 backdrop-blur-sm">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Cookie className="h-6 w-6 text-blue-600" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Your Privacy Matters
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                We use cookies and similar technologies to provide you with the best experience on our website, 
                analyze usage, and assist with our marketing efforts. You can customize your preferences below.
              </p>

              {showDetails && (
                <div className="mb-4 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="necessary" 
                      checked={true} 
                      disabled={true}
                    />
                    <label htmlFor="necessary" className="text-sm">
                      <strong>Necessary Cookies</strong> - Required for basic website functionality and booking services
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="analytics" 
                      checked={preferences.analytics}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, analytics: !!checked }))
                      }
                    />
                    <label htmlFor="analytics" className="text-sm">
                      <strong>Analytics Cookies</strong> - Help us understand how you use our website to improve your experience
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="marketing" 
                      checked={preferences.marketing}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, marketing: !!checked }))
                      }
                    />
                    <label htmlFor="marketing" className="text-sm">
                      <strong>Marketing Cookies</strong> - Allow us to show you relevant offers and improve our marketing
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="personalization" 
                      checked={preferences.personalization}
                      onCheckedChange={(checked) => 
                        setPreferences(prev => ({ ...prev, personalization: !!checked }))
                      }
                    />
                    <label htmlFor="personalization" className="text-sm">
                      <strong>Personalization</strong> - Remember your preferences and provide personalized content
                    </label>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={handleAcceptAll}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Accept All
                </Button>
                
                <Button 
                  onClick={handleAcceptNecessary}
                  disabled={loading}
                  variant="outline"
                >
                  Necessary Only
                </Button>
                
                <Button 
                  onClick={() => setShowDetails(!showDetails)}
                  disabled={loading}
                  variant="ghost"
                  size="sm"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  {showDetails ? 'Hide' : 'Customize'}
                </Button>

                {showDetails && (
                  <Button 
                    onClick={handleCustomPreferences}
                    disabled={loading}
                    variant="outline"
                  >
                    Save Preferences
                  </Button>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-3">
                By continuing to use our website, you agree to our{' '}
                <a href="/privacy-policy" className="underline hover:text-gray-700">
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href="/cookie-policy" className="underline hover:text-gray-700">
                  Cookie Policy
                </a>
                . You can change your preferences at any time.
              </p>
            </div>

            <button
              onClick={() => setShowBanner(false)}
              className="flex-shrink-0 p-1 hover:bg-gray-100 rounded"
              aria-label="Close banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Privacy settings component for user preferences
export function PrivacySettings() {
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    personalization: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Load current preferences
    const consentStatus = ClientGDPR.getConsentStatus();
    setPreferences({
      necessary: true, // Always true
      analytics: consentStatus.consentTypes.includes('analytics'),
      marketing: consentStatus.consentTypes.includes('marketing'),
      personalization: consentStatus.consentTypes.includes('personalization'),
    });
  }, []);

  const handleSavePreferences = async () => {
    setLoading(true);
    setMessage(null);
    
    const consentTypes = ['necessary', 'booking_data'];
    
    if (preferences.analytics) consentTypes.push('analytics');
    if (preferences.marketing) consentTypes.push('marketing', 'communication');
    if (preferences.personalization) consentTypes.push('personalization');

    const success = await ClientGDPR.updateConsent(consentTypes);

    if (success) {
      securityEvents.trackConsentChange(consentTypes);
      setMessage({ type: 'success', text: 'Privacy preferences updated successfully' });
    } else {
      setMessage({ type: 'error', text: 'Failed to update preferences. Please try again.' });
    }
    
    setLoading(false);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privacy Settings
        </h2>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <h3 className="font-medium">Necessary Cookies</h3>
              <p className="text-sm text-gray-600">Required for website functionality and booking services</p>
            </div>
            <Checkbox checked={true} disabled={true} />
          </div>

          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <h3 className="font-medium">Analytics</h3>
              <p className="text-sm text-gray-600">Help us improve our website by analyzing usage patterns</p>
            </div>
            <Checkbox 
              checked={preferences.analytics}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, analytics: !!checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <h3 className="font-medium">Marketing</h3>
              <p className="text-sm text-gray-600">Receive relevant offers and marketing communications</p>
            </div>
            <Checkbox 
              checked={preferences.marketing}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, marketing: !!checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <h3 className="font-medium">Personalization</h3>
              <p className="text-sm text-gray-600">Remember your preferences and provide personalized content</p>
            </div>
            <Checkbox 
              checked={preferences.personalization}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, personalization: !!checked }))
              }
            />
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded mb-4 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <Button 
          onClick={handleSavePreferences}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardContent>
    </Card>
  );
}
