import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/library(.*)',
  '/dashboard(.*)',
  '/profile(.*)',
  '/my-decks(.*)',
  '/community(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;

  // Always log to see if middleware is running
  console.log('[Middleware] Route:', pathname);

  if (isProtectedRoute(req)) {
    console.log('[Middleware] Route is protected, checking auth...');
    const { userId } = await auth();
    console.log('[Middleware] User ID:', userId || 'NOT AUTHENTICATED');

    if (!userId) {
      console.log('[Middleware] Redirecting to /login');
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(loginUrl);
    }
  } else {
    console.log('[Middleware] Route is not protected');
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
