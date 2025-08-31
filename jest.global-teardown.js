// Jest global teardown
// Runs once after all tests to clean up the testing environment

module.exports = async () => {
  console.log('🧹 Cleaning up Jest testing environment...');
  
  // Clean up test database (if needed)
  // await cleanupTestDatabase();
  
  // Clean up test files
  // await cleanupTestFiles();
  
  // Reset environment variables
  delete process.env.JWT_SECRET;
  delete process.env.SECURITY_API_KEY;
  delete process.env.GDPR_CONTACT_EMAIL;
  
  console.log('✅ Jest testing environment cleaned up');
};
