import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { AboutFilipSection } from '@/components/homepage/about-filip-section';

// Mock messages for testing
const messages = {
  homepage: {
    aboutFilip: {
      label: 'Your Guide',
      title: 'Meet Filip, Your Prague Storyteller',
      description1: 'Born and raised in Prague, Filip has been sharing the magic of his city for over 12 years. As a licensed guide with a passion for storytelling, he transforms every tour into an unforgettable journey through time.',
      description2: 'From the legends of Prague Castle to the mysteries of the Old Town, Filip\'s authentic narratives reveal the soul of Prague that guidebooks can\'t capture.',
      quote: 'Every stone in Prague has a story to tell. My job is to help you listen.',
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

describe('AboutFilipSection', () => {
  it('renders the section label and title', () => {
    renderWithIntl(<AboutFilipSection />);
    
    expect(screen.getByText('Your Guide')).toBeInTheDocument();
    expect(screen.getByText('Meet Filip, Your Prague Storyteller')).toBeInTheDocument();
  });

  it('displays Filip\'s description paragraphs', () => {
    renderWithIntl(<AboutFilipSection />);
    
    expect(screen.getByText(/Born and raised in Prague/)).toBeInTheDocument();
    expect(screen.getByText(/From the legends of Prague Castle/)).toBeInTheDocument();
  });

  it('shows Filip\'s credentials and highlights', () => {
    renderWithIntl(<AboutFilipSection />);
    
    expect(screen.getByText('Licensed Guide')).toBeInTheDocument();
    expect(screen.getByText('Official Prague Tourism Certification')).toBeInTheDocument();
    expect(screen.getByText('History Expert')).toBeInTheDocument();
    expect(screen.getByText('12+ years of storytelling')).toBeInTheDocument();
    expect(screen.getByText('Multilingual')).toBeInTheDocument();
    expect(screen.getByText('English, German, Czech')).toBeInTheDocument();
    expect(screen.getByText('Local Born')).toBeInTheDocument();
    expect(screen.getByText('Prague native with insider knowledge')).toBeInTheDocument();
  });

  it('renders both CTA buttons', () => {
    renderWithIntl(<AboutFilipSection />);
    
    expect(screen.getByText('Book a Tour with Filip')).toBeInTheDocument();
    expect(screen.getByText('Read Filip\'s Story')).toBeInTheDocument();
  });

  it('displays Filip\'s quote', () => {
    renderWithIntl(<AboutFilipSection />);
    
    expect(screen.getByText('Every stone in Prague has a story to tell. My job is to help you listen.')).toBeInTheDocument();
    expect(screen.getByText('— Filip Kareta, Licensed Prague Guide')).toBeInTheDocument();
  });

  it('shows the floating stats card', () => {
    renderWithIntl(<AboutFilipSection />);
    
    expect(screen.getByText('1,500+')).toBeInTheDocument();
    expect(screen.getByText('Tours Completed')).toBeInTheDocument();
    expect(screen.getByText('4.9/5 Rating')).toBeInTheDocument();
  });

  it('renders social media links', () => {
    renderWithIntl(<AboutFilipSection />);
    
    expect(screen.getByText('Follow Filip\'s Prague Adventures')).toBeInTheDocument();
    
    // Check for social media links
    const instagramLink = screen.getByLabelText('Follow Filip on Instagram');
    const facebookLink = screen.getByLabelText('Follow Filip on Facebook');
    const tripadvisorLink = screen.getByLabelText('See Filip\'s TripAdvisor reviews');
    
    expect(instagramLink).toBeInTheDocument();
    expect(facebookLink).toBeInTheDocument();
    expect(tripadvisorLink).toBeInTheDocument();
    
    expect(instagramLink).toHaveAttribute('href', 'https://instagram.com/filipprague');
    expect(facebookLink).toHaveAttribute('href', 'https://facebook.com/filippragueguide');
    expect(tripadvisorLink).toHaveAttribute('href', 'https://tripadvisor.com/filip-prague-guide');
  });

  it('has proper external link attributes', () => {
    renderWithIntl(<AboutFilipSection />);
    
    const socialLinks = screen.getAllByRole('link');
    
    socialLinks.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('renders credential icons correctly', () => {
    renderWithIntl(<AboutFilipSection />);
    
    // Check for credential icons (SVG elements)
    const credentialIcons = document.querySelectorAll('.w-8.h-8 svg');
    expect(credentialIcons.length).toBe(4); // 4 credentials
  });

  it('displays star ratings in stats card', () => {
    renderWithIntl(<AboutFilipSection />);
    
    // Check for star rating elements in the floating stats card
    const stars = document.querySelectorAll('svg[viewBox="0 0 20 20"]');
    expect(stars.length).toBe(5); // 5 stars in rating
  });

  it('has proper responsive grid layout', () => {
    renderWithIntl(<AboutFilipSection />);
    
    // Check for grid layout
    const gridContainer = document.querySelector('.grid.lg\\:grid-cols-2');
    expect(gridContainer).toBeInTheDocument();
  });

  it('applies correct background styling', () => {
    renderWithIntl(<AboutFilipSection />);
    
    const section = document.querySelector('section');
    expect(section).toHaveClass('py-16', 'md:py-24', 'bg-gradient-to-br', 'from-stone-50', 'to-prague-50');
  });

  it('has proper accessibility attributes', () => {
    renderWithIntl(<AboutFilipSection />);
    
    // Check for proper heading
    const heading = screen.getByRole('heading', { name: 'Meet Filip, Your Prague Storyteller' });
    expect(heading).toBeInTheDocument();
    
    // Check for buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    
    buttons.forEach(button => {
      expect(button).toBeVisible();
    });
    
    // Check for links
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveAttribute('aria-label');
    });
  });

  it('renders image with proper alt text', () => {
    renderWithIntl(<AboutFilipSection />);
    
    const image = screen.getByAltText('Filip Kareta - Prague Tour Guide');
    expect(image).toBeInTheDocument();
  });

  it('has proper quote formatting', () => {
    renderWithIntl(<AboutFilipSection />);
    
    // Check for blockquote element
    const blockquote = document.querySelector('blockquote');
    expect(blockquote).toBeInTheDocument();
    
    // Check for cite element
    const cite = document.querySelector('cite');
    expect(cite).toBeInTheDocument();
    expect(cite).toHaveClass('not-italic');
  });

  it('renders decorative background elements', () => {
    renderWithIntl(<AboutFilipSection />);
    
    // Check for decorative circles
    const decorativeElements = document.querySelectorAll('.rounded-full.opacity-50, .rounded-full.opacity-30');
    expect(decorativeElements.length).toBe(2);
  });
});