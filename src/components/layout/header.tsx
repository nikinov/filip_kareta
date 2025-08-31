'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Navigation } from './navigation';
import * as m from '@/paraglide/messages';
import { locales, getLocale } from '@/paraglide/runtime';

export function Header() {
  const pathname = usePathname();
  const currentLocale = getLocale();

  const getLocalizedPath = (locale: string) => {
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');
    return `/${locale}${pathWithoutLocale}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/30 via-stone-900/20 to-transparent backdrop-blur-md border-b border-stone-700/30 shadow-2xl transition-all duration-300">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-16 lg:h-18">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href={`/${currentLocale}`}
              className="text-xl lg:text-2xl font-serif font-bold bg-gradient-to-r from-amber-800 via-orange-900 to-amber-900 bg-clip-text text-transparent hover:from-amber-700 hover:via-orange-800 hover:to-amber-800 transition-all duration-300 drop-shadow-2xl"
            >
              Filip Kareta
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Navigation />
          </div>

          {/* Desktop Language Switcher & CTA */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-1 bg-gradient-to-r from-stone-800/40 to-stone-700/40 backdrop-blur-sm border border-stone-600/40 rounded-full p-1 shadow-lg">
              {locales.map((locale) => (
                <Link key={locale} href={getLocalizedPath(locale)}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-3 text-xs rounded-full transition-all duration-300 ${
                      currentLocale === locale
                        ? "bg-gradient-to-r from-amber-800/80 to-orange-900/80 text-white font-semibold shadow-lg border border-amber-700/50"
                        : "text-stone-200 hover:text-white hover:bg-stone-600/30"
                    }`}
                  >
                    {locale === 'cz' ? 'CZ' : locale.toUpperCase()}
                  </Button>
                </Link>
              ))}
            </div>
            <Link href={`/${currentLocale}/book`}>
              <Button
                variant="cta"
                size="lg"
                className="bg-gradient-to-r from-amber-800 to-orange-900 hover:from-amber-700 hover:to-orange-800 text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 border border-amber-700/30"
              >
                {m['navigation.book']()}
              </Button>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden relative">
            <Navigation />
          </div>
        </div>
      </div>
    </header>
  );
}
