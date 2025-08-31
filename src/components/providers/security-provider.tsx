'use client';

// Security context provider
// Manages client-side security state and CSRF tokens

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ClientSecurity, ClientGDPR, securityEvents } from '@/lib/client-security';

interface SecurityContextType {
  csrfToken: string | null;
  sessionId: string | null;
  isSecure: boolean;
  consentStatus: {
    hasConsent: boolean;
    consentTypes: string[];
    canTrack: boolean;
    canMarketing: boolean;
  };
  refreshToken: () => Promise<void>;
  updateConsent: (types: string[]) => Promise<boolean>;
  secureRequest: (url: string, options?: RequestInit) => Promise<Response>;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

export function useSecurityContext() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within a SecurityProvider');
  }
  return context;
}

interface SecurityProviderProps {
  children: ReactNode;
}

export function SecurityProvider({ children }: SecurityProviderProps) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSecure, setIsSecure] = useState(false);
  const [consentStatus, setConsentStatus] = useState({
    hasConsent: false,
    consentTypes: ['necessary'],
    canTrack: false,
    canMarketing: false,
  });

  // Initialize security on mount
  useEffect(() => {
    const initializeSecurity = async () => {
      try {
        // Initialize client security
        await ClientSecurity.initialize();
        
        // Get security status
        const securityStatus = ClientSecurity.getSecurityStatus();
        setCsrfToken(securityStatus.csrfProtection ? 'active' : null);
        setSessionId(securityStatus.sessionActive ? 'active' : null);
        setIsSecure(securityStatus.https);

        // Get consent status
        const consent = ClientGDPR.getConsentStatus();
        setConsentStatus(consent);

        // Track security initialization
        securityEvents.trackSecurityEvent('security_initialized', {
          https: securityStatus.https,
          csrf: securityStatus.csrfProtection,
          session: securityStatus.sessionActive,
        });
      } catch (error) {
        console.error('Security initialization failed:', error);
        securityEvents.trackSecurityError('initialization_failed');
      }
    };

    initializeSecurity();
  }, []);

  // Refresh CSRF token
  const refreshToken = async () => {
    try {
      const token = await ClientSecurity.getCSRFToken();
      setCsrfToken(token);
    } catch (error) {
      console.error('Token refresh failed:', error);
      securityEvents.trackSecurityError('token_refresh_failed');
    }
  };

  // Update consent preferences
  const updateConsent = async (types: string[]): Promise<boolean> => {
    try {
      const success = await ClientGDPR.updateConsent(types);
      
      if (success) {
        const newConsentStatus = ClientGDPR.getConsentStatus();
        setConsentStatus(newConsentStatus);
        securityEvents.trackConsentChange(types);
      }
      
      return success;
    } catch (error) {
      console.error('Consent update failed:', error);
      securityEvents.trackSecurityError('consent_update_failed');
      return false;
    }
  };

  // Secure request wrapper
  const secureRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
    try {
      return await ClientSecurity.secureRequest(url, options);
    } catch (error) {
      securityEvents.trackSecurityError('secure_request_failed');
      throw error;
    }
  };

  const contextValue: SecurityContextType = {
    csrfToken,
    sessionId,
    isSecure,
    consentStatus,
    refreshToken,
    updateConsent,
    secureRequest,
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
}

// Hook for secure form submissions
export function useSecureForm() {
  const { secureRequest, csrfToken } = useSecurityContext();

  const submitForm = async (
    data: any,
    endpoint: string,
    method: 'POST' | 'PUT' | 'DELETE' = 'POST'
  ) => {
    if (!csrfToken) {
      throw new Error('CSRF token not available');
    }

    // Validate form data
    const validation = ClientSecurity.validateFormData(data, []);
    if (!validation.valid) {
      throw new Error(`Form validation failed: ${validation.errors.join(', ')}`);
    }

    // Sanitize input data
    const sanitizedData = Object.entries(data).reduce((acc, [key, value]) => {
      if (typeof value === 'string') {
        acc[key] = ClientSecurity.sanitizeInput(value);
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    return secureRequest(endpoint, {
      method,
      body: JSON.stringify(sanitizedData),
    });
  };

  return { submitForm };
}

// Hook for GDPR data requests
export function useGDPRRequests() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestDataExport = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await ClientGDPR.requestDataExport(email);
      
      if (!result.success) {
        setError(result.error || 'Export request failed');
        return null;
      }
      
      securityEvents.trackSecurityEvent('data_export_requested', { email });
      return result.requestId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      securityEvents.trackSecurityError('data_export_failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const requestDataDeletion = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await ClientGDPR.requestDataDeletion(email);
      
      if (!result.success) {
        setError(result.error || 'Deletion request failed');
        return null;
      }
      
      securityEvents.trackSecurityEvent('data_deletion_requested', { email });
      return result.requestId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      securityEvents.trackSecurityError('data_deletion_failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    requestDataExport,
    requestDataDeletion,
    loading,
    error,
  };
}
