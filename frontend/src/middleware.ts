import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale, localePrefix } from './app/i18n/navigation.js';

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  '/:locale/dashboard(.*)', 
  '/:locale/forum(.*)', 
  '/:locale/admin(.*)'
]);

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,
  
  // If this locale is matched, pathnames work without a prefix (e.g. `/about`)
  defaultLocale,
  
  // Optional: Persist locale information in cookies
  localeDetection: true,
  
  // This is the default path naming convention for Next.js i18n with App Router
  localePrefix
});

// Combine Clerk and next-intl middlewares
export default clerkMiddleware(async (auth, req) => {
  // Protect routes based on authentication status
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Skip next-intl middleware for API routes
  const path = req.nextUrl.pathname;
  if (path.includes('/api')) {
    return;
  }

  // Apply the intl middleware for regular routes
  return intlMiddleware(req);
});

// Configure the middleware matching
export const config = {
  // Skip all assets and api routes
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)']
};