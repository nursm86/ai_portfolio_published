'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type AvailabilityData = {
  status: string;
  headline: string;
  detailsMd: string;
  timezone: string;
  updatedAt: string;
};

const STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'limited', label: 'Limited' },
  { value: 'not_available', label: 'Not available' },
  { value: 'unknown', label: 'Unknown' },
];

export default function AvailabilityEditor({
  initial,
}: {
  initial: AvailabilityData;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    status: initial.status,
    headline: initial.headline,
    detailsMd: initial.detailsMd,
    timezone: initial.timezone,
  });
  const [savedAt, setSavedAt] = useState(initial.updatedAt);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSavedAt(data.availability.updatedAt);
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
        <h1 className="text-2xl font-semibold">Availability</h1>
        <div className="text-xs text-neutral-500">
          Last saved: {new Date(savedAt).toLocaleString()}
        </div>
      </div>
      <p className="mb-4 text-sm text-neutral-500">
        Used by the <code>getAvailability</code> chat tool.
      </p>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <label className="block">
          <span className="text-xs font-medium uppercase text-neutral-500">
            Status
          </span>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="mt-1 w-full rounded border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase text-neutral-500">
            Headline
          </span>
          <input
            type="text"
            value={form.headline}
            onChange={(e) => setForm({ ...form, headline: e.target.value })}
            className="mt-1 w-full rounded border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase text-neutral-500">
            Details (markdown)
          </span>
          <textarea
            value={form.detailsMd}
            onChange={(e) => setForm({ ...form, detailsMd: e.target.value })}
            rows={8}
            className="mt-1 w-full rounded border border-neutral-300 bg-transparent px-3 py-2 font-mono text-sm dark:border-neutral-700"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium uppercase text-neutral-500">
            Timezone
          </span>
          <input
            type="text"
            value={form.timezone}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            className="mt-1 w-full rounded border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={save}
        disabled={busy}
        className="mt-6 rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-40"
      >
        {busy ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}
