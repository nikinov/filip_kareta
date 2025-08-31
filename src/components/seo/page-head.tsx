import { HreflangTags } from './hreflang-tags';

interface PageHeadProps {
  pathname: string;
  locale: string;
}

export function PageHead({ pathname, locale }: PageHeadProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://guidefilip-prague.com';
  const canonicalUrl = `${baseUrl}/${locale}${pathname}`;

  return (
    <>
      <link rel="canonical" href={canonicalUrl} />
      <HreflangTags pathname={pathname} />
    </>
  );
}