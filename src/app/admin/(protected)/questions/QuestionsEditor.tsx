'use client';

import { getIcon, iconNames } from '@/lib/iconRegistry';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Question = {
  id: number;
  key: string;
  prompt: string;
  iconName: string;
  color: string;
  order: number;
};

export default function QuestionsEditor({ initial }: { initial: Question[] }) {
  const router = useRouter();
  const [items, setItems] = useState<Question[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    key: '',
    prompt: '',
    iconName: 'Sparkles',
    color: '#A855F7',
  });

  async function refresh() {
    const res = await fetch('/api/admin/questions');
    if (res.ok) setItems((await res.json()).questions);
  }

  async function call(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<boolean> {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(path, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function update(id: number, patch: Partial<Question>) {
    if (await call('PATCH', `/api/admin/questions/${id}`, patch)) {
      await refresh();
      router.refresh();
    }
  }

  async function create() {
    if (await call('POST', '/api/admin/questions', { ...newItem, order: items.length })) {
      setNewItem({ key: '', prompt: '', iconName: 'Sparkles', color: '#A855F7' });
      await refresh();
      router.refresh();
    }
  }

  async function remove(id: number) {
    if (!confirm('Delete this question card?')) return;
    if (await call('DELETE', `/api/admin/questions/${id}`)) {
      await refresh();
      router.refresh();
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Question cards</h1>
      <p className="mb-4 text-sm text-neutral-500">
        The four quick-question buttons on the landing page. Each has a short
        label (key) and the full prompt sent to the chat when clicked.
      </p>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => {
          const Icon = getIcon(item.iconName);
          return (
            <div
              key={item.id}
              className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-start gap-3">
                <Icon size={20} color={item.color} className="mt-1 shrink-0" />
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    defaultValue={item.key}
                    onBlur={(e) =>
                      e.target.value !== item.key &&
                      update(item.id, { key: e.target.value })
                    }
                    className="w-full rounded border border-neutral-300 bg-transparent px-2 py-1 text-sm font-semibold dark:border-neutral-700"
                    placeholder="Key (e.g. Me)"
                  />
                  <textarea
                    defaultValue={item.prompt}
                    onBlur={(e) =>
                      e.target.value !== item.prompt &&
                      update(item.id, { prompt: e.target.value })
                    }
                    className="w-full rounded border border-neutral-300 bg-transparent px-2 py-1 text-sm dark:border-neutral-700"
                    rows={2}
                    placeholder="Full chat prompt"
                  />
                  <div className="flex flex-wrap gap-2 text-xs">
                    <select
                      defaultValue={item.iconName}
                      onChange={(e) =>
                        update(item.id, { iconName: e.target.value })
                      }
                      className="rounded border border-neutral-300 bg-transparent px-1 py-0.5 dark:border-neutral-700"
                    >
                      {iconNames.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <input
                      type="color"
                      defaultValue={item.color}
                      onBlur={(e) =>
                        e.target.value !== item.color &&
                        update(item.id, { color: e.target.value.toUpperCase() })
                      }
                      className="h-6 w-12 rounded border border-neutral-300 dark:border-neutral-700"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => remove(item.id)}
                  className="rounded border border-red-300 px-2 py-0.5 text-xs text-red-600 disabled:opacity-30 dark:border-red-900 dark:text-red-400"
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="mb-3 text-sm font-medium">Add new card</h2>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Key"
            value={newItem.key}
            onChange={(e) => setNewItem({ ...newItem, key: e.target.value })}
            className="w-full rounded border border-neutral-300 bg-transparent px-2 py-1 text-sm dark:border-neutral-700"
          />
          <textarea
            placeholder="Chat prompt"
            value={newItem.prompt}
            onChange={(e) =>
              setNewItem({ ...newItem, prompt: e.target.value })
            }
            className="w-full rounded border border-neutral-300 bg-transparent px-2 py-1 text-sm dark:border-neutral-700"
            rows={2}
          />
          <div className="flex flex-wrap gap-2 text-xs">
            <select
              value={newItem.iconName}
              onChange={(e) =>
                setNewItem({ ...newItem, iconName: e.target.value })
              }
              className="rounded border border-neutral-300 bg-transparent px-1 py-0.5 dark:border-neutral-700"
            >
              {iconNames.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <input
              type="color"
              value={newItem.color}
              onChange={(e) =>
                setNewItem({ ...newItem, color: e.target.value.toUpperCase() })
              }
              className="h-6 w-12 rounded border border-neutral-300 dark:border-neutral-700"
            />
          </div>
          <button
            type="button"
            onClick={create}
            disabled={busy || !newItem.key.trim() || !newItem.prompt.trim()}
            className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
