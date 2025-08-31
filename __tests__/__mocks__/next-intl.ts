import React from 'react';

// Mock useTranslations hook
export const useTranslations = (namespace?: string) => {
  return (key: string) => {
    // Return a simple key-based mock translation
    if (namespace) {
      return `${namespace}.${key}`;
    }
    return key;
  };
};

// Mock NextIntlClientProvider
export const NextIntlClientProvider: React.FC<{
  children: React.ReactNode;
  messages: any;
  locale: string;
}> = ({ children }) => {
  return React.createElement('div', { 'data-testid': 'intl-provider' }, children);
};