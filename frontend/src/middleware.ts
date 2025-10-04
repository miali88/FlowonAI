import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale, localePrefix } from './app/i18n/navigation.js';
import { NextResponse, NextRequest } from 'next/server';

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localeDetection: false,
  localePrefix
});

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  '/:locale/dashboard(.*)', 
  '/:locale/forum(.*)', 
  '/:locale/admin(.*)',
  '/dashboard(.*)',
  '/forum(.*)',
  '/admin(.*)'
]);

// Explicitly define which exact paths should be localized
const isLocalizedRoute = (req: NextRequest) => {
  const path = req.nextUrl.pathname;
  
  // Only localize the root path and explicit locale paths (nothing else)
  if (path === '/' || path === '/en' || path === '/es') {
    return true;
  }
  
  // Also localize blogs if needed
  if (path === '/blogs' || path.startsWith('/en/blogs') || path.startsWith('/es/blogs')) {
    return true;
  }
  
  return false;
};

// Wrapper function to properly chain middleware
export default clerkMiddleware((auth, req) => {
  const path = req.nextUrl.pathname;

  // Check if this is a localized route before evaluating protected status
  const shouldLocalize = isLocalizedRoute(req);

  // Protect routes based on authentication
  if (isProtectedRoute(req)) {
    auth.protect();
  }

  // Skip next-intl for API routes
  if (path.includes('/api')) {
    return NextResponse.next();
  }

  // Only apply the intl middleware for routes that should be localized
  if (shouldLocalize) {
    return intlMiddleware(req);
  }

  // For all other routes (like dashboard, settings, onboarding), proceed without localization
  return NextResponse.next();
});

// Configure the middleware matching
export const config = {
  matcher: [
    // Match all paths except static files and images
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$|.*\\.mp4$).*)'
  ]
};