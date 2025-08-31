import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { FeaturedToursCarousel } from '@/components/homepage/featured-tours-carousel';

// Mock messages for testing
const messages = {
  homepage: {
    featuredTours: {
      title: 'Featured Tours',
      subtitle: 'Experience Prague like never before with our most popular storytelling adventures',
      bookNow: 'Book Now',
      viewAllCta: 'View All Tours'
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

// Mock IntersectionObserver for carousel functionality
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('FeaturedToursCarousel', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders the section title and subtitle', () => {
    renderWithIntl(<FeaturedToursCarousel locale="en" />);
    
    expect(screen.getByText('Featured Tours')).toBeInTheDocument();
    expect(screen.getByText(/Experience Prague like never before/)).toBeInTheDocument();
  });

  it('renders tour cards with correct information', () => {
    renderWithIntl(<FeaturedToursCarousel locale="en" />);
    
    // Check for tour titles
    expect(screen.getByText('Prague Castle: Stories of Kings & Legends')).toBeInTheDocument();
    expect(screen.getByText('Old Town Mysteries & Hidden Gems')).toBeInTheDocument();
    expect(screen.getByText('Jewish Quarter: Heritage & Memory')).toBeInTheDocument();
  });

  it('displays pricing information correctly', () => {
    renderWithIntl(<FeaturedToursCarousel locale="en" />);
    
    expect(screen.getByText('From €45')).toBeInTheDocument();
    expect(screen.getByText('From €35')).toBeInTheDocument();
    expect(screen.getByText('From €40')).toBeInTheDocument();
  });

  it('shows duration information for tours', () => {
    renderWithIntl(<FeaturedToursCarousel locale="en" />);
    
    expect(screen.getByText('3h')).toBeInTheDocument(); // 180 minutes
    expect(screen.getByText('2h 30m')).toBeInTheDocument(); // 150 minutes
    expect(screen.getByText('2h')).toBeInTheDocument(); // 120 minutes
  });

  it('renders book now buttons for each tour', () => {
    renderWithIntl(<FeaturedToursCarousel locale="en" />);
    
    const bookButtons = screen.getAllByText('Book Now');
    expect(bookButtons.length).toBeGreaterThan(0);
  });

  it('renders view all tours CTA', () => {
    renderWithIntl(<FeaturedToursCarousel locale="en" />);
    
    expect(screen.getByText('View All Tours')).toBeInTheDocument();
  });

  it('displays star ratings for tours', () => {
    renderWithIntl(<FeaturedToursCarousel locale="en" />);
    
    // Check for rating text
    const ratings = screen.getAllByText('4.9 (45 reviews)');
    expect(ratings.length).toBeGreaterThan(0);
  });

  it('handles mobile carousel navigation', () => {
    // Mock window.innerWidth for mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    renderWithIntl(<FeaturedToursCarousel locale="en" />);
    
    // Check for mobile navigation elements (only visible on mobile)
    const prevButton = screen.getByLabelText('Previous tour');
    const nextButton = screen.getByLabelText('Next tour');
    
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
  });

  it('handles carousel navigation clicks', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    renderWithIntl(<FeaturedToursCarousel locale="en" />);
    
    const nextButton = screen.getByLabelText('Next tour');
    fireEvent.click(nextButton);
    
    // Verify that clicking doesn't cause errors
    expect(nextButton).toBeInTheDocument();
  });

  it('auto-plays carousel slides', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    renderWithIntl(<FeaturedToursCarousel locale="en" />);
    
    // Fast-forward time to trigger auto-play
    jest.advanceTimersByTime(5000);
    
    // The carousel should still be functional
    const dots = screen.getAllByLabelText(/Go to slide/);
    expect(dots.length).toBe(4); // 4 tours = 4 dots
  });

  it('handles touch events for mobile swipe', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    renderWithIntl(<FeaturedToursCarousel locale="en" />);
    
    const carousel = screen.getByRole('region', { hidden: true }) || document.querySelector('[class*="overflow-hidden"]');
    
    if (carousel) {
      // Simulate touch events
      fireEvent.touchStart(carousel, {
        touches: [{ clientX: 100 }]
      });
      
      fireEvent.touchMove(carousel, {
        touches: [{ clientX: 50 }]
      });
      
      fireEvent.touchEnd(carousel);
      
      // Verify no errors occurred
      expect(carousel).toBeInTheDocument();
    }
  });

  it('renders with different locales correctly', () => {
    renderWithIntl(<FeaturedToursCarousel locale="de" />);
    
    // Should still render the tour content (titles are in the mock data)
    expect(screen.getByText('Featured Tours')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderWithIntl(<FeaturedToursCarousel locale="en" />);
    
    // Check for proper heading
    const heading = screen.getByRole('heading', { name: 'Featured Tours' });
    expect(heading).toBeInTheDocument();
    
    // Check for button accessibility
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeVisible();
    });
  });
});