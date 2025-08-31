import { routing } from '@/i18n/routing';

export type Locale = (typeof routing.locales)[number];

export interface LocalizedContent {
  [key: string]: string | LocalizedContent;
}

export interface Tour {
  id: string;
  slug: string;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  highlights: Record<Locale, string[]>;
  duration: number; // minutes
  maxGroupSize: number;
  basePrice: number;
  currency: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  images: string[];
}

export interface BlogPost {
  slug: string;
  title: Record<Locale, string>;
  content: Record<Locale, string>;
  excerpt: Record<Locale, string>;
  publishedAt: Date;
  category: string;
  tags: string[];
  featuredImage: string;
}

// Content fallback utility
export function getLocalizedContent<T>(
  content: Record<Locale, T>,
  locale: Locale,
  fallbackLocale: Locale = 'en'
): T {
  return content[locale] || content[fallbackLocale] || content['en'];
}

// Sample tour data with multilingual content
export const sampleTours: Tour[] = [
  {
    id: '1',
    slug: 'prague-castle',
    title: {
      en: 'Prague Castle & Lesser Town',
      de: 'Prager Burg & Kleinseite',
      fr: 'Château de Prague & Petite Ville',
    },
    description: {
      en: 'Explore the magnificent Prague Castle complex and discover the charming Lesser Town with its baroque architecture and hidden courtyards.',
      de: 'Erkunden Sie die prächtige Prager Burg und entdecken Sie die charmante Kleinseite mit ihrer barocken Architektur und versteckten Innenhöfen.',
      fr: 'Explorez le magnifique complexe du château de Prague et découvrez la charmante Petite Ville avec son architecture baroque et ses cours cachées.',
    },
    highlights: {
      en: [
        'St. Vitus Cathedral',
        'Old Royal Palace',
        'Golden Lane',
        'Lesser Town Square',
        'Kampa Island',
      ],
      de: [
        'Veitsdom',
        'Alter Königspalast',
        'Goldenes Gässchen',
        'Kleinseitner Ring',
        'Kampa-Insel',
      ],
      fr: [
        'Cathédrale Saint-Guy',
        'Ancien Palais Royal',
        'Ruelle d\'Or',
        'Place de la Petite Ville',
        'Île Kampa',
      ],
    },
    duration: 180,
    maxGroupSize: 12,
    basePrice: 45,
    currency: 'EUR',
    difficulty: 'easy',
    images: ['/tours/prague-castle-1.jpg', '/tours/prague-castle-2.jpg'],
  },
  {
    id: '2',
    slug: 'old-town-jewish-quarter',
    title: {
      en: 'Old Town & Jewish Quarter',
      de: 'Altstadt & Jüdisches Viertel',
      fr: 'Vieille Ville & Quartier Juif',
    },
    description: {
      en: 'Walk through medieval streets and discover the rich Jewish heritage of Prague in this comprehensive tour of the historic center.',
      de: 'Wandeln Sie durch mittelalterliche Straßen und entdecken Sie das reiche jüdische Erbe Prags bei dieser umfassenden Tour durch das historische Zentrum.',
      fr: 'Promenez-vous dans les rues médiévales et découvrez le riche patrimoine juif de Prague lors de cette visite complète du centre historique.',
    },
    highlights: {
      en: [
        'Old Town Square',
        'Astronomical Clock',
        'Jewish Museum',
        'Old Jewish Cemetery',
        'Synagogues',
      ],
      de: [
        'Altstädter Ring',
        'Astronomische Uhr',
        'Jüdisches Museum',
        'Alter Jüdischer Friedhof',
        'Synagogen',
      ],
      fr: [
        'Place de la Vieille Ville',
        'Horloge Astronomique',
        'Musée Juif',
        'Ancien Cimetière Juif',
        'Synagogues',
      ],
    },
    duration: 150,
    maxGroupSize: 15,
    basePrice: 40,
    currency: 'EUR',
    difficulty: 'easy',
    images: ['/tours/old-town-1.jpg', '/tours/old-town-2.jpg'],
  },
];

// Sample blog posts with multilingual content
export const sampleBlogPosts: BlogPost[] = [
  {
    slug: 'best-prague-viewpoints',
    title: {
      en: 'The Best Viewpoints in Prague',
      de: 'Die besten Aussichtspunkte in Prag',
      fr: 'Les meilleurs points de vue à Prague',
    },
    content: {
      en: 'Prague offers stunning panoramic views from various elevated locations...',
      de: 'Prag bietet atemberaubende Panoramablicke von verschiedenen erhöhten Standorten...',
      fr: 'Prague offre des vues panoramiques époustouflantes depuis divers emplacements surélevés...',
    },
    excerpt: {
      en: 'Discover the most breathtaking viewpoints in Prague for perfect photos.',
      de: 'Entdecken Sie die atemberaubendsten Aussichtspunkte in Prag für perfekte Fotos.',
      fr: 'Découvrez les points de vue les plus époustouflants de Prague pour des photos parfaites.',
    },
    publishedAt: new Date('2024-01-15'),
    category: 'Photography',
    tags: ['viewpoints', 'photography', 'sightseeing'],
    featuredImage: '/blog/viewpoints.jpg',
  },
];