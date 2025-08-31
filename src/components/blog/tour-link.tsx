import Link from 'next/link';
import { ExternalLink, MapPin } from 'lucide-react';
import type { Locale } from '@/types';

// Tour data for better display
const tourData: Record<string, {
  name: Record<Locale, string>;
  shortDescription: Record<Locale, string>;
  duration: string;
  price: string;
}> = {
  'prague-castle': {
    name: {
      en: 'Prague Castle Tour',
      de: 'Prager Burg Tour',
      fr: 'Visite du Château de Prague',
    },
    shortDescription: {
      en: 'Explore the largest ancient castle complex in the world',
      de: 'Erkunden Sie den größten antiken Burgkomplex der Welt',
      fr: 'Explorez le plus grand complexe de château antique au monde',
    },
    duration: '3 hours',
    price: 'From €45',
  },
  'old-town-jewish-quarter': {
    name: {
      en: 'Old Town & Jewish Quarter',
      de: 'Altstadt & Jüdisches Viertel',
      fr: 'Vieille Ville & Quartier Juif',
    },
    shortDescription: {
      en: 'Discover medieval streets and Jewish heritage',
      de: 'Entdecken Sie mittelalterliche Straßen und jüdisches Erbe',
      fr: 'Découvrez les rues médiévales et le patrimoine juif',
    },
    duration: '2.5 hours',
    price: 'From €40',
  },
  'charles-bridge-lesser-town': {
    name: {
      en: 'Charles Bridge & Lesser Town',
      de: 'Karlsbrücke & Kleinseite',
      fr: 'Pont Charles & Petite Ville',
    },
    shortDescription: {
      en: 'Walk the famous bridge and baroque Lesser Town',
      de: 'Spazieren Sie über die berühmte Brücke und die barocke Kleinseite',
      fr: 'Promenez-vous sur le célèbre pont et la ville baroque',
    },
    duration: '2 hours',
    price: 'From €35',
  },
};

interface TourLinkProps {
  tour: string;
  children: React.ReactNode;
  locale?: Locale;
  variant?: 'inline' | 'card' | 'button';
  showPrice?: boolean;
  showDuration?: boolean;
}

export function TourLink({ 
  tour, 
  children, 
  locale = 'en', 
  variant = 'inline',
  showPrice = false,
  showDuration = false 
}: TourLinkProps) {
  const tourInfo = tourData[tour];
  const tourUrl = `/${locale}/tours/${tour}`;

  if (!tourInfo) {
    // Fallback for unknown tours
    return (
      <Link 
        href={tourUrl}
        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline decoration-blue-200 hover:decoration-blue-400 transition-colors font-medium"
      >
        {children}
        <ExternalLink className="w-3 h-3" />
      </Link>
    );
  }

  if (variant === 'card') {
    return (
      <Link 
        href={tourUrl}
        className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
      >
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {tourInfo.name[locale]}
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              {tourInfo.shortDescription[locale]}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              {showDuration && (
                <span>{tourInfo.duration}</span>
              )}
              {showPrice && (
                <span className="font-medium text-blue-600">{tourInfo.price}</span>
              )}
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
        </div>
      </Link>
    );
  }

  if (variant === 'button') {
    return (
      <Link 
        href={tourUrl}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
      >
        <MapPin className="w-4 h-4" />
        {children || tourInfo.name[locale]}
        <ExternalLink className="w-4 h-4" />
      </Link>
    );
  }

  // Default inline variant
  return (
    <Link 
      href={tourUrl}
      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline decoration-blue-200 hover:decoration-blue-400 transition-colors font-medium"
      title={tourInfo.shortDescription[locale]}
    >
      {children || tourInfo.name[locale]}
      <ExternalLink className="w-3 h-3" />
    </Link>
  );
}