import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

// Define protected routes
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/forum(.*)', '/admin(.*)']);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Protect routes based on authentication status
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  console.log('Auth object:', auth)
  
  // Additional protection based on authorization status for admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    await auth.protect((has) => {
      return (
        has({ permission: 'org:sys_memberships:manage' }) ||
        has({ permission: 'org:sys_domains_manage' })
      );
    });
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};