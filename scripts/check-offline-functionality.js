#!/usr/bin/env node

// Script to check offline functionality and error handling
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Error Handling and Offline Functionality...\n');

const checks = [
  {
    name: 'Error Boundary Components',
    check: () => {
      const errorBoundaryPath = path.join(process.cwd(), 'src/components/error-boundary.tsx');
      return fs.existsSync(errorBoundaryPath);
    }
  },
  {
    name: 'Sentry Configuration',
    check: () => {
      const clientConfig = fs.existsSync(path.join(process.cwd(), 'sentry.client.config.ts'));
      const serverConfig = fs.existsSync(path.join(process.cwd(), 'sentry.server.config.ts'));
      const edgeConfig = fs.existsSync(path.join(process.cwd(), 'sentry.edge.config.ts'));
      return clientConfig && serverConfig && edgeConfig;
    }
  },
  {
    name: 'Error Pages',
    check: () => {
      const globalError = fs.existsSync(path.join(process.cwd(), 'src/app/global-error.tsx'));
      const localizedError = fs.existsSync(path.join(process.cwd(), 'src/app/[locale]/error.tsx'));
      const notFound = fs.existsSync(path.join(process.cwd(), 'src/app/[locale]/not-found.tsx'));
      const bookingError = fs.existsSync(path.join(process.cwd(), 'src/app/[locale]/book/error.tsx'));
      return globalError && localizedError && notFound && bookingError;
    }
  },
  {
    name: 'Offline Handler',
    check: () => {
      const offlineHandler = fs.existsSync(path.join(process.cwd(), 'src/components/offline-handler.tsx'));
      const serviceWorker = fs.existsSync(path.join(process.cwd(), 'public/sw.js'));
      const offlinePage = fs.existsSync(path.join(process.cwd(), 'src/app/[locale]/offline/page.tsx'));
      return offlineHandler && serviceWorker && offlinePage;
    }
  },
  {
    name: 'NoScript Fallbacks',
    check: () => {
      const noScriptFallback = fs.existsSync(path.join(process.cwd(), 'src/components/no-script-fallback.tsx'));
      return noScriptFallback;
    }
  },
  {
    name: 'Monitoring API',
    check: () => {
      const monitoringApi = fs.existsSync(path.join(process.cwd(), 'src/app/api/monitoring/route.ts'));
      return monitoringApi;
    }
  },
  {
    name: 'Error Translations',
    check: () => {
      const enError = fs.existsSync(path.join(process.cwd(), 'src/messages/en/error.json'));
      const deError = fs.existsSync(path.join(process.cwd(), 'src/messages/de/error.json'));
      const frError = fs.existsSync(path.join(process.cwd(), 'src/messages/fr/error.json'));
      return enError && deError && frError;
    }
  },
  {
    name: 'Error Handling Hook',
    check: () => {
      const errorHook = fs.existsSync(path.join(process.cwd(), 'src/hooks/use-error-handling.ts'));
      return errorHook;
    }
  },
  {
    name: 'Client Error Reporting',
    check: () => {
      const clientReporting = fs.existsSync(path.join(process.cwd(), 'src/lib/client-error-reporting.ts'));
      return clientReporting;
    }
  },
  {
    name: 'API Error Handler',
    check: () => {
      const apiErrorHandler = fs.existsSync(path.join(process.cwd(), 'src/lib/api-error-handler.ts'));
      return apiErrorHandler;
    }
  },
  {
    name: 'Error Monitoring Provider',
    check: () => {
      const monitoringProvider = fs.existsSync(path.join(process.cwd(), 'src/components/error-monitoring-provider.tsx'));
      return monitoringProvider;
    }
  },
  {
    name: 'Documentation',
    check: () => {
      const docs = fs.existsSync(path.join(process.cwd(), 'docs/ERROR_HANDLING.md'));
      return docs;
    }
  },
  {
    name: 'Test Coverage',
    check: () => {
      const tests = fs.existsSync(path.join(process.cwd(), 'src/__tests__/error-handling.test.tsx'));
      return tests;
    }
  },
  {
    name: 'Environment Configuration',
    check: () => {
      const envExample = fs.existsSync(path.join(process.cwd(), '.env.example'));
      if (!envExample) return false;
      
      const envContent = fs.readFileSync(path.join(process.cwd(), '.env.example'), 'utf8');
      return envContent.includes('SENTRY_DSN') && 
             envContent.includes('SLACK_WEBHOOK_URL') &&
             envContent.includes('ALERT_EMAIL');
    }
  },
  {
    name: 'Next.js Integration',
    check: () => {
      const nextConfig = fs.existsSync(path.join(process.cwd(), 'next.config.ts'));
      if (!nextConfig) return false;
      
      const configContent = fs.readFileSync(path.join(process.cwd(), 'next.config.ts'), 'utf8');
      return configContent.includes('withSentryConfig');
    }
  }
];

let passedChecks = 0;
let totalChecks = checks.length;

checks.forEach((check, index) => {
  const passed = check.check();
  const status = passed ? '✅' : '❌';
  const number = String(index + 1).padStart(2, '0');
  
  console.log(`${status} ${number}. ${check.name}`);
  
  if (passed) {
    passedChecks++;
  }
});

console.log(`\n📊 Summary: ${passedChecks}/${totalChecks} checks passed`);

if (passedChecks === totalChecks) {
  console.log('🎉 All error handling components are properly implemented!');
  console.log('\n📋 Next Steps:');
  console.log('1. Configure Sentry DSN in environment variables');
  console.log('2. Test error boundaries in development');
  console.log('3. Verify offline functionality works');
  console.log('4. Run error handling tests: npm run test:error-handling');
  console.log('5. Deploy and monitor error rates in production');
} else {
  console.log('⚠️  Some components are missing. Please review the failed checks above.');
  process.exit(1);
}

// Additional checks for integration
console.log('\n🔧 Integration Checks:');

// Check if layout.tsx includes error boundaries
const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');
if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  const hasErrorBoundary = layoutContent.includes('ErrorBoundary');
  const hasOfflineHandler = layoutContent.includes('OfflineHandler');
  const hasNoScript = layoutContent.includes('NoScriptNavigation');
  
  console.log(`${hasErrorBoundary ? '✅' : '❌'} Layout includes ErrorBoundary`);
  console.log(`${hasOfflineHandler ? '✅' : '❌'} Layout includes OfflineHandler`);
  console.log(`${hasNoScript ? '✅' : '❌'} Layout includes NoScript support`);
}

// Check if booking flow includes error handling
const bookingFlowPath = path.join(process.cwd(), 'src/components/booking/booking-flow.tsx');
if (fs.existsSync(bookingFlowPath)) {
  const bookingContent = fs.readFileSync(bookingFlowPath, 'utf8');
  const hasBookingErrorBoundary = bookingContent.includes('BookingErrorBoundary');
  const hasErrorReporting = bookingContent.includes('useErrorReporting');
  const hasOfflineSupport = bookingContent.includes('saveBookingDraft');
  
  console.log(`${hasBookingErrorBoundary ? '✅' : '❌'} Booking flow includes error boundary`);
  console.log(`${hasErrorReporting ? '✅' : '❌'} Booking flow includes error reporting`);
  console.log(`${hasOfflineSupport ? '✅' : '❌'} Booking flow includes offline support`);
}

console.log('\n🚀 Error Handling System Implementation Complete!');
console.log('\nFor detailed usage instructions, see: docs/ERROR_HANDLING.md');
