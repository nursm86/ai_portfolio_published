'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type AvailabilityData = {
  status: string;
  headline: string;
  detailsMd: string;
  timezone: string;
} | null;

const STATUS_COLORS: Record<string, string> = {
  available: 'bg-green-500',
  limited: 'bg-amber-500',
  not_available: 'bg-red-500',
  unknown: 'bg-neutral-400',
};

const STATUS_LABELS: Record<string, string> = {
  available: 'Available',
  limited: 'Limited availability',
  not_available: 'Not available',
  unknown: 'Unknown',
};

export function Availability() {
  const [data, setData] = useState<AvailabilityData>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/content/availability')
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled) setData(j.availability);
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
        Loading availability…
      </div>
    );
  }

  if (!data) return null;

  const dotColor = STATUS_COLORS[data.status] ?? STATUS_COLORS.unknown;
  const label = STATUS_LABELS[data.status] ?? data.status;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto mt-6 w-full rounded-2xl bg-neutral-100 p-6 dark:bg-neutral-900"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          {label}
        </span>
        <span className="ml-auto text-xs text-neutral-500">{data.timezone}</span>
      </div>
      <h3 className="mb-3 text-lg font-semibold">{data.headline}</h3>
      {data.detailsMd && (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.detailsMd}</ReactMarkdown>
        </div>
      )}
    </motion.div>
  );
}

export default Availability;
