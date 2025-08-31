import type { Metadata } from 'next';
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import { getLocale } from '@/paraglide/runtime';
import { StructuredData } from '@/components/seo/structured-data';
import { generateWebsiteSchema, generatePersonSchema } from '@/lib/structured-data';
import { PerformanceProvider } from '@/components/performance/performance-monitor';
import { AnalyticsProvider } from '@/components/analytics/analytics-provider';
import { GoogleAnalyticsScript, AnalyticsIntegration } from '@/components/analytics/analytics-integration';
import { setupGlobalErrorHandling } from '@/components/error-boundary';
import { RootErrorBoundary } from '@/components/root-error-boundary';
import { OfflineHandler, registerServiceWorker } from '@/components/offline-handler';
import { NoScriptNavigation } from '@/components/no-script-fallback';
import { sentry } from '@/lib/sentry';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://guidefilip-prague.com'),
  title: {
    default: 'Filip Kareta - Prague Tour Guide | Authentic Storytelling Tours',
    template: '%s | Filip Kareta Prague Tours',
  },
  description: 'Discover Prague through authentic storytelling tours with local guide Filip Kareta. Experience hidden gems, fascinating history, and local culture with personalized walking tours.',
  keywords: [
    'Prague tour guide',
    'Prague walking tours',
    'Prague Castle tours',
    'Old Town Prague',
    'Jewish Quarter Prague',
    'Prague history tours',
    'local Prague guide',
    'authentic Prague experience',
    'Prague storytelling tours',
    'private Prague tours',
  ],
  authors: [{ name: 'Filip Kareta', url: 'https://guidefilip-prague.com' }],
  creator: 'Filip Kareta',
  publisher: 'Filip Kareta Prague Tours',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://guidefilip-prague.com',
    siteName: 'Filip Kareta - Prague Tour Guide',
    title: 'Filip Kareta - Prague Tour Guide | Authentic Storytelling Tours',
    description: 'Discover Prague through authentic storytelling tours with local guide Filip Kareta. Experience hidden gems, fascinating history, and local culture.',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Filip Kareta Prague Tour Guide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Filip Kareta - Prague Tour Guide',
    description: 'Discover Prague through authentic storytelling tours with local guide Filip Kareta.',
    images: ['/images/og-default.jpg'],
    creator: '@filipprague',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteSchema = generateWebsiteSchema();
  const personSchema = generatePersonSchema();
  const locale = getLocale();

  return (
    <html lang={locale} className="scroll-smooth">
      <head>
        <StructuredData data={[websiteSchema, personSchema]} />
        {/* DNS prefetch for critical domains */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable} font-sans antialiased`}
        suppressHydrationWarning={true}
      >
        <NoScriptNavigation />
        <RootErrorBoundary>
          <OfflineHandler>
            <AnalyticsIntegration>
              <PerformanceProvider
                enableMonitoring={true}
                enableCriticalCSS={true}
                enableResourcePreloading={true}
              >
                <AnalyticsProvider>
                  <GoogleAnalyticsScript />
                  {children}
                </AnalyticsProvider>
              </PerformanceProvider>
            </AnalyticsIntegration>
          </OfflineHandler>
        </RootErrorBoundary>

        {/* Initialize global error handling and service worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Initialize global error handling
              if (typeof window !== 'undefined') {
                ${setupGlobalErrorHandling.toString()}
                setupGlobalErrorHandling();

                ${registerServiceWorker.toString()}
                registerServiceWorker();
              }
            `,
          }}
        />
      </body>
    </html>
  );
}