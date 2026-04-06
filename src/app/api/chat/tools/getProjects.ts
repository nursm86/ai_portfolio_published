import { tool } from "ai";
import { z } from "zod";
// adjust the import path if needed
import { PROJECT_CONTENT } from '@/components/projects/Data';

type Link = { name: string; url: string };
type ImageItem = { src: string; alt?: string };
type ProjectItem = {
  title: string;
  description: string;
  techStack?: string[];
  date?: string | number;
  links?: Link[];
  images?: ImageItem[];
};

export const getProjects = tool({
  description: "Return a concise list of featured projects by Md. Nur Islam (derived from PROJECT_CONTENT).",
  parameters: z.object({}),
  execute: async () => {
    const projects = (PROJECT_CONTENT as ProjectItem[]).map((p) => ({
      title: p.title,
      date: p.date ?? "",
      description: p.description,
      links: (p.links ?? []).slice(0, 3), // keep it short
      techStack: (p.techStack ?? []).slice(0, 6), // brief
      coverImage: p.images?.[0]?.src ?? null,
    }));

    return { projects };
  },
});
