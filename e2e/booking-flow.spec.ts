// End-to-end tests for booking flow
// Tests the complete booking process from tour selection to confirmation

import { test, expect, Page } from '@playwright/test';

// Test data
const testBookingData = {
  tour: {
    id: 'prague-castle',
    name: 'Prague Castle Tour',
    price: 45,
  },
  customer: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+420123456789',
  },
  booking: {
    date: '2024-04-15',
    time: '10:00',
    groupSize: 2,
  },
};

// Helper functions
async function navigateToTour(page: Page, tourId: string) {
  await page.goto(`/en/tours/${tourId}`);
  await expect(page).toHaveURL(new RegExp(`/en/tours/${tourId}`));
}

async function fillBookingForm(page: Page, data: typeof testBookingData) {
  // Step 1: Select date and time
  await page.click('[data-testid="date-picker"]');
  await page.click(`[data-date="${data.booking.date}"]`);
  
  await page.click('[data-testid="time-picker"]');
  await page.click(`[data-time="${data.booking.time}"]`);
  
  await page.selectOption('[data-testid="group-size"]', data.booking.groupSize.toString());
  
  await page.click('[data-testid="continue-to-details"]');

  // Step 2: Fill customer information
  await page.fill('[data-testid="first-name"]', data.customer.firstName);
  await page.fill('[data-testid="last-name"]', data.customer.lastName);
  await page.fill('[data-testid="email"]', data.customer.email);
  await page.fill('[data-testid="phone"]', data.customer.phone);
  
  await page.click('[data-testid="continue-to-payment"]');
}

async function mockPaymentSuccess(page: Page) {
  // Mock successful payment response
  await page.route('**/api/payment/create-intent', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        clientSecret: 'pi_test_client_secret',
        paymentIntentId: 'pi_test_123',
      }),
    });
  });

  await page.route('**/api/payment/confirm', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        paymentStatus: 'succeeded',
        bookingId: 'booking_test_123',
        confirmationCode: 'CONF123',
      }),
    });
  });
}

test.describe('Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses for availability
    await page.route('**/api/availability**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          available: true,
          availableSlots: [
            {
              startTime: '10:00',
              endTime: '13:00',
              availableSpots: 8,
              price: 45,
            },
            {
              startTime: '14:00',
              endTime: '17:00',
              availableSpots: 6,
              price: 45,
            },
          ],
        }),
      });
    });

    // Mock booking creation
    await page.route('**/api/booking', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            booking: {
              id: 'booking_test_123',
              confirmationCode: 'CONF123',
              status: 'confirmed',
            },
          }),
        });
      }
    });
  });

  test('complete booking flow - happy path', async ({ page }) => {
    // Navigate to tour page
    await navigateToTour(page, testBookingData.tour.id);

    // Verify tour information is displayed
    await expect(page.locator('[data-testid="tour-title"]')).toContainText(testBookingData.tour.name);
    await expect(page.locator('[data-testid="tour-price"]')).toContainText(`€${testBookingData.tour.price}`);

    // Start booking process
    await page.click('[data-testid="book-now-button"]');

    // Verify booking form is displayed
    await expect(page.locator('[data-testid="booking-form"]')).toBeVisible();

    // Fill booking form
    await fillBookingForm(page, testBookingData);

    // Verify payment step
    await expect(page.locator('[data-testid="payment-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="booking-summary"]')).toBeVisible();

    // Mock and complete payment
    await mockPaymentSuccess(page);
    
    // Fill payment details (mock Stripe form)
    await page.fill('[data-testid="card-number"]', '4242424242424242');
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvc"]', '123');

    // Submit payment
    await page.click('[data-testid="complete-payment"]');

    // Verify confirmation page
    await expect(page.locator('[data-testid="booking-confirmation"]')).toBeVisible();
    await expect(page.locator('[data-testid="confirmation-code"]')).toContainText('CONF123');
    await expect(page.locator('[data-testid="booking-details"]')).toContainText(testBookingData.customer.email);
  });

  test('booking form validation', async ({ page }) => {
    await navigateToTour(page, testBookingData.tour.id);
    await page.click('[data-testid="book-now-button"]');

    // Try to continue without selecting date
    await page.click('[data-testid="continue-to-details"]');
    await expect(page.locator('[data-testid="date-error"]')).toBeVisible();

    // Select date but not time
    await page.click('[data-testid="date-picker"]');
    await page.click(`[data-date="${testBookingData.booking.date}"]`);
    await page.click('[data-testid="continue-to-details"]');
    await expect(page.locator('[data-testid="time-error"]')).toBeVisible();

    // Complete step 1
    await page.click('[data-testid="time-picker"]');
    await page.click(`[data-time="${testBookingData.booking.time}"]`);
    await page.click('[data-testid="continue-to-details"]');

    // Try to continue without filling required fields
    await page.click('[data-testid="continue-to-payment"]');
    await expect(page.locator('[data-testid="first-name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();

    // Fill invalid email
    await page.fill('[data-testid="email"]', 'invalid-email');
    await page.click('[data-testid="continue-to-payment"]');
    await expect(page.locator('[data-testid="email-error"]')).toContainText('valid email');

    // Fill invalid phone
    await page.fill('[data-testid="email"]', testBookingData.customer.email);
    await page.fill('[data-testid="phone"]', '123');
    await page.click('[data-testid="continue-to-payment"]');
    await expect(page.locator('[data-testid="phone-error"]')).toBeVisible();
  });

  test('booking availability check', async ({ page }) => {
    // Mock unavailable tour
    await page.route('**/api/availability**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          available: false,
          reason: 'Tour is fully booked for this date',
        }),
      });
    });

    await navigateToTour(page, testBookingData.tour.id);
    await page.click('[data-testid="book-now-button"]');

    // Select unavailable date
    await page.click('[data-testid="date-picker"]');
    await page.click(`[data-date="${testBookingData.booking.date}"]`);

    // Verify unavailability message
    await expect(page.locator('[data-testid="availability-error"]')).toContainText('fully booked');
    await expect(page.locator('[data-testid="continue-to-details"]')).toBeDisabled();
  });

  test('payment failure handling', async ({ page }) => {
    await navigateToTour(page, testBookingData.tour.id);
    await page.click('[data-testid="book-now-button"]');
    await fillBookingForm(page, testBookingData);

    // Mock payment failure
    await page.route('**/api/payment/confirm', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Payment failed: Insufficient funds',
        }),
      });
    });

    // Fill payment details
    await page.fill('[data-testid="card-number"]', '4000000000000002'); // Declined card
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvc"]', '123');

    // Submit payment
    await page.click('[data-testid="complete-payment"]');

    // Verify error message
    await expect(page.locator('[data-testid="payment-error"]')).toContainText('Payment failed');
    await expect(page.locator('[data-testid="retry-payment"]')).toBeVisible();
  });

  test('booking flow accessibility', async ({ page }) => {
    await navigateToTour(page, testBookingData.tour.id);

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="book-now-button"]')).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page.locator('[data-testid="booking-form"]')).toBeVisible();

    // Test form accessibility
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="date-picker"]')).toBeFocused();

    // Test ARIA labels and descriptions
    await expect(page.locator('[data-testid="date-picker"]')).toHaveAttribute('aria-label');
    await expect(page.locator('[data-testid="group-size"]')).toHaveAttribute('aria-describedby');
  });

  test('booking flow on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await navigateToTour(page, testBookingData.tour.id);

    // Verify mobile-optimized booking button
    const bookButton = page.locator('[data-testid="book-now-button"]');
    await expect(bookButton).toBeVisible();
    
    // Check button size for touch interaction
    const buttonBox = await bookButton.boundingBox();
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44); // Minimum touch target

    await bookButton.click();

    // Verify mobile-optimized form layout
    await expect(page.locator('[data-testid="booking-form"]')).toBeVisible();
    
    // Test mobile date picker
    await page.click('[data-testid="date-picker"]');
    await expect(page.locator('[data-testid="mobile-date-picker"]')).toBeVisible();
  });

  test('booking flow with different languages', async ({ page }) => {
    // Test German language
    await page.goto('/de/tours/prague-castle');
    await page.click('[data-testid="book-now-button"]');
    
    // Verify German text
    await expect(page.locator('[data-testid="booking-form-title"]')).toContainText('Buchung');
    
    // Test French language
    await page.goto('/fr/tours/prague-castle');
    await page.click('[data-testid="book-now-button"]');
    
    // Verify French text
    await expect(page.locator('[data-testid="booking-form-title"]')).toContainText('Réservation');
  });

  test('booking session timeout', async ({ page }) => {
    await navigateToTour(page, testBookingData.tour.id);
    await page.click('[data-testid="book-now-button"]');

    // Mock session timeout
    await page.route('**/api/booking', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Session expired',
        }),
      });
    });

    await fillBookingForm(page, testBookingData);
    await page.click('[data-testid="complete-payment"]');

    // Verify session timeout handling
    await expect(page.locator('[data-testid="session-expired"]')).toBeVisible();
    await expect(page.locator('[data-testid="restart-booking"]')).toBeVisible();
  });
});
