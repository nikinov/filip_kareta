import * as m from '@/paraglide/messages';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WifiOff, Phone, Mail, MapPin, Calendar, Clock, Users } from 'lucide-react';
import Link from 'next/link';
import { Container } from '@/components/ui/container';

export default function OfflinePage() {

  return (
    <Container className="min-h-[60vh] py-12">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
            <WifiOff className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl">
            {m['offline.title']()}
          </CardTitle>
          <CardDescription className="text-base">
            {m['offline.description']()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Available Offline Features */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-3">
              {m['offline.availableOffline']()}
            </h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {m['offline.features.tourInfo']()}
              </li>
              <li className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {m['offline.features.blogPosts']()}
              </li>
              <li className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {m['offline.features.aboutPage']()}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {m['offline.features.contactInfo']()}
              </li>
            </ul>
          </div>

          {/* Quick Tour Information */}
          <div>
            <h4 className="font-semibold mb-4 text-center">
              {m['offline.popularTours']()}
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="p-4 border rounded-lg bg-gray-50">
                <h5 className="font-medium text-prague-700 mb-2">Prague Castle Tour</h5>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>3 hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    <span>Max 8 people</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>From €45</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg bg-gray-50">
                <h5 className="font-medium text-prague-700 mb-2">Old Town Walking Tour</h5>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>2.5 hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    <span>Max 12 people</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>From €35</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Contact for Booking */}
          <div className="border-t pt-6">
            <h4 className="font-semibold text-center mb-4">
              {m['offline.bookingContact.title']()}
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-prague-200">
                <CardContent className="p-4 text-center">
                  <Phone className="h-8 w-8 text-prague-600 mx-auto mb-3" />
                  <h5 className="font-semibold mb-2">
                    {m['offline.bookingContact.phone.title']()}
                  </h5>
                  <a
                    href="tel:+420123456789"
                    className="text-lg font-bold text-prague-600 hover:underline block mb-2"
                  >
                    +420 123 456 789
                  </a>
                  <p className="text-xs text-gray-600">
                    {m['offline.bookingContact.phone.hours']()}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-prague-200">
                <CardContent className="p-4 text-center">
                  <Mail className="h-8 w-8 text-prague-600 mx-auto mb-3" />
                  <h5 className="font-semibold mb-2">
                    {m['offline.bookingContact.email.title']()}
                  </h5>
                  <a
                    href="mailto:filip@guidefilip-prague.com?subject=Tour Booking Request"
                    className="text-sm text-prague-600 hover:underline block mb-2"
                  >
                    filip@guidefilip-prague.com
                  </a>
                  <p className="text-xs text-gray-600">
                    {m['offline.bookingContact.email.response']()}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Booking Information Template */}
          <div className="bg-prague-50 border border-prague-200 rounded-lg p-4">
            <h5 className="font-semibold text-prague-900 mb-3">
              {m['offline.bookingTemplate.title']()}
            </h5>
            <ul className="space-y-1 text-sm text-prague-800">
              <li>• {m['offline.bookingTemplate.tour']()}</li>
              <li>• {m['offline.bookingTemplate.date']()}</li>
              <li>• {m['offline.bookingTemplate.group']()}</li>
              <li>• {m['offline.bookingTemplate.language']()}</li>
              <li>• {m['offline.bookingTemplate.contact']()}</li>
            </ul>
          </div>

          {/* Connection Check */}
          <div className="text-center">
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {m['offline.checkConnection']()}
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center text-sm text-gray-600">
            <p>
              {m['offline.helpText']()}
            </p>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
