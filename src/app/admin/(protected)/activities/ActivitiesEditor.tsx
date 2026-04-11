'use client';

import { getIcon, iconNames } from '@/lib/iconRegistry';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Activity = {
  id: number;
  label: string;
  iconName: string;
  color: string;
  href: string | null;
  chatPrompt: string | null;
  order: number;
};

const EMPTY: Omit<Activity, 'id' | 'order'> = {
  label: '',
  iconName: 'Sparkles',
  color: '#A855F7',
  href: null,
  chatPrompt: null,
};

export default function ActivitiesEditor({ initial }: { initial: Activity[] }) {
  const router = useRouter();
  const [items, setItems] = useState<Activity[]>(initial);
  const [newItem, setNewItem] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch('/api/admin/activities');
    if (res.ok) {
      const data = await res.json();
      setItems(data.activities);
    }
  }

  async function createItem() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newItem, order: items.length }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setNewItem(EMPTY);
      await refresh();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function updateItem(id: number, patch: Partial<Activity>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/activities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await refresh();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function deleteItem(id: number) {
    if (!confirm('Delete this activity?')) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/activities/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await refresh();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function move(id: number, direction: -1 | 1) {
    const idx = items.findIndex((i) => i.id === id);
    const swap = idx + direction;
    if (idx === -1 || swap < 0 || swap >= items.length) return;
    const a = items[idx];
    const b = items[swap];
    await Promise.all([
      updateItem(a.id, { order: b.order }),
      updateItem(b.id, { order: a.order }),
    ]);
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Activities</h1>
      <p className="mb-4 text-sm text-neutral-500">
        The scrolling &ldquo;What I&rsquo;m up to&rdquo; cards on the landing page.
      </p>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => {
          const Icon = getIcon(item.iconName);
          const canUp = items.findIndex((i) => i.id === item.id) > 0;
          const canDown = items.findIndex((i) => i.id === item.id) < items.length - 1;
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
                    defaultValue={item.label}
                    onBlur={(e) =>
                      e.target.value !== item.label &&
                      updateItem(item.id, { label: e.target.value })
                    }
                    className="w-full rounded border border-neutral-300 bg-transparent px-2 py-1 text-sm dark:border-neutral-700"
                  />
                  <input
                    type="text"
                    defaultValue={item.chatPrompt ?? ''}
                    onBlur={(e) => {
                      const v = e.target.value.trim() || null;
                      if (v !== item.chatPrompt)
                        updateItem(item.id, { chatPrompt: v });
                    }}
                    placeholder="Chat prompt when clicked (falls back to label)"
                    className="w-full rounded border border-neutral-300 bg-transparent px-2 py-1 text-xs italic dark:border-neutral-700"
                  />
                  <div className="flex flex-wrap gap-2 text-xs">
                    <label className="flex items-center gap-1">
                      Icon:
                      <select
                        defaultValue={item.iconName}
                        onChange={(e) =>
                          updateItem(item.id, { iconName: e.target.value })
                        }
                        className="rounded border border-neutral-300 bg-transparent px-1 py-0.5 dark:border-neutral-700"
                      >
                        {iconNames.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex items-center gap-1">
                      Color:
                      <input
                        type="color"
                        defaultValue={item.color}
                        onBlur={(e) =>
                          e.target.value !== item.color &&
                          updateItem(item.id, { color: e.target.value.toUpperCase() })
                        }
                        className="h-6 w-12 rounded border border-neutral-300 dark:border-neutral-700"
                      />
                    </label>
                    <label className="flex items-center gap-1">
                      Href (external route, e.g. /hex):
                      <input
                        type="text"
                        placeholder="optional"
                        defaultValue={item.href ?? ''}
                        onBlur={(e) => {
                          const v = e.target.value.trim() || null;
                          if (v !== item.href)
                            updateItem(item.id, { href: v });
                        }}
                        className="w-32 rounded border border-neutral-300 bg-transparent px-2 py-0.5 dark:border-neutral-700"
                      />
                    </label>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    disabled={!canUp || busy}
                    onClick={() => move(item.id, -1)}
                    className="rounded border border-neutral-300 px-2 py-0.5 text-xs disabled:opacity-30 dark:border-neutral-700"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={!canDown || busy}
                    onClick={() => move(item.id, 1)}
                    className="rounded border border-neutral-300 px-2 py-0.5 text-xs disabled:opacity-30 dark:border-neutral-700"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => deleteItem(item.id)}
                    className="rounded border border-red-300 px-2 py-0.5 text-xs text-red-600 disabled:opacity-30 dark:border-red-900 dark:text-red-400"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="mb-3 text-sm font-medium">Add new activity</h2>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Label (what shows on the chip)"
            value={newItem.label}
            onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
            className="w-full rounded border border-neutral-300 bg-transparent px-2 py-1 text-sm dark:border-neutral-700"
          />
          <input
            type="text"
            placeholder="Chat prompt when clicked (defaults to label)"
            value={newItem.chatPrompt ?? ''}
            onChange={(e) =>
              setNewItem({
                ...newItem,
                chatPrompt: e.target.value.trim() || null,
              })
            }
            className="w-full rounded border border-neutral-300 bg-transparent px-2 py-1 text-xs italic dark:border-neutral-700"
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
            <input
              type="text"
              placeholder="href (optional, e.g. /hex)"
              value={newItem.href ?? ''}
              onChange={(e) =>
                setNewItem({ ...newItem, href: e.target.value.trim() || null })
              }
              className="w-32 rounded border border-neutral-300 bg-transparent px-2 py-0.5 dark:border-neutral-700"
            />
          </div>
          <button
            type="button"
            onClick={createItem}
            disabled={busy || !newItem.label.trim()}
            className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
