import { notFound } from 'next/navigation';
import { locales, setLocale } from '@/paraglide/runtime';
import { PageHead } from '@/components/seo/page-head';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Set the locale for Paraglide
  setLocale(locale as any);

  return (
    <>
      <PageHead pathname="" locale={locale} />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-16 lg:pt-18">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}