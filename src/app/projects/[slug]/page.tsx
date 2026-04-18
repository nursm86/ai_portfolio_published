import { getProjectBySlug } from '@/lib/content';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProjectStoryView, { type ProjectViewData } from './ProjectStoryView';

// Admin edits reflect instantly — never cache.
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) {
    return { title: 'Project not found — Nur Islam' };
  }
  return {
    title: `${project.title} — Nur Islam`,
    description: project.tagline,
    openGraph: {
      title: `${project.title} — Nur Islam`,
      description: project.tagline,
      type: 'article',
      images: project.coverImage ? [{ url: project.coverImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.tagline,
      images: project.coverImage ? [project.coverImage] : undefined,
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const data: ProjectViewData = {
    slug: project.slug,
    title: project.title,
    category: project.category,
    tagline: project.tagline,
    coverImage: project.coverImage,
    date: project.date,
    techStack: project.techStack,
    chatPrompt: project.chatPrompt,
    problemMd: project.problemMd,
    solutionMd: project.solutionMd,
    architectureMd: project.architectureMd,
    impactMd: project.impactMd,
    images: project.images.map((i) => ({
      id: i.id,
      src: i.src,
      alt: i.alt,
      caption: i.caption,
      layout: i.layout,
    })),
    links: project.links.map((l) => ({
      id: l.id,
      label: l.label,
      url: l.url,
      iconName: l.iconName,
    })),
  };

  return <ProjectStoryView project={data} />;
}
