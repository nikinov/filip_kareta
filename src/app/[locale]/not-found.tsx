import * as m from '@/paraglide/messages';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Home, Search, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Container } from '@/components/ui/container';

export default function NotFound() {
  // Temporary hardcoded translations until Paraglide is fully set up
  const t = (key: string, options?: { default?: string }) => options?.default || key;

  return (
    <Container className="min-h-[60vh] flex items-center justify-center py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-prague-100">
            <MapPin className="h-10 w-10 text-prague-600" />
          </div>
          <CardTitle className="text-3xl mb-2">
            Page Not Found
          </CardTitle>
          <CardDescription className="text-lg">
            Looks like you've wandered off the beaten path! This page doesn't exist, but Prague has plenty of amazing places to explore.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Quick Navigation */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Button asChild variant="default" size="lg" className="h-auto p-4">
              <Link href="/" className="flex flex-col items-center gap-2">
                <Home className="h-6 w-6" />
                <span className="font-semibold">
                  Go Home
                </span>
                <span className="text-xs opacity-80">
                  Start your Prague journey
                </span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="h-auto p-4">
              <Link href="/tours" className="flex flex-col items-center gap-2">
                <Search className="h-6 w-6" />
                <span className="font-semibold">
                  Browse Tours
                </span>
                <span className="text-xs opacity-80">
                  Discover Prague experiences
                </span>
              </Link>
            </Button>
          </div>

          {/* Popular Pages */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-center">
              Popular Pages
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link 
                href="/tours/prague-castle"
                className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-prague-700">
                  {t('pragueCastle', { default: 'Prague Castle Tour' })}
                </div>
                <div className="text-sm text-gray-600">
                  {t('castleDescription', { default: 'Explore 1000 years of history' })}
                </div>
              </Link>
              
              <Link 
                href="/tours/old-town"
                className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-prague-700">
                  {t('oldTown', { default: 'Old Town Walking Tour' })}
                </div>
                <div className="text-sm text-gray-600">
                  {t('oldTownDescription', { default: 'Medieval streets and legends' })}
                </div>
              </Link>
              
              <Link 
                href="/tours/jewish-quarter"
                className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-prague-700">
                  {t('jewishQuarter', { default: 'Jewish Quarter Tour' })}
                </div>
                <div className="text-sm text-gray-600">
                  {t('jewishDescription', { default: 'Stories of resilience and culture' })}
                </div>
              </Link>
              
              <Link 
                href="/about"
                className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-prague-700">
                  {t('aboutFilip', { default: 'About Filip' })}
                </div>
                <div className="text-sm text-gray-600">
                  {t('aboutDescription', { default: 'Meet your Prague storyteller' })}
                </div>
              </Link>
            </div>
          </div>

          {/* Quick Booking CTA */}
          <div className="text-center p-6 bg-prague-50 rounded-lg">
            <Calendar className="mx-auto h-8 w-8 text-prague-600 mb-3" />
            <h4 className="font-semibold text-prague-900 mb-2">
              {t('readyToExplore', { default: 'Ready to explore Prague?' })}
            </h4>
            <p className="text-sm text-prague-700 mb-4">
              {t('bookingPrompt', { 
                default: 'Join Filip for an unforgettable storytelling experience through Prague\'s historic streets.' 
              })}
            </p>
            <Button asChild size="lg">
              <Link href="/tours">
                {t('viewAllTours', { default: 'View All Tours' })}
              </Link>
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center text-sm text-gray-600">
            <p>
              {t('helpText', { 
                default: 'If you were looking for something specific, try using our search or browse our tours above.' 
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
