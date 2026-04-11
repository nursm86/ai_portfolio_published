import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

/**
 * Guard for /api/admin/* mutation routes.
 * Returns a NextResponse (401/403/503) to return early, or null if the caller may proceed.
 *
 * Checks (in order):
 *  1. CORS — if Origin header is set, must be in ALLOWED_ORIGINS
 *  2. Clerk configured — refuse if NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing
 *  3. Clerk auth() — user must be signed in
 *  4. Allow-list — user ID must be in ADMIN_USER_IDS
 */
export async function requireAdmin(req: Request): Promise<NextResponse | null> {
  // CORS check first (cheap, no DB hit)
  const origin = req.headers.get('origin');
  if (origin && ALLOWED_ORIGINS.length > 0 && !ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
  }

  // Clerk must be configured before we can authenticate anyone
  if (!hasClerk) {
    return NextResponse.json(
      {
        error:
          'Admin panel not configured. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, and ADMIN_USER_IDS in .env.',
      },
      { status: 503 },
    );
  }

  // Clerk auth — safe to call now that we know clerkMiddleware ran
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Allow-list
  if (ADMIN_USER_IDS.length === 0) {
    return NextResponse.json(
      { error: 'Admin allow-list not configured (set ADMIN_USER_IDS in env)' },
      { status: 403 },
    );
  }
  if (!ADMIN_USER_IDS.includes(userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return null;
}
