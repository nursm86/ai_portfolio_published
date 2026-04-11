'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type NowData = { bodyMd: string; updatedAt: string } | null;

export default function NowRenderer({ initial }: { initial?: NowData } = {}) {
  const [data, setData] = useState<NowData>(initial ?? null);
  const [loading, setLoading] = useState(!initial);

  useEffect(() => {
    if (initial) return;
    let cancelled = false;
    fetch('/api/content/now')
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled) setData(j.now);
      })
      .catch(() => {
        /* swallow — fallback below renders */
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [initial]);

  if (loading) {
    return (
      <div className="mx-auto mt-6 w-full rounded-2xl bg-neutral-100 p-6 text-sm text-neutral-500 dark:bg-neutral-900">
        Loading…
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mx-auto mt-6 w-full rounded-2xl bg-neutral-100 p-6 dark:bg-neutral-900">
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.bodyMd}</ReactMarkdown>
      </div>
      <div className="mt-4 text-xs text-neutral-500">
        Last updated {new Date(data.updatedAt).toLocaleDateString()}
      </div>
    </div>
  );
}
