// Health check API endpoint for booking system monitoring

import { NextRequest, NextResponse } from 'next/server';
import { getHealthCheckData } from '@/lib/booking-monitoring';
import { getBookingProvider } from '@/lib/booking-providers';

export async function GET(request: NextRequest) {
  try {
    // Get basic health data
    const healthData = getHealthCheckData();
    
    // Test booking provider connectivity
    const provider = getBookingProvider();
    let providerStatus = 'unknown';
    let providerError = null;
    
    try {
      // Test with a simple availability check for a known tour
      // Using a date far in the future to avoid affecting real availability
      const testDate = new Date();
      testDate.setDate(testDate.getDate() + 365);
      
      const testResult = await Promise.race([
        provider.checkAvailability('prague-castle', testDate),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )
      ]);
      
      providerStatus = 'connected';
    } catch (error) {
      providerStatus = 'error';
      providerError = error instanceof Error ? error.message : 'Unknown error';
    }

    // Determine overall system status
    let overallStatus = healthData.status;
    if (providerStatus === 'error') {
      overallStatus = 'unhealthy';
    }

    const response = {
      ...healthData,
      status: overallStatus,
      services: {
        bookingProvider: {
          name: provider.name,
          status: providerStatus,
          error: providerError,
        },
        database: {
          status: 'not_applicable', // No database in current implementation
        },
        api: {
          status: 'healthy',
        },
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        bookingProvider: process.env.BOOKING_PROVIDER || 'acuity',
      },
    };

    // Return appropriate HTTP status based on health
    const httpStatus = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;

    return NextResponse.json(response, { status: httpStatus });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check failed',
      services: {
        api: {
          status: 'error',
          error: 'Health check endpoint failure',
        },
      },
    }, { status: 503 });
  }
}

// Detailed health check with more comprehensive testing
export async function POST(request: NextRequest) {
  try {
    const { testBookingProvider = false } = await request.json().catch(() => ({}));
    
    const healthData = getHealthCheckData();
    const provider = getBookingProvider();
    
    const tests = {
      basicHealth: { status: 'passed', duration: 0 },
      providerConnection: { status: 'skipped', duration: 0 },
      availabilityCheck: { status: 'skipped', duration: 0 },
    };

    // Basic health test
    const basicStart = Date.now();
    tests.basicHealth.duration = Date.now() - basicStart;

    // Provider connection test
    if (testBookingProvider) {
      const providerStart = Date.now();
      try {
        // Test provider connectivity
        const testDate = new Date();
        testDate.setDate(testDate.getDate() + 30);
        
        await Promise.race([
          provider.checkAvailability('prague-castle', testDate),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout after 10s')), 10000)
          )
        ]);
        
        tests.providerConnection.status = 'passed';
        tests.availabilityCheck.status = 'passed';
      } catch (error) {
        tests.providerConnection.status = 'failed';
        tests.availabilityCheck.status = 'failed';
      }
      tests.providerConnection.duration = Date.now() - providerStart;
      tests.availabilityCheck.duration = tests.providerConnection.duration;
    }

    const overallTestStatus = Object.values(tests).every(test => 
      test.status === 'passed' || test.status === 'skipped'
    ) ? 'passed' : 'failed';

    return NextResponse.json({
      ...healthData,
      detailedTests: {
        status: overallTestStatus,
        tests,
        totalDuration: Object.values(tests).reduce((sum, test) => sum + test.duration, 0),
      },
      services: {
        bookingProvider: {
          name: provider.name,
          tested: testBookingProvider,
        },
      },
    });

  } catch (error) {
    console.error('Detailed health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Detailed health check failed',
      detailedTests: {
        status: 'failed',
        error: 'Health check endpoint failure',
      },
    }, { status: 503 });
  }
}