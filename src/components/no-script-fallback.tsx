// Graceful degradation components for JavaScript-disabled users
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, Clock, Users, Euro } from 'lucide-react';
import Link from 'next/link';

/**
 * NoScript fallback for booking forms
 */
export function NoScriptBookingFallback({ tourTitle, tourPrice }: { 
  tourTitle: string; 
  tourPrice: number; 
}) {
  return (
    <noscript>
      <Card className="w-full max-w-md mx-auto mt-8 border-orange-200 bg-orange-50">
        <CardHeader className="text-center">
          <CardTitle className="text-lg text-orange-900">
            JavaScript Required for Booking
          </CardTitle>
          <CardDescription className="text-orange-800">
            Our online booking system requires JavaScript. Please enable JavaScript or contact us directly to book your tour.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <h4 className="font-semibold mb-2">Tour: {tourTitle}</h4>
            <p className="text-lg font-bold text-prague-600">From €{tourPrice}</p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white rounded border">
              <Phone className="h-5 w-5 text-prague-600" />
              <div>
                <p className="font-medium">Call to Book</p>
                <a href="tel:+420123456789" className="text-prague-600 hover:underline">
                  +420 123 456 789
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded border">
              <Mail className="h-5 w-5 text-prague-600" />
              <div>
                <p className="font-medium">Email Booking</p>
                <a href="mailto:filip@guidefilip-prague.com" className="text-prague-600 hover:underline">
                  filip@guidefilip-prague.com
                </a>
              </div>
            </div>
          </div>
          
          <div className="text-center text-sm text-orange-700">
            <p>Include your preferred date, time, and group size in your message.</p>
          </div>
        </CardContent>
      </Card>
    </noscript>
  );
}

/**
 * NoScript fallback for interactive elements
 */
export function NoScriptInteractiveFallback({ children, fallbackContent }: {
  children: React.ReactNode;
  fallbackContent: React.ReactNode;
}) {
  return (
    <>
      {children}
      <noscript>
        {fallbackContent}
      </noscript>
    </>
  );
}

/**
 * NoScript navigation menu
 */
export function NoScriptNavigation() {
  return (
    <noscript>
      <div className="bg-yellow-50 border-b border-yellow-200 p-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm text-yellow-800 mb-3 text-center">
            <strong>JavaScript is disabled.</strong> Some features may not work properly. 
            For the best experience, please enable JavaScript.
          </p>
          <nav className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/" className="text-prague-600 hover:underline">Home</Link>
            <Link href="/tours" className="text-prague-600 hover:underline">Tours</Link>
            <Link href="/about" className="text-prague-600 hover:underline">About</Link>
            <Link href="/blog" className="text-prague-600 hover:underline">Blog</Link>
            <Link href="/contact" className="text-prague-600 hover:underline">Contact</Link>
          </nav>
        </div>
      </div>
    </noscript>
  );
}

/**
 * NoScript tour card fallback
 */
export function NoScriptTourCard({ 
  tour 
}: { 
  tour: {
    slug: string;
    title: string;
    description: string;
    price: number;
    duration: number;
    maxGroupSize: number;
    image: string;
  }
}) {
  return (
    <noscript>
      <Card className="w-full">
        <div className="aspect-video bg-gray-200 rounded-t-lg flex items-center justify-center">
          <span className="text-gray-500">Image: {tour.title}</span>
        </div>
        <CardHeader>
          <CardTitle className="text-xl">{tour.title}</CardTitle>
          <CardDescription>{tour.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Euro className="h-4 w-4 text-prague-600" />
              <span>From €{tour.price}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-prague-600" />
              <span>{Math.floor(tour.duration / 60)}h</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-prague-600" />
              <span>Max {tour.maxGroupSize}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href={`/tours/${tour.slug}`}>
                View Tour Details
              </Link>
            </Button>
            
            <div className="text-center text-sm text-gray-600">
              <p>To book this tour:</p>
              <div className="flex justify-center gap-4 mt-2">
                <a href="tel:+420123456789" className="text-prague-600 hover:underline">
                  Call +420 123 456 789
                </a>
                <span>or</span>
                <a href="mailto:filip@guidefilip-prague.com" className="text-prague-600 hover:underline">
                  Send Email
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </noscript>
  );
}

/**
 * NoScript contact form fallback
 */
export function NoScriptContactForm() {
  return (
    <noscript>
      <Card className="w-full max-w-md mx-auto mt-8 border-blue-200 bg-blue-50">
        <CardHeader className="text-center">
          <CardTitle className="text-lg text-blue-900">
            Contact Form Unavailable
          </CardTitle>
          <CardDescription className="text-blue-800">
            Our contact form requires JavaScript. Please use one of the direct contact methods below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white rounded border">
              <Phone className="h-5 w-5 text-prague-600" />
              <div>
                <p className="font-medium">Phone</p>
                <a href="tel:+420123456789" className="text-prague-600 hover:underline">
                  +420 123 456 789
                </a>
                <p className="text-xs text-gray-600">Available 9 AM - 6 PM CET</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded border">
              <Mail className="h-5 w-5 text-prague-600" />
              <div>
                <p className="font-medium">Email</p>
                <a href="mailto:filip@guidefilip-prague.com" className="text-prague-600 hover:underline">
                  filip@guidefilip-prague.com
                </a>
                <p className="text-xs text-gray-600">Response within 24 hours</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded border">
              <MapPin className="h-5 w-5 text-prague-600" />
              <div>
                <p className="font-medium">Meet in Person</p>
                <p className="text-sm text-gray-700">Old Town Square</p>
                <p className="text-xs text-gray-600">By appointment only</p>
              </div>
            </div>
          </div>
          
          <div className="text-center text-sm text-blue-700 bg-blue-100 rounded p-3">
            <p>
              <strong>Tip:</strong> Enable JavaScript for the full booking experience, 
              including real-time availability and secure online payments.
            </p>
          </div>
        </CardContent>
      </Card>
    </noscript>
  );
}

/**
 * NoScript language switcher fallback
 */
export function NoScriptLanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  return (
    <noscript>
      <div className="bg-gray-100 border rounded p-3">
        <p className="text-sm font-medium mb-2">Language / Sprache / Langue:</p>
        <div className="flex flex-wrap gap-2">
          {languages.map((lang) => (
            <Link
              key={lang.code}
              href={`/${lang.code}`}
              className={`px-3 py-1 rounded text-sm border ${
                currentLocale === lang.code
                  ? 'bg-prague-600 text-white border-prague-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {lang.flag} {lang.name}
            </Link>
          ))}
        </div>
      </div>
    </noscript>
  );
}

/**
 * NoScript search fallback
 */
export function NoScriptSearchFallback() {
  return (
    <noscript>
      <Card className="w-full max-w-md mx-auto mt-4 border-gray-200">
        <CardContent className="p-4">
          <p className="text-sm text-gray-600 mb-3">
            Search requires JavaScript. Browse our content directly:
          </p>
          <div className="space-y-2 text-sm">
            <Link href="/tours" className="block text-prague-600 hover:underline">
              → All Tours
            </Link>
            <Link href="/blog" className="block text-prague-600 hover:underline">
              → Travel Blog
            </Link>
            <Link href="/about" className="block text-prague-600 hover:underline">
              → About Filip
            </Link>
            <Link href="/contact" className="block text-prague-600 hover:underline">
              → Contact Information
            </Link>
          </div>
        </CardContent>
      </Card>
    </noscript>
  );
}
