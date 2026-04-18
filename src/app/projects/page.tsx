import { getProjects } from '@/lib/content';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Projects — Nur Islam',
  description:
    "Case studies of Nur's projects — full-stack platforms, research, and experiments.",
};

function parseStack(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default async function ProjectsGridPage() {
  const projects = await getProjects();

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <Link
          href="/chat"
          className="mb-10 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
        >
          <ArrowLeft size={14} />
          Back to chat
        </Link>

        <header className="mb-12">
          <h1 className="mb-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Projects
          </h1>
          <p className="max-w-2xl text-base text-neutral-500 md:text-lg dark:text-neutral-400">
            Case studies of things I&apos;ve built. Click into any one to read
            the story, see screenshots, and dig into the stack.
          </p>
        </header>

        {projects.length === 0 ? (
          <p className="text-neutral-500">No projects published yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {projects.map((p) => {
              const stack = parseStack(p.techStack);
              return (
                <Link
                  key={p.slug}
                  href={`/projects/${p.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 transition-all hover:-translate-y-1 hover:border-neutral-400 hover:shadow-xl dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    {p.coverImage ? (
                      <Image
                        src={p.coverImage}
                        alt={p.title}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-200 to-neutral-300 text-neutral-400 dark:from-neutral-800 dark:to-neutral-900">
                        <span className="text-6xl font-bold">
                          {p.title.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-2 flex items-center gap-2 text-xs tracking-wide text-neutral-500 uppercase">
                      <span>{p.category}</span>
                      <span>·</span>
                      <span>{p.date}</span>
                    </div>
                    <h2 className="mb-2 text-xl font-semibold tracking-tight md:text-2xl">
                      {p.title}
                    </h2>
                    <p className="mb-4 flex-1 text-sm text-neutral-600 dark:text-neutral-400">
                      {p.tagline}
                    </p>
                    {stack.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-1.5">
                        {stack.slice(0, 5).map((t) => (
                          <span
                            key={t}
                            className="rounded-full bg-neutral-200 px-2 py-0.5 text-[11px] font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                          >
                            {t}
                          </span>
                        ))}
                        {stack.length > 5 && (
                          <span className="text-[11px] text-neutral-500">
                            +{stack.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      Read case study
                      <ArrowUpRight
                        size={14}
                        className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
