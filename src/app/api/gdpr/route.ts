// GDPR compliance API endpoints
// Handles data subject rights, consent management, and privacy requests

import { NextRequest, NextResponse } from 'next/server';
import { GDPRCompliance, cookieConsent, dataExport, ConsentType } from '@/lib/gdpr-compliance';
import { SessionManager } from '@/lib/session-management';
import { SECURITY_HEADERS } from '@/lib/security-middleware';
import { z } from 'zod';

// Validation schemas
const consentRequestSchema = z.object({
  consentTypes: z.array(z.enum(['necessary', 'analytics', 'marketing', 'personalization', 'booking_data', 'communication'])),
  email: z.string().email().optional(),
  legalBasis: z.enum(['consent', 'contract', 'legal_obligation', 'legitimate_interest']).default('consent'),
});

const dataRequestSchema = z.object({
  requestType: z.enum(['access', 'portability', 'erasure', 'rectification', 'restriction']),
  email: z.string().email(),
  userId: z.string().optional(),
  description: z.string().max(1000).optional(),
});

// POST - Handle consent updates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    const response = NextResponse.json({ success: true });
    
    // Set security headers
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    switch (action) {
      case 'update-consent': {
        const validation = consentRequestSchema.safeParse(body);
        if (!validation.success) {
          return NextResponse.json(
            { error: 'Invalid consent data', details: validation.error.errors },
            { status: 400, headers: SECURITY_HEADERS }
          );
        }

        const { consentTypes, email, legalBasis } = validation.data;
        
        // Record consent
        const consent = GDPRCompliance.recordConsent({
          email,
          ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
          userAgent: request.headers.get('user-agent') || '',
          consentTypes,
          legalBasis,
          dataRetentionPeriod: 1095, // 3 years default
        });

        // Set consent cookie
        cookieConsent.setConsentCookie(response, consentTypes);

        return NextResponse.json({
          success: true,
          consentId: consent.id,
          message: 'Consent preferences updated successfully',
        }, { headers: SECURITY_HEADERS });
      }

      case 'withdraw-consent': {
        const { consentId } = body;
        if (!consentId) {
          return NextResponse.json(
            { error: 'Consent ID is required' },
            { status: 400, headers: SECURITY_HEADERS }
          );
        }

        const success = GDPRCompliance.withdrawConsent(consentId);
        
        if (success) {
          // Clear consent cookie
          cookieConsent.clearConsentCookie(response);
          
          return NextResponse.json({
            success: true,
            message: 'Consent withdrawn successfully',
          }, { headers: SECURITY_HEADERS });
        } else {
          return NextResponse.json(
            { error: 'Failed to withdraw consent' },
            { status: 500, headers: SECURITY_HEADERS }
          );
        }
      }

      case 'data-request': {
        const validation = dataRequestSchema.safeParse(body);
        if (!validation.success) {
          return NextResponse.json(
            { error: 'Invalid data request', details: validation.error.errors },
            { status: 400, headers: SECURITY_HEADERS }
          );
        }

        const { requestType, email, userId, description } = validation.data;

        // Log the data request for manual processing
        console.log('GDPR Data Request:', {
          type: requestType,
          email,
          userId,
          description,
          timestamp: new Date().toISOString(),
          ip: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
        });

        // In production, this would create a ticket in your support system
        const requestId = `gdpr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        return NextResponse.json({
          success: true,
          requestId,
          message: `Your ${requestType} request has been received and will be processed within 30 days.`,
          contactEmail: process.env.GDPR_CONTACT_EMAIL || 'privacy@guidefilip-prague.com',
        }, { headers: SECURITY_HEADERS });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400, headers: SECURITY_HEADERS }
        );
    }
  } catch (error) {
    console.error('GDPR API error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: SECURITY_HEADERS,
      }
    );
  }
}

// GET - Retrieve privacy policy data and user rights information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    const response = NextResponse.json({ success: true });
    
    // Set security headers
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    switch (action) {
      case 'privacy-policy': {
        const policyData = GDPRCompliance.getPrivacyPolicyData();
        
        return NextResponse.json({
          success: true,
          data: policyData,
        }, { headers: SECURITY_HEADERS });
      }

      case 'user-rights': {
        const rights = GDPRCompliance.getDataSubjectRights();
        
        return NextResponse.json({
          success: true,
          data: rights,
        }, { headers: SECURITY_HEADERS });
      }

      case 'consent-status': {
        const consentStatus = cookieConsent.getConsentStatus(request);
        
        return NextResponse.json({
          success: true,
          data: consentStatus,
        }, { headers: SECURITY_HEADERS });
      }

      case 'export-data': {
        const userId = searchParams.get('userId');
        if (!userId) {
          return NextResponse.json(
            { error: 'User ID is required for data export' },
            { status: 400, headers: SECURITY_HEADERS }
          );
        }

        // In production, verify user identity before export
        const exportData = await dataExport.exportUserData(userId);
        
        return NextResponse.json({
          success: true,
          data: exportData,
        }, { headers: SECURITY_HEADERS });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400, headers: SECURITY_HEADERS }
        );
    }
  } catch (error) {
    console.error('GDPR GET API error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: SECURITY_HEADERS,
      }
    );
  }
}

// DELETE - Handle data deletion requests
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const confirmationCode = searchParams.get('confirmation');

    if (!userId || !confirmationCode) {
      return NextResponse.json(
        { error: 'User ID and confirmation code are required' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // In production, verify confirmation code sent via email
    if (confirmationCode !== 'CONFIRMED') {
      return NextResponse.json(
        { error: 'Invalid confirmation code' },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    // Delete user data
    const deletionResult = await dataExport.deleteUserData(userId);

    return NextResponse.json({
      success: deletionResult.success,
      data: deletionResult,
    }, { headers: SECURITY_HEADERS });
  } catch (error) {
    console.error('GDPR DELETE API error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: SECURITY_HEADERS,
      }
    );
  }
}
