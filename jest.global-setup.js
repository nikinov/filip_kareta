// Jest global setup
// Runs once before all tests to set up the testing environment

module.exports = async () => {
  console.log('🧪 Setting up Jest testing environment...');
  
  // Set up test database (if needed)
  // await setupTestDatabase();
  
  // Set up test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-for-testing-purposes-only-32-chars';
  process.env.SECURITY_API_KEY = 'test-security-key';
  process.env.GDPR_CONTACT_EMAIL = 'privacy@test.com';
  process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';
  
  // Clean up any existing test data
  // await cleanupTestData();
  
  console.log('✅ Jest testing environment ready');
};
