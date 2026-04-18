'use client';

import { Card, Carousel } from '@/components/projects/apple-cards-carousel';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type ProjectImage = {
  id: number;
  src: string;
  alt: string;
  caption: string | null;
  layout: string;
};

type ProjectLink = {
  id: number;
  label: string;
  url: string;
  iconName: string | null;
};

type Project = {
  id: number;
  slug: string;
  title: string;
  category: string;
  tagline: string;
  coverImage: string | null;
  date: string;
  techStack: string; // JSON string
  chatPrompt: string | null;
  images: ProjectImage[];
  links: ProjectLink[];
};

function parseStack(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function AllProjects() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/content/projects')
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled) setProjects(j.projects ?? []);
      })
      .catch(() => {
        if (!cancelled) setProjects([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (projects === null) {
    return (
      <div className="h-full w-full pt-8 text-center text-sm text-neutral-500">
        Loading projects…
      </div>
    );
  }

  if (projects.length === 0) return null;

  const cards = projects.map((p, index) => {
    const stack = parseStack(p.techStack);
    return (
      <Card
        key={p.slug}
        index={index}
        layout
        card={{
          src: p.coverImage ?? '',
          title: p.title,
          category: p.category,
          slug: p.slug,
          content: (
            <div className="space-y-6">
              <p className="text-secondary-foreground text-base leading-relaxed md:text-lg">
                {p.tagline}
              </p>

              {stack.length > 0 && (
                <div>
                  <h3 className="mb-2 text-xs tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
                    Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {stack.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-neutral-200 px-3 py-1 text-sm text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => router.push(`/projects/${p.slug}`)}
                  className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                >
                  View full case study →
                </button>
              </div>
            </div>
          ),
        }}
      />
    );
  });

  return (
    <div className="h-full w-full pt-8">
      <h2 className="mx-auto max-w-7xl font-sans text-xl font-bold text-neutral-800 md:text-3xl dark:text-neutral-200">
        My Projects
      </h2>
      <Carousel items={cards} />
    </div>
  );
}
