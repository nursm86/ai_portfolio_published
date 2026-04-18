'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

type Row = {
  id: number;
  slug: string;
  title: string;
  category: string;
  featured: boolean;
  order: number;
  imageCount: number;
  linkCount: number;
};

export default function ProjectsListClient({ initial }: { initial: Row[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove(id: number) {
    if (!confirm('Delete this project? Screenshots on disk are NOT deleted.'))
      return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setRows(rows.filter((r) => r.id !== id));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}
      {rows.map((p) => (
        <div
          key={p.id}
          className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/projects/${p.id}`}
                className="font-semibold hover:underline"
              >
                {p.title}
              </Link>
              {!p.featured && (
                <span className="rounded bg-neutral-200 px-2 py-0.5 text-[10px] uppercase text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                  hidden
                </span>
              )}
            </div>
            <div className="text-xs text-neutral-500">
              {p.category} · /projects/{p.slug} · {p.imageCount} images ·{' '}
              {p.linkCount} links
            </div>
          </div>
          <Link
            href={`/projects/${p.slug}`}
            target="_blank"
            className="rounded border border-neutral-300 px-3 py-1 text-xs dark:border-neutral-700"
          >
            View
          </Link>
          <Link
            href={`/admin/projects/${p.id}`}
            className="rounded bg-neutral-800 px-3 py-1 text-xs text-white dark:bg-neutral-200 dark:text-neutral-900"
          >
            Edit
          </Link>
          <button
            type="button"
            disabled={busy}
            onClick={() => remove(p.id)}
            className="rounded border border-red-300 px-2 py-1 text-xs text-red-600 disabled:opacity-30 dark:border-red-900 dark:text-red-400"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
