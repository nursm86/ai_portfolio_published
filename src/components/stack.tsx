'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

type StackItem = {
  id: number;
  category: string;
  name: string;
  note: string | null;
};

export function Stack() {
  const [items, setItems] = useState<StackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/content/stack')
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled) setItems(j.stack);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="mx-auto mt-6 w-full rounded-2xl bg-neutral-100 p-6 text-sm text-neutral-500 dark:bg-neutral-900">
        Loading stack…
      </div>
    );
  }

  const grouped = items.reduce<Record<string, StackItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto mt-6 w-full rounded-2xl bg-neutral-100 p-6 dark:bg-neutral-900"
    >
      <h3 className="mb-4 text-lg font-semibold">Day-to-day stack</h3>
      <div className="space-y-4">
        {Object.entries(grouped).map(([category, list]) => (
          <div key={category}>
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
              {category}
            </div>
            <div className="flex flex-wrap gap-2">
              {list.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-800"
                  title={item.note ?? undefined}
                >
                  <div className="font-medium">{item.name}</div>
                  {item.note && (
                    <div className="mt-0.5 text-neutral-500">{item.note}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default Stack;
