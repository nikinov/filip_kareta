import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { SocialProofSection } from '@/components/homepage/social-proof-section';

// Mock messages for testing
const messages = {
  homepage: {
    socialProof: {
      title: 'What Our Guests Say',
      subtitle: 'Real experiences from travelers who discovered Prague with Filip'
    }
  }
};

const renderWithIntl = (component: React.ReactElement) => {
  return render(
    <NextIntlClientProvider messages={messages} locale="en">
      {component}
    </NextIntlClientProvider>
  );
};

describe('SocialProofSection', () => {
  it('renders the section title and subtitle', () => {
    renderWithIntl(<SocialProofSection />);
    
    expect(screen.getByText('What Our Guests Say')).toBeInTheDocument();
    expect(screen.getByText('Real experiences from travelers who discovered Prague with Filip')).toBeInTheDocument();
  });

  it('displays trust statistics correctly', () => {
    renderWithIntl(<SocialProofSection />);
    
    expect(screen.getByText('4.9★')).toBeInTheDocument();
    expect(screen.getByText('247+')).toBeInTheDocument();
    expect(screen.getByText('12+')).toBeInTheDocument();
    expect(screen.getByText('1500+')).toBeInTheDocument();
  });

  it('displays trust statistic labels', () => {
    renderWithIntl(<SocialProofSection />);
    
    expect(screen.getByText('Average Rating')).toBeInTheDocument();
    expect(screen.getByText('Happy Travelers')).toBeInTheDocument();
    expect(screen.getByText('Years Experience')).toBeInTheDocument();
    expect(screen.getByText('Tours Completed')).toBeInTheDocument();
  });

  it('renders customer reviews', () => {
    renderWithIntl(<SocialProofSection />);
    
    // Check for customer names
    expect(screen.getByText('Sarah M.')).toBeInTheDocument();
    expect(screen.getByText('Michael K.')).toBeInTheDocument();
    expect(screen.getByText('Emma L.')).toBeInTheDocument();
  });

  it('displays review comments', () => {
    renderWithIntl(<SocialProofSection />);
    
    expect(screen.getByText(/Filip brought Prague's history to life/)).toBeInTheDocument();
    expect(screen.getByText(/Best tour guide in Prague/)).toBeInTheDocument();
    expect(screen.getByText(/A deeply moving and educational experience/)).toBeInTheDocument();
  });

  it('shows star ratings for reviews', () => {
    renderWithIntl(<SocialProofSection />);
    
    // Check for star rating elements (SVG stars)
    const stars = document.querySelectorAll('svg[viewBox="0 0 20 20"]');
    expect(stars.length).toBeGreaterThan(0);
  });

  it('displays review source indicators', () => {
    renderWithIntl(<SocialProofSection />);
    
    // Check for Google and TripAdvisor indicators
    const googleIndicators = screen.getAllByText('G');
    const tripadvisorIndicators = screen.getAllByText('T');
    
    expect(googleIndicators.length).toBeGreaterThan(0);
    expect(tripadvisorIndicators.length).toBeGreaterThan(0);
  });

  it('shows verification badges for reviews', () => {
    renderWithIntl(<SocialProofSection />);
    
    // Check for verification checkmarks (SVG elements)
    const verificationIcons = document.querySelectorAll('svg[class*="text-green-500"]');
    expect(verificationIcons.length).toBeGreaterThan(0);
  });

  it('renders trust badges section', () => {
    renderWithIntl(<SocialProofSection />);
    
    expect(screen.getByText('Licensed Guide')).toBeInTheDocument();
    expect(screen.getByText('Official Prague Tourism')).toBeInTheDocument();
    expect(screen.getByText('Secure Booking')).toBeInTheDocument();
    expect(screen.getByText('SSL Protected')).toBeInTheDocument();
    expect(screen.getByText('85% Return Rate')).toBeInTheDocument();
    expect(screen.getByText('Customers book again')).toBeInTheDocument();
    expect(screen.getByText('Free Cancellation')).toBeInTheDocument();
    expect(screen.getByText('Up to 24h before')).toBeInTheDocument();
  });

  it('formats review dates correctly', () => {
    renderWithIntl(<SocialProofSection />);
    
    // Check for formatted dates (should show month and year)
    expect(screen.getByText('Jan 2024')).toBeInTheDocument();
  });

  it('displays customer profile images or initials', () => {
    renderWithIntl(<SocialProofSection />);
    
    // Check for customer initials (fallback when no image)
    expect(screen.getByText('S')).toBeInTheDocument(); // Sarah M.
    expect(screen.getByText('M')).toBeInTheDocument(); // Michael K.
    expect(screen.getByText('E')).toBeInTheDocument(); // Emma L.
  });

  it('has proper grid layout for reviews', () => {
    renderWithIntl(<SocialProofSection />);
    
    // Check that reviews are in a grid container
    const reviewsContainer = document.querySelector('.grid');
    expect(reviewsContainer).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderWithIntl(<SocialProofSection />);
    
    // Check for proper heading
    const heading = screen.getByRole('heading', { name: 'What Our Guests Say' });
    expect(heading).toBeInTheDocument();
    
    // Check that review cards are properly structured
    const reviewCards = document.querySelectorAll('[class*="bg-white"][class*="rounded"]');
    expect(reviewCards.length).toBeGreaterThan(0);
  });

  it('renders trust badge icons correctly', () => {
    renderWithIntl(<SocialProofSection />);
    
    // Check for trust badge icons (SVG elements)
    const trustIcons = document.querySelectorAll('.w-12.h-12 svg');
    expect(trustIcons.length).toBe(4); // 4 trust badges
  });

  it('applies correct styling classes', () => {
    renderWithIntl(<SocialProofSection />);
    
    // Check for section background
    const section = document.querySelector('section');
    expect(section).toHaveClass('py-16', 'md:py-24', 'bg-white');
  });
});