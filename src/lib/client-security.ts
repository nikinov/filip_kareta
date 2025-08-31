// Client-side security utilities
// Handles CSRF tokens, secure form submissions, and client-side security measures

'use client';

export interface SecurityConfig {
  csrfToken?: string;
  sessionId?: string;
  expiresAt?: string;
}

// Client-side security manager
export class ClientSecurity {
  private static csrfToken: string | null = null;
  private static sessionId: string | null = null;
  private static tokenExpiry: Date | null = null;

  // Initialize security (call on app startup)
  static async initialize(): Promise<void> {
    try {
      await this.refreshCSRFToken();
    } catch (error) {
      console.error('Failed to initialize client security:', error);
    }
  }

  // Get or refresh CSRF token
  static async getCSRFToken(): Promise<string | null> {
    // Check if current token is still valid
    if (this.csrfToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.csrfToken;
    }

    // Refresh token
    await this.refreshCSRFToken();
    return this.csrfToken;
  }

  // Refresh CSRF token from server
  private static async refreshCSRFToken(): Promise<void> {
    try {
      const response = await fetch('/api/csrf', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get CSRF token: ${response.status}`);
      }

      const data = await response.json();
      this.csrfToken = data.csrfToken;
      this.sessionId = data.sessionId;
      this.tokenExpiry = new Date(data.expiresAt);
    } catch (error) {
      console.error('CSRF token refresh failed:', error);
      this.csrfToken = null;
      this.sessionId = null;
      this.tokenExpiry = null;
    }
  }

  // Make secure API request with CSRF protection
  static async secureRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const csrfToken = await this.getCSRFToken();
    
    if (!csrfToken && options.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method)) {
      throw new Error('CSRF token required for this request');
    }

    const secureHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (csrfToken) {
      secureHeaders['X-CSRF-Token'] = csrfToken;
    }

    return fetch(url, {
      ...options,
      credentials: 'include',
      headers: secureHeaders,
    });
  }

  // Secure form submission helper
  static async submitForm(
    formData: any,
    endpoint: string,
    method: 'POST' | 'PUT' | 'DELETE' = 'POST'
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await this.secureRequest(endpoint, {
        method,
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || `Request failed with status ${response.status}`,
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Validate form data before submission
  static validateFormData(data: any, requiredFields: string[]): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check required fields
    for (const field of requiredFields) {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        errors.push(`${field} is required`);
      }
    }

    // Basic email validation
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Invalid email format');
    }

    // Basic phone validation
    if (data.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.push('Invalid phone number format');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Sanitize user input
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }

    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+=/gi, '') // Remove event handlers
      .substring(0, 1000); // Limit length
  }

  // Check if HTTPS is enabled
  static isSecureConnection(): boolean {
    return typeof window !== 'undefined' && window.location.protocol === 'https:';
  }

  // Get security status for display
  static getSecurityStatus(): {
    https: boolean;
    csrfProtection: boolean;
    sessionActive: boolean;
    lastTokenRefresh?: Date;
  } {
    return {
      https: this.isSecureConnection(),
      csrfProtection: !!this.csrfToken,
      sessionActive: !!this.sessionId,
      lastTokenRefresh: this.tokenExpiry ? new Date(this.tokenExpiry.getTime() - 24 * 60 * 60 * 1000) : undefined,
    };
  }

  // Handle security errors
  static handleSecurityError(error: any): void {
    console.error('Security error:', error);
    
    // If CSRF token is invalid, refresh it
    if (error.message?.includes('CSRF') || error.message?.includes('403')) {
      this.csrfToken = null;
      this.tokenExpiry = null;
      this.refreshCSRFToken();
    }

    // Report to monitoring service
    if (typeof window !== 'undefined') {
      // In production, send to error monitoring
      console.warn('Security error reported to monitoring');
    }
  }
}

// GDPR consent management for client-side
export class ClientGDPR {
  // Check consent status
  static getConsentStatus(): {
    hasConsent: boolean;
    consentTypes: string[];
    canTrack: boolean;
    canMarketing: boolean;
  } {
    if (typeof document === 'undefined') {
      return { hasConsent: false, consentTypes: ['necessary'], canTrack: false, canMarketing: false };
    }

    const consentCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('gdpr-consent='));

    if (!consentCookie) {
      return { hasConsent: false, consentTypes: ['necessary'], canTrack: false, canMarketing: false };
    }

    try {
      const consent = JSON.parse(decodeURIComponent(consentCookie.split('=')[1]));
      const types = consent.types || ['necessary'];
      
      return {
        hasConsent: true,
        consentTypes: types,
        canTrack: types.includes('analytics'),
        canMarketing: types.includes('marketing'),
      };
    } catch {
      return { hasConsent: false, consentTypes: ['necessary'], canTrack: false, canMarketing: false };
    }
  }

  // Update consent preferences
  static async updateConsent(consentTypes: string[], email?: string): Promise<boolean> {
    try {
      const response = await ClientSecurity.secureRequest('/api/gdpr', {
        method: 'POST',
        body: JSON.stringify({
          action: 'update-consent',
          consentTypes,
          email,
        }),
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to update consent:', error);
      return false;
    }
  }

  // Request data export
  static async requestDataExport(email: string): Promise<{ success: boolean; requestId?: string; error?: string }> {
    try {
      const response = await ClientSecurity.secureRequest('/api/gdpr', {
        method: 'POST',
        body: JSON.stringify({
          action: 'data-request',
          requestType: 'portability',
          email,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        return { success: true, requestId: result.requestId };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Request data deletion
  static async requestDataDeletion(email: string): Promise<{ success: boolean; requestId?: string; error?: string }> {
    try {
      const response = await ClientSecurity.secureRequest('/api/gdpr', {
        method: 'POST',
        body: JSON.stringify({
          action: 'data-request',
          requestType: 'erasure',
          email,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        return { success: true, requestId: result.requestId };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Security event tracking
export const securityEvents = {
  // Track security-related user actions
  trackSecurityEvent(event: string, data?: any): void {
    if (typeof window === 'undefined') return;

    // Only track if analytics consent is given
    const consent = ClientGDPR.getConsentStatus();
    if (!consent.canTrack) return;

    // Send to analytics (if available)
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'security_action', {
        event_category: 'Security',
        event_label: event,
        custom_parameter: data ? JSON.stringify(data) : undefined,
      });
    }

    console.log('Security event tracked:', event, data);
  },

  // Track consent changes
  trackConsentChange(consentTypes: string[]): void {
    this.trackSecurityEvent('consent_updated', { types: consentTypes });
  },

  // Track security errors
  trackSecurityError(error: string): void {
    this.trackSecurityEvent('security_error', { error });
  },
};
