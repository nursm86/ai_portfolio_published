import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)', '/api/admin(.*)']);
const isAdminLogin = createRouteMatcher(['/admin/login(.*)']);

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// If Clerk keys are not set, the middleware is a pass-through so the rest of
// the site (landing, chat, hex, architecture) still works during setup.
// The admin routes will refuse to render until Clerk is configured.
const clerkGuard = clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req) && !isAdminLogin(req)) {
    await auth.protect();
  }
});

export default function middleware(req: NextRequest) {
  if (!hasClerk) return NextResponse.next();
  return clerkGuard(req, { waitUntil: () => {} } as never);
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|.*\\.(?:ico|png|jpg|jpeg|svg|webp|gif|css|js|mp4|webm|pdf|woff2?|ttf)$).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
