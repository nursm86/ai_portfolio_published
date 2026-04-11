import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function AdminLoginPage() {
  if (!hasClerk) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-semibold">Admin panel not configured</h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Set up Clerk to access the admin panel:
        </p>
        <ol className="list-decimal space-y-2 text-left text-sm text-neutral-600 dark:text-neutral-300">
          <li>
            Create an app at{' '}
            <a
              href="https://dashboard.clerk.com"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              dashboard.clerk.com
            </a>
          </li>
          <li>
            Copy the publishable + secret keys into <code>.env</code> (
            <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>,{' '}
            <code>CLERK_SECRET_KEY</code>)
          </li>
          <li>
            In Clerk dashboard → Sessions, set session lifetime to{' '}
            <strong>≤ 7 days</strong> and enable refresh token rotation
          </li>
          <li>
            Sign up in Clerk, copy your user ID (<code>user_…</code>), and add
            it to <code>ADMIN_USER_IDS</code> in <code>.env</code>
          </li>
          <li>Restart the dev server</li>
        </ol>
        <Link
          href="/"
          className="mt-4 text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <SignIn
        routing="hash"
        signUpUrl="/admin/login"
        fallbackRedirectUrl="/admin"
      />
    </div>
  );
}
