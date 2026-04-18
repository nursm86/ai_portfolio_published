'use client';

import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

type Props = {
  number: string;
  title: string;
  children: ReactNode;
};

export default function ProjectSection({ number, title, children }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="mx-auto max-w-3xl px-6 py-20 md:py-28"
    >
      <div className="mb-8 flex items-baseline gap-4">
        <span className="font-mono text-xs tracking-widest text-neutral-400 md:text-sm dark:text-neutral-500">
          {number}
        </span>
        <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
        <h2 className="text-xl font-semibold tracking-tight text-neutral-900 md:text-2xl dark:text-neutral-100">
          {title}
        </h2>
      </div>
      <div>{children}</div>
    </motion.section>
  );
}
