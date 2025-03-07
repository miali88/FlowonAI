import { getRequestConfig } from 'next-intl/server';

// Define the supported locales directly in this file
const locales = ['en', 'es'];

export default getRequestConfig(async ({ locale }) => {
  // Validate that the locale is supported, or fallback to default
  const resolvedLocale = locales.includes(locale) ? locale : 'en';
  
  // Return the messages for the requested locale
  return {
    messages: (await import(`./messages/${resolvedLocale}.json`)).default
  };
}); 