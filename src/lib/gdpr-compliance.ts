// GDPR compliance utilities for EU customer data protection
// Implements data handling, consent management, and user rights

import { z } from 'zod';

export interface GDPRConsent {
  id: string;
  userId?: string;
  email?: string;
  ipAddress: string;
  userAgent: string;
  consentTypes: ConsentType[];
  consentDate: Date;
  withdrawalDate?: Date;
  legalBasis: LegalBasis;
  dataRetentionPeriod: number; // days
}

export type ConsentType = 
  | 'necessary' 
  | 'analytics' 
  | 'marketing' 
  | 'personalization'
  | 'booking_data'
  | 'communication';

export type LegalBasis = 
  | 'consent' 
  | 'contract' 
  | 'legal_obligation' 
  | 'legitimate_interest';

export interface PersonalDataRecord {
  id: string;
  userId: string;
  dataType: PersonalDataType;
  data: any;
  source: string;
  collectedAt: Date;
  lastUpdated: Date;
  retentionPeriod: number; // days
  legalBasis: LegalBasis;
  consentId?: string;
}

export type PersonalDataType = 
  | 'contact_info'
  | 'booking_data'
  | 'payment_data'
  | 'analytics_data'
  | 'communication_preferences'
  | 'tour_preferences';

// GDPR consent validation schema
export const consentSchema = z.object({
  necessary: z.boolean().default(true), // Always required
  analytics: z.boolean().optional(),
  marketing: z.boolean().optional(),
  personalization: z.boolean().optional(),
});

// Data retention periods (in days)
export const DATA_RETENTION_PERIODS = {
  booking_data: 2555, // 7 years (legal requirement)
  payment_data: 2555, // 7 years (legal requirement)
  contact_info: 1095, // 3 years
  analytics_data: 1095, // 3 years
  marketing_data: 730, // 2 years
  communication_preferences: 365, // 1 year
  tour_preferences: 730, // 2 years
} as const;

// GDPR compliance utilities
export class GDPRCompliance {
  // Record user consent
  static recordConsent(
    consentData: Omit<GDPRConsent, 'id' | 'consentDate'>
  ): GDPRConsent {
    const consent: GDPRConsent = {
      id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      consentDate: new Date(),
      ...consentData,
    };

    // In production, store in database
    console.log('GDPR Consent recorded:', {
      id: consent.id,
      types: consent.consentTypes,
      date: consent.consentDate,
    });

    return consent;
  }

  // Withdraw consent
  static withdrawConsent(consentId: string): boolean {
    // In production, update database record
    console.log('GDPR Consent withdrawn:', consentId);
    return true;
  }

  // Check if data processing is allowed
  static isProcessingAllowed(
    consentTypes: ConsentType[],
    requiredType: ConsentType,
    legalBasis?: LegalBasis
  ): boolean {
    // Necessary cookies and contract-based processing are always allowed
    if (requiredType === 'necessary' || legalBasis === 'contract') {
      return true;
    }

    return consentTypes.includes(requiredType);
  }

  // Get data subject rights information
  static getDataSubjectRights(): {
    rights: string[];
    contactEmail: string;
    responseTime: string;
  } {
    return {
      rights: [
        'Right to access your personal data',
        'Right to rectification of inaccurate data',
        'Right to erasure (right to be forgotten)',
        'Right to restrict processing',
        'Right to data portability',
        'Right to object to processing',
        'Right to withdraw consent',
      ],
      contactEmail: process.env.GDPR_CONTACT_EMAIL || 'privacy@guidefilip-prague.com',
      responseTime: '30 days',
    };
  }

  // Anonymize personal data
  static anonymizeData(data: any): any {
    const anonymized = { ...data };
    
    // Remove or hash personally identifiable information
    const piiFields = [
      'firstName', 'lastName', 'fullName', 'name',
      'email', 'phone', 'address', 'city', 'country',
      'ipAddress', 'userId', 'customerId',
      'creditCard', 'bankAccount', 'ssn', 'passport'
    ];

    function anonymizeObject(obj: any): any {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map(anonymizeObject);
      }

      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (piiFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          result[key] = '[ANONYMIZED]';
        } else {
          result[key] = anonymizeObject(value);
        }
      }
      return result;
    }

    return anonymizeObject(anonymized);
  }

  // Check if data should be deleted based on retention period
  static shouldDeleteData(
    collectedAt: Date,
    dataType: keyof typeof DATA_RETENTION_PERIODS
  ): boolean {
    const retentionDays = DATA_RETENTION_PERIODS[dataType];
    const retentionMs = retentionDays * 24 * 60 * 60 * 1000;
    const now = Date.now();
    
    return (now - collectedAt.getTime()) > retentionMs;
  }

  // Generate privacy policy content
  static getPrivacyPolicyData() {
    return {
      dataController: {
        name: 'Filip Kareta',
        email: process.env.GDPR_CONTACT_EMAIL || 'privacy@guidefilip-prague.com',
        address: 'Prague, Czech Republic',
      },
      dataTypes: [
        {
          type: 'Contact Information',
          purpose: 'Tour booking and communication',
          legalBasis: 'Contract performance',
          retention: '3 years after last contact',
        },
        {
          type: 'Booking Data',
          purpose: 'Tour service delivery and legal compliance',
          legalBasis: 'Contract performance and legal obligation',
          retention: '7 years (legal requirement)',
        },
        {
          type: 'Payment Information',
          purpose: 'Payment processing',
          legalBasis: 'Contract performance',
          retention: '7 years (legal requirement)',
          note: 'Processed by third-party payment providers (Stripe, PayPal)',
        },
        {
          type: 'Analytics Data',
          purpose: 'Website improvement and user experience',
          legalBasis: 'Legitimate interest',
          retention: '3 years',
          note: 'Anonymized data only',
        },
      ],
      thirdPartyServices: [
        {
          name: 'Google Analytics',
          purpose: 'Website analytics',
          dataShared: 'Anonymized usage data',
          privacyPolicy: 'https://policies.google.com/privacy',
        },
        {
          name: 'Stripe',
          purpose: 'Payment processing',
          dataShared: 'Payment and billing information',
          privacyPolicy: 'https://stripe.com/privacy',
        },
        {
          name: 'Sentry',
          purpose: 'Error monitoring',
          dataShared: 'Technical error data (anonymized)',
          privacyPolicy: 'https://sentry.io/privacy/',
        },
      ],
    };
  }
}

// Cookie consent management
export const cookieConsent = {
  // Get consent status from cookies
  getConsentStatus(request: NextRequest): {
    hasConsent: boolean;
    consentTypes: ConsentType[];
    consentDate?: Date;
  } {
    const consentCookie = request.cookies.get('gdpr-consent');
    
    if (!consentCookie) {
      return { hasConsent: false, consentTypes: ['necessary'] };
    }

    try {
      const consent = JSON.parse(consentCookie.value);
      return {
        hasConsent: true,
        consentTypes: consent.types || ['necessary'],
        consentDate: consent.date ? new Date(consent.date) : undefined,
      };
    } catch {
      return { hasConsent: false, consentTypes: ['necessary'] };
    }
  },

  // Set consent cookie
  setConsentCookie(
    response: NextResponse,
    consentTypes: ConsentType[],
    expires?: Date
  ): void {
    const consentData = {
      types: consentTypes,
      date: new Date().toISOString(),
    };

    const cookieOptions = {
      httpOnly: false, // Needs to be accessible by client-side scripts
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 365 * 24 * 60 * 60, // 1 year
      path: '/',
    };

    response.cookies.set('gdpr-consent', JSON.stringify(consentData), cookieOptions);
  },

  // Clear consent cookie
  clearConsentCookie(response: NextResponse): void {
    response.cookies.delete('gdpr-consent');
  },
};

// Data export utilities for GDPR data portability
export const dataExport = {
  // Export user data in machine-readable format
  async exportUserData(userId: string): Promise<{
    personalData: any;
    bookings: any[];
    communications: any[];
    preferences: any;
    exportDate: string;
  }> {
    // In production, fetch from database
    return {
      personalData: {
        // User's personal information
      },
      bookings: [
        // User's booking history
      ],
      communications: [
        // Communication history
      ],
      preferences: {
        // User preferences and settings
      },
      exportDate: new Date().toISOString(),
    };
  },

  // Delete user data (right to be forgotten)
  async deleteUserData(userId: string): Promise<{
    success: boolean;
    deletedRecords: string[];
    retainedRecords: string[];
    reason?: string;
  }> {
    // In production, implement actual data deletion
    return {
      success: true,
      deletedRecords: ['profile', 'preferences', 'analytics'],
      retainedRecords: ['booking_history'], // Legal requirement to retain
      reason: 'Booking records retained for legal compliance (7 years)',
    };
  },
};
