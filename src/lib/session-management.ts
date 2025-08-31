// Secure session management for user data and booking flows
// Implements secure session handling with encryption and proper lifecycle management

import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

export interface SessionData {
  sessionId: string;
  userId?: string;
  email?: string;
  bookingData?: any;
  csrfToken: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
}

export interface BookingSession {
  sessionId: string;
  tourId: string;
  step: number;
  data: {
    tourDetails?: any;
    customerInfo?: any;
    paymentInfo?: any;
  };
  createdAt: Date;
  expiresAt: Date;
}

// Session configuration
export const SESSION_CONFIG = {
  // Session duration
  DURATION_MS: 24 * 60 * 60 * 1000, // 24 hours
  BOOKING_SESSION_DURATION_MS: 30 * 60 * 1000, // 30 minutes for booking flow
  
  // Security settings
  COOKIE_NAME: 'session-token',
  BOOKING_COOKIE_NAME: 'booking-session',
  CSRF_COOKIE_NAME: 'csrf-token',
  
  // Cookie options
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
  },
};

// Get JWT secret from environment
function getJWTSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || 'fallback-secret-for-development-only';
  return new TextEncoder().encode(secret);
}

// Session management class
export class SessionManager {
  // Create a new session
  static async createSession(
    data: Partial<SessionData>,
    request: NextRequest
  ): Promise<{ sessionToken: string; sessionData: SessionData }> {
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 15)}`;
    const csrfToken = `csrf_${Date.now()}_${Math.random().toString(36).substr(2, 15)}`;
    const now = new Date();
    
    const sessionData: SessionData = {
      sessionId,
      csrfToken,
      createdAt: now,
      lastActivity: now,
      expiresAt: new Date(now.getTime() + SESSION_CONFIG.DURATION_MS),
      ipAddress: this.getClientIP(request),
      userAgent: request.headers.get('user-agent') || '',
      ...data,
    };

    // Create JWT token
    const sessionToken = await new SignJWT({ sessionData })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(sessionData.expiresAt)
      .sign(getJWTSecret());

    return { sessionToken, sessionData };
  }

  // Validate and decode session
  static async validateSession(sessionToken: string): Promise<SessionData | null> {
    try {
      const { payload } = await jwtVerify(sessionToken, getJWTSecret());
      const sessionData = payload.sessionData as SessionData;
      
      // Check if session is expired
      if (new Date() > new Date(sessionData.expiresAt)) {
        return null;
      }

      return sessionData;
    } catch (error) {
      console.error('Session validation failed:', error);
      return null;
    }
  }

  // Update session activity
  static async updateSessionActivity(
    sessionToken: string,
    updates?: Partial<SessionData>
  ): Promise<string | null> {
    const sessionData = await this.validateSession(sessionToken);
    if (!sessionData) {
      return null;
    }

    const updatedData: SessionData = {
      ...sessionData,
      lastActivity: new Date(),
      ...updates,
    };

    // Create new JWT with updated data
    const newToken = await new SignJWT({ sessionData: updatedData })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(updatedData.expiresAt)
      .sign(getJWTSecret());

    return newToken;
  }

  // Set session cookie
  static setSessionCookie(response: NextResponse, sessionToken: string): void {
    response.cookies.set(SESSION_CONFIG.COOKIE_NAME, sessionToken, {
      ...SESSION_CONFIG.COOKIE_OPTIONS,
      maxAge: SESSION_CONFIG.DURATION_MS / 1000,
    });
  }

  // Clear session cookie
  static clearSessionCookie(response: NextResponse): void {
    response.cookies.delete(SESSION_CONFIG.COOKIE_NAME);
  }

  // Get session from request
  static async getSessionFromRequest(request: NextRequest): Promise<SessionData | null> {
    const sessionToken = request.cookies.get(SESSION_CONFIG.COOKIE_NAME)?.value;
    if (!sessionToken) {
      return null;
    }

    return this.validateSession(sessionToken);
  }

  // Get client IP address
  private static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    return forwarded?.split(',')[0] || realIp || 'unknown';
  }

  // Create booking session (shorter duration)
  static async createBookingSession(
    tourId: string,
    request: NextRequest
  ): Promise<{ sessionToken: string; sessionData: BookingSession }> {
    const sessionId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 15)}`;
    const now = new Date();
    
    const sessionData: BookingSession = {
      sessionId,
      tourId,
      step: 1,
      data: {},
      createdAt: now,
      expiresAt: new Date(now.getTime() + SESSION_CONFIG.BOOKING_SESSION_DURATION_MS),
    };

    const sessionToken = await new SignJWT({ bookingSession: sessionData })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(sessionData.expiresAt)
      .sign(getJWTSecret());

    return { sessionToken, sessionData };
  }

  // Update booking session
  static async updateBookingSession(
    sessionToken: string,
    step: number,
    data: any
  ): Promise<string | null> {
    try {
      const { payload } = await jwtVerify(sessionToken, getJWTSecret());
      const sessionData = payload.bookingSession as BookingSession;
      
      if (new Date() > new Date(sessionData.expiresAt)) {
        return null;
      }

      const updatedData: BookingSession = {
        ...sessionData,
        step,
        data: { ...sessionData.data, ...data },
      };

      const newToken = await new SignJWT({ bookingSession: updatedData })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(updatedData.expiresAt)
        .sign(getJWTSecret());

      return newToken;
    } catch (error) {
      console.error('Booking session update failed:', error);
      return null;
    }
  }

  // Set booking session cookie
  static setBookingSessionCookie(response: NextResponse, sessionToken: string): void {
    response.cookies.set(SESSION_CONFIG.BOOKING_COOKIE_NAME, sessionToken, {
      ...SESSION_CONFIG.COOKIE_OPTIONS,
      maxAge: SESSION_CONFIG.BOOKING_SESSION_DURATION_MS / 1000,
    });
  }

  // Clear booking session cookie
  static clearBookingSessionCookie(response: NextResponse): void {
    response.cookies.delete(SESSION_CONFIG.BOOKING_COOKIE_NAME);
  }

  // Validate session security
  static validateSessionSecurity(
    sessionData: SessionData,
    request: NextRequest
  ): { valid: boolean; reason?: string } {
    // Check IP address consistency (optional, can be disabled for mobile users)
    const currentIP = this.getClientIP(request);
    if (process.env.ENFORCE_IP_CONSISTENCY === 'true' && 
        sessionData.ipAddress !== currentIP) {
      return { valid: false, reason: 'IP address mismatch' };
    }

    // Check user agent consistency
    const currentUserAgent = request.headers.get('user-agent') || '';
    if (sessionData.userAgent !== currentUserAgent) {
      // Log suspicious activity but don't block (user agents can change)
      console.warn('User agent mismatch detected', {
        sessionId: sessionData.sessionId,
        original: sessionData.userAgent,
        current: currentUserAgent,
      });
    }

    // Check session age
    const sessionAge = Date.now() - sessionData.createdAt.getTime();
    const maxAge = SESSION_CONFIG.DURATION_MS;
    if (sessionAge > maxAge) {
      return { valid: false, reason: 'Session expired' };
    }

    return { valid: true };
  }

  // Clean expired sessions (for cleanup jobs)
  static cleanExpiredSessions(): void {
    // In production, implement database cleanup
    console.log('Cleaning expired sessions...');
  }
}

// Session middleware helper
export async function withSession(
  request: NextRequest,
  handler: (session: SessionData | null) => Promise<NextResponse>
): Promise<NextResponse> {
  const session = await SessionManager.getSessionFromRequest(request);
  
  // Validate session security if it exists
  if (session) {
    const validation = SessionManager.validateSessionSecurity(session, request);
    if (!validation.valid) {
      // Clear invalid session
      const response = await handler(null);
      SessionManager.clearSessionCookie(response);
      return response;
    }
  }

  return handler(session);
}

// CSRF token utilities for sessions
export const sessionCSRF = {
  // Generate CSRF token for session
  generateToken(): string {
    return `csrf_${Date.now()}_${Math.random().toString(36).substr(2, 15)}`;
  },

  // Validate CSRF token from session
  validateToken(sessionData: SessionData | null, providedToken: string): boolean {
    if (!sessionData || !providedToken) {
      return false;
    }

    return sessionData.csrfToken === providedToken;
  },

  // Set CSRF token cookie
  setCSRFCookie(response: NextResponse, token: string): void {
    response.cookies.set(SESSION_CONFIG.CSRF_COOKIE_NAME, token, {
      httpOnly: false, // Needs to be accessible by client-side scripts
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_CONFIG.DURATION_MS / 1000,
      path: '/',
    });
  },
};
