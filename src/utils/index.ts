// Utility functions for the Prague tour guide website

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Locale } from '@/types';

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency based on locale
 */
export function formatCurrency(
  amount: number,
  currency: string,
  locale: Locale = 'en'
): string {
  const localeMap = {
    en: 'en-US',
    de: 'de-DE',
    fr: 'fr-FR',
  };

  return new Intl.NumberFormat(localeMap[locale], {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format date based on locale
 */
export function formatDate(date: Date, locale: Locale = 'en'): string {
  const localeMap = {
    en: 'en-US',
    de: 'de-DE',
    fr: 'fr-FR',
  };

  return new Intl.DateTimeFormat(localeMap[locale], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Generate a slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate confirmation code
 */
export function generateConfirmationCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Format duration in minutes to human readable format
 */
export function formatDuration(minutes: number, locale: Locale = 'en'): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  const translations = {
    en: { hour: 'hour', hours: 'hours', minute: 'minute', minutes: 'minutes' },
    de: { hour: 'Stunde', hours: 'Stunden', minute: 'Minute', minutes: 'Minuten' },
    fr: { hour: 'heure', hours: 'heures', minute: 'minute', minutes: 'minutes' },
  };

  const t = translations[locale];

  if (hours === 0) {
    return `${mins} ${mins === 1 ? t.minute : t.minutes}`;
  }
  
  if (mins === 0) {
    return `${hours} ${hours === 1 ? t.hour : t.hours}`;
  }

  return `${hours} ${hours === 1 ? t.hour : t.hours} ${mins} ${mins === 1 ? t.minute : t.minutes}`;
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

/**
 * Get locale from pathname
 */
export function getLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split('/');
  const localeSegment = segments[1];
  
  if (localeSegment === 'de' || localeSegment === 'fr') {
    return localeSegment;
  }
  
  return 'en';
}

/**
 * Remove locale from pathname
 */
export function removeLocaleFromPathname(pathname: string): string {
  const segments = pathname.split('/');
  if (segments[1] === 'de' || segments[1] === 'fr') {
    return '/' + segments.slice(2).join('/');
  }
  return pathname;
}

/**
 * Add locale to pathname
 */
export function addLocaleToPathname(pathname: string, locale: Locale): string {
  if (locale === 'en') return pathname;
  
  const cleanPath = removeLocaleFromPathname(pathname);
  return `/${locale}${cleanPath}`;
}
