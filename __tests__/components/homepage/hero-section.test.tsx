import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { HeroSection } from '@/components/homepage/hero-section';

// Mock messages for testing
const messages = {
  homepage: {
    hero: {
      title: 'Discover Prague Through Stories',
      subtitle: 'Join Filip for authentic walking tours that bring Prague\'s history to life through captivating storytelling',
      primaryCta: 'Book Your Tour',
      secondaryCta: 'Watch Video'
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

describe('HeroSection', () => {
  it('renders the hero title correctly', () => {
    renderWithIntl(<HeroSection />);
    
    expect(screen.getByText('Discover Prague Through Stories')).toBeInTheDocument();
  });

  it('renders the hero subtitle correctly', () => {
    renderWithIntl(<HeroSection />);
    
    expect(screen.getByText(/Join Filip for authentic walking tours/)).toBeInTheDocument();
  });

  it('renders both CTA buttons', () => {
    renderWithIntl(<HeroSection />);
    
    expect(screen.getByText('Book Your Tour')).toBeInTheDocument();
    expect(screen.getByText('Watch Video')).toBeInTheDocument();
  });

  it('renders trust indicators', () => {
    renderWithIntl(<HeroSection />);
    
    expect(screen.getByText('4.9/5 from 200+ reviews')).toBeInTheDocument();
    expect(screen.getByText('10+ years of storytelling')).toBeInTheDocument();
    expect(screen.getByText('Licensed Prague guide')).toBeInTheDocument();
  });

  it('renders video element with correct attributes', () => {
    renderWithIntl(<HeroSection />);
    
    const video = screen.getByRole('img', { hidden: true }); // video elements are treated as img by testing-library
    expect(video).toHaveAttribute('autoPlay');
    expect(video).toHaveAttribute('muted');
    expect(video).toHaveAttribute('loop');
    expect(video).toHaveAttribute('playsInline');
  });

  it('has proper accessibility attributes', () => {
    renderWithIntl(<HeroSection />);
    
    // Check for proper heading hierarchy
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toBeInTheDocument();
    
    // Check for button accessibility
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    buttons.forEach(button => {
      expect(button).toBeVisible();
    });
  });

  it('applies correct CSS classes for responsive design', () => {
    renderWithIntl(<HeroSection />);
    
    const section = screen.getByRole('main').parentElement;
    expect(section).toHaveClass('relative', 'min-h-screen');
  });
});