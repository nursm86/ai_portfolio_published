'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type StackItem = {
  id: number;
  category: string;
  name: string;
  note: string | null;
  order: number;
};

export default function StackEditor({ initial }: { initial: StackItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState<StackItem[]>(initial);
  const [newItem, setNewItem] = useState({
    category: '',
    name: '',
    note: '',
  });
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
      const refreshed = await fetch('/api/admin/stack');
      if (refreshed.ok) setItems((await refreshed.json()).stack);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const grouped = items.reduce<Record<string, StackItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Stack</h1>
      <p className="mb-4 text-sm text-neutral-500">
        Day-to-day tools — surfaced via the <code>getStack</code> chat tool.
      </p>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {Object.entries(grouped).map(([category, list]) => (
        <div key={category} className="mb-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
            {category}
          </h2>
          <div className="space-y-2">
            {list.map((item) => (
              <div
                key={item.id}
                className="rounded border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    defaultValue={item.name}
                    onBlur={(e) =>
                      e.target.value !== item.name &&
                      call('PATCH', `/api/admin/stack/${item.id}`, {
                        name: e.target.value,
                      })
                    }
                    className="flex-1 rounded border border-neutral-300 bg-transparent px-2 py-1 text-sm font-semibold dark:border-neutral-700"
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      if (confirm('Delete this item?'))
                        call('DELETE', `/api/admin/stack/${item.id}`);
                    }}
                    className="rounded border border-red-300 px-2 text-xs text-red-600 disabled:opacity-30 dark:border-red-900 dark:text-red-400"
                  >
                    ×
                  </button>
                </div>
                <input
                  type="text"
                  defaultValue={item.note ?? ''}
                  onBlur={(e) => {
                    const v = e.target.value.trim() || null;
                    if (v !== item.note)
                      call('PATCH', `/api/admin/stack/${item.id}`, { note: v });
                  }}
                  placeholder="Note (optional)"
                  className="mt-1 w-full rounded border border-neutral-300 bg-transparent px-2 py-1 text-xs dark:border-neutral-700"
                />
                <input
                  type="text"
                  defaultValue={item.category}
                  onBlur={(e) =>
                    e.target.value !== item.category &&
                    call('PATCH', `/api/admin/stack/${item.id}`, {
                      category: e.target.value,
                    })
                  }
                  placeholder="Category"
                  className="mt-1 w-full rounded border border-neutral-300 bg-transparent px-2 py-1 text-xs dark:border-neutral-700"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-6 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="mb-3 text-sm font-medium">Add new item</h2>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Category (e.g. Editor)"
            value={newItem.category}
            onChange={(e) =>
              setNewItem({ ...newItem, category: e.target.value })
            }
            className="w-full rounded border border-neutral-300 bg-transparent px-2 py-1 text-sm dark:border-neutral-700"
          />
          <input
            type="text"
            placeholder="Name (e.g. VS Code)"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="w-full rounded border border-neutral-300 bg-transparent px-2 py-1 text-sm dark:border-neutral-700"
          />
          <input
            type="text"
            placeholder="Note (optional)"
            value={newItem.note}
            onChange={(e) => setNewItem({ ...newItem, note: e.target.value })}
            className="w-full rounded border border-neutral-300 bg-transparent px-2 py-1 text-sm dark:border-neutral-700"
          />
          <button
            type="button"
            disabled={busy || !newItem.category.trim() || !newItem.name.trim()}
            onClick={async () => {
              await call('POST', '/api/admin/stack', {
                category: newItem.category,
                name: newItem.name,
                note: newItem.note.trim() || null,
                order: items.filter((i) => i.category === newItem.category).length,
              });
              setNewItem({ category: '', name: '', note: '' });
            }}
            className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
