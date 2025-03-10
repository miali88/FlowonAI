import {createSharedPathnamesNavigation} from 'next-intl/navigation';

export const locales = ['en', 'es'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

export const routing = {
  locales,
  defaultLocale
}

// Create a navigation object that handles shared pathnames
export const {Link, redirect, usePathname, useRouter} = 
  createSharedPathnamesNavigation({
    locales,
    defaultLocale
  }); 