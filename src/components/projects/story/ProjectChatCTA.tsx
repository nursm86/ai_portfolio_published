'use client';

import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Props = {
  title: string;
  chatPrompt: string | null;
};

export default function ProjectChatCTA({ title, chatPrompt }: Props) {
  const router = useRouter();
  const query = chatPrompt ?? `Tell me more about ${title}.`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
      className="mx-auto max-w-3xl px-6 py-24 text-center md:py-32"
    >
      <h2 className="mb-4 text-2xl font-semibold tracking-tight text-neutral-900 md:text-3xl dark:text-neutral-100">
        Want to know more?
      </h2>
      <p className="mb-8 text-base text-neutral-500 md:text-lg dark:text-neutral-400">
        Ask me anything about this project — I&apos;ll answer in chat.
      </p>
      <button
        type="button"
        onClick={() => router.push(`/chat?query=${encodeURIComponent(query)}`)}
        className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white shadow-md transition-all hover:bg-neutral-800 hover:shadow-lg dark:bg-white dark:text-black dark:hover:bg-neutral-200"
      >
        <MessageSquare size={16} />
        Ask me anything about {title}
      </button>
    </motion.section>
  );
}
