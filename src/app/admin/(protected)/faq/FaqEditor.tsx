'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Faq = { id: number; question: string; answer: string; order: number };

export default function FaqEditor({ initial }: { initial: Faq[] }) {
  const router = useRouter();
  const [items, setItems] = useState<Faq[]>(initial);
  const [newItem, setNewItem] = useState({ question: '', answer: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function call(method: string, path: string, body?: unknown) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(path, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const refreshed = await fetch('/api/admin/faq');
      if (refreshed.ok) setItems((await refreshed.json()).faqs);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">FAQ</h1>
      <p className="mb-4 text-sm text-neutral-500">
        Surfaced via the <code>getFAQ</code> chat tool.
      </p>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <input
              type="text"
              defaultValue={item.question}
              onBlur={(e) =>
                e.target.value !== item.question &&
                call('PATCH', `/api/admin/faq/${item.id}`, {
                  question: e.target.value,
                })
              }
              placeholder="Question"
              className="mb-2 w-full rounded border border-neutral-300 bg-transparent px-2 py-1 text-sm font-semibold dark:border-neutral-700"
            />
            <textarea
              defaultValue={item.answer}
              onBlur={(e) =>
                e.target.value !== item.answer &&
                call('PATCH', `/api/admin/faq/${item.id}`, {
                  answer: e.target.value,
                })
              }
              rows={3}
              placeholder="Answer"
              className="w-full rounded border border-neutral-300 bg-transparent px-2 py-1 text-sm dark:border-neutral-700"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (confirm('Delete this FAQ?'))
                  call('DELETE', `/api/admin/faq/${item.id}`);
              }}
              className="mt-2 rounded border border-red-300 px-2 py-0.5 text-xs text-red-600 disabled:opacity-30 dark:border-red-900 dark:text-red-400"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="mb-3 text-sm font-medium">Add new FAQ</h2>
        <input
          type="text"
          placeholder="Question"
          value={newItem.question}
          onChange={(e) =>
            setNewItem({ ...newItem, question: e.target.value })
          }
          className="mb-2 w-full rounded border border-neutral-300 bg-transparent px-2 py-1 text-sm dark:border-neutral-700"
        />
        <textarea
          placeholder="Answer"
          value={newItem.answer}
          onChange={(e) => setNewItem({ ...newItem, answer: e.target.value })}
          rows={3}
          className="mb-2 w-full rounded border border-neutral-300 bg-transparent px-2 py-1 text-sm dark:border-neutral-700"
        />
        <button
          type="button"
          disabled={busy || !newItem.question.trim() || !newItem.answer.trim()}
          onClick={async () => {
            await call('POST', '/api/admin/faq', {
              ...newItem,
              order: items.length,
            });
            setNewItem({ question: '', answer: '' });
          }}
          className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  );
}
