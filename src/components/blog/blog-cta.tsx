import Link from 'next/link';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Locale } from '@/types';

// Tour mapping for better display names and descriptions
const tourMapping: Record<string, { 
  name: string; 
  description: string; 
  icon: React.ReactNode;
}> = {
  'prague-castle': {
    name: 'Prague Castle Tour',
    description: 'Explore the largest ancient castle complex in the world',
    icon: <MapPin className="w-5 h-5" />,
  },
  'old-town-jewish-quarter': {
    name: 'Old Town & Jewish Quarter',
    description: 'Discover medieval streets and Jewish heritage',
    icon: <MapPin className="w-5 h-5" />,
  },
  'charles-bridge-lesser-town': {
    name: 'Charles Bridge & Lesser Town',
    description: 'Walk the famous bridge and baroque Lesser Town',
    icon: <MapPin className="w-5 h-5" />,
  },
};

interface BlogCTAProps {
  locale: Locale;
  relatedTours?: string[];
  variant?: 'tour-booking' | 'newsletter' | 'contact';
}

export function BlogCTA({ locale, relatedTours = [], variant = 'tour-booking' }: BlogCTAProps) {
  if (variant === 'tour-booking') {
    return (
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white my-8">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">
            Experience Prague with Filip
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Ready to discover the stories behind these amazing places? Join Filip for an authentic 
            Prague tour where history comes alive through captivating storytelling.
          </p>
          
          {/* Related Tours */}
          {relatedTours.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-4 text-blue-100">
                Related Tours Mentioned in This Story:
              </h4>
              <div className="grid gap-3 max-w-2xl mx-auto">
                {relatedTours.slice(0, 2).map((tourSlug) => {
                  const tour = tourMapping[tourSlug];
                  return (
                    <Link 
                      key={tourSlug}
                      href={`/${locale}/tours/${tourSlug}`} 
                      className="flex items-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left"
                    >
                      {tour?.icon || <MapPin className="w-5 h-5" />}
                      <div className="flex-1">
                        <div className="font-semibold">
                          {tour?.name || tourSlug.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        <div className="text-sm text-blue-100">
                          {tour?.description || 'Discover this amazing part of Prague'}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href={`/${locale}/tours`} className="inline-flex items-center gap-2 h-12 px-6 py-3 text-base font-semibold bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shadow-md hover:shadow-lg">
              <Calendar className="w-5 h-5" />
              View All Tours
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <Link href={`/${locale}/contact`} className="inline-flex items-center justify-center h-12 px-6 py-3 text-base font-semibold border-2 border-white text-white hover:bg-white hover:text-blue-600 rounded-lg transition-colors">
              Ask Filip a Question
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'newsletter') {
    return (
      <Card className="bg-gray-50 my-8">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-4 text-gray-900">
            Get More Prague Stories
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Subscribe to Filip&apos;s newsletter for weekly stories about Prague&apos;s hidden gems, 
            local tips, and exclusive tour updates.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button className="bg-blue-600 hover:bg-blue-700">
              Subscribe
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Contact variant
  return (
    <Card className="bg-green-50 border-green-200 my-8">
      <CardContent className="p-8 text-center">
        <h3 className="text-2xl font-bold mb-4 text-green-900">
          Have Questions About Prague?
        </h3>
        <p className="text-green-700 mb-6 max-w-2xl mx-auto">
          As a local guide with over 10 years of experience, Filip loves helping visitors 
          plan their perfect Prague experience. Get personalized recommendations!
        </p>
        
        <Link href={`/${locale}/contact`} className="inline-flex items-center gap-2 h-10 px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg">
          Contact Filip
          <ArrowRight className="w-4 h-4" />
        </Link>
      </CardContent>
    </Card>
  );
}