#!/usr/bin/env node

// Comprehensive test runner script
// Runs unit tests, integration tests, e2e tests, and generates reports

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  testTypes: {
    unit: {
      command: 'npm run test:unit',
      description: 'Unit tests (Jest)',
    },
    integration: {
      command: 'npm run test:integration',
      description: 'Integration tests (Jest)',
    },
    e2e: {
      command: 'npm run test:e2e',
      description: 'End-to-end tests (Playwright)',
    },
    accessibility: {
      command: 'npm run test:a11y',
      description: 'Accessibility tests (Jest + axe)',
    },
    performance: {
      command: 'npm run test:performance',
      description: 'Performance tests (Playwright)',
    },
  },
  reports: {
    coverage: './coverage',
    junit: './test-results/junit.xml',
    playwright: './playwright-report',
  },
};

// Utility functions
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow
    error: '\x1b[31m',   // Red
    reset: '\x1b[0m',    // Reset
  };
  
  const prefix = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };
  
  console.log(`${colors[type]}${prefix[type]} ${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`Running ${description}...`);
  
  try {
    execSync(command, { 
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'test' }
    });
    log(`${description} completed successfully`, 'success');
    return true;
  } catch (error) {
    log(`${description} failed`, 'error');
    return false;
  }
}

function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log(`Created directory: ${dir}`);
  }
}

function generateTestReport() {
  log('Generating comprehensive test report...');
  
  const reportData = {
    timestamp: new Date().toISOString(),
    testResults: {},
    coverage: null,
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
    },
  };
  
  // Read Jest coverage report if available
  const coveragePath = path.join(config.reports.coverage, 'coverage-summary.json');
  if (fs.existsSync(coveragePath)) {
    try {
      const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
      reportData.coverage = coverageData.total;
      log('Coverage data included in report', 'success');
    } catch (error) {
      log('Failed to read coverage data', 'warning');
    }
  }
  
  // Read JUnit report if available
  const junitPath = config.reports.junit;
  if (fs.existsSync(junitPath)) {
    log('JUnit report found', 'success');
  }
  
  // Write comprehensive report
  const reportPath = './test-results/test-report.json';
  ensureDirectoryExists('./test-results');
  fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  
  log(`Test report generated: ${reportPath}`, 'success');
}

function printSummary(results) {
  log('\n📊 Test Summary:', 'info');
  console.log('================');
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  Object.entries(results).forEach(([testType, passed]) => {
    const status = passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`${testType.padEnd(15)} ${status}`);
    
    if (passed) totalPassed++;
    else totalFailed++;
  });
  
  console.log('================');
  console.log(`Total: ${totalPassed + totalFailed}`);
  console.log(`Passed: ${totalPassed}`);
  console.log(`Failed: ${totalFailed}`);
  
  if (totalFailed === 0) {
    log('🎉 All tests passed!', 'success');
  } else {
    log(`⚠️  ${totalFailed} test suite(s) failed`, 'warning');
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const testType = args[0];
  
  log('🧪 Starting comprehensive test suite...');
  
  // Ensure test directories exist
  ensureDirectoryExists('./test-results');
  ensureDirectoryExists('./coverage');
  
  const results = {};
  
  if (testType && config.testTypes[testType]) {
    // Run specific test type
    const test = config.testTypes[testType];
    results[testType] = runCommand(test.command, test.description);
  } else if (testType === 'all' || !testType) {
    // Run all tests
    for (const [type, test] of Object.entries(config.testTypes)) {
      results[type] = runCommand(test.command, test.description);
      
      // Add delay between test suites
      if (type !== 'performance') {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  } else {
    log(`Unknown test type: ${testType}`, 'error');
    log('Available test types:', 'info');
    Object.keys(config.testTypes).forEach(type => {
      console.log(`  - ${type}`);
    });
    process.exit(1);
  }
  
  // Generate reports
  generateTestReport();
  
  // Print summary
  printSummary(results);
  
  // Exit with appropriate code
  const hasFailures = Object.values(results).some(result => !result);
  process.exit(hasFailures ? 1 : 0);
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  log(`Uncaught exception: ${error.message}`, 'error');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log(`Unhandled rejection: ${reason}`, 'error');
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main().catch((error) => {
    log(`Script failed: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { main, config };
