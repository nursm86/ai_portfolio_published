'use client';

import { motion } from 'framer-motion';

export default function TechChips({ stack }: { stack: string[] }) {
  if (stack.length === 0) return null;
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {stack.map((tech, i) => (
        <motion.span
          key={tech}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.03, duration: 0.35 }}
          className="rounded-full border border-neutral-200 bg-white/60 px-3 py-1 text-sm font-medium text-neutral-700 backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-300"
        >
          {tech}
        </motion.span>
      ))}
    </div>
  );
}
