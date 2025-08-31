// Cross-browser compatibility tests
// Tests for Chrome, Firefox, Safari, and Edge compatibility

import { test, expect, devices } from '@playwright/test';

// Test data for cross-browser testing
const testPages = [
  { path: '/', name: 'Homepage' },
  { path: '/en/tours', name: 'Tours listing' },
  { path: '/en/tours/prague-castle', name: 'Tour detail' },
  { path: '/en/about', name: 'About page' },
  { path: '/en/contact', name: 'Contact page' },
];

const testDevices = [
  { name: 'Desktop Chrome', device: devices['Desktop Chrome'] },
  { name: 'Desktop Firefox', device: devices['Desktop Firefox'] },
  { name: 'Desktop Safari', device: devices['Desktop Safari'] },
  { name: 'Mobile Chrome', device: devices['Pixel 5'] },
  { name: 'Mobile Safari', device: devices['iPhone 12'] },
];

// Helper function to test basic functionality
async function testBasicFunctionality(page: any, pagePath: string) {
  await page.goto(pagePath);
  
  // Check that page loads
  await expect(page.locator('body')).toBeVisible();
  
  // Check for basic navigation
  const navLinks = page.locator('nav a');
  if (await navLinks.count() > 0) {
    await expect(navLinks.first()).toBeVisible();
  }
  
  // Check for main content
  const main = page.locator('main, [role="main"], .main-content');
  if (await main.count() > 0) {
    await expect(main.first()).toBeVisible();
  }
  
  // Check for footer
  const footer = page.locator('footer, [role="contentinfo"]');
  if (await footer.count() > 0) {
    await expect(footer.first()).toBeVisible();
  }
}

// Helper function to test CSS features
async function testCSSFeatures(page: any) {
  const cssFeatures = await page.evaluate(() => {
    const testElement = document.createElement('div');
    document.body.appendChild(testElement);
    
    const features = {
      flexbox: CSS.supports('display', 'flex'),
      grid: CSS.supports('display', 'grid'),
      customProperties: CSS.supports('--test', 'value'),
      transforms: CSS.supports('transform', 'translateX(10px)'),
      transitions: CSS.supports('transition', 'all 0.3s'),
      borderRadius: CSS.supports('border-radius', '10px'),
      boxShadow: CSS.supports('box-shadow', '0 0 10px rgba(0,0,0,0.1)'),
      gradients: CSS.supports('background', 'linear-gradient(to right, red, blue)'),
    };
    
    document.body.removeChild(testElement);
    return features;
  });
  
  return cssFeatures;
}

// Helper function to test JavaScript features
async function testJavaScriptFeatures(page: any) {
  const jsFeatures = await page.evaluate(() => {
    return {
      es6Classes: typeof class {} === 'function',
      arrowFunctions: (() => true)(),
      promises: typeof Promise !== 'undefined',
      asyncAwait: (async () => true)() instanceof Promise,
      fetch: typeof fetch !== 'undefined',
      localStorage: typeof localStorage !== 'undefined',
      sessionStorage: typeof sessionStorage !== 'undefined',
      webWorkers: typeof Worker !== 'undefined',
      intersectionObserver: typeof IntersectionObserver !== 'undefined',
      mutationObserver: typeof MutationObserver !== 'undefined',
    };
  });
  
  return jsFeatures;
}

test.describe('Cross-Browser Compatibility', () => {
  // Test each browser separately
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test.describe(`${browserName} Browser Tests`, () => {
      testPages.forEach(({ path, name }) => {
        test(`${name} should work in ${browserName}`, async ({ page }) => {
          await testBasicFunctionality(page, path);
          
          // Test CSS features
          const cssFeatures = await testCSSFeatures(page);
          expect(cssFeatures.flexbox).toBe(true);
          expect(cssFeatures.customProperties).toBe(true);
          
          // Test JavaScript features
          const jsFeatures = await testJavaScriptFeatures(page);
          expect(jsFeatures.promises).toBe(true);
          expect(jsFeatures.fetch).toBe(true);
          
          console.log(`${browserName} - ${name}:`, { cssFeatures, jsFeatures });
        });
      });
      
      test(`Interactive elements should work in ${browserName}`, async ({ page }) => {
        await page.goto('/en/tours/prague-castle');
        
        // Test button interactions
        const bookButton = page.locator('[data-testid="book-now-button"]');
        if (await bookButton.count() > 0) {
          await expect(bookButton).toBeVisible();
          await bookButton.click();
          
          // Check that booking form appears
          await expect(page.locator('[data-testid="booking-form"]')).toBeVisible();
        }
        
        // Test form interactions
        const inputs = page.locator('input[type="text"], input[type="email"]');
        if (await inputs.count() > 0) {
          await inputs.first().fill('test value');
          await expect(inputs.first()).toHaveValue('test value');
        }
      });
      
      test(`Language switching should work in ${browserName}`, async ({ page }) => {
        await page.goto('/');
        
        // Test language switcher
        const langSwitcher = page.locator('[data-testid="language-switcher"]');
        if (await langSwitcher.count() > 0) {
          await langSwitcher.click();
          
          const germanLink = page.locator('a[href*="/de/"]');
          if (await germanLink.count() > 0) {
            await germanLink.click();
            await expect(page).toHaveURL(/\/de\//);
          }
        }
      });
    });
  });
  
  test.describe('Mobile Browser Tests', () => {
    test('should work on mobile Chrome', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['Pixel 5'],
      });
      const page = await context.newPage();
      
      await testBasicFunctionality(page, '/');
      
      // Test touch interactions
      const bookButton = page.locator('[data-testid="book-now-button"]');
      if (await bookButton.count() > 0) {
        await bookButton.tap();
        await expect(page.locator('[data-testid="booking-form"]')).toBeVisible();
      }
      
      await context.close();
    });
    
    test('should work on mobile Safari', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 12'],
      });
      const page = await context.newPage();
      
      await testBasicFunctionality(page, '/');
      
      // Test iOS-specific features
      const viewport = page.viewportSize();
      expect(viewport?.width).toBe(390);
      expect(viewport?.height).toBe(844);
      
      await context.close();
    });
  });
  
  test.describe('Feature Detection Tests', () => {
    test('should handle missing CSS features gracefully', async ({ page }) => {
      // Simulate older browser by disabling CSS features
      await page.addInitScript(() => {
        // Mock CSS.supports to return false for modern features
        const originalSupports = CSS.supports;
        CSS.supports = (property: string, value?: string) => {
          if (property === 'display' && value === 'grid') return false;
          if (property === '--test') return false;
          return originalSupports.call(CSS, property, value);
        };
      });
      
      await page.goto('/');
      
      // Page should still be functional
      await expect(page.locator('body')).toBeVisible();
      
      const cssFeatures = await testCSSFeatures(page);
      expect(cssFeatures.grid).toBe(false);
      expect(cssFeatures.customProperties).toBe(false);
    });
    
    test('should handle missing JavaScript features gracefully', async ({ page }) => {
      // Simulate older browser by disabling JS features
      await page.addInitScript(() => {
        // Remove modern JS features
        delete (window as any).fetch;
        delete (window as any).IntersectionObserver;
      });
      
      await page.goto('/');
      
      // Page should still be functional
      await expect(page.locator('body')).toBeVisible();
      
      const jsFeatures = await testJavaScriptFeatures(page);
      expect(jsFeatures.fetch).toBe(false);
      expect(jsFeatures.intersectionObserver).toBe(false);
    });
  });
  
  test.describe('Responsive Design Tests', () => {
    const viewports = [
      { width: 320, height: 568, name: 'Mobile Small' },
      { width: 375, height: 667, name: 'Mobile Medium' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1024, height: 768, name: 'Desktop Small' },
      { width: 1440, height: 900, name: 'Desktop Large' },
    ];
    
    viewports.forEach(viewport => {
      test(`should be responsive at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');
        
        // Check that content is visible and properly laid out
        await expect(page.locator('body')).toBeVisible();
        
        // Check navigation is accessible
        const nav = page.locator('nav');
        if (await nav.count() > 0) {
          await expect(nav).toBeVisible();
        }
        
        // Check that text is readable (not too small)
        const bodyText = page.locator('body');
        const fontSize = await bodyText.evaluate(el => {
          return window.getComputedStyle(el).fontSize;
        });
        
        const fontSizeNum = parseInt(fontSize);
        expect(fontSizeNum).toBeGreaterThanOrEqual(14); // Minimum readable font size
      });
    });
  });
  
  test.describe('Form Compatibility Tests', () => {
    test('forms should work across browsers', async ({ page }) => {
      await page.goto('/en/contact');
      
      // Test different input types
      const inputs = {
        text: page.locator('input[type="text"]').first(),
        email: page.locator('input[type="email"]').first(),
        tel: page.locator('input[type="tel"]').first(),
        textarea: page.locator('textarea').first(),
      };
      
      for (const [type, input] of Object.entries(inputs)) {
        if (await input.count() > 0) {
          await input.fill(`test ${type} value`);
          await expect(input).toHaveValue(`test ${type} value`);
        }
      }
      
      // Test form validation
      const emailInput = inputs.email;
      if (await emailInput.count() > 0) {
        await emailInput.fill('invalid-email');
        
        const submitButton = page.locator('button[type="submit"]');
        if (await submitButton.count() > 0) {
          await submitButton.click();
          
          // Check for validation message
          const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => {
            return el.validationMessage;
          });
          
          expect(validationMessage).toBeTruthy();
        }
      }
    });
  });
  
  test.describe('Accessibility Across Browsers', () => {
    test('keyboard navigation should work across browsers', async ({ page }) => {
      await page.goto('/');
      
      // Test Tab navigation
      await page.keyboard.press('Tab');
      
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });
      
      expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);
      
      // Test Enter key on focused element
      await page.keyboard.press('Enter');
      
      // Should navigate or trigger action
      await page.waitForTimeout(500);
    });
    
    test('screen reader compatibility', async ({ page }) => {
      await page.goto('/');
      
      // Check for proper ARIA attributes
      const ariaElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('[aria-label], [aria-labelledby], [role]');
        return Array.from(elements).map(el => ({
          tagName: el.tagName,
          ariaLabel: el.getAttribute('aria-label'),
          role: el.getAttribute('role'),
        }));
      });
      
      expect(ariaElements.length).toBeGreaterThan(0);
    });
  });
});
