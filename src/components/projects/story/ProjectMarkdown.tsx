'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ProjectMarkdown({ children }: { children: string }) {
  if (!children.trim()) return null;
  return (
    <div className="prose prose-neutral dark:prose-invert prose-lg max-w-none prose-headings:font-semibold prose-p:leading-relaxed">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
