/** @type {import('next-intl').NextIntlConfig} */
module.exports = {
  // Define the locales supported by your application
  locales: ['en', 'es'],
  
  // Set the default locale
  defaultLocale: 'en',
  
  // Optional: Configure logging
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'error' : 'warn',
  },
  
  // For date, number or other formatters
  formats: {
    dateTime: {
      short: {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }
    }
  }
};
