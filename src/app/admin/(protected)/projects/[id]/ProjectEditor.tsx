'use client';

import { iconNames } from '@/lib/iconRegistry';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type ImageRow = {
  id: number;
  src: string;
  alt: string;
  caption: string | null;
  layout: string;
  order: number;
};

type LinkRow = {
  id: number;
  label: string;
  url: string;
  iconName: string | null;
  order: number;
};

type Initial = {
  id: number;
  slug: string;
  title: string;
  category: string;
  tagline: string;
  coverImage: string | null;
  date: string;
  order: number;
  featured: boolean;
  problemMd: string;
  solutionMd: string;
  architectureMd: string;
  impactMd: string;
  techStack: string;
  chatPrompt: string | null;
  images: ImageRow[];
  links: LinkRow[];
};

function parseStack(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function ProjectEditor({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Top-level editable fields
  const [slug, setSlug] = useState(initial.slug);
  const [title, setTitle] = useState(initial.title);
  const [category, setCategory] = useState(initial.category);
  const [tagline, setTagline] = useState(initial.tagline);
  const [date, setDate] = useState(initial.date);
  const [coverImage, setCoverImage] = useState(initial.coverImage ?? '');
  const [order, setOrder] = useState(initial.order);
  const [featured, setFeatured] = useState(initial.featured);
  const [chatPrompt, setChatPrompt] = useState(initial.chatPrompt ?? '');

  // Tech stack — as array of strings
  const [stack, setStack] = useState<string[]>(parseStack(initial.techStack));
  const [stackInput, setStackInput] = useState('');

  // Markdown sections
  const [problemMd, setProblemMd] = useState(initial.problemMd);
  const [solutionMd, setSolutionMd] = useState(initial.solutionMd);
  const [architectureMd, setArchitectureMd] = useState(initial.architectureMd);
  const [impactMd, setImpactMd] = useState(initial.impactMd);

  // Images + links
  const [images, setImages] = useState<ImageRow[]>(initial.images);
  const [links, setLinks] = useState<LinkRow[]>(initial.links);

  async function patch(data: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/projects/${initial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ? JSON.stringify(j.error) : `HTTP ${res.status}`);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  function addStackChip() {
    const v = stackInput.trim();
    if (!v) return;
    if (stack.includes(v)) {
      setStackInput('');
      return;
    }
    const next = [...stack, v];
    setStack(next);
    setStackInput('');
    patch({ techStack: JSON.stringify(next) });
  }

  function removeStackChip(chip: string) {
    const next = stack.filter((s) => s !== chip);
    setStack(next);
    patch({ techStack: JSON.stringify(next) });
  }

  // --- Image ops ---
  async function addImage() {
    const src = prompt('Image src (e.g. /projects/invyt/1-desktop.png)');
    if (!src) return;
    const alt = prompt('Alt text') ?? '';
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/projects/${initial.id}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ src, alt, layout: 'wide', order: images.length }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { image } = await res.json();
      setImages([...images, image]);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function patchImage(id: number, data: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/projects/${initial.id}/images/${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { image } = await res.json();
      setImages(images.map((i) => (i.id === id ? image : i)));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function removeImage(id: number) {
    if (!confirm('Delete this image entry? File on disk is NOT deleted.')) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/projects/${initial.id}/images/${id}`,
        { method: 'DELETE' },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setImages(images.filter((i) => i.id !== id));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  // --- Link ops ---
  async function addLink() {
    const label = prompt('Link label (e.g. "Live site", "GitHub")');
    if (!label) return;
    const url = prompt('URL');
    if (!url) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/projects/${initial.id}/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, url, order: links.length }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { link } = await res.json();
      setLinks([...links, link]);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function patchLink(id: number, data: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/projects/${initial.id}/links/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { link } = await res.json();
      setLinks(links.map((l) => (l.id === id ? link : l)));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function removeLink(id: number) {
    if (!confirm('Delete this link?')) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/projects/${initial.id}/links/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setLinks(links.filter((l) => l.id !== id));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/admin/projects"
            className="text-xs text-neutral-500 hover:underline"
          >
            ← All projects
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">{title}</h1>
        </div>
        <Link
          href={`/projects/${slug}`}
          target="_blank"
          className="rounded border border-neutral-300 px-3 py-1.5 text-xs dark:border-neutral-700"
        >
          View live ↗
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Basic fields */}
      <Section title="Basic">
        <Field label="Slug">
          <input
            type="text"
            defaultValue={slug}
            onBlur={(e) => {
              const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
              if (v !== slug) {
                setSlug(v);
                patch({ slug: v });
              }
            }}
            className="mt-1 w-full rounded border border-neutral-300 bg-transparent px-3 py-2 font-mono text-sm dark:border-neutral-700"
          />
        </Field>
        <Field label="Title">
          <input
            type="text"
            defaultValue={title}
            onBlur={(e) => {
              if (e.target.value !== title) {
                setTitle(e.target.value);
                patch({ title: e.target.value });
              }
            }}
            className="mt-1 w-full rounded border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
          />
        </Field>
        <Field label="Category">
          <input
            type="text"
            defaultValue={category}
            onBlur={(e) => {
              if (e.target.value !== category) {
                setCategory(e.target.value);
                patch({ category: e.target.value });
              }
            }}
            className="mt-1 w-full rounded border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
          />
        </Field>
        <Field label="Tagline">
          <textarea
            defaultValue={tagline}
            onBlur={(e) => {
              if (e.target.value !== tagline) {
                setTagline(e.target.value);
                patch({ tagline: e.target.value });
              }
            }}
            rows={2}
            className="mt-1 w-full rounded border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
          />
        </Field>
        <Field label="Date">
          <input
            type="text"
            defaultValue={date}
            onBlur={(e) => {
              if (e.target.value !== date) {
                setDate(e.target.value);
                patch({ date: e.target.value });
              }
            }}
            className="mt-1 w-full rounded border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
          />
        </Field>
        <Field label="Cover image path">
          <input
            type="text"
            defaultValue={coverImage}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v !== coverImage) {
                setCoverImage(v);
                patch({ coverImage: v || null });
              }
            }}
            placeholder="/projects/<slug>/hero.png"
            className="mt-1 w-full rounded border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
          />
        </Field>
        <div className="flex gap-6">
          <Field label="Order">
            <input
              type="number"
              defaultValue={order}
              onBlur={(e) => {
                const v = Number(e.target.value);
                if (Number.isInteger(v) && v !== order) {
                  setOrder(v);
                  patch({ order: v });
                }
              }}
              className="mt-1 w-24 rounded border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
            />
          </Field>
          <Field label="Featured (visible)">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => {
                setFeatured(e.target.checked);
                patch({ featured: e.target.checked });
              }}
              className="mt-3 h-4 w-4"
            />
          </Field>
        </div>
        <Field label="Chat prompt (CTA → /chat?query=…)">
          <input
            type="text"
            defaultValue={chatPrompt}
            onBlur={(e) => {
              const v = e.target.value.trim();
              if (v !== chatPrompt) {
                setChatPrompt(v);
                patch({ chatPrompt: v || null });
              }
            }}
            placeholder={`Tell me about ${title}.`}
            className="mt-1 w-full rounded border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
          />
        </Field>
      </Section>

      {/* Tech stack chips */}
      <Section title="Tech stack">
        <div className="mb-3 flex flex-wrap gap-2">
          {stack.map((chip) => (
            <span
              key={chip}
              className="flex items-center gap-1 rounded-full bg-neutral-200 px-3 py-1 text-xs dark:bg-neutral-800"
            >
              {chip}
              <button
                type="button"
                onClick={() => removeStackChip(chip)}
                className="text-neutral-500 hover:text-red-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={stackInput}
            onChange={(e) => setStackInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addStackChip();
              }
            }}
            placeholder="Enter technology and press Enter"
            className="flex-1 rounded border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
          />
          <button
            type="button"
            onClick={addStackChip}
            disabled={!stackInput.trim()}
            className="rounded bg-blue-600 px-4 text-sm text-white disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </Section>

      {/* Markdown sections */}
      <Section title="The problem">
        <MarkdownField
          value={problemMd}
          onChange={setProblemMd}
          onSave={() => patch({ problemMd })}
          busy={busy}
          rows={6}
        />
      </Section>

      <Section title="The solution">
        <MarkdownField
          value={solutionMd}
          onChange={setSolutionMd}
          onSave={() => patch({ solutionMd })}
          busy={busy}
          rows={8}
        />
      </Section>

      <Section title="Architecture">
        <MarkdownField
          value={architectureMd}
          onChange={setArchitectureMd}
          onSave={() => patch({ architectureMd })}
          busy={busy}
          rows={5}
        />
      </Section>

      <Section title="By the numbers / impact">
        <MarkdownField
          value={impactMd}
          onChange={setImpactMd}
          onSave={() => patch({ impactMd })}
          busy={busy}
          rows={4}
        />
      </Section>

      {/* Images */}
      <Section title={`Screenshots (${images.length})`}>
        <div className="space-y-2">
          {images.map((img) => (
            <div
              key={img.id}
              className="rounded border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  defaultValue={img.src}
                  onBlur={(e) =>
                    e.target.value !== img.src &&
                    patchImage(img.id, { src: e.target.value })
                  }
                  className="flex-1 rounded border border-neutral-300 bg-transparent px-2 py-1 font-mono text-xs dark:border-neutral-700"
                />
                <select
                  defaultValue={img.layout}
                  onChange={(e) =>
                    patchImage(img.id, { layout: e.target.value })
                  }
                  className="rounded border border-neutral-300 bg-transparent px-2 text-xs dark:border-neutral-700"
                >
                  <option value="wide">wide</option>
                  <option value="half">half</option>
                  <option value="mobile">mobile</option>
                </select>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => removeImage(img.id)}
                  className="rounded border border-red-300 px-2 text-xs text-red-600 disabled:opacity-30 dark:border-red-900 dark:text-red-400"
                >
                  ×
                </button>
              </div>
              <input
                type="text"
                defaultValue={img.alt}
                onBlur={(e) =>
                  e.target.value !== img.alt &&
                  patchImage(img.id, { alt: e.target.value })
                }
                placeholder="Alt text"
                className="mt-1 w-full rounded border border-neutral-300 bg-transparent px-2 py-1 text-xs dark:border-neutral-700"
              />
              <input
                type="text"
                defaultValue={img.caption ?? ''}
                onBlur={(e) => {
                  const v = e.target.value.trim() || null;
                  if (v !== img.caption)
                    patchImage(img.id, { caption: v });
                }}
                placeholder="Caption (optional)"
                className="mt-1 w-full rounded border border-neutral-300 bg-transparent px-2 py-1 text-xs dark:border-neutral-700"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addImage}
          disabled={busy}
          className="mt-3 rounded border border-dashed border-neutral-400 px-4 py-2 text-sm dark:border-neutral-600"
        >
          + Add image
        </button>
      </Section>

      {/* Links */}
      <Section title={`Links (${links.length})`}>
        <div className="space-y-2">
          {links.map((link) => (
            <div
              key={link.id}
              className="rounded border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  defaultValue={link.label}
                  onBlur={(e) =>
                    e.target.value !== link.label &&
                    patchLink(link.id, { label: e.target.value })
                  }
                  placeholder="Label"
                  className="flex-1 rounded border border-neutral-300 bg-transparent px-2 py-1 text-xs dark:border-neutral-700"
                />
                <select
                  defaultValue={link.iconName ?? ''}
                  onChange={(e) => {
                    const v = e.target.value || null;
                    patchLink(link.id, { iconName: v });
                  }}
                  className="w-32 rounded border border-neutral-300 bg-transparent px-2 text-xs dark:border-neutral-700"
                >
                  <option value="">(no icon)</option>
                  {iconNames.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => removeLink(link.id)}
                  className="rounded border border-red-300 px-2 text-xs text-red-600 disabled:opacity-30 dark:border-red-900 dark:text-red-400"
                >
                  ×
                </button>
              </div>
              <input
                type="text"
                defaultValue={link.url}
                onBlur={(e) =>
                  e.target.value !== link.url &&
                  patchLink(link.id, { url: e.target.value })
                }
                placeholder="https://…"
                className="mt-1 w-full rounded border border-neutral-300 bg-transparent px-2 py-1 text-xs dark:border-neutral-700"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addLink}
          disabled={busy}
          className="mt-3 rounded border border-dashed border-neutral-400 px-4 py-2 text-sm dark:border-neutral-600"
        >
          + Add link
        </button>
      </Section>
    </div>
  );
}

// --- Helper components ---

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase text-neutral-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function MarkdownField({
  value,
  onChange,
  onSave,
  busy,
  rows,
}: {
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  busy: boolean;
  rows: number;
}) {
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  return (
    <div>
      <div className="mb-2 flex gap-2">
        <button
          type="button"
          onClick={() => setTab('edit')}
          className={`rounded px-3 py-0.5 text-xs ${
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
          className={`rounded px-3 py-0.5 text-xs ${
            tab === 'preview'
              ? 'bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900'
              : 'border border-neutral-300 dark:border-neutral-700'
          }`}
        >
          Preview
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={busy}
          className="ml-auto rounded bg-blue-600 px-3 text-xs text-white disabled:opacity-40"
        >
          Save section
        </button>
      </div>
      {tab === 'edit' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="w-full rounded border border-neutral-300 bg-transparent p-3 font-mono text-sm dark:border-neutral-700"
        />
      ) : (
        <div className="prose prose-sm dark:prose-invert min-h-[6rem] max-w-none rounded border border-neutral-300 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{value || '_empty_'}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
