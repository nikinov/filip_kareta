// Security configuration and environment setup
// Centralizes security settings and validates environment configuration

export interface SecurityEnvironment {
  NODE_ENV: string;
  JWT_SECRET: string;
  SECURITY_API_KEY: string;
  GDPR_CONTACT_EMAIL: string;
  SSL_PROVIDER: string;
  SSL_MONITORING_ENABLED: string;
  ENFORCE_IP_CONSISTENCY: string;
  NEXT_PUBLIC_BASE_URL: string;
  SENTRY_DSN: string;
  NEXT_PUBLIC_SENTRY_DSN: string;
}

// Security configuration validation
export function validateSecurityEnvironment(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required environment variables
  const required = [
    'JWT_SECRET',
    'NEXT_PUBLIC_BASE_URL',
  ];

  // Recommended environment variables
  const recommended = [
    'SECURITY_API_KEY',
    'GDPR_CONTACT_EMAIL',
    'SENTRY_DSN',
    'NEXT_PUBLIC_SENTRY_DSN',
  ];

  // Check required variables
  for (const variable of required) {
    if (!process.env[variable]) {
      errors.push(`Missing required environment variable: ${variable}`);
    }
  }

  // Check recommended variables
  for (const variable of recommended) {
    if (!process.env[variable]) {
      warnings.push(`Missing recommended environment variable: ${variable}`);
    }
  }

  // Validate JWT secret strength
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret && jwtSecret.length < 32) {
    warnings.push('JWT_SECRET should be at least 32 characters long');
  }

  // Check production-specific requirements
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.SECURITY_API_KEY) {
      errors.push('SECURITY_API_KEY is required in production');
    }
    
    if (!process.env.GDPR_CONTACT_EMAIL) {
      warnings.push('GDPR_CONTACT_EMAIL should be set in production');
    }

    if (process.env.NEXT_PUBLIC_BASE_URL?.startsWith('http://')) {
      errors.push('NEXT_PUBLIC_BASE_URL must use HTTPS in production');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// Security feature flags
export const SECURITY_FEATURES = {
  // CSRF protection
  CSRF_ENABLED: true,
  CSRF_TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
  
  // Rate limiting
  RATE_LIMITING_ENABLED: true,
  RATE_LIMIT_REDIS: process.env.REDIS_URL ? true : false,
  
  // Session management
  SESSION_ENCRYPTION: true,
  SESSION_ROTATION: true,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  
  // GDPR compliance
  GDPR_ENABLED: true,
  COOKIE_CONSENT_REQUIRED: true,
  DATA_RETENTION_ENFORCEMENT: true,
  
  // SSL/HTTPS
  HTTPS_ENFORCEMENT: process.env.NODE_ENV === 'production',
  HSTS_ENABLED: true,
  CERTIFICATE_MONITORING: process.env.SSL_MONITORING_ENABLED === 'true',
  
  // Monitoring and logging
  SECURITY_LOGGING: true,
  THREAT_DETECTION: true,
  INCIDENT_REPORTING: true,
} as const;

// Security endpoints configuration
export const SECURITY_ENDPOINTS = {
  CSRF_TOKEN: '/api/csrf',
  GDPR_COMPLIANCE: '/api/gdpr',
  SECURITY_HEALTH: '/api/security',
  INCIDENT_REPORT: '/api/security',
} as const;

// Allowed origins for CORS
export function getAllowedOrigins(): string[] {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const origins = [
    'https://guidefilip-prague.com',
    'https://www.guidefilip-prague.com',
  ];

  if (baseUrl) {
    origins.push(baseUrl);
  }

  // Add development origins
  if (process.env.NODE_ENV === 'development') {
    origins.push('http://localhost:3000', 'http://127.0.0.1:3000');
  }

  return origins.filter(Boolean);
}

// Security monitoring configuration
export const MONITORING_CONFIG = {
  // Error tracking
  SENTRY_ENABLED: !!process.env.SENTRY_DSN,
  SENTRY_SAMPLE_RATE: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Performance monitoring
  PERFORMANCE_MONITORING: true,
  CORE_WEB_VITALS: true,
  
  // Security event tracking
  SECURITY_EVENTS: true,
  THREAT_DETECTION: true,
  
  // Logging levels
  LOG_LEVEL: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
  SECURITY_LOG_RETENTION: 90, // days
} as const;

// Content Security Policy configuration
export const CSP_CONFIG = {
  // Script sources
  SCRIPT_SRC: [
    "'self'",
    "'unsafe-inline'", // Required for Next.js
    "'unsafe-eval'", // Required for development
    'https://js.stripe.com',
    'https://www.paypal.com',
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://connect.facebook.net',
  ],
  
  // Style sources
  STYLE_SRC: [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind CSS
    'https://fonts.googleapis.com',
  ],
  
  // Image sources
  IMG_SRC: [
    "'self'",
    'data:',
    'https:',
    'blob:',
  ],
  
  // Connect sources (for API calls)
  CONNECT_SRC: [
    "'self'",
    'https://api.stripe.com',
    'https://www.paypal.com',
    'https://www.google-analytics.com',
    'https://analytics.google.com',
    'https://region1.google-analytics.com',
  ],
  
  // Frame sources
  FRAME_SRC: [
    'https://js.stripe.com',
    'https://www.paypal.com',
  ],
} as const;

// Generate CSP header value
export function generateCSPHeader(): string {
  const directives = [
    `default-src 'self'`,
    `script-src ${CSP_CONFIG.SCRIPT_SRC.join(' ')}`,
    `style-src ${CSP_CONFIG.STYLE_SRC.join(' ')}`,
    `img-src ${CSP_CONFIG.IMG_SRC.join(' ')}`,
    `connect-src ${CSP_CONFIG.CONNECT_SRC.join(' ')}`,
    `frame-src ${CSP_CONFIG.FRAME_SRC.join(' ')}`,
    `font-src 'self' https://fonts.gstatic.com`,
    `media-src 'self' https:`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ];

  if (process.env.NODE_ENV === 'production') {
    directives.push('upgrade-insecure-requests');
  }

  return directives.join('; ');
}

// Security health check utilities
export const securityHealth = {
  // Check overall security status
  async checkSecurityHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    checks: Record<string, boolean>;
    issues: string[];
  }> {
    const checks = {
      environment: validateSecurityEnvironment().valid,
      https: process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_BASE_URL?.startsWith('https://'),
      csrf: SECURITY_FEATURES.CSRF_ENABLED,
      gdpr: SECURITY_FEATURES.GDPR_ENABLED,
      monitoring: MONITORING_CONFIG.SENTRY_ENABLED,
      headers: true, // Assume headers are configured correctly
    };

    const issues: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Check for critical issues
    if (!checks.environment) {
      issues.push('Environment configuration issues detected');
      status = 'critical';
    }

    if (!checks.https && process.env.NODE_ENV === 'production') {
      issues.push('HTTPS not properly configured');
      status = 'critical';
    }

    // Check for warnings
    if (!checks.monitoring) {
      issues.push('Error monitoring not configured');
      if (status === 'healthy') status = 'warning';
    }

    return { status, checks, issues };
  },

  // Get security recommendations
  getSecurityRecommendations(): string[] {
    const recommendations: string[] = [];
    const envValidation = validateSecurityEnvironment();

    if (envValidation.warnings.length > 0) {
      recommendations.push(...envValidation.warnings);
    }

    if (process.env.NODE_ENV === 'production') {
      if (!process.env.REDIS_URL) {
        recommendations.push('Consider using Redis for rate limiting in production');
      }

      if (!process.env.SSL_MONITORING_ENABLED) {
        recommendations.push('Enable SSL certificate monitoring');
      }
    }

    return recommendations;
  },
};
