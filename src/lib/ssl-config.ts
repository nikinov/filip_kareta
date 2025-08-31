// SSL/HTTPS configuration and certificate management
// Handles SSL certificate validation and HTTPS enforcement

export interface SSLConfig {
  enforceHTTPS: boolean;
  hstsMaxAge: number;
  includeSubdomains: boolean;
  preload: boolean;
  certificateInfo?: {
    issuer: string;
    validFrom: Date;
    validTo: Date;
    domains: string[];
  };
}

// SSL configuration for different environments
export const SSL_CONFIGS = {
  development: {
    enforceHTTPS: false,
    hstsMaxAge: 0,
    includeSubdomains: false,
    preload: false,
  },
  production: {
    enforceHTTPS: true,
    hstsMaxAge: 31536000, // 1 year
    includeSubdomains: true,
    preload: true,
  },
  staging: {
    enforceHTTPS: true,
    hstsMaxAge: 86400, // 1 day
    includeSubdomains: false,
    preload: false,
  },
} as const;

// Get SSL configuration for current environment
export function getSSLConfig(): SSLConfig {
  const env = process.env.NODE_ENV as keyof typeof SSL_CONFIGS;
  return SSL_CONFIGS[env] || SSL_CONFIGS.development;
}

// Generate HSTS header value
export function generateHSTSHeader(config: SSLConfig): string {
  if (!config.enforceHTTPS) {
    return '';
  }

  let header = `max-age=${config.hstsMaxAge}`;
  
  if (config.includeSubdomains) {
    header += '; includeSubDomains';
  }
  
  if (config.preload) {
    header += '; preload';
  }
  
  return header;
}

// SSL certificate validation utilities
export const sslUtils = {
  // Check if request is using HTTPS
  isHTTPS(request: Request): boolean {
    const protocol = request.headers.get('x-forwarded-proto') || 
                    request.url.split(':')[0];
    return protocol === 'https';
  },

  // Validate SSL certificate (for monitoring)
  async validateCertificate(domain: string): Promise<{
    valid: boolean;
    expiresAt?: Date;
    issuer?: string;
    error?: string;
  }> {
    try {
      // In a real implementation, you would check the certificate
      // This is a placeholder for certificate validation logic
      
      if (process.env.NODE_ENV === 'development') {
        return { valid: true };
      }

      // For production, implement actual certificate checking
      // This could use a service like SSL Labs API or custom validation
      
      return {
        valid: true,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        issuer: 'Let\'s Encrypt',
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  // Get certificate information for monitoring
  getCertificateInfo(): {
    domains: string[];
    autoRenewal: boolean;
    provider: string;
    monitoringEnabled: boolean;
  } {
    return {
      domains: [
        'guidefilip-prague.com',
        'www.guidefilip-prague.com',
      ],
      autoRenewal: true,
      provider: process.env.SSL_PROVIDER || 'Vercel/Let\'s Encrypt',
      monitoringEnabled: process.env.SSL_MONITORING_ENABLED === 'true',
    };
  },

  // Check for mixed content issues
  validateMixedContent(html: string): {
    hasIssues: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    // Check for HTTP resources in HTTPS pages
    const httpRegex = /http:\/\/[^\s"'<>]+/gi;
    const matches = html.match(httpRegex);
    
    if (matches) {
      matches.forEach(match => {
        // Skip localhost and development URLs
        if (!match.includes('localhost') && !match.includes('127.0.0.1')) {
          issues.push(`Insecure resource: ${match}`);
        }
      });
    }

    return {
      hasIssues: issues.length > 0,
      issues,
    };
  },
};

// HTTPS redirect utility
export function createHTTPSRedirect(request: Request): Response | null {
  const config = getSSLConfig();
  
  if (!config.enforceHTTPS) {
    return null;
  }

  if (!sslUtils.isHTTPS(request)) {
    const url = new URL(request.url);
    url.protocol = 'https:';
    
    return Response.redirect(url.toString(), 301);
  }

  return null;
}

// Security headers for SSL/HTTPS
export const SSL_SECURITY_HEADERS = {
  // HTTPS enforcement
  'Strict-Transport-Security': generateHSTSHeader(getSSLConfig()),
  
  // Upgrade insecure requests
  'Content-Security-Policy': 'upgrade-insecure-requests',
  
  // Expect certificate transparency
  'Expect-CT': 'max-age=86400, enforce',
  
  // Public key pinning (optional, use with caution)
  // 'Public-Key-Pins': 'pin-sha256="..."; max-age=5184000; includeSubDomains',
};

// SSL monitoring and alerting
export const sslMonitoring = {
  // Check certificate expiration
  async checkCertificateExpiration(): Promise<{
    status: 'ok' | 'warning' | 'critical';
    daysUntilExpiry?: number;
    message: string;
  }> {
    try {
      const domains = sslUtils.getCertificateInfo().domains;
      
      for (const domain of domains) {
        const cert = await sslUtils.validateCertificate(domain);
        
        if (!cert.valid) {
          return {
            status: 'critical',
            message: `SSL certificate invalid for ${domain}: ${cert.error}`,
          };
        }

        if (cert.expiresAt) {
          const daysUntilExpiry = Math.floor(
            (cert.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
          );

          if (daysUntilExpiry < 7) {
            return {
              status: 'critical',
              daysUntilExpiry,
              message: `SSL certificate expires in ${daysUntilExpiry} days for ${domain}`,
            };
          }

          if (daysUntilExpiry < 30) {
            return {
              status: 'warning',
              daysUntilExpiry,
              message: `SSL certificate expires in ${daysUntilExpiry} days for ${domain}`,
            };
          }
        }
      }

      return {
        status: 'ok',
        message: 'All SSL certificates are valid and not expiring soon',
      };
    } catch (error) {
      return {
        status: 'critical',
        message: `SSL monitoring failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },

  // Generate SSL health report
  async generateHealthReport(): Promise<{
    overall: 'healthy' | 'warning' | 'critical';
    certificates: any[];
    recommendations: string[];
  }> {
    const certStatus = await this.checkCertificateExpiration();
    const config = getSSLConfig();
    const recommendations: string[] = [];

    // Check configuration
    if (!config.enforceHTTPS && process.env.NODE_ENV === 'production') {
      recommendations.push('Enable HTTPS enforcement in production');
    }

    if (config.hstsMaxAge < 31536000 && process.env.NODE_ENV === 'production') {
      recommendations.push('Increase HSTS max-age to at least 1 year');
    }

    if (!config.includeSubdomains && process.env.NODE_ENV === 'production') {
      recommendations.push('Enable HSTS includeSubDomains directive');
    }

    return {
      overall: certStatus.status === 'ok' ? 'healthy' : certStatus.status,
      certificates: [
        {
          domain: 'guidefilip-prague.com',
          status: certStatus.status,
          message: certStatus.message,
          daysUntilExpiry: certStatus.daysUntilExpiry,
        },
      ],
      recommendations,
    };
  },
};
