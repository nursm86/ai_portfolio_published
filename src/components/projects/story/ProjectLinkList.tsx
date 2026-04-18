'use client';

import { getIcon } from '@/lib/iconRegistry';
import { ArrowUpRight } from 'lucide-react';

type Link = {
  id: number;
  label: string;
  url: string;
  iconName: string | null;
};

export default function ProjectLinkList({ links }: { links: Link[] }) {
  if (links.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      {links.map((link) => {
        const Icon = link.iconName ? getIcon(link.iconName) : null;
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-5 py-4 transition-all hover:border-neutral-400 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600"
          >
            <div className="flex items-center gap-3">
              {Icon && <Icon size={18} className="shrink-0 text-neutral-500" />}
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {link.label}
              </span>
            </div>
            <ArrowUpRight
              size={18}
              className="text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
        );
      })}
    </div>
  );
}
