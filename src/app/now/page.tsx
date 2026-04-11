import { getNowPage } from '@/lib/content';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Content editable via /admin/now at runtime — always fetch fresh.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Now — Nur Islam',
  description: "What Nur is focused on right now.",
};

export default async function NowPage() {
  const now = await getNowPage();

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-6 py-16">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
      >
        <ArrowLeft size={14} />
        Back to home
      </Link>

      <article className="prose prose-lg dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{now.bodyMd}</ReactMarkdown>
      </article>

      <div className="mt-12 border-t border-neutral-200 pt-4 text-xs text-neutral-500 dark:border-neutral-800">
        Last updated{' '}
        {new Intl.DateTimeFormat('en-AU', {
          dateStyle: 'long',
        }).format(new Date(now.updatedAt))}
        .{' '}
        <a
          href="https://nownownow.com/about"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          What is a /now page?
        </a>
      </div>
    </div>
  );
}
