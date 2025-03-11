import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { defaultLocale, locales } from './i18n/navigation';

export default function RootPage() {
  // Detect preferred language from Accept-Language header
  const headersList = headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  
  // Extract language code (simplified example)
  let preferredLocale = defaultLocale;
  
  // Check if Spanish is in the Accept-Language header
  if (acceptLanguage.includes('es')) {
    preferredLocale = 'es';
  }
  
  // Only redirect to localized version if it's one of our supported locales
  if (locales.includes(preferredLocale)) {
    redirect(`/${preferredLocale}`);
  } else {
    redirect(`/${defaultLocale}`);
  }
}
