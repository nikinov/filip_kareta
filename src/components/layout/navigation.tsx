'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import * as m from '@/paraglide/messages';
import { getLocale } from '@/paraglide/runtime';

interface NavigationItem {
  href: string;
  label: string;
  external?: boolean;
}

const getNavigationItems = (locale: string): NavigationItem[] => [
  { href: `/${locale}/tours`, label: m['navigation.tours']() },
  { href: `/${locale}/about`, label: m['navigation.about']() },
  { href: `/${locale}/blog`, label: m['navigation.blog']() },
  { href: `/${locale}/contact`, label: m['navigation.contact']() },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const currentLocale = getLocale();
  const navigationItems = getNavigationItems(currentLocale);

  const isActive = (href: string) => {
    if (href === `/${currentLocale}`) return pathname === `/${currentLocale}` || pathname === `/${currentLocale}/`;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-2">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
              isActive(item.href)
                ? 'text-white bg-gradient-to-r from-amber-800/60 to-orange-900/60 shadow-lg backdrop-blur-sm border border-amber-700/30'
                : 'text-stone-200 hover:text-white hover:bg-stone-700/30'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Mobile Navigation Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 rounded-md text-stone-700 hover:text-prague-600 hover:bg-prague-50 focus:outline-none focus:ring-2 focus:ring-prague-500"
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 md:hidden bg-white border-t border-stone-200 shadow-lg z-50">
          <div className="px-4 py-4 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'block px-3 py-2 rounded-md text-base font-medium transition-colors',
                  isActive(item.href)
                    ? 'text-prague-600 bg-prague-50'
                    : 'text-stone-700 hover:text-prague-600 hover:bg-prague-50'
                )}
              >
                {item.label}
              </Link>
            ))}
            
            <Separator className="my-4" />
            
            {/* Mobile Language Switcher */}
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-stone-700 mb-2">Language</p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">EN</Button>
                <Button variant="ghost" size="sm">DE</Button>
                <Button variant="ghost" size="sm">FR</Button>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            {/* Mobile CTA */}
            <div className="px-3 py-2">
              <Link href="/book">
                <Button variant="cta" fullWidth size="lg">
                  Book Your Tour
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}