// Comprehensive security middleware for the Prague tour guide website
// Implements CSRF protection, rate limiting, and security headers

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Rate limiting storage (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// CSRF token storage (in production, use secure session storage)
const csrfTokenStore = new Map<string, { token: string; expires: number }>();

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export const RATE_LIMIT_CONFIGS = {
  // API endpoints
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
  // Booking endpoints (more restrictive)
  booking: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
  },
  // Contact forms
  contact: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
  },
  // Payment endpoints (very restrictive)
  payment: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },
} as const;

// Security headers configuration
export const SECURITY_HEADERS = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  // XSS protection
  'X-XSS-Protection': '1; mode=block',
  // HTTPS enforcement
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Permissions policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self)',
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.paypal.com https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "media-src 'self' https:",
    "connect-src 'self' https://api.stripe.com https://www.paypal.com https://www.google-analytics.com https://analytics.google.com",
    "frame-src https://js.stripe.com https://www.paypal.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; '),
};

// Generate CSRF token
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto.getRandomValues
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Validate CSRF token
export function validateCSRFToken(request: NextRequest): boolean {
  // Skip CSRF validation for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true;
  }

  // Skip CSRF validation for webhook endpoints (they use signature validation)
  if (request.nextUrl.pathname.includes('/webhook')) {
    return true;
  }

  const token = request.headers.get('x-csrf-token') || 
                request.headers.get('X-CSRF-Token');
  
  if (!token) {
    return false;
  }

  // In a real implementation, validate against stored token
  // For now, check if token exists and has valid format
  return token.length === 64 && /^[a-f0-9]+$/.test(token);
}

// Rate limiting implementation
export function checkRateLimit(
  identifier: string, 
  config: RateLimitConfig
): { allowed: boolean; resetTime?: number; remaining?: number } {
  const now = Date.now();
  const key = `${identifier}`;
  const stored = rateLimitStore.get(key);

  if (!stored || now > stored.resetTime) {
    // Reset or initialize
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return { 
      allowed: true, 
      resetTime: now + config.windowMs,
      remaining: config.maxRequests - 1
    };
  }

  if (stored.count >= config.maxRequests) {
    return { 
      allowed: false, 
      resetTime: stored.resetTime,
      remaining: 0
    };
  }

  stored.count++;
  return { 
    allowed: true, 
    resetTime: stored.resetTime,
    remaining: config.maxRequests - stored.count
  };
}

// Get client identifier for rate limiting
export function getClientIdentifier(request: NextRequest): string {
  // Use IP address as primary identifier
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  // In production, you might also consider user agent or other factors
  return ip;
}

// Determine rate limit config based on path
export function getRateLimitConfig(pathname: string): RateLimitConfig | null {
  if (pathname.startsWith('/api/payment')) {
    return RATE_LIMIT_CONFIGS.payment;
  }
  if (pathname.startsWith('/api/booking')) {
    return RATE_LIMIT_CONFIGS.booking;
  }
  if (pathname.includes('/contact') || pathname.includes('/api/contact')) {
    return RATE_LIMIT_CONFIGS.contact;
  }
  if (pathname.startsWith('/api/')) {
    return RATE_LIMIT_CONFIGS.api;
  }
  return null;
}

// Main security middleware function
export async function securityMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  
  // Get client identifier
  const clientId = getClientIdentifier(request);
  
  // Apply rate limiting
  const rateLimitConfig = getRateLimitConfig(pathname);
  if (rateLimitConfig) {
    const rateLimit = checkRateLimit(clientId, rateLimitConfig);
    
    if (!rateLimit.allowed) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Too many requests', 
          resetTime: rateLimit.resetTime 
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((rateLimit.resetTime! - Date.now()) / 1000).toString(),
            ...SECURITY_HEADERS,
          }
        }
      );
    }
  }

  // CSRF protection for API routes
  if (pathname.startsWith('/api/') && !validateCSRFToken(request)) {
    return new NextResponse(
      JSON.stringify({ error: 'Invalid CSRF token' }),
      { 
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          ...SECURITY_HEADERS,
        }
      }
    );
  }

  // Add security headers to response
  const response = NextResponse.next();
  
  // Apply security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add rate limit headers if applicable
  if (rateLimitConfig) {
    const rateLimit = checkRateLimit(clientId, rateLimitConfig);
    response.headers.set('X-RateLimit-Limit', rateLimitConfig.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', (rateLimit.remaining || 0).toString());
    response.headers.set('X-RateLimit-Reset', Math.ceil((rateLimit.resetTime || Date.now()) / 1000).toString());
  }

  return null; // Continue to next middleware
}

// CSRF token management utilities
export const csrfUtils = {
  // Generate and store CSRF token
  generateToken(sessionId: string): string {
    const token = generateCSRFToken();
    const expires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    
    csrfTokenStore.set(sessionId, { token, expires });
    return token;
  },

  // Validate CSRF token
  validateToken(sessionId: string, token: string): boolean {
    const stored = csrfTokenStore.get(sessionId);
    
    if (!stored || Date.now() > stored.expires) {
      csrfTokenStore.delete(sessionId);
      return false;
    }
    
    return stored.token === token;
  },

  // Clean expired tokens
  cleanExpiredTokens(): void {
    const now = Date.now();
    for (const [sessionId, data] of csrfTokenStore.entries()) {
      if (now > data.expires) {
        csrfTokenStore.delete(sessionId);
      }
    }
  }
};

// Security validation helpers
export const securityValidators = {
  // Validate request origin
  validateOrigin(request: NextRequest): boolean {
    if (process.env.NODE_ENV !== 'production') {
      return true; // Skip in development
    }

    const origin = request.headers.get('origin');
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_BASE_URL,
      'https://guidefilip-prague.com',
      'https://www.guidefilip-prague.com',
    ].filter(Boolean);

    return origin ? allowedOrigins.includes(origin) : false;
  },

  // Validate request headers
  validateHeaders(request: NextRequest): { valid: boolean; error?: string } {
    // Check for required headers on API requests
    if (request.nextUrl.pathname.startsWith('/api/')) {
      const contentType = request.headers.get('content-type');
      
      if (request.method === 'POST' && !contentType?.includes('application/json')) {
        return { valid: false, error: 'Invalid content type' };
      }
    }

    return { valid: true };
  },

  // Detect suspicious patterns
  detectSuspiciousActivity(request: NextRequest): { suspicious: boolean; reasons: string[] } {
    const reasons: string[] = [];
    const userAgent = request.headers.get('user-agent') || '';
    
    // Check for bot-like behavior
    if (userAgent.toLowerCase().includes('bot') && 
        !userAgent.toLowerCase().includes('googlebot')) {
      reasons.push('Suspicious user agent');
    }

    // Check for missing common headers
    if (!request.headers.get('accept')) {
      reasons.push('Missing accept header');
    }

    // Check for unusual request patterns
    if (request.nextUrl.pathname.includes('..') || 
        request.nextUrl.pathname.includes('%2e%2e')) {
      reasons.push('Path traversal attempt');
    }

    return {
      suspicious: reasons.length > 0,
      reasons,
    };
  }
};
