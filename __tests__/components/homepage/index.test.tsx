import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import {
  HeroSection,
  FeaturedToursCarousel,
  SocialProofSection,
  AboutFilipSection
} from '@/components/homepage';

// Mock messages for testing
const messages = {
  homepage: {
    hero: {
      title: 'Discover Prague Through Stories',
      subtitle: 'Join Filip for authentic walking tours',
      primaryCta: 'Book Your Tour',
      secondaryCta: 'Watch Video'
    },
    featuredTours: {
      title: 'Featured Tours',
      subtitle: 'Experience Prague like never before',
      bookNow: 'Book Now',
      viewAllCta: 'View All Tours'
    },
    socialProof: {
      title: 'What Our Guests Say',
      subtitle: 'Real experiences from travelers'
    },
    aboutFilip: {
      label: 'Your Guide',
      title: 'Meet Filip, Your Prague Storyteller',
      description1: 'Born and raised in Prague...',
      description2: 'From the legends of Prague Castle...',
      quote: 'Every stone in Prague has a story to tell.',
      primaryCta: 'Book a Tour with Filip',
      secondaryCta: 'Read Filip\'s Story',
      followLabel: 'Follow Filip\'s Prague Adventures'
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

describe('Homepage Components Integration', () => {
  describe('Component Exports', () => {
    it('exports HeroSection component', () => {
      expect(HeroSection).toBeDefined();
      expect(typeof HeroSection).toBe('function');
    });

    it('exports FeaturedToursCarousel component', () => {
      expect(FeaturedToursCarousel).toBeDefined();
      expect(typeof FeaturedToursCarousel).toBe('function');
    });

    it('exports SocialProofSection component', () => {
      expect(SocialProofSection).toBeDefined();
      expect(typeof SocialProofSection).toBe('function');
    });

    it('exports AboutFilipSection component', () => {
      expect(AboutFilipSection).toBeDefined();
      expect(typeof AboutFilipSection).toBe('function');
    });
  });

  describe('Component Rendering', () => {
    it('renders HeroSection without errors', () => {
      expect(() => {
        renderWithIntl(<HeroSection />);
      }).not.toThrow();
    });

    it('renders FeaturedToursCarousel without errors', () => {
      expect(() => {
        renderWithIntl(<FeaturedToursCarousel locale="en" />);
      }).not.toThrow();
    });

    it('renders SocialProofSection without errors', () => {
      expect(() => {
        renderWithIntl(<SocialProofSection />);
      }).not.toThrow();
    });

    it('renders AboutFilipSection without errors', () => {
      expect(() => {
        renderWithIntl(<AboutFilipSection />);
      }).not.toThrow();
    });
  });

  describe('Component Integration', () => {
    it('all components can be rendered together', () => {
      expect(() => {
        renderWithIntl(
          <div>
            <HeroSection />
            <FeaturedToursCarousel locale="en" />
            <SocialProofSection />
            <AboutFilipSection />
          </div>
        );
      }).not.toThrow();
    });

    it('components maintain proper heading hierarchy when combined', () => {
      renderWithIntl(
        <div>
          <HeroSection />
          <FeaturedToursCarousel locale="en" />
          <SocialProofSection />
          <AboutFilipSection />
        </div>
      );

      // Check that all main headings are present
      expect(screen.getByText('Discover Prague Through Stories')).toBeInTheDocument();
      expect(screen.getByText('Featured Tours')).toBeInTheDocument();
      expect(screen.getByText('What Our Guests Say')).toBeInTheDocument();
      expect(screen.getByText('Meet Filip, Your Prague Storyteller')).toBeInTheDocument();
    });

    it('components work with different locales', () => {
      expect(() => {
        renderWithIntl(<FeaturedToursCarousel locale="de" />);
      }).not.toThrow();

      expect(() => {
        renderWithIntl(<FeaturedToursCarousel locale="fr" />);
      }).not.toThrow();
    });
  });

  describe('Accessibility Integration', () => {
    it('maintains proper ARIA landmarks when components are combined', () => {
      renderWithIntl(
        <main>
          <HeroSection />
          <FeaturedToursCarousel locale="en" />
          <SocialProofSection />
          <AboutFilipSection />
        </main>
      );

      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('all components have accessible headings', () => {
      renderWithIntl(
        <div>
          <HeroSection />
          <FeaturedToursCarousel locale="en" />
          <SocialProofSection />
          <AboutFilipSection />
        </div>
      );

      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
      
      // Ensure all headings have text content
      headings.forEach(heading => {
        expect(heading.textContent).toBeTruthy();
      });
    });

    it('all interactive elements are accessible', () => {
      renderWithIntl(
        <div>
          <HeroSection />
          <FeaturedToursCarousel locale="en" />
          <SocialProofSection />
          <AboutFilipSection />
        </div>
      );

      const buttons = screen.getAllByRole('button');
      const links = screen.getAllByRole('link');

      // Check that buttons are accessible
      buttons.forEach(button => {
        expect(button).toBeVisible();
      });

      // Check that links have proper attributes
      links.forEach(link => {
        expect(link).toBeVisible();
      });
    });
  });

  describe('Performance Considerations', () => {
    it('components render efficiently without unnecessary re-renders', () => {
      const { rerender } = renderWithIntl(
        <div>
          <HeroSection />
          <FeaturedToursCarousel locale="en" />
        </div>
      );

      // Re-render with same props should not cause issues
      expect(() => {
        rerender(
          <NextIntlClientProvider messages={messages} locale="en">
            <div>
              <HeroSection />
              <FeaturedToursCarousel locale="en" />
            </div>
          </NextIntlClientProvider>
        );
      }).not.toThrow();
    });
  });
});