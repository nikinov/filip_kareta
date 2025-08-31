import { locales } from '@/paraglide/runtime';

interface HreflangTagsProps {
  pathname: string;
}

export function HreflangTags({ pathname }: HreflangTagsProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://guidefilip-prague.com';
  
  return (
    <>
      {locales.map((locale) => (
        <link
          key={locale}
          rel="alternate"
          hrefLang={locale}
          href={`${baseUrl}/${locale}${pathname}`}
        />
      ))}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${baseUrl}/en${pathname}`}
      />
    </>
  );
}