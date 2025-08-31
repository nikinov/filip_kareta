// Accessibility tests using jest-axe
// Tests for WCAG compliance and accessibility best practices

import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConsentBanner } from '@/components/gdpr/consent-banner';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock components for testing
const TestForm = () => (
  <form>
    <div>
      <label htmlFor="name">Name</label>
      <Input id="name" type="text" required />
    </div>
    <div>
      <label htmlFor="email">Email</label>
      <Input id="email" type="email" required />
    </div>
    <Button type="submit">Submit</Button>
  </form>
);

const TestNavigation = () => (
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/tours">Tours</a></li>
      <li><a href="/about">About</a></li>
      <li><a href="/contact">Contact</a></li>
    </ul>
  </nav>
);

const TestCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>Prague Castle Tour</CardTitle>
    </CardHeader>
    <CardContent>
      <p>Explore the historic Prague Castle with our expert guide.</p>
      <Button>Book Now</Button>
    </CardContent>
  </Card>
);

describe('Accessibility Tests', () => {
  describe('UI Components Accessibility', () => {
    it('Button component should be accessible', async () => {
      const { container } = render(<Button>Click me</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Button with icon should have proper aria-label', async () => {
      const { container } = render(
        <Button aria-label="Close dialog">
          <span aria-hidden="true">×</span>
        </Button>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Input component should be accessible', async () => {
      const { container } = render(
        <div>
          <label htmlFor="test-input">Test Input</label>
          <Input id="test-input" placeholder="Enter text" />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Input with error state should be accessible', async () => {
      const { container } = render(
        <div>
          <label htmlFor="error-input">Email</label>
          <Input 
            id="error-input" 
            type="email" 
            aria-invalid="true"
            aria-describedby="error-message"
          />
          <div id="error-message" role="alert">
            Please enter a valid email address
          </div>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Card component should be accessible', async () => {
      const { container } = render(<TestCard />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Form Accessibility', () => {
    it('Form should be accessible', async () => {
      const { container } = render(<TestForm />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Form with fieldset should be accessible', async () => {
      const { container } = render(
        <form>
          <fieldset>
            <legend>Personal Information</legend>
            <div>
              <label htmlFor="first-name">First Name</label>
              <Input id="first-name" type="text" required />
            </div>
            <div>
              <label htmlFor="last-name">Last Name</label>
              <Input id="last-name" type="text" required />
            </div>
          </fieldset>
          <Button type="submit">Submit</Button>
        </form>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Form with validation errors should be accessible', async () => {
      const { container } = render(
        <form>
          <div>
            <label htmlFor="email-error">Email</label>
            <Input 
              id="email-error" 
              type="email" 
              aria-invalid="true"
              aria-describedby="email-error-message"
            />
            <div id="email-error-message" role="alert">
              Email is required
            </div>
          </div>
          <Button type="submit">Submit</Button>
        </form>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Navigation Accessibility', () => {
    it('Navigation should be accessible', async () => {
      const { container } = render(<TestNavigation />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Breadcrumb navigation should be accessible', async () => {
      const { container } = render(
        <nav aria-label="Breadcrumb">
          <ol>
            <li><a href="/">Home</a></li>
            <li><a href="/tours">Tours</a></li>
            <li aria-current="page">Prague Castle</li>
          </ol>
        </nav>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Skip link should be accessible', async () => {
      const { container } = render(
        <div>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <nav>
            <a href="/">Home</a>
            <a href="/tours">Tours</a>
          </nav>
          <main id="main-content">
            <h1>Main Content</h1>
          </main>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Content Accessibility', () => {
    it('Headings should have proper hierarchy', async () => {
      const { container } = render(
        <div>
          <h1>Main Title</h1>
          <h2>Section Title</h2>
          <h3>Subsection Title</h3>
          <p>Content paragraph</p>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Images should have alt text', async () => {
      const { container } = render(
        <div>
          <img src="/prague-castle.jpg" alt="Prague Castle overlooking the city" />
          <img src="/decorative-border.png" alt="" role="presentation" />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Lists should be properly structured', async () => {
      const { container } = render(
        <div>
          <h2>Tour Highlights</h2>
          <ul>
            <li>Visit Prague Castle</li>
            <li>Explore Old Town Square</li>
            <li>Walk across Charles Bridge</li>
          </ul>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Tables should be accessible', async () => {
      const { container } = render(
        <table>
          <caption>Tour Schedule</caption>
          <thead>
            <tr>
              <th scope="col">Time</th>
              <th scope="col">Activity</th>
              <th scope="col">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>10:00</td>
              <td>Meet at Prague Castle</td>
              <td>15 minutes</td>
            </tr>
            <tr>
              <td>10:15</td>
              <td>Castle tour</td>
              <td>2 hours</td>
            </tr>
          </tbody>
        </table>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Interactive Elements Accessibility', () => {
    it('Modal dialog should be accessible', async () => {
      const { container } = render(
        <div>
          <Button>Open Dialog</Button>
          <div 
            role="dialog" 
            aria-labelledby="dialog-title"
            aria-describedby="dialog-description"
            aria-modal="true"
          >
            <h2 id="dialog-title">Confirm Booking</h2>
            <p id="dialog-description">
              Are you sure you want to book this tour?
            </p>
            <Button>Confirm</Button>
            <Button>Cancel</Button>
          </div>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Dropdown menu should be accessible', async () => {
      const { container } = render(
        <div>
          <Button 
            aria-haspopup="true" 
            aria-expanded="false"
            aria-controls="dropdown-menu"
          >
            Menu
          </Button>
          <ul id="dropdown-menu" role="menu">
            <li role="menuitem"><a href="/profile">Profile</a></li>
            <li role="menuitem"><a href="/settings">Settings</a></li>
            <li role="menuitem"><a href="/logout">Logout</a></li>
          </ul>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('Tabs should be accessible', async () => {
      const { container } = render(
        <div>
          <div role="tablist" aria-label="Tour Information">
            <button 
              role="tab" 
              aria-selected="true"
              aria-controls="overview-panel"
              id="overview-tab"
            >
              Overview
            </button>
            <button 
              role="tab" 
              aria-selected="false"
              aria-controls="itinerary-panel"
              id="itinerary-tab"
            >
              Itinerary
            </button>
          </div>
          <div 
            role="tabpanel" 
            id="overview-panel"
            aria-labelledby="overview-tab"
          >
            <p>Tour overview content</p>
          </div>
          <div 
            role="tabpanel" 
            id="itinerary-panel"
            aria-labelledby="itinerary-tab"
            hidden
          >
            <p>Tour itinerary content</p>
          </div>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('GDPR Components Accessibility', () => {
    it('Consent banner should be accessible', async () => {
      // Mock the ClientGDPR functions
      jest.mock('@/lib/client-security', () => ({
        ClientGDPR: {
          getConsentStatus: () => ({ hasConsent: false, consentTypes: ['necessary'], canTrack: false, canMarketing: false }),
          updateConsent: jest.fn().mockResolvedValue(true),
        },
        securityEvents: {
          trackConsentChange: jest.fn(),
        },
      }));

      const { container } = render(<ConsentBanner />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Color Contrast', () => {
    it('should have sufficient color contrast for text', async () => {
      const { container } = render(
        <div style={{ backgroundColor: '#ffffff', color: '#000000' }}>
          <p>This text should have sufficient contrast</p>
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should detect insufficient color contrast', async () => {
      const { container } = render(
        <div style={{ backgroundColor: '#ffffff', color: '#cccccc' }}>
          <p>This text has insufficient contrast</p>
        </div>
      );
      const results = await axe(container);
      // This should fail the color contrast check
      expect(results.violations.length).toBeGreaterThan(0);
    });
  });

  describe('Focus Management', () => {
    it('should have visible focus indicators', async () => {
      const { container } = render(
        <div>
          <Button className="focus:ring-2 focus:ring-blue-500">
            Focusable Button
          </Button>
          <Input className="focus:ring-2 focus:ring-blue-500" />
        </div>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
