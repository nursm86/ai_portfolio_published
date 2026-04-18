'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewProjectPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    slug: '',
    title: '',
    category: '',
    tagline: '',
    date: new Date().getFullYear().toString(),
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ? JSON.stringify(j.error) : `HTTP ${res.status}`);
      }
      const { project } = await res.json();
      router.push(`/admin/projects/${project.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-semibold">New project</h1>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <label className="block">
          <span className="text-xs font-medium uppercase text-neutral-500">Slug</span>
          <input
            type="text"
            value={form.slug}
            onChange={(e) =>
              setForm({
                ...form,
                slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
              })
            }
            placeholder="gpa-platform"
            className="mt-1 w-full rounded border border-neutral-300 bg-transparent px-3 py-2 text-sm font-mono dark:border-neutral-700"
          />
          <span className="text-xs text-neutral-500">
            URL will be /projects/{form.slug || '…'}
          </span>
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase text-neutral-500">Title</span>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="GPA Platform"
            className="mt-1 w-full rounded border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase text-neutral-500">Category</span>
          <input
            type="text"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="Full-stack platform"
            className="mt-1 w-full rounded border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase text-neutral-500">Tagline</span>
          <textarea
            value={form.tagline}
            onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            rows={2}
            placeholder="One-line hook shown on the card and above the fold."
            className="mt-1 w-full rounded border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase text-neutral-500">Date</span>
          <input
            type="text"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            placeholder="2025 or 2024-Q3"
            className="mt-1 w-full rounded border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={
          busy ||
          !form.slug.trim() ||
          !form.title.trim() ||
          !form.category.trim() ||
          !form.tagline.trim() ||
          !form.date.trim()
        }
        className="mt-6 rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-40"
      >
        {busy ? 'Creating…' : 'Create project'}
      </button>
    </div>
  );
}
