import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { redirect } from 'next/navigation';

// Admin pages always reflect latest DB state and must run auth per request.
export const dynamic = 'force-dynamic';

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const nav = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/bio', label: 'Bio (chat prompt)' },
  { href: '/admin/activities', label: 'Activities' },
  { href: '/admin/questions', label: 'Question cards' },
  { href: '/admin/hero', label: 'Hero titles' },
  { href: '/admin/availability', label: 'Availability' },
  { href: '/admin/faq', label: 'FAQ' },
  { href: '/admin/stack', label: 'Stack' },
];

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!hasClerk) {
    redirect('/admin/login');
  }

  const { userId } = await auth();
  if (!userId) {
    redirect('/admin/login');
  }

  if (ADMIN_USER_IDS.length === 0 || !ADMIN_USER_IDS.includes(userId)) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-3">
          <h1 className="text-2xl font-semibold">Not authorised</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Your Clerk user ID is not in the admin allow-list.
          </p>
          <p className="rounded border border-neutral-200 bg-neutral-50 p-3 text-xs font-mono dark:border-neutral-700 dark:bg-neutral-800">
            {userId}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Add this ID to <code>ADMIN_USER_IDS</code> in <code>.env</code> and
            restart the server.
          </p>
          <Link href="/" className="text-sm text-blue-600 underline">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto flex min-h-screen max-w-6xl">
        <aside className="w-56 shrink-0 border-r border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-6">
            <Link href="/" className="text-xs text-neutral-500 hover:underline">
              ← Site home
            </Link>
            <h2 className="mt-2 text-lg font-semibold">Admin</h2>
          </div>
          <nav className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
