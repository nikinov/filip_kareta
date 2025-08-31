# Testing Suite Documentation

This document outlines the comprehensive testing strategy for the Prague Tour Guide website, covering unit tests, integration tests, end-to-end tests, accessibility testing, and performance testing.

## 🧪 Testing Overview

### Testing Stack
- **Unit/Integration Tests**: Jest + React Testing Library
- **End-to-End Tests**: Playwright
- **Accessibility Tests**: jest-axe + axe-core
- **Performance Tests**: Playwright + Core Web Vitals
- **API Tests**: Jest + Supertest
- **Cross-Browser Tests**: Playwright (Chrome, Firefox, Safari)

### Test Coverage Goals
- **Overall Coverage**: 70%+ (branches, functions, lines, statements)
- **Utility Functions**: 80%+ coverage
- **Components**: 75%+ coverage
- **API Endpoints**: 90%+ coverage

## 🏗️ Test Structure

```
src/
├── __tests__/
│   ├── components/
│   │   ├── ui-components.test.tsx
│   │   └── booking-components.test.tsx
│   ├── utils/
│   │   ├── utility-functions.test.ts
│   │   └── validation.test.ts
│   ├── api/
│   │   ├── api-endpoints.test.ts
│   │   └── security.test.ts
│   └── accessibility/
│       └── a11y.test.tsx
e2e/
├── booking-flow.spec.ts
├── performance.spec.ts
├── cross-browser.spec.ts
└── accessibility.spec.ts
```

## 🚀 Running Tests

### Quick Commands
```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests
npm run test:e2e          # End-to-end tests
npm run test:a11y         # Accessibility tests
npm run test:performance  # Performance tests

# Development workflow
npm run test:watch        # Watch mode for development
npm run test:coverage     # Generate coverage report
npm run test:changed      # Test only changed files
```

### Comprehensive Testing
```bash
# Run complete test suite
npm run test:all

# CI/CD pipeline tests
npm run test:ci

# Quick smoke tests
npm run test:quick
```

## 📋 Test Categories

### 1. Unit Tests

**Location**: `src/__tests__/`

**Coverage**:
- UI Components (Button, Input, Card, etc.)
- Utility functions (formatting, validation, etc.)
- Business logic functions
- Custom hooks

**Example**:
```typescript
describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 2. Integration Tests

**Location**: `src/__tests__/integration/`

**Coverage**:
- Component integration with context providers
- API integration with components
- Form submission workflows
- Payment integration flows

### 3. End-to-End Tests

**Location**: `e2e/`

**Coverage**:
- Complete booking flow
- User authentication
- Payment processing
- Multi-language support
- Mobile responsiveness

**Example**:
```typescript
test('complete booking flow', async ({ page }) => {
  await page.goto('/en/tours/prague-castle');
  await page.click('[data-testid="book-now-button"]');
  
  // Fill booking form
  await page.fill('[data-testid="first-name"]', 'John');
  await page.fill('[data-testid="email"]', 'john@example.com');
  
  // Complete payment
  await page.click('[data-testid="complete-payment"]');
  
  // Verify confirmation
  await expect(page.locator('[data-testid="booking-confirmation"]')).toBeVisible();
});
```

### 4. Accessibility Tests

**Location**: `src/__tests__/accessibility/`

**Coverage**:
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader compatibility
- Color contrast validation
- Focus management

**Example**:
```typescript
it('should be accessible', async () => {
  const { container } = render(<BookingForm />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 5. Performance Tests

**Location**: `e2e/performance.spec.ts`

**Coverage**:
- Core Web Vitals (LCP, FID, CLS)
- Page load times
- Resource optimization
- Bundle size analysis
- Mobile performance

**Thresholds**:
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1
- TTFB: < 600ms

### 6. API Tests

**Location**: `src/__tests__/api/`

**Coverage**:
- Endpoint functionality
- Request/response validation
- Error handling
- Security measures (CSRF, rate limiting)
- Authentication/authorization

## 🔧 Test Configuration

### Jest Configuration (`jest.config.mjs`)
```javascript
const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

### Playwright Configuration (`playwright.config.ts`)
```typescript
export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: { timeout: 5000 },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['iPhone 12'] } },
  ],
});
```

## 🎯 Testing Best Practices

### 1. Test Structure
- **Arrange**: Set up test data and environment
- **Act**: Execute the functionality being tested
- **Assert**: Verify the expected outcome

### 2. Test Naming
```typescript
// Good: Descriptive test names
it('should display error message when email is invalid', () => {});

// Bad: Vague test names
it('should work', () => {});
```

### 3. Test Data
```typescript
// Use factories for consistent test data
const createMockBooking = () => ({
  tourId: 'prague-castle',
  date: '2024-04-15',
  customerInfo: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
  },
});
```

### 4. Mocking
```typescript
// Mock external dependencies
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve(mockStripe)),
}));
```

### 5. Accessibility Testing
```typescript
// Always test for accessibility
it('should be accessible', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## 📊 Test Reports

### Coverage Reports
- **HTML Report**: `./coverage/lcov-report/index.html`
- **JSON Report**: `./coverage/coverage-final.json`
- **Text Summary**: Console output during test runs

### E2E Reports
- **HTML Report**: `./playwright-report/index.html`
- **JUnit XML**: `./test-results/results.xml`
- **Screenshots**: `./test-results/` (on failures)

### CI/CD Integration
```yaml
# GitHub Actions example
- name: Run Tests
  run: |
    npm run test:ci
    npm run test:coverage
    
- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

## 🐛 Debugging Tests

### Jest Debugging
```bash
# Debug specific test
npm test -- --testNamePattern="booking flow" --verbose

# Run tests in watch mode
npm run test:watch

# Debug with Node.js debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Playwright Debugging
```bash
# Run with UI mode
npm run test:e2e:ui

# Run in headed mode
npm run test:e2e:headed

# Debug mode with step-by-step execution
npm run test:e2e:debug
```

## 🚨 Common Issues & Solutions

### 1. Async Testing
```typescript
// Use waitFor for async operations
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

### 2. Mock Cleanup
```typescript
// Clean up mocks between tests
afterEach(() => {
  jest.clearAllMocks();
});
```

### 3. Environment Variables
```typescript
// Set up test environment variables
beforeEach(() => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret';
});
```

## 📈 Continuous Improvement

### Metrics to Track
- Test coverage percentage
- Test execution time
- Flaky test rate
- Bug detection rate

### Regular Tasks
- **Weekly**: Review test coverage reports
- **Monthly**: Update test dependencies
- **Quarterly**: Review and refactor test suites
- **Release**: Run full test suite including performance tests

## 🔗 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [jest-axe Documentation](https://github.com/nickcolley/jest-axe)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Last Updated**: 2025-08-29
**Testing Suite**: Task 18 - Complete ✅
