import { Tour } from '@/types';

interface TourDescriptionProps {
  tour: Tour;
  locale: string;
}

export function TourDescription({ tour, locale }: TourDescriptionProps) {
  return (
    <div className="prose prose-lg max-w-none">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        About This Tour
      </h2>
      
      <div className="text-gray-700 leading-relaxed">
        <p>{tour.description[locale as keyof typeof tour.description]}</p>
      </div>

      {tour.highlights && tour.highlights[locale as keyof typeof tour.highlights] && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Tour Highlights
          </h3>
          <ul className="space-y-2">
            {tour.highlights[locale as keyof typeof tour.highlights].map((highlight: string, index: number) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {Math.floor(tour.duration / 60)}h {tour.duration % 60}m
          </div>
          <div className="text-sm text-gray-600">Duration</div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {tour.maxGroupSize}
          </div>
          <div className="text-sm text-gray-600">Max Group Size</div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {tour.difficulty}
          </div>
          <div className="text-sm text-gray-600">Difficulty</div>
        </div>
      </div>
    </div>
  );
}