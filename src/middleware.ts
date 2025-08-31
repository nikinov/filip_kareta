import { NextRequest, NextResponse } from 'next/server';
import { locales, baseLocale } from './paraglide/runtime';
import { securityMiddleware } from './lib/security-middleware';

const defaultLocale = baseLocale;

function getLocale(request: NextRequest): string {
  // Check if there is any supported locale in the pathname
  const pathname = request.nextUrl.pathname;
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    // Try to get locale from Accept-Language header
    const acceptLanguage = request.headers.get('accept-language');
    let locale = defaultLocale;

    if (acceptLanguage) {
      const preferredLocale = acceptLanguage
        .split(',')[0]
        .split('-')[0]
        .toLowerCase();

      if (locales.includes(preferredLocale)) {
        locale = preferredLocale;
      }
    }

    return locale;
  }

  return pathname.split('/')[1];
}

export default async function middleware(request: NextRequest) {
  // Apply security middleware first
  const securityResponse = await securityMiddleware(request);
  if (securityResponse) {
    return securityResponse;
  }

  // Then apply internationalization middleware
  const pathname = request.nextUrl.pathname;

  // Skip internationalization for API routes, static files, and other special paths
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    return NextResponse.redirect(
      new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes for security, but exclude API routes and static files from i18n
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
    '/',
    '/(cz|fr|en)/:path*'
  ]
};