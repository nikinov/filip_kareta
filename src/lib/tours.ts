import { Tour } from '@/types';

// Mock tour data - in a real implementation, this would come from a CMS or database
const mockTours: Tour[] = [
  {
    id: 'prague-castle-tour',
    slug: 'prague-castle',
    title: {
      en: 'Prague Castle & Lesser Town: Stories of Kings and Legends',
      de: 'Prager Burg & Kleinseite: Geschichten von Königen und Legenden',
      fr: 'Château de Prague & Petite Ville: Histoires de Rois et Légendes'
    },
    description: {
      en: 'Step into the heart of Czech history with Filip as your storyteller. This isn\'t just a tour of Prague Castle - it\'s a journey through 1,000 years of royal intrigue, architectural marvels, and hidden legends that shaped a nation.',
      de: 'Treten Sie mit Filip als Ihrem Geschichtenerzähler in das Herz der tschechischen Geschichte ein. Dies ist nicht nur eine Tour durch die Prager Burg - es ist eine Reise durch 1.000 Jahre königlicher Intrigen, architektonischer Wunder und verborgener Legenden.',
      fr: 'Entrez dans le cœur de l\'histoire tchèque avec Filip comme conteur. Ce n\'est pas seulement une visite du Château de Prague - c\'est un voyage à travers 1 000 ans d\'intrigues royales, de merveilles architecturales et de légendes cachées.'
    },
    highlights: {
      en: [
        'Discover the secret passages used by medieval kings',
        'Learn the true story behind the Defenestration of Prague',
        'Explore St. Vitus Cathedral\'s hidden symbolism',
        'Walk through the Golden Lane where alchemists once worked',
        'Enjoy panoramic views over the red rooftops of Prague'
      ],
      de: [
        'Entdecken Sie die geheimen Gänge mittelalterlicher Könige',
        'Erfahren Sie die wahre Geschichte hinter dem Prager Fenstersturz',
        'Erkunden Sie die verborgene Symbolik der St.-Veits-Kathedrale',
        'Wandeln Sie durch das Goldene Gässchen der Alchemisten',
        'Genießen Sie Panoramablicke über Prags rote Dächer'
      ],
      fr: [
        'Découvrez les passages secrets des rois médiévaux',
        'Apprenez la vraie histoire de la Défenestration de Prague',
        'Explorez le symbolisme caché de la Cathédrale Saint-Guy',
        'Promenez-vous dans la Ruelle d\'Or des alchimistes',
        'Profitez de vues panoramiques sur les toits rouges de Prague'
      ]
    },
    duration: 180, // 3 hours
    maxGroupSize: 12,
    basePrice: 45,
    currency: 'EUR',
    difficulty: 'easy',
    images: [
      {
        id: 'castle-1',
        url: '/images/tours/prague-castle-hero.jpg',
        alt: {
          en: 'Prague Castle panoramic view',
          de: 'Panoramablick auf die Prager Burg',
          fr: 'Vue panoramique du Château de Prague'
        },
        width: 1200,
        height: 800
      },
      {
        id: 'castle-2',
        url: '/images/tours/st-vitus-cathedral.jpg',
        alt: {
          en: 'St. Vitus Cathedral interior',
          de: 'Innenraum der St.-Veits-Kathedrale',
          fr: 'Intérieur de la Cathédrale Saint-Guy'
        },
        width: 1200,
        height: 800
      }
    ],
    route: [
      {
        lat: 50.0909,
        lng: 14.4009,
        name: {
          en: 'Prague Castle Main Gate',
          de: 'Haupttor der Prager Burg',
          fr: 'Porte principale du Château'
        }
      }
    ],
    availability: [
      {
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '15:00',
        maxBookings: 2
      },
      {
        dayOfWeek: 3, // Wednesday
        startTime: '09:00',
        endTime: '15:00',
        maxBookings: 2
      },
      {
        dayOfWeek: 5, // Friday
        startTime: '09:00',
        endTime: '15:00',
        maxBookings: 2
      }
    ],
    reviews: [
      {
        id: 'review-1',
        tourId: 'prague-castle-tour',
        customerName: 'Sarah M.',
        rating: 5,
        comment: 'Filip brought Prague Castle to life with incredible stories. Best tour guide ever!',
        date: new Date('2024-01-15'),
        source: 'google',
        verified: true
      }
    ],
    seoMetadata: {
      title: {
        en: 'Prague Castle Tour with Local Guide Filip | Authentic Stories & History',
        de: 'Prager Burg Tour mit lokalem Guide Filip | Authentische Geschichten & Geschichte',
        fr: 'Visite du Château de Prague avec le guide local Filip | Histoires authentiques'
      },
      description: {
        en: 'Discover Prague Castle with expert storyteller Filip. Small groups, authentic stories, and 1000 years of Czech history come alive in this unforgettable 3-hour tour.',
        de: 'Entdecken Sie die Prager Burg mit dem Geschichtenerzähler Filip. Kleine Gruppen, authentische Geschichten und 1000 Jahre tschechische Geschichte.',
        fr: 'Découvrez le Château de Prague avec le conteur expert Filip. Petits groupes, histoires authentiques et 1000 ans d\'histoire tchèque.'
      },
      keywords: ['Prague Castle tour', 'Prague guide', 'Czech history', 'St Vitus Cathedral', 'Golden Lane']
    }
  },
  {
    id: 'old-town-tour',
    slug: 'old-town',
    title: {
      en: 'Old Town Square & Jewish Quarter: Medieval Mysteries',
      de: 'Altstädter Ring & Jüdisches Viertel: Mittelalterliche Geheimnisse',
      fr: 'Place de la Vieille Ville & Quartier Juif: Mystères Médiévaux'
    },
    description: {
      en: 'Journey through Prague\'s medieval heart where every cobblestone tells a story. From the Astronomical Clock\'s ancient secrets to the haunting beauty of the Jewish Quarter, discover the soul of Prague with Filip.',
      de: 'Reisen Sie durch Prags mittelalterliches Herz, wo jeder Kopfstein eine Geschichte erzählt. Von den alten Geheimnissen der Astronomischen Uhr bis zur eindringlichen Schönheit des Jüdischen Viertels.',
      fr: 'Voyagez à travers le cœur médiéval de Prague où chaque pavé raconte une histoire. Des secrets anciens de l\'Horloge Astronomique à la beauté hantante du Quartier Juif.'
    },
    highlights: {
      en: [
        'Witness the Astronomical Clock\'s hourly show with insider knowledge',
        'Explore the mysterious Jewish Quarter and its ancient synagogues',
        'Discover hidden courtyards and secret passages',
        'Learn about Prague\'s medieval guilds and their traditions',
        'Visit the oldest active synagogue in Europe'
      ],
      de: [
        'Erleben Sie die stündliche Show der Astronomischen Uhr mit Insider-Wissen',
        'Erkunden Sie das geheimnisvolle Jüdische Viertel und seine alten Synagogen',
        'Entdecken Sie versteckte Höfe und geheime Gänge',
        'Erfahren Sie über Prags mittelalterliche Zünfte',
        'Besuchen Sie die älteste aktive Synagoge Europas'
      ],
      fr: [
        'Assistez au spectacle horaire de l\'Horloge Astronomique avec des connaissances d\'initié',
        'Explorez le mystérieux Quartier Juif et ses anciennes synagogues',
        'Découvrez des cours cachées et des passages secrets',
        'Apprenez sur les guildes médiévales de Prague',
        'Visitez la plus ancienne synagogue active d\'Europe'
      ]
    },
    duration: 150, // 2.5 hours
    maxGroupSize: 15,
    basePrice: 35,
    currency: 'EUR',
    difficulty: 'easy',
    images: [
      {
        id: 'oldtown-1',
        url: '/images/tours/old-town-square.jpg',
        alt: {
          en: 'Old Town Square with Astronomical Clock',
          de: 'Altstädter Ring mit Astronomischer Uhr',
          fr: 'Place de la Vieille Ville avec Horloge Astronomique'
        },
        width: 1200,
        height: 800
      }
    ],
    route: [],
    availability: [
      {
        dayOfWeek: 2, // Tuesday
        startTime: '10:00',
        endTime: '16:00',
        maxBookings: 2
      },
      {
        dayOfWeek: 4, // Thursday
        startTime: '10:00',
        endTime: '16:00',
        maxBookings: 2
      },
      {
        dayOfWeek: 6, // Saturday
        startTime: '10:00',
        endTime: '16:00',
        maxBookings: 2
      }
    ],
    reviews: [
      {
        id: 'review-2',
        tourId: 'old-town-tour',
        customerName: 'Michael K.',
        rating: 5,
        comment: 'Fascinating insights into Prague\'s Jewish history. Filip is incredibly knowledgeable.',
        date: new Date('2024-01-20'),
        source: 'tripadvisor',
        verified: true
      }
    ],
    seoMetadata: {
      title: {
        en: 'Old Town & Jewish Quarter Tour Prague | Expert Local Guide Filip',
        de: 'Altstadt & Jüdisches Viertel Tour Prag | Experte lokaler Guide Filip',
        fr: 'Visite Vieille Ville & Quartier Juif Prague | Guide local expert Filip'
      },
      description: {
        en: 'Explore Prague\'s Old Town Square and Jewish Quarter with storyteller Filip. Medieval mysteries, ancient synagogues, and the famous Astronomical Clock await.',
        de: 'Erkunden Sie Prags Altstädter Ring und Jüdisches Viertel mit Geschichtenerzähler Filip. Mittelalterliche Geheimnisse und die berühmte Astronomische Uhr.',
        fr: 'Explorez la Place de la Vieille Ville et le Quartier Juif de Prague avec le conteur Filip. Mystères médiévaux et la célèbre Horloge Astronomique.'
      },
      keywords: ['Old Town Prague', 'Jewish Quarter', 'Astronomical Clock', 'Prague synagogues', 'medieval Prague']
    }
  }
];

export async function getTourBySlug(slug: string): Promise<Tour | null> {
  const tour = mockTours.find(t => t.slug === slug);
  return tour || null;
}

export async function getTourById(id: string): Promise<Tour | null> {
  const tour = mockTours.find(t => t.id === id);
  return tour || null;
}

export async function getAllTourSlugs(): Promise<string[]> {
  return mockTours.map(tour => tour.slug);
}

export async function getAllTours(): Promise<Tour[]> {
  return mockTours;
}

export async function getFeaturedTours(limit: number = 3): Promise<Tour[]> {
  return mockTours.slice(0, limit);
}