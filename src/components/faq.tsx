'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

type FaqItem = { id: number; question: string; answer: string };

export function FAQ() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/content/faq')
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled) {
          setFaqs(j.faqs);
          if (j.faqs.length > 0) setOpenId(j.faqs[0].id);
        }
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
        Loading FAQ…
      </div>
    );
  }

  if (faqs.length === 0) {
    return (
      <div className="mx-auto mt-6 w-full rounded-2xl bg-neutral-100 p-6 text-sm text-neutral-500 dark:bg-neutral-900">
        No FAQs yet.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto mt-6 w-full space-y-2"
    >
      {faqs.map((faq) => {
        const open = faq.id === openId;
        return (
          <div
            key={faq.id}
            className="overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900"
          >
            <button
              type="button"
              onClick={() => setOpenId(open ? null : faq.id)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
            >
              <span className="text-sm font-medium">{faq.question}</span>
              <ChevronDown
                size={16}
                className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
              />
            </button>
            {open && (
              <div className="px-5 pb-4 text-sm text-neutral-600 dark:text-neutral-300">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </motion.div>
  );
}

export default FAQ;
