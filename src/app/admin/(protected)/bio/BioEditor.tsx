'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Props = {
  initialContent: string;
  customised: boolean;
};

export default function BioEditor({ initialContent, customised }: Props) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const dirty = content !== initialContent;

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/bio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSavedAt(new Date().toLocaleTimeString());
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
        <h1 className="text-2xl font-semibold">Bio (system prompt)</h1>
        <div className="text-xs text-neutral-500">
          {customised ? (
            <span>
              Source: <code>data/bio.md</code>
            </span>
          ) : (
            <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Using default template (data/bio.default.md). Save to create
              your own copy.
            </span>
          )}
          {savedAt && <span className="ml-2">Saved at {savedAt}</span>}
        </div>
      </div>

      <div className="mb-4 rounded border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200">
        This markdown gets injected into the chat system prompt between the
        scope rules and the tool usage guidelines. The AI uses it as the
        source of truth for facts about you. Edit freely — the immutable bits
        (don&rsquo;t pretend to be ChatGPT, tone rules, tool usage) live in
        code and can&rsquo;t be changed from here.
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="mb-2 flex gap-2">
        <button
          type="button"
          onClick={() => setTab('edit')}
          className={`rounded px-3 py-1 text-xs ${
            tab === 'edit'
              ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900'
              : 'border border-neutral-300 dark:border-neutral-700'
          }`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setTab('preview')}
          className={`rounded px-3 py-1 text-xs ${
            tab === 'preview'
              ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900'
              : 'border border-neutral-300 dark:border-neutral-700'
          }`}
        >
          Preview
        </button>
      </div>

      {tab === 'edit' ? (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="h-[32rem] w-full rounded border border-neutral-300 bg-transparent p-3 font-mono text-sm dark:border-neutral-700"
          spellCheck={false}
        />
      ) : (
        <div className="prose prose-sm dark:prose-invert h-[32rem] max-w-none overflow-auto rounded border border-neutral-300 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={busy || !dirty}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-40"
        >
          {busy ? 'Saving…' : dirty ? 'Save' : 'No changes'}
        </button>
        {dirty && (
          <button
            type="button"
            onClick={() => setContent(initialContent)}
            disabled={busy}
            className="rounded border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700"
          >
            Reset
          </button>
        )}
        <div className="ml-auto text-xs text-neutral-500">
          {content.length.toLocaleString()} chars
        </div>
      </div>
    </div>
  );
}
