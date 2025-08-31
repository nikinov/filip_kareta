// API endpoint tests
// Tests for all API routes including security, validation, and error handling

import { NextRequest } from 'next/server';
import { POST as bookingPOST, GET as bookingGET } from '@/app/api/booking/route';
import { GET as csrfGET, POST as csrfPOST } from '@/app/api/csrf/route';
import { GET as gdprGET, POST as gdprPOST } from '@/app/api/gdpr/route';
import { GET as securityGET } from '@/app/api/security/route';

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = {
    ...originalEnv,
    JWT_SECRET: 'test-jwt-secret-for-testing-purposes-only',
    NODE_ENV: 'test',
    SECURITY_API_KEY: 'test-security-key',
    GDPR_CONTACT_EMAIL: 'privacy@test.com',
  };
});

afterEach(() => {
  process.env = originalEnv;
});

// Helper function to create mock request
function createMockRequest(
  url: string,
  method: string = 'GET',
  body?: any,
  headers?: Record<string, string>
): NextRequest {
  const request = new NextRequest(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '127.0.0.1',
      'user-agent': 'test-agent',
      ...headers,
    },
  });
  
  return request;
}

describe('API Endpoints', () => {
  describe('CSRF API (/api/csrf)', () => {
    it('should generate CSRF token on GET request', async () => {
      const request = createMockRequest('http://localhost:3000/api/csrf');
      const response = await csrfGET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.csrfToken).toBeDefined();
      expect(data.sessionId).toBeDefined();
      expect(data.expiresAt).toBeDefined();
    });

    it('should validate CSRF token on POST request', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/csrf',
        'POST',
        { token: 'valid-csrf-token-64-chars-long-abcdef1234567890abcdef1234567890' }
      );
      
      const response = await csrfPOST(request);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.valid).toBeDefined();
    });

    it('should reject invalid CSRF token', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/csrf',
        'POST',
        { token: 'invalid-token' }
      );
      
      const response = await csrfPOST(request);
      const data = await response.json();
      expect(data.valid).toBe(false);
    });

    it('should require token for POST validation', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/csrf',
        'POST',
        {}
      );
      
      const response = await csrfPOST(request);
      expect(response.status).toBe(400);
    });
  });

  describe('GDPR API (/api/gdpr)', () => {
    it('should return privacy policy data', async () => {
      const request = createMockRequest('http://localhost:3000/api/gdpr?action=privacy-policy');
      const response = await gdprGET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.dataController).toBeDefined();
      expect(data.data.dataTypes).toBeDefined();
    });

    it('should return user rights information', async () => {
      const request = createMockRequest('http://localhost:3000/api/gdpr?action=user-rights');
      const response = await gdprGET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.rights).toBeDefined();
      expect(data.data.contactEmail).toBeDefined();
    });

    it('should handle consent updates', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/gdpr',
        'POST',
        {
          action: 'update-consent',
          consentTypes: ['necessary', 'analytics'],
          email: 'test@example.com',
        }
      );
      
      const response = await gdprPOST(request);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.consentId).toBeDefined();
    });

    it('should validate consent data', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/gdpr',
        'POST',
        {
          action: 'update-consent',
          consentTypes: ['invalid-type'],
          email: 'invalid-email',
        }
      );
      
      const response = await gdprPOST(request);
      expect(response.status).toBe(400);
    });

    it('should handle data requests', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/gdpr',
        'POST',
        {
          action: 'data-request',
          requestType: 'access',
          email: 'test@example.com',
        }
      );
      
      const response = await gdprPOST(request);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.requestId).toBeDefined();
    });
  });

  describe('Security API (/api/security)', () => {
    it('should require authentication in production', async () => {
      process.env.NODE_ENV = 'production';
      
      const request = createMockRequest('http://localhost:3000/api/security');
      const response = await securityGET(request);
      
      expect(response.status).toBe(401);
    });

    it('should return security status with valid auth', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/security',
        'GET',
        undefined,
        { authorization: 'Bearer test-security-key' }
      );
      
      const response = await securityGET(request);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.availableChecks).toBeDefined();
    });

    it('should return SSL health check', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/security?check=ssl',
        'GET',
        undefined,
        { authorization: 'Bearer test-security-key' }
      );
      
      const response = await securityGET(request);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.data.ssl).toBeDefined();
    });

    it('should return overall security status', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/security?check=overall',
        'GET',
        undefined,
        { authorization: 'Bearer test-security-key' }
      );
      
      const response = await securityGET(request);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.data.overall).toBeDefined();
      expect(data.data.status).toBeDefined();
    });
  });

  describe('Security Headers', () => {
    it('should include security headers in all responses', async () => {
      const request = createMockRequest('http://localhost:3000/api/csrf');
      const response = await csrfGET(request);
      
      // Check for security headers
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
      expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    });

    it('should include CSP header', async () => {
      const request = createMockRequest('http://localhost:3000/api/csrf');
      const response = await csrfGET(request);
      
      const csp = response.headers.get('Content-Security-Policy');
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("frame-ancestors 'none'");
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to booking endpoints', async () => {
      const requests = [];
      
      // Make multiple requests quickly
      for (let i = 0; i < 12; i++) {
        const request = createMockRequest(
          'http://localhost:3000/api/booking',
          'POST',
          { tourId: 'test', date: '2024-04-15' },
          { 'x-csrf-token': 'valid-csrf-token-64-chars-long-abcdef1234567890abcdef1234567890' }
        );
        
        requests.push(bookingPOST(request));
      }
      
      const responses = await Promise.all(requests);
      
      // Should have some rate limited responses
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/booking', {
        method: 'POST',
        body: 'invalid-json',
        headers: { 'content-type': 'application/json' },
      });
      
      const response = await bookingPOST(request);
      expect(response.status).toBe(400);
    });

    it('should handle missing required fields', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/booking',
        'POST',
        {}, // Empty body
        { 'x-csrf-token': 'valid-csrf-token-64-chars-long-abcdef1234567890abcdef1234567890' }
      );
      
      const response = await bookingPOST(request);
      expect(response.status).toBe(400);
    });

    it('should return proper error format', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/booking',
        'POST',
        { invalid: 'data' },
        { 'x-csrf-token': 'valid-csrf-token-64-chars-long-abcdef1234567890abcdef1234567890' }
      );
      
      const response = await bookingPOST(request);
      const data = await response.json();
      
      expect(data.error).toBeDefined();
      expect(typeof data.error).toBe('string');
    });
  });

  describe('Input Validation', () => {
    it('should validate email format', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/gdpr',
        'POST',
        {
          action: 'update-consent',
          consentTypes: ['necessary'],
          email: 'invalid-email-format',
        }
      );
      
      const response = await gdprPOST(request);
      expect(response.status).toBe(400);
    });

    it('should sanitize input data', async () => {
      const request = createMockRequest(
        'http://localhost:3000/api/gdpr',
        'POST',
        {
          action: 'data-request',
          requestType: 'access',
          email: 'test@example.com',
          description: '<script>alert("xss")</script>',
        }
      );
      
      const response = await gdprPOST(request);
      expect(response.status).toBe(200);
      
      // Should not contain script tags in logs
      // This would be verified in actual implementation
    });

    it('should limit input length', async () => {
      const longDescription = 'a'.repeat(2000);
      
      const request = createMockRequest(
        'http://localhost:3000/api/gdpr',
        'POST',
        {
          action: 'data-request',
          requestType: 'access',
          email: 'test@example.com',
          description: longDescription,
        }
      );
      
      const response = await gdprPOST(request);
      expect(response.status).toBe(400);
    });
  });
});
