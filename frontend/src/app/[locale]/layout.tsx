import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from '@/lib/get-messages';
import { Providers } from '../providers';

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }];
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate that the locale is supported
  const locale = params.locale;
  
  // List of supported locales
  const locales = ['en', 'es'];
  
  // If the locale is not supported, return 404
  if (!locales.includes(locale)) {
    notFound();
  }
  
  // Get messages for the current locale
  const messages = await getMessages(locale);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Providers>
        {children}
      </Providers>
    </NextIntlClientProvider>
  );
} 