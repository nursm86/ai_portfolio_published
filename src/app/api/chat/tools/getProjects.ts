import { tool } from 'ai';
import { z } from 'zod';
import { getProjects as fetchProjects } from '@/lib/content';

export const getProjects = tool({
  description:
    "Return a concise list of Nur's featured projects (derived from the Project table). The carousel component fetches full data itself; this tool result is used by the model to acknowledge which projects exist.",
  inputSchema: z.object({}),
  execute: async () => {
    const projects = await fetchProjects();
    return {
      projects: projects.map((p) => ({
        slug: p.slug,
        title: p.title,
        category: p.category,
        tagline: p.tagline,
        date: p.date,
        techStack: (() => {
          try {
            return JSON.parse(p.techStack) as string[];
          } catch {
            return [];
          }
        })(),
      })),
    };
  },
});
