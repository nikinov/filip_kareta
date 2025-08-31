// CSRF token generation endpoint
// Provides secure CSRF tokens for form submissions

import { NextRequest, NextResponse } from 'next/server';
import { SessionManager, sessionCSRF } from '@/lib/session-management';
import { SECURITY_HEADERS } from '@/lib/security-middleware';

export async function GET(request: NextRequest) {
  try {
    // Get or create session
    let session = await SessionManager.getSessionFromRequest(request);
    let sessionToken: string;

    if (!session) {
      // Create new session
      const { sessionToken: newToken, sessionData } = await SessionManager.createSession({}, request);
      session = sessionData;
      sessionToken = newToken;
    } else {
      // Update existing session activity
      sessionToken = await SessionManager.updateSessionActivity(
        request.cookies.get('session-token')?.value || ''
      ) || '';
    }

    // Generate CSRF token
    const csrfToken = session.csrfToken;

    // Create response
    const response = NextResponse.json({
      csrfToken,
      sessionId: session.sessionId,
      expiresAt: session.expiresAt,
    });

    // Set security headers
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Set session and CSRF cookies
    if (sessionToken) {
      SessionManager.setSessionCookie(response, sessionToken);
    }
    sessionCSRF.setCSRFCookie(response, csrfToken);

    return response;
  } catch (error) {
    console.error('CSRF token generation failed:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { 
        status: 500,
        headers: SECURITY_HEADERS,
      }
    );
  }
}

// Validate CSRF token endpoint
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { error: 'CSRF token is required' },
        { 
          status: 400,
          headers: SECURITY_HEADERS,
        }
      );
    }

    // Get session
    const session = await SessionManager.getSessionFromRequest(request);
    
    if (!session) {
      return NextResponse.json(
        { error: 'No valid session found' },
        { 
          status: 401,
          headers: SECURITY_HEADERS,
        }
      );
    }

    // Validate CSRF token
    const isValid = sessionCSRF.validateToken(session, token);

    const response = NextResponse.json({
      valid: isValid,
      sessionId: session.sessionId,
    });

    // Set security headers
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    console.error('CSRF token validation failed:', error);
    
    return NextResponse.json(
      { error: 'Failed to validate CSRF token' },
      { 
        status: 500,
        headers: SECURITY_HEADERS,
      }
    );
  }
}
