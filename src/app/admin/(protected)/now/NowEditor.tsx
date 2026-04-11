'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type NowData = { bodyMd: string; updatedAt: string };

export default function NowEditor({ initial }: { initial: NowData }) {
  const router = useRouter();
  const [bodyMd, setBodyMd] = useState(initial.bodyMd);
  const [savedAt, setSavedAt] = useState(initial.updatedAt);
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/now', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bodyMd }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSavedAt(data.now.updatedAt);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">/now page</h1>
        <div className="text-xs text-neutral-500">
          Last saved: {new Date(savedAt).toLocaleString()}
        </div>
      </div>
      <p className="mb-4 text-sm text-neutral-500">
        Markdown body shown at <code>/now</code> and surfaced via the{' '}
        <code>getNow</code> chat tool.
      </p>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="mb-2 flex gap-2">
        <button
          type="button"
          onClick={() => setTab('edit')}
          className={`rounded px-3 py-1 text-xs ${
            tab === 'edit'
              ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900'
              : 'border border-neutral-300 dark:border-neutral-700'
          }`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setTab('preview')}
          className={`rounded px-3 py-1 text-xs ${
            tab === 'preview'
              ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900'
              : 'border border-neutral-300 dark:border-neutral-700'
          }`}
        >
          Preview
        </button>
      </div>

      {tab === 'edit' ? (
        <textarea
          value={bodyMd}
          onChange={(e) => setBodyMd(e.target.value)}
          className="h-96 w-full rounded border border-neutral-300 bg-transparent p-3 font-mono text-sm dark:border-neutral-700"
          placeholder="# Now&#10;&#10;What I'm focused on this month…"
        />
      ) : (
        <div className="prose prose-sm dark:prose-invert h-96 max-w-none overflow-auto rounded border border-neutral-300 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{bodyMd}</ReactMarkdown>
        </div>
      )}

      <button
        type="button"
        onClick={save}
        disabled={busy}
        className="mt-4 rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-40"
      >
        {busy ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}
