'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type HeroTitle = { id: number; text: string; order: number };

export default function HeroEditor({ initial }: { initial: HeroTitle[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [newText, setNewText] = useState('');
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
      const refreshed = await fetch('/api/admin/hero-titles');
      if (refreshed.ok) setItems((await refreshed.json()).heroTitles);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Hero titles</h1>
      <p className="mb-4 text-sm text-neutral-500">
        The rotating taglines under &ldquo;Hey, I&apos;m Nur 👋&rdquo;. They
        cycle every 2.5 seconds.
      </p>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex gap-2">
            <input
              type="text"
              defaultValue={item.text}
              onBlur={(e) =>
                e.target.value !== item.text &&
                call('PATCH', `/api/admin/hero-titles/${item.id}`, {
                  text: e.target.value,
                })
              }
              className="flex-1 rounded border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (confirm('Delete this title?'))
                  call('DELETE', `/api/admin/hero-titles/${item.id}`);
              }}
              className="rounded border border-red-300 px-3 text-sm text-red-600 disabled:opacity-30 dark:border-red-900 dark:text-red-400"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="New title…"
          className="flex-1 rounded border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
        />
        <button
          type="button"
          disabled={busy || !newText.trim()}
          onClick={async () => {
            await call('POST', '/api/admin/hero-titles', {
              text: newText.trim(),
              order: items.length,
            });
            setNewText('');
          }}
          className="rounded bg-blue-600 px-4 text-sm text-white disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  );
}
